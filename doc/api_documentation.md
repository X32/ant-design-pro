
# 备考文章发布系统 API 文档

> 文档版本：v1.0
> 更新时间：2026-02-21
> 基础URL：`http://your-host:port`

---

## 目录

- [认证说明](#认证说明)
- [通用响应格式](#通用响应格式)
- [后台管理员接口（🔐 后台管理）](#后台管理员接口)
- [普通用户接口（👥 普通用户）](#普通用户接口)
- [权限管理接口（🔑 权限管理）](#权限管理接口)
- [分类标签接口（🏷️ 分类标签）](#分类标签接口)
- [数据模型](#数据模型)

---

## 认证说明

### 访问权限说明

备考文章系统根据文章状态和用户角色提供不同的访问权限：

**重要说明：已发布的备考文章不需要用户登录即可查看！**

#### 文章状态与访问权限对照表

| 文章状态                    | 是否需要登录 | 谁可以查看                   |
| --------------------------- | ------------ | ---------------------------- |
| `published` (已发布)      | ❌ 不需要    | 所有人                       |
| `draft` (草稿)            | ✅ 需要      | 仅作者本人、超级管理员       |
| `pending_review` (待审核) | ✅ 需要      | 作者本人、审核员、超级管理员 |
| `approved` (审核通过)     | ✅ 需要      | 作者本人、审核员、超级管理员 |
| `rejected` (已驳回)       | ✅ 需要      | 作者本人、审核员、超级管理员 |

#### 权限说明

- **已发布文章**：任何访客都可以自由浏览，无需登录
- **未发布文章**：需要登录且满足相应的角色权限才能查看
- **文章发布后自动公开**：文章一旦状态变更为 `published`，即可对外公开访问

### Token 认证（需要登录的接口）

对于需要登录的接口（如创建文章、编辑文章等），需要在 HTTP Header 中携带 JWT Token 进行认证。

### 请求头

```
Authorization: Bearer {token}
```

### 获取 Token

通过登录接口获取 Token（参见 `/api/auth/login`）

---

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  }
}
```

### 基础响应

```json
{
  "success": true,
  "message": "操作成功"
}
```

### 错误响应

```json
{
  "detail": "错误信息"
}
```

### HTTP 状态码

| 状态码 | 说明                |
| ------ | ------------------- |
| 200    | 请求成功            |
| 400    | 请求参数错误        |
| 401    | 未认证或 Token 无效 |
| 403    | 无权限              |
| 404    | 资源不存在          |
| 500    | 服务器内部错误      |

---

## 后台管理员接口（🔐 后台管理）

### 1. 获取文章列表（待审核/所有）

获取所有待审核的文章列表。

**接口地址：** `GET /api/admin/articles/pending-review`

**接口说明：** 后台管理员使用该接口获取待审核文章列表。

**认证要求：** 必需（管理员权限）

**请求参数：**

| 参数        | 类型   | 必填 | 默认值 | 说明       |
| ----------- | ------ | ---- | ------ | ---------- |
| page        | int    | 否   | 1      | 页码       |
| page_size   | int    | 否   | 20     | 每页数量   |
| keyword     | string | 否   | -      | 搜索关键词 |
| category_id | int    | 否   | -      | 分类ID     |

**请求示例：**

```http
GET /api/admin/articles/pending-review?page=1&page_size=20
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "total": 15,
    "page": 1,
    "page_size": 20,
    "articles": [
      {
        "id": 1,
        "title": "待审核文章标题",
        "status": "pending_review",
        ...
      }
    ]
  }
}
```

---

### 2. 审核通过文章

审核通过文章，可选择是否立即发布。

**接口地址：** `POST /api/admin/articles/{article_id}/approve`

**接口说明：** 后台管理员使用该接口审核通过文章。
**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求体：**

| 字段                | 类型    | 必填 | 默认值 | 说明         |
| ------------------- | ------- | ---- | ------ | ------------ |
| comment             | string  | 否   | null   | 审核意见     |
| publish_immediately | boolean | 否   | false  | 是否立即发布 |

**请求示例：**

```json
POST /api/admin/articles/1/approve

{
  "comment": "审核通过，内容质量优秀",
  "publish_immediately": true
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "审核通过成功"
}
```

**权限要求：**

- 需要超级管理员或内容管理员权限
- 文章状态必须为 `pending_review`

---

### 3. 审核驳回文章

审核驳回文章。

**接口地址：** `POST /api/admin/articles/{article_id}/reject`

**接口说明：** 后台管理员使用该接口驳回文章。
**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求体：**

| 字段    | 类型   | 必填 | 说明     |
| ------- | ------ | ---- | -------- |
| comment | string | 是   | 驳回原因 |

**请求示例：**

```json
POST /api/admin/articles/1/reject

{
  "comment": "需要修改以下问题：\n1. 图片格式不统一\n2. 部分内容表述不清"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "驳回成功"
}
```

**权限要求：**

- 需要超级管理员或内容管理员权限
- 文章状态必须为 `pending_review`

---

### 4. 请求修改文章

请求作者修改文章内容。

**接口地址：** `POST /api/admin/articles/{article_id}/request-revision`

**接口说明：** 后台管理员使用该接口请求作者修改文章。
**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求体：**

| 字段    | 类型   | 必填 | 说明     |
| ------- | ------ | ---- | -------- |
| comment | string | 是   | 修改意见 |

**请求示例：**

```json
POST /api/admin/articles/1/request-revision

{
  "comment": "需要修改的地方：\n1. 补充图片说明\n2. 增加代码示例"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "请求修改成功"
}
```

**权限要求：**

- 需要超级管理员或内容管理员权限
- 文章状态必须为 `pending_review`

---

### 5. 归档文章

归档文章（不可见状态）。

**接口地址：** `POST /api/admin/articles/{article_id}/archive`

**接口说明：** 后台管理员使用该接口归档文章。
**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求示例：**

```http
POST /api/admin/articles/1/archive
```

**响应示例：**

```json
{
  "success": true,
  "message": "归档成功"
}
```

**权限要求：**

- 需要超级管理员或内容管理员权限

---

### 5.1. 管理员更新文章

管理员直接修改文章内容，可修改任何状态的文章。

**接口地址：** `PUT /api/admin/articles/{article_id}`

**接口说明：** 管理员使用该接口直接修改文章内容，不受文章状态限制。

**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求体：**

| 字段             | 类型   | 必填 | 说明        |
| ---------------- | ------ | ---- | ----------- |
| title            | string | 否   | 文章标题    |
| summary          | string | 否   | 文章摘要    |
| cover_image      | string | 否   | 封面图片URL |
| article_type     | string | 否   | 文章类型    |
| category_ids     | array  | 否   | 分类ID列表  |
| tag_ids          | array  | 否   | 标签ID列表  |
| blocks           | array  | 否   | 内容块列表  |
| keywords         | string | 否   | SEO关键词   |
| meta_description | string | 否   | SEO描述     |

**请求示例：**

```json
PUT /api/admin/articles/1

{
  "title": "KET 口语考试 Part 1 完整备考指南（已更新）",
  "summary": "本文详细介绍 KET 口语考试 Part 1 的考试形式、评分标准和备考技巧",
  "blocks": [
    {
      "block_type": "text",
      "sort_order": 1,
      "content": "更新后的内容..."
    }
  ]
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "article": {
      "id": 1,
      "title": "KET 口语考试 Part 1 完整备考指南（已更新）",
      "status": "published",
      ...
    }
  }
}
```

**权限要求：**

- 需要超级管理员或内容管理员权限
- 可以修改任何状态的文章（草稿、待审核、已通过、已发布）

**与用户更新接口的区别：**

| 接口                   | 路径                                     | 权限要求   | 可修改状态                               |
| ---------------------- | ---------------------------------------- | ---------- | ---------------------------------------- |
| 用户更新文章           | `PUT /api/articles/{article_id}`       | 文章作者   | 仅草稿、已驳回                           |
| 管理员更新文章（新增） | `PUT /api/admin/articles/{article_id}` | 管理员权限 | 所有状态（草稿、待审核、已通过、已发布） |

---

### 6. 获取文章审核日志

获取指定文章的所有审核日志。

**接口地址：** `GET /api/admin/articles/{article_id}/audit-logs`

**接口说明：** 后台管理员使用该接口查看文章审核日志。
**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求参数：**

| 参数      | 类型 | 必填 | 默认值 | 说明     |
| --------- | ---- | ---- | ------ | -------- |
| page      | int  | 否   | 1      | 页码     |
| page_size | int  | 否   | 20     | 每页数量 |

**请求示例：**

```http
GET /api/admin/articles/1/audit-logs?page=1&page_size=20
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 20,
    "logs": [
      {
        "id": 1,
        "article_id": 1,
        "action": "submit",
        "operator_id": 1,
        "operator_role": "author",
        "comment": null,
        "previous_status": null,
        "new_status": "pending_review",
        "created_at": "2026-02-21T10:00:00"
      },
      {
        "id": 2,
        "article_id": 1,
        "action": "approve",
        "operator_id": 2,
        "operator_role": "reviewer",
        "comment": "审核通过，内容质量优秀",
        "previous_status": "pending_review",
        "new_status": "approved",
        "created_at": "2026-02-21T11:00:00"
      }
    ]
  }
}
```

**action 类型：**

- `submit` - 提交审核
- `approve` - 审核通过
- `reject` - 审核驳回
- `request_revision` - 请求修改
- `archive` - 归档
- `restore` - 恢复
- `delete` - 删除

**operator_role 类型：**

- `author` - 作者
- `reviewer` - 审核员
- `admin` - 管理员

---

### 7. 获取待审核评论列表

获取所有待审核的评论列表。

**接口地址：** `GET /api/admin/articles/pending-comments`

**接口说明：** 后台管理员使用该接口获取待审核评论列表。
**认证要求：** 必需（管理员权限）

**请求参数：**

| 参数       | 类型 | 必填 | 默认值 | 说明                   |
| ---------- | ---- | ---- | ------ | ---------------------- |
| page       | int  | 否   | 1      | 页码                   |
| page_size  | int  | 否   | 20     | 每页数量               |
| article_id | int  | 否   | -      | 文章ID（筛选特定文章） |

**请求示例：**

```http
GET /api/admin/articles/pending-comments?page=1&page_size=20
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "total": 30,
    "page": 1,
    "page_size": 20,
    "comments": [
      {
        "id": 1,
        "article_id": 1,
        "content": "待审核的评论",
        "status": "pending",
        ...
      }
    ]
  }
}
```

---

### 8. 审核通过评论

审核通过评论。

**接口地址：** `POST /api/admin/articles/comments/{comment_id}/approve`

**接口说明：** 后台管理员使用该接口审核通过评论。
**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| comment_id | int  | 是   | 评论ID |

**请求体：**

| 字段    | 类型   | 必填 | 默认值 | 说明     |
| ------- | ------ | ---- | ------ | -------- |
| comment | string | 否   | null   | 审核意见 |

**请求示例：**

```json
POST /api/admin/articles/comments/1/approve

