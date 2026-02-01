import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

// 机器人图标 - AI 陪你聊天
export const RobotIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 机器人身体 */}
    <rect x="20" y="30" width="60" height="50" rx="10" fill="#4ECDC4" stroke="#000" strokeWidth="3"/>
    {/* 机器人头部 */}
    <rect x="25" y="15" width="50" height="25" rx="8" fill="#4ECDC4" stroke="#000" strokeWidth="3"/>
    {/* 眼睛 */}
    <circle cx="40" cy="28" r="6" fill="#000"/>
    <circle cx="60" cy="28" r="6" fill="#000"/>
    {/* 眼睛高光 */}
    <circle cx="42" cy="26" r="2" fill="#FFF"/>
    <circle cx="62" cy="26" r="2" fill="#FFF"/>
    {/* 天线 */}
    <line x1="50" y1="15" x2="50" y2="5" stroke="#000" strokeWidth="3"/>
    <circle cx="50" cy="3" r="4" fill="#FFD93D" stroke="#000" strokeWidth="2"/>
    {/* 嘴巴 */}
    <rect x="35" y="40" width="30" height="8" rx="4" fill="#000"/>
    {/* 手臂 */}
    <rect x="10" y="40" width="12" height="35" rx="6" fill="#FFD93D" stroke="#000" strokeWidth="3"/>
    <rect x="78" y="40" width="12" height="35" rx="6" fill="#FFD93D" stroke="#000" strokeWidth="3"/>
  </svg>
);

// 靶心图标 - 马上告诉你对不对
export const TargetIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 外圈 */}
    <circle cx="50" cy="50" r="45" fill="#FF6B6B" stroke="#000" strokeWidth="3"/>
    {/* 中圈 */}
    <circle cx="50" cy="50" r="32" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* 内圈 */}
    <circle cx="50" cy="50" r="18" fill="#FFD93D" stroke="#000" strokeWidth="3"/>
    {/* 靶心 */}
    <circle cx="50" cy="50" r="6" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    {/* 星星装饰 */}
    <path d="M 50 5 L 52 10 L 57 10 L 53 14 L 55 19 L 50 16 L 45 19 L 47 14 L 43 10 L 48 10 Z" fill="#FFD93D" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 游戏手柄图标 - 像游戏一样好玩
export const GameIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 手柄主体 */}
    <rect x="15" y="30" width="70" height="45" rx="20" fill="#95E1D3" stroke="#000" strokeWidth="3"/>
    {/* 左手柄 */}
    <rect x="5" y="40" width="18" height="30" rx="9" fill="#95E1D3" stroke="#000" strokeWidth="3"/>
    {/* 右手柄 */}
    <rect x="77" y="40" width="18" height="30" rx="9" fill="#95E1D3" stroke="#000" strokeWidth="3"/>
    {/* 方向键 */}
    <circle cx="30" cy="50" r="6" fill="#000"/>
    <circle cx="30" cy="62" r="6" fill="#000"/>
    <circle cx="18" cy="56" r="6" fill="#000"/>
    <circle cx="42" cy="56" r="6" fill="#000"/>
    {/* 动作键 */}
    <circle cx="65" cy="52" r="7" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <circle cx="78" cy="60" r="7" fill="#FFD93D" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 麦克风图标 - 听懂你的每一句话
export const MicIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 麦克风支架 */}
    <rect x="47" y="60" width="6" height="30" fill="#000"/>
    <rect x="35" y="88" width="30" height="5" rx="2" fill="#000"/>
    {/* 麦克风主体 */}
    <rect x="30" y="15" width="40" height="50" rx="20" fill="#A8E6CF" stroke="#000" strokeWidth="3"/>
    {/* 麦克风网格 */}
    <line x1="35" y1="25" x2="65" y2="25" stroke="#000" strokeWidth="2"/>
    <line x1="35" y1="32" x2="65" y2="32" stroke="#000" strokeWidth="2"/>
    <line x1="35" y1="39" x2="65" y2="39" stroke="#000" strokeWidth="2"/>
    <line x1="35" y1="46" x2="65" y2="46" stroke="#000" strokeWidth="2"/>
    <line x1="35" y1="53" x2="65" y2="53" stroke="#000" strokeWidth="2"/>
    {/* 声波装饰 */}
    <path d="M 75 30 Q 82 40 75 50" stroke="#FF6B6B" strokeWidth="3" fill="none" strokeLinecap="round"/>
    <path d="M 82 25 Q 92 40 82 55" stroke="#FFD93D" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>
);

