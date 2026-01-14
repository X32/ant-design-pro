import { useState, useRef, useEffect } from 'react';
import { message } from 'antd';

/**
 * 音频分段接口
 */
export interface AudioSegment {
  blob: Blob;
  duration: number;
}

/**
 * Hook 配置选项
 */
export interface UseAudioRecorderOptions {
  maxDuration?: number; // 最大录音时长，默认60秒
  onFinish?: (filePath: string, audioBlob: Blob) => void; // 录音完成回调
  onCancel?: () => void; // 取消录音回调
  autoRequestPermission?: boolean; // 是否自动请求麦克风权限
}

/**
 * Hook 返回值接口
 */
export interface UseAudioRecorderReturn {
  // 状态
  isRecording: boolean;
  segments: AudioSegment[];
  currentDuration: number;
  totalDuration: number;
  permissionGranted: boolean | null;
  showPermissionGuide: boolean;
  platformInfo: string;
  isMaxDurationReached: boolean;
  audioUrl: string | null;
  
  // Refs
  touchActiveRef: React.MutableRefObject<boolean>;
  touchStartTimeRef: React.MutableRefObject<number>;
  isRecordingRef: React.MutableRefObject<boolean>;
  longPressTimerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  
  // 方法
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  mergeSegments: (segmentsToMerge?: AudioSegment[]) => Promise<void>;
  clearSegments: () => void;
  resetRecorder: () => void;
  requestMicrophonePermission: () => Promise<MediaStream | null>;
  checkMicrophonePermission: () => Promise<void>;
  detectPlatform: () => string;
  detectBrowser: () => string;
  
  // 常量
  LONG_PRESS_THRESHOLD: number;
  maxDuration: number;
}

/**
 * 核心录音功能 Hook
 * 封装所有录音逻辑，可被不同样式的UI组件复用
 */