{
  "comment": "评论通过"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "审核通过成功"
}
```

---

### 9. 审核驳回评论

审核驳回评论。

**接口地址：** `POST /api/admin/articles/comments/{comment_id}/reject`

**接口说明：** 后台管理员使用该接口驳回评论。
**认证要求：** 必需（管理员权限）

**路径参数：**

| 参数       | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| comment_id | int    | 是   | 评论ID   |
| article_id | int    | 是   | 文章ID   |
| comment    | string | 是   | 驳回原因 |

**请求示例：**

```json
POST /api/admin/articles/comments/1/reject

{
  "article_id": 1,
  "comment": "评论内容违规"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "驳回成功"
}
```

获取有文章发布权限的用户列表。

**接口地址：** `GET /api/admin/articles/users-with-permissions`

**接口说明：** 后台管理员使用该接口获取有权限的用户列表。
**认证要求：** 必需（管理员权限）

**请求参数：**

| 参数              | 类型   | 必填 | 默认值 | 说明                             |
| ----------------- | ------ | ---- | ------ | -------------------------------- |
| permission_type   | string | 否   | -      | 权限类型（create/create_review） |
| permission_status | string | 否   | -      | 权限状态（active/revoked）       |

**请求示例：**

```http
GET /api/admin/articles/users-with-permissions
GET /api/admin/articles/users-with-permissions?permission_type=create
GET /api/admin/articles/users-with-permissions?permission_status=active
GET /api/admin/articles/users-with-permissions?permission_type=create&permission_status=active
```

**响应示例：**

```json
{
  "users": [
    {
      "id": 1,
      "username": "test_user",
      "permission_type": "create"
    },
    {
      "id": 72,
      "username": "author",
      "permission_type": "create"
    }
  ]
}
```

**permission_type 类型说明：**

- `create` - 文章创建权限
- `create_review` - 文章创建 + 审核权限

**permission_status 类型说明：**

- `active` - 权限激活中
- `revoked` - 权限已撤销

---

| 参数         | 类型   | 必填 | 默认值    | 说明                                       |
| ------------ | ------ | ---- | --------- | ------------------------------------------ |
| page         | int    | 否   | 1         | 页码                                       |
| page_size    | int    | 否   | 10        | 每页数量                                   |
| category_id  | int    | 否   | -         | 分类ID                                     |
| tag_id       | int    | 否   | -         | 标签ID                                     |
| keyword      | string | 否   | -         | 搜索关键词                                 |
| article_type | string | 否   | -         | 文章类型（study_guide/exam_tips/resource） |
| status       | string | 否   | published | 文章状态                                   |

**请求示例：**

```http
GET /api/articles?page=1&page_size=10&status=published
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "total": 100,
    "page": 1,
    "page_size": 10,
    "articles": [
      {
        "id": 1,
        "title": "KET 口语考试 Part 1 备考指南",
        "summary": "本文详细介绍 KET 口语考试 Part 1 的考试形式、评分标准和备考技巧...",
        "cover_image": "https://example.com/covers/article1.jpg",
        "status": "published",
        "article_type": "study_guide",
        "view_count": 1234,
        "like_count": 56,
        "comment_count": 12,
        "published_at": "2026-02-21T10:00:00",
        "keywords": "KET,口语,Part1,备考",
        "meta_description": "KET 口语考试 Part 1 备考指南",
        "created_at": "2026-02-20T15:30:00",
        "updated_at": "2026-02-21T09:45:00",
        "author": {
          "id": 1,
          "username": "张老师",
          "avatar": "https://example.com/avatars/user1.jpg"
        },
        "categories": [
          {
            "id": 1,
            "name": "口语考试",
            "slug": "speaking-exam"
          }
        ],
        "tags": [
          {
            "id": 1,
            "name": "Part 1",
            "slug": "part1"
          }
        ],
        "is_liked": false
      }
    ]
  }
}
```

---

### 12. 获取文章详情

获取指定文章的详细信息。

**接口地址：** `GET /api/articles/{article_id}`

**接口说明：** 获取文章详情，已发布的文章可公开访问。

**认证要求：** 可选（未登录只能查看已发布文章，登录用户可查看自己有权限的文章）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求示例：**

```http
GET /api/articles/1
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "article": {
      "id": 1,
      "title": "KET 口语考试 Part 1 备考指南",
      "summary": "本文详细介绍 KET 口语考试 Part 1 的考试形式、评分标准和备考技巧...",
      "cover_image": "https://example.com/covers/article1.jpg",
      "status": "published",
      "article_type": "study_guide",
      "view_count": 1235,
      "like_count": 56,
      "comment_count": 12,
      "published_at": "2026-02-21T10:00:00",
      "keywords": "KET,口语,Part1,备考",
      "meta_description": "KET 口语考试 Part 1 备考指南",
      "created_at": "2026-02-20T15:30:00",
      "updated_at": "2026-02-21T09:45:00",
      "author": {
        "id": 1,
        "username": "张老师",
        "avatar": "https://example.com/avatars/user1.jpg"
      },
      "blocks": [
        {
          "id": 1,
          "block_type": "text",
          "sort_order": 1,
          "content": "KET 口语考试 Part 1 是考试的第一部分，主要测试考生的基本口语表达能力...",
          "media_url": null,
          "media_alt": null,
          "caption": null,
          "code_language": null,
          "list_type": "unordered"
        },
        {
          "id": 2,
          "block_type": "image",
          "sort_order": 2,
          "content": null,
          "media_url": "https://example.com/images/ket-part1.jpg",
          "media_alt": "KET 口语考试 Part 1 示意图",
          "caption": "图1: KET 口语考试流程",
          "code_language": null,
          "list_type": "unordered"
        },
        {
          "id": 3,
          "block_type": "list",
          "sort_order": 3,
          "content": "考试形式\n- 与考官一对一对话\n- 时长约 5-6 分钟\n- 涵盖日常生活话题",
          "media_url": null,
          "media_alt": null,
          "caption": null,
          "code_language": null,
          "list_type": "unordered"
        }
      ],
      "categories": [
        {
          "id": 1,
          "name": "口语考试",
          "slug": "speaking-exam"
        },
        {
          "id": 2,
          "name": "KET",
          "slug": "ket"
        }
      ],
      "tags": [
        {
          "id": 1,
          "name": "Part 1",
          "slug": "part1"
        },
        {
          "id": 2,
          "name": "技巧",
          "slug": "tips"
        }
      ],
      "is_liked": false
    }
  }
}
```

**注意：** 每次访问已发布文章详情时，会自动记录浏览次数。

---

### 13. 获取我的文章

获取当前登录用户创建的所有文章。

**接口地址：** `GET /api/articles/my-articles`

**接口说明：** 用户使用该接口获取自己的所有文章，支持按状态筛选。

**认证要求：** 必需

**请求参数：**

| 参数        | 类型   | 必填 | 默认值 | 说明                                                         |
| ----------- | ------ | ---- | ------ | ------------------------------------------------------------ |
| page        | int    | 否   | 1      | 页码                                                         |
| page_size   | int    | 否   | 10     | 每页数量                                                     |
| category_id | int    | 否   | -      | 分类ID                                                       |
| tag_id      | int    | 否   | -      | 标签ID                                                       |
| keyword     | string | 否   | -      | 搜索关键词                                                   |
| status      | string | 否   | -      | 文章状态（draft/pending_review/approved/rejected/published） |

**请求示例：**

```http
# 获取所有我的文章
GET /api/articles/my-articles?page=1&page_size=10

