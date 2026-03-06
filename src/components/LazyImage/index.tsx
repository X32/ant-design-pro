/**
 * LazyImage 懒加载图片组件
 *
 * 使用浏览器原生 loading="lazy" 属性 + Intersection Observer API
 * 实现图片懒加载，减少首屏加载时间
 *
 * 使用示例：
 * ```tsx
 * import { LazyImage } from '@/components/LazyImage';
 *
 * <LazyImage
 *   src="https://example.com/image.jpg"
 *   alt="描述"
 *   width={400}
 *   height={300}
 *   placeholder="/images/placeholder.svg"
 * />
 * ```
 */
import React, { useState, useEffect, useRef } from 'react';
import { Image, Spin } from 'antd';
import type { ImageProps } from 'antd';

interface LazyImageProps extends Omit<ImageProps, 'src'> {
  /** 图片原始地址 */
  src: string;
  /** 占位图片地址，默认为灰色背景 */
  placeholder?: string;
  /** 是否启用懒加载，默认启用 */
  lazy?: boolean;
  /** 图片加载失败的占位图 */
  errorSrc?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjkwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlMGUwZTAiLz48L3N2Zz4=',
  lazy = true,
  errorSrc,
  alt,
  width,
  height,
  style,
  ...restProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // 使用 Intersection Observer 检测元素是否在视口内
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // 提前 50px 开始加载
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const displaySrc = hasError && errorSrc ? errorSrc : src;
  const showPlaceholder = !isLoaded && !hasError;

  return (
    <div
      ref={imgRef}
      style={{
        position: 'relative',
        width: width || '100%',
        height: height || 'auto',
        backgroundColor: '#f0f0f0',
        display: 'inline-block',
        ...style,
      }}
    >
      {/* 占位图/加载状态 */}
      {showPlaceholder && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Spin size="small" />
        </div>
      )}

      {/* 实际图片 */}
      {isInView && (
        <Image
          ref={imgRef}
          src={displaySrc}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
          {...restProps}
        />
      )}
    </div>
  );
};

export default LazyImage;
