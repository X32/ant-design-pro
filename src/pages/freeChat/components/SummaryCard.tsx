import { Card } from 'antd';
import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ token }) => ({
  card: {
    borderColor: token.colorPrimaryBorder,
    background: token.colorPrimaryBg,
    borderRadius: 12,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontWeight: 600,
  },
  body: {
    whiteSpace: 'pre-wrap',
    lineHeight: 1.7,
    fontSize: 14,
  },
  paragraph: {
    margin: 0,
  },
  meta: {
    marginTop: 8,
    fontSize: 12,
    color: token.colorTextSecondary,
  },
}));

interface SummaryCardProps {
  content: string;
  totalRounds: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ content, totalRounds }) => {
  const { styles } = useStyles();

  const paragraphs = (content || '').split(/\n{2,}|\r\n\r\n/);

  return (
    <Card className={styles.card} size="small" variant="outlined">
      <div className={styles.title}>
        <span>✨</span>
        <span>对话总结</span>
      </div>
      <div className={styles.body}>
        {paragraphs.length > 1 ? (
          paragraphs.map((p, i) => (
            <p key={i} className={styles.paragraph}>
              {p}
            </p>
          ))
        ) : (
          <p className={styles.paragraph}>{content}</p>
        )}
      </div>
      <div className={styles.meta}>本次共 {totalRounds} 轮对话</div>
    </Card>
  );
};

export default SummaryCard;
