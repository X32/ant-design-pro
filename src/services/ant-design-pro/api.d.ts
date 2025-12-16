/** 获取当前的用户 GET /api/currentUser */
export declare function currentUser(options?: {
    [key: string]: any;
}): Promise<{
    data: API.CurrentUser;
}>;
/** 退出登录接口 POST /api/login/outLogin */
export declare function outLogin(options?: {
    [key: string]: any;
}): Promise<Record<string, any>>;
/** 登录接口 POST /api/login/account */
export declare function login(body: API.LoginParams, options?: {
    [key: string]: any;
}): Promise<API.LoginResult>;
/** 此处后端没有提供注释 GET /api/notices */
export declare function getNotices(options?: {
    [key: string]: any;
}): Promise<API.NoticeIconList>;
/** 获取规则列表 GET /api/rule */
export declare function rule(params: {
    /** 当前的页码 */
    current?: number;
    /** 页面的容量 */
    pageSize?: number;
}, options?: {
    [key: string]: any;
}): Promise<API.RuleList>;
/** 更新规则 PUT /api/rule */
export declare function updateRule(options?: {
    [key: string]: any;
}): Promise<API.RuleListItem>;
/** 新建规则 POST /api/rule */
export declare function addRule(options?: {
    [key: string]: any;
}): Promise<API.RuleListItem>;
/** 删除规则 DELETE /api/rule */
export declare function removeRule(options?: {
    [key: string]: any;
}): Promise<Record<string, any>>;
/** 获取对话列表 GET /api/v1/conversations/list */
export declare function getConversationList(params: {
    /** 用户ID */
    user_id: number;
}, options?: {
    [key: string]: any;
}): Promise<API.ConversationList>;
/** 获取会话详情 GET /conversations/{conversation_id} */
export declare function getConversationDetail(params: {
    /** 会话ID */
    conversation_id: number;
    /** 用户ID */
    user_id: number;
}, options?: {
    [key: string]: any;
}): Promise<API.ConversationDetail>;
/** 删除消息 DELETE /conversations/messages/{message_id} */
export declare function deleteMessage(params: {
    /** 消息ID */
    message_id: number;
    /** 用户ID */
    user_id: number;
}, options?: {
    [key: string]: any;
}): Promise<void>;
/** 创建消息 POST /conversations/{conversation_id}/messages */
export declare function createMessage(params: {
    /** 会话ID */
    conversation_id: number;
    /** 用户ID */
    user_id: number;
}, body: {
    /** 消息角色 */
    role: 'user' | 'assistant' | 'examiner';
    /** 消息序号 */
    seq: number;
    /** 消息内容列表 */
    contents: Array<{
        /** 内容类型 */
        content_type: string;
        /** 文本内容 */
        text: string;
        /** 内容序号 */
        seq: number;
    }>;
}, options?: {
    [key: string]: any;
}): Promise<any>;
