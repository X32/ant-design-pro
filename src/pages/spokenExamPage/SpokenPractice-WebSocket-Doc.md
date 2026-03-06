# SpokenPractice WebSocket 消息处理文档

## 概述

`SpokenPractice.tsx` 页面是剑桥英语口语考试练习页面，通过 WebSocket 与后端进行实时双向通信，实现 AI 口语考试练习功能。本文档详细说明 WebSocket 的连接流程、消息格式、处理逻辑和渲染方式。

---

## 1. WebSocket 连接流程

### 1.1 连接初始化

```typescript
connectWebSocket(realConversationId: number)
```

**连接参数：**
| 参数 | 来源 | 说明 |
|------|------|------|
| `userId` | 用户信息/路由 | 用户 ID |
| `realConversationId` | 数据库 | 真实会话 ID |
| `token` | localStorage | JWT 认证令牌 |
| `workflowType` | URL 参数 | 工作流类型（如 `fce_part1`） |
| `paperId` | URL 参数 | 试卷 ID |
| `exerciseIds` | URL 参数 | 练习 ID 映射 |

### 1.2 连接事件监听

| 事件名 | 触发时机 | 处理逻辑 |
|--------|----------|----------|
| `auth_success` | 认证成功 | 设置 `isConnected=true`, `isAuthenticated=true`，重置重试状态 |
| `auth_failed` | 认证失败 | 清空消息列表，1秒后刷新页面 |
| `auth_timeout` | 认证超时 | 清空消息列表，1秒后刷新页面 |
| `disconnect` | 连接断开 | 清空消息列表，500ms后刷新页面 |
| `retrying` | 重试连接中 | 更新重试状态 UI |
| `maxRetriesReached` | 达到最大重试次数 | 显示重试按钮 |
| `receive_message` | 收到消息 | 调用 `processWebSocketMessage` 处理 |

---

## 2. 消息数据类型定义

### 2.1 WebSocket 消息数据结构

```typescript
interface WebSocketMessageData {
  type?: string;           // 消息类型
  content: any;            // 消息内容（文本或对象）
  timestamp?: number;      // 时间戳
  round_num?: number;      // 轮次号
  audio_url?: string;      // AI 音频 URL（相对路径）
  audio_cached?: boolean;  // 音频是否缓存
  score?: string;          // 评分（仅 score 类型）
  part_no?: number;        // 评分阶段号（Part 1, Part 2 等）
  total_parts?: number;    // 总阶段数
  origin_message_id?: string; // 关联的原始消息 ID（仅 grammar_feedback）
}
```

### 2.2 前端 Message 数据结构

```typescript
interface Message {
  id: string;           // 消息 ID（字符串类型，单调递增）
  content: string | ScoreContent | GrammarFeedbackContent | FinalScoreSummaryContent;
  sender: 'user' | 'ai';   // 发送者角色
  timestamp: string;       // 显示时间（HH:mm）
  fullTimestamp?: Date;    // 完整时间戳
  audioFilePath?: string;  // 用户音频本地 Blob URL
  serverAudioPath?: string; // 服务器音频路径
  messageType?: 'text' | 'voice' | 'image' | 'score' | 'grammar_feedback'
              | 'final_score_summary' | 'finish' | 'score_panel';
  transcriptionText?: string;      // 语音转写文本
  transcriptionStatus?: 'pending' | 'processing' | 'done' | 'failed';
  audioUrl?: string;       // AI 消息音频 URL
  audioLoaded?: boolean;   // 音频是否已加载
  roundNum?: number;       // 轮次号
  imageUrl?: string;       // 图片 URL
  score?: string;          // 总分
  partNo?: number;         // 评分阶段号
  totalParts?: number;     // 总阶段数
  scoreParts?: Message[];  // 多个评分消息（用于 score_panel 类型）
  grammarFeedback?: GrammarFeedbackContent; // 语法反馈内容
  grammarFeedbackStatus?: 'pending' | 'received';
  originMessageId?: string; // 原始消息 ID
}
```

### 2.3 专用内容类型

#### ScoreContent（评分内容）

```typescript
interface ScoreContent {
  rawText: string;              // 原始文本
  dimensionScores?: string;     // 维度分数（第一行）
  totalScore?: string;           // 总分行
  advantages?: string;           // 优势部分
  disadvantages?: string;        // 不足部分
  suggestions?: string;          // 改进建议
  improvedAnswer?: string;       // 改进的回答
}
```

#### GrammarFeedbackContent（语法反馈）

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

#### FinalScoreSummaryContent（总分汇总）

```typescript
interface FinalScoreSummaryContent {
  type: 'final_score_summary';
  content: string;              // 显示的文本内容
  timestamp: number;            // 时间戳
  part_scores: Record<string, number>; // 各 Part 得分，如 {"1": 18, "2": 22}
  total_score: number;          // 总分
}
```

---

## 3. 消息类型与处理逻辑

### 3.1 接收消息类型（服务端 → 客户端）

