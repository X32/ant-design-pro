// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
    id?: number;
    name?: string;
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
}
