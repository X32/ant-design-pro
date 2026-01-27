# VIP订阅功能API文档

## 概述

VIP订阅功能允许用户订阅不同考试级别（KET/PET/FCE）的套餐，享受对应级别的练习权限。支持按月/季/年订阅，新用户首次购买享受首减优惠。

## 数据库表设计

### 1. vip_subscription_plan（套餐配置表）

存储VIP订阅套餐的配置信息。

**关键字段：**
- `exam_category_id`: 考试分类ID（关联exam_category表）
- `exam_level`: 考试级别（KET/PET/FCE）
- `plan_type`: 套餐类型（monthly/quarterly/yearly）
- `duration_days`: 订阅时长（天数）
- `original_price`, `first_buy_price`: 原价和首减价（单位：分）

### 2. user_subscription（用户订阅记录表）

记录用户的订阅信息和状态。

**关键字段：**
- `user_id`: 用户ID
- `plan_id`: 套餐ID
- `start_time`, `end_time`: 订阅开始和结束时间
- `status`: 订阅状态（ACTIVE/EXPIRED/CANCELED）
- `order_id`: 关联的订单ID

### 3. recharge_order（订单表扩展）

增加了两个字段支持VIP订阅：
- `order_type`: 订单类型（coin_recharge/vip_subscription）
- `subscription_plan_id`: VIP订阅套餐ID

## API接口

### 基础信息

- **Base URL**: `http://your-domain:port`
- **API前缀**: `/api/order/vip`
- **认证方式**: Bearer Token（除套餐查询外均需要）

### 1. 获取VIP套餐列表

**接口**: `GET /api/order/vip/plans`

**参数**:
- `exam_level` (可选): 过滤考试级别（KET/PET/FCE）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "KET": [
      {
        "id": 1,
        "exam_level": "KET",
        "plan_type": "monthly",
        "plan_name": "KET月卡",
        "duration_days": 30,
        "original_price": 3900,
        "first_buy_price": 1990,
        "description": "KET考试1个月无限练习",
        "is_recommended": 0
      }
    ],
    "PET": [...],
    "FCE": [...]
  }
}
```

### 2. 查询我的订阅状态

**接口**: `GET /api/order/vip/my-subscription`

**认证**: 需要

**响应示例**:
```json
{
  "success": true,
  "data": {
    "has_subscription": true,
    "subscription": {
      "id": 1,
      "exam_level": "PET",
      "plan_type": "quarterly",
      "start_time": "2026-01-24T10:00:00",
      "end_time": "2026-04-24T10:00:00",
      "remaining_days": 89,
      "status": "ACTIVE"
    }
  }
}
```

### 3. 创建VIP订阅订单

**接口**: `POST /api/order/vip/subscribe`

**认证**: 需要

**请求体**:
```json
{
  "plan_id": 1,
  "pay_channel": "alipay"
}
```

**参数说明**:
- `plan_id`: 套餐ID
- `pay_channel`: 支付渠道（alipay/wechat）

**响应示例**:
```json
{
  "success": true,
  "message": "订单创建成功",
  "data": {
    "order_id": 123,
    "order_no": "VIP202601241030001",
    "plan_name": "PET月卡",
    "exam_level": "PET",
    "plan_type": "monthly",
    "duration_days": 30,
    "amount": 2490,
    "is_first_buy": true,
    "pay_channel": "alipay",
    "pay_url": "https://openapi.alipay.com/gateway...",
    "expired_at": "2026-01-24T11:30:00"
  }
}
```

### 4. 检查访问权限

**接口**: `POST /api/order/vip/check-access`

**认证**: 需要

**请求体**:
```json
{
  "exam_level": "PET"
}
```

**响应示例（有权限）**:
```json
{
  "success": true,
  "data": {
    "has_access": true,
    "subscription": {
      "exam_level": "PET",
      "end_time": "2026-04-24T10:00:00",
      "remaining_days": 89
    }
  }
}
```

**响应示例（无权限）**:
```json
{
  "success": false,
  "data": {
    "has_access": false,
    "message": "请订阅PET套餐后使用",
    "recommend_plans": [
      {
        "id": 1,
        "plan_name": "PET月卡",
        "price": 2490
      }
    ]
  }
}
```

### 5. 查询订阅历史

**接口**: `GET /api/order/vip/history`

**认证**: 需要

**参数**:
- `page`: 页码（默认1）
- `page_size`: 每页数量（默认20）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "exam_level": "PET",
        "plan_type": "quarterly",
        "order_no": "VIP202601241030001",
        "status": "ACTIVE",
        "start_time": "2026-01-24T10:00:00",
        "end_time": "2026-04-24T10:00:00",
        "paid_amount": 12900,
        "is_first_buy": 0
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  }
}
```