// 手机图标 - 随时都能练
export const PhoneIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 手机机身 */}
    <rect x="25" y="10" width="50" height="80" rx="8" fill="#4ECDC4" stroke="#000" strokeWidth="3"/>
    {/* 屏幕 */}
    <rect x="30" y="18" width="40" height="55" fill="#FFF" stroke="#000" strokeWidth="2"/>
    {/* 屏幕内容 - 对话气泡 */}
    <rect x="33" y="25" width="25" height="12" rx="6" fill="#FFD93D" stroke="#000" strokeWidth="1.5"/>
    <rect x="42" y="42" width="25" height="12" rx="6" fill="#95E1D3" stroke="#000" strokeWidth="1.5"/>
    <rect x="33" y="58" width="20" height="10" rx="5" fill="#A8E6CF" stroke="#000" strokeWidth="1.5"/>
    {/* Home键 */}
    <circle cx="50" cy="82" r="4" fill="#000"/>
    {/* 听筒 */}
    <rect x="42" y="13" width="16" height="3" rx="1.5" fill="#000"/>
  </svg>
);

// 金币图标 - 超划算
export const CoinIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 金币主体 */}
    <circle cx="50" cy="50" r="40" fill="#FFD93D" stroke="#000" strokeWidth="3"/>
    {/* 内圈 */}
    <circle cx="50" cy="50" r="32" fill="none" stroke="#000" strokeWidth="2"/>
    {/* 金币符号 */}
    <text x="50" y="65" fontSize="45" fontWeight="900" textAnchor="middle" fill="#000" style={{ fontFamily: 'Arial, sans-serif' }}>
      ¥
    </text>
    {/* 星星装饰 */}
    <circle cx="25" cy="25" r="5" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <circle cx="75" cy="25" r="5" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <circle cx="25" cy="75" r="5" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <circle cx="75" cy="75" r="5" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 闪电图标 - 立刻就能看到进步
export const LightningIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 闪电主体 */}
    <path d="M 55 5 L 25 50 L 45 50 L 35 95 L 75 45 L 55 45 Z" fill="#FFD93D" stroke="#000" strokeWidth="3"/>
    {/* 闪电高光 */}
    <path d="M 50 20 L 35 45 L 50 45 L 42 70" stroke="#FFF" strokeWidth="2" fill="none" opacity="0.5"/>
  </svg>
);

// 星星图标 - 说错了也不怕
export const StarIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 星星主体 */}
    <path d="M 50 10 L 60 38 L 90 38 L 66 56 L 76 85 L 50 68 L 24 85 L 34 56 L 10 38 L 40 38 Z"
          fill="#FFD93D" stroke="#000" strokeWidth="3"/>
    {/* 星星内部细节 */}
    <circle cx="50" cy="45" r="8" fill="#FFF" opacity="0.6"/>
    {/* 小星星装饰 */}
    <path d="M 20 15 L 23 22 L 30 22 L 25 27 L 27 34 L 20 30 L 13 34 L 15 27 L 10 22 L 17 22 Z" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <path d="M 75 70 L 78 77 L 85 77 L 80 82 L 82 89 L 75 85 L 68 89 L 70 82 L 65 77 L 72 77 Z" fill="#4ECDC4" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 毕业帽图标 - 科学的方法
export const GraduationIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 帽子顶部 */}
    <path d="M 10 40 L 50 20 L 90 40 L 50 60 Z" fill="#4ECDC4" stroke="#000" strokeWidth="3"/>
    {/* 帽子侧面 */}
    <path d="M 50 60 L 50 75" stroke="#000" strokeWidth="3"/>
    <path d="M 50 75 L 90 55" stroke="#000" strokeWidth="3"/>
    {/* 帽子下半部分 */}
    <path d="M 10 40 L 10 50 L 50 70 L 50 60" fill="#4ECDC4" stroke="#000" strokeWidth="3"/>
    <path d="M 90 40 L 90 50" stroke="#000" strokeWidth="3"/>
    {/* 流苏 */}
    <circle cx="50" cy="70" r="5" fill="#FFD93D" stroke="#000" strokeWidth="2"/>
    <line x1="50" y1="70" x2="50" y2="85" stroke="#FFD93D" strokeWidth="3"/>
    <circle cx="50" cy="87" r="4" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 锁图标 - 安全可靠
