# 工作流类型选项表功能实现总结

## 📋 需求回顾

创建一个新表：工作流类型选项表，用于管理不同工作流类型的配置及价格信息。

### 原始需求字段
- `label`: 'PET Part2' //等级名称显示
- `value`: 'pet_part2' //等级名称type
- `price`: 12 //价格
- `create_time`: //创建时间
- `update_time`: //更新时间
- `is_active`: true //是否删除

### 功能需求
- 创建相应的 DAO 层
- 创建 FastAPI 接口支持表的列表分页显示和 CRUD 功能

---

## ✅ 完成内容

### 1. 数据库表设计

**文件**: `/Volumes/H/python/rag_spoken/src/workflow/sql/oral_practice_schema.sql`

**表名**: `workflow_type_option`

**完整字段**（扩展了原需求）:
```sql
CREATE TABLE IF NOT EXISTS `workflow_type_option` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  `label` VARCHAR(100) NOT NULL COMMENT '显示名称，如：PET Part2',
  `value` VARCHAR(50) NOT NULL UNIQUE COMMENT '工作流类型标识，如：pet_part2',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '价格（单位：元）',
  `description` TEXT COMMENT '描述信息',          -- 额外添加
  `sort` INT DEFAULT 0 COMMENT '排序权重，越大越靠前',  -- 额外添加
  `is_active` TINYINT DEFAULT 1 COMMENT '是否启用：1=启用，0=禁用（软删除）',
  `create_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_value` (`value`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流类型选项表';
```

**初始化数据** (8条记录):
| Label | Value | Price | Sort |
|-------|-------|-------|------|
| FCE Part 1 | fce_part1 | 10.00 | 100 |
| FCE Part 2 | fce_part2 | 15.00 | 90 |
| FCE Part 3 | fce_part3 | 20.00 | 80 |
| PET Part 1 | pet_part1 | 8.00 | 70 |
| PET Part 2 | pet_part2 | 12.00 | 60 |
| 雅思 Part 1 | ielts_part1 | 18.00 | 50 |
| 雅思 Part 2 | ielts_part2 | 25.00 | 40 |
| 雅思 Part 3 | ielts_part3 | 30.00 | 30 |

---

### 2. DAO 层实现

**文件**: `/Volumes/H/python/rag_spoken/src/workflow/server/question_dao.py`

**类名**: `WorkflowTypeOptionDAO`

**实现的方法**:

1. **`create_option()`** - 创建工作流类型选项
   ```python
   def create_option(self, label: str, value: str, price: float, 
                    description: str = '', sort: int = 0) -> int
   ```

2. **`get_option_by_id()`** - 根据 ID 获取选项
   ```python
   def get_option_by_id(self, option_id: int) -> Optional[Dict[str, Any]]
   ```

3. **`get_option_by_value()`** - 根据 value 获取选项
   ```python
   def get_option_by_value(self, value: str) -> Optional[Dict[str, Any]]
   ```

4. **`get_options()`** - 获取选项列表（支持分页）
   ```python
   def get_options(self, only_active: bool = True, 
                  page: int = 1, page_size: int = 20) -> tuple
   ```
   返回: `(选项列表, 总数)`

5. **`update_option()`** - 更新选项
   ```python
   def update_option(self, option_id: int, **kwargs) -> bool
   ```
   支持更新: `label`, `price`, `description`, `sort`, `is_active`

6. **`soft_delete_option()`** - 软删除选项
   ```python
   def soft_delete_option(self, option_id: int) -> bool
   ```

---

### 3. FastAPI 接口实现

**文件**: `/Volumes/H/python/rag_spoken/src/conversation/conversation_server.py`

**路由前缀**: `/api/workflowtypes`

**Pydantic 模型**:
- `WorkflowTypeOptionCreateRequest` - 创建请求
- `WorkflowTypeOptionUpdateRequest` - 更新请求
- `WorkflowTypeOptionResponse` - 单个响应
- `WorkflowTypeOptionListResponse` - 列表响应

**实现的接口**:

#### 1. POST `/api/workflowtypes` - 创建工作流类型选项
**功能**: 创建新的工作流类型选项  
**认证**: 需要 Bearer Token  
**验证**: 自动检查 value 唯一性

#### 2. GET `/api/workflowtypes` - 获取列表（分页）
**功能**: 获取工作流类型选项列表  
**参数**:
- `only_active`: 是否仅返回启用的（默认 true）
- `page`: 页码（默认 1）
- `page_size`: 每页数量（默认 20，最大 100）

**排序**: `sort DESC, id ASC`

#### 3. GET `/api/workflowtypes/{option_id}` - 获取详情
**功能**: 获取单个工作流类型选项详情  
**认证**: 需要 Bearer Token

#### 4. PUT `/api/workflowtypes/{option_id}` - 更新选项
**功能**: 更新工作流类型选项信息  
**支持字段**: `label`, `price`, `description`, `sort`, `is_active`  
**限制**: `value` 字段不可修改

#### 5. DELETE `/api/workflowtypes/{option_id}` - 删除选项
**功能**: 软删除工作流类型选项  
**说明**: 设置 `is_active = 0`，不物理删除

---

### 4. 主应用集成

**文件**: `/Volumes/H/python/rag_spoken/src/app/main_fastapi_app.py`

已将 `workflow_type_router` 注册到主应用：
```python
from conversation.conversation_server import conversation_router, oral_router, workflow_type_router

app.include_router(workflow_type_router)
```

服务可通过主应用访问：`http://localhost:9000/api/workflowtypes`

---

### 5. 测试脚本

