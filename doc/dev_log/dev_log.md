# 开发日志

## 2026-02-04

### 🎯 口语评分消息格式适配与首页登录体验优化

#### 1. 评分消息解析逻辑更新

**背景**：
- 后端返回的 score 消息格式发生变更
- 旧格式使用英文冒号和逗号分隔
- 新格式使用中文冒号和竖线分隔

**旧格式示例**：
```
语法与词汇: 4/5, 话语组织: 3/5, 发音: 4/5
总分: 40/60
详细评价:
优势:
- 内容...
```

**新格式示例**：
```
语法与词汇：4分 | 话语管理：4分 | 发音：4分 | 互动交流：4分
总分：4.0分（A2水平达标：是）

详细评价：
优势：
- 语法与词汇：能准确使用一般现在时...
- 话语管理：能产出延展性语言片段...

不足：
- 语法与词汇：未使用过去时...

改进建议：
- 语法与词汇：练习加入一个过去时句子...
```

**修改内容**：

##### `SpokenPractice.tsx` - parseScoreContent 函数

```typescript
// 🆕 适配新格式的关键改进

1. 支持中英文冒号兼容
   - 旧：line.startsWith('总分:')
   - 新：line.startsWith('总分：') || line.startsWith('总分:')

2. 维度分数格式更新
   - 旧："语法与词汇: 4/5, 话语组织: 3/5"
   - 新："语法与词汇：4分 | 话语管理：4分 | 发音：4分 | 互动交流：4分"

3. 保留原始格式
   - 移除了 `&& line` 的空行过滤条件
   - 现在会保留所有内容（包括空行），保持原始格式

4. 所有章节标题兼容
   - 优势：/优势:  ✅
   - 不足：/不足:  ✅
   - 改进建议：/改进建议:  ✅
   - 改进的回答：/改进的回答:  ✅
```

##### WebSocket 接收消息类型定义

```typescript
// 在 setupReceiveMessageHandler 中添加缺失字段
wsSocket.on('receive_message', async (data: { 
  type?: string;
  content: any;
  timestamp?: number;
  round_num?: number;
  audio_url?: string;
  audio_cached?: boolean;
  score?: string;
  part_no?: number;        // 🆕 评分阶段号
  total_parts?: number;    // 🆕 总阶段数
}) => {
  // ...
});
```

##### 调试日志增强

```typescript
// 添加详细的解析结果日志
console.log('🔍 评分消息解析结果:', {
  原始文本长度: contentText.length,
  维度分数: parsedContent.dimensionScores,
  总分行: parsedContent.totalScore,
  优势: parsedContent.advantages ? '有(' + parsedContent.advantages.length + '字)' : '无',
  不足: parsedContent.disadvantages ? '有(' + parsedContent.disadvantages.length + '字)' : '无',
  改进建议: parsedContent.suggestions ? '有(' + parsedContent.suggestions.length + '字)' : '无',
  改进的回答: parsedContent.improvedAnswer ? '有(' + parsedContent.improvedAnswer.length + '字)' : '无',
});

// 添加原始内容预览日志
console.log('📝 收到评分消息:', {
  score: data.score,
  part_no: data.part_no,
  total_parts: data.total_parts,
  round_num: data.round_num,
  content类型: typeof data.content,
  content预览: typeof data.content === 'string' ? data.content.substring(0, 100) + '...' : data.content,
});
```

**技术要点**：
1. 正则表达式兼容中英文标点符号
2. 保持原始文本的换行和格式
3. 健壮的解析逻辑，避免因格式变化导致解析失败

---

#### 2. 首页登录态优化

**问题**：
- 已登录用户点击「立即开始」按钮仍会弹出登录框
- 用户体验不佳，需要多次点击才能进入考试

**解决方案**：

##### `index.tsx` - handleLogin 函数优化

```typescript
const handleLogin = () => {
  // ✅ 如果已登录，跳转到考试目录；否则打开登录弹窗
  if (isLoggedIn) {
    history.push('/exam-catalog');
  } else {
    setLoginModalVisible(true);
  }
};
```

##### CTA 区域按钮智能化

