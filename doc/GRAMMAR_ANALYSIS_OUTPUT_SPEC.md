# 语法分析输出格式规范

## 📋 文档概述

本文档定义了 KET/PET/FCE 三个等级口语评测系统中，语法分析服务（`GrammarService`）返回的 JSON 输出格式规范。

**适用范围**：
- KET (A2) 语法分析：`grammar_analysis_ket`
- PET (B1) 语法分析：`grammar_analysis_pet`
- FCE (B2) 语法分析：`grammar_analysis_fce`

**文档版本**：v1.0  
**最后更新**：2026-02-02

---

## 🎯 核心设计原则

1. **分级评估**：三个等级采用不同的评分标准和关注点
2. **结构统一**：所有等级共享相同的 JSON 结构，便于系统解析
3. **可扩展性**：通过 `xxx_assessment` 字段支持各等级特定维度
4. **严格 JSON**：必须输出有效的 JSON 格式，不包含额外解释文本

---

## 📐 通用 JSON 结构

所有等级的语法分析输出均遵循以下基础结构：

```json
{
  "errors": [
    {
      "type": "错误类型",
      "original": "错误片段",
      "corrected": "修正后",
      "explanation": "错误说明",
      "severity": "critical/minor",
      "xxx_criterion": "对应评分维度"
    }
  ],
  "improved_version": "改进后的完整句子",
  "suggestions": [
    "建议1",
    "建议2",
    "建议3"
  ],
  "overall_quality": "excellent/good/fair/poor",
  "xxx_assessment": {
    "grammar_structure": "excellent/good/fair/poor",
    "vocabulary": "excellent/good/fair/poor",
    "coherence": "excellent/good/fair/poor"
  },
  "relevance_score": 0.85,
  "relevance_level": "on_topic/partially_on_topic/off_topic",
  "relevance_reason": "相关性判断理由"
}
```

---

## 🔵 KET (A2) 级别输出格式

### 完整示例

```json
{
  "errors": [
    {
      "type": "grammar",
      "original": "He go to school",
      "corrected": "He goes to school",
      "explanation": "第三人称单数缺少-s",
      "severity": "critical",
      "a2_criterion": "主谓一致"
    },
    {
      "type": "spelling",
      "original": "becaus",
      "corrected": "because",
      "explanation": "基础词汇拼写错误",
      "severity": "minor",
      "a2_criterion": "基础词汇"
    }
  ],
  "improved_version": "He goes to school because he wants to learn.",
  "suggestions": [
    "建议1:针对基础语法(例如:'注意 He/She/It 后面动词要加-s')",
    "建议2:针对词汇拼写(例如:'注意 because 的拼写,不是 becaus')",
    "建议3:针对句子连贯(例如:'使用 and 或 but 连接句子')"
  ],
  "overall_quality": "good",
  "a2_assessment": {
    "grammar_structure": "good",
    "vocabulary": "fair",
    "coherence": "good"
  },
  "relevance_score": 0.9,
  "relevance_level": "on_topic",
  "relevance_reason": "直接回答问题,句子完整,内容扣题"
}
```

### 字段说明

#### `errors` 数组

| 字段 | 类型 | 必填 | 说明 | 示例值 |
|------|------|------|------|--------|
| `type` | string | ✅ | 错误类型 | `grammar` / `spelling` / `word_choice` / `basic_structure` |
| `original` | string | ✅ | 错误片段 | `"He go"` |
| `corrected` | string | ✅ | 修正后 | `"He goes"` |
| `explanation` | string | ✅ | 按 A2 标准说明错误 | `"第三人称单数缺少-s"` |
| `severity` | string | ✅ | 严重程度 | `critical` / `minor` |
| `a2_criterion` | string | ✅ | A2 评分维度 | `主谓一致` / `时态` / `单复数` / `句子完整性` / `基础介词` / `基础词汇` / `简单连接词` |

**severity 判定标准**：
- `critical`：严重影响理解的基础错误（句子不完整、时态完全错误）
- `minor`：轻微错误（个别拼写错误）

#### `improved_version` 字符串

- **必填**：即使没有错误也必须输出
- **要求**：保持 A2 难度，使用基础词汇和简单句式，不要过度复杂化
- **示例**：`"I like apples and bananas."` ✅（简单）  
  ❌ `"I have a preference for apples as well as bananas."` (超纲)

#### `suggestions` 数组

- **长度**：固定 3 条建议
- **格式**：分三类
  1. 针对基础语法（He/She/It 加-s、一般过去时加-ed）
  2. 针对词汇拼写（because 拼写、复数加-s）
  3. 针对句子连贯（使用 and/but 连接、回答要完整）

