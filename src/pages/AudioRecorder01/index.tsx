import React, { useState, useRef, useEffect } from 'react';
import { Button, message, Modal, Progress } from 'antd';
import { AudioOutlined, PauseOutlined, PlayCircleOutlined, DeleteOutlined, CheckOutlined, SoundOutlined } from '@ant-design/icons';
import './style.less';

interface AudioSegment {
  blob: Blob;
  duration: number;
}

interface AudioRecorderProps {
  maxDuration?: number; // 最大录音时长（秒），默认60
  visible?: boolean; // 控制弹框显示
  onCancel?: () => void; // 取消回调
  onComplete?: (filePath: string) => void; // 完成回调
  mode?: 'inline' | 'modal'; // 组件模式：内联或弹框
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  maxDuration = 60,
  visible = false,
  onCancel,
  onComplete,
  mode = 'inline'
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 格式化时长为 mm:ss
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始录音
  const startRecording = async () => {
    try {
      // 获取用户媒体设备权限
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, // 回声消除
          noiseSuppression: true, // 噪声抑制
          autoGainControl: true // 自动增益控制
        } 
      });

      streamRef.current = stream;
      
      // 创建媒体录制器
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType: 'audio/webm' // 录制格式
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // 监听数据可用事件
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // 开始录制
      mediaRecorder.start(100); // 每100ms收集一次数据
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // 启动定时器更新录音时长
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setCurrentDuration(elapsed);

        // 检查是否超过最大时长
        if (elapsed >= maxDuration) {
          stopRecording();
          message.info(`已达到最大录音时长 ${maxDuration} 秒`);
        }
      }, 100);

    } catch (error) {
      console.error('录音启动失败:', error);
      message.error('录音权限被拒绝或设备不可用');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // 停止录制
      mediaRecorderRef.current.stop();

      // 监听录制结束事件
      mediaRecorderRef.current.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          // 创建录音片段
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const segment: AudioSegment = {
            blob,
            duration: currentDuration
          };

          // 添加到片段列表
          setSegments(prev => [...prev, segment]);
          setTotalDuration(prev => prev + currentDuration);
        }

        // 清理资源
        cleanupRecording();
      };
    }
  };

  // 播放录音
  const playRecording = () => {
    if (segments.length === 0) {
      message.warning('没有录音可播放');
      return;
    }

    // 合并所有片段并播放
    const mergeAndPlay = async () => {
      try {
        // 创建一个临时的音频上下文
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffers: AudioBuffer[] = [];

        // 解码所有录音片段
        for (const segment of segments) {
          const arrayBuffer = await segment.blob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          audioBuffers.push(audioBuffer);
        }

        // 计算合并后的总长度
        const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);

        // 创建一个新的音频缓冲区用于合并
        const mergedBuffer = audioContext.createBuffer(
          audioBuffers[0].numberOfChannels,
          totalLength,
          audioBuffers[0].sampleRate
        );

        // 复制所有音频数据到合并缓冲区
        let offset = 0;
        for (const buffer of audioBuffers) {
          for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
            mergedBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset);
          }
          offset += buffer.length;
        }

        // 将合并后的音频缓冲区编码为WAV格式的Blob
        const wavBlob = await encodeAudioBufferToWav(mergedBuffer);

        // 创建一个临时的URL用于播放
        const url = URL.createObjectURL(wavBlob);

        // 创建音频元素并播放
        if (audioRef.current) {
          audioRef.current.src = url;
          await audioRef.current.play();
          setIsPlaying(true);

          // 启动定时器更新播放时间
          playTimerRef.current = setInterval(() => {
            if (audioRef.current) {
              setCurrentPlayTime(audioRef.current.currentTime);
            }
          }, 100);

          // 监听播放结束
          audioRef.current.onended = () => {
            stopPlaying();
          };
        }

      } catch (error) {
        console.error('播放录音失败:', error);
        message.error('播放录音失败');
      }
    };

    mergeAndPlay();
  };

  // 停止播放
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
      playTimerRef.current = null;
    }

    setIsPlaying(false);
    setCurrentPlayTime(0);
  };

  // 清理录音资源
  const cleanupRecording = () => {
    // 清除定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 停止所有音轨
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // 重置状态
    setIsRecording(false);
    setCurrentDuration(0);
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  // 清理播放资源
  const cleanupPlaying = () => {
    stopPlaying();
    if (audioRef.current) {
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      audioRef.current.src = '';
    }
  };

  // 取消所有录音
  const cancelAllRecordings = () => {
    // 停止当前录音（如果正在录制）
    if (isRecording) {
      stopRecording();
    }

    // 停止当前播放（如果正在播放）
    if (isPlaying) {
      cleanupPlaying();
    }

    // 清空所有片段
    setSegments([]);
    setTotalDuration(0);

    message.success('已取消所有录音');

    // 如果是弹框模式，调用取消回调
    if (mode === 'modal' && onCancel) {
      onCancel();
    }
  };

  // 合并所有录音片段
  const mergeSegments = async () => {
    if (segments.length === 0) {
      message.warning('没有录音片段可合并');
      return;
    }

    try {
      // 停止当前播放（如果正在播放）
      if (isPlaying) {
        cleanupPlaying();
      }

      // 创建一个临时的音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffers: AudioBuffer[] = [];

      // 解码所有录音片段
      for (const segment of segments) {
        const arrayBuffer = await segment.blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers.push(audioBuffer);
      }

      // 计算合并后的总长度
      const totalLength = audioBuffers.reduce((acc, buffer) => acc + buffer.length, 0);

      // 创建一个新的音频缓冲区用于合并
      const mergedBuffer = audioContext.createBuffer(
        audioBuffers[0].numberOfChannels,
        totalLength,
        audioBuffers[0].sampleRate
      );

      // 复制所有音频数据到合并缓冲区
      let offset = 0;
      for (const buffer of audioBuffers) {
        for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
          mergedBuffer.getChannelData(channel).set(buffer.getChannelData(channel), offset);
        }
        offset += buffer.length;
      }

      // 将合并后的音频缓冲区编码为WAV格式的Blob
      const wavBlob = await encodeAudioBufferToWav(mergedBuffer);

      // 创建一个临时的URL用于下载或播放
      const url = URL.createObjectURL(wavBlob);

      message.success('录音合并完成');

      // 如果是弹框模式，调用完成回调
      if (mode === 'modal' && onComplete) {
        onComplete(url);
      }

      // 清空所有片段
      setSegments([]);
      setTotalDuration(0);

    } catch (error) {
      console.error('合并录音失败:', error);
      message.error('合并录音失败');
    }
  };

  // 将AudioBuffer编码为WAV格式的Blob
  const encodeAudioBufferToWav = async (audioBuffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve) => {
      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const bytesPerSample = 2; // 16位PCM
      const blockAlign = numChannels * bytesPerSample;

      // 创建WAV文件头
      const buffer = new ArrayBuffer(44 + audioBuffer.length * numChannels * bytesPerSample);
      const view = new DataView(buffer);

      // RIFF标识符
      writeString(view, 0, 'RIFF');
      // 文件大小
      view.setUint32(4, 36 + audioBuffer.length * numChannels * bytesPerSample, true);
      // WAVE标识符
      writeString(view, 8, 'WAVE');
      // fmt标识符
      writeString(view, 12, 'fmt ');
      // 子块大小
      view.setUint32(16, 16, true);
      // 音频格式（1为PCM）
      view.setUint16(20, 1, true);
      // 通道数
      view.setUint16(22, numChannels, true);
      // 采样率
      view.setUint32(24, sampleRate, true);
      // 字节率
      view.setUint32(28, sampleRate * blockAlign, true);
      // 块对齐
      view.setUint16(32, blockAlign, true);
      // 采样位数
      view.setUint16(34, bytesPerSample * 8, true);
      // data标识符
      writeString(view, 36, 'data');
      // 数据大小
      view.setUint32(40, audioBuffer.length * numChannels * bytesPerSample, true);

      // 写入音频数据
      let offset = 44;
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          const sample = audioBuffer.getChannelData(channel)[i];
          // 将浮点数转换为16位整数
          const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
          view.setInt16(offset, intSample, true);
          offset += 2;
        }
      }

      // 创建Blob并返回
      resolve(new Blob([buffer], { type: 'audio/wav' }));
    });
  };

  // 辅助函数：将字符串写入DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording();
      }
      if (isPlaying) {
        cleanupPlaying();
      }
      cleanupRecording();
    };
  }, []);

  // 渲染分段进度条
  const renderSegmentProgress = () => {
    if (segments.length === 0) return null;

    const segmentElements = segments.map((segment, index) => {
      const percentage = (segment.duration / totalDuration) * 100;
      return (
        <div
          key={index}
          className="audio-segment"
          style={{ width: `${percentage}%` }}
        />
      );
    });

    return (
      <div className="audio-segments-container">
        {segmentElements}
      </div>
    );
  };

  // 内联模式渲染
  const renderInline = () => (
    <div className="audio-recorder">
      <div className="audio-controls">
        {/* 长按录音按钮 */}
        <Button
          type="primary"
          size="large"
          icon={isRecording ? <PauseOutlined /> : <AudioOutlined />}
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording} // 移动端触摸开始
          onTouchEnd={stopRecording} // 移动端触摸结束
          className="record-button"
          disabled={isPlaying}
        >
          {isRecording ? '松开停止' : '长按录音'}
        </Button>

        {/* 播放/暂停按钮 */}
        <Button
          type="default"
          size="large"
          icon={isPlaying ? <PauseOutlined /> : <SoundOutlined />}
          onClick={isPlaying ? stopPlaying : playRecording}
          disabled={segments.length === 0 || isRecording}
          className="play-button"
        >
          {isPlaying ? '暂停' : '播放'}
        </Button>

        {/* 取消按钮 */}
        <Button
          icon={<DeleteOutlined />}
          onClick={cancelAllRecordings}
          disabled={segments.length === 0 && !isRecording && !isPlaying}
          className="cancel-button"
        >
          取消录音
        </Button>

        {/* 完成按钮 */}
        <Button
          type="default"
          icon={<CheckOutlined />}
          onClick={mergeSegments}
          disabled={segments.length === 0}
          className="complete-button"
        >
          完成录音
        </Button>
      </div>

      {/* 进度条和时长显示 */}
      <div className="audio-progress-container">
        {/* 录音进度条 */}
        {isRecording && (
          <Progress
            percent={(currentDuration / maxDuration) * 100}
            status="active"
            strokeColor="#1890ff"
            showInfo={false}
            className="audio-progress"
          />
        )}

        {/* 播放进度条 */}
        {isPlaying && (
          <Progress
            percent={(currentPlayTime / totalDuration) * 100}
            status="active"
            strokeColor="#52c41a"
            showInfo={false}
            className="audio-progress"
          />
        )}

        {/* 分段进度条 */}
        {renderSegmentProgress()}

        <div className="audio-duration">
          {isRecording && <span>当前时长: {formatDuration(currentDuration)}</span>}
          {isPlaying && <span>播放位置: {formatDuration(currentPlayTime)}</span>}
          <span>最大时长: {formatDuration(maxDuration)}</span>
          <span>总时长: {formatDuration(totalDuration)}</span>
        </div>
      </div>

      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );

  // 弹框模式渲染
  const renderModal = () => (
    <Modal
      title="录音"
      visible={visible}
      onCancel={cancelAllRecordings}
      footer={null}
      width={500}
    >
      {renderInline()}
    </Modal>
  );

  return mode === 'modal' ? renderModal() : renderInline();
};

export default AudioRecorder;