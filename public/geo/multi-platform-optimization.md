# 多平台 GEO 优化指南
# GEO 优化 - 阶段 3 平台差异化策略

---

## Claude 优化

### 核心策略
- **索引源**：Brave Search（不是 Google 或 Bing）
- **特点**：极度选择性，只选最准确来源
- **优化方向**：最大化事实密度

### 优化方法

1. **确认 Brave Search 可索引**
   - 访问 https://search.brave.com
   - 搜索 "SpeakCube" 或 "口语魔方"
   - 确保网站出现在结果中

2. **事实密度优化**
   - 使用具体数字（10,000+ 学员，95% 好评）
   - 具名来源（剑桥英语、Princeton GEO 研究）
   - 带日期的统计（2026 年 3 月数据）

3. **准确性优先**
   - 避免夸张表述
   - 使用客观语言
   - 提供可验证信息

### 实施清单
- [ ] 确认 Brave Search 可索引
- [ ] 添加具体数字和日期
- [ ] 标注信息来源

---

## Gemini / AI Overview 优化

### 核心策略
- **索引源**：Google 索引 + Knowledge Graph
- **独特机制**："扇出查询"（自动拆解为多个子问题）
- **最大杠杆**：Schema 标记 +30-40%

### 优化方法

1. **内容集群建设**
   围绕一个主题建设多个相关内容：
   - KET 口语考试介绍
   - KET 口语备考指南
   - KET 口语真题练习
   - KET 口语评分标准

2. **FAQ 覆盖子问题**
   每个主题创建 FAQ，覆盖各种子问题：
   - 什么是 X？
   - 如何使用 X？
   - X 和 Y 有什么区别？
   - X 的价格是多少？

3. **Schema 标记**
   - Article Schema（文章页）
   - FAQPage Schema（FAQ 页）
   - HowTo Schema（教程页）
   - Person Schema（作者信息）

### 实施清单
- [x] Schema 标记已实现
- [ ] 建设内容集群
- [ ] 创建 FAQ 覆盖子问题

---

## Copilot 优化

### 核心策略
- **索引源**：Bing 索引
- **额外加权**：LinkedIn 和 GitHub 内容
- **关键动作**：提交 Bing Webmaster Tools

### 优化方法

1. **提交 Bing Webmaster Tools**
   - 访问 https://www.bing.com/webmasters
   - 验证网站所有权
   - 提交 sitemap.xml
   - 使用 IndexNow 协议加快索引

2. **LinkedIn/GitHub 存在**
   - 创建公司 LinkedIn 页面
   - 在 GitHub 发布开源项目
   - 链接回主站

3. **IndexNow 协议**
   自动通知 Bing 内容更新：
   ```
   POST https://api.indexnow.org/indexnow
   {
     "host": "www.qtoplay.com",
     "key": "YOUR_KEY",
     "keyLocation": "https://www.qtoplay.com/key.txt",
     "urlList": ["https://www.qtoplay.com/new-page"]
   }
   ```

### 实施清单
- [ ] 提交 Bing Webmaster Tools
- [ ] 创建 LinkedIn 页面
- [ ] 实施 IndexNow 协议

---

## Grok 优化

### 核心策略
- **索引源**：X (Twitter) 全量数据流
- **独特机制**：回复质量>主帖（回复权重是点赞 50%）
- **注意事项**：主帖放外链会让分数降低约 50%

### 优化方法

1. **X 平台策略**
   - 主帖不发外链
   - 外链只放在回复中
   - 重视回复质量（占总分 75% 以上）

2. **回复优化**
   - 提供有价值的信息
   - 详细解答问题
   - 使用数据和例子支持观点

3. **内容策略**
   - 发布口语学习技巧
   - 分享用户成功案例
   - 参与英语学习话题讨论

### 实施清单
- [ ] 创建 X 账号
- [ ] 制定内容发布计划
- [ ] 外链只放回复中

---

## 总结：各平台优先级

| 平台 | 优先级 | 关键动作 | 预计时间 |
|------|--------|----------|----------|
| ChatGPT | ⭐⭐⭐ | 模仿回答结构 + 月更 | 2 小时 |
| Perplexity | ⭐⭐⭐ | FAQPage Schema + PDF | 1 小时 |
| Claude | ⭐⭐ | Brave Search 确认 + 事实密度 | 30 分钟 |
| Gemini | ⭐⭐⭐ | 内容集群 + FAQ | 2 小时 |
| Copilot | ⭐⭐ | Bing Webmaster Tools | 30 分钟 |
| Grok | ⭐ | X 平台运营 | 持续 |

---

## 验证 Prompt 模板

在各平台测试：

```
"What is [你的品牌] and who is it best for? Include sources."

"[你的品牌] vs [竞品] — when should I choose each? Cite sources."

"How does [你的品牌] work for [使用场景]? Cite sources."

"What are the alternatives to [竞品]? Include [你的品牌]."
```

记录：
- 是否被提及
- 是否被引用带链接
- 引用的是哪个 URL
- 描述是否准确