# 只获取草稿状态的文章
GET /api/articles/my-articles?status=draft

# 获取待审核的文章
GET /api/articles/my-articles?status=pending_review

# 获取已发布的文章
GET /api/articles/my-articles?status=published
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "page_size": 10,
    "articles": [
      {
        "id": 1,
        "title": "我的草稿文章",
        "status": "draft",
        ...
      },
      {
        "id": 2,
        "title": "待审核的文章",
        "status": "pending_review",
        ...
      }
    ]
  }
}
```

**可查看状态说明：**

| 状态               | 是否显示 | 是否可修改 |
| ------------------ | -------- | ---------- |
| `draft`          | ✅       | ✅         |
| `pending_review` | ✅       | ✅         |
| `approved`       | ✅       | ❌         |
| `rejected`       | ✅       | ✅         |
| `published`      | ✅       | ❌         |

---

### 14. 创建文章

创建新的文章草稿。

**接口地址：** `POST /api/articles`

**接口说明：** 创建新的文章草稿，需要文章创建权限。

**认证要求：** 必需

**请求体：**

| 字段             | 类型   | 必填 | 说明                         |
| ---------------- | ------ | ---- | ---------------------------- |
| title            | string | 是   | 文章标题（1-200字符）        |
| summary          | string | 否   | 文章摘要                     |
| cover_image      | string | 否   | 封面图片URL                  |
| article_type     | string | 否   | 文章类型（默认 study_guide） |
| category_ids     | array  | 否   | 分类ID列表                   |
| tag_ids          | array  | 否   | 标签ID列表                   |
| blocks           | array  | 否   | 内容块列表                   |
| keywords         | string | 否   | SEO关键词                    |
| meta_description | string | 否   | SEO描述                      |

**请求示例：**

```json
POST /api/articles

