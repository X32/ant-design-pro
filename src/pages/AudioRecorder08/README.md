# AudioRecorder08 前端录音组件

一个功能完善的React录音组件，专为移动端优化，支持长按录音、分段录制、进度可视化等特性。

## 功能特性

### 1. 🎤 录音交互
- 长按录音按钮开始录音，松手自动暂停
- 完美适配移动端触摸操作和PC端鼠标操作
- 录音时按钮会有动态脉冲效果提示

### 2. 🎼 分段录制
- 支持多次长按-松手的分段录音
- 自动保存每段录音数据
- 通过进度条彩色分段直观展示各段录音

### 3. 📊 进度可视化
- 录音时显示实时进度条
- 同步展示当前录音时长和最大录音时长
- 进度条随录音时长线性增长
- 当前录音段显示红色，历史录音段显示蓝色

### 4. ⚙️ 配置灵活性
- 支持自定义最大录音时长（默认60秒）
- 超出最大时长自动停止录音并给出提示
- 两种使用模式：直接嵌入模式和弹框模式

### 5. 🎮 操作控件
- **取消录音**：清空所有分段数据，重置组件状态
- **完成录音**：自动合并所有分段，生成完整录音文件
- 按钮状态根据录音智能启用/禁用

### 6. 💬 提示消息
- 权限拒绝提示
- 录音完成提示
- 取消录音提示
- 达到最大时长提示
- 所有提示1秒后自动消失

## 安装和使用

### 直接使用

```tsx
import AudioRecorder from './index';

// 嵌入模式
<AudioRecorder
  maxDuration={120}
  title="我的录音"
  onFinish={(blob, segments) => {
    console.log('合并后的录音文件:', blob);
    console.log('录音分段:', segments);
  }}
/>

// 弹框模式
<AudioRecorder
  modalMode={true}
  maxDuration={60}
  title="弹框录音"
  onFinish={(blob) => {
    // 处理录音文件
  }}
/>
```

### 使用示例页面

```tsx
import AudioRecorderDemo from './demo';

<AudioRecorderDemo />
```

## API

### Props

| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| maxDuration | number | 60 | 最大录音时长，单位：秒 |
| modalMode | boolean | false | 是否启用弹框模式 |
| title | string | '录音' | 组件标题或弹框标题 |
| onFinish | function | - | 录音完成回调函数，参数为合并后的Blob和分段数据数组 |

### 回调函数

```typescript
interface RecordingSegment {
  blob: Blob; // 该段录音的Blob数据
  duration: number; // 该段录音时长（秒）
  startTime: number; // 该段录音开始时间戳
}

onFinish?: (mergedBlob: Blob, segments: RecordingSegment[]) => void;
```

## 技术实现

### 核心技术
- 使用浏览器原生 `MediaRecorder API` 实现录音功能
- 使用 `React Hooks` 进行状态管理
- Ant Design 组件库提供UI支持
- Less CSS 进行样式定制

### 浏览器兼容性
- Chrome 49+
- Firefox 25+
- Safari 14.1+
- Edge 79+

### 注意事项
1. 需要HTTPS环境才能正常使用麦克风权限
2. 首次使用需要用户授权麦克风权限
3. 录音格式为 WebM，可根据需要转换格式

## 二次开发

### 目录结构
```
AudioRecorder08/
├── index.tsx          # 主组件文件
├── index.less         # 组件样式
├── demo.tsx           # 使用示例
├── demo.less          # 示例样式
└── README.md          # 说明文档
```

### 自定义样式
可以通过修改 `index.less` 文件来定制组件外观：
- 修改按钮大小、颜色和动画
- 调整进度条样式
- 适配特定移动端UI设计

### 扩展功能
可以轻松扩展以下功能：
1. 添加音频播放功能，支持试听每段录音
2. 添加删除指定分段的功能
3. 支持导出不同格式的音频文件
4. 添加录音波形可视化
5. 支持上传录音文件到服务器

## License

MIT