#### `overall_quality` 枚举

按 A2 标准量化评估：

| 等级 | 标准 | 低级错误数量 |
|------|------|-------------|
| `excellent` | 基础语法正确，词汇拼写准确，句子完整 | ≤ 1处 |
| `good` | 有少量基础错误，但不影响基本理解 | 2-3处 |
| `fair` | 有明显基础错误（时态混乱、单复数错误多） | 4-6处 |
| `poor` | 基础错误较多，句子不完整，难以理解 | ≥ 7处 |

#### `a2_assessment` 对象

三维度评估（必填）：

```json
{
  "grammar_structure": "excellent/good/fair/poor (基础语法和简单句式)",
  "vocabulary": "excellent/good/fair/poor (基础词汇和拼写)",
  "coherence": "excellent/good/fair/poor (扣题性和基础连接词)"
}
```

#### 相关性字段

| 字段 | 类型 | 取值范围 | 说明 |
|------|------|---------|------|
| `relevance_score` | number | 0.0 - 1.0 | 相关性分数（小数） |
| `relevance_level` | string | `on_topic` / `partially_on_topic` / `off_topic` | 相关性等级 |
| `relevance_reason` | string | - | 按 A2 标准说明：是否直接回答问题、是否跑题、是否只回答单词 |

---

## 🟢 PET (B1) 级别输出格式

### 完整示例

```json
{
  "errors": [
    {
      "type": "sentence_structure",
      "original": "I go. I eat. I sleep.",
      "corrected": "I go to school, where I eat lunch and then sleep.",
      "explanation": "应使用复合句增加句式多样性",
      "severity": "critical",
      "b1_criterion": "句式多样性"
    },
    {
      "type": "word_choice",
      "original": "learn knowledge",
      "corrected": "gain knowledge",
      "explanation": "搭配应为 gain knowledge 而非 learn knowledge",
      "severity": "minor",
      "b1_criterion": "搭配准确性"
    }
  ],
  "improved_version": "I go to school every day because I want to gain knowledge. However, sometimes I feel tired, so I need to rest.",
  "suggestions": [
    "建议1:针对句式丰富度(例如:'尝试使用定语从句连接信息,如 which/that/who')",
    "建议2:针对词汇与搭配(例如:'避免重复使用 good,尝试 excellent/wonderful/fantastic')",
    "建议3:针对逻辑连贯(例如:'使用 however/therefore 表达转折和因果')"
  ],
  "overall_quality": "good",
  "b1_assessment": {
    "grammar_structure": "good",
    "vocabulary": "good",
    "coherence": "fair"
  },
  "relevance_score": 0.85,
  "relevance_level": "on_topic",
  "relevance_reason": "能解释原因并举例说明,论述有一定深度"
}
```

### 字段差异说明

#### `errors.type` 扩展类型

B1 新增类型：
- `sentence_structure`：句式结构问题
- `vocabulary_range`：词汇丰富度问题

#### `errors.b1_criterion` 评分维度

| 维度 | 说明 |
|------|------|
| `句式多样性` | 简单句与复合句混合使用 |
| `时态丰富度` | 现在时、过去时、将来时、完成时混用 |
| `从句运用` | 定语从句、状语从句、宾语从句 |
| `词汇丰富度` | 不重复使用同一词汇 |
| `搭配准确性` | 常见词组搭配正确 |
| `逻辑连接词` | however, therefore, in addition, furthermore |
| `论述展开` | 能解释原因、举例说明、对比分析 |

#### `overall_quality` 标准（B1）

| 等级 | 标准 |
|------|------|
| `excellent` | 句式丰富，时态多样，词汇不重复，逻辑清晰，几乎无语法错误 |
| `good` | 有复合句，时态较丰富，有少量搭配或从句错误（2-3处） |
| `fair` | 句式较单一，时态单调，词汇重复明显，逻辑连接词缺失 |
| `poor` | 全是简单句，只用一般现在时，词汇贫乏，无逻辑连接 |

#### `improved_version` 要求（B1）

- 使用复合句（定语从句、状语从句）
- 丰富时态（现在完成时、过去完成时）
- 高级连接词（however, therefore）
- 避免词汇重复

---

## 🔴 FCE (B2) 级别输出格式

### 完整示例

