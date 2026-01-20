/**
 * 金币掉落动画组件类型定义
 */

export interface CoinDropAnimationProps {
  /** 是否显示动画 */
  visible?: boolean;
  /** 金币数量 */
  coinCount?: number;
  /** 掉落持续时间（毫秒） */
  duration?: number;
  /** 是否播放音效 */
  playSound?: boolean;
  /** 动画完成回调 */
  onComplete?: () => void;
  /** 金币颜色 */
  coinColor?: string;
  /** 是否堆积（false 则掉落到底部后消失） */
  shouldPile?: boolean;
  /** 容器宽度 */
  width?: number;
  /** 容器高度 */
  height?: number;
}

export default CoinDropAnimationProps;
