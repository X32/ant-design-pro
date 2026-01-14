# Messages 页面改造指南

## 改造目标
将 messages 页面从通用消息管理改造为**口语练习会话管理**页面。

## 已完成的修改

### 1. types.ts ✅
- 添加了 `SpokenConversation` 接口
- 添加了 `SpokenMessage` 接口  
- 添加了 `TranscriptionStatus` 枚举
- 扩展了 `SessionStatus` 和 `MessageType` 枚举

### 2. API导入 ✅
```typescript
import { 
  getSpokenConversations,
  getSpokenMessages,
  updateSpokenConversation,
  createSpokenConversation
} from '@/services/ant-design-pro/api';
```

### 3. 核心函数 ✅
- `fetchConversations()` - 使用 `getSpokenConversations` 接口
- `fetchMessages()` - 使用 `getSpokenMessages` 接口
- `handleDeleteConversation()` - 使用 `updateSpokenConversation` 更新状态为 archived
- `handleEditConversation()` - 打开编辑模态框
- `handleSaveConversation()` - 保存会话编辑

## 需要手动修复的错误

由于文件较大，以下部分需要你手动查找替换:

### 1. 会话列表表格列定义 (约第355-380行)

**查找:**
```typescript
render: (_: any, record: Session) => (
```

**替换为:**
```typescript
render: (_: any, record: SpokenConversation) => (
```

**查找:**
```typescript
onClick={() => setSelectedSession(record)}
```

**替换为:**
```typescript
onClick={() => setSelectedConversation(record)}
```

**查找:**
```typescript
onConfirm={() => handleDeleteSession(record.id)}
```

**替换为:**
```typescript
onConfirm={() => handleDeleteConversation(record.id)}
```

**查找:**
```typescript
<Button type="text" icon={<EditOutlined />} size="small">
  编辑
</Button>
```

**替换为:**
```typescript
<Button 
  type="text" 
  icon={<EditOutlined />} 
  size="small"
  onClick={() => handleEditConversation(record)}
>
  编辑
</Button>
```

### 2. 消息列表表格列定义 (约第439-500行)

**查找:**
```typescript
render: (text: string, record: Message) => (
```

**替换为:**
```typescript
render: (text: string, record: SpokenMessage) => (
```

**查找 (约第479行):**
```typescript
render: (_: any, record: Message) => (
```

**替换为:**
```typescript
render: (_: any, record: SpokenMessage) => (
```

**删除"编辑"按钮** (因为口语练习消息不支持编辑):
```typescript
<Button type="text" icon={<EditOutlined />} size="small">
  编辑
</Button>
```

**删除"删除"按钮相关代码** (因为我们没有实现消息删除API):
```typescript
<Popconfirm
  title="确定要删除这条消息吗？88"
  onConfirm={() => handleDeleteMessage(record.id)}
  okText="确定"
  cancelText="取消"
>
  <Button type="text" danger icon={<DeleteOutlined />} size="small">
    删除
  </Button>
</Popconfirm>
```

### 3. 会话列表渲染 (约第586-620行)

**查找:**
```typescript
{sessions.map(session => (
  <div
    key={session.id}
    className={`session-item ${selectedSession?.id === session.id ? 'selected' : ''}`}
    onClick={() => setSelectedSession(session)}
  >
```

**替换为:**
```typescript
{conversations.map(conversation => (
  <div
    key={conversation.id}
    className={`session-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
    onClick={() => setSelectedConversation(conversation)}
  >
```

**内部所有 `session` 变量替换为 `conversation`:**
```typescript
<div className="session-title">{conversation.title}</div>
<div className={`session-status ${conversation.status === 'active' ? 'status-active' : 'status-deleted'}`}>
  {conversation.status === 'active' ? '有效' : 
   conversation.status === 'completed' ? '已完成' : '已归档'}
