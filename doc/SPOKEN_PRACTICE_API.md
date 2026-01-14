# 口语练习管理 API 文档

**基础信息**
- **Base URL**: `http://127.0.0.1:9002`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`
- **设计文档**: [SPOKEN_PRACTICE_DB_DESIGN.md](../src/conversation/doc/SPOKEN_PRACTICE_DB_DESIGN.md)

---

## 目录

- [认证说明](#认证说明)
- [口语会话管理接口](#口语会话管理接口)
  - [创建口语会话](#1-创建口语会话)
  - [获取会话列表](#2-获取会话列表)
  - [获取会话详情](#3-获取会话详情)
  - [更新会话](#4-更新会话)
- [口语消息管理接口](#口语消息管理接口)
  - [获取会话消息列表](#1-获取会话消息列表)
  - [创建文本消息](#2-创建文本消息)
  - [创建语音消息](#3-创建语音消息)
  - [更新转写结果](#4-更新转写结果)
  - [创建图片消息](#5-创建图片消息)
  - [创建评分消息](#6-创建评分消息)
  - [获取消息详情](#7-获取消息详情)
- [数据模型](#数据模型)
- [错误处理](#错误处理)
- [前端集成指南](#前端集成指南)

---

## 认证说明

所有接口都需要在请求头中携带有效的 JWT Token：

```http
Authorization: Bearer <your_access_token>
```

**获取 Token**: 
- 登录接口: `POST /api/auth/login`
- 注册接口: `POST /api/auth/register`

---

## 口语会话管理接口

### 1. 创建口语会话

创建一个新的口语练习会话。

**接口地址**
```
POST /api/spoken/conversations
```

**请求头**
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| exercise_id | integer | 否 | 练习题目ID | 25 |
| workflow_type | string | 否 | 工作流类型（默认fce_part1） | "fce_part1" |
| title | string | 否 | 会话标题（自动生成） | "口语练习 - 2026-01-13 14:30" |

**workflow_type 可选值**：
- `fce_part1` - FCE Part 1（默认）
- `fce_part2` - FCE Part 2
- `fce_part3` - FCE Part 3

**请求示例**
```json
{
  "exercise_id": 25,
  "workflow_type": "fce_part1",
  "title": "FCE Part1 旅游话题练习"
}
```

**响应示例**

成功响应 (200):
```json
{
  "success": true,
  "message": "口语会话创建成功",
  "data": {
    "id": 456,
    "user_id": 123,
    "exercise_id": 25,
    "workflow_type": "fce_part1",
    "title": "FCE Part1 旅游话题练习",
    "status": "active",
    "total_messages": 0,
    "total_rounds": 0,
    "last_message_time": null,
    "created_at": "2026-01-13T14:30:00",
    "updated_at": null
  }
}
```

**curl 示例**
```bash
curl -X POST "http://127.0.0.1:9002/api/spoken/conversations" \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "exercise_id": 25,
    "workflow_type": "fce_part1"
  }'
```

---

### 2. 获取会话列表

获取当前用户的口语练习会话列表，支持分页和状态过滤。

**接口地址**
```
GET /api/spoken/conversations
```

**请求头**
```http
Authorization: Bearer <token>
```

**查询参数**

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| status_filter | string | 否 | 状态过滤 (active/completed/archived) | 无 |
| limit | integer | 否 | 返回数量限制 (1-100) | 50 |
| offset | integer | 否 | 偏移量 (>=0) | 0 |

**请求示例**
```
GET /api/spoken/conversations?status_filter=active&limit=20&offset=0
```

**响应示例**

成功响应 (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "user_id": 123,
      "exercise_id": 25,
      "workflow_type": "fce_part1",
      "title": "FCE Part1 旅游话题练习",
      "status": "active",
      "total_messages": 12,
      "total_rounds": 6,
      "last_message_time": "2026-01-13T14:45:30",
      "created_at": "2026-01-13T14:30:00",
      "updated_at": "2026-01-13T14:45:30",
      "last_message_preview": "Great! Let's continue with the next topic..."
    }
  ],
  "total": 1
}
```

