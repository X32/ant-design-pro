/**
 * 考试专区页面类型定义
 */

// 考试类型
export type ExamType = 'KET' | 'PET' | 'FCE';

// FAQ数据项
export interface FAQItem {
  question: string;
  answer: string;
}

// SEO配置
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  h1Title: string;
}

// 面包屑导航项
export interface BreadcrumbItemProps {
  title: string;
  path?: string;
  icon?: React.ReactNode;
}

// 考试级别配置
export interface ExamLevelConfig {
  type: ExamType;
  categoryId: number;
  title: string;
  level: string;
  description: string;
  ageRange: string;
  color: string;
  // SEO配置
  seo: SEOConfig;
  // FAQ数据
  faqs: FAQItem[];
  // 子页面SEO配置
  pages: {
    intro: SEOConfig;
    scoring: SEOConfig;
    tips: SEOConfig;
  };
}

// 考试级别配置表
export const EXAM_CONFIGS: Record<ExamType, ExamLevelConfig> = {
  KET: {
    type: 'KET',
    categoryId: 1,
    title: 'KET口语真题模拟考试_AI智能评分_口语魔方SpeakCube',
    level: 'A2',
    description: '适合6-10岁初学者，考察基础日常交流能力。通过口语魔方SpeakCube AI模拟练习，掌握KET口语考试要点，轻松通关！',
    ageRange: '6-10岁',
    color: '#1890ff',
    seo: {
      title: 'KET口语真题模拟考试_AI智能评分_口语魔方SpeakCube',
      description: '2026最新KET口语真题模拟考试 - 口语魔方SpeakCube，AI考官一对一练习，即时评分反馈。覆盖所有KET口语话题，助你轻松通关！免费体验→',
      keywords: ['口语魔方', 'SpeakCube', 'KET口语', 'KET口语考试', 'KET口语真题', 'KET口语模拟', 'A2级别口语', '剑桥KET', 'KET口语练习', 'AI口语评分'],
      h1Title: 'KET口语真题模拟考试 - 口语魔方SpeakCube AI智能评分，轻松通关',
    },
    faqs: [
      {
        question: 'KET口语考试难吗？',
        answer: 'KET口语考试难度适中，主要考察基础交流能力。通过AI模拟练习，熟悉考试流程后，大部分考生都能顺利完成。'
      },
      {
        question: 'KET口语考试多长时间？',
        answer: 'KET口语考试时长约8-10分钟，分为Part 1和Part 2两部分，与另一位考生配对进行。'
      },
      {
        question: '如何快速提升KET口语？',
        answer: '建议每天进行AI模拟练习，熟悉常见话题，积累基础词汇。坚持练习2-3周，口语会有明显提升。'
      },
      {
        question: 'KET口语评分标准是什么？',
        answer: 'KET口语评分分为5个等级（Grade A-E），主要考察语法与词汇、发音、互动交流和整体表现四个维度。'
      },
      {
        question: 'AI口语练习有效吗？',
        answer: 'AI口语练习非常有效。SpeakCube基于真实考试题库，提供即时反馈和针对性建议，能帮助考生快速发现并解决问题。'
      }
    ],
    pages: {
      intro: {
        title: 'KET口语考试介绍_2026年考试流程_口语魔方SpeakCube',
        description: '全面了解KET口语考试 - 口语魔方SpeakCube，包括考试内容、流程、评分标准、适合人群和备考建议。帮助6-10岁考生顺利通过A2级别剑桥英语考试。',
        keywords: ['口语魔方', 'SpeakCube', 'KET口语考试', 'KET考试介绍', 'KET口语流程', '剑桥KET', 'A2级别考试', 'KET考试内容'], 
        h1Title: 'KET口语考试全面介绍 - 口语魔方SpeakCube'
      },
      scoring: {
        title: 'KET口语评分标准详解_满分攻略_口语魔方SpeakCube',
        description: 'KET口语评分标准详解 - 口语魔方SpeakCube，包括语法词汇、发音、互动交流和整体表现四个维度。提供评分细则和提分技巧，助力KET口语高分通关。',
        keywords: ['口语魔方', 'SpeakCube', 'KET口语评分', 'KET评分标准', 'KET口语满分', 'KET口语提分', 'KET考试评分', '剑桥KET评分'], 
        h1Title: 'KET口语评分标准详解 - 口语魔方SpeakCube'
      },
      tips: {
        title: 'KET口语备考攻略_高分技巧_话题汇总_口语魔方SpeakCube',
        description: 'KET口语备考攻略汇总 - 口语魔方SpeakCube，包括10天快速提升计划、常见话题模板、高分技巧和考前注意事项。帮助考生高效备考，轻松获得优秀成绩。',
        keywords: ['口语魔方', 'SpeakCube', 'KET口语备考', 'KET口语技巧', 'KET口语话题', 'KET口语满分', 'KET备考计划', 'KET口语攻略'], 
        h1Title: 'KET口语备考攻略 - 口语魔方SpeakCube 高分技巧汇总'
      }
    }
  },
  PET: {
    type: 'PET',
    categoryId: 2,
    title: 'PET口语真题模拟练习_AI评分系统_SpeakCube',
    level: 'B1',
    description: '适合10-14岁中级学习者，考察独立交流能力。通过口语魔方SpeakCube AI智能评分，即时反馈，助力PET口语高分通过！',
    ageRange: '10-14岁',
    color: '#52c41a',
    seo: {
      title: 'PET口语真题模拟练习_AI评分系统_口语魔方SpeakCube',
      description: '专业PET口语真题模拟练习平台 - 口语魔方SpeakCube，AI智能评估发音、流利度、语法。提供PET口语高频话题、满分模板。免费试用→',
      keywords: ['口语魔方', 'SpeakCube', 'PET口语', 'PET口语考试', 'PET口语练习', 'PET口语评分', 'B1级别口语', '剑桥PET', 'PET口语真题', 'PET口语模拟'],
      h1Title: 'PET口语真题模拟练习 - 口语魔方SpeakCube AI智能评分系统'
    },
    faqs: [
      {
        question: 'PET口语考试和KET有什么区别？',
        answer: 'PET口语考试（B1级别）比KET（A2级别）要求更高，考察更复杂的交流能力和词汇量。考试时长10-12分钟，话题更深入，要求更流利的表达。'
      },
      {
        question: 'PET口语考试评分标准是什么？',
        answer: 'PET口语评分分为5个等级，从语法词汇、话语组织、发音、互动交流和整体表现五个维度进行评估。满分150分，120分以上通过。'
      },
      {
        question: '如何快速提升PET口语？',
        answer: '建议每天进行30分钟AI模拟练习，重点提升流利度和词汇量。通过真题练习熟悉话题，积累高级词汇和表达，坚持4-6周会有明显提升。'
      },
      {
        question: 'PET口语常见话题有哪些？',
        answer: 'PET口语话题包括家庭、学校、兴趣爱好、旅行、工作、未来规划等。建议提前准备这些话题的相关词汇和表达。'
      },
      {
        question: 'AI口语练习适合PET备考吗？',
        answer: '非常适合。AI口语练习可以提供真实的考试模拟环境，即时反馈语法和发音问题，帮助考生快速提升PET口语能力。'
      }
    ],
    pages: {
      intro: {
        title: 'PET口语考试介绍_2026年考试流程_口语魔方SpeakCube',
        description: '全面了解PET口语考试 - 口语魔方SpeakCube，包括考试内容、流程、评分标准、适合人群和备考建议。帮助10-14岁考生顺利通过B1级别剑桥英语考试。',
        keywords: ['口语魔方', 'SpeakCube', 'PET口语考试', 'PET考试介绍', 'PET口语流程', '剑桥PET', 'B1级别考试', 'PET考试内容'],
        h1Title: 'PET口语考试全面介绍 - 口语魔方SpeakCube'
      },
      scoring: {
        title: 'PET口语评分标准详解_高分攻略_口语魔方SpeakCube',
        description: 'PET口语评分标准详解 - 口语魔方SpeakCube，包括语法词汇、话语组织、发音、互动交流和整体表现五个维度。提供评分细则和提分技巧，助力PET口语高分。',
        keywords: ['口语魔方', 'SpeakCube', 'PET口语评分', 'PET评分标准', 'PET口语满分', 'PET口语提分', 'PET考试评分', '剑桥PET评分'],
        h1Title: 'PET口语评分标准详解 - 口语魔方SpeakCube'
      },
      tips: {
        title: 'PET口语备考攻略_高分技巧_话题汇总_口语魔方SpeakCube',
        description: 'PET口语备考攻略汇总 - 口语魔方SpeakCube，包括快速提升计划、常见话题模板、高分技巧和考前注意事项。帮助考生高效备考，获得PET口语优秀成绩。',
        keywords: ['口语魔方', 'SpeakCube', 'PET口语备考', 'PET口语技巧', 'PET口语话题', 'PET口语满分', 'PET备考计划', 'PET口语攻略'],
        h1Title: 'PET口语备考攻略 - 口语魔方SpeakCube 高分技巧汇总'
      }
    }
  },
  FCE: {
    type: 'FCE',
    categoryId: 3,
    title: 'FCE口语模拟考试_AI在线练习_口语魔方SpeakCube',
    level: 'B2',
    description: '适合14岁以上高级学习者，考察复杂场景交流能力。通过口语魔方SpeakCube真题模拟，AI深度评估，挑战FCE口语满分！',
    ageRange: '14岁以上',
    color: '#faad14',
    seo: {
      title: 'FCE口语模拟考试_AI在线练习_口语魔方SpeakCube',
      description: '高级FCE口语模拟考试平台 - 口语魔方SpeakCube，AI深度评估口语能力。提供FCE口语话题库、真题解析、高分策略。立即体验→',
      keywords: ['口语魔方', 'SpeakCube', 'FCE口语', 'FCE口语考试', 'FCE口语模拟', 'FCE口语练习', 'B2级别口语', '剑桥FCE', 'FCE口语真题', 'FCE口语高分'],
      h1Title: 'FCE口语模拟考试 - 口语魔方SpeakCube AI在线练习平台'
    },
    faqs: [
      {
        question: 'FCE口语考试难度如何？',
        answer: 'FCE口语考试（B2级别）属于中高级考试，要求具备复杂场景的交流能力。需要掌握高级词汇、语法结构，并能流畅表达观点。'
      },
      {
        question: 'FCE口语考试和雅思口语有什么区别？',
        answer: 'FCE口语考试时长14分钟，分为4个部分，注重考官与考生的互动交流。雅思口语时长11-14分钟，分为3个部分，话题更广。FCE更适合中学生，雅思适合大学申请。'
      },
      {
        question: '如何获得FCE口语高分？',
        answer: '建议每天进行高级话题练习，积累高级词汇和复杂句型。通过真题模拟熟悉考试形式，提升批判性思维和观点表达能力。'
      },
      {
        question: 'FCE口语评分标准是什么？',
        answer: 'FCE口语评分分为5个等级（Grade A-E），从语法词汇、话语组织、发音、互动交流和整体表现五个维度评估。满分190分，160分以上通过。'
      },
      {
        question: 'AI口语练习能帮助通过FCE考试吗？',
        answer: 'AI口语练习是FCE备考的有效工具。它提供真实的考试模拟环境和即时反馈，帮助考生识别弱点，针对性地提升高级口语能力。'
      }
    ],
    pages: {
      intro: {
        title: 'FCE口语考试介绍_2026年考试流程_口语魔方SpeakCube',
        description: '全面了解FCE口语考试 - 口语魔方SpeakCube，包括考试内容、流程、评分标准、适合人群和备考建议。帮助14岁以上考生顺利通过B2级别剑桥英语考试。',
        keywords: ['口语魔方', 'SpeakCube', 'FCE口语考试', 'FCE考试介绍', 'FCE口语流程', '剑桥FCE', 'B2级别考试', 'FCE考试内容'],
        h1Title: 'FCE口语考试全面介绍 - 口语魔方SpeakCube'
      },
      scoring: {
        title: 'FCE口语评分标准详解_满分攻略_口语魔方SpeakCube',
        description: 'FCE口语评分标准详解 - 口语魔方SpeakCube，包括语法词汇、话语组织、发音、互动交流和整体表现五个维度。提供评分细则和提分技巧，助力FCE口语高分。',
        keywords: ['口语魔方', 'SpeakCube', 'FCE口语评分', 'FCE评分标准', 'FCE口语满分', 'FCE口语提分', 'FCE考试评分', '剑桥FCE评分'],
        h1Title: 'FCE口语评分标准详解 - 口语魔方SpeakCube'
      },
      tips: {
        title: 'FCE口语备考攻略_高分技巧_话题汇总_口语魔方SpeakCube',
        description: 'FCE口语备考攻略汇总 - 口语魔方SpeakCube，包括高级话题练习、复杂表达技巧、观点阐述策略和考前准备。帮助考生高效备考，挑战FCE口语满分。',
        keywords: ['口语魔方', 'SpeakCube', 'FCE口语备考', 'FCE口语技巧', 'FCE口语话题', 'FCE口语满分', 'FCE备考计划', 'FCE口语攻略'],
        h1Title: 'FCE口语备考攻略 - 口语魔方SpeakCube 高分技巧汇总'
      }
    }
  }
};

// 试卷信息（复用现有类型）
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

// 试卷列表响应
export interface PaperListResponse {
  success: boolean;
  data: ExamPaper[];
  total: number;
  message?: string;
}