</div>
<div className="session-id">{conversation.id}</div>
<div className="user-id">{conversation.user_id}</div>
<div className="message-count">{conversation.total_messages} 条消息 / {conversation.total_rounds} 轮</div>
<div className="update-time">{new Date(conversation.last_message_time || conversation.created_at).toLocaleString()}</div>
```

### 4. 消息列表渲染 (约第626-670行)

**查找:**
```typescript
{selectedSession && (
  <span className="session-info">
    会话: {selectedSession.title}
  </span>
)}
```

**替换为:**
```typescript
{selectedConversation && (
  <span className="session-info">
    会话: {selectedConversation.title}
  </span>
)}
```

**内部消息映射:**
```typescript
{messages.map(msg => (
  <div
    key={msg.id}
    className={`message-item ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
    onClick={() => setSelectedMessage(msg)}
  >
    <div className="message-header">
      <div className="message-id">{msg.id}</div>
      <div className="message-meta">
        <span className={`role-tag role-${msg.sender}`}>
          {msg.sender === 'user' ? '用户' : 'AI'}
        </span>
        <span className="sequence-number">#{msg.round_num || 0}</span>
      </div>
    </div>
    <div className="message-preview">
      {msg.message_type === 'image' && msg.image_url && (
        <img 
          src={msg.image_url} 
          alt="预览" 
          className="image-preview"
        />
      )}
      {msg.message_type === 'voice' && msg.transcription_text && (
        <span>[语音] {msg.transcription_text.substring(0, 50)}...</span>
      )}
      {msg.message_type === 'text' && msg.content}
      {msg.message_type === 'score' && '评分消息'}
    </div>
    <div className="message-footer">
      <div className="message-type">
        {msg.message_type === 'text' ? '文本' : 
         msg.message_type === 'voice' ? '语音' : 
         msg.message_type === 'image' ? '图片' : '评分'}
      </div>
      <div className="create-time">{new Date(msg.timestamp).toLocaleString()}</div>
    </div>
  </div>
))}
```

### 5. 分页组件 (约第616行和658行)

**会话分页查找:**
```typescript
total={totalSessions}
```

**替换为:**
```typescript
total={totalConversations}
```

### 6. 右侧详情面板 (约第686-800行)

**需要完全重写消息详情显示，因为 SpokenMessage 不再有 contents 数组。**

**查找约第686-730行的代码段并替换为:**

```typescript
<div className="content-detail">
  <div className="detail-header">
    <span>消息详情</span>
  </div>
  <div className="detail-content">
    {selectedMessage ? (
      <>
        {/* 消息基础信息 */}
        <div className="message-info">
          <div className="info-item">
            <div className="info-label">消息 ID:</div>
            <div className="info-value">{selectedMessage.id}</div>
          </div>
          <div className="info-item">
            <div className="info-label">发送者:</div>
            <div className="info-value">
              {selectedMessage.sender === 'user' ? '用户' : 'AI'}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">轮次:</div>
            <div className="info-value">#{selectedMessage.round_num || 0}</div>
          </div>
          <div className="info-item">
            <div className="info-label">类型:</div>
            <div className="info-value">
              {selectedMessage.message_type === 'text' ? '文本' : 
               selectedMessage.message_type === 'voice' ? '语音' : 
               selectedMessage.message_type === 'image' ? '图片' : '评分'}
            </div>
          </div>
          <div className="info-item">
            <div className="info-label">创建时间:</div>
            <div className="info-value">{new Date(selectedMessage.timestamp).toLocaleString()}</div>
          </div>
        </div>
        
        {/* 消息内容显示 */}
        <div className="content-section">
          <div className="section-header">
            <span>消息内容</span>
          </div>
          
          {/* 文本消息 */}
          {selectedMessage.message_type === 'text' && (
            <div className="text-content">
              <pre>{selectedMessage.content}</pre>
            </div>
          )}
          
          {/* 语音消息 */}
          {selectedMessage.message_type === 'voice' && (
            <div className="voice-content">
              {selectedMessage.audio_url && (
                <div className="audio-player">
                  <audio controls src={selectedMessage.audio_url}></audio>
                </div>
              )}
              {selectedMessage.transcription_text && (
                <div className="transcription">
                  <div className="label">转写文本:</div>
                  <div className="text">{selectedMessage.transcription_text}</div>
                </div>
              )}
              <div className="transcription-status">
                转写状态: {selectedMessage.transcription_status || 'pending'}
              </div>
            </div>
          )}
          
          {/* 图片消息 */}
          {selectedMessage.message_type === 'image' && selectedMessage.image_url && (
            <div className="image-content">
              <img src={selectedMessage.image_url} alt="消息图片" style={{maxWidth: '100%'}} />
            </div>
          )}
          
          {/* 评分消息 */}
          {selectedMessage.message_type === 'score' && (
            <div className="score-content">
              <div className="score-item">
                <strong>总分:</strong> {selectedMessage.total_score}
              </div>
              {selectedMessage.dimension_scores && (
                <div className="score-item">
                  <strong>维度评分:</strong>
                  <pre>{selectedMessage.dimension_scores}</pre>
                </div>
              )}
              {selectedMessage.advantages && (
                <div className="score-item">
                  <strong>优点:</strong>
                  <pre>{selectedMessage.advantages}</pre>
                </div>
              )}
              {selectedMessage.disadvantages && (
                <div className="score-item">
                  <strong>缺点:</strong>
                  <pre>{selectedMessage.disadvantages}</pre>
                </div>
              )}
              {selectedMessage.suggestions && (
                <div className="score-item">
                  <strong>建议:</strong>
                  <pre>{selectedMessage.suggestions}</pre>
                </div>
              )}
              {selectedMessage.improved_answer && (
                <div className="score-item">
                  <strong>改进答案:</strong>
                  <pre>{selectedMessage.improved_answer}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </>
    ) : (
      <div className="empty-state">请选择一条消息查看详情</div>
    )}
  </div>
  <div className="detail-footer">
    <Button onClick={() => setSelectedMessage(null)}>关闭</Button>
  </div>
</div>
```

### 7. 模态框部分 (约第820-870行)

**删除原有的内容编辑模态框，替换为会话编辑模态框:**

```typescript
{/* 会话编辑模态框 */}
<Modal
  title="编辑会话"
  visible={editModalVisible}
  onOk={handleSaveConversation}
  onCancel={() => setEditModalVisible(false)}
  width={500}
>
  <Form form={editForm} layout="vertical">
    <Form.Item
      name="title"
      label="会话标题"
      rules={[{ required: true, message: '请输入会话标题' }]}
    >
      <Input placeholder="请输入会话标题" />
    </Form.Item>
    
    <Form.Item
      name="status"
      label="会话状态"
      rules={[{ required: true, message: '请选择会话状态' }]}
    >
      <Select placeholder="请选择会话状态">
        <Option value="active">活跃</Option>
        <Option value="completed">已完成</Option>
        <Option value="archived">已归档</Option>
      </Select>
    </Form.Item>
  </Form>
</Modal>
```

### 8. 筛选下拉框选项 (约第560-580行)

**会话状态筛选更新:**
```typescript
<Select
  placeholder="选择状态"
  value={filterParams.status || undefined}
  onChange={(value) => handleFilter('status', value)}
  style={{ width: 120 }}
>
  <Option value="active">活跃</Option>
  <Option value="completed">已完成</Option>
  <Option value="archived">已归档</Option>
</Select>
```

**删除"角色"筛选** (口语练习不需要):
```typescript
<Select
  placeholder="选择角色"
  ...
>
  ...
</Select>
```

## 测试建议

修改完成后,测试以下功能:

1. ✅ 页面加载时自动获取口语练习会话列表
2. ✅ 点击会话查看该会话的消息列表
3. ✅ 查看不同类型的消息详情 (文本、语音、图片、评分)
4. ✅ 编辑会话标题和状态
5. ✅ 删除(归档)会话
6. ✅ 状态筛选功能
7. ✅ 分页功能

## API 对应关系

| 操作 | API 函数 | 说明 |
|-----|---------|------|
| 获取会话列表 | `getSpokenConversations` | 支持状态筛选和分页 |
| 获取消息列表 | `getSpokenMessages` | 根据会话ID获取 |
| 更新会话 | `updateSpokenConversation` | 修改标题/状态 |
| 删除会话 | `updateSpokenConversation` | 设置status='archived' |

## 数据结构变化

### SpokenConversation (会话)
```typescript
{
  id: number;                    // 会话ID
  user_id: number;               // 用户ID
  exercise_id?: number;          // 练习题ID
  workflow_type?: string;        // 工作流类型
  title?: string;                // 会话标题
  status: 'active' | 'completed' | 'archived';  // 状态
  total_messages: number;        // 总消息数
  total_rounds: number;          // 总轮数
  last_message_time?: string;    // 最后消息时间
  created_at: string;            // 创建时间
  updated_at?: string;           // 更新时间
  last_message_preview?: string; // 最后消息预览
}
```

### SpokenMessage (消息)
```typescript
{
  id: number;                    // 消息ID
  conversation_id: number;       // 所属会话ID
  user_id: number;               // 用户ID
  sender: 'user' | 'ai';         // 发送者
  message_type: 'text' | 'voice' | 'image' | 'score';  // 消息类型
  content: string;               // 消息内容
  round_num?: number;            // 轮次号
  timestamp: string;             // 时间戳
  
  // 语音消息特有字段
  audio_file_path?: string;
  audio_url?: string;
  transcription_text?: string;
  transcription_status?: string;
  
  // 图片消息特有字段
  image_url?: string;
  
  // 评分消息特有字段
  total_score?: string;
  dimension_scores?: string;
  advantages?: string;
  disadvantages?: string;
  suggestions?: string;
  improved_answer?: string;
  raw_text?: string;
}
```

## 总结

改造完成后，这个页面将成为一个专门用于管理用户口语练习会话的后台管理页面，你可以:
- 查看所有用户的口语练习会话
- 查看每个会话中的详细消息(包括文本、语音、图片、评分)
- 编辑会话信息
- 归档不需要的会话
- 按状态筛选会话

祝改造顺利！🎉