**curl 示例**
```bash
curl -X GET "http://127.0.0.1:9002/api/spoken/conversations?status_filter=active" \
  -H "Authorization: Bearer your_token_here"
```

---

### 3. 获取会话详情

根据会话ID获取单个会话的详细信息。

**接口地址**
```
GET /api/spoken/conversations/{conversation_id}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| conversation_id | integer | 是 | 会话ID |

**响应示例**

成功响应 (200):
```json
{
  "success": true,
  "message": "获取口语会话成功",
  "data": {
    "id": 456,
    "user_id": 123,
    "exercise_id": 25,
    "workflow_type": "fce_part1",
    "title": "FCE Part1 旅游话题练习",
    "status": "active",
    "total_messages": 12,
    "total_rounds": 6,
    "last_message_time": "2026-01-13T14:45:30",
    "created_at": "2026-01-13T14:30:00",
    "updated_at": "2026-01-13T14:45:30"
  }
}
```

---

### 4. 更新会话

更新会话的标题或状态。

**接口地址**
```
PUT /api/spoken/conversations/{conversation_id}
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| title | string | 否 | 会话标题 | "新的会话标题" |
| status | string | 否 | 会话状态 | "completed" |

**status 可选值**：
- `active` - 进行中
- `completed` - 已完成
- `archived` - 已归档

**请求示例**
```json
{
  "title": "FCE Part1 旅游话题练习 - 已完成",
  "status": "completed"
}
```

---

## 口语消息管理接口

### 1. 获取会话消息列表

获取指定会话中的所有消息（含扩展字段）。

**接口地址**
```
GET /api/spoken/conversations/{conversation_id}/messages
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| conversation_id | integer | 是 | 会话ID |

**响应示例**

成功响应 (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "sender": "user",
      "message_type": "text",
      "content": "Do you prefer to travel by bus or by car?",
      "round_num": 1,
      "timestamp": "2026-01-13T14:31:00",
      "audio_file_path": null,
      "audio_url": null,
      "transcription_text": null,
      "transcription_status": null,
      "image_url": null,
      "total_score": null,
      "dimension_scores": null,
      "advantages": null,
      "disadvantages": null,
      "suggestions": null,
      "improved_answer": null,
      "raw_text": null
    },
    {
      "id": 790,
      "sender": "ai",
      "message_type": "text",
      "content": "I prefer to travel by car because it's more flexible...",
      "round_num": 1,
      "timestamp": "2026-01-13T14:31:15",
      "audio_file_path": null,
      "audio_url": "/audio/ai_response_123.mp3",
      "transcription_text": null,
      "transcription_status": null,
      "image_url": null,
      "total_score": null,
      "dimension_scores": null,
      "advantages": null,
      "disadvantages": null,
      "suggestions": null,
      "improved_answer": null,
      "raw_text": null
    },
    {
      "id": 791,
      "sender": "user",
      "message_type": "voice",
      "content": "（语音消息）",
      "round_num": 2,
      "timestamp": "2026-01-13T14:32:00",
      "audio_file_path": "/uploads/voice/recording_123.wav",
      "audio_url": null,
      "transcription_text": "I like to read books during long journeys",
      "transcription_status": "done",
      "image_url": null,
      "total_score": null,
      "dimension_scores": null,
      "advantages": null,
      "disadvantages": null,
      "suggestions": null,
      "improved_answer": null,
      "raw_text": null
    },
    {
      "id": 792,
      "sender": "ai",
      "message_type": "image",
      "content": "/images/travel_scene.jpg",
      "round_num": 3,
      "timestamp": "2026-01-13T14:33:00",
      "audio_file_path": null,
      "audio_url": null,
      "transcription_text": null,
      "transcription_status": null,
      "image_url": "/images/travel_scene.jpg",
      "total_score": null,
      "dimension_scores": null,
      "advantages": null,
      "disadvantages": null,
      "suggestions": null,
      "improved_answer": null,
      "raw_text": null
    },
    {
      "id": 793,
      "sender": "ai",
      "message_type": "score",
      "content": "语法准确性：8分 | 词汇丰富性：7分 | 流畅性：9分\n\n总分：24分\n...",
      "round_num": 6,
      "timestamp": "2026-01-13T14:45:30",
      "audio_file_path": null,
      "audio_url": null,
      "transcription_text": null,
      "transcription_status": null,
      "image_url": null,
      "total_score": "24",
      "dimension_scores": "语法准确性：8分 | 词汇丰富性：7分 | 流畅性：9分",
      "advantages": "1. 语法结构正确，时态运用得当\n2. 发音清晰，语速适中",
      "disadvantages": "1. 词汇使用较为简单\n2. 缺少连接词",
      "suggestions": "1. 尝试使用更高级的词汇\n2. 增加过渡性短语",
      "improved_answer": "I strongly believe that technology has revolutionized...",
      "raw_text": "语法准确性：8分 | 词汇丰富性：7分 | 流畅性：9分\n\n总分：24分\n..."
    }
  ],
  "total": 5,
  "conversation": {
    "id": 456,
    "title": "FCE Part1 旅游话题练习",
    "status": "active"
  }
}
```

