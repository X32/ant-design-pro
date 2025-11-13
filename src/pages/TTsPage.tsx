import React, { useState } from 'react';
import { Tabs, Card, Input, Select, Slider, Button, Space, Tooltip } from 'antd';
import { AudioOutlined, InfoCircleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const TTsPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [language, setLanguage] = useState<string>('en-GB');
  const [voice, setVoice] = useState<string>('ollie-multilingual-male');
  const [style, setStyle] = useState<string>('default');
  const [emotionIntensity, setEmotionIntensity] = useState<string>('medium');
  const [speed, setSpeed] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [exportPath, setExportPath] = useState<string>('/default/path/to/save');

  const { token } = theme.useToken();

  const cardStyle: React.CSSProperties = {
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadow,
    padding: token.paddingLG,
  };

  const tabStyle: React.CSSProperties = {
    marginBottom: token.marginLG,
  };

  const panelStyle: React.CSSProperties = {
    marginBottom: token.marginLG,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: token.marginSM,
    fontWeight: 500,
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>文本转语音</h1>
      <Tabs activeKey="1" style={tabStyle}>
        <Tabs.TabPane tab="编辑文字" key="1" />
        <Tabs.TabPane tab="插入停顿" key="2" />
        <Tabs.TabPane tab="插入静音" key="3" />
        <Tabs.TabPane tab="播放选中" key="4" />
      </Tabs>

      <div style={{ display: 'flex', gap: token.marginLG }}>
        {/* 左侧文本编辑区 */}
        <Card style={{ ...cardStyle, flex: 1 }}>
          <div style={{ marginBottom: token.marginMD }}>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入待转换的文字..."
              rows={15}
              style={{ fontSize: '16px' }}
            />
          </div>
          <div style={{ textAlign: 'right', color: token.colorTextSecondary }}>
            {text.length} 个字符
          </div>
        </Card>

        {/* 右侧设置面板 */}
        <Card style={{ ...cardStyle, width: 400 }}>
          {/* 语言设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>语言</label>
            <Select
              value={language}
              onChange={setLanguage}
              style={{ width: '100%' }}
            >
              <Option value="en-GB">English (United Kingdom)</Option>
              <Option value="zh-CN">中文 (中国大陆)</Option>
              <Option value="ja-JP">日本語 (日本)</Option>
            </Select>
          </div>

          {/* 语音设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>语音</label>
            <Space.Compact style={{ width: '100%' }}>
              <Select
                value={voice}
                onChange={setVoice}
                style={{ width: '100%' }}
              >
                <Option value="ollie-multilingual-male">Ollie Multilingual, 男</Option>
                <Option value="sarah-multilingual-female">Sarah Multilingual, 女</Option>
              </Select>
              <Button type="default">试听</Button>
            </Space.Compact>
          </div>

          {/* 风格设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>
              <Space>
                风格
                <Tooltip title="选择语音的风格">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            </label>
            <Select
              value={style}
              onChange={setStyle}
              style={{ width: '100%' }}
            >
              <Option value="default">默认</Option>
              <Option value="formal">正式</Option>
              <Option value="casual">casual</Option>
              <Option value="emotional">情感化</Option>
            </Select>
          </div>

          {/* 感性强度设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>感性强度</label>
            <Select
              value={emotionIntensity}
              onChange={setEmotionIntensity}
              style={{ width: '100%' }}
            >
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
            </Select>
          </div>

          {/* 语速设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>语速</label>
            <Slider
              value={speed}
              onChange={setSpeed}
              min={0.5}
              max={2}
              step={0.1}
              marks={{
                0.5: '0.5x',
                1: '1x',
                2: '2x',
              }}
            />
          </div>

          {/* 音调设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>音调</label>
            <Slider
              value={pitch}
              onChange={setPitch}
              min={0.5}
              max={2}
              step={0.1}
              marks={{
                0.5: '0.5x',
                1: '1x',
                2: '2x',
              }}
            />
          </div>

          {/* 导出路径设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>导出路径</label>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={exportPath}
                onChange={(e) => setExportPath(e.target.value)}
                placeholder="选择文件保存路径"
              />
              <Button type="default" icon={<FolderOpenOutlined />}>更改</Button>
            </Space.Compact>
          </div>

          {/* 操作按钮 */}
          <div style={{ display: 'flex', gap: token.marginSM }}>
            <Button type="primary" icon={<AudioOutlined />} style={{ flex: 1 }}>
              试听一下
            </Button>
            <Button type="default" style={{ flex: 1 }}>
              导出
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TTsPage;