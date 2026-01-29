# 工作流类型选项 API 文档

## 概述

工作流类型选项 API 用于管理不同工作流类型的配置及价格信息，如 PET Part1、FCE Part2、雅思 Part1 等。

**基础路径**: `/api/workflowtypes`

**认证方式**: Bearer Token（所有接口都需要登录认证）

---

## 数据模型

### WorkflowTypeOption 对象

| 字段 | 类型 | 描述 |
|------|------|------|
| id | int | 主键ID |
| label | string | 显示名称（如：PET Part2） |
| value | string | 类型标识（如：pet_part2），唯一 |
| price | decimal | 价格（单位：元） |
| description | string | 描述信息（可选） |
| sort | int | 排序权重，越大越靠前 |
| is_active | int | 是否启用：1=启用，0=禁用 |
| create_time | timestamp | 创建时间 |
| update_time | timestamp | 更新时间 |

---

## API 接口

### 1. 创建工作流类型选项

**接口**: `POST /api/workflowtypes`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**:
```json
{
  "label": "PET Part2",
  "value": "pet_part2",
  "price": 12.00,
  "description": "PET 口语考试 Part 2",
  "sort": 60
}
```

**字段说明**:
- `label` (必填): 显示名称，1-100字符
- `value` (必填): 类型标识，1-50字符，必须唯一
- `price` (必填): 价格，必须 >= 0
- `description` (可选): 描述信息，最多500字符
- `sort` (可选): 排序权重，默认0

**成功响应** (200):
```json
{
  "success": true,
  "message": "工作流类型选项创建成功",
  "data": {
    "id": 9,
    "label": "PET Part2",
    "value": "pet_part2",
    "price": 12.00,
    "description": "PET 口语考试 Part 2",
    "sort": 60,
    "is_active": 1,
    "create_time": "2026-01-13 10:30:00",
    "update_time": "2026-01-13 10:30:00"
  }
}
```

**错误响应**:
- 400: value 已存在
- 401: 未认证
- 500: 服务器错误

---

### 2. 获取工作流类型选项列表

**接口**: `GET /api/workflowtypes`

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| only_active | bool | 否 | true | 是否仅返回启用的选项 |
| page | int | 否 | 1 | 页码，从1开始 |
| page_size | int | 否 | 20 | 每页数量，1-100 |

**请求示例**:
```
GET /api/workflowtypes?only_active=true&page=1&page_size=20
```

**成功响应** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "label": "FCE Part 1",
      "value": "fce_part1",
      "price": 10.00,
      "description": "FCE 口语考试 Part 1：个人信息与日常话题",
      "sort": 100,
      "is_active": 1,
      "create_time": "2026-01-13 09:00:00",
      "update_time": "2026-01-13 09:00:00"
    },
    {
      "id": 2,
      "label": "FCE Part 2",
      "value": "fce_part2",
      "price": 15.00,
      "description": "FCE 口语考试 Part 2：个人陈述（长时间独白）",
      "sort": 90,
      "is_active": 1,
      "create_time": "2026-01-13 09:00:00",
      "update_time": "2026-01-13 09:00:00"
    }
  ],
  "total": 8,
  "page": 1,
  "page_size": 20
}
```

**说明**:
- 结果按 `sort DESC, id ASC` 排序
- `total` 表示符合条件的总记录数

---

### 3. 获取工作流类型选项详情

**接口**: `GET /api/workflowtypes/{option_id}`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `option_id`: 选项ID

**请求示例**:
```
GET /api/workflowtypes/5
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "获取工作流类型选项成功",
  "data": {
    "id": 5,
    "label": "PET Part 2",
    "value": "pet_part2",
    "price": 12.00,
    "description": "PET 口语考试 Part 2",
    "sort": 60,
    "is_active": 1,
    "create_time": "2026-01-13 09:00:00",
    "update_time": "2026-01-13 09:00:00"
  }
}
```

**错误响应**:
- 404: 选项不存在
- 401: 未认证
- 500: 服务器错误

---

### 4. 更新工作流类型选项

**接口**: `PUT /api/workflowtypes/{option_id}`

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**路径参数**:
- `option_id`: 选项ID

**请求体** (所有字段都是可选的):
```json
{
  "label": "PET Part 2 (更新)",
  "price": 15.00,
  "description": "更新后的描述",
  "sort": 80,
  "is_active": 1
}
```

**字段说明**:
- `label` (可选): 新的显示名称
- `price` (可选): 新的价格，必须 >= 0
- `description` (可选): 新的描述信息
- `sort` (可选): 新的排序权重
- `is_active` (可选): 是否启用（1=启用，0=禁用）
- **注意**: `value` 字段不可修改

**成功响应** (200):
```json
{
  "success": true,
  "message": "工作流类型选项更新成功",
  "data": {
    "id": 5,
    "label": "PET Part 2 (更新)",
    "value": "pet_part2",
    "price": 15.00,
    "description": "更新后的描述",
    "sort": 80,
    "is_active": 1,
    "create_time": "2026-01-13 09:00:00",
    "update_time": "2026-01-13 10:30:00"
  }
}
```

**错误响应**:
- 400: 未提供需要更新的字段或更新失败
- 404: 选项不存在
- 401: 未认证
- 500: 服务器错误

---

### 5. 删除工作流类型选项

**接口**: `DELETE /api/workflowtypes/{option_id}`

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `option_id`: 选项ID

**请求示例**:
```
DELETE /api/workflowtypes/5
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "工作流类型选项删除成功",
  "data": null
}
```

**说明**:
- 这是软删除操作，会将 `is_active` 设置为 0
- 删除后的记录仍保留在数据库中
- 可以通过 `GET /api/workflowtypes?only_active=false` 查看已删除的记录

**错误响应**:
- 400: 选项不存在或已删除
- 401: 未认证
- 500: 服务器错误

---

## 使用示例

### Python 示例

```python
import requests

