# 管理员操作接口文档

> **最后更新**: 2026-02-04  
> **版本**: v1.0.0

本文档描述管理员后台管理接口，包括金币管理、VIP管理和操作日志查询功能。

---

## 目录

1. [金币管理接口](#金币管理接口)
2. [VIP管理接口](#vip管理接口)
3. [操作日志接口](#操作日志接口)
4. [权限说明](#权限说明)
5. [快速参考](#快速参考)

---

## 金币管理接口

### 1. 获取钱包列表

**接口**: `GET /api/admin/wallets`

**描述**: 查询所有用户钱包，支持多维度筛选、分页和排序

**请求头**:
```
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |
| min_balance | int | 否 | 最小余额 |
| max_balance | int | 否 | 最大余额 |
| user_id | int | 否 | 用户ID |
| user_email | string | 否 | 用户邮箱（模糊搜索） |
| sort_by | string | 否 | 排序字段：balance/created_at/updated_at，默认balance |
| sort_order | string | 否 | 排序方向：asc/desc，默认desc |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 123,
      "email": "user@example.com",
      "balance": 1000,
      "frozen_balance": 0,
      "created_at": "2026-01-01 10:00:00",
      "updated_at": "2026-02-04 14:00:00"
    }
  ],
  "total": 50,
  "page": 1,
  "page_size": 20,
  "message": "找到 50 个钱包"
}
```

### 2. 获取用户钱包详情

**接口**: `GET /api/admin/wallets/{user_id}`

**描述**: 查看指定用户的钱包完整信息，包含统计数据

**请求头**:
```
Authorization: Bearer <admin_token>
```

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 是 | 用户ID |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "wallet": {
      "id": 1,
      "user_id": 123,
      "balance": 1000,
      "frozen_balance": 0,
      "created_at": "2026-01-01 10:00:00",
      "updated_at": "2026-02-04 14:00:00"
    },
    "user": {
      "user_id": 123,
      "email": "user@example.com",
      "is_active": true,
      "created_at": "2026-01-01 09:00:00"
    },
    "statistics": {
      "total_recharge": 5000,
      "total_consume": 4000,
      "transaction_count": 150,
      "last_transaction_time": "2026-02-04 13:00:00"
    }
  },
  "message": "获取钱包详情成功"
}
```

### 3. 获取用户钱包流水

**接口**: `GET /api/admin/wallets/{user_id}/logs`

**描述**: 查询指定用户的钱包变动记录

**请求头**:
```
Authorization: Bearer <admin_token>
```

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 是 | 用户ID |

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认50，最大200 |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "user_id": 123,
      "change_amount": 500,
      "balance_before": 500,
      "balance_after": 1000,
      "biz_type": "admin_adjust",
      "biz_id": 1,
      "remark": "系统补偿",
      "created_at": "2026-02-04 14:00:00"
    }
  ],
  "total": 10,
  "page": 1,
  "page_size": 50,
  "message": "找到 10 条流水记录"
}
```

**业务类型说明** (`biz_type`):
- `admin_adjust`: 管理员手动调整
- `order_recharge`: 充值订单
- `consume`: 消费扣款
- `refund`: 退款

### 4. 调整用户余额 ⭐

**接口**: `POST /api/admin/wallets/{user_id}/adjust`

**描述**: 管理员手动增加或减少用户钱包余额，所有调整都会记录流水

**请求头**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 是 | 用户ID |

**请求体**:
```json
{
  "change_amount": 100,
  "remark": "系统补偿"
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| change_amount | int | 是 | 变动金额（正数=增加，负数=减少） |
| remark | string | 是 | 调整原因，1-200字符 |

**响应示例**:
```json
{
  "success": true,
  "message": "已增加 100 金币"
}
```

**注意事项**:
- ✅ 正数表示增加余额
- ✅ 负数表示减少余额
- ⚠️ 调整后余额不能为负数
- ⚠️ 必须填写调整原因（审计用）
- ⚠️ 所有调整都会记录在流水中，`biz_type=admin_adjust`，`biz_id=操作员ID`

### 5. 全局钱包流水查询

**接口**: `GET /api/admin/wallet-logs/all`

**描述**: 查询所有用户的钱包流水，支持多维度筛选（跨用户查询）

**请求头**:
```
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 否 | 用户ID |
| start_date | string | 否 | 开始日期 YYYY-MM-DD |
| end_date | string | 否 | 结束日期 YYYY-MM-DD |
| biz_type | string | 否 | 业务类型 |
| min_amount | int | 否 | 最小变动金额 |
| max_amount | int | 否 | 最大变动金额 |
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认50，最大200 |

**响应示例**: 同"获取用户钱包流水"

---

## VIP管理接口

### 1. 获取VIP套餐列表

**接口**: `GET /api/admin/vip-plans`

**描述**: 查询所有VIP套餐配置

**请求头**:
```
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |
| exam_level | string | 否 | 考试级别：ALL/KET/PET/FCE |
| status | string | 否 | 状态：active/inactive |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "exam_category_id": 0,
      "exam_level": "ALL",
      "plan_type": "monthly",
      "duration_days": 30,
      "original_price": 4900,
      "sale_price": 4900,
      "first_buy_discount": 10,
      "first_buy_price": 4410,
      "plan_name": "月卡会员",
      "description": "适用所有级别",
      "features": "全部题库访问,无限练习",
      "status": "active",
      "created_at": "2026-01-01 10:00:00"
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20,
  "message": "找到 3 个套餐"
}
```

### 2. 获取VIP订阅记录列表

**接口**: `GET /api/admin/vip-subscriptions/list`

**描述**: 查询所有用户的VIP订阅记录

**请求头**:
```
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 否 | 用户ID |
| status | string | 否 | 订阅状态：ACTIVE/EXPIRED/CANCELED |
| exam_level | string | 否 | 考试级别：ALL/KET/PET/FCE |
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 9,
      "user_id": 65,
      "username": "test_user",
      "plan_id": 16,
      "plan_name": "月卡会员",
      "exam_level": "ALL",
      "plan_type": "monthly",
      "start_time": "2026-02-04 14:28:12",
      "end_time": "2026-03-06 14:28:12",
      "duration_days": 30,
      "paid_amount": 0,
      "original_price": 4900,
      "is_first_buy": 0,
      "status": "ACTIVE",
      "order_id": 9000001770186492,
      "order_no": "ADMIN_GRANT_1770186492_65",
      "created_at": "2026-02-04 14:28:12",
      "updated_at": "2026-02-04 14:28:12"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20,
  "message": "找到 1 条订阅记录"
}
```

**识别管理员赠送的VIP**:
- `paid_amount = 0`: 实付金额为0
- `order_no` 前缀为 `ADMIN_GRANT_`: 管理员开通订单
- `order_id > 9000000000000000000`: 特殊的超大数值标识

### 3. 获取用户VIP订阅摘要

**接口**: `GET /api/admin/vip-subscriptions/user/{user_id}/summary`

**描述**: 查询指定用户的VIP订阅摘要信息

**请求头**:
```
Authorization: Bearer <admin_token>
```

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 是 | 用户ID |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user_id": 65,
    "username": "test_user",
    "total_subscriptions": 1,
    "active_subscriptions": 1,
    "last_subscription_end_time": "2026-03-06 14:28:12",
    "total_paid_amount": 0,
    "first_subscription_time": "2026-02-04 14:28:12",
    "last_subscription_time": "2026-02-04 14:28:12"
  },
  "message": "查询成功"
}
```

### 4. 获取用户VIP订阅历史

**接口**: `GET /api/admin/vip-subscriptions/user/{user_id}/history`

**描述**: 查询指定用户的所有VIP订阅记录（含已过期）

**请求头**:
```
Authorization: Bearer <admin_token>
```

**路径参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 是 | 用户ID |

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20 |

**响应示例**: 同"获取VIP订阅记录列表"

### 5. 管理员开通VIP ⭐

**接口**: `POST /api/admin/vip-subscriptions/grant`

**描述**: 管理员手动为用户开通VIP订阅（无需支付），支持续费和自定义天数

**请求头**:
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**请求体**:
```json
{
  "user_id": 123,
  "plan_id": 16,
  "remark": "活动赠送",
  "duration_days": 30
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| user_id | int | 是 | 用户ID |
| plan_id | int | 是 | 套餐ID |
| remark | string | 是 | 开通原因，1-200字符（审计用） |
| duration_days | int | 否 | 自定义天数，1-3650天（不填则使用套餐默认天数） |

**响应示例**:
```json
{
  "success": true,
  "message": "VIP订阅开通成功",
  "data": {
    "subscription_id": 9,
    "user_id": 123,
    "plan_name": "月卡会员",
    "exam_level": "ALL",
    "start_time": "2026-02-04 14:28:12",
    "end_time": "2026-03-06 14:28:12",
    "duration_days": 30,
    "order_no": "ADMIN_GRANT_1770186492_123",
    "operator_id": 1,
    "operator_email": "admin@example.com"
  }
}
```

**功能特性**:
- ✅ **智能续费**: 如果用户已有同级别未过期订阅，自动从结束时间延长
- ✅ **自定义天数**: 可指定任意天数，不限于套餐默认天数
- ✅ **跨级别开通**: 可为已有其他级别VIP的用户开通新级别
- ✅ **审计追踪**: 记录操作员ID、邮箱和开通原因
- ✅ **特殊标记**: 
  - `paid_amount = 0` 标识免费赠送
  - `order_id > 9000000000000000000` 使用超大数值避免冲突
  - `order_no = ADMIN_GRANT_{timestamp}_{user_id}` 特殊订单号格式

**使用场景**:
- 客服补偿用户
- 活动赠送VIP
- 内部测试账号
- 异常订单补开通

### 6. VIP订阅统计

**接口**: `GET /api/admin/vip-subscriptions/statistics`

**描述**: 获取VIP订阅的统计数据

**请求头**:
```
Authorization: Bearer <admin_token>
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total_subscriptions": 100,
    "active_subscriptions": 50,
    "expired_subscriptions": 45,
    "canceled_subscriptions": 5,
    "total_revenue": 245000,
    "by_level": {
      "ALL": 80,
      "KET": 10,
      "PET": 5,
      "FCE": 5
    },
    "by_plan_type": {
      "monthly": 60,
      "quarterly": 25,
      "yearly": 15
    }
  },
  "message": "统计数据获取成功"
}
```

---

## 操作日志接口

### 1. 查询管理员操作日志 ⭐

**接口**: `GET /api/admin/operations/logs`

**描述**: 统一查询所有管理员操作记录（金币发放 + VIP开通），支持多维度筛选

**请求头**:
```
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| operation_type | string | 否 | 操作类型：grant_vip/adjust_balance/all，默认all |
| operator_id | int | 否 | 操作员ID |
| user_id | int | 否 | 被操作用户ID |
| start_date | string | 否 | 开始日期 YYYY-MM-DD |
| end_date | string | 否 | 结束日期 YYYY-MM-DD |
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认20，最大100 |

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "vip_9",
      "operation_type": "grant_vip",
      "operator_id": 1,
      "operator_email": "admin@example.com",
      "user_id": 65,
      "user_email": "user@example.com",
      "description": "开通VIP: 月卡会员 (30天)",
      "amount": 30,
      "remark": "活动赠送",
      "created_at": "2026-02-04 14:28:12"
    },
    {
      "id": "coin_1001",
      "operation_type": "adjust_balance",
      "operator_id": 1,
      "operator_email": "admin@example.com",
      "user_id": 123,
      "user_email": "user@example.com",
      "description": "增加金币: 500 个",
      "amount": 500,
      "remark": "系统补偿",
      "created_at": "2026-02-04 14:00:00"
    }
  ],
  "total": 2,
  "page": 1,
  "page_size": 20,
  "message": "找到 2 条操作记录"
}
```

**字段说明**:
| 字段 | 说明 |
|------|------|
| id | 唯一标识，格式：vip_{订阅ID} 或 coin_{流水ID} |
| operation_type | 操作类型：grant_vip（开通VIP）、adjust_balance（调整金币） |
| operator_id | 操作员用户ID |
| operator_email | 操作员邮箱（VIP操作暂时为null） |
| user_id | 被操作的用户ID |
| user_email | 被操作的用户邮箱 |
| description | 操作描述 |
| amount | 金币操作为金币数量，VIP操作为天数 |
| remark | 操作原因/备注 |
| created_at | 操作时间 |

**筛选示例**:

1. **查询所有操作**:
```bash
GET /api/admin/operations/logs?page=1&page_size=20
```

2. **只查询金币操作**:
```bash
GET /api/admin/operations/logs?operation_type=adjust_balance
```

3. **只查询VIP开通**:
```bash
GET /api/admin/operations/logs?operation_type=grant_vip
```

4. **查询特定用户的操作记录**:
```bash
GET /api/admin/operations/logs?user_id=123
```

5. **查询今天的操作**:
```bash
GET /api/admin/operations/logs?start_date=2026-02-04&end_date=2026-02-04
```

### 2. 管理员操作统计

**接口**: `GET /api/admin/operations/statistics`

**描述**: 获取管理员操作的统计数据

**请求头**:
```
Authorization: Bearer <admin_token>
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_date | string | 否 | 开始日期 YYYY-MM-DD |
| end_date | string | 否 | 结束日期 YYYY-MM-DD |

**响应示例**:
```json
{
  "success": true,
  "data": {
    "total_operations": 150,
    "grant_vip_count": 50,
    "adjust_balance_count": 100,
    "total_coins_granted": 50000,
    "total_coins_deducted": 1000,
    "unique_operators": 3,
    "unique_users": 80
  },
  "message": "统计数据获取成功"
}
```

**字段说明**:
| 字段 | 说明 |
|------|------|
| total_operations | 总操作次数 |
| grant_vip_count | 开通VIP次数 |
| adjust_balance_count | 调整金币次数 |
| total_coins_granted | 累计发放金币数 |
| total_coins_deducted | 累计扣减金币数 |
| unique_operators | 操作员人数 |
| unique_users | 被操作用户数 |

---

## 权限说明

### 超级用户权限

所有管理员接口都需要**超级用户权限**（`is_superuser = 1`）。

**权限验证流程**:
1. 请求头携带 `Authorization: Bearer <token>`
2. 验证 Token 有效性
3. 检查用户的 `is_superuser` 字段
4. 非超级用户返回 `403 Forbidden`

**错误响应示例**:
```json
{
  "detail": "需要管理员权限"
}
```

### 设置超级用户

在数据库中手动设置：
```sql
UPDATE users SET is_superuser = 1 WHERE email = 'admin@example.com';
```

---

## 快速参考

### 金币管理流程

```
1. 查看用户钱包
   GET /api/admin/wallets?user_email=user@example.com
   
2. 查看钱包详情
   GET /api/admin/wallets/{user_id}
   
3. 调整余额
   POST /api/admin/wallets/{user_id}/adjust
   Body: {"change_amount": 500, "remark": "系统补偿"}
   
4. 验证流水
   GET /api/admin/wallets/{user_id}/logs
```

### VIP管理流程

```
1. 查看VIP套餐
   GET /api/admin/vip-plans
   
2. 查看用户订阅情况
   GET /api/admin/vip-subscriptions/user/{user_id}/summary
   
3. 开通VIP
   POST /api/admin/vip-subscriptions/grant
   Body: {
     "user_id": 123,
     "plan_id": 16,
     "remark": "活动赠送",
     "duration_days": 30
   }
   
4. 验证订阅记录
   GET /api/admin/vip-subscriptions/user/{user_id}/history
```

### 操作日志查询流程

```
1. 查看今天的所有操作
   GET /api/admin/operations/logs?start_date=2026-02-04&end_date=2026-02-04
   
2. 查看某个用户的操作记录
   GET /api/admin/operations/logs?user_id=123
   
3. 查看统计数据
   GET /api/admin/operations/statistics
```

---

## 完整示例：管理员为用户发放福利

### 场景：为用户发放500金币和30天VIP

```bash
# 1. 管理员登录
curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "adminpass"
  }'

# 响应获取 token

# 2. 查看用户信息
curl -X GET "http://localhost:9002/api/admin/wallets?user_email=user@example.com" \
  -H "Authorization: Bearer <token>"

# 3. 为用户增加500金币
curl -X POST http://localhost:9002/api/admin/wallets/123/adjust \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "change_amount": 500,
    "remark": "新年活动赠送"
  }'

