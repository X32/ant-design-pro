// 全局类型声明

interface Window {
  AudioContext: typeof AudioContext;
  webkitAudioContext: typeof AudioContext;
}

// MediaRecorder API 类型声明
declare class MediaRecorder {
  constructor(stream: MediaStream, options?: MediaRecorderOptions);
  readonly mimeType: string;
  readonly state: 'inactive' | 'recording' | 'paused';
  readonly stream: MediaStream;
  ignoreMutedMedia: boolean;
  videoBitsPerSecond: number;
  audioBitsPerSecond: number;

  start(timeslice?: number): void;
  stop(): void;
  pause(): void;
  resume(): void;
  requestData(): void;

  onstart: (event: Event) => void;
  onstop: (event: Event) => void;
  onpause: (event: Event) => void;
  onresume: (event: Event) => void;
  ondataavailable: (event: BlobEvent) => void;
  onerror: (event: ErrorEvent) => void;

  static isTypeSupported(type: string): boolean;
  static getSupportedMimeTypes(): string[];
}

declare interface MediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  bitsPerSecond?: number;
}

declare interface BlobEvent extends Event {
  readonly data: Blob;
}

// 扩展 Navigator 接口以支持媒体设备访问
declare interface Navigator {
  mediaDevices: MediaDevices;
}

declare interface MediaDevices {
  getUserMedia(constraints: MediaStreamConstraints): Promise<MediaStream>;
  getDisplayMedia(constraints?: MediaStreamConstraints): Promise<MediaStream>;
  enumerateDevices(): Promise<MediaDeviceInfo[]>;
  getSupportedConstraints(): MediaTrackSupportedConstraints;
}

declare interface MediaStreamConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

declare interface MediaTrackConstraints {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  channelCount?: number;
  sampleRate?: number;
  sampleSize?: number;
  volume?: number;
}

declare interface MediaStream {
  getTracks(): MediaStreamTrack[];
  getAudioTracks(): MediaStreamTrack[];
  getVideoTracks(): MediaStreamTrack[];
  addTrack(track: MediaStreamTrack): void;
  removeTrack(track: MediaStreamTrack): void;
  clone(): MediaStream;
  readonly active: boolean;
  onactive: (event: Event) => void;
 oninactive: (event: Event) => void;
}

declare interface MediaStreamTrack {
  readonly kind: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly muted: boolean;
  readonly readyState: 'live' | 'ended';
  readonly remote: boolean;

  stop(): void;
  applyConstraints(constraints?: MediaTrackConstraints): Promise<void>;
  getConstraints(): MediaTrackConstraints;
  getSettings(): MediaTrackSettings;
  getCapabilities(): MediaTrackCapabilities;

  onstarted: (event: Event) => void;
  onended: (event: Event) => void;
  onmute: (event: Event) => void;
  onunmute: (event: Event) => void;
  onoverconstrained: (event: Event) => void;
}

declare interface MediaDeviceInfo {
  readonly deviceId: string;
  readonly groupId: string;
  readonly kind: 'audioinput' | 'audiooutput' | 'videoinput';
  readonly label: string;
}

declare interface MediaTrackSupportedConstraints {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  channelCount?: boolean;
  sampleRate?: boolean;
  sampleSize?: boolean;
  volume?: boolean;
}

declare interface MediaTrackSettings {
  echoCancellation?: boolean;
  noiseSuppression?: boolean;
  autoGainControl?: boolean;
  channelCount?: number;
  sampleRate?: number;
  sampleSize?: number;
  volume?: number;
}

declare interface MediaTrackCapabilities {
  echoCancellation?: boolean[];
  noiseSuppression?: boolean[];
  autoGainControl?: boolean[];
  channelCount?: number[];
  sampleRate?: number[];
  sampleSize?: number[];
  volume?: number[];
}