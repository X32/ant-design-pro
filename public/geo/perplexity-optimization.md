# Perplexity 搜索优化指南
# GEO 优化 - 阶段 3 平台差异化策略

## Perplexity 优化要点

### 核心策略
- **索引源**：自有索引 + Google 索引
- **最大差异化杠杆**：FAQPage Schema + 公开 PDF
- **偏好**：高频发布 + 原子化段落

### 优化方法

#### 1. FAQPage Schema（必须）

Perplexity 特别偏好 FAQPage Schema，已在首页实现。

示例：
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "KET 口语考试难吗？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "KET 口语考试是剑桥英语 A2 级别考试，难度适中..."
      }
    }
  ]
}
```

#### 2. 公开 PDF 文档

将白皮书、研究报告做成公开可下载 PDF：

建议创建：
- 《剑桥英语口语考试指南.pdf》
- 《KET/PET/FCE 备考白皮书.pdf》
- 《AI 口语评分标准说明.pdf》

放置位置：`/downloads/` 目录

#### 3. 原子化段落

- 每段只讲一个观点
- 段落长度 40-60 词
- 段落首句即答案
- 避免上下文依赖

#### 4. 高频发布

- 每周发布新内容
- 保持内容更新
- 添加发布日期

---

## 实施清单

- [x] FAQPage Schema 已实现
- [ ] 创建白皮书 PDF
- [ ] 段落原子化优化
- [ ] 建立内容发布计划

---

## 验证方法

在 Perplexity 中测试：
```
"What is SpeakCube?"
"Best KET speaking practice apps"
```

检查是否被引用、是否带链接。