export const useAudioRecorder = (options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn => {
  const {
    maxDuration = 60,
    onFinish,
    onCancel,
    autoRequestPermission = false,
  } = options;

  // 状态管理
  const [isRecording, setIsRecording] = useState(false);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [platformInfo, setPlatformInfo] = useState<string>('');
  const [isMaxDurationReached, setIsMaxDurationReached] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 用于区分轻触和长按的时间阈值（毫秒）
  const LONG_PRESS_THRESHOLD = 300;

  // Refs
  const touchActiveRef = useRef<boolean>(false);
  const touchStartTimeRef = useRef<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMaxDurationStopRef = useRef<boolean>(false);
  const isRecordingRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 检测平台
  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    if (platform.includes('win')) {
      return 'Windows';
    } else if (platform.includes('mac')) {
      return 'macOS';
    } else if (userAgent.includes('harmonyos') || userAgent.includes('hongmeng')) {
      return 'HarmonyOS';
    } else if (userAgent.includes('android')) {
      return 'Android';
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      return 'iOS';
    } else if (userAgent.includes('linux')) {
      return 'Linux';
    }
    return 'Unknown';
  };

  // 检测浏览器
  const detectBrowser = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('huaweibrowser') || userAgent.includes('hmbrowser')) {
      return 'Huawei Browser';
    } else if (userAgent.includes('edg')) {
      return 'Edge';
    } else if (userAgent.includes('chrome')) {
      return 'Chrome';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'Safari';
    } else if (userAgent.includes('firefox')) {
      return 'Firefox';
    }
    return 'Unknown';
  };

  // 显示提示消息
  const showMessage = (type: 'success' | 'error' | 'warning' | 'info', content: string) => {
    message[type](content, 1);
  };

  // 检查麦克风权限
  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          if (permissionStatus.state === 'granted') {
            setPermissionGranted(true);
            setShowPermissionGuide(false);
          } else if (permissionStatus.state === 'denied') {
            setPermissionGranted(false);
            setShowPermissionGuide(true);
            const platform = detectPlatform();
            const browser = detectBrowser();
            setPlatformInfo(`${platform} - ${browser}`);
          } else {
            setPermissionGranted(null);
            setShowPermissionGuide(false);
          }

          permissionStatus.onchange = () => {
            if (permissionStatus.state === 'granted') {
              setPermissionGranted(true);
              setShowPermissionGuide(false);
              message.success('麦克风权限已开启');
            } else if (permissionStatus.state === 'denied') {
              setPermissionGranted(false);
              setShowPermissionGuide(true);
            }
          };
        } catch (permError) {
          console.log('Permissions API 不支持麦克风查询，将在用户操作时请求权限');
          setPermissionGranted(null);
          setShowPermissionGuide(false);
        }
      } else {
        console.log('浏览器不支持 Permissions API，将在用户点击录音时请求权限');
        setPermissionGranted(null);
        setShowPermissionGuide(false);
      }
    } catch (error) {
      console.error('检查麦克风权限失败:', error);
      setPermissionGranted(null);
      setShowPermissionGuide(false);
    }
  };

  // 请求麦克风权限
  const requestMicrophonePermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('浏览器不支持 getUserMedia API');
      showMessage('error', '当前浏览器不支持麦克风功能，请使用 Chrome、Firefox、Safari 或 Edge 等现代浏览器');
      setPermissionGranted(false);
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      setShowPermissionGuide(false);
      streamRef.current = stream;
      console.log('麦克风权限获取成功');
      return stream;
    } catch (error: any) {
      console.error('麦克风权限请求失败:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionGranted(false);
        setShowPermissionGuide(true);
        const platform = detectPlatform();
        const browser = detectBrowser();
        setPlatformInfo(`${platform} - ${browser}`);
        showMessage('error', '麦克风权限被拒绝，请按照下方引导开启权限');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        showMessage('error', '未检测到麦克风设备，请检查设备连接');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        showMessage('error', '麦克风正在被其他应用使用，请关闭其他应用后重试');
      } else if (error.name === 'SecurityError') {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isLAN = hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./);
        
        if (protocol === 'http:' && !isLocalhost) {
          if (isLAN) {
            showMessage('error', '局域网访问需要 HTTPS！请使用 npm run start:https 启动');
          } else {
            showMessage('error', '安全错误：麦克风功能需要使用 HTTPS 协议访问');
          }
        } else {
          showMessage('error', '安全错误：请确保网站使用 HTTPS 或 localhost 访问');
        }
      } else {
        setPermissionGranted(false);
        showMessage('error', `麦克风权限请求失败：${error.message || '未知错误'}`);
      }
      
      return null;
    }
  };

  // 开始录音
  const startRecording = async () => {
    if (isRecording) return;

    console.log('开始录音，当前权限状态:', permissionGranted);

    if (permissionGranted === null || permissionGranted === false) {
      console.log('需要请求麦克风权限...');
      const stream = await requestMicrophonePermission();
      if (!stream) {
        console.log('麦克风权限获取失败，停止录音');
        setIsRecording(false);
        return;
      }
      console.log('麦克风权限获取成功，继续录音');
    }

    setIsRecording(true);
    isRecordingRef.current = true;
    audioChunksRef.current = [];
    startTimeRef.current = Date.now();

    try {
      let stream = streamRef.current;
      if (!stream || !stream.active) {
        console.log('Stream 不活跃，重新请求麦克风权限...');
        stream = await requestMicrophonePermission();
        if (!stream) {
          console.log('重新获取权限失败，停止录音');
          setIsRecording(false);
          return;
        }
      }

      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        const fallbackTypes = ['audio/webm', 'audio/mp4', 'audio/ogg', 'audio/wav', ''];
        
        for (const type of fallbackTypes) {
          if (type === '' || MediaRecorder.isTypeSupported(type)) {
            mimeType = type;
            console.log(`使用 MIME 类型: ${type || '默认'}`);
            break;
          }
        }
      }

      const options: MediaRecorderOptions = {};
      if (mimeType) {
        options.mimeType = mimeType;
      }

      const mediaRecorder = new MediaRecorder(stream, options);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;

      timerRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCurrentDuration(duration);

        if (duration >= maxDuration) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          isMaxDurationStopRef.current = true;
          setIsMaxDurationReached(true);
          stopRecording();
          showMessage('info', `已达到最大录音时长${maxDuration}秒，自动完成录音`);
        }
      }, 100);
    } catch (error) {
      console.error('开始录音失败:', error);
      setIsRecording(false);
      showMessage('error', '开始录音失败，请重试');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (!isRecordingRef.current || !mediaRecorderRef.current) {
      console.log('停止录音检查失败');
      return;
    }

    console.log('停止录音开始');

    const isMaxDurationStop = isMaxDurationStopRef.current;

    setIsRecording(false);
    isRecordingRef.current = false;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const newSegment: AudioSegment = { blob: audioBlob, duration };
      const updatedSegments = [...segments, newSegment];
      
      console.log('录音停止，数据大小:', audioBlob.size, '时长:', duration);
      
      if (audioBlob.size === 0) {
        console.error('警告: 录音数据为空!');
      }
      
      setSegments(updatedSegments);
      setTotalDuration(prevTotal => prevTotal + duration);
      setCurrentDuration(0);
      
      if (isMaxDurationStop) {
        console.log('达到最大时长，自动合并录音...');
        setTimeout(() => mergeSegments(updatedSegments), 100);
        isMaxDurationStopRef.current = false;
      }
    };

    mediaRecorderRef.current.stop();
  };

  // 合并所有录音分段
  const mergeSegments = async (segmentsToMerge?: AudioSegment[]) => {
    const segmentsData = segmentsToMerge || segments;
    
    if (segmentsData.length === 0) {
      showMessage('warning', '没有录音数据');
      return;
    }

    try {
      const allBlobs = segmentsData.map((segment) => segment.blob);
      const mergedBlob = new Blob(allBlobs, { type: 'audio/webm' });

      const url = URL.createObjectURL(mergedBlob);
      setAudioUrl(url);

      if (onFinish) {
        onFinish(url, mergedBlob);
      }

      showMessage('success', '录音完成');
      
      setTimeout(() => {
        resetRecorder();
      }, 0);
    } catch (error) {
      console.error('合并录音分段失败:', error);
      showMessage('error', '合并录音失败，请重试');
    }
  };

  // 清空所有录音数据
  const clearSegments = () => {
    resetRecorder();
    if (onCancel) {
      onCancel();
    }
    showMessage('info', '录音已取消');
  };

  // 重置录音器状态
  const resetRecorder = () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    setSegments([]);
    setCurrentDuration(0);
    setTotalDuration(0);
    setAudioUrl(null);
    setPermissionGranted(null);
    setIsMaxDurationReached(false);
    isMaxDurationStopRef.current = false;
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  // 组件挂载时检查权限
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error('浏览器不支持 getUserMedia API');
      message.error({
        content: '当前浏览器不支持麦克风功能，请使用 Chrome、Firefox、Safari 或 Edge 等现代浏览器',
        duration: 5,
      });
      setPermissionGranted(false);
      setShowPermissionGuide(true);
      const platform = detectPlatform();
      const browser = detectBrowser();
      setPlatformInfo(`${platform} - ${browser}`);
      return;
    }

    checkMicrophonePermission();
    
    return () => {
      resetRecorder();
    };
  }, []);

  return {
    // 状态
    isRecording,
    segments,
    currentDuration,
    totalDuration,
    permissionGranted,
    showPermissionGuide,
    platformInfo,
    isMaxDurationReached,
    audioUrl,
    
    // Refs
    touchActiveRef,
    touchStartTimeRef,
    isRecordingRef,
    longPressTimerRef,
    
    // 方法
    startRecording,
    stopRecording,
    mergeSegments,
    clearSegments,
    resetRecorder,
    requestMicrophonePermission,
    checkMicrophonePermission,
    detectPlatform,
    detectBrowser,
    
    // 常量
    LONG_PRESS_THRESHOLD,
    maxDuration,
  };
};