---

### 2. 创建文本消息

在指定会话中创建一条文本消息。

**接口地址**
```
POST /api/spoken/conversations/{conversation_id}/messages/text
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| sender | string | 是 | 发送者 (user/ai) | "user" |
| content | string | 是 | 消息内容 | "Do you prefer..." |
| round_num | integer | 否 | 轮次号 | 1 |

**请求示例**
```json
{
  "sender": "user",
  "content": "Do you prefer to travel by bus or by car?",
  "round_num": 1
}
```

**响应示例**

成功响应 (200):
```json
{
  "success": true,
  "message": "文本消息创建成功",
  "data": {
    "id": 789,
    "conversation_id": 456,
    "user_id": 123,
    "sender": "user",
    "message_type": "text",
    "content": "Do you prefer to travel by bus or by car?",
    "round_num": 1,
    "timestamp": "2026-01-13T14:31:00"
  }
}
```

---

### 3. 创建语音消息

在指定会话中创建一条语音消息。

**接口地址**
```
POST /api/spoken/conversations/{conversation_id}/messages/voice
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| sender | string | 是 | 发送者 (user/ai) | "user" |
| audio_file_path | string | 否 | 音频文件路径（用户语音） | "/uploads/voice/..." |
| audio_url | string | 否 | AI音频URL | "/audio/ai_response.mp3" |
| round_num | integer | 否 | 轮次号 | 2 |
| task_id | string | 否 | 转写任务ID | "trans_abc123" |

**请求示例**
```json
{
  "sender": "user",
  "audio_file_path": "/uploads/voice/recording_123.wav",
  "round_num": 2,
  "task_id": "trans_abc123"
}
```

**响应示例**

成功响应 (200):
```json
{
  "success": true,
  "message": "语音消息创建成功",
  "data": {
    "id": 790,
    "conversation_id": 456,
    "user_id": 123,
    "sender": "user",
    "message_type": "voice",
    "content": "（语音消息）",
    "round_num": 2,
    "timestamp": "2026-01-13T14:32:00",
    "audio_file_path": "/uploads/voice/recording_123.wav",
    "transcription_status": "pending",
    "task_id": "trans_abc123"
  }
}
```

---

### 4. 更新转写结果

更新语音消息的转写结果。

**接口地址**
```
PUT /api/spoken/messages/{message_id}/transcription
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| message_id | integer | 是 | 消息ID |

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| transcription_text | string | 是 | 转写文本 | "I like to read books..." |
| status | string | 否 | 转写状态（默认done） | "done" |

**status 可选值**：
- `pending` - 等待中
- `processing` - 处理中
- `done` - 完成
- `failed` - 失败

**请求示例**
```json
{
  "transcription_text": "I like to read books during long journeys",
  "status": "done"
}
```

---

### 5. 创建图片消息

在指定会话中创建一条图片消息（AI发送）。

**接口地址**
```
POST /api/spoken/conversations/{conversation_id}/messages/image
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| image_url | string | 是 | 图片URL | "/images/travel_scene.jpg" |
| round_num | integer | 否 | 轮次号 | 3 |
| image_width | integer | 否 | 图片宽度 | 800 |
| image_height | integer | 否 | 图片高度 | 600 |

