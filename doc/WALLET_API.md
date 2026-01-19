# 金币钱包 API 文档

## 概述

金币钱包相关接口，用于查询用户金币余额和使用金币支付购买服务。

**基础信息：**
- 基础路径：`/api/order`
- 认证方式：Bearer Token（需要在请求头中携带 `Authorization: Bearer {token}`）
- 响应格式：JSON

---

## 接口列表

### 1. 查询金币余额

查询当前登录用户的金币钱包余额信息。

#### 基本信息

- **接口路径**：`GET /api/order/wallet/balance`
- **请求方法**：GET
- **是否需要认证**：✅ 是

#### 请求参数

无需请求参数，用户信息从 Token 中获取。

#### 请求头

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 请求示例

```bash
curl -X GET "http://localhost:9002/api/order/wallet/balance" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```javascript
// JavaScript/Axios 示例
const response = await axios.get('/api/order/wallet/balance', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

```python
# Python/Requests 示例
import requests

headers = {
    'Authorization': f'Bearer {token}'
}
response = requests.get(
    'http://localhost:9002/api/order/wallet/balance',
    headers=headers
)
```

#### 响应参数

**成功响应（200 OK）**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 钱包数据对象 |
| data.user_id | integer | 用户ID |
| data.balance | integer | 可用余额（金币数量） |
| data.frozen_balance | integer | 冻结余额 |
| data.exists | boolean | 钱包是否存在 |

**成功响应示例**

```json
{
  "success": true,
  "message": "查询余额成功",
  "data": {
    "user_id": 100,
    "balance": 1000,
    "frozen_balance": 0,
    "exists": true
  }
}
```

**钱包不存在时的响应**

```json
{
  "success": true,
  "message": "查询余额成功",
  "data": {
    "user_id": 100,
    "balance": 0,
    "frozen_balance": 0,
    "exists": false
  }
}
```

**错误响应（401 Unauthorized）**

```json
{
  "detail": "Token 无效或已过期"
}
```

**错误响应（500 Internal Server Error）**

```json
{
  "detail": "查询余额失败: {错误详情}"
}
```

#### 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 查询成功 |
| 401 | Token 无效或已过期 |
| 500 | 服务器内部错误 |

---

### 2. 金币支付

使用金币支付购买服务（如 AI 对话练习、口语练习题目等）。

#### 基本信息

- **接口路径**：`POST /api/order/wallet/consume`
- **请求方法**：POST
- **是否需要认证**：✅ 是

#### 请求参数

**Body 参数（JSON 格式）**

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|--------|------|------|------|--------|
| coin_amount | integer | ✅ 是 | 消费金币数量（必须大于0） | 50 |
| biz_type | string | ✅ 是 | 业务类型（见下方业务类型说明） | "consume_conversation" |
| biz_id | integer | ✅ 是 | 业务ID（关联的业务记录ID） | 100 |
| remark | string | ❌ 否 | 备注说明 | "AI 对话练习会话" |

**业务类型说明（biz_type）**

| 业务类型 | 说明 | biz_id 含义 |
|---------|------|-------------|
| consume_conversation | AI 对话练习会话 | 会话ID（conversation_id） |
| consume_practice | 口语练习题目 | 练习记录ID |
| consume_exam | 模拟考试 | 考试记录ID |

#### 请求头

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 请求示例

**cURL 示例**

```bash
curl -X POST "http://localhost:9002/api/order/wallet/consume" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "coin_amount": 50,
    "biz_type": "consume_conversation",
    "biz_id": 100,
    "remark": "AI 对话练习会话"
  }'
```

**JavaScript/Axios 示例**

```javascript
const response = await axios.post('/api/order/wallet/consume', {
  coin_amount: 50,
  biz_type: 'consume_conversation',
  biz_id: 100,
  remark: 'AI 对话练习会话'
}, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Python/Requests 示例**

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

data = {
    'coin_amount': 50,
    'biz_type': 'consume_conversation',
    'biz_id': 100,
    'remark': 'AI 对话练习会话'
}

response = requests.post(
    'http://localhost:9002/api/order/wallet/consume',
    json=data,
    headers=headers
)
```

**Vue.js 示例**

```javascript
// 在 Vue 组件中使用
methods: {
  async consumeCoins(amount, bizType, bizId, remark = '') {
    try {
      const response = await this.$http.post('/api/order/wallet/consume', {
        coin_amount: amount,
        biz_type: bizType,
        biz_id: bizId,
        remark: remark
      }, {
        headers: {
          'Authorization': `Bearer ${this.$store.state.token}`
        }
      });
      
      if (response.data.success) {
        console.log('支付成功，剩余余额：', response.data.data.balance_after);
        return response.data;
      }
    } catch (error) {
      if (error.response?.status === 400) {
        // 余额不足或参数错误
        alert(error.response.data.detail);
      } else {
        alert('支付失败，请重试');
      }
    }
  }
}
```

#### 响应参数

**成功响应（200 OK）**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| data | object | 支付结果数据对象 |
| data.user_id | integer | 用户ID |
| data.consumed_amount | integer | 本次消费的金币数量 |
| data.balance_before | integer | 消费前余额 |
| data.balance_after | integer | 消费后余额 |
| data.log_id | integer | 钱包流水记录ID |
| data.biz_type | string | 业务类型 |
| data.biz_id | integer | 业务ID |

**成功响应示例**

```json
{
  "success": true,
  "message": "金币支付成功",
  "data": {
    "user_id": 100,
    "consumed_amount": 50,
    "balance_before": 1000,
    "balance_after": 950,
    "log_id": 12345,
    "biz_type": "consume_conversation",
    "biz_id": 100
  }
}
```

**错误响应（400 Bad Request）**

余额不足或参数错误：

```json
{
  "detail": "金币余额不足: 当前余额=30, 需要=50"
}
```

```json
{
  "detail": "消费金额必须为正数"
}
```

```json
{
  "detail": "用户钱包不存在: user_id=100"
}
```

**错误响应（401 Unauthorized）**

```json
{
  "detail": "Token 无效或已过期"
}
```

**错误响应（422 Unprocessable Entity）**

参数格式错误：

```json
{
  "detail": [
    {
      "loc": ["body", "coin_amount"],
      "msg": "ensure this value is greater than 0",
      "type": "value_error.number.not_gt"
    }
  ]
}
```

**错误响应（500 Internal Server Error）**

```json
{
  "detail": "支付失败: {错误详情}"
}
```

#### 响应状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 支付成功 |
| 400 | 余额不足或参数错误 |
| 401 | Token 无效或已过期 |
| 422 | 请求参数格式错误 |
| 500 | 服务器内部错误 |

---

### 3. 查询充值记录

查询当前登录用户的金币充值流水记录（只返回充值记录，change_amount > 0）。

#### 基本信息

- **接口路径**：`GET /api/order/wallet/recharge_logs`
- **请求方法**：GET
- **是否需要认证**：✅ 是

#### 请求参数

**Query 参数**

| 字段名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | integer | ❌ 否 | 页码（从1开始） | 1 |
| page_size | integer | ❌ 否 | 每页数量（最大100） | 20 |

#### 请求头

```
Authorization: Bearer {access_token}
Content-Type: application/json
```

#### 请求示例

```bash
curl -X GET "http://localhost:9002/api/order/wallet/recharge_logs?page=1&page_size=20" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```javascript
// JavaScript/Axios 示例
const response = await axios.get('/api/order/wallet/recharge_logs', {
  params: { page: 1, page_size: 20 },
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### 响应参数

**成功响应（200 OK）**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| logs | array | 流水记录数组 |
| logs[].change_amount | integer | 变动金额（正数=充值） |
| logs[].balance_before | integer | 变动前余额 |
| logs[].balance_after | integer | 变动后余额 |
| logs[].biz_type | string | 业务类型（recharge_order） |
| logs[].created_at | string | 创建时间 |
| total | integer | 充值记录总数 |
| page | integer | 当前页码 |
| page_size | integer | 每页数量 |

**成功响应示例**

```json
{
  "success": true,
  "message": "查询充值记录成功",
  "logs": [
    {
      "id": 12345,
      "change_amount": 500,
      "balance_before": 1000,
      "balance_after": 1500,
      "biz_type": "recharge_order",
      "remark": "Recharge order COIN20260113...",
      "created_at": "2026-01-13T10:30:00"
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

### 4. 查询消费记录

查询当前登录用户的金币消费流水记录（只返回消费记录，change_amount < 0）。

#### 基本信息

- **接口路径**：`GET /api/order/wallet/consume_logs`
- **请求方法**：GET
- **是否需要认证**：✅ 是

#### 请求参数

**Query 参数**

| 字段名 | 类型 | 必填 | 说明 | 默认值 |
|--------|------|------|------|--------|
| page | integer | ❌ 否 | 页码（从1开始） | 1 |
| page_size | integer | ❌ 否 | 每页数量（最大100） | 20 |

#### 请求示例

```bash
curl -X GET "http://localhost:9002/api/order/wallet/consume_logs?page=1&page_size=20" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

```javascript
const response = await axios.get('/api/order/wallet/consume_logs', {
  params: { page: 1, page_size: 20 },
  headers: { 'Authorization': `Bearer ${token}` }
});
```

#### 响应参数

**成功响应（200 OK）**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| success | boolean | 请求是否成功 |
| message | string | 响应消息 |
| logs | array | 流水记录数组 |
| logs[].change_amount | integer | 变动金额（负数=消费） |
| logs[].balance_before | integer | 变动前余额 |
| logs[].balance_after | integer | 变动后余额 |
| logs[].biz_type | string | 业务类型（consume_*） |
| logs[].created_at | string | 创建时间 |
| total | integer | 消费记录总数 |

**成功响应示例**

```json
{
  "success": true,
  "message": "查询消费记录成功",
  "logs": [
    {
      "id": 12346,
      "change_amount": -50,
      "balance_before": 1500,
      "balance_after": 1450,
      "biz_type": "consume_conversation",
      "remark": "AI 对话练习",
      "created_at": "2026-01-13T11:00:00"
    }
  ],
  "total": 8,
  "page": 1,
  "page_size": 20
}
```

---

### 5. 查询所有流水

查询当前登录用户的所有钱包流水记录（包括充值和消费）。

#### 基本信息

- **接口路径**：`GET /api/order/wallet/all_logs`
- **请求方法**：GET
- **是否需要认证**：✅ 是

#### 请求示例

```bash
curl -X GET "http://localhost:9002/api/order/wallet/all_logs?page=1&page_size=20" \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 响应参数

返回所有流水，格式与上面相同，但 `change_amount` 可以是正数或负数。

---

## 业务流程说明

### 典型支付流程

```mermaid
sequenceDiagram
    participant 前端
    participant API
    participant 数据库

    前端->>API: 1. 查询余额 GET /wallet/balance
    API->>数据库: 查询 user_wallet 表
    数据库-->>API: 返回余额信息
    API-->>前端: 返回余额数据

    前端->>前端: 2. 检查余额是否充足
    
    前端->>API: 3. 发起支付 POST /wallet/consume
    API->>数据库: 开启事务并加锁（FOR UPDATE）
    API->>数据库: 检查余额并扣款
    API->>数据库: 写入钱包流水记录
    数据库-->>API: 提交事务
    API-->>前端: 返回支付结果

    前端->>API: 4. 再次查询余额（可选）
    API-->>前端: 返回更新后的余额
```

### 错误处理建议

1. **余额不足**：
   - 捕获 400 错误，提示用户充值
   - 跳转到充值页面

2. **Token 过期**：
   - 捕获 401 错误，清除本地 Token
   - 跳转到登录页面

3. **网络错误**：
   - 实现重试机制（最多3次）
   - 提示用户检查网络连接

4. **参数错误**：
   - 前端做好参数校验
   - 确保 coin_amount > 0

---

## 并发安全说明

### 防重复支付机制

- ✅ 使用数据库行锁（`FOR UPDATE`）防止并发扣款
- ✅ 所有操作在同一事务中执行，失败自动回滚
- ✅ 余额校验在锁内进行，确保一致性

### 前端防重复提交建议

```javascript
// 示例：防止重复点击
data() {
  return {
    isSubmitting: false
  }
},
methods: {
  async handlePay() {
    if (this.isSubmitting) {
      return; // 防止重复提交
    }
    
    this.isSubmitting = true;
    try {
      const result = await this.consumeCoins(50, 'consume_conversation', 100);
      // 处理成功结果
    } finally {
      this.isSubmitting = false;
    }
  }
}
```

---

## 完整前端集成示例

### Vue.js 完整示例

```javascript
// wallet-api.js
import axios from 'axios';

const API_BASE = 'http://localhost:9002/api/order';

export default {
  // 查询余额
  async getBalance(token) {
    try {
      const response = await axios.get(`${API_BASE}/wallet/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // 金币支付
  async consumeCoins(token, coinAmount, bizType, bizId, remark = '') {
    try {
      const response = await axios.post(`${API_BASE}/wallet/consume`, {
        coin_amount: coinAmount,
        biz_type: bizType,
        biz_id: bizId,
        remark: remark
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  // 统一错误处理
  handleError(error) {
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data.detail;
      
      switch (status) {
        case 400:
          return new Error(detail || '请求参数错误');
        case 401:
          return new Error('登录已过期，请重新登录');
        case 500:
          return new Error('服务器错误，请稍后重试');
        default:
          return new Error('未知错误');
      }
    }
    return new Error('网络连接失败');
  }
};
```

### React 完整示例

```javascript
// useWallet.js
import { useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:9002/api/order';

export const useWallet = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 查询余额
  const fetchBalance = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE}/wallet/balance`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBalance(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || '查询余额失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // 金币支付
  const consumeCoins = useCallback(async (token, coinAmount, bizType, bizId, remark = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/wallet/consume`, {
        coin_amount: coinAmount,
        biz_type: bizType,
        biz_id: bizId,
        remark: remark
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // 更新余额
      setBalance(prev => ({
        ...prev,
        balance: response.data.data.balance_after
      }));
      
      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.detail || '支付失败';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    balance,
    loading,
    error,
    fetchBalance,
    consumeCoins
  };
};
```

---

## 测试数据

### 测试账号

```
用户名: testuser
密码: test123
测试环境: http://localhost:9002
```

### 测试场景

1. **正常支付流程**：
   - 确保测试账号有足够余额
   - 调用支付接口
   - 验证余额是否正确扣减

2. **余额不足**：
   - 尝试支付超过当前余额的金币
   - 验证返回 400 错误

3. **参数错误**：
   - 传入负数或0的 coin_amount
   - 验证返回 422 错误

---

## 常见问题

### Q1: 如何获取 Token？

先调用登录接口 `/api/auth/login` 获取 access_token。

### Q2: Token 放在哪里？

放在请求头的 Authorization 字段，格式：`Bearer {token}`

### Q3: 支付失败余额会被扣吗？

不会。所有操作在事务中，失败会自动回滚。

### Q4: 如何查看消费记录？

目前可以通过管理后台查看钱包流水，用户端查询接口开发中。

### Q5: 支付接口是否幂等？

不是。每次调用都会执行一次扣款，请在前端做好防重复提交。

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.1.0 | 2026-01-13 | 新增流水查询接口：充值记录、消费记录、所有流水 |
| 1.0.0 | 2026-01-13 | 初始版本，新增余额查询和金币支付接口 |

---

## 联系方式

如有问题或建议，请联系后端开发团队。
