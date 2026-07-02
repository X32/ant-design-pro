# 语法分析消息接口使用示例

本文档展示如何在项目中使用语法分析消息相关的 API 接口。

## 📦 导入接口

在需要使用的组件中导入相关接口：

```typescript
import {
  createGrammarAnalysisMessage,
  getGrammarAnalysisMessageById,
  getGrammarAnalysisMessageByOriginId,
  deleteGrammarAnalysisMessage,
  CreateGrammarAnalysisParams,
  GrammarAnalysisMessage,
} from '@/services/ant-design-pro/api';
```

## 🔧 使用示例

### 1. 创建语法分析消息

当 WebSocket 后台处理完用户答案后，保存语法分析结果：

```typescript
// 在口语练习组件中
const saveGrammarAnalysis = async (conversationId: number, originMessageId: string) => {
  try {
    // 准备语法分析数据
    const grammarData: CreateGrammarAnalysisParams = {
      origin_message_id: originMessageId, // 关联用户答案消息
      exam_level: 'FCE',
      errors_json: JSON.stringify([
        {
          error_type: 'grammar',
          original_text: 'I goed to the store',
          corrected_text: 'I went to the store',
          explanation: '动词 go 的过去式应该是 went',
          severity: 'critical',
          criterion: 'b2_criterion'
        }
      ]),
      error_count: 1,
      improved_version: 'I went to the store yesterday.',
      suggestions_json: JSON.stringify([
        '注意不规则动词的过去式变化',
        '多阅读英文原著',
        '培养语感'
      ]),
      overall_quality: 'good',
      assessment_json: JSON.stringify({
        grammar: 6.5,
        vocabulary: 7.0,
        coherence: 7.5,
        task_achievement: 7.0
      }),
      relevance_score: 0.95,
      relevance_level: 'on_topic',
      relevance_reason: '回答与问题高度相关',
      round_num: 1,
    };

    // 调用接口保存
    const response = await createGrammarAnalysisMessage(conversationId, grammarData);
    
    if (response.success) {
      console.log('✅ 语法分析消息保存成功:', response.data);
      message.success('语法分析已保存');
      return response.data;
    } else {
      console.error('❌ 保存失败:', response.message);
      message.error(response.message || '保存失败');
      return null;
    }
  } catch (error) {
    console.error('❌ 保存语法分析消息异常:', error);
    message.error('保存失败，请重试');
    return null;
  }
};
```

### 2. 根据原始消息ID获取语法分析（推荐）

客户端通过自己生成的消息ID查询对应的语法反馈：

```typescript
const fetchGrammarByOriginId = async (originMessageId: string) => {
  try {
    const response = await getGrammarAnalysisMessageByOriginId(originMessageId);
    
    if (response.success && response.data) {
      console.log('✅ 获取语法分析成功');
      
      // 解析 JSON 字段
      const errors = JSON.parse(response.data.errors_json || '[]');
      const suggestions = JSON.parse(response.data.suggestions_json || '[]');
      const assessment = JSON.parse(response.data.assessment_json || '{}');
      
      // 显示语法分析结果
      showGrammarAnalysis({
        ...response.data,
        errors,
        suggestions,
        assessment,
      });
      
      return response.data;
    } else {
      console.warn('⚠️ 未找到语法分析结果');
      return null;
    }
  } catch (error) {
    console.error('❌ 获取语法分析异常:', error);
    return null;
  }
};
```

### 3. 根据消息ID获取语法分析

如果已知消息ID，可以直接查询：

```typescript
const fetchGrammarById = async (messageId: number) => {
  try {
    const response = await getGrammarAnalysisMessageById(messageId);
    
    if (response.success && response.data) {
      console.log('✅ 获取语法分析成功:', response.data);
      return response.data;
    } else {
      console.error('❌ 获取失败:', response.message);
      message.error(response.message || '获取失败');
      return null;
    }
  } catch (error) {
    console.error('❌ 获取语法分析异常:', error);
    message.error('获取失败，请重试');
    return null;
  }
};
```

### 4. 删除语法分析消息

```typescript
const removeGrammarAnalysis = async (messageId: number) => {
  try {
    const response = await deleteGrammarAnalysisMessage(messageId);
    
    if (response.success) {
      console.log('✅ 删除成功');
      message.success('语法分析已删除');
      return true;
    } else {
      console.error('❌ 删除失败:', response.message);
      message.error(response.message || '删除失败');
      return false;
    }
  } catch (error) {
    console.error('❌ 删除语法分析异常:', error);
    message.error('删除失败，请重试');
    return false;
  }
};
```

## 🔄 完整使用流程示例

在口语练习组件中集成语法分析功能：

