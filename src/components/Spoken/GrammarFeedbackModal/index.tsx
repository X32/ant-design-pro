/**
 * GrammarFeedbackModal 语法反馈弹窗组件
 * 显示语法错误、改进建议、评估维度等详细信息
 */

import { Button, Card, Modal, Tag } from 'antd';
import React from 'react';
import type { Assessment, GrammarFeedbackContent } from '@/types/spoken';
import './index.less';

interface GrammarFeedbackModalProps {
  /** 弹窗是否可见 */
  visible: boolean;
  /** 语法反馈内容 */
  feedback: GrammarFeedbackContent | null;
  /** 关闭弹窗回调 */
  onClose: () => void;
}

/**
 * 获取整体质量的颜色
 */
const getQualityColor = (quality: string): string => {
  switch (quality) {
    case 'excellent':
      return '#52c41a';
    case 'good':
      return '#1890ff';
    case 'fair':
      return '#faad14';
    case 'poor':
      return '#ff4d4f';
    default:
      return '#999';
  }
};

/**
 * 获取整体质量的中文标签
 */
const getQualityLabel = (quality: string): string => {
  switch (quality) {
    case 'excellent':
      return '优秀';
    case 'good':
      return '良好';
    case 'fair':
      return '一般';
    case 'poor':
      return '较差';
    default:
      return quality;
  }
};

/**
 * 获取相关性等级颜色
 */
const getRelevanceColor = (level: string): string => {
  switch (level) {
    case 'on_topic':
      return '#52c41a';
    case 'partially_on_topic':
      return '#faad14';
    case 'off_topic':
      return '#ff4d4f';
    default:
      return '#999';
  }
};

/**
 * 获取相关性等级的中文标签
 */
const getRelevanceLabel = (level: string): string => {
  switch (level) {
    case 'on_topic':
      return '切题';
    case 'partially_on_topic':
      return '部分切题';
    case 'off_topic':
      return '离题';
    default:
      return level;
  }
};

/**
 * 获取严重程度颜色
 */
const getSeverityColor = (severity: string): string => {
  return severity === 'critical' ? '#ff4d4f' : '#faad14';
};

/**
 * 获取严重程度的中文标签
 */
const getSeverityLabel = (severity: string): string => {
  return severity === 'critical' ? '严重' : '轻微';
};

/**
 * 渲染评估维度
 */
const renderAssessment = (title: string, assessment: Assessment) => {
  return (
    <div className="assessment-row">
      <strong>{title}:</strong>
      <div className="assessment-details">
        语法：{assessment.grammar_structure} | 词汇：{assessment.vocabulary} |
        连贯性：{assessment.coherence}
      </div>
    </div>
  );
};

/**
 * GrammarFeedbackModal 主组件
 */
export const GrammarFeedbackModal: React.FC<GrammarFeedbackModalProps> = ({
  visible,
  feedback,
  onClose,
}) => {
  if (!feedback) {
    return null;
  }

  return (
    <Modal
      title={
        <div className="modal-title">
          <span>📝 语法反馈详情</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          关闭
        </Button>,
      ]}
      width={800}
      className="grammar-feedback-modal"
    >
      <div className="modal-content">
        {/* 整体质量 */}
        <Card size="small" className="quality-card">
          <div className="quality-row">
            <strong>整体质量：</strong>
            <Tag color={getQualityColor(feedback.overall_quality)}>
              {getQualityLabel(feedback.overall_quality)}
            </Tag>
          </div>
        </Card>

        {/* 相关性评估 */}
        <Card size="small" className="relevance-card">
          <div className="relevance-row">
            <strong>相关性：</strong>
            <Tag color={getRelevanceColor(feedback.relevance_level)}>
              {getRelevanceLabel(feedback.relevance_level)}
            </Tag>
            <span className="relevance-score">
              (分数：{feedback.relevance_score.toFixed(2)})
            </span>
          </div>
          <div className="relevance-reason">{feedback.relevance_reason}</div>
        </Card>

        {/* 错误列表 */}
        {feedback.errors && feedback.errors.length > 0 && (
          <Card
            size="small"
            className="errors-card"
            title={
              <span className="errors-title">
                ❌ 错误列表 ({feedback.errors.length} 个)
              </span>
            }
          >
            <div className="errors-list">
              {feedback.errors.map((error, idx) => (
                <div
                  key={`${error.type}-${error.original}-${idx}`}
                  className={`error-item ${error.severity}`}
                >
                  <div className="error-header">
                    <Tag color={getSeverityColor(error.severity)}>
                      {getSeverityLabel(error.severity)}
                    </Tag>
                    <strong className="error-type">{error.type}</strong>
                  </div>
                  <div className="error-content">
                    <span className="error-original">{error.original}</span>
                    <span className="error-arrow">→</span>
                    <span className="error-corrected">{error.corrected}</span>
                  </div>
                  <div className="error-explanation">{error.explanation}</div>
                  {(error.a2_criterion ||
                    error.b1_criterion ||
                    error.b2_criterion) && (
                    <div className="error-criterion">
                      评分维度：
                      {error.a2_criterion ||
                        error.b1_criterion ||
                        error.b2_criterion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 改进版本 */}
        <Card
          size="small"
          className="improved-version-card"
          title={
            <span className="improved-version-title">✅ 改进后的句子</span>
          }
        >
          <div className="improved-version-content">
            {feedback.improved_version}
          </div>
        </Card>

        {/* 学习建议 */}
        {feedback.suggestions && feedback.suggestions.length > 0 && (
          <Card
            size="small"
            className="suggestions-card"
            title={<span className="suggestions-title">💡 学习建议</span>}
          >
            <ul className="suggestions-list">
              {feedback.suggestions.map((suggestion, idx) => (
                <li
                  key={suggestion.substring(0, 20)}
                  className="suggestion-item"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* 评估维度 (A2/B1/B2) */}
        {(feedback.a2_assessment ||
          feedback.b1_assessment ||
          feedback.b2_assessment) && (
          <Card
            size="small"
            className="assessment-card"
            title={<span className="assessment-title">📊 维度评估</span>}
          >
            <div className="assessment-content">
              {feedback.a2_assessment &&
                renderAssessment('A2 (KET)', feedback.a2_assessment)}
              {feedback.b1_assessment &&
                renderAssessment('B1 (PET)', feedback.b1_assessment)}
              {feedback.b2_assessment &&
                renderAssessment('B2 (FCE)', feedback.b2_assessment)}
            </div>
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default GrammarFeedbackModal;
