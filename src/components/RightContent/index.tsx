import { QuestionCircleOutlined } from '@ant-design/icons';
import { SelectLang as UmiSelectLang } from '@umijs/max';

export type SiderTheme = 'light' | 'dark';

export const SelectLang: React.FC = () => {
  return (
    <UmiSelectLang
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: '48px',
        padding: '0 8px',
        fontSize: '16px',
      }}
    />
  );
};

export const Question: React.FC = () => {
  return (
    <a
      href="https://pro.ant.design/docs/getting-started"
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: '48px',
        padding: '0 8px',
        fontSize: '16px',
        color: 'inherit',
        textDecoration: 'none',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6f7ff'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <QuestionCircleOutlined />
    </a>
  );
};
