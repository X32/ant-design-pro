# 音频录音组件 (AudioRecorder)

一个功能完整的前端音频录音组件，支持分段录制、进度可视化、移动端适配等功能。

## 功能特性

### 1. 录音交互
- 长按录音按钮开始录音
- 松手自动暂停录音
- 完全适配移动端触摸操作

### 2. 分段录制
- 支持多次长按-松手的分段录音
- 自动保存每段录音数据
- 以进度条长度分割的方式显示所有分段

### 3. 进度可视化
- 录音时显示实时进度条
- 同步展示当前录音时长、最大录音时长和总时长
- 进度条随录音时长线性增长

### 4. 配置灵活性
- 支持自定义最大录音时长（默认 60 秒）
- 超出最大时长自动停止录音并提示

### 5. 操作控件功能
- **取消录音**：清空所有分段数据
- **完成录音**：合并所有分段，返回完整录音文件路径
- 按钮状态随录音状态动态禁用/启用

### 6. 提示消息
- 录音完成、取消、权限拒绝时显示浮动提示
- 提示消息 1 秒后自动消失

### 7. 使用模式
- **内联模式**：直接嵌入页面作为独立组件使用
- **弹框模式**：通过触发按钮打开弹框使用

## 技术实现

### 核心技术
- **React 16+**：组件化开发
- **TypeScript**：类型安全
- **Ant Design**：UI 组件库
- **Web Audio API**：音频处理
- **MediaRecorder API**：音频录制

### 音频格式
- 录制格式：`audio/webm`
- 输出格式：`audio/wav`（合并后）

### 音频处理
- 回声消除 (echoCancellation)
- 噪声抑制 (noiseSuppression)
- 自动增益控制 (autoGainControl)

## 安装和使用

### 1. 导入组件

```typescript
import AudioRecorder from './AudioRecorder01';
```

### 2. 内联模式使用

```typescript
import React from 'react';
import AudioRecorder from './AudioRecorder01';

const MyPage: React.FC = () => {
  // 处理录音完成
  const handleComplete = (filePath: string) => {
    console.log('录音完成，文件路径：', filePath);
    // 这里可以进行上传或其他操作
  };

  return (
    <div>
      <h1>我的页面</h1>
      
      {/* 内联模式录音组件 */}
      <AudioRecorder
        maxDuration={120} // 最大录音时长 120 秒
        mode="inline"
        onComplete={handleComplete}
      />
    </div>
  );
};

export default MyPage;
```

### 3. 弹框模式使用

```typescript
import React, { useState } from 'react';
import { Button } from 'antd';
import AudioRecorder from './AudioRecorder01';

const MyPage: React.FC = () => {
  const [recorderVisible, setRecorderVisible] = useState(false);

  // 打开录音弹框
  const openRecorder = () => {
    setRecorderVisible(true);
  };

  // 关闭录音弹框
  const closeRecorder = () => {
    setRecorderVisible(false);
  };

  // 处理录音完成
  const handleComplete = (filePath: string) => {
    console.log('录音完成，文件路径：', filePath);
    closeRecorder();
    // 这里可以进行上传或其他操作
  };

  return (
    <div>
      <h1>我的页面</h1>
      
      {/* 打开录音弹框的按钮 */}
      <Button type="primary" onClick={openRecorder}>
        开始录音
      </Button>

      {/* 弹框模式录音组件 */}
      <AudioRecorder
        maxDuration={60} // 最大录音时长 60 秒（默认值）
        visible={recorderVisible}
        mode="modal"
        onCancel={closeRecorder}
        onComplete={handleComplete}
      />
    </div>
  );
};

export default MyPage;
```

## API 文档

### AudioRecorderProps

| 属性名 | 类型 | 默认值 | 描述 |
|--------|------|--------|------|
| maxDuration | number | 60 | 最大录音时长（秒） |
| visible | boolean | false | 控制弹框显示（仅弹框模式有效） |
| onCancel | () => void | - | 取消回调（仅弹框模式有效） |
| onComplete | (filePath: string) => void | - | 完成回调，返回合并后的录音文件路径 |
| mode | 'inline' \| 'modal' | 'inline' | 组件模式：内联或弹框 |

## 浏览器兼容性

| 浏览器 | 版本 | 支持情况 |
|--------|------|----------|
| Chrome | 49+ | ✅ 支持 |
| Firefox | 25+ | ✅ 支持 |
| Safari | 14+ | ✅ 支持 |
| Edge | 79+ | ✅ 支持 |

## 注意事项

1. **权限要求**：使用录音功能需要用户授权麦克风访问权限
2. **HTTPS 要求**：在生产环境中使用录音功能需要 HTTPS 协议
3. **音频格式**：合并后的音频文件格式为 WAV，支持大多数播放器
4. **资源清理**：组件会自动清理录音资源，但建议在页面卸载时确保资源已释放

## 二次开发

### 目录结构

```
AudioRecorder01/
├── index.tsx      # 组件主文件
├── style.less      # 组件样式
└── README.md       # 组件文档
```

### 主要功能模块

1. **录音控制**：`startRecording()` 和 `stopRecording()` 函数
2. **分段管理**：`segments` 状态和相关操作
3. **进度计算**：`currentDuration` 和 `totalDuration` 计算
4. **音频合并**：`mergeSegments()` 和 `encodeAudioBufferToWav()` 函数
5. **UI 渲染**：`renderInline()` 和 `renderModal()` 函数

### 自定义样式

可以通过修改 `style.less` 文件来自定义组件的外观。主要样式类包括：
- `.audio-recorder`：组件容器
- `.audio-controls`：控制按钮容器
- `.record-button`：录音按钮
- `.cancel-button`：取消按钮
- `.complete-button`：完成按钮
- `.audio-progress`：进度条
- `.audio-segments-container`：分段容器
- `.audio-segment`：分段元素
- `.audio-duration`：时长显示

## 许可证

MIT License