/**
 * 分类试题列表页面
 * 左侧显示考试分类，右侧显示分类下的试卷列表（可展开/折叠查看试题）
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  List,
  Tag,
  message,
  Spin,
  Empty,
  Badge,
  Button,
  Modal,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  AppstoreOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DownOutlined,
  RightOutlined,
  EyeOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import { history } from '@umijs/max';
import {
  ExamCategory,
  ExamPaper,
  getExamCategories,
  getExamPapersByCategory,
  getPaperQuestions,
} from '@/services/ant-design-pro/api';
import './index.less';

/**
 * 分类试题列表页面组件
 */
const CategoryExamList: React.FC = () => {
  // 分类数据
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(null);

  // 试卷数据
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [paperLoading, setPaperLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // 展开行状态
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  // 试卷题目缓存 { paperId: questions[] }
  const [questionsMap, setQuestionsMap] = useState<Record<number, any[]>>({});
  // 正在加载题目的试卷ID
  const [loadingPaperIds, setLoadingPaperIds] = useState<number[]>([]);

  // 试题详情弹窗状态
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  /**
   * 获取分类列表
   */
  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    try {
      const response = await getExamCategories({
        only_active: true,
        page: 1,
        page_size: 100,
      });

      if (response && response.success) {
        // 按 sort 字段降序排列
        const sortedCategories = (response.data || []).sort((a, b) => b.sort - a.sort);
        setCategories(sortedCategories);
        
        // 默认选中第一个分类
        if (sortedCategories.length > 0 && !selectedCategory) {
          setSelectedCategory(sortedCategories[0]);
        }
      } else {
        setCategories([]);
      }
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
      message.error(error?.message || '获取分类列表失败');
      setCategories([]);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  /**
   * 获取试卷列表
   */
  const fetchPapers = useCallback(async () => {
    if (!selectedCategory) {
      setPapers([]);
      setTotal(0);
      return;
    }

    setPaperLoading(true);
    try {
      const response = await getExamPapersByCategory({
        exam_category_id: selectedCategory.id,
        only_active: true,
        page: pagination.current,
        page_size: pagination.pageSize,
      });

      if (response && response.success) {
        setPapers(response.data || []);
        setTotal(response.total || 0);
      } else {
        setPapers([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取试卷列表失败:', error);
      message.error(error?.message || '获取试卷列表失败');
      setPapers([]);
      setTotal(0);
    } finally {
      setPaperLoading(false);
    }
  }, [selectedCategory, pagination]);

  // 初始化加载分类
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // 分类变化时加载试卷
  useEffect(() => {
    if (selectedCategory) {
      setPagination({ current: 1, pageSize: 10 });
    }
  }, [selectedCategory]);

  // 加载试卷列表
  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  /**
   * 处理分类选择
   */
  const handleCategorySelect = (category: ExamCategory) => {
    setSelectedCategory(category);
  };

  /**
   * 处理分页变化
   */
  const handleTableChange = (paginationConfig: TablePaginationConfig) => {
    setPagination({
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    });
  };

  /**
   * 刷新数据
   */
  const handleRefresh = () => {
    setExpandedRowKeys([]);
    setQuestionsMap({});
    fetchCategories();
    fetchPapers();
  };

  /**
   * 加载试卷题目
   */
  const loadPaperQuestions = async (paperId: number) => {
    // 已经加载过则跳过
    if (questionsMap[paperId]) return;

    setLoadingPaperIds(prev => [...prev, paperId]);
    try {
      const response = await getPaperQuestions(paperId);
      if (response.success) {
        // 按 sort 字段升序排列
        const sortedQuestions = (response.data || []).sort((a: any, b: any) => a.sort - b.sort);
        setQuestionsMap(prev => ({ ...prev, [paperId]: sortedQuestions }));
      } else {
        setQuestionsMap(prev => ({ ...prev, [paperId]: [] }));
      }
    } catch (error: any) {
      console.error('获取试卷题目失败:', error);
      setQuestionsMap(prev => ({ ...prev, [paperId]: [] }));
    } finally {
      setLoadingPaperIds(prev => prev.filter(id => id !== paperId));
    }
  };

  /**
   * 处理展开/折叠
   */
  const handleExpand = (expanded: boolean, record: ExamPaper) => {
    if (expanded) {
      setExpandedRowKeys([record.id]);
      loadPaperQuestions(record.id);
    } else {
      setExpandedRowKeys([]);
    }
  };

  /**
   * 查看试题详情
   */
  const handleViewQuestion = (question: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedQuestion(question);
    setQuestionModalVisible(true);
  };

  /**
   * 关闭试题详情弹窗
   */
  const handleCloseQuestionModal = () => {
    setQuestionModalVisible(false);
    setSelectedQuestion(null);
  };

  /**
   * 跳转到口语练习页面
   */
  const handlePractice = (question: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const workflowType = question.exercise?.workflow_type || 'fce_part1';
    const exerciseId = question.exercise?.id;
    if (exerciseId) {
      history.push(`/spoken-practice?workflow_type=${workflowType}&exercise_id=${exerciseId}`);
    } else {
      message.warning('缺少练习题ID');
    }
  };

  /**
   * 渲染展开行内容
   */
  const renderExpandedRow = (record: ExamPaper) => {
    const questions = questionsMap[record.id];
    const isLoading = loadingPaperIds.includes(record.id);

    if (isLoading) {
      return (
        <div className="expanded-loading">
          <Spin size="small" />
          <span>加载中...</span>
        </div>
      );
    }

    if (!questions || questions.length === 0) {
      return <div className="expanded-empty">暂无题目</div>;
    }

    return (
      <div className="expanded-questions">
        <div className="questions-header">
          <Tag color="blue">共 {questions.length} 题</Tag>
        </div>
        <div className="questions-list">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="question-item clickable"
              onClick={(e) => handleViewQuestion(q, e)}
            >
              <div className="question-index">{index + 1}</div>
              <div className="question-content">
                <div className="question-title">{q.exercise?.title || '未知题目'}</div>
                <div className="question-meta">
                  <span>分值：{q.question_score}分</span>
                  {q.exercise?.difficulty && (
                    <Tag
                      color={
                        q.exercise.difficulty <= 2 ? 'green' :
                        q.exercise.difficulty <= 3 ? 'blue' : 'orange'
                      }
                      style={{ fontSize: 10 }}
                    >
                      难度 {q.exercise.difficulty}
                      type {q.exercise.workflow_type}
                    </Tag>
                  )}
                  {q.exercise?.workflow_type && (
                    <Tag color="purple" style={{ fontSize: 10 }}>
                      {q.exercise.workflow_type}
                    </Tag>
                  )}
                </div>
              </div>
              <div className="question-action">
                <Button
                  type="link"
                  size="small"
                  icon={<PlayCircleOutlined />}
                  onClick={(e) => handlePractice(q, e)}
                  style={{ marginRight: 8 }}
                >
                  练习
                </Button>
                <EyeOutlined onClick={(e) => handleViewQuestion(q, e)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<ExamPaper> = [
    {
      title: '试卷编号',
      dataIndex: 'paper_code',
      key: 'paper_code',
      width: 150,
      render: (text: string) => <span className="paper-code">{text}</span>,
    },
    {
      title: '试卷名称',
      dataIndex: 'paper_name',
      key: 'paper_name',
      ellipsis: true,
    },
    {
      title: '总分',
      dataIndex: 'total_score',
      key: 'total_score',
      width: 80,
      align: 'center',
      render: (score: number) => <span className="score">{score}分</span>,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      align: 'center',
      render: (isActive: number) => (
        <Badge
          status={isActive === 1 ? 'success' : 'default'}
          text={isActive === 1 ? '启用' : '禁用'}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 160,
      render: (time: string) => time ? new Date(time).toLocaleString() : '-',
    },
  ];

  return (
    <div className="category-exam-list-page">
      {/* 左侧分类面板 */}
      <div className="category-panel">
        <Card
          title={
            <div className="panel-title">
              <AppstoreOutlined />
              <span>考试分类</span>
            </div>
          }
          extra={
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchCategories}
            />
          }
          className="category-card"
        >
          {categoryLoading ? (
            <div className="loading-container">
              <Spin size="small" />
            </div>
          ) : categories.length > 0 ? (
            <List
              className="category-list"
              dataSource={categories}
              renderItem={(category) => (
                <List.Item
                  className={`category-item ${selectedCategory?.id === category.id ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-info">
                    <div className="category-name">{category.name}</div>
                    {category.description && (
                      <div className="category-desc">{category.description}</div>
                    )}
                  </div>
                  <Tag color="blue">{category.sort}</Tag>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="暂无分类" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          )}
        </Card>
      </div>

      {/* 右侧试卷列表面板 */}
      <div className="paper-panel">
        <Card
          title={
            <div className="panel-title">
              <FileTextOutlined />
              <span>试卷列表</span>
              {selectedCategory && (
                <Tag color="green" style={{ marginLeft: 8 }}>
                  {selectedCategory.name}
                </Tag>
              )}
              {total > 0 && (
                <Tag color="blue" style={{ marginLeft: 4 }}>
                  {total} 份试卷
                </Tag>
              )}
            </div>
          }
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              刷新
            </Button>
          }
          className="paper-card"
        >
          {selectedCategory ? (
            <Table
              className="paper-table expandable-table"
              columns={columns}
              dataSource={papers}
              rowKey="id"
              loading={paperLoading}
              pagination={{
                ...pagination,
                total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (t) => `共 ${t} 份试卷`,
              }}
              onChange={handleTableChange}
              scroll={{ x: 600 }}
              expandable={{
                expandedRowKeys,
                onExpand: handleExpand,
                expandedRowRender: renderExpandedRow,
                expandIcon: ({ expanded, onExpand, record }) => (
                  <span
                    className="expand-icon"
                    onClick={(e) => onExpand(record, e)}
                  >
                    {expanded ? <DownOutlined /> : <RightOutlined />}
                  </span>
                ),
              }}
              onRow={(record) => ({
                onClick: () => handleExpand(!expandedRowKeys.includes(record.id), record),
                style: { cursor: 'pointer' },
              })}
            />
          ) : (
            <div className="empty-container">
              <AppstoreOutlined className="empty-icon" />
              <div className="empty-text">请从左侧选择一个分类</div>
            </div>
          )}
        </Card>
      </div>

      {/* 试题详情弹窗 */}
      <Modal
        title={
          <div className="question-modal-title">
            <FileTextOutlined />
            <span>试题详情</span>
          </div>
        }
        open={questionModalVisible}
        onCancel={handleCloseQuestionModal}
        footer={[
          <Button key="close" onClick={handleCloseQuestionModal}>
            关闭
          </Button>,
        ]}
        width={700}
        className="question-detail-modal"
      >
        {selectedQuestion && (
          <div className="question-detail">
            <div className="detail-header">
              <Tag color="blue">分值：{selectedQuestion.question_score}分</Tag>
              {selectedQuestion.exercise?.difficulty && (
                <Tag
                  color={
                    selectedQuestion.exercise.difficulty <= 2 ? 'green' :
                    selectedQuestion.exercise.difficulty <= 3 ? 'blue' : 'orange'
                  }
                >
                  难度 {selectedQuestion.exercise.difficulty}
                </Tag>
              )}
              {selectedQuestion.exercise?.category_name && (
                <Tag color="purple">{selectedQuestion.exercise.category_name}</Tag>
              )}
            </div>

            <div className="detail-section">
              <div className="section-label">题目标题</div>
              <div className="section-content title-content">
                {selectedQuestion.exercise?.title || '未知题目'}
              </div>
            </div>

            {selectedQuestion.exercise?.image_url && (
              <div className="detail-section">
                <div className="section-label">题目图片</div>
                <div className="section-content image-content">
                  <img
                    src={selectedQuestion.exercise.image_url}
                    alt="题目图片"
                    className="question-image"
                  />
                </div>
              </div>
            )}

            {selectedQuestion.exercise?.content && (
              <div className="detail-section">
                <div className="section-label">题目内容</div>
                <div className="section-content">
                  <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.exercise.content }}
                  />
                </div>
              </div>
            )}

            {selectedQuestion.exercise?.answer && (
              <div className="detail-section">
                <div className="section-label">参考答案</div>
                <div className="section-content answer-content">
                  <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.exercise.answer }}
                  />
                </div>
              </div>
            )}

            {selectedQuestion.exercise?.analysis && (
              <div className="detail-section">
                <div className="section-label">解析说明</div>
                <div className="section-content">
                  <div
                    className="rich-content"
                    dangerouslySetInnerHTML={{ __html: selectedQuestion.exercise.analysis }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryExamList;