{
  "title": "PET 口语考试 Part 2 备考指南",
  "summary": "本文详细介绍 PET 口语考试 Part 2 的考试形式和备考技巧",
  "cover_image": "https://example.com/covers/article2.jpg",
  "article_type": "study_guide",
  "category_ids": [1, 3],
  "tag_ids": [1, 5],
  "keywords": "PET,口语,Part2,备考",
  "meta_description": "PET 口语考试 Part 2 备考指南",
  "blocks": [
    {
      "block_type": "text",
      "sort_order": 1,
      "content": "PET 口语考试 Part 2 是考试的第二部分..."
    },
    {
      "block_type": "image",
      "sort_order": 2,
      "media_url": "https://example.com/images/pet-part2.jpg",
      "media_alt": "PET 口语考试 Part 2 示意图",
      "caption": "图1: PET 口语考试流程"
    }
  ]
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "article": {
      "id": 2,
      "title": "PET 口语考试 Part 2 备考指南",
      "status": "draft",
      ...
    }
  }
}
```

---

### 15. 更新文章

更新已有文章。

**接口地址：** `PUT /api/articles/{article_id}`

**接口说明：** 更新文章，作者可以编辑草稿、已驳回、待审核状态的文章。

**认证要求：** 必需（仅作者可编辑自己的文章）

**可编辑状态说明：**

| 状态               | 是否可编辑 | 说明                                 |
| ------------------ | ---------- | ------------------------------------ |
| `draft`          | ✅         | 草稿状态，可以自由修改               |
| `pending_review` | ✅         | 待审核状态，可以修改并重新提交审核   |
| `approved`       | ❌         | 已通过状态，需要管理员修改或重新审核 |
| `rejected`       | ✅         | 已驳回状态，可以修改后重新提交审核   |
| `published`      | ❌         | 已发布状态，需要管理员修改           |

**注意：** 待审核状态的文章修改后，需要重新提交审核才能进入审核流程。

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求体：**

| 字段             | 类型   | 必填 | 说明        |
| ---------------- | ------ | ---- | ----------- |
| title            | string | 否   | 文章标题    |
| summary          | string | 否   | 文章摘要    |
| cover_image      | string | 否   | 封面图片URL |
| article_type     | string | 否   | 文章类型    |
| category_ids     | array  | 否   | 分类ID列表  |
| tag_ids          | array  | 否   | 标签ID列表  |
| blocks           | array  | 否   | 内容块列表  |
| keywords         | string | 否   | SEO关键词   |
| meta_description | string | 否   | SEO描述     |

**请求示例：**

```json
PUT /api/articles/2

