# AudioRecorder 录音组件

## 📁 文件结构

```
AudioRecorder06/
├── useAudioRecorder.ts          # 核心录音功能 Hook（可复用）
├── AudioRecorder.tsx            # 原始样式录音组件
├── AudioRecorderMinimal.tsx     # 极简样式录音组件（示例）
├── index.less                   # 原始样式
├── AudioRecorderMinimal.less    # 极简样式
├── AudioRecorderExample.tsx     # 使用示例
└── README.md                    # 本文档
```

## 🎯 核心设计思想

通过 **Hook 模式** 将录音功能逻辑与 UI 展示完全分离：

- **`useAudioRecorder` Hook**: 封装所有录音功能逻辑（权限管理、录音控制、分段录音等）
- **UI 组件**: 只负责样式展示，通过调用 Hook 实现功能

### ✨ 优势

1. **功能完全复用** - 所有录音逻辑只需维护一处
2. **样式灵活定制** - 可以创建任意样式的录音组件
3. **易于维护** - 功能更新只需修改 Hook，所有 UI 组件自动获得新功能
4. **TypeScript 支持** - 完整的类型定义

## 📦 使用方法

### 方式一：使用现有组件

```tsx
import AudioRecorder from '@/pages/AudioRecorder06/AudioRecorder';
import AudioRecorderMinimal from '@/pages/AudioRecorder06/AudioRecorderMinimal';

// 使用原始样式
<AudioRecorder
  maxDuration={60}
  onFinish={(filePath, audioBlob) => {
    console.log('录音完成:', filePath);
  }}
  onCancel={() => console.log('取消录音')}
/>

// 使用极简样式
<AudioRecorderMinimal
  maxDuration={60}
  onFinish={(filePath, audioBlob) => {
    console.log('录音完成:', filePath);
  }}
  modalMode={true}  // 弹框模式
/>
```

### 方式二：创建自定义样式组件

创建你自己的录音组件样式，复用所有功能：

```tsx
import React from 'react';
import { useAudioRecorder } from './useAudioRecorder';
import './MyCustomRecorder.less';

const MyCustomRecorder: React.FC = () => {
  // 使用 Hook 获取所有录音功能
  const {
    isRecording,
    currentDuration,
    totalDuration,
    startRecording,
    stopRecording,
    mergeSegments,
    clearSegments,
    maxDuration,
  } = useAudioRecorder({
    maxDuration: 60,
    onFinish: (filePath, audioBlob) => {
      console.log('录音完成');
    },
  });

  // 自定义你的 UI
  return (
    <div className="my-custom-recorder">
      <button onClick={startRecording}>开始</button>
      <button onClick={stopRecording}>停止</button>
      <div>{currentDuration}秒 / {maxDuration}秒</div>
      <button onClick={() => mergeSegments()}>完成</button>
      <button onClick={clearSegments}>取消</button>
    </div>
  );
};
```

## 🎨 创建新样式的步骤

### 1. 创建新的组件文件

```tsx
// AudioRecorderYourStyle.tsx
import React from 'react';
import { useAudioRecorder } from './useAudioRecorder';

const AudioRecorderYourStyle: React.FC<Props> = (props) => {
  const recorder = useAudioRecorder(props);
  
  // 实现你的 UI
  return <div>你的自定义样式</div>;
};

export default AudioRecorderYourStyle;
```

### 2. 创建样式文件

```less
// AudioRecorderYourStyle.less
.your-custom-recorder {
  // 你的自定义样式
}
```

### 3. 使用新组件

```tsx
import AudioRecorderYourStyle from './AudioRecorderYourStyle';

<AudioRecorderYourStyle
  maxDuration={60}
  onFinish={handleFinish}
/>
```

## 🔧 useAudioRecorder API

### 参数 (UseAudioRecorderOptions)

```typescript
interface UseAudioRecorderOptions {
  maxDuration?: number;              // 最大录音时长（秒），默认60
  onFinish?: (filePath: string, audioBlob: Blob) => void;  // 录音完成回调
  onCancel?: () => void;             // 取消录音回调
  autoRequestPermission?: boolean;   // 是否自动请求麦克风权限
}
```

### 返回值 (UseAudioRecorderReturn)