# 4. 查看VIP套餐
curl -X GET http://localhost:9002/api/admin/vip-plans \
  -H "Authorization: Bearer <token>"

# 5. 为用户开通30天VIP
curl -X POST http://localhost:9002/api/admin/vip-subscriptions/grant \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "plan_id": 16,
    "remark": "新年活动赠送",
    "duration_days": 30
  }'

# 6. 查看操作日志验证
curl -X GET "http://localhost:9002/api/admin/operations/logs?user_id=123" \
  -H "Authorization: Bearer <token>"
```

---

## 常见问题 FAQ

### Q1: 调整余额时提示"调整后余额为负"

**原因**: 尝试扣除的金币数量超过用户当前余额

**解决**: 先查询用户余额，确保 `change_amount` 不会导致余额为负

```bash
# 查询余额
GET /api/admin/wallets/{user_id}

# 确保: balance + change_amount >= 0
```

### Q2: 开通VIP时提示"用户不存在"

**原因**: 指定的 `user_id` 不存在

**解决**: 通过钱包列表或用户管理接口确认用户ID

```bash
GET /api/admin/wallets?user_email=xxx@example.com
```

### Q3: 开通VIP时提示"套餐不存在"

**原因**: 指定的 `plan_id` 不存在或已下架

**解决**: 查询有效套餐列表

```bash
GET /api/admin/vip-plans?status=active
```

### Q4: 如何识别哪些VIP是管理员赠送的？

**方法1**: 通过订单号前缀
```
order_no LIKE 'ADMIN_GRANT%'
```

**方法2**: 通过实付金额
```
paid_amount = 0
```

**方法3**: 通过操作日志
```
GET /api/admin/operations/logs?operation_type=grant_vip
```

### Q5: 如何查看某个管理员的所有操作记录？

```bash
GET /api/admin/operations/logs?operator_id=1
```

注意: VIP操作的 `operator_id` 暂时无法筛选（需要数据库表扩展）

### Q6: 金币流水中如何找到操作员信息？

在流水记录中:
- `biz_type = "admin_adjust"` 表示管理员操作
- `biz_id` 字段存储操作员的用户ID
- 可通过 `biz_id` 关联 `users` 表获取操作员信息

---

## 测试脚本

测试脚本位置：
- 金币测试：`test/test_admin_wallet_api.py` (如有)
- VIP测试：`test/test_admin_grant_vip.py`
- 操作日志测试：`test/test_admin_operations_api.py`

运行测试：
```bash
python test/test_admin_operations_api.py
```

---

## 更新日志

### v1.0.0 (2026-02-04)
- ✅ 实现金币调整接口
- ✅ 实现VIP开通接口
- ✅ 实现操作日志查询接口
- ✅ 实现操作统计接口
- ✅ 支持智能续费
- ✅ 支持自定义天数
- ✅ 完整的审计追踪

---

## 相关文档

- [钱包管理后台完整文档](./WALLET_API.md)
- [VIP订阅API文档](./VIP_SUBSCRIPTION_API.md)
- [VIP订阅快速参考](./VIP_SUBSCRIPTION_QUICK_REFERENCE.md)
- [系统架构概览](./devlog/SYSTEM_ARCHITECTURE_OVERVIEW.md)

---

**文档维护**: 如有问题或建议，请联系开发团队