{
  "title": "PET 口语考试 Part 2 完整备考指南",
  "summary": "本文详细介绍 PET 口语考试 Part 2 的考试形式、评分标准和备考技巧"
}
```

---

### 16. 删除文章

删除文章。

**接口地址：** `DELETE /api/articles/{article_id}`

**接口说明：** 删除文章，只能删除草稿状态的文章。

**认证要求：** 必需（仅作者可删除自己的草稿）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求示例：**

```http
DELETE /api/articles/2
```

**响应示例：**

```json
{
  "success": true,
  "message": "删除成功"
}
```

---

### 17. 提交审核

将草稿文章提交审核。

**接口地址：** `POST /api/articles/{article_id}/submit`

**接口说明：** 将草稿状态的文章提交审核。

**认证要求：** 必需（仅作者可提交）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求示例：**

```http
POST /api/articles/2/submit
```

**响应示例：**

```json
{
  "success": true,
  "message": "提交审核成功"
}
```

**权限要求：**

- 需要文章创建权限
- 文章状态必须为 `draft`

---

### 18. 发布文章

发布已审核通过的文章。

**接口地址：** `POST /api/articles/{article_id}/publish`

**接口说明：** 将已审核通过的文章发布，发布后所有人可见。

**认证要求：** 必需（作者或管理员）

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求示例：**

```http
POST /api/articles/2/publish
```

**响应示例：**

```json
{
  "success": true,
  "message": "发布成功"
}
```

**权限要求：**

- 文章状态必须为 `approved`
- 作者或超级管理员可以发布

---

### 19. 点赞文章

点赞文章。

**接口地址：** `POST /api/articles/{article_id}/like`

**接口说明：** 登录用户可以点赞已发布的文章。

**认证要求：** 必需

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求示例：**

```http
POST /api/articles/1/like
```

**响应示例：**

```json
{
  "success": true,
  "message": "点赞成功"
}
```

---

### 20. 取消点赞文章

取消点赞文章。

**接口地址：** `DELETE /api/articles/{article_id}/like`

**接口说明：** 取消对文章的点赞。

**认证要求：** 必需

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求示例：**

```http
DELETE /api/articles/1/like
```

**响应示例：**

```json
{
  "success": true,
  "message": "取消点赞成功"
}
```

---

### 21. 获取文章评论列表

获取指定文章的评论列表。

**接口地址：** `GET /api/articles/{article_id}/comments`

**接口说明：** 获取文章评论列表，只返回已审核通过的评论。

**认证要求：** 可选

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求参数：**

| 参数      | 类型   | 必填 | 默认值 | 说明                       |
| --------- | ------ | ---- | ------ | -------------------------- |
| page      | int    | 否   | 1      | 页码                       |
| page_size | int    | 否   | 20     | 每页数量                   |
| parent_id | int    | 否   | null   | 父评论ID（获取回复）       |
| sort      | string | 否   | latest | 排序方式（latest/hottest） |

**请求示例：**

```http
GET /api/articles/1/comments?page=1&page_size=20&sort=latest
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "total": 12,
    "page": 1,
    "page_size": 20,
    "comments": [
      {
        "id": 1,
        "article_id": 1,
        "user_id": 5,
        "parent_id": null,
        "content": "这篇文章写得很好，对我很有帮助！",
        "status": "approved",
        "like_count": 8,
        "reply_count": 2,
        "created_at": "2026-02-21T12:00:00",
        "updated_at": "2026-02-21T12:00:00",
        "user": {
          "id": 5,
          "username": "小明",
          "avatar": "https://example.com/avatars/user5.jpg"
        },
        "parent": null,
        "replies": [
          {
            "id": 2,
            "article_id": 1,
            "user_id": 6,
            "parent_id": 1,
            "content": "同意，确实很实用",
            "status": "approved",
            "like_count": 3,
            "reply_count": 0,
            "created_at": "2026-02-21T12:30:00",
            "updated_at": "2026-02-21T12:30:00",
            "user": {
              "id": 6,
              "username": "小红",
              "avatar": "https://example.com/avatars/user6.jpg"
            },
            "parent": null,
            "replies": [],
            "is_liked": false,
            "is_own": false
          }
        ],
        "is_liked": false,
        "is_own": false
      }
    ]
  }
}
```

---

### 22. 创建评论

创建新评论。

**接口地址：** `POST /api/articles/{article_id}/comments`

**接口说明：** 创建新评论，评论需要审核通过后才会显示。

**认证要求：** 必需

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |

**请求体：**

| 字段      | 类型   | 必填 | 说明                       |
| --------- | ------ | ---- | -------------------------- |
| content   | string | 是   | 评论内容（1-1000字符）     |
| parent_id | int    | 否   | 父评论ID（回复评论时需要） |

**请求示例：**

```json
POST /api/articles/1/comments

{
  "content": "这篇文章写得很好，对我很有帮助！"
}
```

**回复评论示例：**

```json
POST /api/articles/1/comments

