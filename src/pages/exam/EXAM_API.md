# 考试管理系统 API 文档

**基础信息**
- **Base URL**: `http://127.0.0.1:9002`
- **认证方式**: JWT Bearer Token
- **Content-Type**: `application/json`

---
##数据库表设计

-- ==================== 试卷主表 ====================
CREATE TABLE `oral_exam_paper` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '试卷主键ID',
    `paper_code` VARCHAR(32) NOT NULL COMMENT '试卷唯一编号（如PET202601-001，便于业务识别）',
    `paper_name` VARCHAR(100) NOT NULL COMMENT '试卷名称（如PET口语2026年1月模拟卷）',
    `total_score` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '试卷总分',
    `apply_category_id` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '适用的一级分类ID（关联oral_category）',
    `is_active` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '是否启用（1:是，0:否）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_paper_code` (`paper_code`) COMMENT '试卷编号唯一，避免重复',
    KEY `idx_apply_category` (`apply_category_id`) COMMENT '按适用分类查询试卷'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='口语试卷主表';

-- ==================== 试卷-练习题关联表 ====================
CREATE TABLE `oral_exam_paper_question` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '关联记录ID',
    `paper_id` BIGINT UNSIGNED NOT NULL COMMENT '关联试卷主表ID',
    `exercise_id` BIGINT UNSIGNED NOT NULL COMMENT '关联练习题表ID（oral_exercise）',
    `question_score` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '该题在试卷中的分值',
    `sort` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '题目在试卷中的排序（数字越大越靠前）',
    `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_paper_exercise` (`paper_id`, `exercise_id`) COMMENT '防止同一试卷重复添加同一道练习题',
    KEY `idx_paper_id` (`paper_id`) COMMENT '核心索引：按试卷ID查询所有题目',
    KEY `idx_exercise_id` (`exercise_id`) COMMENT '按练习题ID查询所属试卷'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='试卷-练习题关联表（核心关联表）';

## 目录

