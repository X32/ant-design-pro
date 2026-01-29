# 工作流类型管理页面

## 📍 位置
`/src/pages/exam/workflowType`

## 🚀 功能说明

这个页面用于管理不同工作流类型的配置及价格信息，如 PET Part1、FCE Part2、雅思 Part1 等。

### 主要功能
- ✅ **列表展示**：分页展示所有工作流类型选项
- ✅ **创建选项**：新建工作流类型配置
- ✅ **编辑选项**：修改现有工作流类型信息
- ✅ **删除选项**：软删除工作流类型（不物理删除）
- ✅ **状态切换**：可以查看所有选项或仅查看启用的选项
- ✅ **排序控制**：通过 sort 字段控制显示顺序

## 📋 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| label | string | 显示名称，如：PET Part2 |
| value | string | 类型标识，如：pet_part2，唯一且不可修改 |
| price | number | 价格（元） |
| description | string | 描述信息（可选） |
| sort | number | 排序权重，数值越大越靠前 |
| is_active | boolean | 是否启用（1=启用，0=禁用） |

## 🔌 API 接口

### 后端接口
- `GET /api/workflowtypes` - 获取列表（分页）
- `POST /api/workflowtypes` - 创建选项
- `GET /api/workflowtypes/{id}` - 获取详情
- `PUT /api/workflowtypes/{id}` - 更新选项
- `DELETE /api/workflowtypes/{id}` - 删除选项（软删除）

### 前端 API 函数
位置：`/src/services/ant-design-pro/api.ts`

```typescript
import {
  getWorkflowTypes,
  getWorkflowTypeDetail,
  createWorkflowType,
  updateWorkflowType,
  deleteWorkflowType,
} from '@/services/ant-design-pro/api';
```

## 🎯 路由配置

路径：`/back/exam/workflow-type`

菜单位置：
```
后台管理
  └─ 考试和试题管理
      └─ 工作流类型管理
```

## 🎨 组件结构

```
workflowType/
├── index.tsx       # 主组件
└── index.less      # 样式文件
```

## 💡 使用说明

### 1. 创建工作流类型
1. 点击"新建工作流类型"按钮
2. 填写必填字段（显示名称、类型标识、价格）
3. 可选填写描述和排序权重
4. 点击确定创建

**注意**：
- 类型标识（value）必须唯一
- 类型标识只能包含小写字母、数字和下划线
- 价格不能为负数

### 2. 编辑工作流类型
1. 点击列表中的"编辑"按钮
2. 修改需要更新的字段
3. 可以切换启用/禁用状态
4. 点击确定保存

**注意**：
- 类型标识（value）不可修改
- 只能更新 label、price、description、sort、is_active 字段

### 3. 删除工作流类型
1. 点击列表中的"删除"按钮
2. 确认删除操作
3. 删除后选项状态变为禁用（软删除）

**注意**：
- 这是软删除，数据仍保留在数据库中
- 可以通过切换"仅启用/全部"查看已删除的记录

### 4. 筛选显示
使用页面上的开关切换：
- **仅启用**：只显示 is_active=1 的选项
- **全部**：显示所有选项（包括已删除的）

## 🔧 开发配置

### API 配置
位置：`/src/config/apiConfig.ts`

```typescript
export const API_ENDPOINTS = {
  // ...
  WORKFLOW_TYPES: `${API_BASE_URL}/api/workflowtypes`,
  WORKFLOW_TYPE_DETAIL: `${API_BASE_URL}/api/workflowtypes`,
  // ...
};
```

### 代理配置
位置：`/config/proxy.ts`

开发环境下，`/api/workflowtypes` 会被代理到 `http://localhost:9002`

### 国际化
- 中文：`/src/locales/zh-CN/menu.ts`
- 英文：`/src/locales/en-US/menu.ts`

```typescript
'menu.back.exam.workflow-type': '工作流类型管理',  // 中文
'menu.back.exam.workflow-type': 'Workflow Type',   // 英文
```

## 📝 数据示例

```json
{
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
```

## 🔗 相关文档

- [后端 API 文档](../../../doc/WORKFLOW_TYPE_API.md)
- [实现总结](../../../doc/WORKFLOW_TYPE_IMPLEMENTATION_SUMMARY.md)
- [数据库设计](https://github.com/your-repo/doc/SPOKEN_PRACTICE_DB_DESIGN.md)

## ⚠️ 注意事项

1. **唯一性**：value 字段必须唯一，系统会自动检查
2. **权限**：所有操作都需要管理员权限和有效的 Bearer Token
3. **软删除**：删除操作不会物理删除数据
4. **价格精度**：使用两位小数
5. **排序规则**：列表按 sort DESC, id ASC 排序
6. **分页限制**：每页最多 100 条记录

## 🐛 常见问题

### Q1: 创建时提示"value 已存在"
**A**: 类型标识（value）必须唯一，请检查是否与现有记录重复。

### Q2: 无法修改 value 字段
**A**: 这是设计限制，value 字段创建后不可修改，以保证数据一致性。

### Q3: 删除后的记录还能看到
**A**: 切换到"全部"模式可以看到所有记录。删除是软删除，只是将 is_active 设为 0。

### Q4: 价格显示异常
**A**: 确保输入的价格为有效数字，系统会自动保留两位小数。

## 📞 技术支持

如有问题，请查看：
- API 文档：`/doc/WORKFLOW_TYPE_API.md`
- 后端实现：`/Volumes/H/python/rag_spoken/src/conversation/conversation_server.py`
- 数据库表：`workflow_type_option`
