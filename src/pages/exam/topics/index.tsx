/**
 * 多级话题分类管理页面
 * 基于 REST API /api/oral 接口实现
 * 提供分类树展示、分类选择联动、分类操作和编辑功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tree,
  Form,
  Input,
  Button,
  InputNumber,
  message,
  Spin,
  Tag,
  Empty,
  Popconfirm,
  TreeSelect,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
} from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { Category, CategoryFormData, CategoryTreeNode, getLevelName } from './types';
import {
  getOralCategoriesTree,
  createOralCategory,
  updateOralCategory,
  deleteOralCategory,
} from '@/services/ant-design-pro/api';
import './index.less';

/**
 * 将分类数据转换为Tree组件所需的数据格式
 */
const convertToTreeData = (categories: Category[]): CategoryTreeNode[] => {
  return categories.map((category) => ({
    key: category.id,
    title: category.name,
    parentId: category.parent_id,
    level: category.level,
    sort: category.sort,
    isLeaf: !category.children || category.children.length === 0,
    children: category.children && category.children.length > 0 
      ? convertToTreeData(category.children) 
      : undefined,
  }));
};

/**
 * 递归获取所有非叶子节点的key（用于默认展开所有层级）
 */
const getAllExpandableKeys = (categories: Category[]): number[] => {
  let keys: number[] = [];
  for (const category of categories) {
    // 只有有子节点的才需要展开
    if (category.children && category.children.length > 0) {
      keys.push(category.id);
      // 递归获取子节点的key
      keys = keys.concat(getAllExpandableKeys(category.children));
    }
  }
  return keys;
};

/**
 * 递归查找分类
 */
const findCategoryById = (categories: Category[], id: number): Category | null => {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }
    if (category.children) {
      const found = findCategoryById(category.children, id);
      if (found) return found;
    }
  }
  return null;
};

/**
 * 获取所有分类的扁平列表（用于TreeSelect）
 */
const flattenCategories = (categories: Category[], result: Category[] = []): Category[] => {
  for (const category of categories) {
    result.push(category);
    if (category.children) {
      flattenCategories(category.children, result);
    }
  }
  return result;
};

/**
 * 话题分类管理组件
 */
