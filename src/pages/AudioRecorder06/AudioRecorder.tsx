import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, message, Alert, Space } from 'antd';
import { AudioOutlined, CloseOutlined, CheckOutlined, WarningOutlined } from '@ant-design/icons';
// 注意：上传功能已移至使用录音组件的页面
import './index.less';

interface AudioSegment {
  blob: Blob;
  duration: number;
}

interface AudioRecorderProps {
  maxDuration?: number; // 最大录音时长，默认60秒
  onFinish?: (filePath: string, audioBlob: Blob) => void; // 录音完成回调，返回文件路径和Blob数据
  onCancel?: () => void; // 取消录音回调
  modalMode?: boolean; // 是否为弹框模式
  triggerButton?: React.ReactNode; // 弹框模式下的触发按钮
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  maxDuration = 60,
  onFinish,
  onCancel,
  modalMode = false,
  triggerButton,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [segments, setSegments] = useState<AudioSegment[]>([]);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [showPermissionGuide, setShowPermissionGuide] = useState(false);
  const [platformInfo, setPlatformInfo] = useState<string>('');
  const [isMaxDurationReached, setIsMaxDurationReached] = useState(false); // 是否已达到最大时长

  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // 用于区分轻触和长按的时间阈值（毫秒）
  const LONG_PRESS_THRESHOLD = 300;