## 业务流程

### 新用户首次购买

1. 用户登录系统
2. 调用 `GET /api/order/vip/plans` 查看套餐列表
3. 选择套餐后调用 `POST /api/order/vip/subscribe` 创建订单
4. 系统判断为首次购买，使用 `first_buy_price` 价格
5. 返回支付链接，用户完成支付
6. 支付回调后创建订阅记录，订阅立即生效

### 续费流程

1. 用户订阅到期前或到期后
2. 调用相同的 `POST /api/order/vip/subscribe` 接口
3. 系统判断为续费，使用 `sale_price` 价格
4. 完成支付后延长订阅有效期

### 权限验证流程

应用在访问特定考试内容前调用 `POST /api/order/vip/check-access` 验证权限：
- 返回 `has_access: true` → 允许访问
- 返回 `has_access: false` → 拒绝访问并推荐套餐

## 数据库迁移

执行迁移脚本：
```bash
mysql -u your_user -p your_database < doc/migration_add_vip_subscription.sql
```

**重要提示**：
1. 脚本会创建两个新表：`vip_subscription_plan` 和 `user_subscription`
2. 修改 `recharge_order` 表，增加 `order_type` 和 `subscription_plan_id` 字段
3. 自动插入9个初始套餐（KET/PET/FCE各3个）
4. 请根据实际的 `exam_category` 表ID调整套餐数据

## 定价策略

### 套餐价格（单位：元）

| 级别 | 月卡 | 季卡 | 年卡 |
|------|------|------|------|
| KET  | 39   | 99   | 298  |
| PET  | 49   | 129  | 368  |
| FCE  | 59   | 159  | 428  |

### 首减优惠（新用户首次购买）

| 级别 | 首减价格 | 折扣 |
|------|----------|------|
| KET月卡  | 19.9元 | 约5.1折 |
| PET月卡  | 24.9元 | 约5.1折 |
| FCE月卡  | 29.9元 | 约5.1折 |

**注意**：
- 季卡和年卡暂不提供首减优惠
- 首减优惠仅限每个用户每个级别首次购买

## 测试

提供了完整的测试脚本：

```bash
python test/test_vip_subscription_api.py
```

测试内容包括：
1. 用户登录
2. 查询所有套餐
3. 查询指定级别套餐
4. 查询我的订阅状态
5. 检查访问权限
6. 创建订阅订单
7. 查询订阅历史

## 后续优化方向

### P1（已实现）
- ✅ 套餐配置管理
- ✅ 订阅购买流程
- ✅ 权限验证接口
- ✅ 订阅查询功能

### P2（待实现）
- ⏳ 支付宝支付集成
- ⏳ 支付回调处理订阅激活
- ⏳ 续费逻辑（延长有效期）
- ⏳ 升级逻辑（差价计算）

### P3（未来规划）
- 自动续费功能
- 订阅优惠券系统
- 订阅赠送功能
- 订阅统计分析
- 订阅到期提醒

## 注意事项

1. **价格单位**：所有价格均以分为单位存储，前端展示时需除以100
2. **时间处理**：使用ISO 8601格式的时间字符串
3. **幂等性**：支付回调需要实现幂等处理，避免重复激活订阅
4. **并发控制**：订单创建时需要加锁，避免重复购买
5. **状态流转**：订阅状态从ACTIVE → EXPIRED是自动判断的（通过end_time）

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权（token无效） |
| 404 | 套餐不存在 |
| 409 | 已有订阅冲突 |
| 500 | 服务器内部错误 |

## 联系方式

如有问题请参考：
- 项目文档：`doc/`
- 测试脚本：`test/test_vip_subscription_api.py`
- 数据库脚本：`doc/migration_add_vip_subscription.sql`




