# SpokenPractice WebSocket 消息处理文档

## 概述

`SpokenPractice.tsx` 页面通过 WebSocket 与后端进行实时双向通信，实现 AI 口语练习功能。本文档详细说明 WebSocket 的连接流程、消息格式和处理逻辑。

---

## 1. WebSocket 连接流程

### 1.1 连接初始化

```typescript
connectWebSocket(realConversationId: number)
```

**连接参数：**
| 参数 | 来源 | 说明 |
|------|------|------|
| `userId` | 全局状态 | 用户 ID |
| `realConversationId` | 数据库 | 真实会话 ID |
| `token` | localStorage | JWT 认证令牌 |
| `workflowType` | URL 参数 | 工作流类型（如 `fce_part1`） |
| `paperId` | URL 参数 | 试卷 ID |

**默认值：**
- `workflowType` 默认: `'fce_part1'`
- `paperId` 默认: `25`

### 1.2 连接事件监听

| 事件名 | 触发时机 | 处理逻辑 |
|--------|----------|----------|
| `auth_success` | 认证成功 | 设置 `isConnected=true`, `isAuthenticated=true` |
| `auth_failed` | 认证失败 | 清空消息列表，1秒后刷新页面 |
| `auth_timeout` | 认证超时 | 清空消息列表，1秒后刷新页面 |
| `disconnect` | 连接断开 | 清空消息列表，500ms后刷新页面 |
| `retrying` | 重试连接中 | 更新重试状态 UI |
| `max_retries_reached` | 达到最大重试次数 | 显示重试按钮 |

---

## 2. 消息数据类型定义

### 2.1 WebSocket 消息数据结构

```typescript
interface WebSocketMessageData {
  type?: string;           // 消息类型
  content: any;            // 消息内容（文本或对象）
  timestamp?: number;      // 时间戳
  round_num?: number;      // 轮次号
  audio_url?: string;      // AI 音频 URL
  audio_cached?: boolean;  // 音频是否缓存
  score?: string;          // 评分（仅 score 类型）
  origin_message_id?: string; // 关联的原始消息 ID（仅 grammar_feedback）
}
```

### 2.2 前端 Message 数据结构

```typescript
interface Message {
  id: string;              // 消息 ID（字符串类型，单调递增）
  content: string | ScoreContent | GrammarFeedbackContent; // 消息内容
  sender: 'user' | 'ai';   // 发送者角色
  timestamp: string;       // 显示时间（HH:mm）
  fullTimestamp?: Date;    // 完整时间戳
  audioFilePath?: string;  // 用户音频本地 Blob URL
  serverAudioPath?: string; // 服务器音频路径
  messageType?: 'text' | 'voice' | 'image' | 'score' | 'grammar_feedback' | 'finish';
  transcriptionText?: string;      // 语音转写文本
  transcriptionStatus?: 'pending' | 'processing' | 'done' | 'failed';
  audioUrl?: string;       // AI 消息音频 URL
  audioLoaded?: boolean;   // 音频是否已加载
  roundNum?: number;       // 轮次号
  imageUrl?: string;       // 图片 URL
  score?: string;          // 总分
  grammarFeedback?: GrammarFeedbackContent; // 语法反馈内容
  grammarFeedbackStatus?: 'pending' | 'received';
  originMessageId?: number; // 原始消息 ID
}
```

---

## 3. 消息类型与处理逻辑

### 3.1 接收消息类型（服务端 → 客户端）

| type | 说明 | 处理函数 | 是否缓存 |
|------|------|----------|----------|
| `finish` | 对话结束 | `handleFinishMessage()` | 特殊处理 |
| `image_url` | 图片消息 | `handleImageMessage()` | ✅ |
| `score` | 评分消息 | `handleScoreMessage()` | ✅ |
| `grammar_feedback` | 语法反馈 | `handleGrammarFeedbackMessage()` | 更新关联消息 |
| `loading` | 加载提示 | `handleLoadingMessage()` | ❌ 仅显示 |
| 默认（无 type） | 普通 AI 回复 | `handleTextAudioMessage()` | ✅ |

### 3.2 发送消息类型（客户端 → 服务端）

| type | 说明 | 发送时机 |
|------|------|----------|
| `answer` | 用户回答 | 文本输入发送 / 语音转写完成 |

---

## 4. 详细消息处理流程

### 4.1 🏁 finish 消息 - 对话结束

```typescript
// 接收数据格式
{
  type: 'finish'
}
```

