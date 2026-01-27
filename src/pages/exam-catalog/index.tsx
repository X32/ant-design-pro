import { ArrowLeftOutlined, DownOutlined, FileTextOutlined, FolderOpenOutlined, InboxOutlined, TrophyOutlined } from '@ant-design/icons';
import { App, Button, Card, Spin, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useModel } from '@umijs/max';
import UserAvatar from '@/components/UserAvatar';
import LoginModal from '@/components/LoginModal';
import {
  getPublicExamCategories,
  getPublicExamPaperQuestions,
  getPublicExamPapers,
} from '@/services/ant-design-pro/api';
import type {
  ExamCategory,
  ExamCategoryWithPapers,
  ExamPaper,
  ExamPaperQuestion,
  ExamPaperWithQuestions,
} from './types';
import './index.less';

const ExamCatalog: React.FC = () => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;

  const [categories, setCategories] = useState<ExamCategoryWithPapers[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // 跳转到我的练习记录页面
  const handleMyPracticeRecords = () => {
    if (!isLoggedIn) {
      message.warning('请先登录后查看练习记录');
      setLoginModalVisible(true);
      return;
    }
    history.push('/messages/userpractice');
  };

  // 返回首页
  const handleBackToHome = () => {
    history.back();
  };

  // 登录
  const handleLogin = () => {
    setLoginModalVisible(true);
  };

  // 登录成功回调
  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
    message.success('登录成功');
  };

  // 加载考试分类
  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getPublicExamCategories();
      if (response.success && response.data) {
        const categoriesData: ExamCategoryWithPapers[] = response.data.map((cat: ExamCategory) => ({
          ...cat,
          papers: [],
          loading: false,
          expanded: false,
        }));
        setCategories(categoriesData);
      }
    } catch (error) {
      message.error('加载考试分类失败');
      console.error('加载分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换分类展开/折叠
  const toggleCategory = async (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    // 如果已经展开，则折叠
    if (category.expanded) {
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, expanded: false } : c)),
      );
      return;
    }

    // 如果是第一次展开，需要加载试卷数据
    if (!category.papers || category.papers.length === 0) {
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, loading: true, expanded: true } : c)),
      );

      try {
        const response = await getPublicExamPapers({
          exam_category_id: categoryId,
          page: 1,
          page_size: 100,
        });

        if (response.success && response.data) {
          const papersData: ExamPaperWithQuestions[] = response.data.map((paper: ExamPaper) => ({
            ...paper,
            questions: [],
            loading: false,
            expanded: false,
          }));

          setCategories((prev) =>
            prev.map((c) =>
              c.id === categoryId
                ? { ...c, papers: papersData, loading: false, expanded: true }
                : c,
            ),
          );
        }
      } catch (error) {
        message.error('加载试卷列表失败');
        console.error('加载试卷失败:', error);
        setCategories((prev) =>
          prev.map((c) => (c.id === categoryId ? { ...c, loading: false, expanded: false } : c)),
        );
      }
    } else {
      // 直接展开
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, expanded: true } : c)),
      );
    }
  };

  // 切换试卷展开/折叠
  const togglePaper = async (categoryId: number, paperId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category || !category.papers) return;

    const paper = category.papers.find((p) => p.id === paperId) as ExamPaperWithQuestions | undefined;
    if (!paper) return;

    // 如果已经展开，则折叠
    if (paper.expanded) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                papers: c.papers?.map((p) => (p.id === paperId ? { ...p, expanded: false } : p)),
              }
            : c,
        ),
      );
      return;
    }

    // 如果是第一次展开，需要加载题目数据
    if (!paper.questions || paper.questions.length === 0) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                papers: c.papers?.map((p) =>
                  p.id === paperId ? { ...p, loading: true, expanded: true } : p,
                ),
              }
            : c,
        ),
      );

      try {
        const response = await getPublicExamPaperQuestions(paperId);

        if (response.success && response.data) {
          // 按 sort 字段升序排列题目
          const sortedQuestions = [...response.data].sort((a, b) => {
            const sortA = a.sort ?? 0;
            const sortB = b.sort ?? 0;
            return sortA - sortB;
          });

          setCategories((prev) =>
            prev.map((c) =>
              c.id === categoryId
                ? {
                    ...c,
                    papers: c.papers?.map((p) =>
                      p.id === paperId
                        ? { ...p, questions: sortedQuestions, loading: false, expanded: true }
                        : p,
                    ),
                  }
                : c,
            ),
          );
        }
      } catch (error) {
        message.error('加载题目列表失败');
        console.error('加载题目失败:', error);
        setCategories((prev) =>
          prev.map((c) =>
            c.id === categoryId
              ? {
                  ...c,
                  papers: c.papers?.map((p) =>
                    p.id === paperId ? { ...p, loading: false, expanded: false } : p,
                  ),
                }
              : c,
          ),
        );
      }
    } else {
      // 直接展开
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                papers: c.papers?.map((p) => (p.id === paperId ? { ...p, expanded: true } : p)),
              }
            : c,
        ),
      );
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  /**
   * 跳转到口语练习页面
   */
  const handlePractice = (question: ExamPaperQuestion, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 检查是否已登录
    if (!isLoggedIn) {
      message.warning('请先登录后再开始练习');
      setLoginModalVisible(true);
      return;
    }

    const workflowType = question.exercise?.workflow_type || question.workflow_type || 'fce_part1';
    const exerciseId = question.exercise?.id;
    if (exerciseId) {
      history.push(`/spoken-practice?workflow_type=${workflowType}&exercise_id=${exerciseId}`);
    } else {
      message.warning('缺少练习题ID');
    }
  };

  // 渲染题目列表
  const renderQuestions = (questions: ExamPaperQuestion[]) => {
    if (!questions || questions.length === 0) {
      return (
        <div className="empty-container">
          <InboxOutlined className="empty-icon" />
          <div>暂无题目</div>
        </div>
      );
    }

    return (
      <div className="questions-container">
        {questions.map((question, index) => {
          // 限制内容显示最多50个字
          const content = question.exercise?.content || '';
          const displayContent = content.length > 50 ? `${content.substring(0, 50)}...` : content;

          return (
            <div key={question.id} className="question-item">
              <div className="question-header">
                <div className="question-number">{index + 1}</div>
                <div className="question-title">{question.exercise?.title || '无标题'}</div>
              </div>
              {displayContent && (
                <div className="question-content">{displayContent}</div>
              )}
              <div className="question-footer">
                <span className="question-tag">分值: {question.question_score}分</span>
                <span className="question-tag">难度: {question.exercise?.difficulty || '-'}</span>
                <span className="question-tag">类型: {question.workflow_type}</span>
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={(e) => handlePractice(question, e)}
                  style={{ marginLeft: 'auto' }}
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

  // 渲染试卷列表
  const renderPapers = (papers: ExamPaperWithQuestions[], categoryId: number) => {
    if (!papers || papers.length === 0) {
      return (
        <div className="empty-container">
          <InboxOutlined className="empty-icon" />
          <div>暂无试卷</div>
        </div>
      );
    }

    return (
      <div className="papers-container">
        {papers.map((paper) => (
          <div key={paper.id} className="paper-item">
            <div className="paper-header" onClick={() => togglePaper(categoryId, paper.id)}>
              <div className="paper-header-left">
                <FileTextOutlined className="paper-icon" />
                <div className="paper-info">
                  <div className="paper-name">{paper.paper_name}</div>
                  <div className="paper-meta">
                    <span>试卷编号: {paper.paper_code}</span>
                    <span>总分: {paper.total_score}分</span>
                    <span>
                      状态: <Tag color={paper.is_active ? 'green' : 'default'}>
                        {paper.is_active ? '启用' : '禁用'}
                      </Tag>
                    </span>
                  </div>
                </div>
              </div>
              <DownOutlined
                className={`paper-expand-icon ${paper.expanded ? 'expanded' : ''}`}
              />
            </div>
            {paper.expanded && (
              <>
                {paper.loading ? (
                  <div className="loading-container">
                    <Spin tip="加载题目中..." />
                  </div>
                ) : (
                  renderQuestions(paper.questions || [])
                )}
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="exam-catalog-container">
        <div className="loading-container" style={{ paddingTop: 100 }}>
          <Spin size="large" tip="加载考试分类中..." />
        </div>
      </div>
    );
  }

  return (
    <div className="exam-catalog-container">
      {/* 顶部导航栏 */}
      <div className="exam-catalog-nav">
        <div className="nav-left">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackToHome}
            size="large"
          >
            返回
          </Button>
        </div>
        <div className="nav-right">
          {isLoggedIn && (
            <Button 
              type="default" 
              icon={<TrophyOutlined />}
              onClick={handleMyPracticeRecords}
              style={{ marginRight: 12 }}
            >
              我的练习记录
            </Button>
          )}
          {isLoggedIn ? (
            <UserAvatar showName size="large" />
          ) : (
            <Button type="primary" onClick={handleLogin}>
              登录
            </Button>
          )}
        </div>
      </div>

      <div className="exam-catalog-header">
        <h1 className="exam-catalog-title">🎓 口语练习</h1>
        <p className="exam-catalog-description">
          浏览所有考试分类、试卷和题目。点击分类可展开查看试卷列表，点击试卷可查看题目详情。
        </p>
      </div>

      <div className="exam-catalog-content">
        {categories.length === 0 ? (
          <div className="empty-container" style={{ padding: '80px 0' }}>
            <InboxOutlined className="empty-icon" style={{ fontSize: 64 }} />
            <div style={{ fontSize: 16, marginTop: 16 }}>暂无考试分类</div>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="category-item">
              <div className="category-header" onClick={() => toggleCategory(category.id)}>
                <div className="category-header-left">
                  <FolderOpenOutlined className="category-icon" />
                  <div className="category-info">
                    <h3 className="category-name">{category.name}</h3>
                    {category.description && (
                      <p className="category-description">{category.description}</p>
                    )}
                  </div>
                </div>
                <DownOutlined
                  className={`category-expand-icon ${category.expanded ? 'expanded' : ''}`}
                />
              </div>
              {category.expanded && (
                <>
                  {category.loading ? (
                    <div className="loading-container">
                      <Spin tip="加载试卷中..." />
                    </div>
                  ) : (
                    renderPapers(category.papers || [], category.id)
                  )}
                </>
              )}
            </div>
          ))
        )}
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

export default ExamCatalog;