export const LockIcon: React.FC<IconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    style={{ filter: 'drop-shadow(3px 3px 0px rgba(0, 0, 0, 0.2))' }}
  >
    {/* 锁环 */}
    <path d="M 30 45 L 30 30 Q 30 15 50 15 Q 70 15 70 30 L 70 45"
          fill="none" stroke="#000" strokeWidth="4"/>
    {/* 锁体 */}
    <rect x="20" y="45" width="60" height="45" rx="8" fill="#95E1D3" stroke="#000" strokeWidth="3"/>
    {/* 锁孔 */}
    <circle cx="50" cy="65" r="10" fill="#000"/>
    <rect x="47" y="65" width="6" height="15" fill="#000"/>
    {/* 钥匙孔装饰 */}
    <circle cx="50" cy="65" r="4" fill="#FFD93D"/>
    {/* 盾牌装饰 */}
    <path d="M 75 55 Q 85 50 85 40 Q 85 30 75 25 L 75 55 Z" fill="#FFD93D" stroke="#000" strokeWidth="2" opacity="0.8"/>
  </svg>
);

// 游戏手柄图标 - 开始游戏（按钮用）
export const GamepadButtonIcon: React.FC<IconProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    >
    {/* 手柄主体 */}
    <rect x="15" y="30" width="70" height="45" rx="20" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* 左手柄 */}
    <rect x="5" y="40" width="18" height="30" rx="9" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* 右手柄 */}
    <rect x="77" y="40" width="18" height="30" rx="9" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* 方向键 */}
    <circle cx="30" cy="50" r="6" fill="#000"/>
    <circle cx="30" cy="62" r="6" fill="#000"/>
    <circle cx="18" cy="56" r="6" fill="#000"/>
    <circle cx="42" cy="56" r="6" fill="#000"/>
    {/* 动作键 */}
    <circle cx="65" cy="52" r="7" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <circle cx="78" cy="60" r="7" fill="#FFD93D" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 书本图标 - 看看怎么玩（按钮用）
export const BookButtonIcon: React.FC<IconProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    >
    {/* 书本封面 */}
    <path d="M 10 20 L 10 80 Q 50 70 90 80 L 90 20 Q 50 10 10 20 Z" fill="#4ECDC4" stroke="#000" strokeWidth="3"/>
    {/* 书脊 */}
    <line x1="50" y1="15" x2="50" y2="75" stroke="#000" strokeWidth="3"/>
    {/* 左页内容线 */}
    <line x1="20" y1="35" x2="40" y2="35" stroke="#000" strokeWidth="2"/>
    <line x1="20" y1="45" x2="40" y2="45" stroke="#000" strokeWidth="2"/>
    <line x1="20" y1="55" x2="35" y2="55" stroke="#000" strokeWidth="2"/>
    {/* 右页内容线 */}
    <line x1="60" y1="35" x2="80" y2="35" stroke="#000" strokeWidth="2"/>
    <line x1="60" y1="45" x2="80" y2="45" stroke="#000" strokeWidth="2"/>
    <line x1="60" y1="55" x2="75" y2="55" stroke="#000" strokeWidth="2"/>
    {/* 书签 */}
    <rect x="55" y="20" width="10" height="35" fill="#FFD93D" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 火箭图标 - 立即出发（按钮用）
export const RocketButtonIcon: React.FC<IconProps> = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={className}
    >
    {/* 火箭身体 */}
    <ellipse cx="50" cy="50" rx="20" ry="35" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* 火箭窗户 */}
    <circle cx="50" cy="45" r="10" fill="#4ECDC4" stroke="#000" strokeWidth="2"/>
    <circle cx="50" cy="45" r="4" fill="#FFD93D"/>
    {/* 火箭顶部 */}
    <path d="M 30 25 L 50 5 L 70 25 Z" fill="#FF6B6B" stroke="#000" strokeWidth="3"/>
    {/* 左翼 */}
    <path d="M 30 60 L 20 85 L 35 75 Z" fill="#FFD93D" stroke="#000" strokeWidth="3"/>
    {/* 右翼 */}
    <path d="M 70 60 L 80 85 L 65 75 Z" fill="#FFD93D" stroke="#000" strokeWidth="3"/>
    {/* 火焰 */}
    <path d="M 40 80 Q 50 95 60 80" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <path d="M 45 82 Q 50 90 55 82" fill="#FFD93D" stroke="#000" strokeWidth="2"/>
  </svg>
);

// 默认导出所有图标
export default {
  RobotIcon,
  TargetIcon,
  GameIcon,
  MicIcon,
  PhoneIcon,
  CoinIcon,
  LightningIcon,
  StarIcon,
  GraduationIcon,
  LockIcon,
  GamepadButtonIcon,
  BookButtonIcon,
  RocketButtonIcon,
};