# 管理员接口（后台管理）

## 概述

管理员接口用于管理VIP订阅套餐配置，包括创建、修改、上架/下架、删除套餐等操作。

**权限要求**：所有接口都需要超级用户权限（`is_superuser=true`）

## 基础信息

- **Base URL**: `http://your-domain:port`
- **API前缀**: `/api/admin/vip-plans`
- **认证方式**: Bearer Token（必须是超级用户）
- **请求头**:
  ```
  Authorization: Bearer {admin_token}
  Content-Type: application/json
  ```

---

## 管理员API接口

### 1. 查询套餐列表（管理员）

**接口**: `GET /api/admin/vip-plans/`

**认证**: 需要（超级用户）

**查询参数**:
- `exam_level` (可选): 过滤考试级别（KET/PET/FCE）
- `status` (可选): 过滤状态（1=上架，0=下架，不传则查询所有）

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "exam_category_id": 1,
      "exam_level": "PET",
      "plan_type": "monthly",
      "plan_name": "PET月卡",
      "duration_days": 30,
      "original_price": 4900,
      "sale_price": 4900,
      "first_buy_discount": 2410,
      "first_buy_price": 2490,
      "description": "PET考试1个月无限练习",
      "features": null,
      "status": 1,
      "status_label": "上架",
      "sort": 300,
      "is_recommended": 0,
      "created_at": "2026-01-24T10:00:00",
      "updated_at": "2026-01-24T10:00:00"
    }
  ],
  "total": 1,
  "message": "查询成功，共 1 个套餐"
}
```

**字段说明**:
- `status`: 1=上架，0=下架
- `status_label`: 状态文字描述
- `sort`: 排序权重（数字越大越靠前）
- `is_recommended`: 是否推荐（1=是，0=否）

---

### 2. 查询套餐详情（管理员）

**接口**: `GET /api/admin/vip-plans/{plan_id}`

**认证**: 需要（超级用户）

**路径参数**:
- `plan_id`: 套餐ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "exam_category_id": 1,
    "exam_level": "PET",
    "plan_type": "monthly",
    "plan_name": "PET月卡",
    "duration_days": 30,
    "original_price": 4900,
    "sale_price": 4900,
    "first_buy_discount": 2410,
    "first_buy_price": 2490,
    "description": "PET考试1个月无限练习",
    "features": "{\"unlimited_practice\": true}",
    "status": 1,
    "status_label": "上架",
    "sort": 300,
    "is_recommended": 0,
    "created_at": "2026-01-24T10:00:00",
    "updated_at": "2026-01-24T10:00:00"
  },
  "message": "查询成功"
}
```

---

### 3. 创建套餐（管理员）

**接口**: `POST /api/admin/vip-plans/`

**认证**: 需要（超级用户）

**请求体**:
```json
{
  "exam_category_id": 1,
  "exam_level": "PET",
  "plan_type": "weekly",
  "duration_days": 7,
  "original_price": 1900,
  "sale_price": 1900,
  "first_buy_discount": 500,
  "first_buy_price": 1400,
  "plan_name": "PET周卡",
  "description": "PET考试1周无限练习",
  "features": "{\"unlimited_practice\": true}",
  "status": 1,
  "sort": 350,
  "is_recommended": 0
}
```

