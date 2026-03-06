/**
 * TL;DR 摘要组件
 * "Too Long; Didn't Read" - 结论前置，优化 AI 引用
 * 
 * GEO 优化原则：
 * - 44.2% 的引用来自文章前 1/3
 * - 最优段落长度：40-60 词
 * - 使用确定性语言（"X 是"而非"可能"）
 */

import React from 'react';
import './index.less';

interface TLDRSummaryProps {
  /** 摘要内容 */
  content: string;
  /** 标题（可选） */
  title?: string;
  /** 是否显示徽章 */
  showBadge?: boolean;
  /** 徽章图标 */
  badgeIcon?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * TL;DR 摘要组件
 * 
 * @example
 * ```tsx
 * <TLDRSummary
 *   content="口语魔方 SpeakCube 是 AI 驱动的剑桥英语口语练习平台..."
 *   title="快速了解"
 *   badgeIcon="📌"
 * />
 * ```
 */
export const TLDRSummary: React.FC<TLDRSummaryProps> = ({
  content,
  title = '快速了解',
  showBadge = true,
  badgeIcon = '📌',
  className = '',
}) => {
  return (
    <div className={`tldr-summary ${className}`}>
      {showBadge && (
        <div className="tldr-badge">
          {badgeIcon} {title}
        </div>
      )}
      <div 
        className="tldr-content"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default TLDRSummary;