**文件**: `/Volumes/H/python/rag_spoken/test/test_workflow_type_api.py`

**功能**: 完整的 API 测试流程
- 自动获取认证 token
- 测试创建、查询、更新、删除
- 验证唯一性约束
- 验证软删除功能

**运行方式**:
```bash
cd /Volumes/H/python/rag_spoken
python test/test_workflow_type_api.py
```

---

### 6. API 文档

**文件**: `/Volumes/H/python/rag_spoken/doc/WORKFLOW_TYPE_API.md`

**内容**:
- 完整的 API 接口文档
- 请求/响应示例
- Python 和 curl 使用示例
- 错误代码说明
- 数据库初始化指南

---

## 🚀 使用指南

### 1. 数据库初始化

```bash
cd /Volumes/H/python/rag_spoken
mysql -u root -p your_database < src/workflow/sql/oral_practice_schema.sql
```

### 2. 启动服务

**方式1: 启动主应用（推荐）**
```bash
cd /Volumes/H/python/rag_spoken
python src/app/main_fastapi_app.py
```
访问: `http://localhost:9000/api/workflowtypes`

**方式2: 独立启动 conversation 服务**
```bash
cd /Volumes/H/python/rag_spoken
python src/conversation/conversation_server.py
```
访问: `http://localhost:9004/api/workflowtypes`

### 3. 运行测试

```bash
# 确保服务已启动，然后运行测试
cd /Volumes/H/python/rag_spoken
python test/test_workflow_type_api.py
```

### 4. API 调用示例

```python
import requests

BASE_URL = "http://localhost:9000/api/workflowtypes"
TOKEN = "your_token_here"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# 获取列表
response = requests.get(f"{BASE_URL}?page=1&page_size=10", headers=HEADERS)
print(response.json())

# 创建选项
response = requests.post(BASE_URL, json={
    "label": "新工作流",
    "value": "new_workflow",
    "price": 20.00,
    "description": "这是一个新的工作流类型",
    "sort": 50
}, headers=HEADERS)
print(response.json())
```

---

## 📊 技术特点

### 1. 软删除设计
- 使用 `is_active` 字段标记删除状态
- 删除后数据仍保留在数据库中
- 可通过 `only_active=false` 查看已删除记录

### 2. 分页支持
- 支持自定义页码和每页数量
- 返回总记录数便于前端分页
- 最大每页 100 条记录

### 3. 唯一性约束
- `value` 字段设置为 UNIQUE
- 创建时自动检查重复
- 防止数据冲突

### 4. 排序控制
- 使用 `sort` 字段控制显示顺序
- 默认按 `sort DESC, id ASC` 排序
- 灵活调整显示优先级

### 5. 价格精度
- 使用 DECIMAL(10,2) 类型
- 精确存储货币金额
- 避免浮点数精度问题

### 6. 时间戳自动更新
- `create_time` 创建时自动设置
- `update_time` 更新时自动刷新
- 无需手动维护

---

## 📁 相关文件清单

### 数据库相关
- ✅ `/src/workflow/sql/oral_practice_schema.sql` - 建表语句和初始数据

### 代码实现
- ✅ `/src/workflow/server/question_dao.py` - DAO 层（新增 WorkflowTypeOptionDAO）
- ✅ `/src/conversation/conversation_server.py` - FastAPI 接口（新增 workflow_type_router）
- ✅ `/src/app/main_fastapi_app.py` - 主应用集成

### 测试和文档
- ✅ `/test/test_workflow_type_api.py` - 完整测试脚本
- ✅ `/doc/WORKFLOW_TYPE_API.md` - API 接口文档
- ✅ `/doc/WORKFLOW_TYPE_IMPLEMENTATION_SUMMARY.md` - 本文档

---

## 🎯 下一步建议

### 1. 前端集成
可以使用以下接口构建管理界面：
- 列表页：使用 `GET /api/workflowtypes` 展示分页列表
- 创建页：使用 `POST /api/workflowtypes` 创建新选项
- 编辑页：使用 `PUT /api/workflowtypes/{id}` 更新选项
- 删除：使用 `DELETE /api/workflowtypes/{id}` 软删除

### 2. 与 oral_exercise 表联动
`workflow_type_option` 表的 `value` 字段应与 `oral_exercise` 表的 `workflow_type` 字段对应，建议：
- 在创建练习题时，从 workflow_type_option 表读取可用的工作流类型
- 在前端展示下拉选择框，显示 label，提交 value
- 验证 workflow_type 是否存在于 workflow_type_option 表中

### 3. 权限控制（可选）
当前所有接口都需要登录，如需进一步限制：
- 创建/更新/删除：可限制为管理员权限
- 查询：保持登录用户即可访问

### 4. 缓存优化（可选）
如果工作流类型选项变化不频繁：
- 可考虑添加 Redis 缓存
- 减少数据库查询压力
- 提升响应速度

---

## ⚠️ 注意事项

1. **唯一性**: `value` 字段必须唯一，创建前会自动检查
2. **软删除**: 删除操作是软删除，数据仍保留在数据库中
3. **价格字段**: 使用 DECIMAL 类型，避免使用 float
4. **认证要求**: 所有接口都需要有效的 Bearer Token
5. **分页限制**: 每页最多 100 条记录
6. **value 不可修改**: 更新接口不支持修改 value 字段

---

## 📞 联系信息

如有问题或建议，请参考：
- API 文档: `/doc/WORKFLOW_TYPE_API.md`
- 数据库设计: `/src/conversation/doc/SPOKEN_PRACTICE_DB_DESIGN.md`
- 测试脚本: `/test/test_workflow_type_api.py`
