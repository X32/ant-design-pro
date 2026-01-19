/**
 * 练习题管理 - 类型定义
 * 基于 REST API /api/oral 接口设计
 */

/**
 * 口语分类节点接口（复用 topics 模块）
 */
export interface Category {
  /** 分类ID */
  id: number;
  /** 分类名称 */
  name: string;
  /** 父级分类ID，0表示根分类 */
  parent_id: number;
  /** 分类层级：1-口语等级，2-话题，3-题型部分 */
  level: number;
  /** 排序值 */
  sort: number;
  /** 子分类列表 */
  children?: Category[];
  /** 创建时间 */
  create_time?: string;
  /** 更新时间 */
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
 * 练习题接口
 * 对应 API 返回的练习题数据结构
 */
export interface Exercise {
  /** 练习题ID */
  id: number;
  /** 所属分类ID */
  category_id: number;
  /** 题目标题 */
  title: string;
  /** 题目内容/问题 */
  content: string;
  /** 图片URL */
  image_url?: string;
  /** 工作流类型 */
  workflow_type?: string;
  /** 难度等级 1-5 */
  difficulty: number;
  /** 是否启用：1-启用，0-禁用 */
  is_active: number;
  /** 创建时间 */
  create_time?: string;
  /** 更新时间 */
  update_time?: string;
}

/**
 * 练习题类型枚举
 */
export enum ExerciseType {
  /** 问答题 */
  QUESTION = 'question',
  /** 对话题 */
  DIALOGUE = 'dialogue',
  /** 描述题 */
  DESCRIPTION = 'description',
}

/**
 * 获取题目类型名称
 */
export const getExerciseTypeName = (type: ExerciseType | string): string => {
  switch (type) {
    case ExerciseType.QUESTION:
      return '问答题';
    case ExerciseType.DIALOGUE:
      return '对话题';
    case ExerciseType.DESCRIPTION:
      return '描述题';
    default:
      return '未知类型';
  }
};

/**
 * 难度等级名称
 */
export const getDifficultyName = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return '入门';
    case 2:
      return '简单';
    case 3:
      return '中等';
    case 4:
      return '困难';
    case 5:
      return '专家';
    default:
      return '未知';
  }
};

/**
 * 难度等级颜色
 */
export const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case 1:
      return 'green';
    case 2:
      return 'cyan';
    case 3:
      return 'blue';
    case 4:
      return 'orange';
    case 5:
      return 'red';
    default:
      return 'default';
  }
};

/**
 * 创建练习题请求参数
 */
export interface CreateExerciseParams {
  /** 所属分类ID（三级分类） */
  category_id: number;
  /** 题目标题 */
  title: string;
  /** 题目内容 */
  content: string;
  /** 图片URL */
  image_url?: string;
  /** 工作流类型 */
  workflow_type?: string;
  /** 难度等级 */
  difficulty?: number;
  /** 是否启用 */
  is_active?: number;
}

/**
 * 更新练习题请求参数
 * PUT /api/oral/exercises/{exercise_id}
 */
export interface UpdateExerciseParams {
  /** 所属分类ID */
  category_id?: number;
  /** 题目标题 */
  title?: string;
  /** 题目内容 */
  content?: string;
  /** 图片URL */
  image_url?: string;
  /** 工作流类型 */
  workflow_type?: string;
  /** 难度等级 */
  difficulty?: number;
  /** 是否启用 */
  is_active?: number;
}

/**
 * 获取练习题列表查询参数
 * GET /api/oral/exercises
 */
export interface GetExercisesParams {
  /** 分类ID（必填，三级分类ID） */
  category_id: number;
  /** 是否仅返回启用题目，默认 true */
  only_active?: boolean;
}

/**
 * 搜索练习题查询参数
 * GET /api/oral/exercises/search
 */
export interface SearchExercisesParams {
  /** 标题关键词（必填），支持模糊搜索 */
  title: string;
  /** 分类ID（可选），限定在某分类下搜索 */
  category_id?: number;
  /** 工作流类型（可选） */
  workflow_type?: string;
  /** 是否仅返回启用题目，默认 true */
  only_active?: boolean;
  /** 页码，默认 1 */
  page?: number;
  /** 每页数量，默认 20，最大 100 */
  page_size?: number;
}

/**
 * 练习题列表响应
 */
export interface ExerciseListResponse {
  /** 请求是否成功 */
  success: boolean;
  /** 响应消息 */
  message?: string;
  /** 练习题列表 */
  data: Exercise[];
  /** 总数 */
  total: number;
}

/**
 * 练习题表单数据
 */
export interface ExerciseFormData {
  /** 练习题ID（编辑时使用） */
  id?: number;
  /** 所属分类ID */
  category_id: number;
  /** 题目标题 */
  title: string;
  /** 题目内容 */
  content: string;
  /** 图片URL */
  image_url?: string;
  /** 工作流类型 */
  workflow_type?: string;
  /** 难度等级 */
  difficulty: number;
  /** 是否启用 */
  is_active: number;
}

/**
 * 分类层级枚举
 */
export enum CategoryLevel {
  /** 口语等级（如 PET 口语、雅思口语） */
  ORAL_LEVEL = 1,
  /** 话题（如 旅游、逛街） */
  TOPIC = 2,
  /** 题型部分（如 part1、part2） */
  PART = 3,
}

/**
 * 获取层级名称
 */
export const getLevelName = (level: number): string => {
  switch (level) {
    case CategoryLevel.ORAL_LEVEL:
      return '口语等级';
    case CategoryLevel.TOPIC:
      return '话题';
    case CategoryLevel.PART:
      return '题型部分';
    default:
      return '未知层级';
  }
};

/**
 * 工作流类型选项
 */
export const WORKFLOW_TYPE_OPTIONS = [
  { label: 'FCE Part1', value: 'fce_part1' },
  { label: 'FCE Part2', value: 'fce_part2' },
  { label: 'FCE Part3', value: 'fce_part3' },
  { label: 'FCE Part4', value: 'fce_part4' },
  { label: 'PET Part1', value: 'pet_part1' },
  { label: 'PET Part2', value: 'pet_part2' },
  { label: 'IELTS Part1', value: 'ielts_part1' },
  { label: 'IELTS Part2', value: 'ielts_part2' },
  { label: 'IELTS Part3', value: 'ielts_part3' },
];

/**
 * 获取工作流类型名称
 * @param type 工作流类型值
 * @param options 工作流类型选项列表（可选，用于动态获取的选项）
 */
export const getWorkflowTypeName = (
  type?: string, 
  options?: Array<{ label: string; value: string }>
): string => {
  if (!type) return '-';
  
  // 如果提供了选项列表，从中查找
  if (options && options.length > 0) {
    const option = options.find(opt => opt.value === type);
    return option ? option.label : type;
  }
  
  // 兼容旧的固定选项（备用方案）
  const option = WORKFLOW_TYPE_OPTIONS.find(opt => opt.value === type);
  return option ? option.label : type;
};