| type | 说明 | 处理函数 | 是否缓存 | 是否立即显示 |
|------|------|----------|----------|--------------|
| `finish` | 对话结束 | 直接处理 | 特殊处理 | ✅ |
| `final_score_summary` | 总分汇总 | `handleFinalScoreSummaryMessage()` | ✅ | ✅ |
| `image_url` | 图片消息 | `handleImageMessage()` | ✅ | ✅ |
| `score` | 评分消息 | `handleScoreMessage()` | ✅ | ⚠️ 等待所有 Part |
| `grammar_feedback` | 语法反馈 | `handleGrammarFeedbackMessage()` | 更新关联消息 | ❌ |
| 默认（无 type） | 普通 AI 回复 | `handleTextMessage()` / `handleAudioMessage()` | ✅ | ✅ |

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

### 4.2 🏆 final_score_summary 消息 - 总分汇总

```typescript
// 接收数据格式
{
  type: 'final_score_summary',
  content: string | FinalScoreSummaryContent,
  timestamp: number,
  part_scores: { "1": 18, "2": 22 },
  total_score: number
}
```

**处理流程：**
1. 解析 content（支持 JSON 字符串或对象）
2. 创建 `messageType: 'final_score_summary'` 的消息
3. 添加到消息列表 + 缓存

---

### 4.3 🖼️ image_url 消息 - 图片消息

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

### 4.4 📊 score 消息 - 评分消息（多 Part 机制）

```typescript
// 接收数据格式
{
  type: 'score',
  content: string,  // 评分详情文本
  score: string,    // 总分
  round_num: number,
  part_no: number,      // 🆕 评分阶段号
  total_parts: number   // 🆕 总阶段数
}
```

**评分内容解析（`parseScoreContent`）：**

```
语法与词汇：4分 | 话语管理：4分 | 发音：4分 | 互动交流：4分
总分：4.0分（A2水平达标：是）

详细评价：
优势：
- 内容...

不足：
- 内容...

改进建议：
- 内容...
```

**文本解析规则：**
- 第一行 → `dimensionScores`
- `总分：` 开头 → `totalScore`
- `详细评价：` 后 → 详细评价区域
- `优势：` 后内容 → `advantages`
- `不足：` 后内容 → `disadvantages`
- `改进建议：` 后内容 → `suggestions`
- `改进的回答：` 后内容 → `improvedAnswer`

**多 Part 处理机制：**
1. 收到第一个 score 消息时，设置 `expectedTotalParts`
2. 每个 score 消息按 `part_no` 缓存到 `scoreMessagesCache`
3. 当收到的消息数量 = `total_parts` 时：
   - 按 `part_no` 排序
   - 创建 `messageType: 'score_panel'` 的面板消息
   - 面板消息包含所有评分消息 `scoreParts`
   - 显示面板消息

```typescript
// 评分面板消息结构
{
  id: `panel_${messageId}`,
  messageType: 'score_panel',
  scoreParts: [scoreMessage1, scoreMessage2, ...],
  totalParts: number
}
```

---

### 4.5 📝 grammar_feedback 消息 - 语法反馈

```typescript
// 接收数据格式
{
  type: 'grammar_feedback',
  content: GrammarFeedbackContent | string,  // JSON 或字符串
  origin_message_id: string,  // 关联的用户消息 ID
  round_num: number
}
```

**处理流程：**
1. 解析 content（支持 JSON 字符串或对象）
2. 根据 `origin_message_id` 找到关联的用户消息
3. 更新用户消息的 `grammarFeedback` 和 `grammarFeedbackStatus`
4. 同步更新缓存

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
1. 如果有 `audio_url`：
   - 构建完整音频 URL: `${AI_AUDIO_BASE_URL}${audio_url}`
   - 调用 `handleAudioMessage()`
   - 预加载并自动播放音频
2. 如果没有 `audio_url`：
   - 调用 `handleTextMessage()`
3. 创建 AI 消息并添加到列表 + 缓存

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

## 7. 消息渲染方式

### 7.1 消息类型与渲染组件

| messageType | 渲染组件 | 说明 |
|-------------|----------|------|
| `text` | 普通文本气泡 | 支持音频播放按钮 |
| `voice` | 语音气泡 | 显示转写文本、语法反馈提示 |
| `image` | 图片气泡 | 可点击放大预览 |
| `score` | ❌ 不直接渲染 | 缓存等待汇总 |
| `score_panel` | 评分面板 | 多 Part 评分汇总展示 |
| `grammar_feedback` | ❌ 不独立渲染 | 关联到用户消息显示 |
| `final_score_summary` | 总分汇总卡片 | 显示各 Part 得分和总分 |
| `finish` | 结束消息 | 显示完成提示 |

### 7.2 评分面板渲染（score_panel）

```tsx
// 评分面板组件结构
<View className="score-panel">
  {scoreParts.map((part, index) => (
    <ScoreCard
      key={part.id}
      partNo={part.partNo}
      score={part.score}
      content={part.content}
    />
  ))}
</View>
```

### 7.3 语法反馈渲染

