/**
 * 练习题列表管理页面
 * 基于 REST API /api/oral 接口实现
 * 提供分类树展示、题库列表和增删改查功能
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tree,
  Table,
  Button,
  Input,
  Select,
  Tag,
  message,
  Spin,
  Empty,
  Popconfirm,
  Modal,
  Form,
  InputNumber,
  Space,
  Tooltip,
  Switch,
  Upload,
  Radio,
} from 'antd';
import type { UploadChangeParam, UploadFile, RcFile } from 'antd/es/upload';
import {
  PlusOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EditOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
  EyeOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  CloseCircleOutlined,
  PictureOutlined,
  LoadingOutlined,
  LinkOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import type { ColumnsType } from 'antd/es/table';
import {
  Category,
  CategoryTreeNode,
  Exercise,
  ExerciseFormData,
  getLevelName,
  getDifficultyName,
  getDifficultyColor,
  getWorkflowTypeName,
} from './types';
import {
  getOralCategoriesTree,
  getOralExercises,
  createOralExercise,
  updateOralExercise,
  deleteOralExercise,
  getOralExerciseDetail,
  searchOralExercises,
  uploadFile,
  getWorkflowTypes,
} from '@/services/ant-design-pro/api';
import './index.less';

const { TextArea } = Input;
const { Option } = Select;

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
    if (category.children && category.children.length > 0) {
      keys.push(category.id);
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
 * 练习题列表管理组件
 */
