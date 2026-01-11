/**
 * 考试目录相关类型定义
 */

// 考试分类
export interface ExamCategory {
  id: number;
  name: string;
  description?: string;
  sort: number;
  is_active: number;
  create_time: string;
  update_time: string;
}

// 试卷信息
export interface ExamPaper {
  id: number;
  paper_code: string;
  paper_name: string;
  total_score: number;
  apply_category_id: number;
  exam_category_id: number;
  is_active: number;
  create_time: string;
  update_time: string;
}

// 练习题详情（嵌套在试卷题目中）
export interface Exercise {
  id: number;
  category_id: number;
  title: string;
  content: string;
  image_url?: string;
  workflow_type: string;
  difficulty: number;
  is_active: number;
}

// 试卷题目
export interface ExamPaperQuestion {
  id: number;
  paper_id: number;
  exercise_id: number;
  question_score: number;
  sort: number;
  workflow_type: string;
  exercise: Exercise;
  create_time: string;
  update_time: string;
}

// 扩展的分类（包含试卷列表）
export interface ExamCategoryWithPapers extends ExamCategory {
  papers?: ExamPaper[];
  loading?: boolean;
  expanded?: boolean;
}

// 扩展的试卷（包含题目列表）
export interface ExamPaperWithQuestions extends ExamPaper {
  questions?: ExamPaperQuestion[];
  loading?: boolean;
  expanded?: boolean;
}
