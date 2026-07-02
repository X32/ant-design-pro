# 口语练习系统数据库设计文档

## 文档信息

- **版本**: v1.0
- **创建日期**: 2026-01-13
- **目标**: 为口语练习系统提供完整的数据库表设计方案
- **前端页面**: `src/pages/spokenPages/SpokenPractice.tsx`

---

## 一、业务背景

### 1.1 功能概述

口语练习系统支持用户与 AI 进行多轮对话练习，包括以下核心功能：

- 文本消息对话
- 语音消息录制与转写
- AI 返回图片消息
- AI 返回评分消息（含多维度评分、优势、不足、改进建议）
- 支持用户创建多个练习会话
- 历史会话查看与管理

### 1.2 前端消息数据结构

```typescript
interface Message {
  id: number;                    // 消息ID
  content: string | ScoreContent; // 消息内容（文本或评分对象）
  sender: 'user' | 'ai';         // 发送者角色
  timestamp: string;              // 发送时间戳
  audioFilePath?: string;         // 音频文件路径（用户语音消息）
  messageType?: 'text' | 'voice' | 'image' | 'score'; // 消息类型
  transcriptionText?: string;     // 转写文本（语音消息专用）
  transcriptionStatus?: 'pending' | 'processing' | 'done' | 'failed'; // 转写状态
  audioUrl?: string;              // AI消息的音频URL
  roundNum?: number;              // 轮次号
  imageUrl?: string;              // 图片URL
  score?: string;                 // 总分
}

interface ScoreContent {
  rawText: string;              // 原始文本
  dimensionScores?: string;     // 维度分数（第一行）
  totalScore?: string;          // 总分行
  advantages?: string;          // 优势部分
  disadvantages?: string;       // 不足部分
  suggestions?: string;         // 改进建议
  improvedAnswer?: string;      // 改进的回答
}
```

---

## 二、数据库表设计

### 2.1 表关系图

```
spoken_conversations (会话表)
    ↓ 1:N
spoken_messages (消息主表)
    ↓ 1:1
├── spoken_voice_messages (语音扩展)
├── spoken_image_messages (图片扩展)
└── spoken_score_messages (评分扩展)
```

---

### 2.2 表结构详细设计

#### 表1: `spoken_conversations` - 口语练习会话表

**表说明**: 管理用户的多个口语练习会话，每个会话对应一次完整的练习对话。

```sql
CREATE TABLE `spoken_conversations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '会话ID（主键）',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `exercise_id` INT DEFAULT NULL COMMENT '练习题目ID（关联题库）',
  `workflow_type` VARCHAR(50) DEFAULT 'fce_part1' COMMENT '工作流类型',
  `title` VARCHAR(200) DEFAULT NULL COMMENT '会话标题（可自动生成或用户编辑）',
  `status` ENUM('active', 'completed', 'archived') DEFAULT 'active' COMMENT '会话状态',
  `total_messages` INT DEFAULT 0 COMMENT '消息总数',
  `total_rounds` INT DEFAULT 0 COMMENT '总轮次数',
  `last_message_time` DATETIME DEFAULT NULL COMMENT '最后一条消息时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_last_message_time` (`last_message_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口语练习会话表';