{
  "content": "同意，确实很实用",
  "parent_id": 1
}
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": 1,
        "article_id": 1,
        "content": "这篇文章写得很好，对我很有帮助！",
        "status": "pending",
        ...
      }
    ]
  }
}
```

---

### 23. 更新评论

更新评论内容。

**接口地址：** `PUT /api/articles/{article_id}/comments/{comment_id}`

**接口说明：** 更新评论内容，只能更新自己的评论。

**认证要求：** 必需

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |
| comment_id | int  | 是   | 评论ID |

**请求体：**

| 字段    | 类型   | 必填 | 说明                   |
| ------- | ------ | ---- | ---------------------- |
| content | string | 是   | 评论内容（1-1000字符） |

**请求示例：**

```json
PUT /api/articles/1/comments/1

{
  "content": "这篇文章写得非常好，对我很有帮助！"
}
```

---

### 24. 删除评论

删除评论。

**接口地址：** `DELETE /api/articles/{article_id}/comments/{comment_id}`

**接口说明：** 删除评论，只能删除自己的评论。

**认证要求：** 必需

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |
| comment_id | int  | 是   | 评论ID |

**请求示例：**

```http
DELETE /api/articles/1/comments/1
```

**响应示例：**

```json
{
  "success": true,
  "message": "删除成功"
}
```

---

### 25. 点赞评论

点赞评论。

**接口地址：** `POST /api/articles/{article_id}/comments/{comment_id}/like`

**接口说明：** 登录用户可以点赞已审核通过的评论。

**认证要求：** 必需

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |
| comment_id | int  | 是   | 评论ID |

**请求示例：**

```http
POST /api/articles/1/comments/1/like
```

**响应示例：**

```json
{
  "success": true,
  "message": "点赞成功"
}
```

---

### 26. 取消点赞评论

取消点赞评论。

**接口地址：** `DELETE /api/articles/{article_id}/comments/{comment_id}/like`

**接口说明：** 取消对评论的点赞。

**认证要求：** 必需

**路径参数：**

| 参数       | 类型 | 必填 | 说明   |
| ---------- | ---- | ---- | ------ |
| article_id | int  | 是   | 文章ID |
| comment_id | int  | 是   | 评论ID |

**请求示例：**

```http
DELETE /api/articles/1/comments/1/like
```

**响应示例：**

```json
{
  "success": true,
  "message": "取消点赞成功"
}
```

---

### 27. 获取我的文章权限

获取当前用户在文章系统中的权限信息。

**接口地址：** `GET /api/articles/my-permissions`

**接口说明：** 用户使用该接口获取自己的文章发布权限。

**认证要求：** 必需

**请求参数：** 无

**请求示例：**

```http
GET /api/articles/my-permissions
```

**响应示例：**

```json
{
  "success": true,
  "data": {
    "total": 1,
    "page": 1,
    "page_size": 1,
    "permissions": [
      {
        "id": 1,
        "user_id": 72,
        "permission_type": "create",
        "status": "active",
        "expires_at": "2027-02-21T17:01:11",
        "articles_created": 0,
        "articles_published": 0,
        "created_at": "2026-02-21T17:01:11"
      }
    ]
  }
}
```

**权限状态说明：**

| status      | 说明                           |
| ----------- | ------------------------------ |
| `active`  | 权限激活中，可以创建和发布文章 |
| `expired` | 权限已过期，无法创建和发布文章 |
| `revoked` | 权限已被撤销                   |

**权限类型说明：**

| permission_type | 说明         |
| --------------- | ------------ |
| `create`      | 文章创建权限 |

---

## 权限管理接口（🔑 权限管理）

### 28. 获取有权限的用户列表

获取拥有文章发布权限的用户列表。

**接口地址：** `GET /api/admin/articles/users-with-permissions`

**接口说明：** 超级管理员使用该接口获取拥有文章发布权限的用户列表，支持按权限类型和状态筛选。

**认证要求：** 必需（超级管理员）

**查询参数：**

| 参数            | 类型   | 必填 | 说明                                                                       |
| --------------- | ------ | ---- | -------------------------------------------------------------------------- |
| permission_type | string | 否   | 权限类型：`create`（创建）、`create_review`（创建+审核）               |
| status          | string | 否   | 权限状态：`active`（有效）、`revoked`（已撤销）、`expired`（已过期） |

**请求示例：**

```http
# 获取所有有权限的用户
GET /api/admin/articles/users-with-permissions

# 按权限类型筛选（获取创建权限的用户）
GET /api/admin/articles/users-with-permissions?permission_type=create

# 按状态筛选（获取有效权限的用户）
GET /api/admin/articles/users-with-permissions?status=active

# 组合筛选（获取有效创建权限的用户）
GET /api/admin/articles/users-with-permissions?permission_type=create&status=active
```

**响应示例：**

```json
{
  "success": true,
  "users": [
    {
      "id": 72,
      "username": "张老师",
      "permission_type": "create"
    },
    {
      "id": 75,
      "username": "李老师",
      "permission_type": "create_review"
    },
    {
      "id": 80,
      "username": "王老师",
      "permission_type": "create"
    }
  ]
}
```

**权限类型说明：**

| permission_type   | 说明                    |
| ----------------- | ----------------------- |
| `create`        | 文章创建权限            |
| `create_review` | 文章创建 + 审核文章权限 |

---

### 29. 分配文章权限

为指定用户分配文章发布权限。

**接口地址：** `POST /api/admin/articles/permissions/grant`

**接口说明：** 超级管理员使用该接口为用户分配文章发布权限，支持设置权限过期时间。

**认证要求：** 必需（超级管理员）

**请求体：**

| 字段            | 类型   | 必填 | 说明                                                         |
| --------------- | ------ | ---- | ------------------------------------------------------------ |
| user_id         | int    | 是   | 用户ID                                                       |
| permission_type | string | 是   | 权限类型：`create`（创建）、`create_review`（创建+审核） |
| expires_at      | string | 否   | 权限过期时间（ISO 8601 格式），不填则永久有效                |

**请求示例：**

```http
# 分配永久创建权限
POST /api/admin/articles/permissions/grant
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": 72,
  "permission_type": "create"
}

