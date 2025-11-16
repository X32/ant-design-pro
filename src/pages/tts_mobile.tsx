import React, { useState, useEffect } from 'react';
import { Button, Input, List, Space } from 'antd';
import { MenuOutlined, SettingOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'umi';
import { theme } from 'antd';



// 定义列表数据类型
interface TTSItem {
  id: number;
  text: string;
  audioUrl: string;
  createdAt: Date;
}

const TTSMobilePage: React.FC = () => {
  const intl = useIntl();
  const [text, setText] = useState<string>('');
  const [list, setList] = useState<TTSItem[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const { token } = theme.useToken();

  // 初始化模拟数据
  useEffect(() => {
    const initialList: TTSItem[] = [];
    for (let i = 0; i < 15; i++) {
      initialList.push({
        id: Date.now() - i * 1000,
        text: `这是第 ${i + 1} 条文本示例内容，用于测试文字转语音功能...`,
        audioUrl: 'https://example.com/audio.mp3',
        createdAt: new Date(Date.now() - i * 1000 * 60),
      });
    }
    setList(initialList);
  }, []);

  // 模拟调用http接口获取音频链接
  const mockApiCall = async (text: string): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://example.com/audio.mp3');
      }, 1000);
    });
  };

  // 生成音频
  const handleGenerate = async () => {
    if (!text.trim()) return;

    try {
      const audioUrl = await mockApiCall(text);
      const newItem: TTSItem = {
        id: Date.now(),
        text: text.trim().substring(0, 20),
        audioUrl,
        createdAt: new Date(),
      };
      setList((prev) => [newItem, ...prev]);
      setText('');
    } catch (error) {
      console.error('生成音频失败:', error);
    }
  };

  // 下拉刷新
  const handleRefresh = () => {
    setRefreshing(true);
    // 模拟刷新数据
    setTimeout(() => {
      const newList: TTSItem[] = [];
      for (let i = 0; i < 15; i++) {
        newList.push({
          id: Date.now() - i * 1000,
          text: `这是第 ${i + 1} 条刷新后的文本示例内容...`,
          audioUrl: 'https://example.com/audio.mp3',
          createdAt: new Date(Date.now() - i * 1000 * 60),
        });
      }
      setList(newList);
      setRefreshing(false);
      setCurrentPage(1);
    }, 1000);
  };

  // 加载更多
  const handleLoadMore = () => {
    setLoadingMore(true);
    // 模拟加载更多数据
    setTimeout(() => {
      const newList: TTSItem[] = [];
      for (let i = 0; i < 10; i++) {
        newList.push({
          id: Date.now() - (currentPage * 10 + i) * 1000,
          text: `这是第 ${currentPage * 10 + i + 1} 条加载的文本示例内容...`,
          audioUrl: 'https://example.com/audio.mp3',
          createdAt: new Date(Date.now() - (currentPage * 10 + i) * 1000 * 60),
        });
      }
      setList((prev) => [...prev, ...newList]);
      setLoadingMore(false);
      setCurrentPage((prev) => prev + 1);
    }, 1000);
  };

  // 播放音频
  const handlePlay = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error('播放音频失败:', error);
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: token.colorBgContainer,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 顶部标题栏 */}
      <div style={{ 
        height: 60, 
        backgroundColor: token.colorPrimary, 
        color: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 16px',
        fontSize: '18px',
        fontWeight: 500
      }}>
        {intl.formatMessage({ id: 'pages.tts.mobile.title' })}
        <Button type="text" style={{ color: '#fff' }}>
          {intl.formatMessage({ id: 'pages.tts.mobile.register' })}
        </Button>
      </div>

      {/* Banner区 */}
      <div style={{ 
        height: 150, 
        backgroundColor: token.colorBorder,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: token.colorTextSecondary,
        marginBottom: 16
      }}>
        Banner 图片占位
      </div>

      {/* 内容列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '0 16px' }}>
        <List
          dataSource={list.slice(0, currentPage * pageSize)}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{ 
                padding: '16px 0',
                borderBottom: `1px solid ${token.colorBorder}`
              }}
            >
              <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {/* 圆形播放按钮 */}
                  <div
                    style={{ 
                      width: 48, 
                      height: 48, 
                      borderRadius: '50%',
                      backgroundColor: '#e6f7ff',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b3d8ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e6f7ff'}
                    onClick={() => handlePlay(item.audioUrl)}
                  >
                    <PlayCircleOutlined style={{ color: token.colorPrimary, fontSize: '24px' }} />
                  </div>
                  {/* 文本内容 */}
                  <div style={{ flex: 1, fontSize: '14px', color: token.colorText }}>
                    {item.text}
                  </div>
                </div>
                {/* 菜单按钮 */}
                <MenuOutlined style={{ fontSize: '18px', color: token.colorTextSecondary }} />
              </Space>
            </List.Item>
          )}
        />

        {/* 加载更多按钮 */}
        {loadingMore && (
          <div style={{ 
            textAlign: 'center', 
            padding: '16px',
            color: token.colorTextSecondary
          }}>
            加载中...
          </div>
        )}
        {!loadingMore && currentPage * pageSize < list.length && (
          <div style={{ padding: '16px', textAlign: 'center' }}>
            <Button
              type="text"
              onClick={handleLoadMore}
              style={{ color: token.colorPrimary }}
            >
              加载更多
            </Button>
          </div>
        )}
      </div>

      {/* 底部输入区 */}
      <div style={{ 
        padding: '16px',
        borderTop: `1px solid ${token.colorBorder}`,
        backgroundColor: token.colorBgContainer
      }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={intl.formatMessage({ id: 'pages.tts.mobile.input.placeholder' })}
            style={{ flex: 1 }}
          />
          <Button type="primary" onClick={handleGenerate}>
            {intl.formatMessage({ id: 'pages.tts.mobile.generate' })}
          </Button>
          <Button type="default" icon={<SettingOutlined />}>
            {intl.formatMessage({ id: 'pages.tts.mobile.settings' })}
          </Button>
        </Space.Compact>
      </div>
    </div>
  );
};

export default TTSMobilePage;