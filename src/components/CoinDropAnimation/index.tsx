import React, { useEffect, useRef, useState } from 'react';
import './index.less';

/**
 * 金币粒子接口
 */
interface Coin {
  x: number;          // X 坐标
  y: number;          // Y 坐标
  vx: number;         // X 方向速度
  vy: number;         // Y 方向速度
  rotation: number;   // 旋转角度
  rotationSpeed: number; // 旋转速度
  scale: number;      // 缩放比例
  opacity: number;    // 透明度
  id: number;         // 金币唯一ID
}

/**
 * 金币雨动画组件属性
 */
export interface CoinDropAnimationProps {
  /** 是否显示动画 */
  visible?: boolean;
  /** 金币生成速度（毫秒/个，越小越密集） */
  spawnRate?: number;
  /** 掉落持续时间（毫秒） */
  duration?: number;
  /** 是否播放音效 */
  playSound?: boolean;
  /** 自定义音频文件URL（可选，优先使用） */
  soundUrl?: string;
  /** 动画完成回调 */
  onComplete?: () => void;
  /** 金币颜色 */
  coinColor?: string;
  /** 容器宽度 */
  width?: number;
  /** 容器高度 */
  height?: number;
  /** 金币下落速度（像素/帧） */
  fallSpeed?: number;
}

/**
 * 金币雨动画组件
 * 使用 Canvas 2D 粒子系统实现金币雨效果
 */
const CoinDropAnimation: React.FC<CoinDropAnimationProps> = ({
  visible = false,
  spawnRate = 50,  // 每50ms生成一个金币
  duration = 3000,
  playSound = true,
  soundUrl,  // 新增：自定义音频URL
  onComplete,
  coinColor = '#FFD700',
  width = 400,
  height = 600,
  fallSpeed = 5,  // 金币下落速度
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const coinsRef = useRef<Coin[]>([]);
  const startTimeRef = useRef<number>(0);
  const lastSpawnTimeRef = useRef<number>(0);
  const coinIdRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);  // 新增：音频元素引用
  const [isAnimating, setIsAnimating] = useState(false);

  /**
   * 创建单个金币
   */
  const createCoin = (): Coin => {
    return {
      x: Math.random() * width,
      y: -30, // 从顶部上方开始
      vx: (Math.random() - 0.5) * 1, // 轻微的水平漂移
      vy: fallSpeed + Math.random() * 2, // 下落速度带随机性
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.15,
      scale: 0.6 + Math.random() * 0.6, // 大小变化更大，增加层次感
      opacity: 0.8 + Math.random() * 0.2,
      id: coinIdRef.current++,
    };
  };

  /**
   * 绘制金币
   */
  const drawCoin = (
    ctx: CanvasRenderingContext2D,
    coin: Coin,
    currentTime: number
  ) => {
    ctx.save();
    
    // 移动到金币位置
    ctx.translate(coin.x, coin.y);
    ctx.rotate(coin.rotation);
    ctx.scale(coin.scale, coin.scale);
    
    // 闪烁效果（基于时间的正弦波）
    // const shimmer = Math.sin(currentTime * 0.01 + coin.x) * 0.2 + 0.8;
    // ctx.globalAlpha = coin.opacity * shimmer;
    
    // 绘制金币（圆形 + 内部细节）
    const radius = 15;
    
    // 外圈（金色边框）
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = coinColor;
    ctx.fill();
    ctx.strokeStyle = '#DAA520';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 内圈（深色）
    ctx.beginPath();
    ctx.arc(0, 0, radius - 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFA500';
    ctx.fill();
    
    // 中心符号（¥）
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', 0, 0);
    
    ctx.restore();
  };

  /**
   * 更新金币物理状态（金币雨效果）
   */
  const updateCoin = (coin: Coin, deltaTime: number) => {
    // 更新位置
    coin.x += coin.vx;
    coin.y += coin.vy;
    
    // 更新旋转
    coin.rotation += coin.rotationSpeed;
    
    // 轻微的摆动效果（模拟空气阻力）
    coin.vx += Math.sin(coin.y * 0.01) * 0.02;
    
    // 如果金币超出底部，标记为移除
    if (coin.y > height + 30) {
      coin.opacity = 0;
    }
    
    // 边界检测 - 左右边界（循环）
    if (coin.x < -30) {
      coin.x = width + 30;
    } else if (coin.x > width + 30) {
      coin.x = -30;
    }
  };

  /**
   * 播放音效（支持自定义音频文件或 Web Audio API）
   */
  const playBounceSound = () => {
    try {
      // 如果提供了自定义音频URL，使用音频文件
      if (soundUrl) {
        if (!audioRef.current) {
          audioRef.current = new Audio(soundUrl);
          audioRef.current.volume = 0.3; // 设置音量
        }
        // 重置播放位置并播放
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.warn('音频播放失败:', err);
        });
      } else {
        // 使用 Web Audio API 生成简单音效
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800 + Math.random() * 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  };

  /**
   * 动画循环（金币雨效果）
   */
  const animate = (currentTime: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
      lastSpawnTimeRef.current = currentTime;
    }
    
    const elapsed = currentTime - startTimeRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    
    if (!canvas || !ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 持续生成新金币（在动画时间内）
    if (elapsed < duration && currentTime - lastSpawnTimeRef.current >= spawnRate) {
      coinsRef.current.push(createCoin());
      lastSpawnTimeRef.current = currentTime;
      
      // 播放生成音效（降低频率，避免过于密集）
      if (playSound && Math.random() < 0.2) {
        playBounceSound();
      }
    }
    
    // 更新和绘制所有金币
    coinsRef.current = coinsRef.current.filter(coin => {
      updateCoin(coin, 16);
      
      // 只保留可见的金币
      if (coin.opacity > 0.01) {
        drawCoin(ctx, coin, currentTime);
        return true;
      }
      return false;
    });
    
    // 检查是否应该结束动画
    // 条件：超过持续时间 且 所有金币都消失了
    if (elapsed >= duration && coinsRef.current.length === 0) {
      // 动画结束
      setIsAnimating(false);
      onComplete?.();
    } else {
      // 继续动画
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  /**
   * 开始动画
   */
  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    coinsRef.current = []; // 清空现有金币
    coinIdRef.current = 0; // 重置ID计数器
    startTimeRef.current = 0;
    lastSpawnTimeRef.current = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  /**
   * 停止动画
   */
  const stopAnimation = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsAnimating(false);
    
    // 清空画布
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
    
    // 清空金币数组
    coinsRef.current = [];
  };

  // 监听 visible 变化
  useEffect(() => {
    if (visible) {
      startAnimation();
    } else {
      stopAnimation();
    }
    
    return () => {
      stopAnimation();
    };
  }, [visible]);

  // 清理资源
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="coin-drop-animation-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="coin-drop-canvas"
      />
    </div>
  );
};

export default CoinDropAnimation;