# 分配带过期时间的审核权限
POST /api/admin/articles/permissions/grant
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": 75,
  "permission_type": "create_review",
  "expires_at": "2027-12-31T23:59:59"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "权限分配成功"
}
```

**失败响应：**

```json
{
  "detail": "权限类型必须是: create, create_review"
}
```

```json
{
  "detail": "该用户已拥有此类型权限"
}
```

**权限类型说明：**

| permission_type   | 说明                    |
| ----------------- | ----------------------- |
| `create`        | 文章创建权限            |
| `create_review` | 文章创建 + 审核文章权限 |

---

### 30. 撤销文章权限

撤销指定用户的文章发布权限。

**接口地址：** `POST /api/admin/articles/permissions/revoke`

**接口说明：** 超级管理员使用该接口撤销用户的文章发布权限。

**认证要求：** 必需（超级管理员）

**请求体：**

| 字段            | 类型   | 必填 | 说明                                                         |
| --------------- | ------ | ---- | ------------------------------------------------------------ |
| user_id         | int    | 是   | 用户ID                                                       |
| permission_type | string | 是   | 权限类型：`create`（创建）、`create_review`（创建+审核） |

**请求示例：**

```http
POST /api/admin/articles/permissions/revoke
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "user_id": 72,
  "permission_type": "create"
}
```

**响应示例：**

```json
{
  "success": true,
  "message": "权限撤销成功"
}
```

**失败响应：**

```json
{
  "detail": "未找到该用户的权限记录"
}
```

```json
{
  "detail": "该权限已被撤销"
}
```

---

## 分类标签接口（🏷️ 分类标签）

### 31. 获取分类树

获取所有分类的树形结构。

**接口地址：** `GET /api/articles/categories`

**接口说明：** 后台管理员和普通用户都可以使用该接口获取分类树。

**认证要求：** 无

**请求示例：**

```http
GET /api/articles/categories
```

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "口语考试",
      "slug": "speaking-exam",
      "parent_id": null,
      "sort_order": 1,
      "description": "口语考试相关内容",
      "icon": null,
      "article_count": 15,
      "children": [
        {
          "id": 2,
          "name": "KET",
          "slug": "ket",
          "parent_id": 1,
          "sort_order": 2,
          "description": "KET考试备考",
          "icon": null,
          "article_count": 5,
          "children": []
        },
        {
          "id": 3,
          "name": "PET",
          "slug": "pet",
          "parent_id": 1,
          "sort_order": 3,
          "description": "PET考试备考",
          "icon": null,
          "article_count": 6,
          "children": []
        }
      ]
    }
  ]
}
```

---

### 32. 获取标签列表

获取所有标签列表。

**接口地址：** `GET /api/articles/tags`

**接口说明：** 后台管理员和普通用户都可以使用该接口获取标签列表。

**认证要求：** 无

**请求示例：**

