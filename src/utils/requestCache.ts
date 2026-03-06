/**
 * 请求缓存工具
 *
 * 提供请求防抖、缓存功能，减少重复请求
 *
 * 功能：
 * 1. 短期缓存：相同参数的请求在指定时间内直接返回缓存结果
 * 2. 请求防抖：短时间内多次请求只执行最后一次
 * 3. 请求节流：限制请求执行频率
 *
 * 使用示例：
 * ```typescript
 * import { requestCache, debounceRequest } from '@/utils/requestCache';
 *
 * // 带缓存的请求
 * const data = await requestCache.get('user:123', () => fetchUser(123), { ttl: 300 });
 *
 * // 防抖请求（500ms 内多次请求只执行一次）
 * const debouncedSearch = debounceRequest(searchApi, 500);
 * debouncedSearch(keyword);
 * ```
 */

type CacheKey = string;
type CacheValue<T> = {
  data: T;
  timestamp: number;
};

interface CacheOptions {
  /** 缓存时间（毫秒），默认 5 分钟 */
  ttl?: number;
  /** 是否启用缓存，默认 true */
  enabled?: boolean;
}

interface DebounceOptions {
  /** 是否立即执行，默认 false */
  immediate?: boolean;
}

/**
 * 请求缓存类
 */
class RequestCache {
  private cache: Map<CacheKey, CacheValue<any>> = new Map();
  private pendingRequests: Map<CacheKey, Promise<any>> = new Map();

  /**
   * 获取缓存数据
   * @param key 缓存键
   * @param fetcher 数据获取函数
   * @param options 缓存选项
   */
  async get<T>(
    key: CacheKey,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = 5 * 60 * 1000, enabled = true } = options;

    // 检查缓存
    if (enabled) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < ttl) {
        console.debug('[RequestCache] 缓存命中:', key);
        return cached.data;
      }
    }

    // 检查是否有正在进行的相同请求
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.debug('[RequestCache] 复用进行中请求:', key);
      return pending;
    }

    // 发起新请求
    const request = (async () => {
      try {
        const data = await fetcher();
        this.set(key, data);
        return data;
      } finally {
        this.pendingRequests.delete(key);
      }
    })();

    this.pendingRequests.set(key, request);
    return request;
  }

  /**
   * 设置缓存
   */
  set<T>(key: CacheKey, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    console.debug('[RequestCache] 缓存已设置:', key);
  }

  /**
   * 获取缓存（不触发新请求）
   */
  getCached<T>(key: CacheKey): T | undefined {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  /**
   * 删除缓存
   */
  delete(key: CacheKey): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    console.debug('[RequestCache] 缓存已清空');
  }

  /**
   * 清空过期缓存
   */
  cleanup(expiredTtl: number = 10 * 60 * 1000): void {
    const now = Date.now();
    let count = 0;
    this.cache.forEach((value, key) => {
      if (now - value.timestamp > expiredTtl) {
        this.cache.delete(key);
        count++;
      }
    });
    if (count > 0) {
      console.debug(`[RequestCache] 已清理 ${count} 条过期缓存`);
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    return {
      size: this.cache.size,
      pendingCount: this.pendingRequests.size,
    };
  }
}

/**
 * 请求防抖
 * @param fn 请求函数
 * @param delay 延迟时间（毫秒）
 * @param options 防抖选项
 */
export function debounceRequest<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number = 300,
  options: DebounceOptions = {}
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  const { immediate = false } = options;
  let timeoutId: NodeJS.Timeout | null = null;
  let lastResult: ReturnType<T> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      const callNow = immediate && !timeoutId;

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (!immediate) {
          fn(...args).then(resolve).catch(reject);
        }
      }, delay);

      if (callNow) {
        fn(...args).then(resolve).catch(reject);
      }
    });
  };
}

/**
 * 请求节流
 * @param fn 请求函数
 * @param interval 间隔时间（毫秒）
 */
export function throttleRequest<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  interval: number = 1000
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  let lastTime = 0;
  let pendingPromise: Promise<ReturnType<T> | null> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    const now = Date.now();

    if (pendingPromise) {
      return pendingPromise;
    }

    if (now - lastTime >= interval) {
      lastTime = now;
      pendingPromise = fn(...args).finally(() => {
        pendingPromise = null;
      });
      return pendingPromise;
    }

    // 返回上次的结果或 null
    return Promise.resolve(null);
  };
}

// 导出单例
export const requestCache = new RequestCache();

// 定期清理过期缓存（每 10 分钟）
setInterval(() => {
  requestCache.cleanup();
}, 10 * 60 * 1000);

export default requestCache;