#### 状态
- `isRecording`: boolean - 是否正在录音
- `segments`: AudioSegment[] - 录音分段数组
- `currentDuration`: number - 当前录音时长（秒）
- `totalDuration`: number - 总录音时长（秒）
- `permissionGranted`: boolean | null - 麦克风权限状态
- `showPermissionGuide`: boolean - 是否显示权限引导
- `platformInfo`: string - 平台信息
- `isMaxDurationReached`: boolean - 是否达到最大时长
- `audioUrl`: string | null - 音频预览 URL

#### Refs（用于长按录音）
- `touchActiveRef` - 触摸激活状态
- `touchStartTimeRef` - 触摸开始时间
- `isRecordingRef` - 录音状态引用
- `longPressTimerRef` - 长按定时器引用

#### 方法
- `startRecording()` - 开始录音
- `stopRecording()` - 停止录音
- `mergeSegments(segments?)` - 合并录音片段
- `clearSegments()` - 清空录音数据
- `resetRecorder()` - 重置录音器
- `requestMicrophonePermission()` - 请求麦克风权限
- `checkMicrophonePermission()` - 检查麦克风权限
- `detectPlatform()` - 检测操作系统平台
- `detectBrowser()` - 检测浏览器类型

#### 常量
- `LONG_PRESS_THRESHOLD`: 300 - 长按阈值（毫秒）
- `maxDuration` - 最大录音时长

## 📝 组件 Props

### AudioRecorder / AudioRecorderMinimal

```typescript
interface AudioRecorderProps {
  maxDuration?: number;           // 最大录音时长，默认60秒
  onFinish?: (filePath: string, audioBlob: Blob) => void;  // 录音完成回调
  onCancel?: () => void;          // 取消录音回调
  modalMode?: boolean;            // 是否为弹框模式，默认false
  triggerButton?: React.ReactNode; // 弹框模式下的触发按钮
}
```

## 🎯 功能特性

### 已实现的功能（Hook 中）

✅ 麦克风权限管理  
✅ 多平台、多浏览器支持  
✅ 分段录音（暂停继续）  
✅ 最大时长限制  
✅ 长按录音（移动端）  
✅ 点击录音（桌面端）  
✅ 音频格式自动适配  
✅ 录音数据导出（Blob/URL）  
✅ 权限引导提示  
✅ 完整的错误处理  

### UI 样式对比

| 特性 | AudioRecorder | AudioRecorderMinimal |
|------|---------------|---------------------|
| 按钮样式 | 标准圆形按钮 | 渐变光晕效果 |
| 进度显示 | 横向进度条 | 圆形进度环 |
| 操作按钮 | 标准按钮 | 文字按钮+圆角 |
| 视觉风格 | 常规 | 极简现代 |
| 动画效果 | 基础脉冲 | 光晕+缩放 |

## 🌟 示例代码

查看 `AudioRecorderExample.tsx` 文件，其中包含了多种使用场景的完整示例。

## 💡 扩展建议

你可以基于 `useAudioRecorder` Hook 创建更多样式：

1. **卡片式录音器** - 卡片布局，适合嵌入其他页面
2. **悬浮球录音器** - 悬浮按钮，不占用页面空间
3. **波形可视化录音器** - 实时显示音频波形
4. **主题切换录音器** - 支持深色/浅色主题
5. **移动端优化版本** - 专门针对移动端优化的手势交互

## 📱 移动端支持

- ✅ 支持长按录音（300ms 阈值）
- ✅ 防止误触（轻触不触发）
- ✅ 触摸反馈优化
- ✅ 手势滑出停止
- ✅ 禁用长按菜单
- ✅ 响应式布局

## 🔒 权限处理

自动检测和处理以下情况：
- 权限未授予 → 引导用户授权
- 权限被拒绝 → 显示详细的开启步骤
- 浏览器不支持 → 提示升级浏览器
- HTTPS 要求 → 提示协议问题

## 🐛 故障排查

### 录音功能不工作？

1. 检查是否使用 HTTPS 或 localhost
2. 检查浏览器是否支持 MediaRecorder API
3. 检查麦克风权限是否授予
4. 查看浏览器控制台错误信息

### 移动端长按无响应？

1. 确保设置了 `touch-action: manipulation`
2. 检查是否有其他元素遮挡按钮
3. 查看是否正确处理了 touch 事件

## 📄 License

MIT