```http
GET /api/articles/tags
```

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Part 1",
      "slug": "part1",
      "color": "#FF6B6B",
      "article_count": 20
    },
    {
      "id": 2,
      "name": "Part 2",
      "slug": "part2",
      "color": "#4ECDC4",
      "article_count": 15
    },
    {
      "id": 3,
      "name": "Part 3",
      "slug": "part3",
      "color": "#45B7D1",
      "article_count": 18
    },
    {
      "id": 4,
      "name": "Part 4",
      "slug": "part4",
      "color": "#96CEB4",
      "article_count": 12
    },
    {
      "id": 5,
      "name": "技巧",
      "slug": "tips",
      "color": "#FFEAA7",
      "article_count": 35
    },
    {
      "id": 6,
      "name": "真题",
      "slug": "real-exam",
      "color": "#DDA0DD",
      "article_count": 28
    },
    {
      "id": 7,
      "name": "语法",
      "slug": "grammar",
      "color": "#98D8C8",
      "article_count": 10
    },
    {
      "id": 8,
      "name": "词汇",
      "slug": "vocabulary",
      "color": "#F7DC6F",
      "article_count": 22
    }
  ]
}
```

---

## 数据模型

### 文章状态 (ArticleStatus)

| 值             | 说明   |
| -------------- | ------ |
| draft          | 草稿   |
| pending_review | 待审核 |
| approved       | 已通过 |
| rejected       | 已驳回 |
| published      | 已发布 |
| archived       | 已归档 |

### 文章类型 (ArticleType)

| 值          | 说明     |
| ----------- | -------- |
| study_guide | 学习指南 |
| exam_tips   | 考试技巧 |
| resource    | 学习资源 |

### 内容块类型 (BlockType)

| 值      | 说明     |
| ------- | -------- |
| text    | 文本段落 |
| image   | 图片     |
| video   | 视频     |
| code    | 代码块   |
| quote   | 引用     |
| divider | 分隔线   |
| list    | 列表     |

### 列表类型 (ListType)

| 值        | 说明     |
| --------- | -------- |
| unordered | 无序列表 |
| ordered   | 有序列表 |

### 评论状态 (CommentStatus)

| 值       | 说明   |
| -------- | ------ |
| pending  | 待审核 |
| approved | 已通过 |
| rejected | 已驳回 |
| deleted  | 已删除 |

### 权限类型 (PermissionType)

| 值            | 说明                |
| ------------- | ------------------- |
| create        | 创建文章            |
| create_review | 创建文章 + 审核文章 |

### 权限状态 (PermissionStatus)

| 值      | 说明   |
| ------- | ------ |
| active  | 有效   |
| revoked | 已撤销 |

### 审核操作类型 (AuditAction)

| 值               | 说明     |
| ---------------- | -------- |
| submit           | 提交审核 |
| approve          | 审核通过 |
| reject           | 审核驳回 |
| request_revision | 请求修改 |
| archive          | 归档     |
| restore          | 恢复     |
| delete           | 删除     |

### 操作人角色 (OperatorRole)

| 值       | 说明   |
| -------- | ------ |
| author   | 作者   |
| reviewer | 审核员 |
| admin    | 管理员 |

---

## 附录

### 完整 API 端点列表

#### 文章相关接口

| 序号 | 端点                                   | 方法   | 说明             | 认证要求 |
| ---- | -------------------------------------- | ------ | ---------------- | -------- |
| 1    | `/api/articles`                      | GET    | 获取文章列表     | 可选     |
| 2    | `/api/articles/{article_id}`         | GET    | 获取文章详情     | 可选     |
| 3    | `/api/articles`                      | POST   | 创建文章草稿     | 必需     |
| 3.1  | `/api/articles/my-articles`          | GET    | 获取我的文章列表 | 必需     |
| 4    | `/api/articles/{article_id}`         | PUT    | 更新文章         | 必需     |
| 5    | `/api/articles/{article_id}`         | DELETE | 删除文章         | 必需     |
| 6    | `/api/articles/{article_id}/submit`  | POST   | 提交审核         | 必需     |
| 7    | `/api/articles/{article_id}/publish` | POST   | 发布文章         | 必需     |
| 8    | `/api/articles/{article_id}/like`    | POST   | 点赞文章         | 必需     |
| 9    | `/api/articles/{article_id}/like`    | DELETE | 取消点赞文章     | 必需     |

#### 评论相关接口

| 序号 | 端点                                                      | 方法   | 说明             | 认证要求 |
| ---- | --------------------------------------------------------- | ------ | ---------------- | -------- |
| 11   | `/api/articles/{article_id}/comments`                   | GET    | 获取文章评论列表 | 可选     |
| 12   | `/api/articles/{article_id}/comments`                   | POST   | 创建评论         | 必需     |
| 13   | `/api/articles/{article_id}/comments/{comment_id}`      | PUT    | 更新评论         | 必需     |
| 14   | `/api/articles/{article_id}/comments/{comment_id}`      | DELETE | 删除评论         | 必需     |
| 15   | `/api/articles/{article_id}/comments/{comment_id}/like` | POST   | 点赞评论         | 必需     |
| 16   | `/api/articles/{article_id}/comments/{comment_id}/like` | DELETE | 取消点赞评论     | 必需     |

#### 后台管理员接口

| 序号 | 端点                                                  | 方法   | 说明               | 认证要求       |
| ---- | ----------------------------------------------------- | ------ | ------------------ | -------------- |
| 18   | `/api/admin/articles/pending-review`                | GET    | 获取待审核文章列表 | 必需（管理员） |
| 19   | `/api/admin/articles/{article_id}/approve`          | POST   | 审核通过文章       | 必需（管理员） |
| 20   | `/api/admin/articles/{article_id}/reject`           | POST   | 审核驳回文章       | 必需（管理员） |
| 21   | `/api/admin/articles/{article_id}/request-revision` | POST   | 请求修改           | 必需（管理员） |
| 21.1 | `/api/admin/articles/{article_id}`                  | PUT    | 管理员更新文章     | 必需（管理员） |
| 22   | `/api/admin/articles/{article_id}/archive`          | POST   | 归档文章           | 必需（管理员） |
| 23   | `/api/admin/articles/{article_id}/audit-logs`       | GET    | 获取文章审核日志   | 必需（管理员） |
| 24   | `/api/admin/articles/pending-comments`              | GET    | 获取待审核评论列表 | 必需（管理员） |
| 25   | `/api/admin/articles/comments/{comment_id}/approve` | POST   | 审核通过评论       | 必需（管理员） |
| 26   | `/api/admin/articles/comments/{comment_id}/reject`  | POST   | 审核驳回评论       | 必需（管理员） |
| 27   | `/api/admin/articles/comments/{comment_id}`         | DELETE | 删除评论           | 必需（管理员） |

#### 权限管理接口

| 序号 | 端点                                           | 方法 | 说明                 | 认证要求           |
| ---- | ---------------------------------------------- | ---- | -------------------- | ------------------ |
| 28   | `/api/articles/my-permissions`               | GET  | 获取我的文章权限     | 必需               |
| 29   | `/api/admin/articles/users-with-permissions` | GET  | 获取有权限的用户列表 | 必需（管理员）     |
| 30   | `/api/admin/articles/permissions/grant`      | POST | 分配权限             | 必需（超级管理员） |
| 31   | `/api/admin/articles/permissions/revoke`     | POST | 撤销权限             | 必需（超级管理员） |
| 32   | `/api/admin/articles/permissions`            | GET  | 获取权限列表         | 必需（超级管理员） |

#### 分类标签接口

| 序号 | 端点                         | 方法 | 说明         | 认证要求 |
| ---- | ---------------------------- | ---- | ------------ | -------- |
| 32   | `/api/articles/categories` | GET  | 获取分类树   | 无       |
| 33   | `/api/articles/tags`       | GET  | 获取标签列表 | 无       |