  // 长按检测
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isRecording && touchActiveRef.current) {
      timeoutId = setTimeout(() => {
        // 长按成功，可以添加额外的反馈
        console.log('长按录音已激活');
      }, LONG_PRESS_THRESHOLD);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isRecording]);

  // 添加一个ref来跟踪触摸状态
  const touchActiveRef = useRef<boolean>(false);
  const touchStartTimeRef = useRef<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMaxDurationStopRef = useRef<boolean>(false); // 标记是否是因为达到最大时长而停止
  const isRecordingRef = useRef<boolean>(false); // 用于在定时器中获取最新的录音状态
  
  // 检测平台和浏览器
  const detectPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    // 检测操作系统
    if (platform.includes('win')) {
      return 'Windows';
    } else if (platform.includes('mac')) {
      return 'macOS';
    } else if (userAgent.includes('harmonyos') || userAgent.includes('hongmeng')) {
      // 鸿蒙系统检测（HarmonyOS或鸿蒙）
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

    // 鸿蒙系统浏览器检测
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

  // 检查麦克风权限
  const checkMicrophonePermission = async () => {
    try {
      // 尝试查询权限状态（如果浏览器支持）
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
            // prompt 状态，需要用户主动授权
            setPermissionGranted(null);
            setShowPermissionGuide(false);
          }

          // 监听权限状态变化
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
          // Permissions API 不支持 microphone 查询（iOS Safari 等）
          console.log('Permissions API 不支持麦克风查询，将在用户操作时请求权限');
          // 移动端设置为 null，表示需要用户主动触发
          setPermissionGranted(null);
          setShowPermissionGuide(false);
        }
      } else {
        // 浏览器不支持 Permissions API（大多数移动端浏览器）
        console.log('浏览器不支持 Permissions API，将在用户点击录音时请求权限');
        // 移动端设置为 null，表示需要用户主动触发
        setPermissionGranted(null);
        setShowPermissionGuide(false);
      }
    } catch (error) {
      console.error('检查麦克风权限失败:', error);
      // 错误时设置为 null，让用户点击录音按钮时再请求
      setPermissionGranted(null);
      setShowPermissionGuide(false);
    }
  };

  // 组件挂载时检查权限
  useEffect(() => {
    // 先检查浏览器兼容性
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

    // 检查权限
    checkMicrophonePermission();
    
    return () => {
      resetRecorder();
    };
  }, []);



  // 将AudioBuffer转换为WAV格式的Blob
  const audioBufferToWav = (audioBuffer: AudioBuffer): Blob => {
    const length = audioBuffer.length * audioBuffer.numberOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;

    // WAV文件头
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF标识符
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    
    // fmt子块
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    
    // data子块
    writeString(36, 'data');
    view.setUint32(40, length, true);

    // 音频数据
    let offset = 44;
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < audioBuffer.length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  // 将WebM格式的音频转换为WAV格式（供外部使用）
  const convertWebMToWav = async (webmBlob: Blob): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const fileReader = new FileReader();

      fileReader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // 创建WAV文件
          const wavBlob = audioBufferToWav(audioBuffer);
          resolve(wavBlob);
        } catch (error) {
          reject(error);
        }
      };

      fileReader.onerror = () => reject(new Error('读取音频文件失败'));
      fileReader.readAsArrayBuffer(webmBlob);
    });
  };

  // 请求麦克风权限
  const requestMicrophonePermission = async () => {
    // 先检查浏览器是否支持 getUserMedia API
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
      
      // 详细错误分析
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        // 用户拒绝授权
        setPermissionGranted(false);
        setShowPermissionGuide(true);
        const platform = detectPlatform();
        const browser = detectBrowser();
        setPlatformInfo(`${platform} - ${browser}`);
        showMessage('error', '麦克风权限被拒绝，请按照下方引导开启权限');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        // 找不到麦克风设备
        showMessage('error', '未检测到麦克风设备，请检查设备连接');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        // 设备正在被其他应用使用
        showMessage('error', '麦克风正在被其他应用使用，请关闭其他应用后重试');
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        // 约束条件不满足
        showMessage('error', '麦克风设备不支持请求的参数');
      } else if (error.name === 'TypeError') {
        // TypeError 可能是其他原因导致的
        showMessage('error', '麦克风初始化失败，请刷新页面后重试');
      } else if (error.name === 'SecurityError') {
        // 安全错误（通常是 HTTPS 问题）
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const isLAN = hostname.match(/^192\.168\./) || hostname.match(/^10\./) || hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./); // 局域网 IP
        
        if (protocol === 'http:' && !isLocalhost) {
          if (isLAN) {
            // 局域网访问
            showMessage('error', '局域网访问需要 HTTPS！请使用 npm run start:https 启动，然后通过 https://你的IP:8001 访问');
          } else {
            // 公网访问
            showMessage('error', '安全错误：麦克风功能需要使用 HTTPS 协议访问，请联系管理员');
          }
        } else {
          showMessage('error', '安全错误：请确保网站使用 HTTPS 或 localhost 访问');
        }
      } else {
        // 其他错误
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

    // 如果还没有权限，先请求权限
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
    isRecordingRef.current = true; // 同步更新 ref，用于定时器中获取最新状态
    audioChunksRef.current = [];
    startTimeRef.current = Date.now();

    try {
      // 如果之前的stream已经关闭，重新请求
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

      // 检测支持的 MIME 类型
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.log(`${mimeType} 不支持，尝试其他格式...`);
        // iOS Safari 通常支持 audio/mp4
        const fallbackTypes = [
          'audio/webm',
          'audio/mp4',
          'audio/ogg',
          'audio/wav',
          '' // 空字符串表示使用浏览器默认格式
        ];
        
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

      mediaRecorder.start(100); // 每100ms收集一次数据
      mediaRecorderRef.current = mediaRecorder;

      // 启动定时器更新当前时长
      timerRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCurrentDuration(duration);

        // 检查是否超过最大时长
        if (duration >= maxDuration) {
          // 立即清除定时器，防止重复触发
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          
          isMaxDurationStopRef.current = true; // 标记是因为最大时长停止
          setIsMaxDurationReached(true); // 标记已达到最大时长，禁用录音按钮
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
    // 使用 ref 检查录音状态，避免闭包问题
    if (!isRecordingRef.current || !mediaRecorderRef.current) {
      console.log('停止录音检查失败: isRecordingRef=', isRecordingRef.current, 'mediaRecorder=', !!mediaRecorderRef.current);
      return;
    }

    console.log('停止录音开始, audioChunks数量:', audioChunksRef.current.length);

    // 记录是否是因为最大时长停止（在设置 isRecording 之前保存）
    const isMaxDurationStop = isMaxDurationStopRef.current;

    setIsRecording(false);
    isRecordingRef.current = false; // 同步更新 ref
    
    // 安全清除定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 计算当前分段的时长
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    // 重要：先设置 onstop 回调，再调用 stop()
    // 否则会出现竞态条件，导致回调不被执行
    mediaRecorderRef.current.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const newSegment: AudioSegment = { blob: audioBlob, duration };
      // 直接使用 [newSegment]，避免闭包中 segments 的旧值问题
      const updatedSegments = [newSegment];
      
      console.log('录音停止 onstop 回调，数据大小:', audioBlob.size, '时长:', duration, 'chunks数量:', audioChunksRef.current.length, '是否最大时长停止:', isMaxDurationStop);
      
      if (audioBlob.size === 0) {
        console.error('警告: 录音数据为空!');
      }
      
      setSegments(updatedSegments);
      setTotalDuration(duration);
      setCurrentDuration(0);
      
      // 只有达到最大时长时才自动合并并完成录音
      // 普通停止（用户松开按钮）需要用户手动点击"完成录音"按钮
      if (isMaxDurationStop) {
        console.log('达到最大时长，自动合并录音...');
        // 使用 updatedSegments 而不是 segments 状态，因为 setState 是异步的
        setTimeout(() => mergeSegments(updatedSegments), 100);
        // 重置标记
        isMaxDurationStopRef.current = false;
      } else {
        console.log('普通停止，等待用户点击"完成录音"按钮');
      }
    };

    // 调用 stop() 触发 onstop 回调
    mediaRecorderRef.current.stop();
  };

  // 合并所有录音分段
  const mergeSegments = async (segmentsToMerge?: AudioSegment[]) => {
    // 使用传入的分段或当前segments状态
    const segmentsData = segmentsToMerge || segments;
    
    if (segmentsData.length === 0) {
      showMessage('warning', '没有录音数据');
      return;
    }

    try {
      // 创建一个新的Blob，包含所有分段的数据
      const allBlobs = segmentsData.map((segment) => segment.blob);
      const mergedBlob = new Blob(allBlobs, { type: 'audio/webm' });

      // 创建一个临时URL
      const url = URL.createObjectURL(mergedBlob);
      setAudioUrl(url);

      // 调用完成回调，同时传递URL和Blob数据
      if (onFinish) {
        onFinish(url, mergedBlob);
      }

      showMessage('success', '录音完成');
      
      // 在下一个事件循环中重置录音器状态，确保父组件有时间处理数据
      setTimeout(() => {
        resetRecorder();
      }, 0);

      // 如果是弹框模式，关闭弹框
      if (modalMode) {
        setIsModalVisible(false);
      }
    } catch (error) {
      console.error('合并录音分段失败:', error);
      showMessage('error', '合并录音失败，请重试');
    }
  };

  // 处理上传按钮点击 - 由于上传功能已移至父组件，此函数已废弃
  const handleUpload = () => {
    if (!audioUrl) {
      showMessage('warning', '请先完成录音');
      return;
    }
    
    showMessage('info', '请通过父组件进行音频上传');
  };

  // 清空所有录音数据
  const clearSegments = () => {
    resetRecorder();
    if (onCancel) {
      onCancel();
    }
    showMessage('info', '录音已取消');

    // 如果是弹框模式，关闭弹框
    if (modalMode) {
      setIsModalVisible(false);
    }
  };

  // 重置录音器状态
  const resetRecorder = () => {
    setIsRecording(false);
    isRecordingRef.current = false; // 同步重置 ref
    setSegments([]);
    setCurrentDuration(0);
    setTotalDuration(0);
    setAudioUrl(null);
    setPermissionGranted(null);
    setIsMaxDurationReached(false); // 重置最大时长标记
    isMaxDurationStopRef.current = false; // 重置 ref 标记
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 停止所有轨道
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  // 显示提示消息
  const showMessage = (type: 'success' | 'error' | 'warning' | 'info', content: string) => {
    message[type](content, 1); // 1秒后自动消失
  };

  // 渲染权限引导
  const renderPermissionGuide = () => {
    if (!showPermissionGuide) return null;

    const platform = detectPlatform();
    const browser = detectBrowser();

    const getGuideSteps = () => {
      const steps: string[] = [];

      // 根据平台和浏览器提供不同的指引
      if (platform === 'Windows') {
        if (browser === 'Chrome' || browser === 'Edge') {
          steps.push('1. 点击地址栏左侧的锁头图标或“查看网站信息”');
          steps.push('2. 找到“麦克风”选项');
          steps.push('3. 选择“允许”或“问我”');
          steps.push('4. 刷新页面');
        } else if (browser === 'Firefox') {
          steps.push('1. 点击地址栏左侧的锁头图标');
          steps.push('2. 点击“权限”选项卡');
          steps.push('3. 找到“使用麦克风”，选择“允许”');
          steps.push('4. 刷新页面');
        }
      } else if (platform === 'macOS') {
        if (browser === 'Chrome' || browser === 'Edge') {
          steps.push('1. 点击地址栏左侧的锁头图标');
          steps.push('2. 找到“麦克风”选项');
          steps.push('3. 选择“允许”');
          steps.push('4. 如果仍然无法使用，请检查 macOS 系统偏好设置');
          steps.push('5. 前往 系统偏好设置 > 安全性与隐私 > 麦克风');
          steps.push('6. 确保 ${browser} 已被勾选');
        } else if (browser === 'Safari') {
          steps.push('1. 点击 Safari 菜单 > 偏好设置');
          steps.push('2. 选择“网站”选项卡');
          steps.push('3. 在左侧列表中选择当前网站');
          steps.push('4. 找到“麦克风”，选择“允许”');
          steps.push('5. 如果仍然无法使用，请检查 macOS 系统偏好设置');
        }
      } else if (platform === 'Android') {
        if (browser === 'Chrome') {
          steps.push('1. 点击地址栏左侧的锁头图标或“i”图标');
          steps.push('2. 选择“权限”或“网站设置”');
          steps.push('3. 找到“麦克风”，选择“允许”');
          steps.push('4. 刷新页面');
        } else if (browser === 'Firefox') {
          steps.push('1. 点击地址栏左侧的锁头图标');
          steps.push('2. 点击“权限”');
          steps.push('3. 找到“麦克风”，选择“允许”');
          steps.push('4. 刷新页面');
        } else {
          steps.push('1. 打开浏览器菜单（通常是右上角的三点图标）');
          steps.push('2. 选择“设置”或“权限”');
          steps.push('3. 找到当前网站，允许麦克风权限');
          steps.push('4. 返回页面并刷新');
        }
        steps.push('');
        steps.push('⚠️ 如果仍然无法使用，请检查系统设置：');
        steps.push('• 设置 > 应用 > 浏览器 > 权限 > 麦克风');
        steps.push('• 确保浏览器有麦克风权限');
      } else if (platform === 'iOS') {
        if (browser === 'Safari') {
          steps.push('1. 点击地址栏左侧的“AA”或“大小”图标');
          steps.push('2. 选择“网站设置”');
          steps.push('3. 找到“麦克风”，选择“允许”');
          steps.push('4. 刷新页面');
        } else {
          steps.push('1. 点击地址栏附近的权限图标');
          steps.push('2. 选择“网站设置”或“权限”');
          steps.push('3. 允许麦克风访问');
          steps.push('4. 刷新页面');
        }
        steps.push('');
        steps.push('⚠️ 如果仍然无法使用，请检查 iOS 系统设置：');
        steps.push('• 设置 > Safari浏览器 > 麦克风');
        steps.push('• 确保“访问麦克风”已开启');
        steps.push('• 或者：设置 > 隐私与安全 > 麦克风 > 允许 Safari');
      } else if (platform === 'HarmonyOS') {
        // 鸿蒙系统特殊处理
        if (browser === 'Huawei Browser') {
          steps.push('1. 点击地址栏左侧的锁头图标');
          steps.push('2. 选择“网站设置”或“权限管理”');
          steps.push('3. 找到“麦克风”，选择“允许”');
          steps.push('4. 刷新页面');
        } else if (browser === 'Chrome') {
          steps.push('1. 点击地址栏左侧的锁头图标或“i”图标');
          steps.push('2. 选择“权限”或“网站设置”');
          steps.push('3. 找到“麦克风”，选择“允许”');
          steps.push('4. 刷新页面');
        } else {
          steps.push('1. 打开浏览器菜单（右上角三点或三条线图标）');
          steps.push('2. 选择“设置” > “高级” > “网站设置”');
          steps.push('3. 找到当前网站，允许麦克风权限');
          steps.push('4. 返回页面并刷新');
        }
        steps.push('');
        steps.push('⚠️ 如果仍然无法使用，请检查鸿蒙系统设置：');
        steps.push('• 设置 > 隐私和安全 > 权限管理 > 麦克风');
        steps.push('• 找到浏览器应用，确保已开启麦克风权限');
        steps.push('• 或者：设置 > 应用和服务 > 应用管理 > 浏览器 > 权限 > 麦克风');
        steps.push('');
        steps.push('💡 提示：鸿蒙系统可能需要在系统和浏览器两处都开启权限');
      }

      if (steps.length === 0) {
        // 检查是否是浏览器不支持
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          steps.push('⚠️ 当前浏览器不支持麦克风功能');
          steps.push('');
          steps.push('请尝试以下方法：');
          steps.push('1. 更新浏览器到最新版本');
          steps.push('2. 使用以下现代浏览器：');
          steps.push('   • Chrome / Edge（版本 53+）');
          steps.push('   • Firefox（版本 36+）');
          steps.push('   • Safari（版本 11+）');
          steps.push('   • Opera（版本 40+）');
          steps.push('3. 如果是移动端，请使用系统默认浏览器');
          steps.push('');
          steps.push('💡 提示：请确保网站使用 HTTPS 协议访问');
        } else {
          steps.push('请在浏览器设置中允许本网站访问麦克风。');
          steps.push('通常可以在地址栏旁边找到权限设置。');
        }
      }

      return steps;
    };

    const steps = getGuideSteps();

    return (
      <Alert
        message="麦克风权限被禁用"
        description={
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              <strong>当前环境：</strong>{platformInfo}
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <strong>如何开启麦克风权限：</strong>
              {steps.map((step, index) => {
                // 空行或警告行特殊处理
                if (step === '') {
                  return <div key={index} style={{ height: 8 }} />;
                }
                if (step.startsWith('⚠️') || step.startsWith('•') || step.startsWith('💡')) {
                  return (
                    <div 
                      key={index} 
                      style={{ 
                        marginTop: 4,
                        paddingLeft: step.startsWith('•') ? 16 : 0,
                        color: step.startsWith('⚠️') ? '#fa8c16' : step.startsWith('💡') ? '#52c41a' : '#595959',
                        fontWeight: (step.startsWith('⚠️') || step.startsWith('💡')) ? 500 : 'normal',
                      }}
                    >
                      {step}
                    </div>
                  );
                }
                return (
                  <div 
                    key={index} 
                    style={{ 
                      marginTop: 8,
                      paddingLeft: 8,
                      borderLeft: '3px solid #1890ff',
                      paddingBottom: 4,
                    }}
                  >
                    {step}
                  </div>
                );
              })}
            </div>
            <Space style={{ marginTop: 16, width: '100%' }} direction="vertical">
              <Button 
                type="primary" 
                onClick={async () => {
                  console.log('用户点击“授权并测试麦克风”按钮');
                  const stream = await requestMicrophonePermission();
                  if (stream) {
                    message.success('麦克风权限已开启，可以开始录音了！');
                  }
                }}
                block
                icon={<AudioOutlined />}
              >
                授权并测试麦克风
              </Button>
              <Button 
                onClick={checkMicrophonePermission}
                block
              >
                重新检测权限
              </Button>
            </Space>
          </Space>
        }
        type="warning"
        icon={<WarningOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
      />
    );
  };

  // 渲染录音按钮
  const renderRecordButton = () => {
    // 如果已达到最大时长，禁用录音按钮
    const isDisabled = isMaxDurationReached;
    
    // 触摸开始处理
    const handleTouchStart = (e: React.TouchEvent) => {
      if (isDisabled) return;
      // 阻止默认行为（长按选中等）和事件冒泡
      e.preventDefault();
      e.stopPropagation();
      // 设置触摸状态和开始时间
      touchActiveRef.current = true;
      touchStartTimeRef.current = Date.now();
      startRecording();
    };
    
    // 触摸结束处理
    const handleTouchEnd = (e: React.TouchEvent) => {
      if (isDisabled) return;
      e.preventDefault();
      e.stopPropagation();
      // 重置触摸状态
      touchActiveRef.current = false;
      touchStartTimeRef.current = 0;
      stopRecording();
    };
    
    // 触摸取消处理（手指移出按钮区域等）
    const handleTouchCancel = (e: React.TouchEvent) => {
      if (isDisabled) return;
      e.preventDefault();
      e.stopPropagation();
      // 重置触摸状态
      touchActiveRef.current = false;
      touchStartTimeRef.current = 0;
      stopRecording();
    };
    
    // 触摸移动处理（防止手指滑出按钮区域时停止录音）
    const handleTouchMove = (e: React.TouchEvent) => {
      if (isDisabled) return;
      // 防止页面滚动等默认行为
      e.preventDefault();
      // 检查触摸点是否仍在按钮区域内
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const touch = e.touches[0];
      
      // 如果触摸点移出了按钮区域，停止录音
      if (touch.clientX < rect.left || touch.clientX > rect.right || 
          touch.clientY < rect.top || touch.clientY > rect.bottom) {
        if (touchActiveRef.current && isRecording) {
          stopRecording();
          touchActiveRef.current = false;
          touchStartTimeRef.current = 0;
        }
      }
    };
    
    // 鼠标按下处理（桌面端）
    const handleMouseDown = (e: React.MouseEvent) => {
      if (isDisabled) return;
      e.preventDefault();
      e.stopPropagation();
      startRecording();
    };
    
    // 鼠标释放处理（桌面端）
    const handleMouseUp = (e: React.MouseEvent) => {
      if (isDisabled) return;
      e.preventDefault();
      e.stopPropagation();
      stopRecording();
    };
    
    // 鼠标离开处理（桌面端，防止鼠标移出按钮时未停止录音）
    const handleMouseLeave = (e: React.MouseEvent) => {
      if (isDisabled) return;
      e.preventDefault();
      e.stopPropagation();
      // 在桌面端，鼠标移出按钮时也停止录音
      if (isRecording) {
        stopRecording();
      }
    };
    
    // 阻止右键菜单（PC端）
    const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    return (
      <div
        className={`audio-recorder-button ${isRecording ? 'recording' : ''} ${isDisabled ? 'disabled' : ''}`}
        onMouseDown={isDisabled ? undefined : handleMouseDown}
        onMouseUp={isDisabled ? undefined : handleMouseUp}
        onMouseLeave={isDisabled ? undefined : handleMouseLeave}
        onTouchStart={isDisabled ? undefined : handleTouchStart}
        onTouchEnd={isDisabled ? undefined : handleTouchEnd}
        onTouchCancel={isDisabled ? undefined : handleTouchCancel}
        onTouchMove={isDisabled ? undefined : handleTouchMove}
        onContextMenu={handleContextMenu}
        style={isDisabled ? { cursor: 'not-allowed', opacity: 0.5 } : { touchAction: 'manipulation' }}
        // 添加额外的触摸事件优化
        onTouchMoveCapture={(e) => e.preventDefault()}
      >
        <AudioOutlined />
        <span>
          {isDisabled 
            ? `已达最大时长(${maxDuration}秒)` 
            : (isRecording ? '松开停止' : '长按录音')
          }
        </span>
      </div>
    );
  };

  // 渲染进度条
  const renderProgressBar = () => {
    const currentProgress = isRecording ? (currentDuration / maxDuration) * 100 : 0;

    // 计算每个已录制分段的起始位置
    const segmentPositions = segments.reduce((acc, segment, index) => {
      const previousTotalDuration = segments.slice(0, index).reduce((sum, s) => sum + s.duration, 0);
      const startPosition = (previousTotalDuration / maxDuration) * 100;
      const segmentProgress = (segment.duration / maxDuration) * 100;
      acc.push({ startPosition, segmentProgress });
      return acc;
    }, [] as { startPosition: number; segmentProgress: number }[]);

    // 计算当前正在录制的分段的起始位置
    const currentStartPosition = totalDuration > 0 ? (totalDuration / maxDuration) * 100 : 0;

    return (
      <div className="audio-recorder-progress">
        <div className="audio-recorder-progress-bar">
          {/* 已录制的分段 */}
          {segmentPositions.map((position, index) => (
            <div
              key={index}
              className="audio-recorder-progress-segment"
              style={{
                width: `${position.segmentProgress}%`,
                left: `${position.startPosition}%`,
              }}
            />
          ))}
          {/* 当前正在录制的分段 */}
          {isRecording && (
            <div
              className="audio-recorder-progress-current"
              style={{
                width: `${currentProgress}%`,
                left: `${currentStartPosition}%`,
              }}
            />
          )}
        </div>
        <div className="audio-recorder-duration">
          <span>{totalDuration + currentDuration}秒</span>
          <span>/</span>
          <span>{maxDuration}秒</span>
        </div>
      </div>
    );
  };

  // 渲染操作按钮
  const renderActionButtons = () => {
    const hasData = segments.length > 0 || isRecording;

    return (
      <div className="audio-recorder-actions">
        <Button
          type="default"
          icon={<CloseOutlined />}
          onClick={clearSegments}
          disabled={!hasData}
        >
          取消录音
        </Button>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={() => mergeSegments()}
          disabled={!hasData}
        >
          完成录音
        </Button>
      </div>
    );
  };

  // 渲染录音组件内容
  const renderRecorderContent = () => {
    return (
      <div className="audio-recorder-container">
        <h3>录音组件</h3>
        
        {/* 权限引导（仅在权限被拒绝时显示） */}
        {renderPermissionGuide()}
        
        {renderRecordButton()}
        {renderProgressBar()}
        {renderActionButtons()}
        {audioUrl && (
          <div style={{ marginTop: 16 }}>
            <audio controls src={audioUrl} style={{ width: '100%' }} />
          </div>
        )}
      </div>
    );
  };

  // 如果是弹框模式，渲染弹框
  if (modalMode) {
    // 关闭弹框时重置状态
    const handleCloseModal = () => {
      setIsModalVisible(false);
    };

    // 弹框完全关闭后重置状态（动画结束后）
    const handleAfterClose = () => {
      resetRecorder(); // 在弹框完全关闭后重置状态
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
          afterClose={handleAfterClose}  // 弹框关闭动画结束后调用
          footer={null}
          destroyOnClose={true}
        >
          {renderRecorderContent()}
        </Modal>
      </>
    );
  }

  // 否则，直接渲染组件
  return renderRecorderContent();
};

export default AudioRecorder;