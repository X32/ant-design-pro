// 导出录音组件
export { default as AudioRecorder } from './AudioRecorder';
export { default as AudioRecorderMinimal } from './AudioRecorderMinimal';
export { default as AudioRecorderInline } from './AudioRecorderInline';
export { default as Example } from './Example';

// 导出 Hook
export { useAudioRecorder } from './useAudioRecorder';
export type { 
  UseAudioRecorderOptions, 
  UseAudioRecorderReturn, 
  AudioSegment 
} from './useAudioRecorder';
