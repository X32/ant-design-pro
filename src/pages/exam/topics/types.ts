/**
 * 话题分类管理 - 类型定义
 * 基于 REST API /api/oral 接口设计
 */

/**
 * 口语分类节点接口
 * 对应 API 返回的分类数据结构
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
 * API 响应包装接口
 */
export interface ApiResponse<T> {
  /** 请求是否成功 */
  success: boolean;
  /** 响应数据 */
  data?: T;
  /** 数据总数 */
  total?: number;
  /** 错误消息 */
  message?: string;
}

/**
 * 创建分类请求参数
 */
export interface CreateCategoryParams {
  /** 分类名称 */
  name: string;
  /** 父级分类ID，0表示根分类 */
  parent_id: number;
  /** 排序值 */
  sort: number;
}

/**
 * 更新分类请求参数
 */
export interface UpdateCategoryParams {
  /** 分类名称（可选） */
  name?: string;
  /** 排序值（可选） */
  sort?: number;
}

/**
 * 获取分类列表查询参数
 */
export interface GetCategoriesParams {
  /** 分类层级 1/2/3（可选） */
  level?: number;
  /** 父级分类ID（可选） */
  parent_id?: number;
}

/**
 * 分类表单数据接口
 */
export interface CategoryFormData {
  /** 分类ID（编辑时使用） */
  id?: number;
  /** 分类名称 */
  name: string;
  /** 父级分类ID */
  parent_id: number;
  /** 排序值 */
  sort: number;
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
 * 分类操作类型
 */
export enum CategoryAction {
  /** 添加 */
  ADD = 'add',
  /** 编辑 */
  EDIT = 'edit',
  /** 删除 */
  DELETE = 'delete',
  /** 刷新 */
  REFRESH = 'refresh',
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