const ExercisesManagement: React.FC = () => {
  // 分类数据
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // 工作流类型选项（从API动态获取）
  const [workflowTypeOptions, setWorkflowTypeOptions] = useState<Array<{ label: string; value: string }>>([]);

  // 练习题数据
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 是否仅显示启用的题目
  const [onlyActive, setOnlyActive] = useState(true);

  // 搜索状态
  const [searchMode, setSearchMode] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  // 表单实例
  const [form] = Form.useForm<ExerciseFormData>();

  // 图片上传状态
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  // 图片输入模式：'upload' 本地上传 | 'link' 链接输入
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'link'>('upload');

  /**
   * 获取工作流类型选项
   */
  const fetchWorkflowTypes = useCallback(async () => {
    try {
      const response = await getWorkflowTypes({ only_active: true });
      if (response && response.success && Array.isArray(response.data)) {
        // 转换为 { label, value } 格式
        const options = response.data.map((item: API.WorkflowTypeOption) => ({
          label: item.label,
          value: item.value,
        }));
        setWorkflowTypeOptions(options);
      } else {
        setWorkflowTypeOptions([]);
      }
    } catch (error: any) {
      console.error('获取工作流类型失败:', error);
      setWorkflowTypeOptions([]);
    }
  }, []);

  /**
   * 获取分类列表
   */
  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    try {
      const response = await getOralCategoriesTree();
      if (response && response.success && Array.isArray(response.data)) {
        setCategories(response.data);
        setTreeData(convertToTreeData(response.data));
        const allExpandableKeys = getAllExpandableKeys(response.data);
        setExpandedKeys(allExpandableKeys);
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
      setCategoryLoading(false);
    }
  }, []);

  /**
   * 获取练习题列表
   * GET /api/oral/exercises?category_id={id}&only_active={boolean}
   */
  const fetchExercises = useCallback(async (categoryId: number, showOnlyActive: boolean = true) => {
    setExerciseLoading(true);
    setSearchMode(false);
    try {
      const response = await getOralExercises({
        category_id: categoryId,
        only_active: showOnlyActive,
      });
      if (response && response.success && Array.isArray(response.data)) {
        setExercises(response.data);
        setTotal(response.data.length);
      } else {
        setExercises([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取练习题列表失败:', error);
      message.error(error?.message || '获取练习题列表失败');
      setExercises([]);
      setTotal(0);
    } finally {
      setExerciseLoading(false);
    }
  }, []);

  /**
   * 搜索练习题
   * GET /api/oral/exercises/search
   */
  const handleSearch = useCallback(async (keyword: string, page: number = 1, size: number = 20) => {
    if (!keyword.trim()) {
      message.warning('请输入搜索关键词');
      return;
    }

    setSearchLoading(true);
    setSearchMode(true);
    setCurrentPage(page);
    setPageSize(size);

    try {
      const response = await searchOralExercises({
        title: keyword.trim(),
        category_id: selectedCategory?.id,
        only_active: onlyActive,
        page: page,
        page_size: size,
      });
      if (response && response.success && Array.isArray(response.data)) {
        setExercises(response.data);
        setTotal(response.total || 0);
        if (response.message) {
          message.success(response.message);
        }
      } else {
        setExercises([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('搜索练习题失败:', error);
      message.error(error?.message || '搜索失败');
      setExercises([]);
      setTotal(0);
    } finally {
      setSearchLoading(false);
    }
  }, [selectedCategory, onlyActive]);

  /**
   * 清除搜索，返回分类列表
   */
  const handleClearSearch = useCallback(() => {
    setSearchKeyword('');
    setSearchMode(false);
    setCurrentPage(1);
    if (selectedCategory) {
      fetchExercises(selectedCategory.id, onlyActive);
    } else {
      setExercises([]);
      setTotal(0);
    }
  }, [selectedCategory, onlyActive, fetchExercises]);

  /**
   * 搜索分页变化
   */
  const handleSearchPageChange = (page: number, size?: number) => {
    const newSize = size || pageSize;
    handleSearch(searchKeyword, page, newSize);
  };

  // 初始化加载数据
  useEffect(() => {
    fetchCategories();
    fetchWorkflowTypes();
  }, [fetchCategories, fetchWorkflowTypes]);

  // 分类选中后加载练习题
  useEffect(() => {
    if (selectedCategory) {
      fetchExercises(selectedCategory.id, onlyActive);
    }
  }, [selectedCategory, onlyActive, fetchExercises]);

  /**
   * 处理树节点选中
   */
  const handleSelect: TreeProps['onSelect'] = (keys, info) => {
    setSelectedKeys(keys);
    // 切换分类时清除搜索状态
    setSearchKeyword('');
    setSearchMode(false);
    setCurrentPage(1);
    if (keys.length > 0) {
      const categoryId = keys[0] as number;
      const category = findCategoryById(categories, categoryId);
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
      setExercises([]);
      setTotal(0);
    }
  };

  /**
   * 处理展开/收起
   */
  const handleExpand: TreeProps['onExpand'] = (keys) => {
    setExpandedKeys(keys);
  };

  /**
   * 切换仅显示启用题目
   */
  const handleOnlyActiveChange = (checked: boolean) => {
    setOnlyActive(checked);
  };

  /**
   * 打开添加弹窗
   */
  const handleAdd = () => {
    if (!selectedCategory) {
      message.warning('请先选择一个分类');
      return;
    }
    // 只有三级分类才能添加题目
    if (selectedCategory.level !== 3) {
      message.warning('只能在三级分类下添加题目');
      return;
    }
    setModalMode('add');
    setCurrentExercise(null);
    form.resetFields();
    resetImageState();
    form.setFieldsValue({
      category_id: selectedCategory.id,
      difficulty: 3,
      is_active: 1,
      workflow_type: 'fce_part1',
    });
    setModalVisible(true);
  };

  /**
   * 打开编辑弹窗
   */
  const handleEdit = async (record: Exercise) => {
    setModalMode('edit');
    setCurrentExercise(record);
    try {
      const response = await getOralExerciseDetail(record.id);
      if (response && response.success && response.data) {
        const exercise = response.data;
        form.setFieldsValue({
          category_id: exercise.category_id,
          title: exercise.title,
          content: exercise.content,
          image_url: exercise.image_url,
          workflow_type: exercise.workflow_type,
          difficulty: exercise.difficulty,
          is_active: exercise.is_active,
        });
        // 设置图片状态
        if (exercise.image_url) {
          setImageUrl(exercise.image_url);
          // 判断是本地上传还是链接，如果是http开头且不是本站地址，认为是链接模式
          const isExternalLink = exercise.image_url.startsWith('http') && 
            !exercise.image_url.includes(window.location.host);
          if (isExternalLink) {
            setImageInputMode('link');
            setFileList([]);
          } else {
            setImageInputMode('upload');
            setFileList([{
              uid: '-1',
              name: '已上传图片',
              status: 'done',
              url: exercise.image_url,
            }]);
          }
        } else {
          resetImageState();
        }
        setModalVisible(true);
      }
    } catch (error: any) {
      message.error(error?.message || '获取练习题详情失败');
    }
  };

  /**
   * 查看详情
   */
  const handleViewDetail = async (record: Exercise) => {
    try {
      const response = await getOralExerciseDetail(record.id);
      if (response && response.success && response.data) {
        setCurrentExercise(response.data);
        setDetailModalVisible(true);
      }
    } catch (error: any) {
      message.error(error?.message || '获取练习题详情失败');
    }
  };

  /**
   * 删除练习题（软删除，将 is_active 置为 0）
   */
  const handleDelete = async (record: Exercise) => {
    try {
      await deleteOralExercise(record.id);
      message.success('删除成功');
      if (selectedCategory) {
        fetchExercises(selectedCategory.id, onlyActive);
      }
    } catch (error: any) {
      message.error(error?.message || '删除失败');
    }
  };

  /**
   * 保存练习题
   */
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalMode === 'add') {
        await createOralExercise({
          category_id: values.category_id,
          title: values.title,
          content: values.content,
          image_url: values.image_url,
          workflow_type: values.workflow_type,
          difficulty: values.difficulty,
          is_active: values.is_active,
        });
        message.success('添加成功');
      } else if (currentExercise) {
        await updateOralExercise(currentExercise.id, {
          category_id: values.category_id,
          title: values.title,
          content: values.content,
          image_url: values.image_url,
          workflow_type: values.workflow_type,
          difficulty: values.difficulty,
          is_active: values.is_active,
        });
        message.success('更新成功');
      }

      setModalVisible(false);
      form.resetFields();
      if (selectedCategory) {
        fetchExercises(selectedCategory.id, onlyActive);
      }
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      message.error(error?.message || '保存失败');
    }
  };

  /**
   * 刷新列表
   */
  const handleRefresh = () => {
    fetchCategories();
    if (selectedCategory) {
      fetchExercises(selectedCategory.id, onlyActive);
    }
  };

  /**
   * 图片上传前校验
   */
  const beforeUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不能超过 5MB！');
      return false;
    }
    return true;
  };

  /**
   * 自定义上传处理
   */
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setImageLoading(true);
    try {
      const response = await uploadFile(file as File);
      if (response.success && (response.url || response.file_path)) {
        const url = response.url || response.file_path || '';
        setImageUrl(url);
        form.setFieldValue('image_url', url);
        setFileList([{
          uid: '-1',
          name: (file as File).name,
          status: 'done',
          url: url,
        }]);
        onSuccess?.(response, file);
        message.success('图片上传成功');
      } else {
        throw new Error(response.message || '上传失败');
      }
    } catch (error: any) {
      console.error('图片上传失败:', error);
      message.error(error?.message || '图片上传失败');
      onError?.(error);
    } finally {
      setImageLoading(false);
    }
  };

  /**
   * 删除图片
   */
  const handleRemoveImage = () => {
    setImageUrl('');
    setFileList([]);
    form.setFieldValue('image_url', '');
  };

  /**
   * 重置图片状态
   */
  const resetImageState = () => {
    setImageUrl('');
    setImageLoading(false);
    setFileList([]);
    setImageInputMode('upload');
  };

  /**
   * 渲染树节点标题
   */
  const renderTreeTitle = (node: CategoryTreeNode): React.ReactNode => {
    return (
      <div className="tree-node-content">
        <div className="node-info">
          <span className="node-name">{node.title}</span>
          <Tag color={node.level === 1 ? 'blue' : node.level === 2 ? 'green' : 'orange'} style={{ marginLeft: 4, fontSize: 10 }}>
            {getLevelName(node.level)}
          </Tag>
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
   * 表格列定义
   */
  const columns: ColumnsType<Exercise> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      ellipsis: true,
      render: (text, record) => (
        <Tooltip title={text}>
          <a onClick={() => handleViewDetail(record)} className="exercise-title">
            {text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text) => (
        <Tooltip title={text}>
          <span className="exercise-content">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '图片',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 80,
      render: (url) => url ? (
        <Tooltip title="点击查看大图">
          <img 
            src={url} 
            alt="题目图片" 
            style={{ 
              width: 40, 
              height: 40, 
              objectFit: 'cover', 
              borderRadius: 4,
              cursor: 'pointer'
            }} 
            onClick={() => window.open(url, '_blank')}
          />
        </Tooltip>
      ) : (
        <span style={{ color: '#ccc' }}>-</span>
      ),
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty) => (
        <Tag color={getDifficultyColor(difficulty)}>
          {getDifficultyName(difficulty)}
        </Tag>
      ),
    },
    {
      title: '工作流',
      dataIndex: 'workflow_type',
      key: 'workflow_type',
      width: 100,
      render: (type) => (
        <Tag color="purple">
          {getWorkflowTypeName(type, workflowTypeOptions)}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 70,
      render: (is_active) => (
        <Tag color={is_active === 1 ? 'green' : 'default'}>
          {is_active === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" className="action-buttons">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这道题目吗？"
            description="删除后该题目将被禁用"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="exercises-management">
      {/* 顶部操作栏 */}
      <div className="top-bar">
        <div className="action-row">
          <div className="action-group">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加题目
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={categoryLoading || exerciseLoading}>
              刷新
            </Button>
          </div>

          <div className="current-selection">
            <span className="label">当前分类：</span>
            {selectedCategory ? (
              <span className="value">
                {selectedCategory.name}
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {getLevelName(selectedCategory.level)}
                </Tag>
              </span>
            ) : (
              <span className="empty">未选择（请从左侧选择三级分类）</span>
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
            {categoryLoading ? (
              <div className="loading-container">
                <Spin tip="加载中..." />
              </div>
            ) : treeData.length > 0 ? (
              <Tree
                className="category-tree"
                showIcon
                blockNode
                selectable
                expandedKeys={expandedKeys}
                selectedKeys={selectedKeys}
                onSelect={handleSelect}
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

        {/* 右侧题库列表 */}
        <div className="exercise-list-panel">
          <div className="panel-header">
            <div className="header-left">
              <UnorderedListOutlined />
              <span>{searchMode ? '搜索结果' : '题库列表'}</span>
              {total > 0 && <Tag color="blue">{total} 题</Tag>}
              {searchMode && (
                <Tag color="orange">搜索模式</Tag>
              )}
            </div>
            <div className="header-actions">
              <span style={{ marginRight: 8 }}>仅显示启用：</span>
              <Switch checked={onlyActive} onChange={handleOnlyActiveChange} />
            </div>
          </div>
          
          {/* 搜索栏 */}
          <div className="search-bar" style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
            <Space size="middle" wrap>
              <Input.Search
                placeholder="输入标题关键词搜索"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onSearch={(value) => handleSearch(value, 1, pageSize)}
                style={{ width: 280 }}
                enterButton={<><SearchOutlined /> 搜索</>}
                loading={searchLoading}
                allowClear
              />
              {searchMode && (
                <Button 
                  icon={<CloseCircleOutlined />} 
                  onClick={handleClearSearch}
                >
                  清除搜索
                </Button>
              )}
              {selectedCategory && (
                <span style={{ color: '#666' }}>
                  搜索范围：{selectedCategory.name}
                </span>
              )}
              {!selectedCategory && (
                <span style={{ color: '#999' }}>
                  搜索范围：全部分类
                </span>
              )}
            </Space>
          </div>

          <div className="panel-content">
            {/* 表格 */}
            {(exerciseLoading || searchLoading) ? (
              <div className="loading-container">
                <Spin tip="加载中..." />
              </div>
            ) : exercises.length > 0 ? (
              <Table
                className="exercise-table"
                columns={columns}
                dataSource={exercises}
                rowKey="id"
                pagination={searchMode ? {
                  current: currentPage,
                  pageSize: pageSize,
                  total: total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (t) => `共 ${t} 条`,
                  onChange: handleSearchPageChange,
                  pageSizeOptions: ['10', '20', '50', '100'],
                } : {
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (t) => `共 ${t} 条`,
                }}
                scroll={{ x: 800 }}
                size="small"
              />
            ) : searchMode ? (
              <div className="empty-list">
                <SearchOutlined className="empty-icon" />
                <span className="empty-text">未找到匹配「{searchKeyword}」的题目</span>
                <Button onClick={handleClearSearch} style={{ marginTop: 16 }}>
                  清除搜索
                </Button>
              </div>
            ) : selectedCategory ? (
              selectedCategory.level === 3 ? (
                <div className="empty-list">
                  <FileOutlined className="empty-icon" />
                  <span className="empty-text">该分类下暂无题目</span>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginTop: 16 }}>
                    添加题目
                  </Button>
                </div>
              ) : (
                <div className="empty-list">
                  <FolderOutlined className="empty-icon" />
                  <span className="empty-text">请选择三级分类（题型部分）查看题目</span>
                </div>
              )
            ) : (
              <div className="empty-list">
                <FolderOutlined className="empty-icon" />
                <span className="empty-text">请从左侧选择一个三级分类查看题目，或直接搜索</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 添加/编辑弹窗 */}
      <Modal
        title={modalMode === 'add' ? '添加题目' : '编辑题目'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={600}
        className="exercise-modal"
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item name="category_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="title"
            label="题目标题"
            rules={[{ required: true, message: '请输入题目标题' }]}
          >
            <Input placeholder="请输入题目标题" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="content"
            label="题目内容"
            rules={[{ required: true, message: '请输入题目内容' }]}
          >
            <TextArea
              placeholder="请输入题目内容/问题"
              rows={6}
              maxLength={2000}
              showCount
            />
          </Form.Item>

          {/* 隐藏的 image_url 字段，用于存储实际值 */}
          <Form.Item name="image_url" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="题目图片">
            <div>
              {/* 模式切换 */}
              <Radio.Group 
                value={imageInputMode} 
                onChange={(e) => {
                  const newMode = e.target.value;
                  setImageInputMode(newMode);
                  
                  // 切换模式时保持 imageUrl 不变，只更新 UI 状态
                  if (newMode === 'upload') {
                    // 切换到上传模式，如果有图片URL，显示为已上传预览
                    if (imageUrl) {
                      setFileList([{
                        uid: '-1',
                        name: '已有图片',
                        status: 'done',
                        url: imageUrl,
                      }]);
                    }
                  } else {
                    // 切换到链接模式，清空文件列表，保留 imageUrl
                    setFileList([]);
                  }
                }}
                style={{ marginBottom: 12 }}
              >
                <Radio.Button value="upload">
                  <UploadOutlined /> 本地上传
                </Radio.Button>
                <Radio.Button value="link">
                  <LinkOutlined /> 链接地址
                </Radio.Button>
              </Radio.Group>

              {/* 本地上传模式 */}
              {imageInputMode === 'upload' && (
                <>
                  <Upload
                    name="file"
                    listType="picture-card"
                    fileList={fileList}
                    beforeUpload={beforeUpload}
                    customRequest={customUpload}
                    onRemove={handleRemoveImage}
                    maxCount={1}
                    accept="image/*"
                  >
                    {fileList.length < 1 && (
                      <div>
                        {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
                        <div style={{ marginTop: 8 }}>上传图片</div>
                      </div>
                    )}
                  </Upload>
                  <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    支持 jpg、png、gif 格式，文件大小不超过 5MB
                  </div>
                </>
              )}

              {/* 链接输入模式 */}
              {imageInputMode === 'link' && (
                <>
                  <Input
                    placeholder="请输入图片URL链接"
                    prefix={<LinkOutlined />}
                    value={imageUrl}
                    onChange={(e) => {
                      const url = e.target.value;
                      setImageUrl(url);
                      form.setFieldValue('image_url', url);
                    }}
                    style={{ marginBottom: 8 }}
                  />
                  {imageUrl && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ color: '#999', fontSize: 12, marginBottom: 8, display: 'block' }}>图片预览：</span>
                      <img 
                        src={imageUrl} 
                        alt="图片预览" 
                        style={{ 
                          maxWidth: 200, 
                          maxHeight: 150, 
                          borderRadius: 4,
                          border: '1px solid #d9d9d9'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                        onLoad={(e) => {
                          (e.target as HTMLImageElement).style.display = 'block';
                        }}
                      />
                    </div>
                  )}
                  <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                    请输入有效的图片URL地址，如 https://example.com/image.jpg
                  </div>
                </>
              )}
            </div>
          </Form.Item>

          <Space size="large" wrap>
            <Form.Item
              name="difficulty"
              label="难度等级"
              rules={[{ required: true, message: '请选择难度等级' }]}
            >
              <Select style={{ width: 120 }}>
                <Option value={1}>入门</Option>
                <Option value={2}>简单</Option>
                <Option value={3}>中等</Option>
                <Option value={4}>困难</Option>
                <Option value={5}>专家</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="workflow_type"
              label="工作流类型"
              rules={[{ required: true, message: '请选择工作流类型' }]}
            >
              <Select 
                style={{ width: 140 }} 
                placeholder={workflowTypeOptions.length === 0 ? '加载中...' : '请选择工作流'}
                loading={workflowTypeOptions.length === 0}
                notFoundContent={workflowTypeOptions.length === 0 ? '正在加载...' : '暂无数据'}
              >
                {workflowTypeOptions.map(opt => (
                  <Option key={opt.value} value={opt.value}>{opt.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="is_active"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select style={{ width: 100 }}>
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>
          </Space>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="题目详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              if (currentExercise) {
                handleEdit(currentExercise);
              }
            }}
          >
            编辑
          </Button>,
        ]}
        width={600}
        className="exercise-detail-modal"
      >
        {currentExercise && (
          <>
            <div className="detail-section">
              <div className="section-title">基本信息</div>
              <div className="detail-item">
                <span className="item-label">ID：</span>
                <span className="item-value">{currentExercise.id}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">标题：</span>
                <span className="item-value">{currentExercise.title}</span>
              </div>
              <div className="detail-item">
                <span className="item-label">内容：</span>
              </div>
              <div className="content-box">{currentExercise.content}</div>
              {currentExercise.image_url && (
                <div className="detail-item" style={{ marginTop: 12 }}>
                  <span className="item-label">图片：</span>
                  <div style={{ marginTop: 8 }}>
                    <img 
                      src={currentExercise.image_url} 
                      alt="题目图片" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: 200, 
                        borderRadius: 8,
                        border: '1px solid #f0f0f0',
                        cursor: 'pointer'
                      }}
                      onClick={() => window.open(currentExercise.image_url, '_blank')}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="detail-section">
              <div className="section-title">题目属性</div>
              <Space size="large" wrap>
                <div className="detail-item">
                  <span className="item-label">难度：</span>
                  <Tag color={getDifficultyColor(currentExercise.difficulty)}>
                    {getDifficultyName(currentExercise.difficulty)}
                  </Tag>
                </div>
                <div className="detail-item">
                  <span className="item-label">工作流：</span>
                  <Tag color="purple">
                    {getWorkflowTypeName(currentExercise.workflow_type, workflowTypeOptions)}
                  </Tag>
                </div>
                <div className="detail-item">
                  <span className="item-label">状态：</span>
                  <Tag color={currentExercise.is_active === 1 ? 'green' : 'default'}>
                    {currentExercise.is_active === 1 ? '启用' : '禁用'}
                  </Tag>
                </div>
              </Space>
            </div>

            <div className="detail-section">
              <div className="section-title">时间信息</div>
              <Space size="large">
                {currentExercise.create_time && (
                  <div className="detail-item">
                    <span className="item-label">创建时间：</span>
                    <span className="item-value">{currentExercise.create_time}</span>
                  </div>
                )}
                {currentExercise.update_time && (
                  <div className="detail-item">
                    <span className="item-label">更新时间：</span>
                    <span className="item-value">{currentExercise.update_time}</span>
                  </div>
                )}
              </Space>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExercisesManagement;
