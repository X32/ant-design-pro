import React from 'react';
import { Button, Modal, Space, Progress } from 'antd';
import { AudioOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { useAudioRecorder } from './useAudioRecorder';
import './AudioRecorderMinimal.less';

interface AudioRecorderMinimalProps {
  maxDuration?: number;
  onFinish?: (filePath: string, audioBlob: Blob) => void;
  onCancel?: () => void;
  modalMode?: boolean;
  triggerButton?: React.ReactNode;
}

/**
 * 极简风格的录音组件
 * 使用 useAudioRecorder Hook 复用所有功能逻辑
 */
const AudioRecorderMinimal: React.FC<AudioRecorderMinimalProps> = ({
  maxDuration = 60,
  onFinish,
  onCancel,
  modalMode = false,
  triggerButton,
}) => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  
  const {
    isRecording,
    segments,
    currentDuration,
    totalDuration,
    isMaxDurationReached,
    audioUrl,
    touchActiveRef,
    touchStartTimeRef,
    isRecordingRef,
    longPressTimerRef,
    startRecording,
    stopRecording,
    mergeSegments,
    clearSegments: clearSegmentsBase,
    resetRecorder,
    LONG_PRESS_THRESHOLD,
  } = useAudioRecorder({
    maxDuration,
    onFinish,
    onCancel,
  });

  // 清空录音数据
  const clearSegments = () => {
    clearSegmentsBase();
    if (modalMode) {
      setIsModalVisible(false);
    }
  };

  // 完成录音
  const handleFinish = async () => {
    await mergeSegments();
    if (modalMode) {
      setIsModalVisible(false);
    }
  };

  // 渲染录音按钮 - 极简圆形设计
  const renderRecordButton = () => {
    const isDisabled = isMaxDurationReached;
    
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
      <div className="minimal-record-button-wrapper">
        <div
          className={`minimal-record-button ${isRecording ? 'recording' : ''} ${isDisabled ? 'disabled' : ''}`}
          onMouseDown={isDisabled ? undefined : handleMouseDown}
          onMouseUp={isDisabled ? undefined : handleMouseUp}
          onMouseLeave={isDisabled ? undefined : handleMouseUp}
          onTouchStart={isDisabled ? undefined : handleTouchStart}
          onTouchEnd={isDisabled ? undefined : handleTouchEnd}
          style={{ touchAction: 'manipulation' }}
        >
          <div className="minimal-record-button-inner">
            <AudioOutlined className="minimal-record-icon" />
          </div>
        </div>
        <div className="minimal-record-text">
          {isDisabled 
            ? `已达最大时长` 
            : (isRecording ? '松开结束' : '按住录音')
          }
        </div>
      </div>
    );
  };

  // 渲染进度条 - 圆形进度
  const renderProgress = () => {
    const percent = ((totalDuration + currentDuration) / maxDuration) * 100;
    
    return (
      <div className="minimal-progress-wrapper">
        <Progress
          type="circle"
          percent={percent}
          width={80}
          strokeColor={{
            '0%': '#1890ff',
            '100%': '#52c41a',
          }}
          format={() => `${totalDuration + currentDuration}s`}
        />
        <div className="minimal-progress-label">
          最多 {maxDuration}秒
        </div>
      </div>
    );
  };

  // 渲染操作按钮 - 极简设计
  const renderActions = () => {
    const hasData = segments.length > 0 || isRecording;

    return (
      <Space size="large" className="minimal-actions">
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={clearSegments}
          disabled={!hasData}
          size="large"
          danger
        >
          取消
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleFinish}
          disabled={!hasData}
          size="large"
        >
          完成
        </Button>
      </Space>
    );
  };

  // 渲染录音组件内容
  const renderContent = () => {
    return (
      <div className="audio-recorder-minimal">
        {renderRecordButton()}
        {renderProgress()}
        {renderActions()}
        {audioUrl && (
          <audio controls src={audioUrl} style={{ width: '100%', marginTop: 16 }} />
        )}
      </div>
    );
  };

  // 弹框模式
  if (modalMode) {
    const handleCloseModal = () => {
      setIsModalVisible(false);
    };

    const handleAfterClose = () => {
      resetRecorder();
    };

    return (
      <>
        {triggerButton ? (
          <div onClick={() => setIsModalVisible(true)} style={{ display: 'inline-block' }}>
            {triggerButton}
          </div>
        ) : (
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            开始录音
          </Button>
        )}
        <Modal
          title="录音"
          open={isModalVisible}
          onCancel={handleCloseModal}
          afterClose={handleAfterClose}
          footer={null}
          destroyOnClose={true}
          width={400}
          centered
        >
          {renderContent()}
        </Modal>
      </>
    );
  }

  return renderContent();
};

export default AudioRecorderMinimal;