```json
{
  "errors": [
    {
      "type": "advanced_structure",
      "original": "If I was rich",
      "corrected": "If I were rich",
      "explanation": "应使用虚拟语气 If I were",
      "severity": "critical",
      "b2_criterion": "高级语法"
    },
    {
      "type": "collocation",
      "original": "open the light",
      "corrected": "turn on the light",
      "explanation": "搭配不地道,应为 turn on the light",
      "severity": "critical",
      "b2_criterion": "习语搭配"
    },
    {
      "type": "grammar",
      "original": "informations",
      "corrected": "information",
      "explanation": "仍有低级错误:information 不可数",
      "severity": "critical",
      "b2_criterion": "避免低级错误"
    }
  ],
  "improved_version": "If I were rich, I would utilize my resources to make a substantial contribution to society. Moreover, I would establish a foundation dedicated to environmental conservation.",
  "suggestions": [
    "建议1:针对复杂句式与高级语法(例如:'尝试使用虚拟语气表达假设,如 If I were/had been')",
    "建议2:针对高级词汇与习语(例如:'用高级词汇替换基础词:utilize代替use, substantial代替big')",
    "建议3:针对逻辑深度与交流策略(例如:'进行批判性分析,提出正反观点')"
  ],
  "overall_quality": "fair",
  "b2_assessment": {
    "grammar_structure": "good",
    "vocabulary": "fair",
    "coherence": "good"
  },
  "relevance_score": 0.8,
  "relevance_level": "on_topic",
  "relevance_reason": "论证有一定深度,但批判性分析不足"
}
```

### 字段差异说明

#### `errors.type` 扩展类型

B2 新增类型：
- `advanced_structure`：高级句式结构问题
- `collocation`：搭配问题
- `logic`：逻辑论证问题

#### `errors.b2_criterion` 评分维度

| 维度 | 说明 |
|------|------|
| `复杂句式` | 长从句、嵌套从句、倒装句 |
| `高级语法` | 虚拟语气、非谓语动词、独立主格 |
| `词汇精准度` | 细微差别的词能区分使用 |
| `习语搭配` | 固定搭配、短语动词、习语 |
| `逻辑严密性` | 论证有深度、层次清晰 |
| `高级连接词` | moreover, nevertheless, consequently |
| `深度论证` | 批判性思维、辩证分析 |
| `避免低级错误` | 不应出现单复数、时态等基础错误 |

#### `overall_quality` 标准（B2）

| 等级 | 标准 |
|------|------|
| `excellent` | 接近母语者水平，复杂句式流畅，高级词汇地道，逻辑严密，几乎无任何错误 |
| `good` | 能使用复杂句式和高级词汇，偶有搭配不当或逻辑不够深入（2-3处） |
| `fair` | 句式不够复杂，词汇不够高级，逻辑论证浅显，或仍有低级错误 |
| `poor` | 缺乏句式变化，词汇基础，逻辑混乱，低级错误多 |

#### `improved_version` 要求（B2）

- 复杂句式（长从句、嵌套从句、倒装句）
- 高级词汇（utilize, substantial, contribute）
- 地道习语（短语动词：look into, come across）
- 严密逻辑论证（批判性思维、辩证分析）
- **零低级错误**（不应出现 informations/advices 等错误）

---

## 📊 三级对比总结表

| 维度 | **KET (A2)** | **PET (B1)** | **FCE (B2)** |
|------|-------------|-------------|-------------|
| **errors.type** | grammar, spelling, word_choice, basic_structure | + sentence_structure, vocabulary_range | + advanced_structure, collocation, logic |
| **criterion 字段** | `a2_criterion` | `b1_criterion` | `b2_criterion` |
| **assessment 字段** | `a2_assessment` | `b1_assessment` | `b2_assessment` |
| **improved_version 要求** | 基础词汇+简单句式 | 复合句+丰富时态+高级连接词 | 复杂句式+高级词汇+地道习语+严密逻辑 |
| **suggestions 重点** | 基础语法、拼写、简单连接词 | 句式丰富度、词汇搭配、逻辑连贯 | 高级语法、习语、批判性思维 |
| **overall_quality 分界** | 1/2-3/4-6/7+ 处错误 | 句式/时态/词汇丰富度 | 复杂度/地道性/低级错误 |
| **relevance_reason 重点** | 是否直接回答、完整句子 | 能否解释原因、举例 | 论证深度、批判性思维 |

---

## 🔧 系统集成说明

### 调用流程

```python
from workflow.server.grammar_service import GrammarService

# 调用语法分析服务
result = await GrammarService.analyze_and_correct(
    user_answer="He go to school yesterday",
    round_num=1,
    timeout=10.0,
    question_text="Where did you go yesterday?",
    exam_level="KET"  # 或 "PET" / "FCE"
)

# 解析返回的 JSON
if result:
    errors = result.get("errors", [])
    improved_version = result.get("improved_version")
    overall_quality = result.get("overall_quality")
    a2_assessment = result.get("a2_assessment")  # KET
    # 或 b1_assessment / b2_assessment
```

