import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// 导入所需的图标组件
import { CloseOutlined, // 关闭图标
AudioOutlined, // 音频图标
SendOutlined, // 发送图标
SettingOutlined, // 设置图标
UserOutlined, // 用户图标
 } from '@ant-design/icons';
// 导入所需的Ant Design组件
import { Avatar, Button, Input, Layout, Modal, Space } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { getConversationDetail, createMessage } from '@/services/ant-design-pro/api'; // 导入API函数
import './SpokenPractice.less'; // 导入样式文件
// 内联样式，用于WebSocket连接状态指示器
const styles = {
    connectionStatus: {
        display: 'flex',
        alignItems: 'center',
        marginTop: '8px',
        fontSize: '12px',
    },
    statusIndicator: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        marginRight: '6px',
    },
    connected: {
        backgroundColor: '#52c41a',
    },
    disconnected: {
        backgroundColor: '#ff4d4f',
    },
    statusText: {
        color: '#666',
    },
};
import webSocketService from '@/services/WebSocket/websocket';
// 解构Layout组件
const { Header, Content } = Layout;
const { TextArea } = Input;
/**
 * AI口语练习组件
 * 提供文本对话、语音录制和口语评分功能
 */
const SpokenPractice = () => {
    // 对话区域的引用，用于滚动到最新消息
    const conversationEndRef = useRef(null);
    // 会话消息列表状态管理
    // const [messages, setMessages] = useState<Message[]>([
    //   {
    //     id: 1,
    //     content: '你好！我是你的AI口语练习伙伴。今天想练习什么话题呢？',
    //     sender: 'ai',
    //     timestamp: '10:00',
    //   },
    // ]);
    //初始化空mssages
    const [messages, setMessages] = useState([]);
    // 文本输入框内容状态管理
    const [inputValue, setInputValue] = useState('');
    // 录音状态管理
    const [isRecording, setIsRecording] = useState(false);
    // WebSocket连接状态管理
    const [isConnected, setIsConnected] = useState(false);
    const [socket, setSocket] = useState(null);
    // WebSocket重试状态管理
    const [retryStatus, setRetryStatus] = useState({
        isRetrying: false,
        attempt: 0,
        maxRetries: 5,
        interval: 0,
        maxRetriesReached: false,
    });
    // 会话ID和用户ID（在实际应用中这些值应该从props或上下文中获取）
    const conversationId = 1;
    const userId = 1;
    // 用于生成唯一消息ID的计数器
    const [messageIdCounter, setMessageIdCounter] = useState(0);
    // 生成唯一消息ID的函数
    const generateMessageId = () => {
        setMessageIdCounter(prev => prev + 1);
        return Date.now() + Math.floor(Math.random() * 1000);
    };
    // 当消息列表更新时，自动滚动到最底部
    useEffect(() => {
        // 使用setTimeout确保DOM已经更新后再滚动
        const timer = setTimeout(() => {
            if (conversationEndRef.current) {
                conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]); // 依赖于messages状态，当messages改变时触发滚动
    // 组件挂载时连接WebSocket
    useEffect(() => {
        let wsSocket = null;
        try {
            // 连接WebSocket
            wsSocket = webSocketService.connect(userId, conversationId);
            setSocket(wsSocket);
            // 监听连接事件
            wsSocket.on('connect', () => {
                console.log('WebSocket 连接成功');
                setIsConnected(true);
                // 重置重试状态
                setRetryStatus(prev => ({
                    ...prev,
                    isRetrying: false,
                    attempt: 0,
                    maxRetriesReached: false,
                }));
            });
            // 监听断开连接事件
            wsSocket.on('disconnect', () => {
                console.log('WebSocket 连接断开');
                setIsConnected(false);
                if (!retryStatus.isRetrying && !retryStatus.maxRetriesReached) {
                    setRetryStatus(prev => ({ ...prev, isRetrying: false }));
                }
            });
            // 监听重试事件
            wsSocket.on('retrying', (data) => {
                console.log('WebSocket 正在重试连接', data);
                setRetryStatus({
                    isRetrying: true,
                    attempt: data.attempt,
                    maxRetries: data.maxRetries,
                    interval: data.interval,
                    maxRetriesReached: false,
                });
            });
            // 监听重试达到最大次数事件
            wsSocket.on('maxRetriesReached', (data) => {
                console.log('WebSocket 重试达到最大次数', data);
                setRetryStatus(prev => ({
                    ...prev,
                    isRetrying: false,
                    maxRetriesReached: true,
                }));
            });
            // 监听接收消息事件
            wsSocket.on('receive_message', (data) => {
                console.log('收到WebSocket消息:', data);
                // 创建AI回复消息
                const aiMessage = {
                    id: generateMessageId(),
                    content: data.content || '我收到了你的消息！',
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                };
                setMessages(prevMessages => [...prevMessages, aiMessage]);
            });
            // 监听错误事件
            wsSocket.on('error', (error) => {
                console.error('WebSocket 错误:', error);
                setIsConnected(false);
            });
        }
        catch (error) {
            console.error('WebSocket连接初始化失败:', error);
        }
        // 组件卸载时断开连接
        return () => {
            console.log('断开WebSocket连接');
            if (wsSocket) {
                wsSocket.disconnect();
            }
        };
    }, []);
    /**
     * 发送用户消息到后端API
     * @param conversation_id 会话ID
     * @param user_id 用户ID
     * @param content 用户输入的消息内容
     * @param seq 消息序号
     * @returns 创建的消息信息或null
     */
    const sendUserMessageToAPI = async (conversation_id, user_id, content, seq) => {
        try {
            // 构造API请求参数
            const response = await createMessage({
                conversation_id: conversation_id,
                user_id: user_id,
            }, {
                role: 'user',
                seq: seq,
                contents: [
                    {
                        content_type: 'text',
                        text: content,
                        seq: 1,
                    },
                ],
            });
            console.log('消息发送成功:', response);
            return response;
        }
        catch (error) {
            console.error('消息发送失败:', error);
            return null;
        }
    };
    /**
     * 通过API发送消息（作为WebSocket备用方案）
     */
    const handleApiMessageSend = async (conversationId, userId, content, seq) => {
        try {
            // 调用API发送消息到后端
            const apiResponse = await sendUserMessageToAPI(conversationId, userId, content, seq);
            if (!apiResponse) {
                console.warn('消息发送未成功，可能存在API问题');
            }
            // 调用接口获取会话详情
            const response = await getConversationDetail({
                conversation_id: conversationId,
                user_id: userId,
            });
            // 创建AI回复消息
            let aiMessageContent = '收到你的消息！让我为你提供一些有用的信息。';
            // 处理API返回的数据，提取最后一条消息内容
            if (response && response.messages && response.messages.length > 0) {
                const lastMessage = response.messages[response.messages.length - 1];
                aiMessageContent = lastMessage.contents?.[0]?.text || aiMessageContent;
            }
            // 创建AI回复消息
            const aiMessage = {
                id: generateMessageId(),
                content: aiMessageContent,
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
            setMessages(prevMessages => [...prevMessages, aiMessage]);
        }
        catch (error) {
            console.error('处理消息发送失败:', error);
            // 错误情况下的默认回复
            const aiMessage = {
                id: generateMessageId(),
                content: '抱歉，暂时无法获取回复。你的回答很好！让我给你一些反馈...',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
            setMessages(prevMessages => [...prevMessages, aiMessage]);
        }
    };
    /**
     * 处理发送消息
     * 1. 创建用户消息并添加到消息列表
     * 2. 清空输入框
     * 3. 通过WebSocket发送消息
     * 4. 同时调用API作为备用方案
     */
    const handleSendMessage = async () => {
        if (!inputValue.trim())
            return;
        // 创建用户消息
        const userMessage = {
            id: generateMessageId(),
            content: inputValue,
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
        // 将用户消息添加到消息列表
        setMessages(prevMessages => [...prevMessages, userMessage]);
        // 清空输入框
        setInputValue('');
        // 计算消息序号（基于当前消息列表长度）
        const messageSeq = messages.length + 1;
        // 通过WebSocket发送消息
        if (isConnected && socket) {
            try {
                // 使用原生WebSocket的send方法，发送JSON格式数据
                socket.send(JSON.stringify({
                    'type': 'answer', // 添加消息类型标识
                    conversation_id: conversationId,
                    'content': inputValue,
                    round_num: 1,
                }));
                console.log('通过WebSocket发送消息');
            }
            catch (error) {
                console.error('WebSocket发送消息失败:', error);
                // 发送失败时回退到API
                // handleApiMessageSend(conversationId, userId, inputValue, messageSeq);
            }
        }
        else {
        }
    };
    /**
     * 开始录音
     * 设置录音状态为true，打开录音模态框
     */
    const handleStartRecording = () => {
        setIsRecording(true);
    };
    /**
     * 停止录音并处理结果
     * 1. 关闭录音状态
     * 2. 创建语音消息并添加到消息列表
    * 3. 模拟AI分析并生成回复和评分
     */
    const handleStopRecording = () => {
        setIsRecording(false);
        // 模拟录音处理
        const newMessageId = generateMessageId();
        const newMessage = {
            id: newMessageId,
            content: '（语音消息）',
            sender: 'user',
            timestamp: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        // 模拟AI分析回复和评分
        setTimeout(() => {
            const aiMessage = {
                id: generateMessageId(),
                content: '你的发音很清晰！让我给你详细的评分反馈。',
                sender: 'ai',
                timestamp: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
            // 使用函数形式的setState确保基于最新状态更新
            setMessages(prevMessages => {
                // 检查newMessage是否已经存在于列表中
                const newMessageExists = prevMessages.some(msg => msg.id === newMessageId);
                if (newMessageExists) {
                    // 如果已存在，则只添加aiMessage
                    return [...prevMessages, aiMessage];
                }
                else {
                    // 如果不存在，则同时添加newMessage和aiMessage
                    return [...prevMessages, newMessage, aiMessage];
                }
            });
        }, 1500);
    };
    /**
     * 取消录音
     * 关闭录音状态，不保存录音内容
     */
    const handleCancelRecording = () => {
        setIsRecording(false);
    };
    // 渲染组件UI
    return (_jsxs(Layout, { className: "spoken-practice-layout", children: [_jsxs(Header, { className: "spoken-practice-header", children: [_jsx("div", { className: "header-left", children: _jsx(Avatar, { size: 40, icon: _jsx(AudioOutlined, {}), className: "app-icon" }) }), _jsx("div", { className: "header-center", children: _jsx("h1", { className: "app-title", children: "AI\u53E3\u8BED\u7EC3\u4E60" }) }), _jsx("div", { className: "header-right", children: _jsxs(Space, { size: "middle", children: [_jsx(Button, { icon: _jsx(SettingOutlined, {}), ghost: true, className: "header-button" }), _jsx(Avatar, { size: 40, icon: _jsx(UserOutlined, {}), className: "user-avatar" })] }) })] }), _jsxs(Content, { className: "spoken-practice-content", children: [_jsxs("div", { className: "conversation-area", children: [messages.map((message) => (_jsx("div", { className: `message-item ${message.sender}`, children: _jsxs("div", { className: "message-bubble", children: [_jsx("p", { className: "message-content", children: message.content }), _jsx("p", { className: "message-timestamp", children: message.timestamp })] }) }, message.id))), _jsx("div", { ref: conversationEndRef })] }), _jsxs("div", { className: "input-area", children: [_jsx(TextArea, { value: inputValue, onChange: (e) => setInputValue(e.target.value), placeholder: "\u8F93\u5165\u5185\u5BB9...", rows: 3, className: "text-input", onPressEnter: (e) => {
                                    // Ctrl/Cmd + Enter 快速发送消息
                                    if (e.ctrlKey || e.metaKey)
                                        handleSendMessage();
                                } }), _jsxs(Space, { size: "middle", className: "input-buttons", children: [_jsx(Button, { icon: _jsx(AudioOutlined, {}), type: "primary", onClick: handleStartRecording, className: "voice-button" }), _jsx(Button, { icon: _jsx(SendOutlined, {}), type: "primary", onClick: handleSendMessage, className: "send-button", loading: !isConnected, title: isConnected ? '发送消息' : '正在连接WebSocket...' })] }), _jsxs("div", { style: styles.connectionStatus, children: [_jsx("span", { style: { ...styles.statusIndicator, ...(isConnected ? styles.connected : styles.disconnected) } }), _jsx("span", { style: styles.statusText, children: isConnected
                                            ? 'WebSocket已连接'
                                            : retryStatus.isRetrying
                                                ? `连接中... (${retryStatus.attempt}/${retryStatus.maxRetries})`
                                                : retryStatus.maxRetriesReached
                                                    ? '连接失败，已达到最大重试次数'
                                                    : 'WebSocket未连接' }), retryStatus.maxRetriesReached && (_jsx(Button, { size: "small", type: "link", onClick: () => {
                                            console.log('手动触发WebSocket重试');
                                            if (socket && socket.retry) {
                                                socket.retry();
                                                // 重置最大重试状态
                                                setRetryStatus(prev => ({ ...prev, maxRetriesReached: false }));
                                            }
                                        }, style: { marginLeft: '8px' }, children: "\u91CD\u8BD5" }))] })] })] }), _jsx(Modal, { open: isRecording, footer: null, closable: false, maskStyle: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }, className: "recording-modal", children: _jsxs("div", { className: "recording-content", children: [_jsx("div", { className: "mic-icon-container", children: _jsx(AudioOutlined, { className: "mic-icon" }) }), _jsx("h2", { className: "recording-title", children: "\u6B63\u5728\u5F55\u97F3" }), _jsxs("div", { className: "recording-buttons", children: [_jsx(Button, { icon: _jsx(CloseOutlined, {}), onClick: handleCancelRecording, className: "cancel-button", children: "\u53D6\u6D88" }), _jsx(Button, { type: "primary", onClick: handleStopRecording, className: "finish-button", children: "\u5B8C\u6210\u5F55\u97F3" })] })] }) })] }));
};
export default SpokenPractice;