- [认证说明](#认证说明)
- [试卷管理接口](#试卷管理接口)
  - [创建试卷](#1-创建试卷)
  - [获取试卷详情](#2-获取试卷详情)
  - [根据编号获取试卷](#3-根据编号获取试卷)
  - [获取试卷列表](#4-获取试卷列表)
  - [搜索试卷](#5-搜索试卷)
  - [更新试卷](#6-更新试卷)
  - [删除试卷](#7-删除试卷)
- [试卷题目管理接口](#试卷题目管理接口)
  - [添加题目到试卷](#1-添加题目到试卷)
  - [批量添加题目](#2-批量添加题目)
  - [获取试卷所有题目](#3-获取试卷所有题目)
  - [更新试卷中题目信息](#4-更新试卷中题目信息)
  - [从试卷移除题目](#5-从试卷移除题目)
- [数据模型](#数据模型)
- [错误处理](#错误处理)

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

## 试卷管理接口

### 1. 创建试卷

创建一份新的考试试卷。

**接口地址**: `POST /api/exam/papers`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| paper_code | string | ✅ | 试卷唯一编号，不可重复 | "PET202601-001" |
| paper_name | string | ✅ | 试卷名称 | "PET口语2026年1月模拟卷" |
| total_score | integer | ❌ | 试卷总分，默认0 | 100 |
| apply_category_id | integer | ❌ | 适用的一级分类ID，默认0 | 1 |
| is_active | integer | ❌ | 是否启用，1启用/0禁用，默认1 | 1 |

**请求示例**:

```json
{
  "paper_code": "PET202601-001",
  "paper_name": "PET口语2026年1月模拟卷",
  "total_score": 100,
  "apply_category_id": 1,
  "is_active": 1
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "试卷创建成功",
  "data": {
    "id": 1,
    "paper_code": "PET202601-001",
    "paper_name": "PET口语2026年1月模拟卷",
    "total_score": 100,
    "apply_category_id": 1,
    "is_active": 1,
    "create_time": "2026-01-02T10:00:00",
    "update_time": "2026-01-02T10:00:00"
  }
}
```

**前端调用示例**:

```javascript
// axios 示例
const response = await axios.post('/api/exam/papers', {
  paper_code: 'PET202601-001',
  paper_name: 'PET口语2026年1月模拟卷',
  total_score: 100,
  apply_category_id: 1
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// fetch 示例
const response = await fetch('http://127.0.0.1:9002/api/exam/papers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    paper_code: 'PET202601-001',
    paper_name: 'PET口语2026年1月模拟卷',
    total_score: 100,
    apply_category_id: 1
  })
});
```

---

### 2. 获取试卷详情

根据试卷ID获取试卷详细信息。

**接口地址**: `GET /api/exam/papers/{paper_id}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |

**响应示例**:

```json
{
  "success": true,
  "message": "获取试卷成功",
  "data": {
    "id": 1,
    "paper_code": "PET202601-001",
    "paper_name": "PET口语2026年1月模拟卷",
    "total_score": 100,
    "apply_category_id": 1,
    "is_active": 1,
    "create_time": "2026-01-02T10:00:00",
    "update_time": "2026-01-02T10:00:00"
  }
}
```

**前端调用示例**:

```javascript
// axios
const response = await axios.get(`/api/exam/papers/${paperId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// fetch
const response = await fetch(`http://127.0.0.1:9002/api/exam/papers/${paperId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### 3. 根据编号获取试卷

根据试卷编号（paper_code）获取试卷信息。

**接口地址**: `GET /api/exam/papers/code/{paper_code}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_code | string | ✅ | 试卷编号 |

**响应示例**: 同"获取试卷详情"

**前端调用示例**:

```javascript
// axios
const response = await axios.get(`/api/exam/papers/code/${paperCode}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

### 4. 获取试卷列表

获取试卷列表，支持按分类筛选和分页。

**接口地址**: `GET /api/exam/papers`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| apply_category_id | integer | ❌ | 适用分类ID（筛选） | - |
| only_active | boolean | ❌ | 是否仅返回启用的试卷 | true |
| page | integer | ❌ | 页码 | 1 |
| page_size | integer | ❌ | 每页数量（最大100） | 20 |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paper_code": "PET202601-001",
      "paper_name": "PET口语2026年1月模拟卷",
      "total_score": 100,
      "apply_category_id": 1,
      "is_active": 1,
      "create_time": "2026-01-02T10:00:00",
      "update_time": "2026-01-02T10:00:00"
    }
  ],
  "total": 1,
  "message": "找到 1 份试卷"
}
```

**前端调用示例**:

```javascript
// axios
const response = await axios.get('/api/exam/papers', {
  params: {
    apply_category_id: 1,
    only_active: true,
    page: 1,
    page_size: 20
  },
  headers: { 'Authorization': `Bearer ${token}` }
});

// 构建分页组件
const pagination = {
  current: page,
  pageSize: page_size,
  total: response.data.total
};
```

---

### 5. 搜索试卷

根据关键词搜索试卷，支持按试卷名称和编号模糊搜索。

**接口地址**: `GET /api/exam/papers/search`

**查询参数**:

| 参数名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| keyword | string | ❌ | 搜索关键词（试卷名称或编号） | - |
| apply_category_id | integer | ❌ | 适用分类ID（筛选） | - |
| only_active | boolean | ❌ | 是否仅返回启用的试卷 | true |
| page | integer | ❌ | 页码 | 1 |
| page_size | integer | ❌ | 每页数量（最大100） | 20 |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paper_code": "PET202601-001",
      "paper_name": "PET口语2026年1月模拟卷",
      "total_score": 100,
      "apply_category_id": 1,
      "is_active": 1,
      "create_time": "2026-01-02T10:00:00",
      "update_time": "2026-01-02T10:00:00"
    }
  ],
  "total": 1,
  "message": "找到 1 份匹配的试卷"
}
```

**前端调用示例**:

```javascript
// axios - 搜索功能
const searchPapers = async (keyword) => {
  const response = await axios.get('/api/exam/papers/search', {
    params: {
      keyword: keyword,
      page: 1,
      page_size: 20
    },
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// 使用示例
const results = await searchPapers('PET');
```

---

### 6. 更新试卷

更新试卷信息，所有字段都是可选的。

**接口地址**: `PUT /api/exam/papers/{paper_id}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_name | string | ❌ | 试卷名称 |
| total_score | integer | ❌ | 试卷总分 |
| apply_category_id | integer | ❌ | 适用的一级分类ID |
| is_active | integer | ❌ | 是否启用，1启用/0禁用 |

**请求示例**:

```json
{
  "paper_name": "PET口语2026年1月模拟卷（更新版）",
  "total_score": 120
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "试卷更新成功",
  "data": {
    "id": 1,
    "paper_code": "PET202601-001",
    "paper_name": "PET口语2026年1月模拟卷（更新版）",
    "total_score": 120,
    "apply_category_id": 1,
    "is_active": 1,
    "create_time": "2026-01-02T10:00:00",
    "update_time": "2026-01-02T10:30:00"
  }
}
```

**前端调用示例**:

```javascript
// axios
const updatePaper = async (paperId, updates) => {
  const response = await axios.put(`/api/exam/papers/${paperId}`, updates, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// 使用示例
await updatePaper(1, {
  paper_name: 'PET口语2026年1月模拟卷（更新版）',
  total_score: 120
});
```

---

### 7. 删除试卷

删除试卷（软删除，将 is_active 设为 0）。

**接口地址**: `DELETE /api/exam/papers/{paper_id}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |

**响应示例**:

```json
{
  "success": true,
  "message": "试卷删除成功",
  "data": null
}
```

**前端调用示例**:

```javascript
// axios
const deletePaper = async (paperId) => {
  const response = await axios.delete(`/api/exam/papers/${paperId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.data;
};

// 使用示例（带确认）
const handleDelete = async (paperId) => {
  if (confirm('确定要删除这份试卷吗？')) {
    await deletePaper(paperId);
    // 刷新列表
    await loadPapers();
  }
};
```

---

## 试卷题目管理接口

### 1. 添加题目到试卷

向试卷中添加一道练习题。

**接口地址**: `POST /api/exam/papers/{paper_id}/questions`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 | 示例 |
|--------|------|------|------|------|
| exercise_id | integer | ✅ | 练习题ID（关联oral_exercise表） | 1 |
| question_score | integer | ❌ | 该题在试卷中的分值，默认0 | 10 |
| sort | integer | ❌ | 排序权重（越大越靠前），默认0 | 1 |

**请求示例**:

```json
{
  "exercise_id": 1,
  "question_score": 10,
  "sort": 1
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "题目添加成功",
  "data": {
    "record_id": 1
  }
}
```

**前端调用示例**:

```javascript
// axios
const addQuestion = async (paperId, question) => {
  const response = await axios.post(
    `/api/exam/papers/${paperId}/questions`,
    question,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// 使用示例
await addQuestion(1, {
  exercise_id: 5,
  question_score: 15,
  sort: 2
});
```

**注意事项**:
- 同一道题目不能重复添加到同一份试卷中
- 如果重复添加会返回 400 错误

---

### 2. 批量添加题目

一次性添加多道题目到试卷。

**接口地址**: `POST /api/exam/papers/{paper_id}/questions/batch`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| questions | array | ✅ | 题目列表，每项包含 exercise_id, question_score, sort |

**请求示例**:

```json
{
  "questions": [
    {
      "exercise_id": 1,
      "question_score": 10,
      "sort": 1
    },
    {
      "exercise_id": 2,
      "question_score": 15,
      "sort": 2
    },
    {
      "exercise_id": 3,
      "question_score": 20,
      "sort": 3
    }
  ]
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "批量添加完成，成功 3/3 题",
  "data": {
    "record_ids": [1, 2, 3],
    "total": 3,
    "success": 3
  }
}
```

**前端调用示例**:

```javascript
// axios
const batchAddQuestions = async (paperId, questions) => {
  const response = await axios.post(
    `/api/exam/papers/${paperId}/questions/batch`,
    { questions },
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// 使用示例 - 从题库选择多题添加
const selectedQuestions = [
  { exercise_id: 1, question_score: 10, sort: 1 },
  { exercise_id: 2, question_score: 15, sort: 2 },
  { exercise_id: 3, question_score: 20, sort: 3 }
];

const result = await batchAddQuestions(paperId, selectedQuestions);
console.log(`成功添加 ${result.data.success}/${result.data.total} 道题`);
```

---

### 3. 获取试卷所有题目

获取试卷包含的所有题目，包含题目详细信息。

**接口地址**: `GET /api/exam/papers/{paper_id}/questions`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paper_id": 1,
      "exercise_id": 1,
      "question_score": 10,
      "sort": 3,
      "exercise": {
        "category_id": 12,
        "title": "Describe a trip you enjoyed",
        "content": "Please describe a memorable trip...",
        "image_url": "https://example.com/images/trip1.jpg",
        "difficulty": 3,
        "is_active": 1
      },
      "create_time": "2026-01-02T10:00:00",
      "update_time": "2026-01-02T10:00:00"
    },
    {
      "id": 2,
      "paper_id": 1,
      "exercise_id": 2,
      "question_score": 15,
      "sort": 2,
      "exercise": {
        "category_id": 12,
        "title": "Talk about your hobby",
        "content": "Describe your favorite hobby...",
        "image_url": null,
        "difficulty": 2,
        "is_active": 1
      },
      "create_time": "2026-01-02T10:00:00",
      "update_time": "2026-01-02T10:00:00"
    }
  ],
  "total": 2,
  "message": "试卷共 2 道题目"
}
```

**前端调用示例**:

```javascript
// axios
const getPaperQuestions = async (paperId) => {
  const response = await axios.get(
    `/api/exam/papers/${paperId}/questions`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// 在 React 组件中使用
const [questions, setQuestions] = useState([]);

useEffect(() => {
  const loadQuestions = async () => {
    const result = await getPaperQuestions(paperId);
    // 按 sort 排序（已排序，但可再次确认）
    const sorted = result.data.sort((a, b) => b.sort - a.sort);
    setQuestions(sorted);
  };
  loadQuestions();
}, [paperId]);

// 渲染题目列表
{questions.map((q, index) => (
  <div key={q.id}>
    <h3>题目 {index + 1}: {q.exercise.title}</h3>
    <p>分值: {q.question_score}分</p>
    <p>内容: {q.exercise.content}</p>
    {q.exercise.image_url && <img src={q.exercise.image_url} />}
  </div>
))}
```

---

### 4. 更新试卷中题目信息

更新试卷中某道题目的分值或排序。

**接口地址**: `PUT /api/exam/papers/{paper_id}/questions/{exercise_id}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |
| exercise_id | integer | ✅ | 练习题ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| question_score | integer | ❌ | 题目分值 |
| sort | integer | ❌ | 排序权重 |

**请求示例**:

```json
{
  "question_score": 12,
  "sort": 5
}
```

**响应示例**:

```json
{
  "success": true,
  "message": "题目信息更新成功",
  "data": null
}
```

**前端调用示例**:

```javascript
// axios
const updateQuestionInPaper = async (paperId, exerciseId, updates) => {
  const response = await axios.put(
    `/api/exam/papers/${paperId}/questions/${exerciseId}`,
    updates,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// 使用示例 - 修改题目分值
await updateQuestionInPaper(1, 5, {
  question_score: 15
});

// 使用示例 - 题目排序（拖拽）
const handleDragEnd = async (result) => {
  const newSort = calculateNewSort(result);
  await updateQuestionInPaper(
    paperId,
    questionId,
    { sort: newSort }
  );
};
```

---

### 5. 从试卷移除题目

从试卷中移除一道题目。

**接口地址**: `DELETE /api/exam/papers/{paper_id}/questions/{exercise_id}`

**路径参数**:

| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| paper_id | integer | ✅ | 试卷ID |
| exercise_id | integer | ✅ | 练习题ID |

**响应示例**:

```json
{
  "success": true,
  "message": "题目移除成功",
  "data": null
}
```

**前端调用示例**:

```javascript
// axios
const removeQuestionFromPaper = async (paperId, exerciseId) => {
  const response = await axios.delete(
    `/api/exam/papers/${paperId}/questions/${exerciseId}`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  return response.data;
};

// 使用示例
const handleRemove = async (exerciseId) => {
  if (confirm('确定要从试卷中移除这道题目吗？')) {
    await removeQuestionFromPaper(paperId, exerciseId);
    // 刷新题目列表
    await loadQuestions();
  }
};
```

---

## 数据模型

### Paper（试卷）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 试卷ID（主键） |
| paper_code | string | 试卷唯一编号 |
| paper_name | string | 试卷名称 |
| total_score | integer | 试卷总分 |
| apply_category_id | integer | 适用的一级分类ID |
| is_active | integer | 是否启用（1:启用, 0:禁用） |
| create_time | string | 创建时间（ISO 8601格式） |
| update_time | string | 更新时间（ISO 8601格式） |

### PaperQuestion（试卷题目关联）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | integer | 关联记录ID |
| paper_id | integer | 试卷ID |
| exercise_id | integer | 练习题ID |
| question_score | integer | 该题在试卷中的分值 |
| sort | integer | 排序权重（越大越靠前） |
| exercise | object | 练习题详细信息（仅在获取题目列表时返回） |
| create_time | string | 创建时间 |
| update_time | string | 更新时间 |

### Exercise（练习题，关联数据）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| category_id | integer | 分类ID |
| title | string | 题目标题 |
| content | string | 题目内容 |
| image_url | string/null | 题目图片链接 |
| difficulty | integer | 难度（1-5） |
| is_active | integer | 是否启用 |

---

## 错误处理

### 标准错误响应格式

```json
{
  "detail": "错误描述信息"
}
```

### HTTP 状态码

| 状态码 | 说明 | 常见原因 |
|--------|------|----------|
| 200 | 成功 | 请求成功 |
| 400 | 请求错误 | 参数错误、业务逻辑错误（如试卷编号重复） |
| 401 | 未授权 | Token 无效或过期 |
| 404 | 资源不存在 | 试卷或题目不存在 |
| 413 | 请求体过大 | 批量添加题目数量过多 |
| 500 | 服务器错误 | 服务器内部错误 |

### 前端错误处理示例

```javascript
// axios 全局错误处理
axios.interceptors.response.use(
  response => response,
  error => {
    const { response } = error;
    
    switch (response?.status) {
      case 400:
        message.error(response.data.detail || '请求参数错误');
        break;
      case 401:
        message.error('登录已过期，请重新登录');
        // 跳转到登录页
        router.push('/login');
        break;
      case 404:
        message.error('资源不存在');
        break;
      case 500:
        message.error('服务器错误，请稍后重试');
        break;
      default:
        message.error('请求失败');
    }
    
    return Promise.reject(error);
  }
);

// 单个请求的错误处理
const createPaper = async (paperData) => {
  try {
    const response = await axios.post('/api/exam/papers', paperData);
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response?.status === 400) {
      const detail = error.response.data.detail;
      if (detail.includes('已存在')) {
        return { success: false, error: '试卷编号已存在，请使用其他编号' };
      }
    }
    return { success: false, error: '创建失败，请稍后重试' };
  }
};
```

---

## 完整的前端集成示例

### React + axios 示例

```javascript
// api/examService.js
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:9002';

// 创建 axios 实例
const examAPI = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

// 请求拦截器 - 添加 token
examAPI.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 试卷管理 API
export const paperAPI = {
  // 创建试卷
  create: (data) => examAPI.post('/api/exam/papers', data),
  
  // 获取试卷详情
  getById: (id) => examAPI.get(`/api/exam/papers/${id}`),
  
  // 获取试卷列表
  list: (params) => examAPI.get('/api/exam/papers', { params }),
  
  // 搜索试卷
  search: (params) => examAPI.get('/api/exam/papers/search', { params }),
  
  // 更新试卷
  update: (id, data) => examAPI.put(`/api/exam/papers/${id}`, data),
  
  // 删除试卷
  delete: (id) => examAPI.delete(`/api/exam/papers/${id}`)
};

// 试卷题目管理 API
export const paperQuestionAPI = {
  // 添加题目
  add: (paperId, data) => 
    examAPI.post(`/api/exam/papers/${paperId}/questions`, data),
  
  // 批量添加题目
  batchAdd: (paperId, questions) => 
    examAPI.post(`/api/exam/papers/${paperId}/questions/batch`, { questions }),
  
  // 获取题目列表
  list: (paperId) => 
    examAPI.get(`/api/exam/papers/${paperId}/questions`),
  
  // 更新题目信息
  update: (paperId, exerciseId, data) => 
    examAPI.put(`/api/exam/papers/${paperId}/questions/${exerciseId}`, data),
  
  // 移除题目
  remove: (paperId, exerciseId) => 
    examAPI.delete(`/api/exam/papers/${paperId}/questions/${exerciseId}`)
};
```

### Vue 3 + Composition API 示例

```javascript
// composables/useExam.js
import { ref } from 'vue';
import { paperAPI, paperQuestionAPI } from '@/api/examService';

export function useExamPaper() {
  const papers = ref([]);
  const loading = ref(false);
  const currentPaper = ref(null);
  
  // 获取试卷列表
  const fetchPapers = async (params = {}) => {
    loading.value = true;
    try {
      const { data } = await paperAPI.list(params);
      papers.value = data.data;
      return data;
    } catch (error) {
      console.error('获取试卷列表失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  // 创建试卷
  const createPaper = async (paperData) => {
    loading.value = true;
    try {
      const { data } = await paperAPI.create(paperData);
      return data;
    } catch (error) {
      console.error('创建试卷失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  // 获取试卷详情
  const fetchPaperDetail = async (paperId) => {
    loading.value = true;
    try {
      const { data } = await paperAPI.getById(paperId);
      currentPaper.value = data.data;
      return data;
    } catch (error) {
      console.error('获取试卷详情失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    papers,
    loading,
    currentPaper,
    fetchPapers,
    createPaper,
    fetchPaperDetail
  };
}

export function usePaperQuestion(paperId) {
  const questions = ref([]);
  const loading = ref(false);
  
  // 获取题目列表
  const fetchQuestions = async () => {
    loading.value = true;
    try {
      const { data } = await paperQuestionAPI.list(paperId);
      questions.value = data.data;
      return data;
    } catch (error) {
      console.error('获取题目列表失败:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };
  
  // 添加题目
  const addQuestion = async (questionData) => {
    try {
      const { data } = await paperQuestionAPI.add(paperId, questionData);
      await fetchQuestions(); // 刷新列表
      return data;
    } catch (error) {
      console.error('添加题目失败:', error);
      throw error;
    }
  };
  
  // 移除题目
  const removeQuestion = async (exerciseId) => {
    try {
      await paperQuestionAPI.remove(paperId, exerciseId);
      await fetchQuestions(); // 刷新列表
    } catch (error) {
      console.error('移除题目失败:', error);
      throw error;
    }
  };
  
  return {
    questions,
    loading,
    fetchQuestions,
    addQuestion,
    removeQuestion
  };
}
```

---

## TypeScript 类型定义

```typescript
// types/exam.ts

// 试卷
export interface Paper {
  id: number;
  paper_code: string;
  paper_name: string;
  total_score: number;
  apply_category_id: number;
  is_active: number;
  create_time: string;
  update_time: string;
}

// 创建试卷请求
export interface CreatePaperRequest {
  paper_code: string;
  paper_name: string;
  total_score?: number;
  apply_category_id?: number;
  is_active?: number;
}

// 更新试卷请求
export interface UpdatePaperRequest {
  paper_name?: string;
  total_score?: number;
  apply_category_id?: number;
  is_active?: number;
}

// 练习题详情
export interface Exercise {
  category_id: number;
  title: string;
  content: string;
  image_url: string | null;
  difficulty: number;
  is_active: number;
}

// 试卷题目
export interface PaperQuestion {
  id: number;
  paper_id: number;
  exercise_id: number;
  question_score: number;
  sort: number;
  exercise: Exercise | null;
  create_time: string;
  update_time: string;
}

// 添加题目请求
export interface AddQuestionRequest {
  exercise_id: number;
  question_score?: number;
  sort?: number;
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

// 试卷列表查询参数
export interface PaperListParams extends PaginationParams {
  apply_category_id?: number;
  only_active?: boolean;
}

// 试卷搜索参数
export interface PaperSearchParams extends PaginationParams {
  keyword?: string;
  apply_category_id?: number;
  only_active?: boolean;
}
```

---

## 注意事项

1. **认证 Token**: 所有接口都需要有效的 JWT Token，Token 过期需要重新登录
2. **试卷编号唯一性**: `paper_code` 必须唯一，创建前建议先检查是否已存在
3. **题目重复添加**: 同一道题目不能重复添加到同一份试卷，会返回 400 错误
4. **软删除**: 删除试卷只是将 `is_active` 设为 0，数据仍保留
5. **题目排序**: `sort` 值越大，题目越靠前显示
6. **分页限制**: 每页最大 100 条记录
7. **批量操作**: 批量添加题目时，部分失败不会回滚，需检查返回的成功数量
8. **日期格式**: 所有日期时间使用 ISO 8601 格式（如 `2026-01-02T10:00:00`）

---

## 联系方式

如有问题或需要技术支持，请联系开发团队。

**文档版本**: v1.0.0  
**最后更新**: 2026-01-02
