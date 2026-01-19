/**
 * 话题分类管理 - 模拟数据
 */

import { Category, CategoryFormData, ApiResponse } from './types';

/**
 * 模拟分类数据
 * 包含多级分类结构
 */
const mockCategories: Category[] = [
  {
    id: '1',
    name: '日常口语',
    code: 'DAILY',
    parentId: null,
    parentName: undefined,
    description: '日常生活中常用的口语话题',
    sort: 1,
    level: 1,
    enabled: true,
    createdAt: '2024-01-01 10:00:00',
    updatedAt: '2024-01-15 14:30:00',
    children: [
      {
        id: '1-1',
        name: '问候与介绍',
        code: 'DAILY-GREET',
        parentId: '1',
        parentName: '日常口语',
        description: '基础问候和自我介绍',
        sort: 1,
        level: 2,
        enabled: true,
        createdAt: '2024-01-02 09:00:00',
        updatedAt: '2024-01-10 11:20:00',
        children: [
          {
            id: '1-1-1',
            name: '初次见面',
            code: 'DAILY-GREET-FIRST',
            parentId: '1-1',
            parentName: '问候与介绍',
            description: '初次见面时的问候用语',
            sort: 1,
            level: 3,
            enabled: true,
            createdAt: '2024-01-03 08:00:00',
            updatedAt: '2024-01-05 16:40:00',
          },
          {
            id: '1-1-2',
            name: '日常问候',
            code: 'DAILY-GREET-COMMON',
            parentId: '1-1',
            parentName: '问候与介绍',
            description: '日常生活中的问候用语',
            sort: 2,
            level: 3,
            enabled: true,
            createdAt: '2024-01-03 08:30:00',
            updatedAt: '2024-01-06 10:15:00',
          },
        ],
      },
      {
        id: '1-2',
        name: '购物消费',
        code: 'DAILY-SHOP',
        parentId: '1',
        parentName: '日常口语',
        description: '购物和消费相关话题',
        sort: 2,
        level: 2,
        enabled: true,
        createdAt: '2024-01-02 10:00:00',
        updatedAt: '2024-01-12 09:45:00',
      },
      {
        id: '1-3',
        name: '餐饮美食',
        code: 'DAILY-FOOD',
        parentId: '1',
        parentName: '日常口语',
        description: '餐饮和美食相关话题',
        sort: 3,
        level: 2,
        enabled: true,
        createdAt: '2024-01-02 11:00:00',
        updatedAt: '2024-01-14 13:20:00',
      },
    ],
  },
  {
    id: '2',
    name: '商务英语',
    code: 'BUSINESS',
    parentId: null,
    parentName: undefined,
    description: '商务场景中的英语话题',
    sort: 2,
    level: 1,
    enabled: true,
    createdAt: '2024-01-01 11:00:00',
    updatedAt: '2024-01-16 10:00:00',
    children: [
      {
        id: '2-1',
        name: '商务会议',
        code: 'BUSINESS-MEET',
        parentId: '2',
        parentName: '商务英语',
        description: '商务会议相关话题',
        sort: 1,
        level: 2,
        enabled: true,
        createdAt: '2024-01-04 09:00:00',
        updatedAt: '2024-01-11 14:30:00',
      },
      {
        id: '2-2',
        name: '商务谈判',
        code: 'BUSINESS-NEGO',
        parentId: '2',
        parentName: '商务英语',
        description: '商务谈判相关话题',
        sort: 2,
        level: 2,
        enabled: true,
        createdAt: '2024-01-04 10:00:00',
        updatedAt: '2024-01-13 11:45:00',
      },
      {
        id: '2-3',
        name: '商务邮件',
        code: 'BUSINESS-EMAIL',
        parentId: '2',
        parentName: '商务英语',
        description: '商务邮件写作相关话题',
        sort: 3,
        level: 2,
        enabled: false,
        createdAt: '2024-01-04 11:00:00',
        updatedAt: '2024-01-15 09:30:00',
      },
    ],
  },
  {
    id: '3',
    name: '旅游出行',
    code: 'TRAVEL',
    parentId: null,
    parentName: undefined,
    description: '旅游和出行相关话题',
    sort: 3,
    level: 1,
    enabled: true,
    createdAt: '2024-01-01 12:00:00',
    updatedAt: '2024-01-17 08:20:00',
    children: [
      {
        id: '3-1',
        name: '交通出行',
        code: 'TRAVEL-TRANS',
        parentId: '3',
        parentName: '旅游出行',
        description: '各种交通方式相关话题',
        sort: 1,
        level: 2,
        enabled: true,
        createdAt: '2024-01-05 09:00:00',
        updatedAt: '2024-01-10 16:00:00',
      },
      {
        id: '3-2',
        name: '酒店住宿',
        code: 'TRAVEL-HOTEL',
        parentId: '3',
        parentName: '旅游出行',
        description: '酒店住宿相关话题',
        sort: 2,
        level: 2,
        enabled: true,
        createdAt: '2024-01-05 10:00:00',
        updatedAt: '2024-01-12 11:15:00',
      },
    ],
  },
  {
    id: '4',
    name: '学术英语',
    code: 'ACADEMIC',
    parentId: null,
    parentName: undefined,
    description: '学术场景中的英语话题',
    sort: 4,
    level: 1,
    enabled: false,
    createdAt: '2024-01-01 13:00:00',
    updatedAt: '2024-01-18 15:40:00',
  },
];

