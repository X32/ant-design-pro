/**
 * 分类试题列表页面
 * 左侧显示考试分类，右侧显示分类下的试卷列表
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
  Tooltip,
  Modal,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  AppstoreOutlined,
  FileTextOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';
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

  // 详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailPaper, setDetailPaper] = useState<ExamPaper | null>(null);
  const [paperQuestions, setPaperQuestions] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

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
    fetchCategories();
    fetchPapers();
  };

  /**
   * 查看试卷详情
   */
  const handleViewDetail = async (paper: ExamPaper) => {
    setDetailPaper(paper);
    setDetailModalVisible(true);
    setDetailLoading(true);

    try {
      const response = await getPaperQuestions(paper.id);
      if (response.success) {
        // 按 sort 字段升序排列
        const sortedQuestions = (response.data || []).sort((a: any, b: any) => a.sort - b.sort);
        setPaperQuestions(sortedQuestions);
      } else {
        setPaperQuestions([]);
      }
    } catch (error: any) {
      console.error('获取试卷题目失败:', error);
      setPaperQuestions([]);
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 关闭详情弹窗
   */
  const handleDetailClose = () => {
    setDetailModalVisible(false);
    setDetailPaper(null);
    setPaperQuestions([]);
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
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Tooltip title="查看详情">
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          />
        </Tooltip>
      ),
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
              className="paper-table"
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
              scroll={{ x: 700 }}
            />
          ) : (
            <div className="empty-container">
              <AppstoreOutlined className="empty-icon" />
              <div className="empty-text">请从左侧选择一个分类</div>
            </div>
          )}
        </Card>
      </div>

      {/* 详情弹窗 */}
      <Modal
        title={
          <div className="detail-modal-title">
            <FileTextOutlined />
            <span>试卷详情</span>
          </div>
        }
        open={detailModalVisible}
        onCancel={handleDetailClose}
        footer={[
          <Button key="close" onClick={handleDetailClose}>
            关闭
          </Button>,
        ]}
        width={700}
        className="paper-detail-modal"
      >
        {detailPaper && (
          <div className="paper-detail">
            <div className="detail-section">
              <div className="section-title">基本信息</div>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">试卷编号：</span>
                  <span className="value">{detailPaper.paper_code}</span>
                </div>
                <div className="detail-item">
                  <span className="label">试卷名称：</span>
                  <span className="value">{detailPaper.paper_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">总分：</span>
                  <span className="value">{detailPaper.total_score}分</span>
                </div>
                <div className="detail-item">
                  <span className="label">考试分类：</span>
                  <span className="value">
                    {selectedCategory?.name || '-'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">状态：</span>
                  <Badge
                    status={detailPaper.is_active === 1 ? 'success' : 'default'}
                    text={detailPaper.is_active === 1 ? '启用' : '禁用'}
                  />
                </div>
                <div className="detail-item">
                  <span className="label">创建时间：</span>
                  <span className="value">
                    {detailPaper.create_time ? new Date(detailPaper.create_time).toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <div className="section-title">
                题目列表
                <Tag color="blue" style={{ marginLeft: 8 }}>{paperQuestions.length} 题</Tag>
              </div>
              {detailLoading ? (
                <div className="loading-container">加载中...</div>
              ) : paperQuestions.length > 0 ? (
                <div className="question-list">
                  {paperQuestions.map((q, index) => (
                    <div key={q.id} className="question-item">
                      <div className="question-index">{index + 1}</div>
                      <div className="question-content">
                        <div className="question-title">{q.exercise?.title || '未知题目'}</div>
                        <div className="question-meta">
                          <span>分值：{q.question_score}分</span>
                          {q.exercise?.difficulty && (
                            <Tag color={
                              q.exercise.difficulty <= 2 ? 'green' :
                              q.exercise.difficulty <= 3 ? 'blue' : 'orange'
                            } style={{ fontSize: 10 }}>
                              难度 {q.exercise.difficulty}
                            </Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-questions">暂无题目</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryExamList;