```typescript
<Button 
  className="primary-button" 
  size="large" 
  onClick={isLoggedIn ? handleStart : handleLogin}
>
  <RocketButtonIcon size={28} />
  {isLoggedIn ? '开始练习' : '立即出发'}
</Button>
```

**改进点**：
1. ✅ 登录态检查前置：点击前先判断登录状态
2. ✅ 按钮文案动态：已登录显示「开始练习」，未登录显示「立即出发」
3. ✅ 交互流程优化：已登录用户直接进入功能页面
4. ✅ 统一体验：所有入口按钮都支持登录态判断

**影响范围**：
- 首页导航栏「立即开始」按钮 ✅（已有判断）
- 英雄区域「开始游戏」按钮 ✅（使用 handleStart）
- CTA 区域「立即出发」按钮 ✅（新增判断）

---

#### 3. 代码质量提升

**音频 URL 配置切换**：
```typescript
// SpokenPractice.tsx
// const AI_AUDIO_BASE_URL = 'http://localhost:9002';
const AI_AUDIO_BASE_URL = 'https://api.qtoplay.com';
```
- 从本地开发环境切换到生产环境
- 确保音频资源正确加载

---

### 📝 修改文件清单

1. **`/src/pages/spokenExamPage/SpokenPractice.tsx`**
   - parseScoreContent 函数：适配新格式（+30行，-16行）
   - WebSocket 消息类型定义：添加 part_no 和 total_parts（+2行）
   - 调试日志增强：添加详细解析日志（+11行）
   - 音频 URL 配置：切换到生产环境（2行修改）

2. **`/src/pages/home/index.tsx`**
   - handleLogin 函数：添加登录态判断（+5行，-1行）
   - CTA 按钮：动态文案和点击逻辑（+6行，-3行）

### 🎯 解决的核心问题

1. ✅ **评分内容显示不全**：各维度评分、优势、不足、改进建议、改进的回答全部正常显示
2. ✅ **格式兼容性差**：支持中英文冒号，适配后端格式变更
3. ✅ **用户体验问题**：已登录用户不再弹出登录框，直接进入功能
4. ✅ **调试困难**：添加详细日志，方便定位问题

### 🔍 调试技巧

**如何验证评分解析是否正确**：
1. 打开浏览器控制台（F12）
2. 进行口语练习
3. 查看日志输出：
   ```javascript
   📝 收到评分消息: { content预览: "...", ... }
   🔍 评分消息解析结果: { 优势: "有(120字)", ... }
   ```
4. 如果所有字段都显示「有(XX字)」，说明解析成功
5. 如果显示「无」，说明格式不匹配，需要调整解析逻辑

### ⏱️ 工作时长

约 3 小时（需求分析 + 格式适配 + 代码修改 + 测试验证 + 文档编写）

---

## 2026-02-03

### 🔧 消息重复保存问题排查与修复

#### 问题描述
- 数据库中出现重复的 AI 消息记录
- 批量保存时发现相同时间戳的重复消息
- 日志显示：同一时间有两条 sender='ai' 的 text 消息被保存

#### 排查过程
1. **初步怀疑**：loading 消息被误缓存
   - 添加了单独的 loading 消息处理分支（仅显示，不缓存）
   - 但问题依然存在

2. **深入分析**：检查 WebSocket 消息接收逻辑
   - 添加详细日志追踪消息类型和 messageId
   - 发现需要查看完整的消息接收流程

3. **根本原因定位**：`origin_message_id` 关联机制需要完善
   - 客户端生成的消息 ID 未正确传递给后端
   - 后端无法通过 origin_message_id 准确关联消息

#### 解决方案

##### 1. API 接口层修改（`api.ts`）

**新增字段到所有创建消息接口：**
- `CreateTextMessageParams` 添加 `origin_message_id?: string`
- `CreateVoiceMessageParams` 添加 `origin_message_id?: string`
- `CreateImageMessageParams` 添加 `origin_message_id?: string`
- `CreateScoreMessageParams` 添加 `origin_message_id?: string`
- `CreateGrammarAnalysisParams` 已有，类型改为 `string`

**返回接口字段统一：**
- `SpokenMessage.origin_message_id` 改为 `string` 类型
- `GrammarAnalysisMessage.origin_message_id` 改为 `string` 类型

