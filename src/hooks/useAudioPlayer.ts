/**
 * useAudioPlayer Hook
 * 管理音频播放状态、缓存和控制
 */

import { useCallback, useRef, useState } from 'react';

interface UseAudioPlayerReturn {
  /** 当前正在播放的消息 ID */
  playingMessageId: string | null;
  /** 是否正在播放 */
  isPlaying: boolean;
  /** 播放音频 */
  play: (audioUrl: string, messageId: string) => void;
  /** 暂停音频 */
  pause: () => void;
  /** 停止音频 */
  stop: () => void;
  /** 停止并清理特定消息的音频 */
  stopMessage: (messageId: string) => void;
}

/**
 * 音频播放器 Hook
 *
 * @example
 * ```tsx
 * const { playingMessageId, isPlaying, play, pause, stop } = useAudioPlayer();
 *
 * // 播放音频
 * play(audioUrl, messageId);
 *
 * // 暂停音频
 * pause();
 *
 * // 停止音频
 * stop();
 * ```
 */
export function useAudioPlayer(): UseAudioPlayerReturn {
  /** 当前正在播放的消息 ID */
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  /** 当前音频元素 */
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  /** 音频缓存 Map<messageId, HTMLAudioElement> */
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  /**
   * 播放音频
   * @param audioUrl 音频 URL
   * @param messageId 消息 ID
   */
  const play = useCallback(
    (audioUrl: string, messageId: string) => {
      // 停止当前正在播放的音频
      if (playingMessageId !== null && playingMessageId !== messageId) {
        const currentAudio = audioCacheRef.current.get(playingMessageId);
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
      }

      // 从缓存获取或创建新的音频对象
      let audio = audioCacheRef.current.get(messageId);

      if (!audio) {
        // 缓存中没有，创建新的
        audio = new Audio(audioUrl);
        audioCacheRef.current.set(messageId, audio);

        // 设置事件监听器（只在创建时设置一次）
        audio.onended = () => {
          setPlayingMessageId(null);
          audioElementRef.current = null;
        };

        audio.onerror = (err) => {
          console.error('播放音频失败:', err);
          setPlayingMessageId(null);
          audioElementRef.current = null;
        };
      }

      // 重置播放位置
      audio.currentTime = 0;

      setPlayingMessageId(messageId);
      audioElementRef.current = audio;

      audio.play().catch((err) => {
        console.error('播放音频失败:', err);
        setPlayingMessageId(null);
        audioElementRef.current = null;
      });
    },
    [playingMessageId],
  );

  /**
   * 暂停音频
   */
  const pause = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }
  }, []);

  /**
   * 停止音频
   */
  const stop = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
      audioElementRef.current = null;
    }
    setPlayingMessageId(null);
  }, []);

  /**
   * 停止并清理特定消息的音频
   * @param messageId 消息 ID
   */
  const stopMessage = useCallback(
    (messageId: string) => {
      const audio = audioCacheRef.current.get(messageId);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audioCacheRef.current.delete(messageId);
      }
      if (playingMessageId === messageId) {
        setPlayingMessageId(null);
        audioElementRef.current = null;
      }
    },
    [playingMessageId],
  );

  /**
   * 是否正在播放
   */
  const isPlaying = playingMessageId !== null;

  return {
    playingMessageId,
    isPlaying,
    play,
    pause,
    stop,
    stopMessage,
  };
}

export default useAudioPlayer;