```

**字段说明**:

| 字段名 | 类型 | 说明 | 来源 |
|-------|------|------|------|
| `id` | BIGINT | 会话ID，自增主键 | - |
| `user_id` | BIGINT | 用户ID | localStorage.getItem('user_id') |
| `exercise_id` | INT | 练习题目ID | URL参数 `exercise_id` |
| `workflow_type` | VARCHAR(50) | 工作流类型 | URL参数 `workflow_type` (默认: fce_part1) |
| `title` | VARCHAR(200) | 会话标题 | 自动生成或用户自定义 |
| `status` | ENUM | 会话状态 | active: 进行中, completed: 已完成, archived: 已归档 |
| `total_messages` | INT | 消息总数 | 统计字段，可触发器更新 |
| `total_rounds` | INT | 总轮次数 | 统计字段，取 max(round_num) |
| `last_message_time` | DATETIME | 最后消息时间 | 用于列表排序 |

---

#### 表2: `spoken_messages` - 消息主表

**表说明**: 存储所有消息的核心信息，通过 `message_type` 区分消息类型。

```sql
CREATE TABLE `spoken_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '消息ID（主键）',
  `conversation_id` BIGINT NOT NULL COMMENT '会话ID（关联会话表）',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `sender` ENUM('user', 'ai') NOT NULL COMMENT '发送者角色',
  `message_type` ENUM('text', 'voice', 'image', 'score') DEFAULT 'text' COMMENT '消息类型',
  `content` TEXT COMMENT '文本内容（普通消息/评分原始文本）',
  `round_num` INT DEFAULT NULL COMMENT '对话轮次号',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间（用于显示timestamp）',
  `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  PRIMARY KEY (`id`),
  INDEX `idx_conversation_id` (`conversation_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`conversation_id`) REFERENCES `spoken_conversations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口语练习消息主表';
```

**字段说明**:

| 字段名 | 类型 | 说明 | 前端字段映射 |
|-------|------|------|-------------|
| `id` | BIGINT | 消息ID | Message.id |
| `conversation_id` | BIGINT | 会话ID | URL参数或localStorage |
| `user_id` | BIGINT | 用户ID | localStorage.getItem('user_id') |
| `sender` | ENUM | 发送者 | Message.sender |
| `message_type` | ENUM | 消息类型 | Message.messageType |
| `content` | TEXT | 文本内容 | Message.content (文本消息) |
| `round_num` | INT | 轮次号 | Message.roundNum |
| `created_at` | DATETIME | 创建时间 | 格式化为 HH:mm 显示 (Message.timestamp) |

---

#### 表3: `spoken_voice_messages` - 语音消息扩展表

**表说明**: 存储语音消息的特有字段（用户语音录制、AI音频回复、转写信息）。

```sql
CREATE TABLE `spoken_voice_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `message_id` BIGINT NOT NULL COMMENT '关联消息ID（外键）',
  `audio_file_path` VARCHAR(500) COMMENT '音频文件路径（用户语音）',
  `audio_url` VARCHAR(500) COMMENT 'AI音频URL',
  `transcription_text` TEXT COMMENT '转写文本',
  `transcription_status` ENUM('pending', 'processing', 'done', 'failed') DEFAULT 'pending' COMMENT '转写状态',
  `task_id` VARCHAR(100) COMMENT '转写任务ID',
  `duration` INT DEFAULT NULL COMMENT '音频时长（秒）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_message_id` (`message_id`),
  INDEX `idx_transcription_status` (`transcription_status`),
  FOREIGN KEY (`message_id`) REFERENCES `spoken_messages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='语音消息扩展表';
```

**字段说明**:

| 字段名 | 类型 | 说明 | 前端字段映射 |
|-------|------|------|-------------|
| `message_id` | BIGINT | 关联消息ID | Message.id |
| `audio_file_path` | VARCHAR(500) | 用户语音文件路径 | Message.audioFilePath |
| `audio_url` | VARCHAR(500) | AI音频URL | Message.audioUrl |
| `transcription_text` | TEXT | 转写文本 | Message.transcriptionText |
| `transcription_status` | ENUM | 转写状态 | Message.transcriptionStatus |
| `task_id` | VARCHAR(100) | 转写任务ID | 用于轮询查询转写结果 |
| `duration` | INT | 音频时长 | 扩展字段 |

**注意**: `audio_file_path` 和 `audio_url` 的区别：
- `audio_file_path`: 用户录制的语音文件路径（本地Blob URL或服务器路径）
- `audio_url`: AI返回的音频URL（完整HTTP URL）

---

#### 表4: `spoken_image_messages` - 图片消息扩展表

**表说明**: 存储AI返回的图片消息。

```sql
CREATE TABLE `spoken_image_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `message_id` BIGINT NOT NULL COMMENT '关联消息ID（外键）',
  `image_url` VARCHAR(500) NOT NULL COMMENT '图片URL',
  `image_width` INT DEFAULT NULL COMMENT '图片宽度',
  `image_height` INT DEFAULT NULL COMMENT '图片高度',
  `file_size` BIGINT DEFAULT NULL COMMENT '文件大小（字节）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_message_id` (`message_id`),
  FOREIGN KEY (`message_id`) REFERENCES `spoken_messages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图片消息扩展表';
```

**字段说明**:

| 字段名 | 类型 | 说明 | 前端字段映射 |
|-------|------|------|-------------|
| `message_id` | BIGINT | 关联消息ID | Message.id |
| `image_url` | VARCHAR(500) | 图片URL | Message.imageUrl |
| `image_width` | INT | 图片宽度 | 扩展字段（前端未使用） |
| `image_height` | INT | 图片高度 | 扩展字段（前端未使用） |
| `file_size` | BIGINT | 文件大小 | 扩展字段（前端未使用） |

---

#### 表5: `spoken_score_messages` - 评分消息扩展表

**表说明**: 存储AI评分消息的结构化数据。

```sql
CREATE TABLE `spoken_score_messages` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `message_id` BIGINT NOT NULL COMMENT '关联消息ID（外键）',
  `total_score` VARCHAR(50) COMMENT '总分',
  `dimension_scores` VARCHAR(500) COMMENT '维度分数（第一行）',
  `total_score_line` VARCHAR(200) COMMENT '总分行文本',
  `advantages` TEXT COMMENT '优势',
  `disadvantages` TEXT COMMENT '不足',
  `suggestions` TEXT COMMENT '改进建议',
  `improved_answer` TEXT COMMENT '改进的回答',
  `raw_text` TEXT COMMENT '原始文本（完整评分内容）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_message_id` (`message_id`),
  FOREIGN KEY (`message_id`) REFERENCES `spoken_messages`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评分消息扩展表';
```

**字段说明**:

| 字段名 | 类型 | 说明 | 前端字段映射 |
|-------|------|------|-------------|
| `message_id` | BIGINT | 关联消息ID | Message.id |
| `total_score` | VARCHAR(50) | 总分 | Message.score |
| `dimension_scores` | VARCHAR(500) | 维度分数 | ScoreContent.dimensionScores |
| `total_score_line` | VARCHAR(200) | 总分行 | ScoreContent.totalScore |
| `advantages` | TEXT | 优势 | ScoreContent.advantages |
| `disadvantages` | TEXT | 不足 | ScoreContent.disadvantages |
| `suggestions` | TEXT | 改进建议 | ScoreContent.suggestions |
| `improved_answer` | TEXT | 改进的回答 | ScoreContent.improvedAnswer |
| `raw_text` | TEXT | 原始文本 | ScoreContent.rawText |

**评分内容格式示例**:

```
语法准确性：8分 | 词汇丰富性：7分 | 流畅性：9分

总分：24分

详细评价：

优势：
1. 语法结构正确，时态运用得当
2. 发音清晰，语速适中

不足：
1. 词汇使用较为简单
2. 缺少连接词

改进建议：
1. 尝试使用更高级的词汇
2. 增加过渡性短语

改进的回答：
I strongly believe that technology has revolutionized...
```

---

## 三、核心查询示例

### 3.1 获取用户的会话列表

```sql
SELECT 
    c.id,
    c.title,
    c.exercise_id,
    c.workflow_type,
    c.status,
    c.total_messages,
    c.total_rounds,
    c.last_message_time,
    c.created_at,
    -- 获取最后一条消息预览
    (SELECT content 
     FROM spoken_messages 
     WHERE conversation_id = c.id 
     ORDER BY created_at DESC 
     LIMIT 1) AS last_message_preview
FROM spoken_conversations c
WHERE c.user_id = ?
  AND c.status IN ('active', 'completed')
ORDER BY c.last_message_time DESC, c.created_at DESC;
```

### 3.2 获取会话的完整消息列表

```sql
SELECT 
    m.id,
    m.sender,
    m.message_type,
    m.content,
    m.round_num,
    m.created_at as timestamp,
    -- 语音消息字段
    v.audio_file_path,
    v.audio_url,
    v.transcription_text,
    v.transcription_status,
    -- 图片消息字段
    i.image_url,
    -- 评分消息字段
    s.total_score,
    s.dimension_scores,
    s.total_score_line,
    s.advantages,
    s.disadvantages,
    s.suggestions,
    s.improved_answer,
    s.raw_text
FROM spoken_messages m
LEFT JOIN spoken_voice_messages v ON m.id = v.message_id
LEFT JOIN spoken_image_messages i ON m.id = i.message_id
LEFT JOIN spoken_score_messages s ON m.id = s.message_id
WHERE m.conversation_id = ? AND m.user_id = ?
ORDER BY m.created_at ASC, m.id ASC;
```

### 3.3 创建新会话

```sql
INSERT INTO spoken_conversations 
(user_id, exercise_id, workflow_type, title, status) 
VALUES 
(?, ?, ?, CONCAT('口语练习 - ', DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i')), 'active');
```

### 3.4 插入消息（示例：用户文本消息）

```sql
-- 1. 插入主表
INSERT INTO spoken_messages 
(conversation_id, user_id, sender, message_type, content, round_num) 
VALUES 
(?, ?, 'user', 'text', ?, ?);

-- 2. 更新会话统计
UPDATE spoken_conversations 
SET 
    total_messages = total_messages + 1,
    last_message_time = NOW()
WHERE id = ?;
```

### 3.5 插入语音消息（含转写）

```sql
-- 1. 插入主表
INSERT INTO spoken_messages 
(conversation_id, user_id, sender, message_type, content, round_num) 
VALUES 
(?, ?, 'user', 'voice', '（语音消息）', ?);

-- 2. 插入语音扩展表
INSERT INTO spoken_voice_messages 
(message_id, audio_file_path, transcription_status, task_id) 
VALUES 
(LAST_INSERT_ID(), ?, 'pending', ?);

-- 3. 转写完成后更新
UPDATE spoken_voice_messages 
SET 
    transcription_text = ?,
    transcription_status = 'done'
WHERE message_id = ?;
```

### 3.6 插入评分消息

```sql
-- 1. 插入主表
INSERT INTO spoken_messages 
(conversation_id, user_id, sender, message_type, content, round_num) 
VALUES 
(?, ?, 'ai', 'score', ?, ?);

-- 2. 插入评分扩展表
INSERT INTO spoken_score_messages 
(message_id, total_score, dimension_scores, advantages, disadvantages, suggestions, improved_answer, raw_text) 
VALUES 
(LAST_INSERT_ID(), ?, ?, ?, ?, ?, ?, ?);
```

---

## 四、业务逻辑说明

### 4.1 会话管理流程

#### 创建新会话
1. 用户进入 SpokenPractice 页面
2. 从 URL 获取 `exercise_id` 和 `workflow_type`
3. 检查是否有 `conversationId` 参数：
   - 有：加载已有会话
   - 无：创建新会话，返回 `conversation_id`

#### 会话统计更新
- **方式1（推荐）**: 使用数据库触发器自动更新 `total_messages`、`last_message_time`
- **方式2**: 每次插入消息时手动更新会话表统计字段

#### 会话状态流转
```
active (进行中) 
  ↓ 用户完成练习
completed (已完成)
  ↓ 用户归档
archived (已归档)
  ↓ 用户删除
deleted (物理删除)
```

### 4.2 消息处理流程

#### WebSocket 接收消息流程
```
1. WebSocket 接收消息 (data.type, data.content)
2. 根据 type 判断消息类型：
   - image_url → 图片消息
   - score → 评分消息
   - 其他 → 文本/音频消息
3. 插入 spoken_messages 主表
4. 根据类型插入对应扩展表
5. 更新会话统计信息
```

#### 用户语音消息流程
```
1. 用户录音完成，生成 Blob
2. 插入 spoken_messages (message_type='voice')
3. 上传音频到服务器，返回 task_id
4. 插入 spoken_voice_messages (status='pending')
5. 轮询转写状态
6. 转写完成后更新 transcription_text 和 status='done'
7. 通过 WebSocket 发送转写文本给 AI
```

### 4.3 时间格式处理

- **存储格式**: `DATETIME` (如: 2026-01-13 14:30:25)
- **前端显示格式**: `HH:mm` (如: 14:30)
- **转换示例**:
  ```javascript
  timestamp: new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
  ```

### 4.4 音频URL处理

- **用户语音**: `audio_file_path` 存储服务器路径或Blob URL
- **AI音频**: `audio_url` 存储完整HTTP URL
- **前端拼接**: `http://192.168.4.30:9002${audio_url}`

---

## 五、接口设计建议

### 5.1 会话相关接口

#### 1. 创建会话
```
POST /api/spoken/conversations
Request Body:
{
  "user_id": 123,
  "exercise_id": 25,
  "workflow_type": "fce_part1",
  "title": "口语练习 - 2026-01-13 14:30"
}
Response:
{
  "success": true,
  "conversation_id": 456,
  "message": "会话创建成功"
}
```

#### 2. 获取会话列表
```
GET /api/spoken/conversations?user_id=123&status=active
Response:
{
  "success": true,
  "data": [
    {
      "id": 456,
      "title": "口语练习 - 2026-01-13 14:30",
      "exercise_id": 25,
      "workflow_type": "fce_part1",
      "status": "active",
      "total_messages": 12,
      "total_rounds": 6,
      "last_message_time": "2026-01-13 14:45:30",
      "last_message_preview": "Great! Let's continue..."
    }
  ]
}
```

#### 3. 获取会话详情（含所有消息）
```
GET /api/spoken/conversations/456/messages?user_id=123
Response:
{
  "success": true,
  "conversation": {
    "id": 456,
    "title": "口语练习 - 2026-01-13 14:30",
    "status": "active"
  },
  "messages": [
    {
      "id": 1,
      "sender": "user",
      "message_type": "text",
      "content": "Hello",
      "timestamp": "2026-01-13 14:30:25",
      "round_num": 1
    },
    {
      "id": 2,
      "sender": "ai",
      "message_type": "text",
      "content": "Hi! How can I help you?",
      "timestamp": "2026-01-13 14:30:28",
      "audio_url": "/audio/ai_response_123.mp3",
      "round_num": 1
    }
  ]
}
```

### 5.2 消息相关接口

#### 1. 发送用户消息
```
POST /api/spoken/messages
Request Body:
{
  "conversation_id": 456,
  "user_id": 123,
  "sender": "user",
  "message_type": "text",
  "content": "I want to practice speaking",
  "round_num": 2
}
Response:
{
  "success": true,
  "message_id": 789
}
```

#### 2. 上传语音消息
```
POST /api/spoken/messages/voice
Content-Type: multipart/form-data
Request Body:
- audio_file: (binary)
- conversation_id: 456
- user_id: 123
- round_num: 3

Response:
{
  "success": true,
  "message_id": 790,
  "task_id": "trans_abc123",
  "file_path": "/uploads/voice/recording_20260113_143045.wav"
}
```

#### 3. 查询转写状态
```
GET /api/transcription/status/trans_abc123
Response:
{
  "success": true,
  "task_id": "trans_abc123",
  "status": "done",
  "result": {
    "text": "I want to practice speaking",
    "language": "en",
    "success": true
  }
}
```

---

## 六、数据迁移与初始化

### 6.1 建表顺序

```sql
-- 1. 创建会话表
CREATE TABLE spoken_conversations (...);

-- 2. 创建消息主表（依赖会话表）
CREATE TABLE spoken_messages (...);

-- 3. 创建扩展表（依赖消息主表）
CREATE TABLE spoken_voice_messages (...);
CREATE TABLE spoken_image_messages (...);
CREATE TABLE spoken_score_messages (...);
```

### 6.2 触发器示例（可选）

#### 自动更新会话统计信息

```sql
DELIMITER $$

CREATE TRIGGER update_conversation_stats_after_insert
AFTER INSERT ON spoken_messages
FOR EACH ROW
BEGIN
    UPDATE spoken_conversations 
    SET 
        total_messages = total_messages + 1,
        total_rounds = GREATEST(total_rounds, COALESCE(NEW.round_num, 0)),
        last_message_time = NEW.created_at
    WHERE id = NEW.conversation_id;
END$$

DELIMITER ;
```

---

## 七、注意事项

### 7.1 关键设计说明

1. **级联删除**: 删除会话时自动删除所有关联消息
2. **扩展表设计**: 使用 `UNIQUE KEY` 确保一对一关系
3. **NULL 值处理**: 可选字段使用 `DEFAULT NULL`
4. **时间戳**: 使用 `DATETIME` 类型，前端格式化显示
5. **字符集**: 统一使用 `utf8mb4` 支持 emoji 和特殊字符

### 7.2 性能优化建议

1. **索引优化**:
   - `conversation_id` 高频查询，已添加索引
   - `user_id` + `status` 组合索引用于会话列表查询
   - `created_at` 用于消息排序

2. **分表策略**:
   - 当消息量超过千万级别时，考虑按时间或用户ID分表

3. **缓存策略**:
   - 热门会话的消息列表可缓存到 Redis
   - 会话统计信息可缓存

### 7.3 前端不需要的字段

以下字段为前端运行时状态，**不需要存储到数据库**：
- `audioLoaded` (音频加载状态)
- `expandedImages` (图片展开状态)

---

## 八、版本更新记录

| 版本 | 日期 | 修改内容 | 修改人 |
|------|------|---------|--------|
| v1.0 | 2026-01-13 | 初始版本，包含完整表设计 | - |

---

## 九、附录

### 9.1 前端关键代码位置

- **消息接口定义**: `src/pages/spokenPages/SpokenPractice.tsx` (Line 54-84)
- **WebSocket 消息处理**: `src/pages/spokenPages/SpokenPractice.tsx` (Line 449-601)
- **语音上传处理**: `src/pages/spokenPages/SpokenPractice.tsx` (Line 925-1033)

### 9.2 相关文档

- [口语练习系统需求文档](./SPOKEN_PRACTICE_REQUIREMENTS.md)
- [WebSocket 通信协议](./WEBSOCKET_PROTOCOL.md)
- [音频转写服务接口](./AUDIO_TRANSCRIPTION_API.md)

---

**文档结束**