**字段说明**:
- `exam_category_id`: 考试分类ID（必须存在于exam_category表）
- `exam_level`: 考试级别（KET/PET/FCE）
- `plan_type`: 套餐类型（monthly/quarterly/yearly/weekly等）
- `duration_days`: 订阅时长（天数）
- `original_price`: 原价（分）
- `sale_price`: 售价（分）
- `first_buy_discount`: 首减金额（分）
- `first_buy_price`: 首购价（分）= 原价 - 首减金额
- `plan_name`: 套餐名称
- `description`: 套餐说明
- `features`: 套餐特权（JSON字符串，可选）
- `status`: 状态（1=上架，0=下架）
- `sort`: 排序权重（数字越大越靠前）
- `is_recommended`: 是否推荐（1=是，0=否）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "exam_category_id": 1,
    "exam_level": "PET",
    "plan_type": "weekly",
    "plan_name": "PET周卡",
    "duration_days": 7,
    "original_price": 1900,
    "sale_price": 1900,
    "first_buy_discount": 500,
    "first_buy_price": 1400,
    "description": "PET考试1周无限练习",
    "features": "{\"unlimited_practice\": true}",
    "status": 1,
    "status_label": "上架",
    "sort": 350,
    "is_recommended": 0,
    "created_at": "2026-01-27T15:30:00",
    "updated_at": "2026-01-27T15:30:00"
  },
  "message": "套餐创建成功"
}
```

**注意事项**:
- 同一 `exam_category_id` + `plan_type` 组合必须唯一（数据库约束）
- `exam_category_id` 必须存在于 `exam_category` 表中（外键约束）
- 价格单位为"分"，例如 1900 表示 19.00元

---

### 4. 更新套餐（管理员）

**接口**: `PUT /api/admin/vip-plans/{plan_id}`

**认证**: 需要（超级用户）

**路径参数**:
- `plan_id`: 套餐ID

**请求体**（所有字段都是可选的，只传需要更新的字段）:
```json
{
  "plan_name": "PET周卡（限时优惠）",
  "sale_price": 1500,
  "first_buy_price": 1200,
  "description": "PET考试1周无限练习，限时优惠",
  "sort": 400
}
```

**可更新字段**:
- `exam_category_id`
- `exam_level`
- `plan_type`
- `duration_days`
- `original_price`
- `sale_price`
- `first_buy_discount`
- `first_buy_price`
- `plan_name`
- `description`
- `features`
- `status`
- `sort`
- `is_recommended`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 10,
    "plan_name": "PET周卡（限时优惠）",
    "sale_price": 1500,
    "first_buy_price": 1200,
    "description": "PET考试1周无限练习，限时优惠",
    "sort": 400,
    ...
  },
  "message": "套餐更新成功"
}
```

---

### 5. 上架/下架套餐（管理员）

**接口**: `PATCH /api/admin/vip-plans/{plan_id}/status`

**认证**: 需要（超级用户）

**路径参数**:
- `plan_id`: 套餐ID

**请求体**:
```json
{
  "status": 0
}
```

**参数说明**:
- `status`: 1=上架，0=下架

**响应示例**:
```json
{
  "success": true,
  "message": "套餐已下架"
}
```

---

### 6. 删除套餐（管理员）

**接口**: `DELETE /api/admin/vip-plans/{plan_id}`

**认证**: 需要（超级用户）

**路径参数**:
- `plan_id`: 套餐ID

**响应示例（成功）**:
```json
{
  "success": true,
  "message": "套餐删除成功"
}
```

**响应示例（失败 - 有用户订阅）**:
```json
{
  "detail": "删除失败: 该套餐已有 5 个用户订阅，无法删除"
}
```

**注意事项**:
- 只能删除没有用户订阅的套餐
- 如果套餐已有用户订阅，将返回500错误并说明订阅数量
- 建议先下架套餐，而不是直接删除

---

## 管理员接口使用示例

### 示例1：创建新套餐

```bash
# 1. 管理员登录
TOKEN=$(curl -X POST http://localhost:9002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass"}' \
  | jq -r '.data.access_token')

# 2. 创建周卡套餐
curl -X POST http://localhost:9002/api/admin/vip-plans/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "exam_category_id": 1,
    "exam_level": "PET",
    "plan_type": "weekly",
    "duration_days": 7,
    "original_price": 1900,
    "sale_price": 1900,
    "first_buy_discount": 500,
    "first_buy_price": 1400,
    "plan_name": "PET周卡",
    "description": "PET考试1周无限练习",
    "status": 1,
    "sort": 350,
    "is_recommended": 0
  }'
```

### 示例2：查询所有套餐

```bash
# 查询所有上架的PET套餐
curl -X GET "http://localhost:9002/api/admin/vip-plans/?exam_level=PET&status=1" \
  -H "Authorization: Bearer $TOKEN"
```

### 示例3：下架套餐

```bash
# 下架ID为10的套餐
curl -X PATCH http://localhost:9002/api/admin/vip-plans/10/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": 0}'
```

### 示例4：更新套餐价格

