import React, { useState, useMemo } from 'react';
import { Layout, Card } from 'antd';
import SessionList from './components/SessionList';
import MessageList from './components/MessageList';
import ContentDetail from './components/ContentDetail';
import SearchBar from './components/SearchBar';
import { mockSessions, mockMessages, mockContents } from './mock/data';
import type { Session, Message, Content } from './types';
import './index.less';

const { Header, Content: LayoutContent } = Layout;

const MessageManagement: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    status: '',
    role: '',
    dateRange: null,
  });
  const [selectedSessionKeys, setSelectedSessionKeys] = useState<React.Key[]>([]);
  const [selectedMessageKeys, setSelectedMessageKeys] = useState<React.Key[]>([]);

  // 过滤后的会话列表
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // 状态过滤
      if (searchParams.status && session.status !== searchParams.status) {
        return false;
      }
      // 关键词过滤
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase();
        const matchesTitle = session.title.toLowerCase().includes(keyword);
        const matchesUserId = session.userId.toLowerCase().includes(keyword);
        // 检查是否有消息包含关键词
        const hasMatchingMessage = mockMessages.some(msg => 
          msg.sessionId === session.id && 
          msg.contentPreview.toLowerCase().includes(keyword)
        );
        if (!matchesTitle && !matchesUserId && !hasMatchingMessage) {
          return false;
        }
      }
      // 日期范围过滤
      if (searchParams.dateRange) {
        const sessionDate = new Date(session.updateTime.split(' ')[0]);
        const startDate = new Date(searchParams.dateRange[0]);
        const endDate = new Date(searchParams.dateRange[1]);
        if (sessionDate < startDate || sessionDate > endDate) {
          return false;
        }
      }
      return true;
    });
  }, [sessions, searchParams]);

  // 过滤后的消息列表
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      // 角色过滤
      if (searchParams.role && message.role !== searchParams.role) {
        return false;
      }
      // 关键词过滤
      if (searchParams.keyword) {
        const keyword = searchParams.keyword.toLowerCase();
        const matchesContent = message.contentPreview.toLowerCase().includes(keyword);
        if (!matchesContent) {
          return false;
        }
      }
      // 日期范围过滤
      if (searchParams.dateRange) {
        const messageDate = new Date(message.createTime.split(' ')[0]);
        const startDate = new Date(searchParams.dateRange[0]);
        const endDate = new Date(searchParams.dateRange[1]);
        if (messageDate < startDate || messageDate > endDate) {
          return false;
        }
      }
      return true;
    });
  }, [messages, searchParams]);

  // 处理会话批量选择
  const handleSessionBatchSelect = (selectedRowKeys: React.Key[]) => {
    setSelectedSessionKeys(selectedRowKeys);
  };

  // 处理消息批量选择
  const handleMessageBatchSelect = (selectedRowKeys: React.Key[]) => {
    setSelectedMessageKeys(selectedRowKeys);
  };

  // 处理批量删除
  const handleBatchDelete = () => {
    if (selectedSessionKeys.length > 0) {
      // 删除选中的会话
      const updatedSessions = sessions.filter(session => 
        !selectedSessionKeys.includes(session.id)
      );
      setSessions(updatedSessions);
      setSelectedSessionKeys([]);
      // 如果当前选中的会话被删除，清空相关状态
      if (selectedSession && selectedSessionKeys.includes(selectedSession.id)) {
        setSelectedSession(null);
        setMessages([]);
        setSelectedMessage(null);
        setContents([]);
      }
    } else if (selectedMessageKeys.length > 0 && selectedSession) {
      // 删除选中的消息
      const updatedMessages = messages.filter(message => 
        !selectedMessageKeys.includes(message.id)
      );
      setMessages(updatedMessages);
      setSelectedMessageKeys([]);
      // 如果当前选中的消息被删除，清空相关状态
      if (selectedMessage && selectedMessageKeys.includes(selectedMessage.id)) {
        setSelectedMessage(null);
        setContents([]);
      }
    }
  };

  // 处理导出
  const handleExport = () => {
    console.log('导出数据:', {
      sessions: filteredSessions,
      messages: filteredMessages,
      searchParams
    });
    // 这里可以添加实际的导出逻辑，比如生成Excel文件
  };

  // 处理会话选择
  const handleSessionSelect = (session: Session) => {
    setSelectedSession(session);
    const sessionMessages = mockMessages.filter(msg => msg.sessionId === session.id);
    setMessages(sessionMessages);
    setSelectedMessage(null);
    setContents([]);
  };

  // 处理消息选择
  const handleMessageSelect = (message: Message) => {
    setSelectedMessage(message);
    const messageContents = mockContents.filter(content => content.messageId === message.id);
    setContents(messageContents);
  };

  // 处理搜索参数变化
  const handleSearchChange = (params: any) => {
    setSearchParams(params);
  };

  // 处理内容操作
  const handleContentUpdate = (updatedContents: Content[]) => {
    setContents(updatedContents);
  };

  return (
    <Layout className="message-management">
      <Header className="management-header">
        <SearchBar 
          onSearchChange={handleSearchChange}
          onExport={handleExport}
          onBatchDelete={handleBatchDelete}
        />
      </Header>
      <LayoutContent className="management-content">
        <div className="content-layout">
          <div className="session-list-container">
              <Card title="会话列表" className="session-list-card">
                <SessionList
                  sessions={filteredSessions}
                  onSessionSelect={handleSessionSelect}
                  onBatchSelect={handleSessionBatchSelect}
                  selectedRowKeys={selectedSessionKeys}
                />
              </Card>
            </div>
          <div className="message-list-container">
              <Card title="消息列表" className="message-list-card">
                <MessageList
                  messages={filteredMessages}
                  onMessageSelect={handleMessageSelect}
                  onBatchSelect={handleMessageBatchSelect}
                  selectedRowKeys={selectedMessageKeys}
                />
              </Card>
            </div>
          <div className="content-detail-container">
            <Card title="内容详情" className="content-detail-card">
              <ContentDetail
                contents={contents}
                selectedMessage={selectedMessage}
                onContentUpdate={handleContentUpdate}
              />
            </Card>
          </div>
        </div>
      </LayoutContent>
    </Layout>
  );
};

export default MessageManagement;