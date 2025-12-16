import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// 导入React及相关Hook
import React, { useState, useEffect, useCallback } from 'react';
// 导入Ant Design组件
import { Input, Select, DatePicker, Button, Pagination, Space, Modal, Form, message, Popconfirm } from 'antd';
// 导入Ant Design图标
import { SearchOutlined, ReloadOutlined, ExportOutlined, DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
// 导入类型定义
import { SessionStatus, MessageRole, MessageType } from './types';
// 导入模拟数据API
import { mockApi } from './mockData';
// 导入API服务
import { getConversationList, getConversationDetail, deleteMessage } from '@/services/ant-design-pro/api';
// 导入样式文件
import './index.less';
// 解构常用组件
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
/**
 * 消息管理组件
 * 提供会话、消息和消息内容的管理功能
 */
const MessagesManagement = () => {
    // 搜索和筛选参数
    const [searchParams, setSearchParams] = useState({});
    const [filterParams, setFilterParams] = useState({});
    // 分页参数
    const [sessionPagination, setSessionPagination] = useState({ page: 1, pageSize: 10 });
    const [messagePagination, setMessagePagination] = useState({ page: 1, pageSize: 10 });
    // 数据状态
    const [sessions, setSessions] = useState([]); // 会话列表
    const [messages, setMessages] = useState([]); // 消息列表
    const [messageContents, setMessageContents] = useState([]); // 消息内容列表
    const [totalSessions, setTotalSessions] = useState(0); // 会话总数
    const [totalMessages, setTotalMessages] = useState(0); // 消息总数
    // 加载状态使用 ref 避免依赖项变化
    const isFetchingSessionsRef = React.useRef(false); // 会话列表加载状态
    const isFetchingMessagesRef = React.useRef(false); // 消息列表加载状态
    // 选中状态
    const [selectedSession, setSelectedSession] = useState(null); // 当前选中的会话
    const [selectedMessage, setSelectedMessage] = useState(null); // 当前选中的消息
    // 模态框状态
    const [contentModalVisible, setContentModalVisible] = useState(false); // 内容编辑模态框显示状态
    const [editingContent, setEditingContent] = useState(null); // 正在编辑的内容
    // 表单实例
    const [contentForm] = Form.useForm(); // 内容编辑表单实例
    /**
     * 获取会话列表
     * 1. 调用API获取真实数据
     * 2. 数据转换为组件所需格式
     * 3. API失败时回退到模拟数据
     */
    const fetchSessions = useCallback(async () => {
        // 防止重复调用
        if (isFetchingSessionsRef.current)
            return;
        isFetchingSessionsRef.current = true;
        try {
            // 使用新的接口获取对话列表
            const response = await getConversationList({ user_id: 1 });
            // 根据实际接口返回格式处理数据
            if (response.conversations) {
                // 将API返回的数据转换为组件所需的Session类型
                const convertedSessions = response.conversations.map(item => ({
                    id: item.conversation_id?.toString() ?? '',
                    userId: item.user_id?.toString() ?? '1',
                    title: item.title || '未命名对话',
                    messageCount: 0, // 接口返回数据中没有消息数字段
                    updatedAt: item.update_time || new Date().toISOString(),
                    status: item.status === 1 ? SessionStatus.ACTIVE : SessionStatus.DELETED
                }));
                setSessions(convertedSessions);
                setTotalSessions(response.total || convertedSessions.length);
                // 只在成功时显示提示
                message.success('获取对话列表成功');
            }
            else {
                throw new Error('API返回数据格式错误');
            }
        }
        catch (error) {
            console.error('获取对话列表失败:', error);
            // 失败时可以回退到模拟数据
            try {
                const { data, total } = await mockApi.getSessions({
                    search: searchParams.sessionTitle || searchParams.userId,
                    filter: {
                        status: filterParams.status,
                        startDate: filterParams.startDate,
                        endDate: filterParams.endDate
                    },
                    page: sessionPagination.page,
                    pageSize: sessionPagination.pageSize
                });
                setSessions(data);
                setTotalSessions(total);
            }
            catch (mockError) {
                console.error('回退到模拟数据也失败:', mockError);
                // 只有当模拟数据也失败时才显示错误提示
                message.error('获取对话列表失败');
            }
        }
        finally {
            isFetchingSessionsRef.current = false;
        }
    }, [searchParams, filterParams, sessionPagination]);
    /**
     * 获取消息列表
     * 1. 根据会话ID调用API获取消息数据
     * 2. 数据转换为组件所需格式，包括消息内容
     * 3. API失败时回退到模拟数据
     */
    const fetchMessages = useCallback(async (sessionId) => {
        // 防止重复调用
        if (isFetchingMessagesRef.current)
            return;
        // 验证sessionId是否为有效数字
        const conversationId = parseInt(sessionId);
        if (isNaN(conversationId)) {
            console.error('无效的会话ID:', sessionId);
            isFetchingMessagesRef.current = false;
            return;
        }
        isFetchingMessagesRef.current = true;
        try {
            // 使用新的接口获取会话详情和消息列表
            const response = await getConversationDetail({
                conversation_id: conversationId,
                user_id: 1
            });
            // 根据实际接口返回格式处理数据
            if (response.messages) {
                // 将API返回的数据转换为组件所需的Message类型
                const convertedMessages = response.messages.map(item => ({
                    id: item.message_id?.toString() ?? '',
                    sessionId: item.conversation_id?.toString() ?? '',
                    role: (item.role || 'user'),
                    sequence: item.seq ?? 0,
                    type: MessageType.TEXT, // 默认类型为文本
                    preview: item.contents?.[0]?.text?.substring(0, 100) || '', // 取第一条内容的前100个字符作为预览
                    createdAt: item.create_time || new Date().toISOString(),
                    contents: item.contents?.map(content => ({
                        id: content.content_id?.toString() ?? '',
                        messageId: content.message_id?.toString() ?? '',
                        type: (content.content_type || 'text'),
                        content: content.text || '',
                        sequence: content.seq ?? 0,
                        createdAt: item.create_time || new Date().toISOString() // 使用消息的创建时间作为内容的创建时间
                    })) || [] // 新增：消息内容列表
                }));
                setMessages(convertedMessages);
                setTotalMessages(convertedMessages.length);
                // 如果没有选中消息，默认选中第一个
                // 注意：这里不能依赖selectedMessage，否则会导致循环调用
                if (convertedMessages.length > 0) {
                    setSelectedMessage(prev => prev || convertedMessages[0]);
                }
                // 只在成功时显示提示
                message.success('获取消息列表成功');
            }
            else {
                throw new Error('API返回数据格式错误');
            }
        }
        catch (error) {
            console.error('获取消息列表失败:', error);
            // 失败时可以回退到模拟数据
            try {
                const { data, total } = await mockApi.getMessages(sessionId, {
                    search: searchParams.messageContent,
                    filter: {
                        role: filterParams.role
                    },
                    page: messagePagination.page,
                    pageSize: messagePagination.pageSize
                });
                setMessages(data);
                setTotalMessages(total);
                if (!selectedMessage && data.length > 0) {
                    setSelectedMessage(data[0]);
                }
            }
            catch (mockError) {
                console.error('回退到模拟数据也失败:', mockError);
                // 只有当模拟数据也失败时才显示错误提示
                message.error('获取消息列表失败');
            }
        }
        finally {
            isFetchingMessagesRef.current = false;
        }
    }, [searchParams, filterParams, messagePagination]); // 移除selectedMessage依赖，避免循环调用
    /**
     * 获取消息内容
     * 1. 从已获取的消息状态中查找对应消息
     * 2. 提取消息内容列表
     * 3. 失败时尝试使用模拟数据
     */
    const fetchMessageContents = useCallback(async (messageId) => {
        try {
            // 找到选中的消息
            const selectedMessageItem = messages.find(message => message.id === messageId);
            if (selectedMessageItem) {
                // 直接从messages状态中获取消息内容，不需要再次调用API
                setMessageContents(selectedMessageItem.contents || []);
                message.success('获取消息内容成功');
            }
            else {
                setMessageContents([]);
            }
        }
        catch (error) {
            console.error('获取消息内容失败:', error);
            message.error('获取消息内容失败');
            // 失败时可以回退到模拟数据
            try {
                const contents = await mockApi.getMessageContents(messageId);
                setMessageContents(contents);
            }
            catch (mockError) {
                console.error('回退到模拟数据也失败:', mockError);
            }
        }
    }, [messages]);
    // 初始化数据
    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]); // 只在fetchSessions函数变化时调用
    // 使用ref来跟踪上一个会话ID，避免不必要的重复调用
    const prevSessionIdRef = React.useRef(null);
    /**
     * 会话选中变化处理
     * 1. 检测会话ID是否真正变化
     * 2. 重置消息分页
     * 3. 获取新会话的消息列表
     * 4. 会话为空时清空相关状态
     */
    useEffect(() => {
        if (selectedSession && selectedSession.id && !isNaN(Number(selectedSession.id))) {
            // 只有当会话ID真正变化时才调用fetchMessages
            if (selectedSession.id !== prevSessionIdRef.current) {
                setMessagePagination({ page: 1, pageSize: 10 });
                fetchMessages(selectedSession.id);
                prevSessionIdRef.current = selectedSession.id;
            }
        }
        else {
            setMessages([]);
            setTotalMessages(0);
            setSelectedMessage(null);
            setMessageContents([]);
            prevSessionIdRef.current = null;
        }
    }, [selectedSession, fetchMessages]);
    /**
     * 会话列表变化处理
     * 当没有选中会话时，自动选中第一个会话
     */
    useEffect(() => {
        if (sessions.length > 0 && !selectedSession) {
            setSelectedSession(sessions[0]);
        }
    }, [sessions, selectedSession]);
    /**
     * 消息选中变化处理
     * 根据选中的消息获取对应的消息内容
     */
    useEffect(() => {
        if (selectedMessage) {
            fetchMessageContents(selectedMessage.id);
        }
        else {
            setMessageContents([]);
        }
    }, [selectedMessage, fetchMessageContents]);
    /**
     * 搜索参数处理
     * 更新搜索参数并重置分页
     */
    const handleSearch = (field, value) => {
        setSearchParams(prev => ({ ...prev, [field]: value }));
        setSessionPagination({ page: 1, pageSize: 10 });
        setMessagePagination({ page: 1, pageSize: 10 });
    };
    /**
     * 筛选参数处理
     * 更新筛选参数并重置分页
     */
    const handleFilter = (field, value) => {
        setFilterParams(prev => ({ ...prev, [field]: value }));
        setSessionPagination({ page: 1, pageSize: 10 });
        setMessagePagination({ page: 1, pageSize: 10 });
    };
    /**
     * 日期范围筛选处理
     * 更新日期范围筛选参数并重置会话分页
     */
    const handleDateRangeChange = (dates, dateStrings) => {
        setFilterParams(prev => ({
            ...prev,
            startDate: dateStrings[0],
            endDate: dateStrings[1]
        }));
        setSessionPagination({ page: 1, pageSize: 10 });
    };
    /**
     * 重置搜索和筛选
     * 清空所有搜索筛选参数和相关状态
     */
    const handleReset = () => {
        setSearchParams({});
        setFilterParams({});
        setSessionPagination({ page: 1, pageSize: 10 });
        setMessagePagination({ page: 1, pageSize: 10 });
        setSelectedSession(null);
        setSelectedMessage(null);
        setMessageContents([]);
    };
    /**
     * 导出数据
     * 提示功能开发中
     */
    const handleExport = () => {
        message.success('导出功能开发中...');
    };
    /**
     * 删除会话
     * 1. 调用API删除指定会话
     * 2. 刷新会话列表
     * 3. 如果删除当前选中会话，清除选中状态
     */
    const handleDeleteSession = async (sessionId) => {
        try {
            await mockApi.deleteSession(sessionId);
            message.success('会话删除成功');
            fetchSessions();
            // 如果删除的是当前选中的会话，清除选中状态
            if (selectedSession?.id === sessionId) {
                setSelectedSession(null);
            }
        }
        catch (error) {
            message.error('删除会话失败');
        }
    };
    /**
     * 删除消息内容
     * 1. 调用API删除指定内容
     * 2. 刷新当前选中消息的内容列表
     */
    const handleDeleteContent = async (contentId) => {
        try {
            await mockApi.deleteMessageContent(contentId);
            message.success('内容删除成功');
            if (selectedMessage) {
                fetchMessageContents(selectedMessage.id);
            }
        }
        catch (error) {
            message.error('删除内容失败');
        }
    };
    /**
     * 删除消息
     * 1. 调用API删除指定消息
     * 2. 刷新当前会话的消息列表
     * 3. 清除选中的消息状态
     */
    const handleDeleteMessage = async (messageId) => {
        try {
            await deleteMessage({
                message_id: parseInt(messageId),
                user_id: 1, // 这里假设用户ID为1，实际应该从登录状态获取
            });
            message.success('消息删除成功');
            // 刷新消息列表
            if (selectedSession) {
                fetchMessages(selectedSession.id);
            }
            // 清除选中的消息
            setSelectedMessage(null);
        }
        catch (error) {
            message.error('删除消息失败');
        }
    };
    /**
     * 打开添加内容模态框
     * 1. 检查是否已选择消息
     * 2. 重置编辑状态和表单
     * 3. 显示模态框
     */
    const handleAddContent = () => {
        if (!selectedMessage) {
            message.warning('请先选择一条消息');
            return;
        }
        setEditingContent(null);
        contentForm.resetFields();
        setContentModalVisible(true);
    };
    /**
     * 打开编辑内容模态框
     * 1. 设置编辑内容
     * 2. 填充表单数据
     * 3. 显示模态框
     */
    const handleEditContent = (content) => {
        setEditingContent(content);
        contentForm.setFieldsValue(content);
        setContentModalVisible(true);
    };
    /**
     * 保存内容
     * 1. 验证表单
     * 2. 根据模式选择更新或添加内容
     * 3. 关闭模态框并刷新内容列表
     */
    const handleSaveContent = async () => {
        try {
            const values = await contentForm.validateFields();
            if (editingContent) {
                // 编辑模式
                await mockApi.updateMessageContent(editingContent.id, values);
                message.success('内容更新成功');
            }
            else {
                // 添加模式
                if (!selectedMessage)
                    return;
                await mockApi.addMessageContent(selectedMessage.id, values);
                message.success('内容添加成功');
            }
            setContentModalVisible(false);
            if (selectedMessage) {
                fetchMessageContents(selectedMessage.id);
            }
        }
        catch (error) {
            message.error('保存内容失败');
        }
    };
    /**
     * 会话列表列配置
     */
    const sessionColumns = [
        {
            title: '会话 ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            ellipsis: true,
            render: (text) => _jsx("span", { className: "session-id", children: text })
        },
        {
            title: '用户 ID',
            dataIndex: 'userId',
            key: 'userId',
            width: 100,
            ellipsis: true,
            render: (text) => _jsx("span", { className: "user-id", children: text })
        },
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            flex: 1,
            ellipsis: true,
            render: (text) => _jsx("span", { className: "session-title", children: text })
        },
        {
            title: '消息数',
            dataIndex: 'messageCount',
            key: 'messageCount',
            width: 80,
            align: 'center',
            render: (count) => _jsx("span", { className: "message-count", children: count })
        },
        {
            title: '更新时间',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            width: 140,
            ellipsis: true,
            render: (text) => _jsx("span", { className: "update-time", children: new Date(text).toLocaleString() })
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            align: 'center',
            render: (status) => (_jsx("span", { className: `session-status ${status === SessionStatus.ACTIVE ? 'status-active' : 'status-deleted'}`, children: status === SessionStatus.ACTIVE ? '有效' : '已删除' }))
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (_jsxs(Space, { size: "small", children: [_jsx(Button, { type: "text", icon: _jsx(EyeOutlined, {}), size: "small", onClick: () => setSelectedSession(record), children: "\u67E5\u770B" }), _jsx(Button, { type: "text", icon: _jsx(EditOutlined, {}), size: "small", children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u4F1A\u8BDD\u5417\uFF1F666", onConfirm: () => handleDeleteSession(record.id), okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsx(Button, { type: "text", danger: true, icon: _jsx(DeleteOutlined, {}), size: "small", children: "\u5220\u9664" }) })] }))
        }
    ];
    /**
     * 消息列表列配置
     */
    const messageColumns = [
        {
            title: '消息 ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            ellipsis: true,
            render: (text) => _jsx("span", { className: "message-id", children: text })
        },
        {
            title: '角色',
            dataIndex: 'role',
            key: 'role',
            width: 80,
            align: 'center',
            render: (role) => {
                let className = 'role-tag';
                let text = '';
                switch (role) {
                    case MessageRole.USER:
                        className += ' role-user';
                        text = '用户';
                        break;
                    case MessageRole.ASSISTANT:
                        className += ' role-assistant';
                        text = '助手';
                        break;
                    case MessageRole.SYSTEM:
                        className += ' role-system';
                        text = '系统';
                        break;
                }
                return _jsx("span", { className: className, children: text });
            }
        },
        {
            title: '序号',
            dataIndex: 'sequence',
            key: 'sequence',
            width: 60,
            align: 'center',
            render: (seq) => _jsxs("span", { className: "sequence-number", children: ["#", seq] })
        },
        {
            title: '内容预览',
            dataIndex: 'preview',
            key: 'preview',
            flex: 1,
            ellipsis: {
                showTitle: true
            },
            render: (text, record) => (_jsxs("div", { className: "message-preview", children: [record.type === MessageType.IMAGE && (_jsx("img", { src: "https://via.placeholder.com/60x40", alt: "\u9884\u89C8", className: "image-preview" })), text] }))
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 80,
            align: 'center',
            render: (type) => (_jsx("span", { className: "message-type", children: type === MessageType.TEXT ? '文本' :
                    type === MessageType.IMAGE ? '图片' :
                        type === MessageType.AUDIO ? '音频' : '视频' }))
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            ellipsis: true,
            render: (text) => _jsx("span", { className: "create-time", children: new Date(text).toLocaleString() })
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            align: 'center',
            render: (_, record) => (_jsxs(Space, { size: "small", children: [_jsx(Button, { type: "text", icon: _jsx(EyeOutlined, {}), size: "small", onClick: () => setSelectedMessage(record), children: "\u67E5\u770B" }), _jsx(Button, { type: "text", icon: _jsx(EditOutlined, {}), size: "small", children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u6761\u6D88\u606F\u5417\uFF1F88", onConfirm: () => handleDeleteMessage(record.id), okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsx(Button, { type: "text", danger: true, icon: _jsx(DeleteOutlined, {}), size: "small", children: "\u5220\u9664" }) })] }))
        }
    ];
    // 渲染组件UI
    return (_jsxs("div", { className: "messages-management", children: [_jsx("div", { className: "top-bar", children: _jsxs("div", { className: "search-filter-row", children: [_jsxs("div", { className: "search-group", children: [_jsx(Input, { placeholder: "\u641C\u7D22\u4F1A\u8BDD\u6807\u9898", prefix: _jsx(SearchOutlined, {}), value: searchParams.sessionTitle || '', onChange: (e) => handleSearch('sessionTitle', e.target.value), style: { width: 200 } }), _jsx(Input, { placeholder: "\u641C\u7D22\u6D88\u606F\u5185\u5BB9", prefix: _jsx(SearchOutlined, {}), value: searchParams.messageContent || '', onChange: (e) => handleSearch('messageContent', e.target.value), style: { width: 200 } }), _jsx(Input, { placeholder: "\u641C\u7D22\u7528\u6237 ID", prefix: _jsx(SearchOutlined, {}), value: searchParams.userId || '', onChange: (e) => handleSearch('userId', e.target.value), style: { width: 150 } })] }), _jsxs("div", { className: "filter-group", children: [_jsxs(Select, { placeholder: "\u9009\u62E9\u72B6\u6001", value: filterParams.status || undefined, onChange: (value) => handleFilter('status', value), style: { width: 120 }, children: [_jsx(Option, { value: SessionStatus.ACTIVE, children: "\u6709\u6548" }), _jsx(Option, { value: SessionStatus.DELETED, children: "\u5DF2\u5220\u9664" })] }), _jsxs(Select, { placeholder: "\u9009\u62E9\u89D2\u8272", value: filterParams.role || undefined, onChange: (value) => handleFilter('role', value), style: { width: 120 }, children: [_jsx(Option, { value: MessageRole.USER, children: "\u7528\u6237" }), _jsx(Option, { value: MessageRole.ASSISTANT, children: "\u52A9\u624B" }), _jsx(Option, { value: MessageRole.SYSTEM, children: "\u7CFB\u7EDF" })] }), _jsx(RangePicker, { placeholder: ['开始日期', '结束日期'], onChange: handleDateRangeChange, style: { width: 240 } })] }), _jsxs("div", { className: "action-group", children: [_jsx(Button, { icon: _jsx(ReloadOutlined, {}), onClick: handleReset, children: "\u91CD\u7F6E" }), _jsx(Button, { icon: _jsx(ExportOutlined, {}), onClick: handleExport, children: "\u5BFC\u51FA" }), _jsx(Button, { type: "primary", danger: true, icon: _jsx(DeleteOutlined, {}), children: "\u6279\u91CF\u5220\u9664" })] })] }) }), _jsxs("div", { className: "main-content", children: [_jsxs("div", { className: "session-list", children: [_jsx("div", { className: "list-header", children: "\u4F1A\u8BDD\u5217\u8868" }), _jsx("div", { className: "list-content", children: sessions.map(session => (_jsxs("div", { className: `session-item ${selectedSession?.id === session.id ? 'selected' : ''}`, onClick: () => setSelectedSession(session), children: [_jsxs("div", { className: "session-header", children: [_jsx("div", { className: "session-title", children: session.title }), _jsx("div", { className: `session-status ${session.status === SessionStatus.ACTIVE ? 'status-active' : 'status-deleted'}`, children: session.status === SessionStatus.ACTIVE ? '有效' : '已删除' })] }), _jsxs("div", { className: "session-meta", children: [_jsx("div", { className: "session-id", children: session.id }), _jsx("div", { className: "user-id", children: session.userId })] }), _jsxs("div", { className: "session-footer", children: [_jsxs("div", { className: "message-count", children: [session.messageCount, " \u6761\u6D88\u606F"] }), _jsx("div", { className: "update-time", children: new Date(session.updatedAt).toLocaleString() })] })] }, session.id))) }), _jsx("div", { className: "pagination-wrapper", children: _jsx(Pagination, { current: sessionPagination.page, pageSize: sessionPagination.pageSize, total: totalSessions, onChange: (page, pageSize) => setSessionPagination({ page, pageSize }), showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total) => `共 ${total} 条`, style: { textAlign: 'center' } }) })] }), _jsxs("div", { className: "message-list", children: [_jsx("div", { className: "list-header", children: _jsxs("div", { className: "header-title", children: ["\u6D88\u606F\u5217\u8868", selectedSession && (_jsxs("span", { className: "session-info", children: ["\u4F1A\u8BDD: ", selectedSession.title] }))] }) }), _jsx("div", { className: "list-content", children: messages.map(message => (_jsxs("div", { className: `message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`, onClick: () => setSelectedMessage(message), children: [_jsxs("div", { className: "message-header", children: [_jsx("div", { className: "message-id", children: message.id }), _jsxs("div", { className: "message-meta", children: [_jsx("span", { className: `role-tag role-${message.role}`, children: message.role === MessageRole.USER ? '用户' :
                                                                message.role === MessageRole.ASSISTANT ? '助手' : '系统' }), _jsxs("span", { className: "sequence-number", children: ["#", message.sequence] })] })] }), _jsxs("div", { className: "message-preview", children: [message.type === MessageType.IMAGE && (_jsx("img", { src: "https://via.placeholder.com/60x40", alt: "\u9884\u89C8", className: "image-preview" })), message.preview] }), _jsxs("div", { className: "message-footer", children: [_jsx("div", { className: "message-type", children: message.type === MessageType.TEXT ? '文本' :
                                                        message.type === MessageType.IMAGE ? '图片' :
                                                            message.type === MessageType.AUDIO ? '音频' : '视频' }), _jsx("div", { className: "create-time", children: new Date(message.createdAt).toLocaleString() })] })] }, message.id))) }), _jsx("div", { className: "pagination-wrapper", children: _jsx(Pagination, { current: messagePagination.page, pageSize: messagePagination.pageSize, total: totalMessages, onChange: (page, pageSize) => setMessagePagination({ page, pageSize }), showSizeChanger: true, pageSizeOptions: ['10', '20', '50'], showTotal: (total) => `共 ${total} 条`, style: { textAlign: 'center' } }) })] }), _jsxs("div", { className: "content-detail", children: [_jsxs("div", { className: "detail-header", children: [_jsx("span", { children: "\u5185\u5BB9\u8BE6\u60C5" }), selectedMessage && (_jsxs("div", { style: { display: 'flex', gap: '8px' }, children: [_jsx(Button, { type: "primary", icon: _jsx(PlusOutlined, {}), size: "small", onClick: handleAddContent, children: "\u6DFB\u52A0\u5185\u5BB9" }), _jsx(Popconfirm, { title: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u6D88\u606F\u5417\uFF1F", onConfirm: () => handleDeleteMessage(selectedMessage.id), okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsx(Button, { danger: true, icon: _jsx(DeleteOutlined, {}), size: "small", children: "\u5220\u9664\u6D88\u606F 01" }) })] }))] }), _jsx("div", { className: "detail-content", children: selectedMessage ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "message-info", children: [_jsxs("div", { className: "info-item", children: [_jsx("div", { className: "info-label", children: "\u6D88\u606F ID:" }), _jsx("div", { className: "info-value", children: selectedMessage.id })] }), _jsxs("div", { className: "info-item", children: [_jsx("div", { className: "info-label", children: "\u89D2\u8272:" }), _jsx("div", { className: "info-value", children: selectedMessage.role === MessageRole.USER ? '用户' :
                                                                selectedMessage.role === MessageRole.ASSISTANT ? '助手' : '系统' })] }), _jsxs("div", { className: "info-item", children: [_jsx("div", { className: "info-label", children: "\u5E8F\u53F7:" }), _jsxs("div", { className: "info-value", children: ["#", selectedMessage.sequence] })] }), _jsxs("div", { className: "info-item", children: [_jsx("div", { className: "info-label", children: "\u7C7B\u578B:" }), _jsx("div", { className: "info-value", children: selectedMessage.type === MessageType.TEXT ? '文本' :
                                                                selectedMessage.type === MessageType.IMAGE ? '图片' :
                                                                    selectedMessage.type === MessageType.AUDIO ? '音频' : '视频' })] }), _jsxs("div", { className: "info-item", children: [_jsx("div", { className: "info-label", children: "\u521B\u5EFA\u65F6\u95F4:" }), _jsx("div", { className: "info-value", children: new Date(selectedMessage.createdAt).toLocaleString() })] })] }), _jsxs("div", { className: "content-section", children: [_jsx("div", { className: "section-header", children: _jsxs("span", { children: ["\u5185\u5BB9\u5217\u8868 (", messageContents.length, " \u9879)"] }) }), _jsxs("div", { className: "content-list", children: [messageContents.map(content => (_jsxs("div", { className: "content-item", children: [_jsxs("div", { className: "content-header", children: [_jsxs("span", { className: "content-sequence", children: ["\u5E8F\u5217 #", content.sequence] }), _jsxs("div", { className: "content-actions", children: [_jsx(Button, { type: "text", icon: _jsx(EditOutlined, {}), size: "small", onClick: () => handleEditContent(content), children: "\u7F16\u8F91" }), _jsx(Popconfirm, { title: "\u786E\u5B9A\u8981\u5220\u9664\u8FD9\u4E2A\u5185\u5BB9\u5417\uFF1F666", onConfirm: () => handleDeleteMessage(selectedMessage.id), okText: "\u786E\u5B9A", cancelText: "\u53D6\u6D88", children: _jsx(Button, { type: "text", danger: true, icon: _jsx(DeleteOutlined, {}), size: "small", children: "\u5220\u9664" }) })] })] }), _jsxs("div", { className: "content-body", children: [_jsx("span", { className: "content-type", children: content.type === MessageType.TEXT ? '文本' :
                                                                                content.type === MessageType.IMAGE ? '图片' :
                                                                                    content.type === MessageType.AUDIO ? '音频' : '视频' }), content.type === MessageType.IMAGE ? (_jsx("img", { src: content.content, alt: "\u5185\u5BB9", className: "image-content" })) : (_jsx("div", { className: "text-content", children: content.content }))] })] }, content.id))), messageContents.length === 0 && (_jsx("div", { className: "empty-state", children: "\u6682\u65E0\u5185\u5BB9" }))] })] })] })) : (_jsx("div", { className: "empty-state", children: "\u8BF7\u9009\u62E9\u4E00\u6761\u6D88\u606F\u67E5\u770B\u8BE6\u60C5" })) }), _jsx("div", { className: "detail-footer", children: _jsx(Button, { children: "\u5173\u95ED" }) })] })] }), _jsx(Modal, { title: editingContent ? '编辑内容' : '添加内容', visible: contentModalVisible, onOk: handleSaveContent, onCancel: () => setContentModalVisible(false), width: 500, children: _jsxs(Form, { form: contentForm, layout: "vertical", children: [_jsx(Form.Item, { name: "sequence", label: "\u5E8F\u5217", rules: [{ required: true, message: '请输入序列' }], children: _jsx(Input, { type: "number", placeholder: "\u8BF7\u8F93\u5165\u5E8F\u5217" }) }), _jsx(Form.Item, { name: "type", label: "\u7C7B\u578B", rules: [{ required: true, message: '请选择类型' }], children: _jsxs(Select, { placeholder: "\u8BF7\u9009\u62E9\u7C7B\u578B", children: [_jsx(Option, { value: MessageType.TEXT, children: "\u6587\u672C" }), _jsx(Option, { value: MessageType.IMAGE, children: "\u56FE\u7247" }), _jsx(Option, { value: MessageType.AUDIO, children: "\u97F3\u9891" }), _jsx(Option, { value: MessageType.VIDEO, children: "\u89C6\u9891" })] }) }), _jsx(Form.Item, { name: "content", label: "\u5185\u5BB9", rules: [{ required: true, message: '请输入内容' }], children: _jsx(TextArea, { rows: 4, placeholder: "\u8BF7\u8F93\u5165\u5185\u5BB9", showCount: true, maxLength: 1000 }) })] }) })] }));
};
export default MessagesManagement;
