import React from 'react';
import { Button } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import { useAudioRecorder } from './useAudioRecorder';
import './AudioRecorderInline.less';

interface AudioRecorderInlineProps {
  maxDuration?: number;
  onFinish?: (filePath: string, audioBlob: Blob) => void;
  onCancel?: () => void;
}

/**
 * 内联式录音组件 - 用于底部固定布局
 * 布局设计：
 * - 顶部：左侧取消按钮 | 中间圆形麦克风按钮 | 右侧完成按钮
 * - 底部：进度条（左侧显示当前时长，右侧显示最大时长）
 */
const AudioRecorderInline: React.FC<AudioRecorderInlineProps> = ({
  maxDuration = 60,
  onFinish,
  onCancel,
}) => {
  const {
    isRecording,
    segments,
    currentDuration,
    totalDuration,
    isMaxDurationReached,
    touchActiveRef,
    touchStartTimeRef,
    isRecordingRef,
    longPressTimerRef,
    startRecording,
    stopRecording,
    mergeSegments,
    clearSegments: clearSegmentsBase,
    LONG_PRESS_THRESHOLD,
  } = useAudioRecorder({
    maxDuration,
    onFinish,
    onCancel,
  });

  // 清空录音数据
  const clearSegments = () => {
    clearSegmentsBase();
  };

  // 完成录音
  const handleFinish = async () => {
    await mergeSegments();
  };

  // 计算进度百分比
  const progressPercent = ((totalDuration + currentDuration) / maxDuration) * 100;
  const hasData = segments.length > 0 || isRecording;
  const isDisabled = isMaxDurationReached;

  // 格式化时间显示（秒转为 MM:SS 格式或仅显示秒数）
  const formatTime = (seconds: number): string => {
    return seconds.toString().padStart(2, '0');
  };

  // 触摸开始处理
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    touchActiveRef.current = true;
    touchStartTimeRef.current = Date.now();
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    
    longPressTimerRef.current = setTimeout(() => {
      if (touchActiveRef.current) {
        startRecording();
      }
    }, LONG_PRESS_THRESHOLD);
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    const touchDuration = Date.now() - touchStartTimeRef.current;
    
    if (touchDuration < LONG_PRESS_THRESHOLD) {
      touchActiveRef.current = false;
      touchStartTimeRef.current = 0;
      return;
    }
    
    if (isRecording) {
      stopRecording();
    }
    
    touchActiveRef.current = false;
    touchStartTimeRef.current = 0;
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    startRecording();
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDisabled) return;
    e.preventDefault();
    e.stopPropagation();
    stopRecording();
  };

  return (
    <div className="audio-recorder-inline">
      {/* 顶部区域：取消按钮 | 麦克风按钮 | 完成按钮 */}
      <div className="recorder-top-section">
        {/* 左侧：取消按钮 */}
        <Button
          type="text"
          onClick={clearSegments}
          disabled={!hasData}
          className="action-button cancel-button"
        >
          取消
        </Button>

        {/* 中间：圆形麦克风按钮 */}
        <div
          className={`mic-button ${isRecording ? 'recording' : ''} ${isDisabled ? 'disabled' : ''}`}
          onMouseDown={isDisabled ? undefined : handleMouseDown}
          onMouseUp={isDisabled ? undefined : handleMouseUp}
          onMouseLeave={isDisabled ? undefined : handleMouseUp}
          onTouchStart={isDisabled ? undefined : handleTouchStart}
          onTouchEnd={isDisabled ? undefined : handleTouchEnd}
          style={{ touchAction: 'manipulation' }}
        >
          <div className="mic-button-inner">
            <AudioOutlined className="mic-icon" />
          </div>
          {/* 透明覆盖层 - 确保事件捕获 */}
          <div
            className="mic-button-overlay"
            onMouseDown={isDisabled ? undefined : handleMouseDown}
            onMouseUp={isDisabled ? undefined : handleMouseUp}
            onMouseLeave={isDisabled ? undefined : handleMouseUp}
            onTouchStart={isDisabled ? undefined : handleTouchStart}
            onTouchEnd={isDisabled ? undefined : handleTouchEnd}
          />
        </div>

        {/* 右侧：完成按钮 */}
        <Button
          type="primary"
          onClick={handleFinish}
          disabled={!hasData}
          className="action-button finish-button"
        >
          完成
        </Button>
      </div>

      {/* 底部区域：进度条 */}
      <div className="recorder-bottom-section">
        {/* 左侧：当前时长 */}
        <span className="time-label current-time">
          {formatTime(totalDuration + currentDuration)}
        </span>

        {/* 中间：进度条 */}
        <div className="progress-container">
          <div className="progress-track">
            {/* 蓝色已填充部分 */}
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
            {/* 圆形滑块 */}
            <div
              className="progress-thumb"
              style={{ left: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>

        {/* 右侧：最大时长 */}
        <span className="time-label max-time">
          {maxDuration} 秒
        </span>
      </div>

      {/* 录音提示文字 */}
      <div className="recorder-hint">
        {isDisabled 
          ? '已达最大时长' 
          : (isRecording ? '松开结束录音' : '长按麦克风开始录音')
        }
      </div>
    </div>
  );
};

export default AudioRecorderInline;