**处理流程：**
1. 批量保存缓存消息到数据库
2. 清空消息缓存 `messageCacheRef.current = []`
3. 处理对话结束扣款
4. 设置 `conversationFinished = true`
5. 触发烟花动画
6. 移除 disconnect 事件监听器
7. 断开 WebSocket 连接
8. 插入结束消息到消息列表

---

### 4.2 🖼️ image_url 消息 - 图片消息

```typescript
// 接收数据格式
{
  type: 'image_url',
  content: 'https://...',  // 图片 URL
  round_num: number
}
```

**处理流程：**
1. 创建 `messageType: 'image'` 的消息
2. 设置 `imageUrl` 字段
3. 添加到消息列表 + 缓存

---

### 4.3 📊 score 消息 - 评分消息

```typescript
// 接收数据格式
{
  type: 'score',
  content: string,  // 评分详情文本
  score: string,    // 总分
  round_num: number
}
```

**评分内容解析（`parseScoreContent`）：**

```typescript
interface ScoreContent {
  rawText: string;         // 原始文本
  dimensionScores?: string; // 维度分数（第一行）
  totalScore?: string;      // 总分行
  advantages?: string;      // 优势部分
  disadvantages?: string;   // 不足部分
  suggestions?: string;     // 改进建议
  improvedAnswer?: string;  // 改进的回答
}
```

**文本解析规则：**
- 第一行 → `dimensionScores`
- `总分：` 开头 → `totalScore`
- `详细评价：` 后内容 → 详细评价区域
- `优势：` 后内容 → `advantages`
- `不足：` 后内容 → `disadvantages`
- `改进建议：` 后内容 → `suggestions`
- `改进的回答：` 后内容 → `improvedAnswer`

---

### 4.4 📝 grammar_feedback 消息 - 语法反馈

```typescript
// 接收数据格式
{
  type: 'grammar_feedback',
  content: GrammarFeedbackContent | string,  // JSON 或字符串
  origin_message_id: string,  // 关联的用户消息 ID
  round_num: number
}
```

**语法反馈内容结构：**

```typescript
interface GrammarFeedbackContent {
  errors: Array<{
    type: string;           // 错误类型
    original: string;       // 错误片段
    corrected: string;      // 修正后
    explanation: string;    // 错误说明
    severity: 'critical' | 'minor';
    a2_criterion?: string;  // A2 评分维度
    b1_criterion?: string;  // B1 评分维度
    b2_criterion?: string;  // B2 评分维度
  }>;
  improved_version: string;     // 改进后的完整句子
  suggestions: string[];        // 学习建议（3条）
  overall_quality: 'excellent' | 'good' | 'fair' | 'poor';
  a2_assessment?: { grammar_structure, vocabulary, coherence };
  b1_assessment?: { grammar_structure, vocabulary, coherence };
  b2_assessment?: { grammar_structure, vocabulary, coherence };
  relevance_score: number;      // 0.0-1.0
  relevance_level: 'on_topic' | 'partially_on_topic' | 'off_topic';
  relevance_reason: string;
}
```

**处理流程：**
1. 解析 content（支持 JSON 字符串或对象）
2. 根据 `origin_message_id` 找到关联的用户消息
3. 更新用户消息的 `grammarFeedback` 和 `grammarFeedbackStatus`
4. 同步更新缓存

---

### 4.5 🔄 loading 消息 - 加载提示

```typescript
// 接收数据格式
{
  type: 'loading',
  content: string  // 提示文本，如 "正在分析您的答案，请稍后..."
}
```

**处理逻辑：**
- 仅添加到消息列表显示
- **不缓存**，不保存到数据库

---

### 4.6 💬 默认消息 - 普通 AI 回复

```typescript
// 接收数据格式
{
  type: undefined,  // 或其他未定义类型
  content: string,  // AI 回复文本
  audio_url?: string,  // AI 音频路径（相对路径）
  round_num: number
}
```

**处理流程：**
1. 构建完整音频 URL: `${AI_AUDIO_BASE_URL}${audio_url}`
2. 创建 AI 消息并添加到列表 + 缓存
3. 如果有音频 URL，预加载并自动播放

---

## 5. 发送消息流程

### 5.1 文本消息发送

```typescript
socket.send(JSON.stringify({
  type: 'answer',
  conversation_id: conversationId,
  content: currentInputValue,
  round_num: currentRoundNum,
  origin_message_id: nextMessageId
}));
```

**发送流程：**
1. 检查对话是否已结束
2. 首次发送时检查余额
3. 创建用户消息并添加到列表 + 缓存
4. 清空输入框
5. 通过 WebSocket 发送

