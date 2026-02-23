// @ts-ignore
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import FeedbackPage from './index';

// Mock 依赖
jest.mock('@umijs/max', () => ({
  history: {
    back: jest.fn(),
    push: jest.fn(),
  },
  useModel: jest.fn(() => ({
    initialState: {
      currentUser: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
      },
    },
  })),
}));

jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    App: {
      useApp: jest.fn(() => ({
        message: {
          success: jest.fn(),
          error: jest.fn(),
          warning: jest.fn(),
          info: jest.fn(),
        },
      })),
    },
  };
});

jest.mock('@/services/ant-design-pro/api', () => ({
  submitFeedback: jest.fn(),
  getMyFeedbackList: jest.fn(),
  getFeedbackDetail: jest.fn(),
}));

jest.mock('@/components/LoginModal', () => {
  return function LoginModal({ visible, onCancel, onSuccess }: any) {
    if (!visible) return null;
    return (
      <div data-testid="login-modal">
        <button onClick={() => onCancel()}>Cancel</button>
        <button onClick={() => onSuccess?.()}>Login</button>
      </div>
    );
  };
});

import { submitFeedback, getMyFeedbackList, getFeedbackDetail } from '@/services/ant-design-pro/api';
import { useModel } from '@umijs/max';
import { App } from 'antd';
import { history } from '@umijs/max';

