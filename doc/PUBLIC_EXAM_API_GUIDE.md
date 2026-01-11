# 考试分类与试卷公共只读 API 使用指南

## 📋 概述

本指南介绍如何使用考试分类与试卷的**公共只读接口**，这些接口专为 APP 首页展示设计，具有以下特点：

- 🔓 **无需登录认证** - 不需要 Token，方便首页快速展示
- ⚡ **高性能** - 内置进程内缓存（TTL 5分钟），减轻数据库压力
- 📱 **首页友好** - 返回结构简单，易于前端渲染
- 🔒 **安全可靠** - 仅返回公开的分类和试卷信息，无敏感数据

---

## 🚀 快速开始

### 1. 基础配置

**API 基础地址**: `http://localhost:9002`  
**路由前缀**: `/api/exam/public`

### 2. 可用接口列表

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/exam/public/categories` | GET | 获取考试分类列表 |
| `/api/exam/public/papers` | GET | 获取试卷列表（支持分类过滤） |
| `/api/exam/public/papers/{paper_id}` | GET | 获取单份试卷详情 |
| `/api/exam/public/papers/{paper_id}/questions` | GET | 获取试卷题目列表（含题目详情） |

---

## 📖 接口详细说明

### 1️⃣ 获取考试分类列表

**接口**: `GET /api/exam/public/categories`

**查询参数**:
- `only_active` (可选): 是否仅返回启用分类，默认 `true`

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "PET口语",
      "description": "PET (Preliminary English Test) 是剑桥英语五级证书中的第二级...",
      "sort": 100,
      "is_active": 1,
      "create_time": "2026-01-02T10:00:00",
      "update_time": "2026-01-02T10:00:00"
    }
  ],
  "total": 1,
  "message": "找到 1 个分类"
}
```

**curl 示例**:
```bash
curl http://localhost:9002/api/exam/public/categories
```

---

### 2️⃣ 获取试卷列表

**接口**: `GET /api/exam/public/papers`

**查询参数**:
- `exam_category_id` (可选): 考试分类ID（优先级最高）
- `apply_category_id` (可选): 适用分类ID（次优先）
- `only_active` (可选): 是否仅返回启用试卷，默认 `true`
- `page` (可选): 页码，默认 `1`
- `page_size` (可选): 每页数量，默认 `20`，最大 `100`

**过滤逻辑**:
1. 如果提供 `exam_category_id`，优先按此过滤
2. 否则如果提供 `apply_category_id`，按此过滤
3. 如果都未提供，返回最近创建的启用试卷列表

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paper_code": "FCE202601-001",
      "paper_name": "FCE口语2026年1月模拟卷",
      "total_score": 120,
      "apply_category_id": 3,
      "exam_category_id": 3,
      "is_active": 1,
      "create_time": "2026-01-02T10:00:00",
      "update_time": "2026-01-02T10:00:00"
    }
  ],
  "total": 1,
  "message": "找到 1 份试卷"
}
```

**curl 示例**:
```bash
# 获取 FCE 分类下的所有试卷
curl "http://localhost:9002/api/exam/public/papers?exam_category_id=3"

# 获取最近创建的 10 份启用试卷
curl "http://localhost:9002/api/exam/public/papers?page_size=10"
```

---

### 3️⃣ 获取单份试卷详情

**接口**: `GET /api/exam/public/papers/{paper_id}`

**路径参数**:
- `paper_id`: 试卷ID

**响应示例**:
```json
{
  "success": true,
  "message": "获取试卷成功",
  "data": {
    "id": 1,
    "paper_code": "FCE202601-001",
    "paper_name": "FCE口语2026年1月模拟卷",
    "total_score": 120,
    "apply_category_id": 3,
    "exam_category_id": 3,
    "is_active": 1,
    "create_time": "2026-01-02T10:00:00",
    "update_time": "2026-01-02T10:00:00"
  }
}
```

**curl 示例**:
```bash
curl http://localhost:9002/api/exam/public/papers/1
```

---

### 4️⃣ 获取试卷题目列表

**接口**: `GET /api/exam/public/papers/{paper_id}/questions`

**路径参数**:
- `paper_id`: 试卷ID

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "paper_id": 1,
      "exercise_id": 10,
      "question_score": 10,
      "sort": 1,
      "workflow_type": "fce_part1",
      "exercise": {
        "id": 10,
        "category_id": 12,
        "title": "Describe your hometown",
        "content": "Please describe your hometown in detail...",
        "image_url": "https://example.com/img1.jpg",
        "workflow_type": "fce_part1",
        "difficulty": 3,
        "is_active": 1
      },
      "create_time": "2026-01-02T10:00:00",
      "update_time": "2026-01-02T10:00:00"
    }
  ],
  "total": 1,
  "message": "试卷共 1 道题目"
}
```