# 基础配置
BASE_URL = "http://localhost:9004/api/workflowtypes"
TOKEN = "your_token_here"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# 1. 创建工作流类型选项
response = requests.post(BASE_URL, json={
    "label": "雅思 Part 1",
    "value": "ielts_part1",
    "price": 18.00,
    "description": "雅思口语 Part 1：个人信息与日常话题",
    "sort": 50
}, headers=HEADERS)
print(response.json())

# 2. 获取列表（仅启用的）
response = requests.get(f"{BASE_URL}?only_active=true&page=1&page_size=10", 
                       headers=HEADERS)
print(response.json())

# 3. 获取详情
option_id = 1
response = requests.get(f"{BASE_URL}/{option_id}", headers=HEADERS)
print(response.json())

# 4. 更新选项
response = requests.put(f"{BASE_URL}/{option_id}", json={
    "price": 20.00,
    "sort": 100
}, headers=HEADERS)
print(response.json())

# 5. 删除选项
response = requests.delete(f"{BASE_URL}/{option_id}", headers=HEADERS)
print(response.json())
```

### curl 示例

```bash
# 1. 创建工作流类型选项
curl -X POST http://localhost:9004/api/workflowtypes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "雅思 Part 1",
    "value": "ielts_part1",
    "price": 18.00,
    "description": "雅思口语 Part 1",
    "sort": 50
  }'

# 2. 获取列表
curl -X GET "http://localhost:9004/api/workflowtypes?only_active=true&page=1&page_size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. 获取详情
curl -X GET http://localhost:9004/api/workflowtypes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. 更新选项
curl -X PUT http://localhost:9004/api/workflowtypes/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 20.00,
    "sort": 100
  }'

# 5. 删除选项
curl -X DELETE http://localhost:9004/api/workflowtypes/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 数据库初始化

在首次使用前，需要执行以下 SQL 文件创建表和初始数据：

```bash
mysql -u your_user -p your_database < src/workflow/sql/oral_practice_schema.sql
```

初始化数据包含以下工作流类型选项：

| ID | Label | Value | Price | Sort |
|----|-------|-------|-------|------|
| 1 | FCE Part 1 | fce_part1 | 10.00 | 100 |
| 2 | FCE Part 2 | fce_part2 | 15.00 | 90 |
| 3 | FCE Part 3 | fce_part3 | 20.00 | 80 |
| 4 | PET Part 1 | pet_part1 | 8.00 | 70 |
| 5 | PET Part 2 | pet_part2 | 12.00 | 60 |
| 6 | 雅思 Part 1 | ielts_part1 | 18.00 | 50 |
| 7 | 雅思 Part 2 | ielts_part2 | 25.00 | 40 |
| 8 | 雅思 Part 3 | ielts_part3 | 30.00 | 30 |

---

## 错误代码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误（如重复的 value、缺少必填字段等） |
| 401 | 未认证或 token 无效 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 注意事项

1. **唯一性约束**: `value` 字段必须唯一，创建时会自动检查
2. **软删除**: 删除操作不会物理删除记录，只是将 `is_active` 设为 0
3. **排序规则**: 列表接口按 `sort DESC, id ASC` 排序
4. **价格字段**: `price` 使用 DECIMAL(10,2) 类型，支持最多10位数字，2位小数
5. **认证要求**: 所有接口都需要有效的 Bearer Token
6. **分页限制**: 每页最多返回 100 条记录

---

## 相关文档

- [口语练习 API 文档](./SPOKEN_PRACTICE_API.md)
- [认证 API 文档](./AUTH_API.md)
- [数据库设计文档](../src/conversation/doc/SPOKEN_PRACTICE_DB_DESIGN.md)
