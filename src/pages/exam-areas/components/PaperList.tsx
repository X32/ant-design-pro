import React, { useState, useEffect } from 'react';
import { Card, Button, Pagination, Spin, Empty, Tag, App, Collapse } from 'antd';
import { PlayCircleOutlined, FileTextOutlined, TrophyOutlined, ClockCircleOutlined, DownOutlined, InboxOutlined, EditOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { getPublicExamPapers, getPublicExamPaperQuestions } from '@/services/ant-design-pro/api';
import type { ExamPaper } from '../types';
import './PaperList.less';

const { Panel } = Collapse;

interface ExamPaperQuestion {
  id: number;
  paper_id: number;
  exercise_id: number;
  question_score: number;
  sort: number;
  workflow_type: string;
  exercise?: {
    id: number;
    title: string;
    content: string;
    difficulty: string;
    workflow_type: string;
  };
}

interface ExamPaperWithQuestions extends ExamPaper {
  questions?: ExamPaperQuestion[];
  questionsLoading?: boolean;
}

interface PaperListProps {
  categoryId: number;
  examType: string;
  pageSize?: number;
}

/**
 * 试卷列表组件（练习模式）
 * 支持展开查看题目详情，点击单个题目进行练习
 */
const PaperList: React.FC<PaperListProps> = ({ categoryId, examType, pageSize = 20 }) => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;

  const [papers, setPapers] = useState<ExamPaperWithQuestions[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedPapers, setExpandedPapers] = useState<number[]>([]);

  // 加载试卷列表
  const loadPapers = async (page: number) => {
    try {
      setLoading(true);
      const response = await getPublicExamPapers({
        exam_category_id: categoryId,
        page,
        page_size: pageSize,
        only_active: true,
      });

      if (response.success && response.data) {
        setPapers(response.data.map((paper: ExamPaper) => ({
          ...paper,
          questions: [],
          questionsLoading: false,
        })));
        setTotal(response.total || 0);
      } else {
        message.error(response.message || '加载试卷列表失败');
      }
    } catch (error: any) {
      console.error('加载试卷失败:', error);
      message.error('加载试卷列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载试卷题目
  const loadPaperQuestions = async (paperId: number) => {
    try {
      setPapers((prev) =>
        prev.map((p) => (p.id === paperId ? { ...p, questionsLoading: true } : p)),
      );

      const response = await getPublicExamPaperQuestions(paperId);

      if (response.success && response.data) {
        // 按 sort 字段升序排列题目
        const sortedQuestions = [...response.data].sort((a, b) => {
          const sortA = a.sort ?? 0;
          const sortB = b.sort ?? 0;
          return sortA - sortB;
        });

        setPapers((prev) =>
          prev.map((p) =>
            p.id === paperId
              ? { ...p, questions: sortedQuestions, questionsLoading: false }
              : p,
          ),
        );
      }
    } catch (error: any) {
      console.error('加载题目失败:', error);
      message.error('加载题目列表失败');
      setPapers((prev) =>
        prev.map((p) => (p.id === paperId ? { ...p, questionsLoading: false } : p)),
      );
    }
  };

  // 处理试卷展开/折叠
  const handlePaperExpand = (paperId: number, isExpanded: boolean) => {
    if (isExpanded) {
      setExpandedPapers([...expandedPapers, paperId]);
      const paper = papers.find((p) => p.id === paperId);
      // 如果还没有加载题目，则加载
      if (paper && (!paper.questions || paper.questions.length === 0)) {
        loadPaperQuestions(paperId);
      }
    } else {
      setExpandedPapers(expandedPapers.filter((id) => id !== paperId));
    }
  };

  // 初始加载
  useEffect(() => {
    loadPapers(currentPage);
  }, [categoryId]);

  // 分页切换
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPapers(page);
    setExpandedPapers([]); // 清空展开状态
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 开始练习单个题目
  const handlePractice = (question: ExamPaperQuestion) => {
    if (!isLoggedIn) {
      message.warning('请先登录后开始练习');
      return;
    }

    const workflowType = question.exercise?.workflow_type || question.workflow_type;
    const exerciseId = question.exercise?.id;
    if (exerciseId) {
      history.push(`/spoken-practice?workflow_type=${workflowType}&exercise_id=${exerciseId}`);
    } else {
      message.warning('缺少练习题ID');
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // 渲染题目列表
  const renderQuestions = (questions: ExamPaperQuestion[]) => {
    if (!questions || questions.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          <InboxOutlined style={{ fontSize: 48, marginBottom: 16 }} />
          <div>暂无题目</div>
        </div>
      );
    }

    return (
      <div style={{ padding: '0 16px 16px' }}>
        {questions.map((question, index) => {
          const content = question.exercise?.content || '';
          const displayContent = content.length > 50 ? `${content.substring(0, 50)}...` : content;

          return (
            <div
              key={question.id}
              style={{
                background: '#fafafa',
                padding: '16px',
                marginBottom: '12px',
                borderRadius: '8px',
                border: '1px solid #f0f0f0',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#1890ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    marginRight: '12px',
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1, fontWeight: '500', fontSize: '14px' }}>
                  {question.exercise?.title || '无标题'}
                </div>
              </div>
              {displayContent && (
                <div style={{ marginBottom: '12px', color: '#666', fontSize: '13px', paddingLeft: '44px' }}>
                  {displayContent}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '44px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Tag>分值: {question.question_score}分</Tag>
                  <Tag>难度: {question.exercise?.difficulty || '-'}</Tag>
                  <Tag color="blue">{question.workflow_type}</Tag>
                </div>
                <Button
                  type="primary"
                  size="small"
                  onClick={() => handlePractice(question)}
                >
                  练习
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="paper-list-container" id="paper-list-section">
      <div className="paper-list-header">
        <h2 className="list-title">
          <EditOutlined /> {examType} 口语练习题库
        </h2>
        <span className="list-count">共 {total} 份试卷</span>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <Spin size="large" tip="加载中..." />
        </div>
      ) : papers.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="暂无试卷"
        />
      ) : (
        <>
          <Collapse
            accordion={false}
            expandIconPosition="end"
            onChange={(keys) => {
              const activeKeys = Array.isArray(keys) ? keys : [keys];
              papers.forEach((paper) => {
                const isExpanded = activeKeys.includes(paper.id.toString());
                const wasExpanded = expandedPapers.includes(paper.id);
                if (isExpanded !== wasExpanded) {
                  handlePaperExpand(paper.id, isExpanded);
                }
              });
            }}
          >
            {papers.map((paper) => (
              <Panel
                key={paper.id.toString()}
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileTextOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                        {paper.paper_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        <span style={{ marginRight: '16px' }}>
                          <Tag color="blue" style={{ margin: 0 }}>
                            {paper.paper_code}
                          </Tag>
                        </span>
                        <span style={{ marginRight: '16px' }}>
                          总分: {paper.total_score}分
                        </span>
                        <span>
                          <ClockCircleOutlined /> {formatDate(paper.create_time)}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              >
                {paper.questionsLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin tip="加载题目中..." />
                  </div>
                ) : (
                  renderQuestions(paper.questions || [])
                )}
              </Panel>
            ))}
          </Collapse>

          {/* 分页器 */}
          <div className="pagination-wrapper">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 份试卷`}
              responsive
              simple={window.innerWidth < 768}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PaperList;