```bash
# 更新套餐价格（促销）
curl -X PUT http://localhost:9002/api/admin/vip-plans/10 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sale_price": 1500,
    "first_buy_price": 1200,
    "plan_name": "PET周卡（限时优惠）",
    "description": "PET考试1周无限练习，限时优惠"
  }'
```

---

## 前端对接注意事项

### 1. 权限控制
- 管理员接口只对超级用户开放
- 前端需要判断用户的 `is_superuser` 字段
- 非超级用户访问将返回 403 Forbidden

### 2. 价格显示
所有价格单位为"分"，前端展示时需要转换：
```javascript
// 示例：将分转为元
const priceInYuan = priceInCents / 100;
// 4900 / 100 = 49.00元
```

### 3. 唯一约束
创建套餐时，`exam_category_id` + `plan_type` 组合必须唯一：
- 已有 PET月卡（exam_category_id=1, plan_type=monthly）
- 不能再创建 PET月卡（会冲突）
- 可以创建 PET周卡（exam_category_id=1, plan_type=weekly）

### 4. 删除限制
- 已有用户订阅的套餐无法删除
- 建议前端增加"是否有订阅"的提示
- 推荐使用"下架"而不是"删除"

### 5. 数据验证
前端提交前建议验证：
- 价格必须 > 0
- 首购价 = 原价 - 首减金额
- 时长必须 > 0
- 套餐名称不能为空

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权（token无效） |
| 403 | 权限不足（非超级用户） |
| 404 | 套餐不存在 |
| 409 | 已有订阅冲突 |
| 500 | 服务器内部错误 |

## 常见错误示例

### 1. 唯一约束冲突
```json
{
  "detail": "创建失败: (1062, \"Duplicate entry '1-monthly' for key 'uk_category_type'\")"
}
```
**解决**：使用不同的 `plan_type` 或 `exam_category_id`

### 2. 外键约束冲突
```json
{
  "detail": "创建失败: (1452, \"Cannot add or update a child row: a foreign key constraint fails\")"
}
```
**解决**：确保 `exam_category_id` 存在于 `exam_category` 表中

### 3. 删除保护
```json
{
  "detail": "删除失败: 该套餐已有 5 个用户订阅，无法删除"
}
```
**解决**：先下架套餐，等待所有订阅过期后再删除

---

## 联系方式







## 管理员订阅记录查询接口

管理员可以查看所有用户的订阅记录，支持按用户ID筛选、查看用户订阅摘要（含最后到期时间）和统计数据。

### 1. 查询订阅记录列表

**接口**: `GET /api/admin/vip-subscriptions/list`

**请求头**:
```http
Authorization: Bearer {admin_token}
```

**查询参数**:
- `user_id` (可选): 筛选特定用户的订阅记录
- `status` (可选): 筛选订阅状态（ACTIVE/EXPIRED/CANCELED）
- `page` (可选, 默认1): 页码
- `page_size` (可选, 默认20): 每页数量（1-100）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 123,
        "user_id": 1,
        "username": "user123",
        "plan_id": 10,
        "plan_name": "月卡会员",
        "exam_level": "ALL",
        "plan_type": "monthly",
        "start_time": "2026-01-27T10:00:00",
        "end_time": "2026-02-26T10:00:00",
        "duration_days": 30,
        "paid_amount": 1990,
        "original_price": 3900,
        "is_first_buy": 1,
        "status": "ACTIVE",
        "order_id": 456,
        "order_no": "ORD20260127100000",
        "created_at": "2026-01-27T10:00:00",
        "updated_at": "2026-01-27T10:00:00"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 20
  }
}
```

---

### 2. 查询用户订阅摘要

**接口**: `GET /api/admin/vip-subscriptions/user/{user_id}/summary`

**请求头**:
```http
Authorization: Bearer {admin_token}
```

**路径参数**:
- `user_id`: 用户ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "username": "user123",
    "total_subscriptions": 5,
    "active_subscriptions": 1,
    "last_subscription_end_time": "2026-02-26T10:00:00",
    "total_paid_amount": 9950,
    "first_subscription_time": "2025-10-01T10:00:00",
    "last_subscription_time": "2026-01-27T10:00:00"
  }
}
```