const TopicsManagement: React.FC = () => {
  // 分类数据
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  // 选中状态
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);

  // 编辑模式
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addParentId, setAddParentId] = useState<number>(0);

  // 表单实例
  const [form] = Form.useForm<CategoryFormData>();

  // 展开的节点
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  /**
   * 获取分类列表（通过分类树接口）
   */
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getOralCategoriesTree();
      // API 返回格式: { success: true, data: [...], total: 2 }
      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data);
        setTreeData(convertToTreeData(response.data));
        // 默认展开所有层级（获取所有非叶子节点的key）
        const allExpandableKeys = getAllExpandableKeys(response.data);
        setExpandedKeys(allExpandableKeys);
        message.success('获取分类列表成功');
      } else {
        setCategories([]);
        setTreeData([]);
      }
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
      message.error(error?.message || '获取分类列表失败');
      setCategories([]);
      setTreeData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * 处理树节点选中
   */
  const handleSelect: TreeProps['onSelect'] = (keys, info) => {
    setSelectedKeys(keys);
    if (keys.length > 0) {
      const categoryId = keys[0] as number;
      const category = findCategoryById(categories, categoryId);
      setSelectedCategory(category);
      setIsAdding(false);
      setIsEditing(false);
      // 填充表单
      if (category) {
        form.setFieldsValue({
          name: category.name,
          parent_id: category.parent_id,
          sort: category.sort,
        });
      }
    } else {
      setSelectedCategory(null);
      form.resetFields();
    }
  };

  /**
   * 处理树节点勾选（单选模式）
   */
  const handleCheck: TreeProps['onCheck'] = (checked, info) => {
    // 单选模式：只保留最后勾选的节点
    const checkedArr = Array.isArray(checked) ? checked : checked.checked;
    if (checkedArr.length > 0) {
      const lastChecked = checkedArr[checkedArr.length - 1];
      setCheckedKeys([lastChecked]);
      // 同步到选中状态
      setSelectedKeys([lastChecked]);
      const category = findCategoryById(categories, lastChecked as number);
      setSelectedCategory(category);
      setIsAdding(false);
      setIsEditing(false);
      if (category) {
        form.setFieldsValue({
          name: category.name,
          parent_id: category.parent_id,
          sort: category.sort,
        });
      }
    } else {
      setCheckedKeys([]);
    }
  };

  /**
   * 处理展开/收起
   */
  const handleExpand: TreeProps['onExpand'] = (keys) => {
    setExpandedKeys(keys);
  };

  /**
   * 添加分类
   */
  const handleAddCategory = (parentId: number = 0) => {
    setIsAdding(true);
    setIsEditing(false);
    setAddParentId(parentId);
    setSelectedCategory(null);
    setSelectedKeys([]);
    setCheckedKeys([]);

    form.resetFields();
    form.setFieldsValue({
      parent_id: parentId,
      sort: 100,
    });
  };

  /**
   * 编辑分类
   */
  const handleEditCategory = () => {
    if (!selectedCategory) {
      message.warning('请先选择要编辑的分类');
      return;
    }
    setIsEditing(true);
    setIsAdding(false);
  };

  /**
   * 删除分类
   */
  const handleDeleteCategory = async (categoryId?: number) => {
    const idToDelete = categoryId || selectedCategory?.id;
    if (!idToDelete) {
      message.warning('请先选择要删除的分类');
      return;
    }

    try {
      await deleteOralCategory(idToDelete);
      message.success('删除成功');
      // 清空选中状态
      setSelectedCategory(null);
      setSelectedKeys([]);
      setCheckedKeys([]);
      form.resetFields();
      setIsEditing(false);
      setIsAdding(false);
      // 刷新列表
      fetchCategories();
    } catch (error: any) {
      console.error('删除分类失败:', error);
      // API 返回 400 表示存在子分类或关联练习题
      if (error?.response?.status === 400) {
        message.error('无法删除：该分类存在子分类或关联练习题');
      } else {
        message.error(error?.message || '删除分类失败');
      }
    }
  };

  /**
   * 刷新分类列表
   */
  const handleRefresh = async () => {
    // 清空状态
    setSelectedCategory(null);
    setSelectedKeys([]);
    setCheckedKeys([]);
    form.resetFields();
    setIsEditing(false);
    setIsAdding(false);
    // 重新获取数据
    await fetchCategories();
  };

  /**
   * 保存分类信息
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (isAdding) {
        // 添加模式
        // 构建请求数据：一级分类（parent_id=0）不传 parent_id 字段
        const requestData: any = {
          name: values.name,
          sort: values.sort,
        };
        
        // 只有当 parent_id > 0 时才传 parent_id（二级、三级分类）
        if (addParentId > 0) {
          requestData.parent_id = addParentId;
        }
        
        await createOralCategory(requestData);
        message.success('添加成功');
        setIsAdding(false);
        form.resetFields();
        fetchCategories();
      } else if (isEditing && selectedCategory) {
        // 编辑模式
        await updateOralCategory(selectedCategory.id, {
          name: values.name,
          sort: values.sort,
        });
        message.success('保存成功');
        setIsEditing(false);
        fetchCategories();
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      if (error?.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.message || '保存失败');
    }
  };

  /**
   * 重置表单
   */
  const handleReset = () => {
    if (isAdding) {
      form.resetFields();
      form.setFieldsValue({
        parent_id: addParentId,
        sort: 100,
      });
    } else if (selectedCategory) {
      form.setFieldsValue({
        name: selectedCategory.name,
        parent_id: selectedCategory.parent_id,
        sort: selectedCategory.sort,
      });
    }
  };

  /**
   * 取消编辑/添加
   */
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    if (selectedCategory) {
      form.setFieldsValue({
        name: selectedCategory.name,
        parent_id: selectedCategory.parent_id,
        sort: selectedCategory.sort,
      });
    } else {
      form.resetFields();
    }
  };

  /**
   * 渲染树节点标题
   */
  const renderTreeTitle = (node: CategoryTreeNode): React.ReactNode => {
    return (
      <div className="tree-node-content">
        <div className="node-info">
          <span className="node-name">{node.title}</span>
          <Tag color={node.level === 1 ? 'blue' : node.level === 2 ? 'green' : 'orange'}>
            {getLevelName(node.level)}
          </Tag>
        </div>
        <div className="node-actions">
          {node.level < 3 && (
            <Button
              type="link"
              size="small"
              className="action-btn"
              icon={<PlusOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleAddCategory(node.key as number);
              }}
            >
              添加子类
            </Button>
          )}
        </div>
      </div>
    );
  };

  /**
   * 转换TreeData用于Tree组件
   */
  const convertToAntTreeData = (nodes: CategoryTreeNode[]): DataNode[] => {
    return nodes.map((node) => ({
      key: node.key,
      title: renderTreeTitle(node),
      icon: node.isLeaf ? <FileOutlined /> : undefined,
      children: node.children ? convertToAntTreeData(node.children) : undefined,
    }));
  };

  /**
   * 获取父级选择器的数据
   * 注意：只能选择 level < 3 的分类作为父级
   */
  const getParentSelectOptions = () => {
    const flatList = flattenCategories(categories);
    // 排除当前编辑的分类及其子分类，以及 level=3 的分类
    const filterList = flatList.filter((c) => {
      // level=3 不能作为父级
      if (c.level >= 3) return false;
      
      if (selectedCategory && isEditing) {
        // 不能选择自己作为父级
        if (c.id === selectedCategory.id) return false;
        // 不能选择自己的子分类作为父级
        let current = findCategoryById(categories, c.parent_id);
        while (current) {
          if (current.id === selectedCategory.id) return false;
          current = findCategoryById(categories, current.parent_id);
        }
      }
      return true;
    });

    return filterList.map((c) => ({
      value: c.id,
      title: `${'　'.repeat(c.level - 1)}${c.name} (${getLevelName(c.level)})`,
      label: `${'　'.repeat(c.level - 1)}${c.name}`,
    }));
  };

  /**
   * 获取添加时的层级提示
   */
  const getAddLevelHint = (): string => {
    if (addParentId === 0) {
      return '将添加为一级分类（口语等级）';
    }
    const parent = findCategoryById(categories, addParentId);
    if (parent) {
      const newLevel = parent.level + 1;
      return `将添加为 "${parent.name}" 的子分类（${getLevelName(newLevel)}）`;
    }
    return '';
  };

  return (
    <div className="topics-management">
      {/* 顶部操作栏 */}
      <div className="top-bar">
        <div className="action-row">
          <div className="action-group">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleAddCategory(0)}>
              添加类别
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              刷新列表
            </Button>
          </div>

          <div className="current-selection">
            <span className="label">当前选择：</span>
            {selectedCategory ? (
              <span className="value">
                {selectedCategory.name}
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {getLevelName(selectedCategory.level)}
                </Tag>
              </span>
            ) : (
              <span className="empty">未选择</span>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="main-content">
        {/* 左侧分类树 */}
        <div className="category-tree-panel">
          <div className="panel-header">
            <div className="header-title">
              <FolderOpenOutlined />
              <span>分类树</span>
            </div>
          </div>
          <div className="panel-content">
            {loading ? (
              <div className="loading-container">
                <Spin tip="加载中..." />
              </div>
            ) : treeData.length > 0 ? (
              <Tree
                className="category-tree"
                checkable
                showIcon
                blockNode
                checkStrictly
                selectable
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                checkedKeys={checkedKeys}
                onSelect={handleSelect}
                onCheck={handleCheck}
                onExpand={handleExpand}
                treeData={convertToAntTreeData(treeData)}
                switcherIcon={({ expanded }) =>
                  expanded ? <FolderOpenOutlined /> : <FolderOutlined />
                }
              />
            ) : (
              <div className="empty-tree">
                <Empty description="暂无分类数据" />
              </div>
            )}
          </div>
        </div>

        {/* 右侧编辑表单 */}
        <div className="category-form-panel">
          <div className="panel-header">
            <EditOutlined />
            <span>
              {isAdding ? '添加分类' : isEditing ? '编辑分类' : '分类信息'}
            </span>
            {isAdding && (
              <Tag color="green" className="edit-mode-tag">
                新增模式
              </Tag>
            )}
            {isEditing && (
              <Tag color="blue" className="edit-mode-tag">
                编辑模式
              </Tag>
            )}
          </div>
          <div className="panel-content">
            {isAdding || selectedCategory ? (
              <Form
                form={form}
                layout="vertical"
                className="category-form"
                disabled={!isAdding && !isEditing}
              >
                <div className="form-section">
                  <div className="section-title">基本信息</div>
                  
                  {isAdding && (
                    <Form.Item label="添加层级">
                      <Tag color="processing" style={{ fontSize: '14px', padding: '6px 12px' }}>
                        {getAddLevelHint()}
                      </Tag>
                    </Form.Item>
                  )}
                  
                  {!isAdding && selectedCategory && (
                    <Form.Item label="当前层级">
                      <Tag color={selectedCategory.level === 1 ? 'blue' : selectedCategory.level === 2 ? 'green' : 'orange'}>
                        Level {selectedCategory.level}: {getLevelName(selectedCategory.level)}
                      </Tag>
                    </Form.Item>
                  )}

                  <Form.Item
                    name="name"
                    label="分类名称"
                    rules={[{ required: true, message: '请输入分类名称' }]}
                  >
                    <Input 
                      placeholder={
                        addParentId === 0 
                          ? "请输入一级分类名称（如：PET 口语、FCE 口语）" 
                          : "请输入分类名称（如：旅游、part1）"
                      } 
                      maxLength={50} 
                    />
                  </Form.Item>

                  {isAdding && addParentId > 0 && (
                    <Form.Item label="上级目录">
                      <div style={{ 
                        padding: '8px 12px', 
                        background: '#f5f5f5', 
                        borderRadius: '4px',
                        border: '1px solid #d9d9d9'
                      }}>
                        {(() => {
                          const parent = findCategoryById(categories, addParentId);
                          return parent ? (
                            <span>
                              {parent.name}
                              <Tag color="blue" style={{ marginLeft: 8 }}>
                                {getLevelName(parent.level)}
                              </Tag>
                            </span>
                          ) : '未知分类';
                        })()}
                      </div>
                    </Form.Item>
                  )}
                </div>

                <div className="form-section">
                  <div className="section-title">其他信息</div>

                  <Form.Item
                    name="sort"
                    label="排序值"
                    rules={[{ required: true, message: '请输入排序值' }]}
                    tooltip="数值越小，排序越靠前"
                  >
                    <InputNumber
                      placeholder="请输入排序值"
                      min={1}
                      max={9999}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </div>
              </Form>
            ) : (
              <div className="empty-form">
                <FolderOutlined className="empty-icon" />
                <span className="empty-text">请从左侧选择一个分类查看详情</span>
              </div>
            )}
          </div>
          <div className="panel-footer">
            {(isAdding || isEditing) ? (
              <>
                <Button onClick={handleCancel}>取消</Button>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" onClick={handleSave}>
                  保存
                </Button>
              </>
            ) : selectedCategory ? (
              <>
                <Popconfirm
                  title="确定要删除这个分类吗？"
                  description="若存在子分类或关联练习题，将无法删除"
                  onConfirm={() => handleDeleteCategory()}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>
                <Button type="primary" icon={<EditOutlined />} onClick={handleEditCategory}>
                  编辑
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopicsManagement;
