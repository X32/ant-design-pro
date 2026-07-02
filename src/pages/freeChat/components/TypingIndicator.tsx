import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ token }) => ({
  bubble: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '10px 16px',
    borderRadius: 14,
    background: token.colorBgContainer,
    border: `1px solid ${token.colorBorderSecondary}`,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: token.colorTextSecondary,
    display: 'inline-block',
    animation: 'typing-bounce 1.2s infinite ease-in-out',
    '&:nth-child(2)': { animationDelay: '0.15s' },
    '&:nth-child(3)': { animationDelay: '0.3s' },
  },
}));

const TypingIndicator: React.FC<{ hint?: string }> = ({ hint }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.bubble}>
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
      {hint ? (
        <span style={{ marginLeft: 6, fontSize: 12, opacity: 0.7 }}>
          {hint}
        </span>
      ) : null}
      <style>{`
        @keyframes typing-bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
