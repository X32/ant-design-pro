import React, { useState, useRef, useEffect } from 'react';
import { Layout, Input, Button, Modal, Progress, Avatar, App } from 'antd';
import { CiOutlined, SendOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Header, Content } = Layout;
const { TextArea } = Input;

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  time: string;
}

interface Score {
  accuracy: number;
  grammar: number;
  fluency: number;
}

const SpokenPracticePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '你好！欢迎使用AI口语练习。请开始你的口语练习吧。',
      time: '10:00',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState<Score>({
    accuracy: 85,
    grammar: 78,
    fluency: 90,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { message } = App.useApp();

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const handleSendMessage = () => {
    if (!inputValue.trim()) {
      message.warning('请输入内容');
      return;
    }

    const newMessage: Message = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage: Message = {
        id: messages.length + 2,
        type: 'ai',
        content: '你的回答很好！现在让我来给你评分吧。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMessage, aiMessage]);
      setShowScore(true);
    }, 1000);
  };

  // 开始录音
  const handleStartRecording = () => {
    setIsRecording(true);
    message.info('开始录音');
  };

  // 取消录音
  const handleCancelRecording = () => {
    setIsRecording(false);
    message.info('取消录音');
  };

  // 完成录音
  const handleFinishRecording = () => {
    setIsRecording(false);
    message.success('录音完成');
    // 这里可以添加语音识别逻辑，将语音转换为文本
    setInputValue('语音识别结果');
  };

  // 处理回车键发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout className={styles.layout}>
      {/* 顶部导航栏 */}
      <Header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <Avatar size={32} icon={<UserOutlined />} />
          </div>
          <h1 className={styles.title}>AI口语练习</h1>
        </div>
        <div className={styles.headerRight}>
          <Button icon={<SettingOutlined />} className={styles.settingBtn} />
          <Avatar size={32} icon={<UserOutlined />} className={styles.userAvatar} />
        </div>
      </Header>

      {/* 主要内容区域 */}
      <Content className={styles.content}>
        {/* 对话展示区域 */}
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <div key={message.id} className={`${styles.message} ${styles[message.type]}`}>
              <div className={styles.messageContent}>{message.content}</div>
              <div className={styles.messageTime}>{message.time}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 评分反馈区域 */}
        {showScore && (
          <div className={styles.scoreContainer}>
            <h2 className={styles.scoreTitle}>口语评分反馈</h2>
            <div className={styles.scoreItems}>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>发音准确度</span>
                <Progress percent={score.accuracy} size="small" />
                <span className={styles.scoreValue}>{score.accuracy}分</span>
              </div>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>语法正确性</span>
                <Progress percent={score.grammar} size="small" />
                <span className={styles.scoreValue}>{score.grammar}分</span>
              </div>
              <div className={styles.scoreItem}>
                <span className={styles.scoreLabel}>流利度</span>
                <Progress percent={score.fluency} size="small" />
                <span className={styles.scoreValue}>{score.fluency}分</span>
              </div>
            </div>
          </div>
        )}

        {/* 输入区域 */}
        <div className={styles.inputContainer}>
          <TextArea
            ref={textAreaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入内容..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            className={styles.textArea}
          />
          <div className={styles.inputButtons}>
            <Button
              icon={<CiOutlined />}
              onClick={handleStartRecording}
              className={styles.micButton}
            />
            <Button
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              className={styles.sendButton}
              type="primary"
            />
          </div>
        </div>
      </Content>

      {/* 录音弹窗 */}
      <Modal
        visible={isRecording}
        footer={null}
        closable={false}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        className={styles.recordingModal}
      >
        <div className={styles.recordingContent}>
          <div className={styles.micIcon}>
            <CiOutlined style={{ fontSize: '48px', color: '#fff' }} />
          </div>
          <h2 className={styles.recordingTitle}>正在录音</h2>
          <div className={styles.recordingButtons}>
            <Button onClick={handleCancelRecording} className={styles.cancelButton}>
              取消
            </Button>
            <Button onClick={handleFinishRecording} className={styles.finishButton} type="primary">
              完成录音
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default SpokenPracticePage;