**字段说明**:
- `total_subscriptions`: 用户历史总订阅次数
- `active_subscriptions`: 当前有效订阅数（未过期）
- `last_subscription_end_time`: 最后一次订阅的到期时间（关键字段）
- `total_paid_amount`: 累计支付金额（分）
- `first_subscription_time`: 首次订阅时间
- `last_subscription_time`: 最近一次订阅时间

---

### 3. 查询用户订阅历史

**接口**: `GET /api/admin/vip-subscriptions/user/{user_id}/history`

**请求头**:
```http
Authorization: Bearer {admin_token}
```

**路径参数**:
- `user_id`: 用户ID

**查询参数**:
- `page` (可选, 默认1): 页码
- `page_size` (可选, 默认20): 每页数量（1-100）

**响应示例**:
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": 123,
        "user_id": 1,
        "plan_id": 10,
        "plan_name": "月卡会员",
        "plan_description": "30天畅学所有级别",
        "exam_level": "ALL",
        "plan_type": "monthly",
        "start_time": "2026-01-27T10:00:00",
        "end_time": "2026-02-26T10:00:00",
        "duration_days": 30,
        "paid_amount": 1990,
        "status": "ACTIVE",
        "created_at": "2026-01-27T10:00:00"
      }
    ],
    "total": 5,
    "page": 1,
    "page_size": 20,
    "summary": {
      "total_subscriptions": 5,
      "active_subscriptions": 1,
      "last_subscription_end_time": "2026-02-26T10:00:00",
      "total_paid_amount": 9950
    }
  }
}
```

---

### 4. 查询订阅统计数据

**接口**: `GET /api/admin/vip-subscriptions/statistics`

**请求头**:
```http
Authorization: Bearer {admin_token}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "overall": {
      "total_subscriptions": 1500,
      "active_subscriptions": 320,
      "expired_subscriptions": 1180,
      "total_revenue": 5980000
    },
    "by_plan_type": [
      {
        "plan_type": "monthly",
        "count": 800,
        "revenue": 3192000
      },
      {
        "plan_type": "quarterly",
        "count": 450,
        "revenue": 1782000
      },
      {
        "plan_type": "yearly",
        "count": 250,
        "revenue": 1006000
      }
    ],
    "by_status": [
      {
        "status": "ACTIVE",
        "count": 320
      },
      {
        "status": "EXPIRED",
        "count": 1180
      }
    ]
  }
}
```

**字段说明**:
- `overall`: 总体统计数据
  - `total_subscriptions`: 总订阅数
  - `active_subscriptions`: 当前有效订阅数
  - `expired_subscriptions`: 已过期订阅数
  - `total_revenue`: 总收入（分）
- `by_plan_type`: 按套餐类型统计（月卡/季卡/年卡）
- `by_status`: 按状态统计

---

## 管理员接口使用场景

### 场景1：查看某个用户的VIP订阅情况

```bash
# 1. 管理员登录获取token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq -r '.data.token')

# 2. 查询用户订阅摘要（含最后到期时间）
curl -X GET "http://localhost:8000/api/admin/vip-subscriptions/user/1/summary" \
  -H "Authorization: Bearer $TOKEN"

# 3. 查询用户订阅历史
curl -X GET "http://localhost:8000/api/admin/vip-subscriptions/user/1/history?page=1&page_size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 场景2：筛选所有有效订阅

```bash
# 查询所有ACTIVE状态的订阅
curl -X GET "http://localhost:8000/api/admin/vip-subscriptions/list?status=ACTIVE&page=1&page_size=50" \
  -H "Authorization: Bearer $TOKEN"
```

### 场景3：查看订阅业务统计

```bash
# 获取订阅统计数据（总收入、订阅数等）
curl -X GET "http://localhost:8000/api/admin/vip-subscriptions/statistics" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 联系方式

如有问题请参考：
- 项目文档：`doc/`
- 用户端接口文档：本文档前半部分
- 管理员套餐管理测试脚本：`test/test_admin_vip_plan_api.py`
- 管理员订阅记录测试脚本：`test/test_admin_vip_subscription_api.py`
- 数据库脚本：`sql/08_vip_subscription_schema.sql`


