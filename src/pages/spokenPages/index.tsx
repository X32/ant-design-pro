import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, Button, Avatar, message, Progress, Modal } from 'antd';
import { SendOutlined, SettingOutlined, LoadingOutlined, AudioOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import type { MessageInstance } from 'antd/es/message/interface';
import './index.less';

const { Header, Content } = Layout;
const { TextArea } = Input;

interface Message {
  id: string;
  content: string;
  type: 'user' | 'ai';
  timestamp: Date;
}

interface Score {
  accuracy: number;
  grammar: number;
  fluency: number;
}

const AISpeakingPractice: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState<Score>({ accuracy: 0, grammar: 0, fluency: 0 });
  const [showScore, setShowScore] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messageApi, contextHolder] = message.useMessage();
  const recordingModalRef = useRef<HTMLDivElement>(null);

  // 自动滚动到最新消息
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 模拟AI回复
  const simulateAIResponse = (userMessage: string) => {
    setIsProcessing(true);
    // 模拟AI思考时间
    setTimeout(() => {
      const aiResponses = [
        "That's a great point! Can you tell me more about your experience with this topic?",
        "Interesting perspective! How do you think we could apply this in real life?",
        "I understand what you're saying. Could you elaborate on that?",
        "Good job! Your pronunciation is improving. Let's try a more complex sentence.",
        "I see your point. What challenges have you faced with this?",
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        content: randomResponse,
        type: 'ai',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // 模拟评分
      const newScore: Score = {
        accuracy: Math.floor(Math.random() * 30) + 70,
        grammar: Math.floor(Math.random() * 30) + 70,
        fluency: Math.floor(Math.random() * 30) + 70,
      };
      setScore(newScore);
      setShowScore(true);
      setIsProcessing(false);
    }, 1500);
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue.trim(),
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    simulateAIResponse(inputValue.trim());
  };

  // 处理语音输入
  const handleVoiceInput = () => {
    setIsRecording(true);
  };

  // 完成录音
  const handleCompleteRecording = () => {
    // 模拟语音转文本
    const transcript = "This is a sample voice input text.";
    setInputValue(transcript);
    setIsRecording(false);
    messageApi.success('录音已完成');
  };

  // 取消录音
  const handleCancelRecording = () => {
    setIsRecording(false);
    messageApi.info('录音已取消');
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Layout className="ai-speaking-practice-layout">
      {contextHolder}
      {/* 顶部导航栏 */}
      <Header className="ai-speaking-practice-header">
        <div className="header-left">
          <div className="app-icon">AI</div>
        </div>
        <div className="header-center">
          <h1 className="app-title">AI口语练习</h1>
        </div>
        <div className="header-right">
          <Button icon={<SettingOutlined />} className="header-button" type="text" />
          <Avatar className="user-avatar" icon="user" />
        </div>
      </Header>

      {/* 主要内容区域 */}
      <Content className="ai-speaking-practice-content">
        {/* 对话展示区域 */}
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-messages">
              <p>开始你的AI口语练习之旅吧！</p>
              <p>输入文字或点击麦克风按钮进行语音输入</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`message-wrapper ${message.type}-message`}>
                <div className="message-bubble">
                  <p className="message-content">{message.content}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 评分反馈区域 */}
        {showScore && (
          <div className="score-container">
            <h3 className="score-title">口语评分反馈</h3>
            <div className="score-details">
              <div className="score-item">
                <span className="score-label">发音准确度</span>
                <Progress percent={score.accuracy} showInfo strokeColor="#1890ff" />
              </div>
              <div className="score-item">
                <span className="score-label">语法正确性</span>
                <Progress percent={score.grammar} showInfo strokeColor="#52c41a" />
              </div>
              <div className="score-item">
                <span className="score-label">流利度</span>
                <Progress percent={score.fluency} showInfo strokeColor="#faad14" />
              </div>
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className="input-container">
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入内容..."
            rows={3}
            className="text-input"
            disabled={isProcessing}
          />
          <div className="input-actions">
            <Button 
              icon={isRecording ? <CloseOutlined /> : <AudioOutlined />} 
              onClick={isRecording ? handleCancelRecording : handleVoiceInput}
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              danger={isRecording}
              disabled={isProcessing}
            />
            <Button 
              type="primary" 
              icon={isProcessing ? <LoadingOutlined /> : <SendOutlined />} 
              onClick={handleSendMessage}
              className="send-button"
              disabled={!inputValue.trim() || isProcessing}
            >
              发送
            </Button>
          </div>
        </div>
      </Content>

      {/* 录音弹窗 */}
      <Modal
        title={
          <div className="recording-modal-header">
            <div className="microphone-icon">
              <AudioOutlined style={{ fontSize: '24px', color: '#fff' }} />
            </div>
            <h3 style={{ color: '#fff' }}>正在录音</h3>
          </div>
        }
        open={isRecording}
        onCancel={handleCancelRecording}
        footer={[
          <Button key="cancel" onClick={handleCancelRecording} className="recording-cancel-btn">
            取消
          </Button>,
          <Button key="complete" type="primary" onClick={handleCompleteRecording} className="recording-complete-btn">
            完成录音
          </Button>,
        ]}
        className="recording-modal"
        centered
        closable={false}
        getContainer={recordingModalRef}
      >
        <div className="recording-indicator">
          <div className="recording-wave">
            <div className="wave-animation"></div>
          </div>
          <p className="recording-tip">请清晰地说出你想练习的内容</p>
        </div>
      </Modal>
    </Layout>
  );
};

export default AISpeakingPractice;
