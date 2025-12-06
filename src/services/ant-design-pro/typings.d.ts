// @ts-ignore
/* eslint-disable */

declare namespace API {
  type CurrentUser = {
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
    geographic?: {
      province?: { label?: string; key?: string };
      city?: { label?: string; key?: string };
    };
    address?: string;
    phone?: string;
  };

  type LoginResult = {
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
    username?: string;
    password?: string;
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
}
