// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    id?: number;
    name?: string;
    username?: string;  // 用户名
    avatar?: string;
    userid?: string;
    email?: string;
    signature?: string;
    title?: string;
    group?: string;
    tags?: { key?: string; label?: string }[];
    notifyCount?: number;
    unreadCount?: number;
    country?: string;
    access?: string;
    is_active?: boolean;
    is_superuser?: boolean;
    created_at?: string;
    updated_at?: string;
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type LoginResult = {
    success?: boolean;
    message?: string;
    data?: {
      user?: CurrentUser;
      access_token?: string;
      token_type?: string;
    };
    error?: string;
    // 兼容旧格式
    status?: string;
    type?: string;
    currentAuthority?: string;
  };

  type LogoutResult = {
    success: boolean;
    message: string;
    data: {
      logout_time: string;
      user_id: number;
      note: string;
    };
  };

  type PageParams = {
    current?: number;
    pageSize?: number;
  };

  type RuleListItem = {
    key?: number;
    disabled?: boolean;
    href?: string;
    avatar?: string;
    name?: string;
    owner?: string;
    desc?: string;
    callNo?: number;
    status?: number;
    updatedAt?: string;
    createdAt?: string;
    progress?: number;
  };

  type RuleList = {
    data?: RuleListItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type FakeCaptcha = {
    code?: number;
    status?: string;
  };

  type LoginParams = {
    email?: string;
    password?: string;
    // 兼容旧格式
    username?: string;
    autoLogin?: boolean;
    type?: string;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type NoticeIconList = {
    data?: NoticeIconItem[];
    /** 列表的内容总数 */
    total?: number;
    success?: boolean;
  };

  type NoticeIconItemType = 'notification' | 'message' | 'event';

  type NoticeIconItem = {
    id?: string;
    extra?: string;
    key?: string;
    read?: boolean;
    avatar?: string;
    title?: string;
    status?: string;
    datetime?: string;
    description?: string;
    type?: NoticeIconItemType;
  };

  /** 对话列表项 */
  type ConversationListItem = {
    conversation_id?: number;
    user_id?: number;
    title?: string;
    status?: number;
    create_time?: string;
    update_time?: string;
  };

  /** 对话列表响应 */
  type ConversationList = {
    conversations?: ConversationListItem[];
    /** 列表的内容总数 */
    total?: number;
    page?: number;
    page_size?: number;
  };

  /** 消息内容 */
  type ContentTypeItem = {
    content_id?: number;
    message_id?: number;
    content_type?: string;
    text?: string;
    seq?: number;
  };

  /** 消息 */
  type Message = {
    message_id?: number;
    conversation_id?: number;
    role?: string;
    seq?: number;
    create_time?: string;
    contents?: ContentTypeItem[];
  };

  /** 会话详情响应 */
  type ConversationDetail = {
    conversation?: ConversationListItem;
    messages?: Message[];
  };

  /** 音频上传响应 */
  type AudioUploadResponse = {
    success: boolean;
    message: string;
    task_id: string;
    original_filename: string;
    saved_filename: string;
    file_size: number;
    file_path: string;
    language: string;
  };

  /** 转写结果 */
  type TranscriptionResult = {
    text: string;
    language: string;
    success: boolean;
    error: string | null;
  };

  /** 转写状态响应 */
  type TranscriptionStatusResponse = {
    success: boolean;
    task_id: string;
    status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED';
    result: TranscriptionResult | null;
    error: string | null;
    original_filename: string;
    file_path: string;
  };

  /** 工作流类型选项 */
  type WorkflowTypeOption = {
    id: number;
    label: string;
    value: string;
    price: number;
    description?: string;
    sort: number;
    is_active: number;
    create_time: string;
    update_time: string;
  };

  /** 工作流类型列表响应 */
  type WorkflowTypeListResponse = {
    success: boolean;
    message?: string;
    data: WorkflowTypeOption[];
    total: number;
    page: number;
    page_size: number;
  };

  /** 工作流类型详情响应 */
  type WorkflowTypeDetailResponse = {
    success: boolean;
    message?: string;
    data: WorkflowTypeOption;
  };

  /** 用户反馈项 */
  type FeedbackItem = {
    id: number;
    user_id: number;
    username?: string;
    feedback_type: 'bug' | 'suggestion' | 'question' | 'other';
    title: string;
    content: string;
    contact_info: string | null;
    status: 'pending' | 'processing' | 'resolved' | 'closed';
    admin_reply?: string;
    created_at: string;
    updated_at?: string;
  };

  /** 提交反馈参数 */
  type SubmitFeedbackParams = {
    feedback_type: 'bug' | 'suggestion' | 'question' | 'other';
    title: string;
    content: string;
    contact_info?: string;
  };

  // ==================== 文章系统相关类型 ====================

  /** 文章状态 */
  type ArticleStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published' | 'archived';

  /** 文章类型 */
  type ArticleType = 'study_guide' | 'exam_tips' | 'resource';

  /** 内容块类型 */
  type BlockType = 'text' | 'image' | 'video' | 'code' | 'quote' | 'divider' | 'list';

  /** 列表类型 */
  type ListType = 'ordered' | 'unordered';

  /** 内容块 */
  type ContentBlock = {
    id?: number;
    block_type: BlockType;
    sort_order: number;
    content?: string | null;
    media_url?: string | null;
    media_alt?: string | null;
    caption?: string | null;
    code_language?: string | null;
    list_type?: ListType;
  };

  /** 文章分类 */
  type ArticleCategory = {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    sort_order: number;
    description?: string;
    icon?: string | null;
    article_count: number;
    children?: ArticleCategory[];
  };

  /** 文章标签 */
  type ArticleTag = {
    id: number;
    name: string;
    slug: string;
    color?: string;
    article_count: number;
  };

  /** 文章作者 */
  type ArticleAuthor = {
    id: number;
    username: string;
    avatar?: string;
  };

  /** 文章列表项 */
  type ArticleListItem = {
    id: number;
    title: string;
    summary: string;
    cover_image?: string;
    status: ArticleStatus;
    article_type: ArticleType;
    view_count: number;
    like_count: number;
    comment_count: number;
    published_at?: string;
    keywords?: string;
    meta_description?: string;
    created_at: string;
    updated_at: string;
    author: ArticleAuthor;
    categories: ArticleCategory[];
    tags: ArticleTag[];
    is_liked?: boolean;
  };

  /** 文章详情 */
  type ArticleDetail = ArticleListItem & {
    blocks: ContentBlock[];
  };

  /** 创建文章数据 */
  type ArticleCreateData = {
    title: string;
    summary?: string;
    cover_image?: string;
    article_type?: ArticleType;
    category_ids?: number[];
    tag_ids?: number[];
    blocks?: ContentBlock[];
    keywords?: string;
    meta_description?: string;
  };

  /** 更新文章数据 */
  type ArticleUpdateData = Partial<ArticleCreateData>;
}
