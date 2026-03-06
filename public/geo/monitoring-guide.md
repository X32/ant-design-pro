# GEO 监控与迭代指南
# GEO 优化 - 阶段 5 监控与迭代

## 每周监控循环

### 步骤 1：准备验证 Prompt

准备 30-80 个固定 prompt，覆盖：
- 品牌定义
- 竞品对比
- 使用场景
- 行业问题

### 步骤 2：在各平台跑测试

**测试平台**：
- ChatGPT (chat.openai.com)
- Perplexity (perplexity.ai)
- Google AI Overview (google.com)
- Claude (claude.ai)
- Bing Chat (bing.com/chat)

**测试频率**：每周一次

### 步骤 3：记录结果

创建监控表格：

| 日期 | 平台 | Prompt | 是否提及 | 是否带链接 | 引用 URL | 描述准确 |
|------|------|--------|----------|------------|----------|----------|
| 2026-03-06 | ChatGPT | What is SpeakCube? | ✅ | ✅ | qtoplay.com | ✅ |
| 2026-03-06 | Perplexity | Best KET apps | ✅ | ❌ | - | ✅ |

---

## 验证 Prompt 模板

### 品牌定义类

```
"What is SpeakCube and who is it best for? Include sources."

"口语魔方 SpeakCube 是什么？适合什么人使用？"

"Tell me about SpeakCube AI speaking practice platform."
```

### 竞品对比类

```
"SpeakCube vs [竞品] — when should I choose each? Cite sources."

"口语魔方和 [竞品] 哪个更好？"

"Best alternatives to [竞品] for speaking practice?"
```

### 使用场景类

```
"How does SpeakCube work for KET preparation? Cite sources."

"口语魔方适合备考 KET 吗？"

"Can SpeakCube help improve pronunciation?"
```

### 行业问题类

```
"Best AI speaking practice apps 2026"

"剑桥英语口语练习软件推荐"

"How to practice speaking for Cambridge exams?"
```

---

## Google Analytics 监控

### 追踪 AI 来源流量

**自动附加参数**：
- `utm_source=chatgpt.com` (OpenAI 自动附加)
- `utm_source=perplexity.ai`
- `utm_source=claude.ai`

**GA4 配置**：

1. **创建自定义维度**
   ```
   维度名称：AI Source
   作用域：会话
   参数：utm_source
   ```

2. **创建探索报告**
   ```
   技术 > 流量来源
   筛选：utm_source 包含 chatgpt|perplexity|claude
   ```

3. **监控指标**
   - AI 来源会话数
   - AI 来源转化率
   - AI 来源用户留存率

### 监控仪表板

创建自定义仪表板：

**关键指标**：
- AI 来源流量（周环比）
- AI 来源转化率
- 被引用次数
- 引用准确性

---

## 月度报告模板

### GEO 优化月度报告

**月份**：2026 年 3 月

**关键指标**：
| 指标 | 本月 | 上月 | 变化 |
|------|------|------|------|
| AI 来源流量 | 1,234 | 890 | +38% |
| 被引用次数 | 45 | 32 | +41% |
| 引用准确性 | 92% | 88% | +4% |
| ChatGPT 提及 | 28 | 19 | +47% |

**平台表现**：
| 平台 | 引用次数 | 带链接 | 准确性 |
|------|----------|--------|--------|
| ChatGPT | 28 | 25 | 95% |
| Perplexity | 12 | 10 | 90% |
| Claude | 3 | 2 | 80% |
| Gemini | 2 | 2 | 100% |

**优化动作**：
- [x] 更新首页 TL;DR 摘要
- [x] 添加 FAQPage Schema
- [x] 发布 2 篇博客文章
- [ ] Reddit 社区参与（进行中）

**下月计划**：
- 创建白皮书 PDF
- 提交 Bing Webmaster Tools
- 增加内容更新频率

---

## 警报机制

### 设置 Google Alerts

**监控关键词**：
- "SpeakCube"
- "口语魔方"
- "SpeakCube review"
- "口语魔方 怎么样"

**警报频率**：每天一次

**接收邮箱**：marketing@qtoplay.com

### 负面提及处理

1. **发现负面提及**
   - 记录 URL 和平台
   - 评估影响范围

2. **回应策略**
   - 事实错误：礼貌纠正
   - 用户体验：提供解决方案
   - 恶意攻击：忽略或举报

3. **跟踪结果**
   - 记录处理过程
   - 监控后续讨论

---

## 持续优化循环

```
每周监控 → 发现问题 → 优化内容 → 验证效果 → 下周监控
```

**优化优先级**：
1. 引用准确性低 → 更新内容
2. 未被引用 → 优化 Schema/结构
3. 负面提及 → 改进产品/服务
4. 竞品超过 → 分析对手策略

---

## 工具推荐

| 工具 | 用途 | 价格 |
|------|------|------|
| Google Analytics | 流量监控 | 免费 |
| Google Alerts | 品牌监控 | 免费 |
| Ahrefs | 反向链接监控 | $99/月 |
| Mention | 社交媒体监控 | $29/月 |
| ChatGPT | 引用测试 | $20/月 |

---

## 成功指标

**短期（1-3 个月）**：
- AI 来源流量 +50%
- 被引用次数 +100%
- 引用准确性 > 90%

**中期（3-6 个月）**：
- AI 来源流量 +200%
- 进入 Top 3 被引用来源
- 负面提及 < 5%

**长期（6-12 个月）**：
- AI 来源成为主要流量来源
- 行业第一被引用品牌
- 建立权威地位
