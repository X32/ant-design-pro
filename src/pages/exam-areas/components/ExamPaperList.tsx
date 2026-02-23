import React, { useState, useEffect } from 'react';
import { Card, Button, Pagination, Spin, Empty, Tag, App } from 'antd';
import { PlayCircleOutlined, FileTextOutlined, TrophyOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { getPublicExamPapers } from '@/services/ant-design-pro/api';
import type { ExamPaper } from '../types';
import './PaperList.less';

interface ExamPaperListProps {
  categoryId: number;
  examType: string;
  pageSize?: number;
}

/**
 * 考试试卷列表组件
 * 用于考试模式，点击直接进入考试页面
 */
const ExamPaperList: React.FC<ExamPaperListProps> = ({ categoryId, examType, pageSize = 20 }) => {
  const { message } = App.useApp();
  const { initialState } = useModel('@@initialState');
  const { currentUser } = initialState || {};
  const isLoggedIn = !!currentUser;

  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);

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
        setPapers(response.data);
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

  // 初始加载
  useEffect(() => {
    loadPapers(currentPage);
  }, [categoryId]);

  // 分页切换
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPapers(page);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 开始考试
  const handleStartExam = (paperId: number) => {
    if (!isLoggedIn) {
      message.warning('请先登录后开始考试');
      return;
    }
    // 跳转到考试页面，参数格式参考exam-catalog
    history.push(`/spoken-exam-practice?paper_id=${paperId}`);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  return (
    <div className="paper-list-container" id="exam-paper-list-section">
      <div className="paper-list-header">
        <h2 className="list-title">
          <TrophyOutlined /> {examType} 口语模拟考试
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
          <div className="paper-grid">
            {papers.map((paper) => (
              <Card
                key={paper.id}
                className="paper-card exam-card"
                hoverable
              >
                <div className="paper-card-content">
                  <div className="paper-header">
                    <Tag color="blue" icon={<TrophyOutlined />}>
                      {paper.paper_code}
                    </Tag>
                    {paper.is_active === 1 && (
                      <Tag color="success">可用</Tag>
                    )}
                  </div>

                  <h3 className="paper-title">{paper.paper_name}</h3>

                  <div className="paper-meta">
                    <span className="meta-item">
                      <TrophyOutlined /> 总分: {paper.total_score}分
                    </span>
                    <span className="meta-item">
                      <ClockCircleOutlined /> {formatDate(paper.create_time)}
                    </span>
                  </div>

                  <div className="exam-button-wrapper">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => handleStartExam(paper.id)}
                      icon={<PlayCircleOutlined />}
                      block
                      style={{
                        border: '3px solid #000',
                        borderRadius: '20px 15px 25px 18px',
                        boxShadow: '4px 4px 0px #000',
                        fontWeight: '900',
                        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
                        color: '#FFF',
                        fontSize: '16px',
                        height: '48px',
                        marginTop: '16px',
                      }}
                    >
                      🎯 开始考试
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

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

export default ExamPaperList;