### 5.2 语音消息发送

```typescript
socket.send(JSON.stringify({
  type: 'answer',
  conversation_id: conversationId,
  content: transcriptionText,  // 语音转写文本
  round_num: 1,
  origin_message_id: newMessageId
}));
```

**发送流程：**
1. 上传音频文件到服务器
2. 轮询获取转写状态
3. 转写成功后，将文本通过 WebSocket 发送
4. 更新消息的 `transcriptionText` 和 `transcriptionStatus`

---

## 6. 消息缓存机制

### 6.1 缓存目的
- 对话过程中消息暂存于前端
- 对话结束时批量保存到数据库
- 减少数据库写入次数

### 6.2 缓存操作

```typescript
// 添加到缓存
messageCacheRef.current.push(message);

// 更新缓存中的消息
messageCacheRef.current = messageCacheRef.current.map(msg =>
  msg.id === targetId ? { ...msg, ...updates } : msg
);

// 批量保存（对话结束时）
await batchSaveMessages(realConversationId, messageCacheRef.current);
messageCacheRef.current = [];  // 清空缓存
```

---

## 7. 消息处理流程图

```
┌─────────────────────────────────────────────────────────────────┐
│                     WebSocket 消息处理流程                        │
└─────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │ 接收消息事件  │
                              │ receive_msg  │
                              └──────┬───────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ processWebSocketMessage│
                         │   解析 data.type       │
                         └───────────┬───────────┘
                                     │
         ┌──────────────┬────────────┼────────────┬──────────────┐
         │              │            │            │              │
         ▼              ▼            ▼            ▼              ▼
    ┌─────────┐   ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌───────────┐
    │ finish  │   │image_url │ │  score  │ │grammar_    │ │  default  │
    │         │   │          │ │         │ │feedback    │ │ (text)    │
    └────┬────┘   └────┬─────┘ └────┬────┘ └─────┬──────┘ └─────┬─────┘
         │             │            │              │              │
         ▼             ▼            ▼              ▼              ▼
    ┌─────────┐   ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌───────────┐
    │保存缓存 │   │创建图片  │ │解析评分 │ │关联到用户  │ │创建AI消息 │
    │消息     │   │消息      │ │内容     │ │消息        │ │+音频播放  │
    ├─────────┤   ├──────────┤ ├─────────┤ ├────────────┤ ├───────────┤
    │扣款     │   │添加列表  │ │添加列表 │ │更新列表    │ │添加列表   │
    ├─────────┤   │+缓存     │ │+缓存    │ │+缓存       │ │+缓存      │
    │断开连接 │   └──────────┘ └─────────┘ └────────────┘ └───────────┘
    ├─────────┤
    │烟花动画 │                ┌──────────┐
    ├─────────┤                │ loading  │
    │插入结束 │                │ 仅显示   │
    │消息     │                │ 不缓存   │
    └─────────┘                └──────────┘
```

---

## 8. 状态管理

### 8.1 WebSocket 连接状态

```typescript
const [isConnected, setIsConnected] = useState(false);      // 连接状态
const [isAuthenticated, setIsAuthenticated] = useState(false); // 认证状态
const [socket, setSocket] = useState<any>(null);            // Socket 实例
const socketRef = useRef<any>(null);                        // Socket Ref（用于 cleanup）
```

### 8.2 重试状态

```typescript
const [retryStatus, setRetryStatus] = useState({
  isRetrying: boolean,
  attempt: number,
  maxRetries: number,      // 默认 5
  interval: number,
  maxRetriesReached: boolean
});
```

### 8.3 对话状态

```typescript
const [conversationFinished, setConversationFinished] = useState(false);
const messageCacheRef = useRef<Message[]>([]);  // 消息缓存
const realConversationIdRef = useRef<number>(0); // 真实会话 ID
```

---

## 9. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 认证失败 | 清空消息，1秒后刷新页面 |
| 认证超时 | 清空消息，1秒后刷新页面 |
| 连接断开 | 清空消息，500ms后刷新页面 |
| 消息发送失败 | console.error 记录错误 |
| 语法反馈缺少 origin_message_id | 丢弃消息，warn 日志 |
| 语法反馈关联消息未找到 | warn 日志，不更新 |

---

## 10. 相关文件

- WebSocket 服务封装: `src/services/WebSocket/websocket.ts`
- API 服务: `src/services/ant-design-pro/api.ts`
- 组件文件: `src/pages/spokenPages/SpokenPractice.tsx`
