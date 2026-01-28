/**
 * 试卷组卷页面
 * 基于 REST API /api/exam 接口实现
 * 提供分类树筛选、练习题勾选、已选题目管理功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tree,
  Button,
  Input,
  Select,
  Tag,
  message,
  Spin,
  Empty,
  Modal,
  Form,
  InputNumber,
  Space,
  Tooltip,
  Checkbox,
  Popconfirm,
} from 'antd';
import type { TreeProps } from 'antd/es/tree';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  UnorderedListOutlined,
  CheckSquareOutlined,
  HolderOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Category,
  CategoryTreeNode,
  Exercise,
  SelectedQuestion,
  getDifficultyName,
  getDifficultyColor,
  getLevelName,
  DIFFICULTY_OPTIONS,
  PaperFormData,
} from './types';
import {
  getOralCategoriesTree,
  getOralExercises,
  createExamPaper,
  batchAddQuestionsToPaper,
  getExamCategories,
  getWorkflowTypes,
  getExercisesByWorkflow,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;

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
 * 递归获取所有非叶子节点的key
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
 * 获取一级分类列表
 */
const getLevel1Categories = (categories: Category[]): Category[] => {
  return categories.filter(c => c.level === 1);
};

/**
 * 试卷组卷页面组件
 */
const ExamPaperBuilder: React.FC = () => {
  // 试卷基本信息
  const [paperCode, setPaperCode] = useState('');
  const [paperName, setPaperName] = useState('');
  const [applyCategoryId, setApplyCategoryId] = useState<number>(0);

  // 考试分类数据（适用分类）
  const [examCategories, setExamCategories] = useState<any[]>([]);
  const [examCategoriesLoading, setExamCategoriesLoading] = useState(false);

  // 工作流类型列表
  const [workflowTypes, setWorkflowTypes] = useState<Array<{ label: string; value: string }>>([]);
  const [workflowTypesLoading, setWorkflowTypesLoading] = useState(false);
  const [selectedWorkflowType, setSelectedWorkflowType] = useState<string>('');

  // 分类数据（已废弃，保留用于类型兼容）
  const [categories, setCategories] = useState<Category[]>([]);
  const [treeData, setTreeData] = useState<CategoryTreeNode[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // 难度筛选
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | undefined>(undefined);

  // 练习题数据
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);

  // 已选题目
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);

  // 搜索
  const [searchKeyword, setSearchKeyword] = useState('');

  // 题目详情弹窗
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  // 提交状态
  const [submitting, setSubmitting] = useState(false);

  // 拖拽状态
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  /**
   * 计算总分
   */
  const totalScore = useMemo(() => {
    return selectedQuestions.reduce((sum, q) => sum + q.question_score, 0);
  }, [selectedQuestions]);

  /**
   * 获取考试分类列表（适用分类）
   */
  const fetchExamCategories = useCallback(async () => {
    setExamCategoriesLoading(true);
    try {
      const response = await getExamCategories({
        only_active: true,
      });
      if (response && response.success && Array.isArray(response.data)) {
        setExamCategories(response.data);
      }
    } catch (error: any) {
      console.error('获取考试分类列表失败:', error);
      message.error(error?.message || '获取考试分类列表失败');
    } finally {
      setExamCategoriesLoading(false);
    }
  }, []);

  /**
   * 获取工作流类型列表
   */
  const fetchWorkflowTypes = useCallback(async () => {
    setWorkflowTypesLoading(true);
    try {
      const response = await getWorkflowTypes({ only_active: true });
      if (response && response.success && Array.isArray(response.data)) {
        const options = response.data.map((item: any) => ({
          label: item.label,
          value: item.value,
        }));
        setWorkflowTypes(options);
        // 默认选中第一个工作流类型
        if (options.length > 0) {
          setSelectedWorkflowType(options[0].value);
        }
      }
    } catch (error: any) {
      console.error('获取工作流类型列表失败:', error);
      message.error(error?.message || '获取工作流类型列表失败');
    } finally {
      setWorkflowTypesLoading(false);
    }
  }, []);

  /**
   * 获取分类列表（已废弃）
   */
  const fetchCategories = useCallback(async () => {
    // 不再使用，保留空函数以防引用错误
  }, []);

  /**
   * 获取练习题列表（按工作流类型）
   */
  const fetchExercises = useCallback(async (workflowType: string) => {
    setExerciseLoading(true);
    try {
      const response = await getExercisesByWorkflow({
        workflow_type: workflowType,
      });
      if (response && response.success && Array.isArray(response.data)) {
        setExercises(response.data);
      } else {
        setExercises([]);
      }
    } catch (error: any) {
      console.error('获取练习题列表失败:', error);
      message.error(error?.message || '获取练习题列表失败');
      setExercises([]);
    } finally {
      setExerciseLoading(false);
    }
  }, []);

  // 初始化加载考试分类和工作流类型
  useEffect(() => {
    fetchExamCategories();
    fetchWorkflowTypes();
  }, [fetchExamCategories, fetchWorkflowTypes]);

  // 工作流类型选中后加载练习题
  useEffect(() => {
    if (selectedWorkflowType) {
      fetchExercises(selectedWorkflowType);
    } else {
      setExercises([]);
    }
  }, [selectedWorkflowType, fetchExercises]);

  /**
   * 过滤后的练习题列表
   */
  const filteredExercises = useMemo(() => {
    let result = exercises;

    // 难度筛选
    if (selectedDifficulty !== undefined) {
      result = result.filter(e => e.difficulty === selectedDifficulty);
    }

    // 关键词搜索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter(
        e => e.title.toLowerCase().includes(keyword) || 
             e.content.toLowerCase().includes(keyword)
      );
    }

    return result;
  }, [exercises, selectedDifficulty, searchKeyword]);

  /**
   * 处理树节点选中
   */
  const handleTreeSelect: TreeProps['onSelect'] = (keys) => {
    setSelectedKeys(keys);
    if (keys.length > 0) {
      const categoryId = keys[0] as number;
      const category = findCategoryById(categories, categoryId);
      setSelectedCategory(category);
    } else {
      setSelectedCategory(null);
    }
  };

  /**
   * 处理展开/收起
   */
  const handleExpand: TreeProps['onExpand'] = (keys) => {
    setExpandedKeys(keys);
  };

  /**
   * 判断题目是否已选
   */
  const isQuestionSelected = (exerciseId: number): boolean => {
    return selectedQuestions.some(q => q.exercise_id === exerciseId);
  };

  /**
   * 添加题目到已选列表
   */
  const handleAddQuestion = (exercise: Exercise) => {
    if (isQuestionSelected(exercise.id)) {
      message.warning('该题目已添加');
      return;
    }

    const newQuestion: SelectedQuestion = {
      exercise_id: exercise.id,
      exercise: exercise,
      question_score: 10, // 默认分值
      sort: selectedQuestions.length + 1,
    };

    setSelectedQuestions([...selectedQuestions, newQuestion]);
    message.success('已添加到试卷');
  };

  /**
   * 切换题目选中状态
   */
  const handleToggleQuestion = (exercise: Exercise, checked: boolean) => {
    if (checked) {
      handleAddQuestion(exercise);
    } else {
      handleRemoveQuestion(exercise.id);
    }
  };

  /**
   * 从已选列表移除题目
   */
  const handleRemoveQuestion = (exerciseId: number) => {
    setSelectedQuestions(prev => {
      const newList = prev.filter(q => q.exercise_id !== exerciseId);
      // 重新排序
      return newList.map((q, index) => ({ ...q, sort: index + 1 }));
    });
  };

  /**
   * 修改题目分值
   */
  const handleScoreChange = (exerciseId: number, score: number) => {
    setSelectedQuestions(prev => 
      prev.map(q => q.exercise_id === exerciseId ? { ...q, question_score: score } : q)
    );
  };

  /**
   * 拖拽开始
   */
  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  /**
   * 拖拽结束
   */
  const handleDragEnd = () => {
    setDragIndex(null);
  };

  /**
   * 拖拽放置
   */
  const handleDrop = (targetIndex: number) => {
    if (dragIndex === null || dragIndex === targetIndex) return;

    const newList = [...selectedQuestions];
    const [removed] = newList.splice(dragIndex, 1);
    newList.splice(targetIndex, 0, removed);

    // 重新排序
    setSelectedQuestions(newList.map((q, index) => ({ ...q, sort: index + 1 })));
    setDragIndex(null);
  };

  /**
   * 查看题目详情
   */
  const handleViewDetail = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setDetailModalVisible(true);
  };

  /**
   * 清空已选题目
   */
  const handleClearAll = () => {
    setSelectedQuestions([]);
  };

  /**
   * 保存试卷
   */
  const handleSave = async () => {
    // 表单验证
    if (!paperCode.trim()) {
      message.error('请输入试卷编号');
      return;
    }
    if (!paperName.trim()) {
      message.error('请输入试卷名称');
      return;
    }
    if (selectedQuestions.length === 0) {
      message.error('请至少添加一道题目');
      return;
    }

    setSubmitting(true);
    try {
      // 1. 创建试卷
      const paperResponse = await createExamPaper({
        paper_code: paperCode.trim(),
        paper_name: paperName.trim(),
        total_score: totalScore,
        apply_category_id: applyCategoryId,
        exam_category_id: applyCategoryId,
        is_active: 1,
      });

      if (!paperResponse.success || !paperResponse.data) {
        throw new Error(paperResponse.message || '创建试卷失败');
      }

      const paperId = paperResponse.data.id;

      // 2. 批量添加题目
      const questions = selectedQuestions.map(q => ({
        exercise_id: q.exercise_id,
        question_score: q.question_score,
        sort: q.sort,
      }));

      const questionsResponse = await batchAddQuestionsToPaper(paperId, questions);

      if (questionsResponse.success) {
        message.success(`试卷创建成功！共添加 ${questionsResponse.data?.success || questions.length} 道题目`);
        // 清空表单
        setPaperCode('');
        setPaperName('');
        setApplyCategoryId(0);
        setSelectedQuestions([]);
      } else {
        message.warning('试卷已创建，但部分题目添加失败');
      }
    } catch (error: any) {
      console.error('保存试卷失败:', error);
      message.error(error?.message || '保存失败');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 渲染树节点标题
   */
  const renderTreeTitle = (node: CategoryTreeNode): React.ReactNode => {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span>{node.title}</span>
        <Tag 
          color={node.level === 1 ? 'blue' : node.level === 2 ? 'green' : 'orange'} 
          style={{ fontSize: 10, marginLeft: 4 }}
        >
          {getLevelName(node.level)}
        </Tag>
      </div>
    );
  };

  /**
   * 转换TreeData用于Tree组件
   */
  const convertToAntTreeData = (nodes: CategoryTreeNode[]): any[] => {
    return nodes.map((node) => ({
      key: node.key,
      title: renderTreeTitle(node),
      icon: node.isLeaf ? <FileOutlined /> : undefined,
      children: node.children ? convertToAntTreeData(node.children) : undefined,
    }));
  };

  return (
    <div className="exam-paper-builder">
      {/* 顶部操作栏 */}
      <div className="top-bar">
        <div className="paper-info-row">
          <div className="info-item">
            <span className="label">试卷编号：</span>
            <Input
              placeholder="如 PET202601-001"
              value={paperCode}
              onChange={(e) => setPaperCode(e.target.value)}
              style={{ width: 180 }}
            />
          </div>
          <div className="info-item">
            <span className="label">试卷名称：</span>
            <Input
              placeholder="请输入试卷名称"
              value={paperName}
              onChange={(e) => setPaperName(e.target.value)}
              style={{ width: 240 }}
            />
          </div>
          <div className="info-item">
            <span className="label">适用分类：</span>
            <Select
              placeholder="选择考试分类"
              value={applyCategoryId || undefined}
              onChange={(value) => setApplyCategoryId(value || 0)}
              style={{ width: 180 }}
              loading={examCategoriesLoading}
              allowClear
            >
              {examCategories.map(c => (
                <Option key={c.id} value={c.id}>{c.name}</Option>
              ))}
            </Select>
          </div>
          <div className="total-score-display">
            <span>总分：</span>
            <span className="score-value">{totalScore}</span>
            <span>分</span>
          </div>
          <div className="action-buttons">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
              loading={submitting}
              disabled={selectedQuestions.length === 0}
            >
              保存试卷
            </Button>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="main-content">
        {/* 左侧工作流筛选面板 */}
        <div className="filter-panel">
          <div className="panel-header">
            <FilterOutlined />
            <span>工作流筛选</span>
          </div>
          <div className="panel-content">
            {/* 工作流类型选择 */}
            <div className="filter-section">
              <div className="section-title">工作流类型</div>
              {workflowTypesLoading ? (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Spin size="small" />
                </div>
              ) : workflowTypes.length > 0 ? (
                <Select
                  placeholder="选择工作流类型"
                  value={selectedWorkflowType}
                  onChange={(value) => setSelectedWorkflowType(value)}
                  style={{ width: '100%', marginBottom: 16 }}
                >
                  {workflowTypes.map(wf => (
                    <Option key={wf.value} value={wf.value}>
                      {wf.label}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Empty description="暂无工作流" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </div>

            {/* 难度筛选 */}
            <div className="filter-section">
              <div className="section-title">难度等级</div>
              <Select
                placeholder="全部难度"
                value={selectedDifficulty}
                onChange={(value) => setSelectedDifficulty(value)}
                style={{ width: '100%' }}
                allowClear
              >
                {DIFFICULTY_OPTIONS.map(opt => (
                  <Option key={opt.value} value={opt.value}>
                    <Tag color={opt.color}>{opt.label}</Tag>
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        {/* 中间练习题列表面板 */}
        <div className="exercise-panel">
          <div className="panel-header">
            <div className="header-left">
              <UnorderedListOutlined />
              <span>练习题列表</span>
              {filteredExercises.length > 0 && (
                <Tag color="blue">{filteredExercises.length} 题</Tag>
              )}
            </div>
            <div className="header-actions">
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={() => selectedWorkflowType && fetchExercises(selectedWorkflowType)}
              >
                刷新
              </Button>
            </div>
          </div>

          {/* 搜索栏 */}
          <div className="search-bar">
            <Input.Search
              placeholder="搜索题目标题或内容"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              style={{ width: '100%' }}
            />
          </div>

          <div className="panel-content">
            {exerciseLoading ? (
              <div className="loading-container">
                <Spin tip="加载中..." />
              </div>
            ) : filteredExercises.length > 0 ? (
              <div className="exercise-list">
                {filteredExercises.map((exercise) => {
                  const isSelected = isQuestionSelected(exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className={`exercise-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="item-checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleToggleQuestion(exercise, e.target.checked)}
                        />
                      </div>
                      <div className="item-content">
                        <div className="item-title">
                          <span>{exercise.title}</span>
                          <Tag color={getDifficultyColor(exercise.difficulty)}>
                            {getDifficultyName(exercise.difficulty)}
                          </Tag>
                        </div>
                        <div className="item-preview">{exercise.content}</div>
                        <div className="item-meta">
                          <span>ID: {exercise.id}</span>
                          {exercise.image_url && <span>📷 有图片</span>}
                        </div>
                      </div>
                      <div className="item-actions">
                        <Tooltip title="查看详情">
                          <Button
                            type="text"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(exercise)}
                          />
                        </Tooltip>
                        {!isSelected && (
                          <Tooltip title="添加到试卷">
                            <Button
                              type="text"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => handleAddQuestion(exercise)}
                            />
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : selectedWorkflowType ? (
              <div className="empty-container">
                <Empty description="该工作流下暂无题目" />
              </div>
            ) : (
              <div className="empty-container">
                <FilterOutlined className="empty-icon" />
                <div>请从左侧选择工作流类型查看题目</div>
              </div>
            )}
          </div>

          <div className="panel-footer">
            <div className="selection-info">
              当前工作流：{workflowTypes.find(wf => wf.value === selectedWorkflowType)?.label || '未选择'}
            </div>
          </div>
        </div>

        {/* 右侧已选题目面板 */}
        <div className="selected-panel">
          <div className="panel-header">
            <div className="header-left">
              <CheckSquareOutlined />
              <span>已选题目</span>
              {selectedQuestions.length > 0 && (
                <Tag color="green">{selectedQuestions.length} 题</Tag>
              )}
            </div>
            {selectedQuestions.length > 0 && (
              <Popconfirm
                title="确定要清空所有已选题目吗？"
                onConfirm={handleClearAll}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small" danger>
                  清空
                </Button>
              </Popconfirm>
            )}
          </div>

          <div className="panel-content">
            {selectedQuestions.length > 0 ? (
              <div className="selected-list">
                {selectedQuestions.map((item, index) => (
                  <div
                    key={item.exercise_id}
                    className={`selected-item ${dragIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                  >
                    <div className="drag-handle">
                      <HolderOutlined />
                    </div>
                    <div className="item-index">{index + 1}</div>
                    <div className="item-content">
                      <div className="item-title">{item.exercise.title}</div>
                      <div className="item-meta">
                        <Tag color={getDifficultyColor(item.exercise.difficulty)} style={{ fontSize: 10 }}>
                          {getDifficultyName(item.exercise.difficulty)}
                        </Tag>
                      </div>
                      <div className="score-input">
                        <span className="score-label">分值：</span>
                        <InputNumber
                          min={0}
                          max={100}
                          value={item.question_score}
                          onChange={(value) => handleScoreChange(item.exercise_id, value || 0)}
                          size="small"
                          style={{ width: 70 }}
                        />
                        <span>分</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <Tooltip title="移除">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => handleRemoveQuestion(item.exercise_id)}
                        />
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-selected">
                <CheckSquareOutlined className="empty-icon" />
                <div className="empty-text">暂无已选题目</div>
                <div className="empty-hint">从左侧题目列表中勾选或点击添加</div>
              </div>
            )}
          </div>

          {selectedQuestions.length > 0 && (
            <div className="panel-footer">
              <div className="summary-row">
                <span className="summary-label">题目数量</span>
                <span className="summary-value">{selectedQuestions.length} 题</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">试卷总分</span>
                <span className="summary-value total-score">{totalScore} 分</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 题目详情弹窗 */}
      <Modal
        title="题目详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
          currentExercise && !isQuestionSelected(currentExercise.id) && (
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                if (currentExercise) {
                  handleAddQuestion(currentExercise);
                  setDetailModalVisible(false);
                }
              }}
            >
              添加到试卷
            </Button>
          ),
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
                <span className="item-label">难度：</span>
                <Tag color={getDifficultyColor(currentExercise.difficulty)}>
                  {getDifficultyName(currentExercise.difficulty)}
                </Tag>
              </div>
            </div>

            <div className="detail-section">
              <div className="section-title">题目内容</div>
              <div className="content-box">{currentExercise.content}</div>
            </div>

            {currentExercise.image_url && (
              <div className="detail-section">
                <div className="section-title">题目图片</div>
                <img
                  src={currentExercise.image_url}
                  alt="题目图片"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 4 }}
                />
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default ExamPaperBuilder;