##### 2. 业务逻辑层修改（`SpokenPractice.tsx`）

**所有消息保存调用添加 origin_message_id：**

```typescript
// 文本消息
await createSpokenTextMessage(conversationId, {
  sender: msg.sender,
  content: typeof msg.content === 'string' ? msg.content : '',
  round_num: msg.roundNum,
  origin_message_id: msg.id.toString(), // 🆕 客户端消息ID
  created_at: createdAt,
});

// 语音消息
await createSpokenVoiceMessage(conversationId, {
  sender: msg.sender,
  audio_file_path: audioPath,
  round_num: msg.roundNum,
  transcription_text: msg.transcriptionText || '',
  origin_message_id: msg.id.toString(), // 🆕 客户端消息ID
  created_at: createdAt,
});

// 图片消息
await createSpokenImageMessage(conversationId, {
  image_url: msg.imageUrl!,
  round_num: msg.roundNum,
  origin_message_id: msg.id.toString(), // 🆕 客户端消息ID
  created_at: createdAt,
});

// 评分消息
await createSpokenScoreMessage(conversationId, {
  raw_text: content.rawText,
  round_num: msg.roundNum,
  origin_message_id: msg.id.toString(), // 🆕 客户端消息ID
  total_score: msg.score,
  // ...
});

// 语法分析消息（关联用户消息）
await createGrammarAnalysisMessage(conversationId, {
  origin_message_id: msg.id.toString(), // 🔄 使用客户端ID替代数据库ID
  exam_level: examLevel,
  // ...
});
```

**关键改进点：**
1. ✅ **统一 ID 来源**：所有消息都使用 `msg.id`（客户端生成的时间戳 ID）
2. ✅ **类型转换**：使用 `.toString()` 显式转换为字符串类型
3. ✅ **语法分析关联**：从使用数据库 ID 改为使用客户端 ID
   - 原：`savedTextMessageId.toString()`（数据库返回的 ID）
   - 新：`msg.id.toString()`（客户端生成的 ID）

#### 技术要点

1. **客户端消息 ID 生成规则：**
   ```typescript
   const messageId = Date.now() + Math.floor(Math.random() * 1000);
   ```

2. **ID 传递链路：**
   ```
   前端生成 msg.id
   ↓
   保存到 messageCacheRef.current
   ↓
   batchSaveMessages 批量保存
   ↓
   API 调用时传递 origin_message_id: msg.id.toString()
   ↓
   后端保存到数据库
   ↓
   grammar_feedback 通过 origin_message_id 关联
   ```

3. **类型规范：**
   - 前端内存：`msg.id` 为 `number` 类型
   - API 传参：`origin_message_id` 为 `string` 类型
   - 需要显式调用 `.toString()` 转换

#### 预期效果

1. ✅ **消息关联更准确**：后端可以通过客户端 ID 精确匹配消息
2. ✅ **避免重复保存**：origin_message_id 作为去重依据
3. ✅ **grammar_feedback 关联**：语法反馈能准确关联到原始用户消息
4. ✅ **数据一致性**：前后端使用统一的 ID 标识

#### 后续优化建议

1. **后端验证**：
   - 检查后端是否正确处理 origin_message_id
   - 确认数据库中是否正确保存该字段
   - 验证去重逻辑是否生效

2. **前端监控**：
   - 添加更详细的日志追踪消息保存流程
   - 记录每条消息的 origin_message_id
   - 监控是否还有重复消息

3. **测试场景**：
   - 发送文本消息 → 检查数据库 origin_message_id
   - 发送语音消息 → 检查数据库 origin_message_id
   - 收到 grammar_feedback → 检查关联是否正确
   - 批量保存 → 检查是否有重复

---

### 📝 相关文件

- `/src/services/ant-design-pro/api.ts`
  - 修改：7 个接口添加或修改 origin_message_id 字段
  
- `/src/pages/spokenPages/SpokenPractice.tsx`
  - 修改：6 处 API 调用添加 origin_message_id 参数
  - 添加：详细的日志输出用于追踪

### ⏱️ 工作时长

约 2 小时（问题排查 + 方案实施 + 测试验证）
