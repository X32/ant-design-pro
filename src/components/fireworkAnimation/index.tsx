/**
 * 烟花动画组件
 * 
 * 功能特点：
 * - 中间显示奖杯图片
 * - 周围绽放烟花效果
 * - 支持自定义音效
 * - Canvas 2D 粒子系统
 */

import React, { useEffect, useRef } from 'react';
import type { FireworkAnimationProps, Firework, FireworkParticle } from './types';
import trophyImageDefault from './cup_1.png';  // 导入默认奖杯图片
import './index.less';

const FireworkAnimation: React.FC<FireworkAnimationProps> = ({
  visible = false,
  duration = 5000,
  fireworkCount = 15,
  playSound = false,
  soundUrl,
  onComplete,
  trophyImage = trophyImageDefault,
  width = window.innerWidth,
  height = window.innerHeight,
  backgroundColor = 'transparent',  // 默认透明背景
  showTrophy = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const fireworksRef = useRef<Firework[]>([]);
  const startTimeRef = useRef<number>(0);
  const lastLaunchTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const launchCountRef = useRef<number>(0);

  // 烟花颜色数组
  const colors = ['#EFDA1A', '#EF341A', '#E7B054' ];

  // 创建烟花
  const createFirework = (canvasWidth: number, canvasHeight: number): Firework => {
    const x = Math.random() * canvasWidth;
    const targetY = canvasHeight * (0.2 + Math.random() * 0.3); // 在屏幕上方 20%-50% 的位置爆炸
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    return {
      x,
      y: canvasHeight,
      targetY,
      speed: 5 + Math.random() * 3,
      exploded: false,
      particles: [],
      color,
      trail: [],
    };
  };

  // 创建爆炸粒子
  const createExplosion = (firework: Firework): FireworkParticle[] => {
    const particles: FireworkParticle[] = [];
    const particleCount = 80 + Math.random() * 40;
    
    // 为这朵烟花随机选择3种颜色
    const fireworkColors = [];
    const colorsCopy = [...colors];
    for (let i = 0; i < 3; i++) {
      const randomIndex = Math.floor(Math.random() * colorsCopy.length);
      fireworkColors.push(colorsCopy[randomIndex]);
      colorsCopy.splice(randomIndex, 1); // 移除已选颜色，避免重复
    }
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 4;
      
      // 每个粒子随机选择3种颜色中的一种
      const particleColor = fireworkColors[Math.floor(Math.random() * 3)];
      
      particles.push({
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        color: particleColor,
        size: 2 + Math.random() * 2,
        gravity: 0.05 + Math.random() * 0.05,
        friction: 0.98,
      });
    }
    
    return particles;
  };

  // 播放音效
  const playExplosionSound = () => {
    if (!playSound) return;
    
    try {
      if (soundUrl) {
        // 使用自定义音频文件
        if (!audioRef.current) {
          audioRef.current = new Audio(soundUrl);
          audioRef.current.volume = 0.3;
        }
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.warn('音频播放失败:', err);
        });
      } else {
        // 使用 Web Audio API 生成爆炸音效
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 100 + Math.random() * 200;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  };

  // 更新烟花
  const updateFirework = (firework: Firework): boolean => {
    if (!firework.exploded) {
      // 上升阶段
      firework.y -= firework.speed;
      
      // 添加尾迹
      firework.trail.push({
        x: firework.x,
        y: firework.y,
        alpha: 1,
      });
      
      // 限制尾迹长度
      if (firework.trail.length > 20) {
        firework.trail.shift();
      }
      
      // 更新尾迹透明度
      firework.trail.forEach((point, index) => {
        point.alpha = index / firework.trail.length;
      });
      
      // 到达目标高度后爆炸
      if (firework.y <= firework.targetY) {
        firework.exploded = true;
        firework.particles = createExplosion(firework);
       
      }
      
      return true;
    } else {
      // 爆炸后更新粒子
      let activeParticles = 0;
      
      firework.particles.forEach(particle => {
        particle.vx *= particle.friction;
        particle.vy *= particle.friction;
        particle.vy += particle.gravity;
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        particle.alpha -= 0.01;
        
        if (particle.alpha > 0) {
          activeParticles++;
        }
      });
      
      return activeParticles > 0;
    }
  };

  // 绘制烟花
  const drawFirework = (ctx: CanvasRenderingContext2D, firework: Firework) => {
    if (!firework.exploded) {
      // 绘制尾迹
      firework.trail.forEach((point, index) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${point.alpha})`;
        ctx.fill();
      });
      
      // 绘制上升的火箭
      ctx.beginPath();
      ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = firework.color;
      ctx.fill();
    } else {
      // 绘制爆炸粒子
      firework.particles.forEach(particle => {
        if (particle.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = particle.alpha;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
          ctx.restore();
        }
      });
    }
  };

  // 动画循环
  const animate = (currentTime: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const elapsed = currentTime - startTimeRef.current;
    
    // 在持续时间内定期发射烟花
    if (elapsed < duration && currentTime - lastLaunchTimeRef.current >= duration / fireworkCount) {
      if (launchCountRef.current < fireworkCount) {
        fireworksRef.current.push(createFirework(canvas.width, canvas.height));
        lastLaunchTimeRef.current = currentTime;
        launchCountRef.current++;
      }
    }
    
    // 更新和绘制所有烟花
    fireworksRef.current = fireworksRef.current.filter(firework => {
      const isActive = updateFirework(firework);
      if (isActive) {
        drawFirework(ctx, firework);
      }
      return isActive;
    });
    
    // 继续动画或结束
    if (elapsed < duration || fireworksRef.current.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      onComplete?.();
    }
  };

  useEffect(() => {
    if (!visible) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 重置状态
    fireworksRef.current = [];
    startTimeRef.current = performance.now();
    lastLaunchTimeRef.current = performance.now();
    launchCountRef.current = 0;
    
    // 开始动画
    animationFrameRef.current = requestAnimationFrame(animate);
    playExplosionSound(); 
    // 清理函数
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [visible, width, height, duration, fireworkCount]);

  if (!visible) return null;

  return (
    <div className="firework-animation-container">
      <canvas
        ref={canvasRef}
        className="firework-canvas"
      />
      {showTrophy && (
        <div className="trophy-container">
          <img
            src={trophyImage}
            alt="Trophy"
            className="trophy-image"
          />
        </div>
      )}
    </div>
  );
};

export default FireworkAnimation;