语法反馈关联到用户语音消息上，点击可展开详情：

```tsx
// 语音消息中的语法反馈提示
{msg.grammarFeedback && (
  <View className="grammar-feedback-hint">
    <Text>📝 收到语法反馈 ({msg.grammarFeedback.errors?.length}个问题)</Text>
    <Text>质量: {msg.grammarFeedback.overall_quality}</Text>
  </View>
)}
```

---

## 8. 消息处理流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WebSocket 消息处理流程                               │
└─────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │ 接收消息事件  │
                              │ receive_msg  │
                              └──────┬───────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │processWebSocketMessage │
                         │   解析 data.type       │
                         └───────────┬───────────┘
                                     │
     ┌──────────────┬────────────┼────────────┬──────────────┬──────────────┐
     │              │            │            │              │              │
     ▼              ▼            ▼            ▼              ▼              ▼
┌─────────┐  ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌───────────┐ ┌───────────┐
│ finish  │  │final_    │ │image_url │ │   score    │ │grammar_   │ │  默认     │
│         │  │score_    │ │         │ │           │ │feedback   │ │ (text/    │
│         │  │summary   │ │         │ │           │ │           │ │ audio)    │
└────┬────┘ └────┬─────┘ └────┬────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
     │           │            │            │              │              │
     ▼           ▼            ▼            ▼              ▼              ▼
┌─────────┐  ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌───────────┐ ┌───────────┐
│保存缓存 │  │解析内容  │ │创建图片 │ │ 🆕 多Part   │ │关联到用户 │ │创建AI消息 │
│消息     │  │创建消息  │ │消息      │ │ 缓存机制   │ │消息       │ │+音频播放  │
├─────────┤  ├──────────┤ ├─────────┤ └────────────┘ └───────────┘ └───────────┘
│断开连接 │  │添加列表  │ │添加列表 │              │
├─────────┤  │+缓存    │ │+缓存    │  ┌───────────┐ │
│烟花动画 │  └──────────┘ └─────────┘  │ 缓存到    │ │
├─────────┤                          │scoreCache │ │
│插入结束 │                          └─────┬─────┘ │
│消息     │                                │       │
└─────────┘                                ▼       │
                              ┌───────────────────────┐
                              │ 等待所有 Part 收齐    │
                              │ 创建 score_panel 消息 │
                              └───────────────────────┘
```

---

## 9. 状态管理

### 9.1 WebSocket 连接状态

```typescript
const [isConnected, setIsConnected] = useState(false);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [socket, setSocket] = useState<any>(null);
const socketRef = useRef<any>(null);
```

### 9.2 重试状态
```typescript
const [retryStatus, setRetryStatus] = useState({
  isRetrying: boolean,
  attempt: number,
  maxRetries: number,      // 默认 5
  interval: number,
  maxRetriesReached: boolean
});
```

### 9.3 对话状态
```typescript
const [conversationFinished, setConversationFinished] = useState(false);
const messageCacheRef = useRef<Message[]>([]);  // 消息缓存
const realConversationIdRef = useRef<number>(0); // 真实会话 ID
```

### 9.4 评分缓存状态（多 Part 机制）
```typescript
const scoreMessagesCache = useRef<Map<number, Message>>(new Map());
const [expectedTotalParts, setExpectedTotalParts] = useState<number | null>(null);
```

---

## 10. 错误处理

| 场景 | 处理方式 |
|------|----------|
| 认证失败 | 清空消息，1秒后刷新页面 |
| 认证超时 | 清空消息，1秒后刷新页面 |
| 连接断开 | 清空消息，500ms后刷新页面 |
| 消息发送失败 | console.error 记录错误 |
| 语法反馈缺少 origin_message_id | 丢弃消息，warn 日志 |
| 语法反馈关联消息未找到 | warn 日志，不更新 |
| 评分消息缺少 part_no | 创建单 Part 面板显示 |

---

## 11. 与 SpokenPractice.tsx 的对比

### 11.1 主要差异

| 特性 | SpokenPractice.tsx (考试页面) | SpokenPractice.tsx (练习页面) |
|------|------------------------------|------------------------------|
| 多 Part 评分 | ✅ 支持 | ❌ 不支持 |
| score_panel 类型 | ✅ 支持 | ❌ 不支持 |
| final_score_summary | ✅ 支持 | ❌ 不支持 |
| 加载消息 | ❌ 不显示 | ✅ 仅显示不缓存 |
| 评分缓存机制 | ✅ 多 Part 缓存 | ❌ 直接显示 |

### 11.2 共同特性
- 相同的消息类型定义
- 相同的语法反馈机制
- 相同的缓存保存逻辑
- 相同的连接事件处理

---

## 12. 相关文件

- WebSocket 服务封装: `src/services/WebSocket/websocket.ts`
- API 服务: `src/services/ant-design-pro/api.ts`
- 组件文件: `src/pages/spokenExamPage/SpokenPractice.tsx`
- 样式文件: `src/pages/spokenExamPage/SpokenPractice.less`
