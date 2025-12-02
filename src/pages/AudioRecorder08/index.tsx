import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, message, Progress } from 'antd';
import { AudioOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './index.less';

// 录音分段数据类型
interface RecordingSegment {
  blob: Blob;
  duration: number;
  startTime: number;
}

// 组件属性类型
interface AudioRecorderProps {
  maxDuration?: number; // 最大录音时长，默认60秒
  modalMode?: boolean; // 是否为弹框模式
  title?: string; // 弹框标题
  onFinish?: (blob: Blob, segments: RecordingSegment[]) => void; // 完成录音回调
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  maxDuration = 60,
  modalMode = false,
  title = '录音',
  onFinish,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [segments, setSegments] = useState<RecordingSegment[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [mergedBlob, setMergedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSegmentBlobRef = useRef<Blob[]>([]);

  // 请求麦克风权限
  useEffect(() => {
    if (!modalMode) {
      requestMicrophonePermission();
    }
    return () => {
      stopRecordingCleanup();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [modalMode, previewUrl]);

  // 请求麦克风权限
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      audioContextRef.current = new AudioContext();
      audioContextRef.current.createMediaStreamSource(stream);
    } catch (error) {
      message.error('麦克风权限被拒绝，请授权后重试');
      setPermissionGranted(false);
    }
  };

  // 开始录音
  const startRecording = async () => {
    if (!permissionGranted) {
      await requestMicrophonePermission();
      if (!permissionGranted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      currentSegmentBlobRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          currentSegmentBlobRef.current.push(e.data);
        }
      };

      // 录音停止完成后回调
      mediaRecorder.onstop = () => {
        stopRecordingCleanup();

        // 保存分段录音
        const duration = currentDuration;
        if (duration > 0.1) { // 过滤掉极短的录音
          const blob = new Blob(currentSegmentBlobRef.current, { type: 'audio/webm; codecs=opus' });
          setSegments(prev => [...prev, { blob, duration, startTime: Date.now() }]);
        }

        setCurrentDuration(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // 启动计时器
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentDuration(Math.min(elapsed, maxDuration));

        // 达到最大时长自动停止
        if (elapsed >= maxDuration) {
          stopRecording();
          message.warning('已达到最大录音时长');
        }
      }, 100);
    } catch (error) {
      message.error('录音启动失败，请检查麦克风权限');
      setIsRecording(false);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
  };

  // 停止录音清理工作
  const stopRecordingCleanup = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Error stopping tracks:', error);
      }
      mediaRecorderRef.current = null;
    }
  };

  // 取消所有录音
  const cancelRecording = () => {
    stopRecordingCleanup();
    setSegments([]);
    setCurrentDuration(0);
    setMergedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    message.info('已取消所有录音');
    if (modalMode) {
      setIsModalVisible(false);
    }
  };

  // 完成录音，合并所有分段
  const finishRecording = () => {
    if (segments.length === 0) {
      message.warning('没有录音数据，请先录音');
      return;
    }

    setAudioLoaded(false);
    setAudioError(false);

    // 合并所有分段
    const allBlobs = segments.map(s => s.blob);
    // 使用更兼容的音频格式
    const newMergedBlob = new Blob(allBlobs, { 
      type: 'audio/webm; codecs=opus' 
    });
    setMergedBlob(newMergedBlob);

    // 创建预览链接
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(newMergedBlob);
    setPreviewUrl(url);

    if (onFinish) {
      onFinish(newMergedBlob, segments);
    }

    message.success('录音完成，可以试听合成录音');

    if (modalMode) {
      // 弹框模式下不自动关闭，让用户可以试听
      // setIsModalVisible(false);
    }
  };

  // 打开弹框
  const showModal = () => {
    setIsModalVisible(true);
    requestMicrophonePermission();
  };

  // 渲染录音按钮
  const renderRecordButton = () => (
    <div className={styles.recordButtonContainer}>
      <Button
        className={`${styles.recordButton} ${isRecording ? styles.recording : ''}`}
        icon={<AudioOutlined />}
        onTouchStart={startRecording}
        onMouseDown={startRecording}
        onTouchEnd={stopRecording}
        onMouseUp={stopRecording}
        onMouseLeave={stopRecording}
        disabled={!permissionGranted}
        size="large"
        type="primary"
        danger={isRecording}
      >
        {isRecording ? '录音中...松手停止' : '长按开始录音'}
      </Button>
    </div>
  );

  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);

  // 渲染试听区域
  const renderPreviewArea = () => {
    if (!mergedBlob || !previewUrl) return null;

    return (
      <div className={styles.previewArea}>
        <div className={styles.previewTitle}>合成录音试听</div>
        {audioError ? (
          <div className={styles.audioError}>
            音频加载失败，请尝试重新录制
          </div>
        ) : (
          <>
            <audio
              controls
              src={previewUrl}
              className={styles.audioPlayer}
              onCanPlay={() => setAudioLoaded(true)}
              onError={() => setAudioError(true)}
              preload="metadata"
            >
              您的浏览器不支持音频播放
            </audio>
            {!audioLoaded && (
              <div className={styles.loadingText}>音频加载中...</div>
            )}
          </>
        )}
      </div>
    );
  };

  // 渲染分段进度条
  const renderSegmentProgress = () => {
    const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0) + currentDuration;
    const totalMaxDuration = maxDuration;

    return (
      <div className={styles.progressContainer}>
        <div className={styles.segmentProgress}>
          {segments.map((segment, index) => {
            const width = (segment.duration / totalMaxDuration) * 100;
            return (
              <div key={index} className={styles.segmentBar} style={{ width: `${width}%` }} />
            );
          })}
          {isRecording && (
            <div className={styles.currentSegmentBar} style={{ width: `${(currentDuration / totalMaxDuration) * 100}%` }} />
          )}
        </div>
        <div className={styles.timeDisplay}>
          <span>{Math.floor(totalDuration)}/{maxDuration}s</span>
        </div>
        <Progress
          percent={(totalDuration / totalMaxDuration) * 100}
          showInfo={false}
          strokeColor={isRecording ? '#ff4d4f' : '#1890ff'}
        />
      </div>
    );
  };

  // 渲染操作按钮
  const renderActionButtons = () => (
    <div className={styles.actionButtons}>
      <Button
        icon={<CloseOutlined />}
        onClick={cancelRecording}
        disabled={segments.length === 0 && !isRecording}
      >
        取消录音
      </Button>
      <Button
        icon={<CheckOutlined />}
        type="primary"
        onClick={finishRecording}
        disabled={segments.length === 0 && !isRecording}
      >
        完成录音
      </Button>
    </div>
  );

  // 弹框模式渲染
  if (modalMode) {
    return (
      <>
        <Button icon={<AudioOutlined />} onClick={showModal}>
          {title}
        </Button>
        <Modal
          title={title}
          visible={isModalVisible}
          footer={null}
          onCancel={cancelRecording}
          width={480}
        >
          <div className={styles.modalContent}>
            {renderSegmentProgress()}
            {renderRecordButton()}
            {renderActionButtons()}
            {renderPreviewArea()}
          </div>
        </Modal>
      </>
    );
  }

  // 嵌入模式渲染
  return (
    <div className={styles.container}>
      <h3>{title}</h3>
      {renderSegmentProgress()}
      {renderRecordButton()}
      {renderActionButtons()}
      {renderPreviewArea()}
    </div>
  );
};

export default AudioRecorder;