**请求示例**
```json
{
  "image_url": "/images/travel_scene.jpg",
  "round_num": 3,
  "image_width": 800,
  "image_height": 600
}
```

---

### 6. 创建评分消息

在指定会话中创建一条评分消息（AI发送）。

**接口地址**
```
POST /api/spoken/conversations/{conversation_id}/messages/score
```

**请求参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| raw_text | string | 是 | 原始评分文本 |
| round_num | integer | 否 | 轮次号 |
| total_score | string | 否 | 总分 |
| dimension_scores | string | 否 | 维度分数 |
| advantages | string | 否 | 优势 |
| disadvantages | string | 否 | 不足 |
| suggestions | string | 否 | 改进建议 |
| improved_answer | string | 否 | 改进的回答 |

**请求示例**
```json
{
  "raw_text": "语法准确性：8分 | 词汇丰富性：7分 | 流畅性：9分\n\n总分：24分\n\n详细评价：\n\n优势：\n1. 语法结构正确...",
  "round_num": 6,
  "total_score": "24",
  "dimension_scores": "语法准确性：8分 | 词汇丰富性：7分 | 流畅性：9分",
  "advantages": "1. 语法结构正确，时态运用得当\n2. 发音清晰，语速适中",
  "disadvantages": "1. 词汇使用较为简单\n2. 缺少连接词",
  "suggestions": "1. 尝试使用更高级的词汇\n2. 增加过渡性短语",
  "improved_answer": "I strongly believe that technology has revolutionized..."
}
```

---

### 7. 获取消息详情

根据消息ID获取单条消息的详细信息（含扩展字段）。

**接口地址**
```
GET /api/spoken/messages/{message_id}
```

**路径参数**

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| message_id | integer | 是 | 消息ID |

---

## 数据模型

### SpokenConversation (口语会话对象)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 会话ID |
| user_id | integer | 用户ID |
| exercise_id | integer | 练习题目ID（可选） |
| workflow_type | string | 工作流类型 |
| title | string | 会话标题 |
| status | string | 会话状态 (active/completed/archived) |
| total_messages | integer | 消息总数 |
| total_rounds | integer | 总轮次数 |
| last_message_time | datetime | 最后消息时间 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### SpokenMessage (口语消息对象)

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 消息ID |
| conversation_id | integer | 所属会话ID |
| user_id | integer | 用户ID |
| sender | string | 发送者 (user/ai) |
| message_type | string | 消息类型 (text/voice/image/score) |
| content | string | 消息内容 |
| round_num | integer | 轮次号 |
| timestamp | datetime | 创建时间 |
| audio_file_path | string | 音频文件路径（语音消息） |
| audio_url | string | AI音频URL（语音消息） |
| transcription_text | string | 转写文本（语音消息） |
| transcription_status | string | 转写状态（语音消息） |
| image_url | string | 图片URL（图片消息） |
| total_score | string | 总分（评分消息） |
| dimension_scores | string | 维度分数（评分消息） |
| advantages | string | 优势（评分消息） |
| disadvantages | string | 不足（评分消息） |
| suggestions | string | 改进建议（评分消息） |
| improved_answer | string | 改进的回答（评分消息） |
| raw_text | string | 原始文本（评分消息） |

---

## 错误处理

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 401 | 未授权（Token无效或过期） |
| 403 | 禁止访问（无权限） |
| 404 | 资源不存在 |
| 422 | 请求参数验证失败 |
| 500 | 服务器内部错误 |

---

## 前端集成指南

### 1. 典型使用流程

```javascript
// 1. 创建口语会话
const conversation = await createSpokenConversation({
  exercise_id: 25,
  workflow_type: "fce_part1"
});
const conversationId = conversation.data.id;

// 2. 发送用户文本消息
await createTextMessage(conversationId, {
  sender: "user",
  content: "Do you prefer to travel by bus or by car?",
  round_num: 1
});

// 3. 接收AI回复（通过WebSocket或轮询）
await createTextMessage(conversationId, {
  sender: "ai",
  content: "I prefer to travel by car...",
  round_num: 1
});

// 4. 用户发送语音消息
const voiceMsg = await createVoiceMessage(conversationId, {
  sender: "user",
  audio_file_path: "/uploads/voice/recording.wav",
  round_num: 2,
  task_id: "trans_abc123"
});

// 5. 轮询转写状态
// (实际应用中由后端服务监听转写完成事件)
await updateTranscription(voiceMsg.data.id, {
  transcription_text: "I like to read books during long journeys",
  status: "done"
});

// 6. 获取完整消息历史
const messages = await getSpokenMessages(conversationId);
```

