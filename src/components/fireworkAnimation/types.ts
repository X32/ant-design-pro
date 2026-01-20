/**
 * 烟花动画组件类型定义
 */

// 烟花粒子接口
export interface FireworkParticle {
  x: number;           // X坐标
  y: number;           // Y坐标
  vx: number;          // X方向速度
  vy: number;          // Y方向速度
  alpha: number;       // 透明度
  color: string;       // 颜色
  size: number;        // 粒子大小
  gravity: number;     // 重力
  friction: number;    // 摩擦力
}

// 烟花接口
export interface Firework {
  x: number;           // 发射位置X
  y: number;           // 发射位置Y
  targetY: number;     // 目标高度
  speed: number;       // 上升速度
  exploded: boolean;   // 是否已爆炸
  particles: FireworkParticle[];  // 爆炸粒子
  color: string;       // 烟花颜色
  trail: Array<{ x: number; y: number; alpha: number }>;  // 尾迹
}

// 组件属性接口
export interface FireworkAnimationProps {
  visible?: boolean;              // 是否显示动画
  duration?: number;              // 动画持续时间（毫秒）
  fireworkCount?: number;         // 烟花发射数量
  playSound?: boolean;            // 是否播放音效
  soundUrl?: string;              // 自定义音频文件URL
  onComplete?: () => void;        // 动画完成回调
  trophyImage?: string;           // 奖杯图片路径
  width?: number;                 // 容器宽度
  height?: number;                // 容器高度
  backgroundColor?: string;       // 背景颜色
  showTrophy?: boolean;          // 是否显示奖杯
}