const mockSubmitFeedback = submitFeedback as jest.MockedFunction<typeof submitFeedback>;
const mockGetMyFeedbackList = getMyFeedbackList as jest.MockedFunction<typeof getMyFeedbackList>;
const mockGetFeedbackDetail = getFeedbackDetail as jest.MockedFunction<typeof getFeedbackDetail>;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('FeedbackPage', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
    username: 'testuser',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('fake-token');
    (useModel as jest.Mock).mockReturnValue({
      initialState: {
        currentUser: mockUser,
      },
    });
    (history.back as jest.Mock).mockClear();
  });

  describe('未登录状态', () => {
    beforeEach(() => {
      (useModel as jest.Mock).mockReturnValue({
        initialState: {
          currentUser: null,
        },
      });
    });

    it('应该显示登录提示页面', () => {
      render(<FeedbackPage />);

      expect(screen.getByText('请先登录')).toBeInTheDocument();
      expect(screen.getByText('登录后可以提交反馈和查看历史反馈')).toBeInTheDocument();
      expect(screen.getByText('立即登录')).toBeInTheDocument();
      expect(screen.getByText('返回')).toBeInTheDocument();
    });

    it('点击返回按钮应该调用 history.back', () => {
      render(<FeedbackPage />);

      const backButton = screen.getByText('返回');
      fireEvent.click(backButton);

      expect(history.back).toHaveBeenCalled();
    });

    it('点击立即登录应该显示登录弹窗', () => {
      render(<FeedbackPage />);

      const loginButton = screen.getByText('立即登录');
      fireEvent.click(loginButton);

      expect(screen.getByTestId('login-modal')).toBeInTheDocument();
    });
  });

  describe('已登录状态 - 表单提交', () => {
    it('应该显示反馈表单和反馈历史列表', () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      expect(screen.getByText('提交反馈')).toBeInTheDocument();
      expect(screen.getByText('我的反馈历史')).toBeInTheDocument();
      expect(screen.getByText('反馈类型')).toBeInTheDocument();
      expect(screen.getByText('标题')).toBeInTheDocument();
      expect(screen.getByText('详细描述')).toBeInTheDocument();
      expect(screen.getByText('联系方式（可选）')).toBeInTheDocument();
    });

    it('应该显示四种反馈类型选项', () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      expect(screen.getByText('Bug反馈')).toBeInTheDocument();
      expect(screen.getByText('功能建议')).toBeInTheDocument();
      expect(screen.getByText('使用问题')).toBeInTheDocument();
      expect(screen.getByText('其他')).toBeInTheDocument();
    });

    it('点击反馈类型应该选中该类型', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      const bugType = screen.getByText('Bug反馈').closest('.feedback-type-option');
      fireEvent.click(bugType!);

      await waitFor(() => {
        expect(bugType).toHaveClass('selected');
      });
    });

    it('提交表单时如果没有选择类型应该显示错误', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      const submitButton = screen.getByText('提交反馈');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('请选择反馈类型')).toBeInTheDocument();
      });
    });

    it('提交表单时标题为空应该显示错误', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      // 选择类型
      const bugType = screen.getByText('Bug反馈').closest('.feedback-type-option');
      fireEvent.click(bugType!);

      // 直接提交（不输入标题和内容）
      const submitButton = screen.getByText('提交反馈');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('请输入标题')).toBeInTheDocument();
      });
    });

    it('提交表单时内容为空应该显示错误', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      // 选择类型
      const bugType = screen.getByText('Bug反馈').closest('.feedback-type-option');
      fireEvent.click(bugType!);

      // 输入标题
      const titleInput = screen.getByPlaceholderText(/请简要描述/);
      fireEvent.change(titleInput, { target: { value: '测试标题' } });

      // 直接提交（不输入内容）
      const submitButton = screen.getByText('提交反馈');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('请输入详细描述')).toBeInTheDocument();
      });
    });

    it('成功提交反馈后应该清空表单并显示成功消息', async () => {
      const { message } = App.useApp();
      mockGetMyFeedbackList
        .mockResolvedValueOnce({
          success: true,
          data: [],
        })
        .mockResolvedValueOnce({
          success: true,
          data: [
            {
              id: 1,
              feedback_type: 'bug',
              title: '测试反馈',
              content: '测试内容',
              status: 'pending',
              created_at: new Date().toISOString(),
            },
          ],
        });

      mockSubmitFeedback.mockResolvedValue({
        success: true,
        message: '反馈提交成功',
        data: {
          id: 1,
          user_id: 1,
          feedback_type: 'bug',
          title: '测试反馈',
          content: '测试内容',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      });

      render(<FeedbackPage />);

      // 选择类型
      const bugType = screen.getByText('Bug反馈').closest('.feedback-type-option');
      fireEvent.click(bugType!);

      // 输入标题
      const titleInput = screen.getByPlaceholderText(/请简要描述/);
      fireEvent.change(titleInput, { target: { value: '测试反馈' } });

      // 输入内容
      const contentInput = screen.getByPlaceholderText(/请详细描述/);
      fireEvent.change(contentInput, { target: { value: '测试内容' } });

      // 提交
      const submitButton = screen.getByText('提交反馈');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitFeedback).toHaveBeenCalledWith({
          feedback_type: 'bug',
          title: '测试反馈',
          content: '测试内容',
          contact_info: undefined,
        });
        expect(message.success).toHaveBeenCalledWith('反馈提交成功，感谢您的建议！');
      });
    });

    it('提交失败时应该显示错误消息', async () => {
      const { message } = App.useApp();
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      mockSubmitFeedback.mockResolvedValue({
        success: false,
        message: '网络错误',
      });

      render(<FeedbackPage />);

      // 填写表单
      const bugType = screen.getByText('Bug反馈').closest('.feedback-type-option');
      fireEvent.click(bugType!);

      const titleInput = screen.getByPlaceholderText(/请简要描述/);
      fireEvent.change(titleInput, { target: { value: '测试反馈' } });

      const contentInput = screen.getByPlaceholderText(/请详细描述/);
      fireEvent.change(contentInput, { target: { value: '测试内容' } });

      const submitButton = screen.getByText('提交反馈');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(message.error).toHaveBeenCalledWith('网络错误');
      });
    });

    it('标题长度超过200字符应该显示错误', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      const bugType = screen.getByText('Bug反馈').closest('.feedback-type-option');
      fireEvent.click(bugType!);

      const titleInput = screen.getByPlaceholderText(/请简要描述/);
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(201) } });

      await waitFor(() => {
        expect(screen.getByText(/标题最多200个字符/)).toBeInTheDocument();
      });
    });

    it('内容长度超过5000字符应该显示错误', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      const bugType = screen.getByText('Bug反馈').closest('.feedback-type-option');
      fireEvent.click(bugType!);

      const titleInput = screen.getByPlaceholderText(/请简要描述/);
      fireEvent.change(titleInput, { target: { value: '测试标题' } });

      const contentInput = screen.getByPlaceholderText(/请详细描述/);
      fireEvent.change(contentInput, { target: { value: 'a'.repeat(5001) } });

      await waitFor(() => {
        expect(screen.getByText(/描述最多5000个字符/)).toBeInTheDocument();
      });
    });
  });

  describe('已登录状态 - 反馈列表', () => {
    it('应该显示空状态当没有反馈记录时', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      await waitFor(() => {
        expect(screen.getByText('暂无反馈记录')).toBeInTheDocument();
      });
    });

    it('应该显示反馈列表', async () => {
      const mockFeedbacks = [
        {
          id: 1,
          feedback_type: 'bug',
          title: 'Bug反馈',
          content: '这是一个bug',
          status: 'pending',
          created_at: new Date('2024-01-01T10:00:00').toISOString(),
        },
        {
          id: 2,
          feedback_type: 'suggestion',
          title: '功能建议',
          content: '这是一个建议',
          status: 'resolved',
          created_at: new Date('2024-01-02T10:00:00').toISOString(),
        },
      ];

      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: mockFeedbacks,
      });

      render(<FeedbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Bug反馈')).toBeInTheDocument();
        expect(screen.getByText('功能建议')).toBeInTheDocument();
        expect(screen.getByText('Bug反馈')).toBeInTheDocument();
        expect(screen.getByText('功能建议')).toBeInTheDocument();
      });
    });

    it('点击反馈项应该显示详情', async () => {
      const mockFeedbacks = [
        {
          id: 1,
          feedback_type: 'bug',
          title: 'Bug反馈',
          content: '这是一个bug',
          status: 'pending',
          created_at: new Date('2024-01-01T10:00:00').toISOString(),
        },
      ];

      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: mockFeedbacks,
      });

      mockGetFeedbackDetail.mockResolvedValue({
        success: true,
        data: {
          ...mockFeedbacks[0],
          contact_info: 'test@example.com',
        },
      });

      render(<FeedbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Bug反馈')).toBeInTheDocument();
      });

      // 点击反馈项
      const feedbackItem = screen.getByText('Bug反馈').closest('.feedback-item');
      fireEvent.click(feedbackItem!);

      await waitFor(() => {
        expect(mockGetFeedbackDetail).toHaveBeenCalledWith(1);
      });
    });

    it('点击刷新按钮应该重新获取列表', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      await waitFor(() => {
        expect(screen.getByText('刷新')).toBeInTheDocument();
      });

      const refreshButton = screen.getByText('刷新');
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(mockGetMyFeedbackList).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('反馈详情', () => {
    it('应该显示反馈详情卡片', async () => {
      const mockFeedbacks = [
        {
          id: 1,
          feedback_type: 'bug',
          title: 'Bug反馈',
          content: '这是一个bug',
          status: 'pending',
          created_at: new Date('2024-01-01T10:00:00').toISOString(),
        },
      ];

      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: mockFeedbacks,
      });

      mockGetFeedbackDetail.mockResolvedValue({
        success: true,
        data: {
          ...mockFeedbacks[0],
          contact_info: 'test@example.com',
          admin_reply: '管理员回复',
        },
      });

      render(<FeedbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Bug反馈')).toBeInTheDocument();
      });

      const feedbackItem = screen.getByText('Bug反馈').closest('.feedback-item');
      fireEvent.click(feedbackItem!);

      await waitFor(() => {
        expect(screen.getByText('反馈详情')).toBeInTheDocument();
        expect(screen.getByText('类型：')).toBeInTheDocument();
        expect(screen.getByText('状态：')).toBeInTheDocument();
        expect(screen.getByText('标题：')).toBeInTheDocument();
        expect(screen.getByText('描述：')).toBeInTheDocument();
        expect(screen.getByText('联系方式：')).toBeInTheDocument();
        expect(screen.getByText('管理员回复：')).toBeInTheDocument();
        expect(screen.getByText('提交时间：')).toBeInTheDocument();
      });
    });

    it('点击关闭按钮应该隐藏详情', async () => {
      const mockFeedbacks = [
        {
          id: 1,
          feedback_type: 'bug',
          title: 'Bug反馈',
          content: '这是一个bug',
          status: 'pending',
          created_at: new Date('2024-01-01T10:00:00').toISOString(),
        },
      ];

      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: mockFeedbacks,
      });

      mockGetFeedbackDetail.mockResolvedValue({
        success: true,
        data: mockFeedbacks[0],
      });

      render(<FeedbackPage />);

      await waitFor(() => {
        expect(screen.getByText('Bug反馈')).toBeInTheDocument();
      });

      const feedbackItem = screen.getByText('Bug反馈').closest('.feedback-item');
      fireEvent.click(feedbackItem!);

      await waitFor(() => {
        expect(screen.getByText('反馈详情')).toBeInTheDocument();
      });

      const closeButton = screen.getByText('关闭');
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText('反馈详情')).not.toBeInTheDocument();
      });
    });
  });

  describe('页面导航', () => {
    it('点击返回按钮应该调用 history.back', async () => {
      mockGetMyFeedbackList.mockResolvedValue({
        success: true,
        data: [],
      });

      render(<FeedbackPage />);

      await waitFor(() => {
        expect(screen.getByText('返回')).toBeInTheDocument();
      });

      const backButton = screen.getByText('返回');
      fireEvent.click(backButton);

      expect(history.back).toHaveBeenCalled();
    });
  });

  describe('状态标签', () => {
    const statusLabels: Record<string, string> = {
      pending: '待处理',
      processing: '处理中',
      resolved: '已解决',
      closed: '已关闭',
    };

    Object.entries(statusLabels).forEach(([status, label]) => {
      it(`应该显示正确的状态标签: ${label}`, async () => {
        const mockFeedbacks = [
          {
            id: 1,
            feedback_type: 'bug',
            title: '测试反馈',
            content: '测试内容',
            status,
            created_at: new Date().toISOString(),
          },
        ];

        mockGetMyFeedbackList.mockResolvedValue({
          success: true,
          data: mockFeedbacks,
        });

        render(<FeedbackPage />);

        await waitFor(() => {
          expect(screen.getByText(label)).toBeInTheDocument();
        });
      });
    });
  });
});