### 2. 前端数据结构映射

```typescript
// 前端 Message 接口
interface Message {
  id: number;
  content: string | ScoreContent;
  sender: 'user' | 'ai';
  timestamp: string;
  audioFilePath?: string;         // → audio_file_path
  messageType?: 'text' | 'voice' | 'image' | 'score';  // → message_type
  transcriptionText?: string;     // → transcription_text
  transcriptionStatus?: string;   // → transcription_status
  audioUrl?: string;              // → audio_url
  roundNum?: number;              // → round_num
  imageUrl?: string;              // → image_url
  score?: string;                 // → total_score
}

// 评分内容
interface ScoreContent {
  rawText: string;                // → raw_text
  dimensionScores?: string;       // → dimension_scores
  totalScore?: string;            // → total_score
  advantages?: string;            // → advantages
  disadvantages?: string;         // → disadvantages (不足)
  suggestions?: string;           // → suggestions
  improvedAnswer?: string;        // → improved_answer
}
```

### 3. TypeScript API 封装示例

```typescript
// spoken-practice-api.ts
const API_BASE_URL = 'http://127.0.0.1:9002';

class SpokenPracticeAPI {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // 创建会话
  async createConversation(data: {
    exercise_id?: number;
    workflow_type?: string;
    title?: string;
  }) {
    const response = await fetch(
      `${API_BASE_URL}/api/spoken/conversations`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  // 获取会话列表
  async getConversations(status?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString()
    });
    if (status) params.append('status_filter', status);

    const response = await fetch(
      `${API_BASE_URL}/api/spoken/conversations?${params}`,
      { headers: this.getHeaders() }
    );
    return response.json();
  }

  // 获取消息列表
  async getMessages(conversationId: number) {
    const response = await fetch(
      `${API_BASE_URL}/api/spoken/conversations/${conversationId}/messages`,
      { headers: this.getHeaders() }
    );
    return response.json();
  }

  // 创建文本消息
  async createTextMessage(conversationId: number, data: {
    sender: string;
    content: string;
    round_num?: number;
  }) {
    const response = await fetch(
      `${API_BASE_URL}/api/spoken/conversations/${conversationId}/messages/text`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  // 创建语音消息
  async createVoiceMessage(conversationId: number, data: {
    sender: string;
    audio_file_path?: string;
    audio_url?: string;
    round_num?: number;
    task_id?: string;
  }) {
    const response = await fetch(
      `${API_BASE_URL}/api/spoken/conversations/${conversationId}/messages/voice`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  // 创建图片消息
  async createImageMessage(conversationId: number, data: {
    image_url: string;
    round_num?: number;
  }) {
    const response = await fetch(
      `${API_BASE_URL}/api/spoken/conversations/${conversationId}/messages/image`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  // 创建评分消息
  async createScoreMessage(conversationId: number, data: {
    raw_text: string;
    round_num?: number;
    total_score?: string;
    dimension_scores?: string;
    advantages?: string;
    disadvantages?: string;
    suggestions?: string;
    improved_answer?: string;
  }) {
    const response = await fetch(
      `${API_BASE_URL}/api/spoken/conversations/${conversationId}/messages/score`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }

  // 更新转写结果
  async updateTranscription(messageId: number, data: {
    transcription_text: string;
    status?: string;
  }) {
    const response = await fetch(
      `${API_BASE_URL}/api/spoken/messages/${messageId}/transcription`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    );
    return response.json();
  }
}

export default SpokenPracticeAPI;
```

---

**文档版本**: v1.0  
**最后更新**: 2026-01-13  
**维护者**: 后端开发团队  
**相关文档**: [SPOKEN_PRACTICE_DB_DESIGN.md](../src/conversation/doc/SPOKEN_PRACTICE_DB_DESIGN.md)
