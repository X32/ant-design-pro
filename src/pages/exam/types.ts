/**
 * 试卷管理 - 类型定义
 * 基于 REST API /api/exam 接口设计
 */

/**
 * 试卷接口
 */
export interface ExamPaper {
  id: number;
  paper_code: string;
  paper_name: string;
  total_score: number;
  apply_category_id: number;
  is_active: number;
  create_time?: string;
  update_time?: string;
}

/**
 * 创建试卷请求参数
 */
export interface CreatePaperParams {
  paper_code: string;
  paper_name: string;
  total_score?: number;
  apply_category_id?: number;
  is_active?: number;
}

/**
 * 更新试卷请求参数
 */
export interface UpdatePaperParams {
  paper_name?: string;
  total_score?: number;
  apply_category_id?: number;
  is_active?: number;
}

/**
 * 练习题接口（用于题目选择）
 */
export interface Exercise {
  id: number;
  category_id: number;
  title: string;
  content: string;
  image_url?: string;
  difficulty: number;
  is_active: number;
  create_time?: string;
  update_time?: string;
}

/**
 * 试卷题目关联接口
 */
export interface PaperQuestion {
  id: number;
  paper_id: number;
  exercise_id: number;
  question_score: number;
  sort: number;
  exercise?: Exercise;
  create_time?: string;
  update_time?: string;
}

/**
 * 已选题目（用于前端展示）
 */
export interface SelectedQuestion {
  exercise_id: number;
  exercise: Exercise;
  question_score: number;
  sort: number;
}

/**
 * 分类节点接口
 */
export interface Category {
  id: number;
  name: string;
  parent_id: number;
  level: number;
  sort: number;
  children?: Category[];
  create_time?: string;
  update_time?: string;
}

/**
 * 分类树节点（用于Ant Design Tree组件）
 */
export interface CategoryTreeNode {
  key: number;
  title: string;
  parentId: number;
  level: number;
  sort: number;
  children?: CategoryTreeNode[];
  isLeaf?: boolean;
}

/**
 * 难度等级配置
 */
export const DIFFICULTY_OPTIONS = [
  { value: 1, label: '入门', color: 'green' },
  { value: 2, label: '简单', color: 'cyan' },
  { value: 3, label: '中等', color: 'blue' },
  { value: 4, label: '困难', color: 'orange' },
  { value: 5, label: '专家', color: 'red' },
];

/**
 * 获取难度名称
 */
export const getDifficultyName = (difficulty: number): string => {
  const option = DIFFICULTY_OPTIONS.find(opt => opt.value === difficulty);
  return option ? option.label : '未知';
};

/**
 * 获取难度颜色
 */
export const getDifficultyColor = (difficulty: number): string => {
  const option = DIFFICULTY_OPTIONS.find(opt => opt.value === difficulty);
  return option ? option.color : 'default';
};

/**
 * 获取层级名称
 */
export const getLevelName = (level: number): string => {
  switch (level) {
    case 1:
      return '口语等级';
    case 2:
      return '话题';
    case 3:
      return '题型部分';
    default:
      return '未知层级';
  }
};

/**
 * 试卷表单数据
 */
export interface PaperFormData {
  paper_code: string;
  paper_name: string;
  total_score: number;
  apply_category_id: number;
  is_active: number;
}
