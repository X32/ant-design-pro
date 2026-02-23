import {
  ArrowLeftOutlined,
  BugOutlined,
  BulbOutlined,
  CommentOutlined,
  QuestionCircleOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { App, Badge, Button, Card, Empty, Form, Input, Spin, Tag, message as antMessage } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import React, { useEffect, useState } from 'react';
import { getFeedbackDetail, getMyFeedbackList, submitFeedback } from '@/services/ant-design-pro/api';
import LoginModal from '@/components/LoginModal';
import './index.less';

const { TextArea: TextAreaArea } = Input;

// 反馈类型选项
const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug反馈', icon: <BugOutlined />, color: '#FF6B6B' },
  { value: 'suggestion', label: '功能建议', icon: <BulbOutlined />, color: '#4ECDC4' },
  { value: 'question', label: '使用问题', icon: <QuestionCircleOutlined />, color: '#FFD93D' },
  { value: 'other', label: '其他', icon: <CommentOutlined />, color: '#95A5A6' },
];

// 状态对应的标签颜色和文字
const STATUS_CONFIG = {
  pending: { color: 'default', text: '待处理' },
  processing: { color: 'processing', text: '处理中' },
  resolved: { color: 'success', text: '已解决' },
  closed: { color: 'default', text: '已关闭' },
};