**curl 示例**:
```bash
curl http://localhost:9002/api/exam/public/papers/1/questions
```

---

## 💡 使用场景示例

### 场景 1: APP 首页加载考试分类

```python
import requests

# 获取所有启用的考试分类
response = requests.get("http://localhost:9002/api/exam/public/categories")
data = response.json()

if data["success"]:
    categories = data["data"]
    for cat in categories:
        print(f"{cat['name']}: {cat['description']}")
```

### 场景 2: 根据分类加载试卷列表

```python
import requests

# 用户选择 FCE 分类（exam_category_id=3）
response = requests.get(
    "http://localhost:9002/api/exam/public/papers",
    params={
        "exam_category_id": 3,
        "page": 1,
        "page_size": 10
    }
)

data = response.json()
if data["success"]:
    papers = data["data"]
    print(f"找到 {data['total']} 份 FCE 试卷：")
    for paper in papers:
        print(f"  - {paper['paper_name']} (总分: {paper['total_score']})分)")
```

### 场景 3: 查看试卷题目明细

```python
import requests

# 用户点击某份试卷，查看题目列表
paper_id = 1
response = requests.get(
    f"http://localhost:9002/api/exam/public/papers/{paper_id}/questions"
)

data = response.json()
if data["success"]:
    questions = data["data"]
    print(f"试卷共 {data['total']} 道题目：")
    for q in questions:
        exercise = q["exercise"]
        print(f"  {q['sort']}. {exercise['title']}")
        print(f"     分值: {q['question_score']}, 难度: {exercise['difficulty']}, 工作流: {q['workflow_type']}")
```

---

## 🔒 安全说明

- **公开只读**: 这些接口仅返回公开的考试分类、试卷和题目信息，不涉及用户数据
- **缓存机制**: 默认缓存 5 分钟，高频访问不会压制数据库
- **不返回敏感信息**: 所有字段均为公开展示数据，无隐私风险
- **无需认证**: 适合首页匿名访问，不要求用户登录

---

## 🔄 缓存失效说明

### 自动过期
- **TTL**: 5 分钟
- 过期后下次访问会自动查库并刷新缓存

### 手动刷新
后台管理修改分类、试卷或题目后，最多 5 分钟后首页会展示最新数据。

### 多实例部署
如果部署多个应用实例，各实例缓存独立，可能在 5 分钟内不一致（业务可接受）。

---

## 📊 性能特点

| 特性 | 说明 |
|------|------|
| 响应时间 | 缓存命中：< 10ms，缓存未命中：< 100ms |
| 并发能力 | 支持高并发，缓存减轻 DB 压力 |
| 数据新鲜度 | 最多 5 分钟延迟 |
| 内存占用 | 极小（每个分类约 500 字节） |

---

## 🛠️ 故障排查

### 问题 1: 接口返回 500 错误
**可能原因**: 数据库连接失败  
**解决方法**: 检查数据库配置和连接状态

### 问题 2: 返回数据为空
**可能原因**: 数据库中没有启用的分类/试卷  
**解决方法**: 在数据库中添加测试数据，确保 `is_active=1`

### 问题 3: 数据更新不及时
**可能原因**: 缓存未过期  
**解决方法**: 等待 5 分钟或重启应用

---

## 📚 相关文档

- [完整 API 文档](./QUICK_REFERENCE.md#考试分类与试卷公共只读-rest-api)
- [exam_server.py 源码](../src/exam/exam_server.py)
- [数据库表结构](../src/exam/exam_schema.sql)

---

## ✅ 总结

考试分类与试卷公共只读接口专为 APP 首页设计，具有：
1. ✅ 无需登录认证
2. ✅ 高性能缓存机制
3. ✅ 简单易用的 API
4. ✅ 安全可靠的数据访问

适合在首页快速展示考试分类和试卷列表，为用户提供流畅的浏览体验！