// 本地存储的分类数据副本
let categoriesData: Category[] = JSON.parse(JSON.stringify(mockCategories));

/**
 * 生成唯一ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 递归查找分类
 */
const findCategoryById = (categories: Category[], id: string): Category | null => {
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
 * 递归查找父分类
 */
const findParentCategory = (categories: Category[], childId: string): Category | null => {
  for (const category of categories) {
    if (category.children) {
      const found = category.children.find(c => c.id === childId);
      if (found) return category;
      const parent = findParentCategory(category.children, childId);
      if (parent) return parent;
    }
  }
  return null;
};

/**
 * 递归删除分类
 */
const deleteCategoryById = (categories: Category[], id: string): boolean => {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === id) {
      categories.splice(i, 1);
      return true;
    }
    if (categories[i].children) {
      if (deleteCategoryById(categories[i].children!, id)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * 递归添加分类到父节点
 */
const addCategoryToParent = (categories: Category[], parentId: string, newCategory: Category): boolean => {
  for (const category of categories) {
    if (category.id === parentId) {
      if (!category.children) {
        category.children = [];
      }
      category.children.push(newCategory);
      return true;
    }
    if (category.children) {
      if (addCategoryToParent(category.children, parentId, newCategory)) {
        return true;
      }
    }
  }
  return false;
};

/**
 * 模拟API
 */
export const mockApi = {
  /**
   * 获取分类树
   */
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: JSON.parse(JSON.stringify(categoriesData)),
    };
  },

  /**
   * 获取单个分类
   */
  getCategory: async (id: string): Promise<ApiResponse<Category>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const category = findCategoryById(categoriesData, id);
    if (category) {
      return {
        success: true,
        data: JSON.parse(JSON.stringify(category)),
      };
    }
    return {
      success: false,
      message: '分类不存在',
    };
  },

  /**
   * 添加分类
   */
  addCategory: async (formData: CategoryFormData): Promise<ApiResponse<Category>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let level = 1;
    let parentName: string | undefined;
    
    if (formData.parentId) {
      const parent = findCategoryById(categoriesData, formData.parentId);
      if (parent) {
        level = parent.level + 1;
        parentName = parent.name;
      }
    }
    
    const newCategory: Category = {
      id: generateId(),
      name: formData.name,
      code: formData.code,
      parentId: formData.parentId,
      parentName,
      description: formData.description,
      sort: formData.sort,
      level,
      enabled: formData.enabled,
      createdAt: now,
      updatedAt: now,
    };
    
    if (formData.parentId) {
      addCategoryToParent(categoriesData, formData.parentId, newCategory);
    } else {
      categoriesData.push(newCategory);
    }
    
    return {
      success: true,
      data: newCategory,
      message: '添加成功',
    };
  },

  /**
   * 更新分类
   */
  updateCategory: async (id: string, formData: CategoryFormData): Promise<ApiResponse<Category>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const category = findCategoryById(categoriesData, id);
    if (!category) {
      return {
        success: false,
        message: '分类不存在',
      };
    }
    
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 更新分类信息
    category.name = formData.name;
    category.code = formData.code;
    category.description = formData.description;
    category.sort = formData.sort;
    category.enabled = formData.enabled;
    category.updatedAt = now;
    
    // 如果父级ID变化，需要移动节点
    if (formData.parentId !== category.parentId) {
      // 从原位置删除
      deleteCategoryById(categoriesData, id);
      
      // 更新父级信息
      category.parentId = formData.parentId;
      if (formData.parentId) {
        const newParent = findCategoryById(categoriesData, formData.parentId);
        if (newParent) {
          category.level = newParent.level + 1;
          category.parentName = newParent.name;
          addCategoryToParent(categoriesData, formData.parentId, category);
        }
      } else {
        category.level = 1;
        category.parentName = undefined;
        categoriesData.push(category);
      }
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(category)),
      message: '更新成功',
    };
  },

  /**
   * 删除分类
   */
  deleteCategory: async (id: string): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const deleted = deleteCategoryById(categoriesData, id);
    if (deleted) {
      return {
        success: true,
        message: '删除成功',
      };
    }
    return {
      success: false,
      message: '分类不存在',
    };
  },

  /**
   * 批量删除分类
   */
  batchDeleteCategories: async (ids: string[]): Promise<ApiResponse<null>> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let deletedCount = 0;
    for (const id of ids) {
      if (deleteCategoryById(categoriesData, id)) {
        deletedCount++;
      }
    }
    
    return {
      success: true,
      message: `成功删除 ${deletedCount} 个分类`,
    };
  },

  /**
   * 刷新分类数据（重置为初始状态）
   */
  refreshCategories: async (): Promise<ApiResponse<Category[]>> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    categoriesData = JSON.parse(JSON.stringify(mockCategories));
    return {
      success: true,
      data: JSON.parse(JSON.stringify(categoriesData)),
      message: '刷新成功',
    };
  },
};