```typescript
import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import {
  createGrammarAnalysisMessage,
  getGrammarAnalysisMessageByOriginId,
  CreateGrammarAnalysisParams,
} from '@/services/ant-design-pro/api';

const SpokenPractice: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<number>(1);

  // 生成唯一消息ID
  const generateOriginMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 发送用户答案
  const handleSendAnswer = async (answerText: string) => {
    // 生成原始消息ID
    const originMessageId = generateOriginMessageId();
    
    // 创建用户消息
    const userMessage = {
      id: originMessageId,
      content: answerText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // 发送到后端（WebSocket 或 API）
    // ... 发送逻辑
    
    // 轮询或等待 WebSocket 推送通知语法分析完成
    setTimeout(() => {
      fetchGrammarAnalysis(originMessageId);
    }, 2000);
  };

  // 获取语法分析结果
  const fetchGrammarAnalysis = async (originMessageId: string) => {
    try {
      const response = await getGrammarAnalysisMessageByOriginId(originMessageId);
      
      if (response.success && response.data) {
        // 解析数据
        const errors = JSON.parse(response.data.errors_json || '[]');
        const suggestions = JSON.parse(response.data.suggestions_json || '[]');
        const assessment = JSON.parse(response.data.assessment_json || '{}');
        
        // 创建AI反馈消息
        const grammarMessage = {
          id: response.data.id,
          content: {
            type: 'grammar_analysis',
            improvedVersion: response.data.improved_version,
            errors,
            suggestions,
            assessment,
            overallQuality: response.data.overall_quality,
            errorCount: response.data.error_count,
          },
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString(),
        };
        
        setMessages(prev => [...prev, grammarMessage]);
        message.success('语法分析已加载');
      } else {
        console.warn('语法分析还未完成');
      }
    } catch (error) {
      console.error('获取语法分析失败:', error);
    }
  };

  // WebSocket 接收到语法分析完成通知
  const handleGrammarAnalysisComplete = (originMessageId: string) => {
    console.log('📢 收到语法分析完成通知');
    fetchGrammarAnalysis(originMessageId);
  };

  return (
    <div>
      {/* 消息列表渲染 */}
      {/* ... */}
    </div>
  );
};

export default SpokenPractice;
```

## 📊 数据格式说明

### errors_json 格式

```typescript
interface ErrorItem {
  error_type: 'grammar' | 'spelling' | 'word_choice' | 'punctuation';
  original_text: string;
  corrected_text: string;
  explanation: string;
  severity: 'critical' | 'major' | 'minor';
  criterion: string;
}

// 示例
const errors: ErrorItem[] = [
  {
    error_type: 'grammar',
    original_text: 'I goed',
    corrected_text: 'I went',
    explanation: '动词 go 的过去式应该是 went',
    severity: 'critical',
    criterion: 'b2_criterion'
  }
];

const errorsJson = JSON.stringify(errors);
```

### suggestions_json 格式

```typescript
// 学习建议数组（最多3条）
const suggestions: string[] = [
  '注意不规则动词的过去式变化',
  '多阅读英文原著',
  '培养语感'
];

const suggestionsJson = JSON.stringify(suggestions);
```

### assessment_json 格式

```typescript
interface Assessment {
  grammar: number;        // 语法分数 (0-9)
  vocabulary: number;     // 词汇分数 (0-9)
  coherence: number;      // 连贯性分数 (0-9)
  task_achievement: number; // 任务完成度分数 (0-9)
}

// 示例
const assessment: Assessment = {
  grammar: 6.5,
  vocabulary: 7.0,
  coherence: 7.5,
  task_achievement: 7.0
};

const assessmentJson = JSON.stringify(assessment);
```

## ⚠️ 注意事项

1. **JSON 字符串处理**：所有 JSON 字段（`errors_json`, `suggestions_json`, `assessment_json`）都需要序列化为字符串后再发送

2. **origin_message_id 的重要性**：
   - 建议在发送用户答案时生成唯一ID
   - 用于后续查询对应的语法反馈
   - 支持在不知道 `message_id` 的情况下查询结果

3. **错误处理**：
   - 接口调用应包含 try-catch 错误处理
   - 检查 `response.success` 和 `response.error_code`
   - 提供友好的错误提示

4. **权限说明**：
   - 普通用户只能操作自己的语法分析消息
   - Token 会在接口内部自动添加

## 🔗 相关文档

- [语法分析 API - 前端开发快速参考](./GRAMMAR_MESSAGE_API_FRONTEND_GUIDE.md)
- [口语练习 API](./SPOKEN_PRACTICE_API.md)
- [语法分析输出规范](./GRAMMAR_ANALYSIS_OUTPUT_SPEC.md)

---

**最后更新**: 2026-02-03