const FeedbackPage: React.FC = () => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};
  const isLoggedIn = !!user;

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackList, setFeedbackList] = useState<API.FeedbackItem[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<API.FeedbackItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // 获取反馈列表
  const fetchFeedbackList = async () => {
    if (!isLoggedIn) return;

    try {
      setLoading(true);
      const response = await getMyFeedbackList();
      console.log('=== 反馈列表 API 响应 ===', response);

      if (response.success) {
        // 数据在 response.data.feedbacks 中
        const data = Array.isArray(response.data?.feedbacks) ? response.data.feedbacks : [];
        console.log('设置的 feedbackList:', data);
        console.log('feedbackList.length:', data.length);
        setFeedbackList(data);

        // 立即检查状态是否正确设置
        setTimeout(() => {
          console.log('setTimeout 后的 feedbackList 状态:', feedbackList);
        }, 100);
      } else {
        message.error(response.message || '获取反馈列表失败');
      }
    } catch (error) {
      console.error('获取反馈列表失败:', error);
      message.error('获取反馈列表失败，请重试');
      setFeedbackList([]); // 出错时设置为空数组
    } finally {
      setLoading(false);
    }
  };

  // 查看反馈详情
  const handleViewDetail = async (feedbackId: number) => {
    try {
      setDetailLoading(true);
      const response = await getFeedbackDetail(feedbackId);
      console.log('=== 反馈详情 API 响应 ===', response);
      console.log('response.data:', response.data);
      console.log('response.data.feedback:', response.data?.feedback);

      // 检查数据格式
      let detailData;
      if (response.data) {
        // 可能直接返回 data，也可能返回 data.feedback
        detailData = response.data.feedback || response.data;
        console.log('detailData:', detailData);
      }

      if (response.success && detailData) {
        console.log('设置 selectedFeedback:', detailData);
        setSelectedFeedback(detailData);
      } else {
        message.error(response.message || '获取反馈详情失败');
      }
    } catch (error) {
      console.error('获取反馈详情失败:', error);
      message.error('获取反馈详情失败，请重试');
    } finally {
      setDetailLoading(false);
    }
  };

  // 提交反馈
  const handleSubmit = async (values: any) => {
    if (!isLoggedIn) {
      setLoginModalVisible(true);
      return;
    }

    try {
      setSubmitting(true);
      const response = await submitFeedback({
        feedback_type: values.feedback_type,
        title: values.title,
        content: values.content,
        contact_info: values.contact_info,
      });

      if (response.success) {
        message.success('反馈提交成功，感谢您的建议！');
        form.resetFields();
        // 重新获取反馈列表
        fetchFeedbackList();
      } else {
        message.error(response.message || '提交反馈失败');
      }
    } catch (error) {
      console.error('提交反馈失败:', error);
      message.error('提交反馈失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 登录成功回调
  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
    message.success('登录成功');
    // 登录后获取反馈列表
    fetchFeedbackList();
  };

  // 返回首页
  const handleBack = () => {
    history.back();
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchFeedbackList();
    }
  }, [isLoggedIn]);

  // 如果未登录，显示提示页面
  if (!isLoggedIn) {
    return (
      <div className="feedback-container">
        <div className="feedback-header">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            size="large"
          >
            返回
          </Button>
        </div>

        <div className="feedback-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#FFD93D',
            padding: '60px',
            borderRadius: '30px 25px 35px 20px',
            border: '4px solid #000',
            boxShadow: '8px 8px 0px #000',
            transform: 'rotate(-1deg)'
          }}>
            <SendOutlined style={{ fontSize: 80, color: '#1A535C', marginBottom: 24 }} />
            <h2 style={{ fontSize: 28, color: '#1A535C', marginBottom: 16, fontWeight: 900, textShadow: '2px 2px 0px #FFF' }}>
              请先登录
            </h2>
            <p style={{ fontSize: 16, color: '#1A535C', marginBottom: 32, fontWeight: 700 }}>
              登录后可以提交反馈和查看历史反馈
            </p>
            <Button
              type="primary"
              size="large"
              onClick={() => setLoginModalVisible(true)}
              style={{
                background: '#FF6B6B',
                border: '3px solid #000',
                borderRadius: '25px 20px 30px 15px',
                boxShadow: '4px 4px 0px #000',
                fontWeight: 700,
                color: 'white',
                height: 'auto',
                padding: '0.8rem 2.5rem'
              }}
            >
              立即登录
            </Button>
          </div>
        </div>

        <LoginModal
          visible={loginModalVisible}
          onCancel={() => setLoginModalVisible(false)}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  return (
    <div className="feedback-container">
      {/* 顶部导航 */}
      <div className="feedback-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          size="large"
        >
          返回
        </Button>
        <h1 className="page-title">用户反馈</h1>
        <div style={{ width: 80 }}></div>
      </div>

      {/* 主内容 */}
      <div className="feedback-content">
        {/* 左侧：提交反馈表单 */}
        <div className="feedback-form-section">
          <Card
            className="feedback-form-card"
            title={
              <span>
                <SendOutlined style={{ marginRight: 8 }} />
                提交反馈
              </span>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="feedback_type"
                label="反馈类型"
                rules={[{ required: true, message: '请选择反馈类型' }]}
              >
                <div className="feedback-type-selector">
                  {FEEDBACK_TYPES.map((type) => (
                    <div
                      key={type.value}
                      className={`feedback-type-option ${form.getFieldValue('feedback_type') === type.value ? 'selected' : ''}`}
                      onClick={() => form.setFieldValue('feedback_type', type.value)}
                    >
                      <span className="feedback-type-icon" style={{ color: type.color }}>
                        {type.icon}
                      </span>
                      <span className="feedback-type-label">{type.label}</span>
                    </div>
                  ))}
                </div>
              </Form.Item>

              <Form.Item
                name="title"
                label="标题"
                rules={[
                  { required: true, message: '请输入标题' },
                  { max: 200, message: '标题最多200个字符' },
                ]}
              >
                <Input
                  placeholder="请简要描述您的问题或建议（最多200字符）"
                  size="large"
                  maxLength={200}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="详细描述"
                rules={[
                  { required: true, message: '请输入详细描述' },
                  { max: 5000, message: '描述最多5000个字符' },
                ]}
              >
                <TextAreaArea
                  placeholder="请详细描述您的问题或建议（最多5000字符）"
                  rows={6}
                  maxLength={5000}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="contact_info"
                label="联系方式（可选）"
              >
                <Input
                  placeholder="请留下您的联系方式，方便我们回复"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  size="large"
                  block
                  icon={<SendOutlined />}
                >
                  提交反馈
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        {/* 右侧：反馈历史列表 */}
        <div className="feedback-list-section">
          <Card
            className="feedback-list-card"
            title={
              <span>
                <CommentOutlined style={{ marginRight: 8 }} />
                我的反馈历史
              </span>
            }
            extra={
              <Button
                type="text"
                size="small"
                onClick={fetchFeedbackList}
                icon={<CommentOutlined />}
              >
                刷新
              </Button>
            }
          >
            <Spin spinning={loading}>
              {(() => {
                console.log('条件判断 feedbackList.length === 0:', feedbackList.length === 0);
                console.log('条件判断结果，走哪个分支:', feedbackList.length === 0 ? 'Empty分支' : 'List分支');
                return null;
              })()}
              {feedbackList.length === 0 ? (
                <Empty
                  description="暂无反馈记录"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              ) : (
                <div className="feedback-list">
                  {feedbackList.map((item) => (
                    <div
                      key={item.id}
                      className={`feedback-item ${selectedFeedback?.id === item.id ? 'selected' : ''}`}
                      onClick={() => handleViewDetail(item.id)}
                    >
                      <div className="feedback-item-header">
                        <Badge
                          color={FEEDBACK_TYPES.find(t => t.value === item.feedback_type)?.color}
                          text={FEEDBACK_TYPES.find(t => t.value === item.feedback_type)?.label}
                        />
                        <Tag {...STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]} style={{ marginLeft: 8 }}>
                          {STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]?.text || '未知'}
                        </Tag>
                      </div>
                      <div className="feedback-item-title">{item.title}</div>
                      <div className="feedback-item-time">
                        {new Date(item.created_at).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Spin>
          </Card>

          {/* 反馈详情 */}
          {selectedFeedback ? (
            <Card
              className="feedback-detail-card"
              title="反馈详情"
              extra={
                <Button
                  type="text"
                  size="small"
                  onClick={() => setSelectedFeedback(null)}
                >
                  关闭
                </Button>
              }
              style={{ marginTop: 16 }}
            >
              <Spin spinning={detailLoading}>
                {/* 调试文本 */}
                <div style={{
                  background: 'red',
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  border: '3px solid #000',
                  borderRadius: '8px'
                }}>
                  ↓ 这是反馈详情卡片 ↓
                </div>

                {/* 渲染时调试日志 */}
                {(() => {
                  console.log('=== 渲染详情卡片 ===');
                  console.log('selectedFeedback:', selectedFeedback);
                  console.log('selectedFeedback?.title:', selectedFeedback?.title);
                  console.log('selectedFeedback 类型:', typeof selectedFeedback);
                  return null;
                })()}

                <div className="feedback-detail-content">
                  <div className="feedback-detail-row">
                    <span className="feedback-detail-label">类型：</span>
                    <Badge
                      color={FEEDBACK_TYPES.find(t => t.value === selectedFeedback.feedback_type)?.color}
                      text={FEEDBACK_TYPES.find(t => t.value === selectedFeedback.feedback_type)?.label}
                    />
                  </div>
                  <div className="feedback-detail-row">
                    <span className="feedback-detail-label">状态：</span>
                    <Tag {...STATUS_CONFIG[selectedFeedback.status as keyof typeof STATUS_CONFIG]}>
                      {STATUS_CONFIG[selectedFeedback.status as keyof typeof STATUS_CONFIG]?.text || '未知'}
                    </Tag>
                  </div>
                  <div className="feedback-detail-row">
                    <span className="feedback-detail-label">标题：</span>
                    <span className="feedback-detail-value">{selectedFeedback.title}</span>
                  </div>
                  <div className="feedback-detail-row">
                    <span className="feedback-detail-label">描述：</span>
                    <span className="feedback-detail-value">{selectedFeedback.content}</span>
                  </div>
                  {selectedFeedback.contact_info && (
                    <div className="feedback-detail-row">
                      <span className="feedback-detail-label">联系方式：</span>
                      <span className="feedback-detail-value">{selectedFeedback.contact_info}</span>
                    </div>
                  )}
                  {selectedFeedback.admin_reply && (
                    <div className="feedback-detail-row">
                      <span className="feedback-detail-label">管理员回复：</span>
                      <span className="feedback-detail-value admin-reply">
                        {selectedFeedback.admin_reply}
                      </span>
                    </div>
                  )}
                  <div className="feedback-detail-row">
                    <span className="feedback-detail-label">提交时间：</span>
                    <span className="feedback-detail-value">
                      {new Date(selectedFeedback.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                </div>
              </Spin>
            </Card>
          ) : null}
        </div>
      </div>

      {/* 登录弹框 */}
      <LoginModal
        visible={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default FeedbackPage;