### 提示词路由逻辑

系统根据 `exam_level` 参数自动路由到对应的提示词：

```python
exam_key = (exam_level or "").strip().upper()
if exam_key in ("FCE", "PET", "KET"):
    prompt_type = f"grammar_analysis_{exam_key.lower()}"
    prompt_template = PromptManager.get(prompt_type)
```

- `exam_level="KET"` → 使用 `grammar_analysis_ket` 提示词
- `exam_level="PET"` → 使用 `grammar_analysis_pet` 提示词
- `exam_level="FCE"` → 使用 `grammar_analysis_fce` 提示词

### 错误处理

如果 LLM 返回的不是有效 JSON，系统会：

1. 记录警告日志
2. 返回 `None`
3. 不影响正常消息发送

---

## 📝 注意事项

### 1. 严格 JSON 格式

- ❌ **禁止**：在 JSON 外包含解释文本
  ```json
  这是分析结果：
  { "errors": [...] }
  ```

- ✅ **正确**：纯 JSON 输出
  ```json
  { "errors": [...] }
  ```

### 2. 必填字段

以下字段**不能为空**：
- `errors`（可以是空数组 `[]`）
- `improved_version`
- `suggestions`（必须是 3 条）
- `overall_quality`
- `xxx_assessment`（对应等级的评估对象）
- `relevance_score`
- `relevance_level`
- `relevance_reason`

### 3. 分级评估边界

- **不要降纲**：KET 不要用 A1 标准
- **不要超纲**：KET 不要用 B1/B2 标准要求
- **保持一致**：同一等级的评估标准要前后一致

### 4. 建议的可执行性

❌ **泛泛而谈**：
- "提高语法水平"
- "多读多写"

✅ **具体可执行**：
- "注意 He/She/It 后面动词要加-s"（KET）
- "尝试使用定语从句连接信息，如 which/that/who"（PET）
- "尝试使用虚拟语气表达假设，如 If I were"（FCE）

---

## 🔗 相关文档

- [KET/PET/FCE 评分标准](./KET_PET_FCE评分标准.md)
- [口语练习 API](./SPOKEN_PRACTICE_API.md)
- [语法分析服务代码](../src/workflow/server/grammar_service.py)
- [提示词管理](../src/workflow/server/prompt_manager.py)

---

## 📌 附录：完整字段清单

### 通用字段

| 字段路径 | 类型 | 必填 | 取值范围 | 说明 |
|---------|------|------|---------|------|
| `errors` | array | ✅ | - | 错误列表（可为空数组） |
| `errors[].type` | string | ✅ | 见各等级说明 | 错误类型 |
| `errors[].original` | string | ✅ | - | 错误片段 |
| `errors[].corrected` | string | ✅ | - | 修正后 |
| `errors[].explanation` | string | ✅ | - | 错误说明 |
| `errors[].severity` | string | ✅ | `critical` / `minor` | 严重程度 |
| `errors[].xxx_criterion` | string | ✅ | 见各等级说明 | 评分维度 |
| `improved_version` | string | ✅ | - | 改进后的完整句子 |
| `suggestions` | array | ✅ | 固定3条 | 学习建议 |
| `suggestions[]` | string | ✅ | - | 单条建议 |
| `overall_quality` | string | ✅ | `excellent` / `good` / `fair` / `poor` | 整体质量 |
| `xxx_assessment` | object | ✅ | - | 分级评估对象 |
| `xxx_assessment.grammar_structure` | string | ✅ | `excellent` / `good` / `fair` / `poor` | 语法结构评估 |
| `xxx_assessment.vocabulary` | string | ✅ | `excellent` / `good` / `fair` / `poor` | 词汇评估 |
| `xxx_assessment.coherence` | string | ✅ | `excellent` / `good` / `fair` / `poor` | 连贯性评估 |
| `relevance_score` | number | ✅ | 0.0 - 1.0 | 相关性分数 |
| `relevance_level` | string | ✅ | `on_topic` / `partially_on_topic` / `off_topic` | 相关性等级 |
| `relevance_reason` | string | ✅ | - | 相关性判断理由 |

### 等级特定字段

| 等级 | `errors[].xxx_criterion` 字段名 | `xxx_assessment` 字段名 |
|------|-------------------------------|------------------------|
| KET (A2) | `a2_criterion` | `a2_assessment` |
| PET (B1) | `b1_criterion` | `b1_assessment` |
| FCE (B2) | `b2_criterion` | `b2_assessment` |

---

**文档维护者**：Qoder AI  
**联系方式**：参见项目 README  
**版权声明**：© 2026 口语评测系统开发团队
