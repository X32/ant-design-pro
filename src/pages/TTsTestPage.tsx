import React, { useState, useRef, useEffect } from 'react';
import { Tabs, Card, Input, Select, Slider, Button, Space, Tooltip } from 'antd';
import { AudioOutlined, InfoCircleOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

const TTsTestPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [language, setLanguage] = useState<string>('en-GB');
  const [voice, setVoice] = useState<string>('ollie-multilingual-male');
  const [style, setStyle] = useState<string>('default');
  const [emotionIntensity, setEmotionIntensity] = useState<string>('medium');
  const [speed, setSpeed] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [exportPath, setExportPath] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('1');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // 使用ref保存当前的XMLHttpRequest对象，以便在组件卸载时取消请求
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  // 保存创建的URL对象，以便在不需要时释放资源
  const audioUrlRef = useRef<string | null>(null);

  const { token } = theme.useToken();

  // 样式定义
  const cardStyle: React.CSSProperties = {
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadow,
    padding: token.paddingLG,
    backgroundColor: token.colorBgContainer,
  };

  const tabStyle: React.CSSProperties = {
    marginBottom: token.marginLG,
    backgroundColor: token.colorBgContainer,
  };

  const panelStyle: React.CSSProperties = {
    marginBottom: token.marginLG,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: token.marginSM,
    fontWeight: 500,
    color: token.colorText,
  };

  // 使用XMLHttpRequest实现TTS接口请求方法，避免fetch的CORS预检问题
  const synthesizeSpeech = async (textToSynthesize: string, exportToFile: boolean = false) => {
    return new Promise((resolve, reject) => {
      try {
        // 验证输入
        if (!textToSynthesize || textToSynthesize.trim() === '') {
          alert('请输入文本内容');
          reject(new Error('Empty text input'));
          return;
        }
        
        // 组织请求数据 - 确保与接口文档完全匹配
        const requestData = {
          text: textToSynthesize.trim(),
          voice: voice,
          // 只包含文档中提到的参数
          length_scale: speed, // 语速映射到length_scale
        };

        
        console.log('=== TTS Request Debug Info ===');
        console.log('Request URL:', '/api');
        console.log('Request Method:', 'POST');
        console.log('Request Data:', requestData);

        // 创建XMLHttpRequest对象
        const xhr = new XMLHttpRequest();
        
        // 设置响应类型为blob，直接获取音频数据
        xhr.responseType = 'blob';
        
        // 监听请求完成事件
        xhr.onload = function() {
          console.log('=== TTS Response Debug Info ===');
          console.log('Response Status:', xhr.status);
          console.log('Response Headers:', xhr.getAllResponseHeaders());
          
          if (xhr.status === 200) {
            // 请求成功，获取音频数据
            const audioBlob = xhr.response;
            console.log('Audio Blob Type:', audioBlob.type);
            console.log('Audio Blob Size:', audioBlob.size, 'bytes');
            
            const audioUrl = URL.createObjectURL(audioBlob);
            
            if (exportToFile) {
              // 导出文件的逻辑
              const link = document.createElement('a');
              link.href = audioUrl;
              link.download = exportPath || 'output.wav';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              console.log('Audio file exported successfully');
            } else {
              // 试听逻辑
              const audio = new Audio(audioUrl);
              audio.play().catch(error => {
                console.error('Error playing audio:', error);
                alert('音频播放失败');
              });
            }
            
            resolve(audioUrl);
          } else {
            // 请求失败
            console.error('TTS request failed with status:', xhr.status);
            console.error('Response text:', xhr.responseText || 'No response text');
            alert(`语音合成失败，HTTP状态码: ${xhr.status}\n请检查服务器是否正常运行`);
            reject(new Error(`HTTP error! status: ${xhr.status}`));
          }
        };
        
        // 监听网络错误
        xhr.onerror = function() {
          console.error('Network error occurred during TTS request');
          console.error('Possible reasons: Server not running, CORS issues, Network problems');
          alert('网络错误，请检查服务器连接\n确保服务器在localhost:8080上运行');
          reject(new Error('Network error'));
        };
        
        // 监听超时
        xhr.timeout = 15000; // 15秒超时
        xhr.ontimeout = function() {
          console.error('TTS request timed out after 15 seconds');
          alert('请求超时，请检查服务器是否响应');
          reject(new Error('Request timeout'));
        };
        
        // 打开连接并发送请求
        // 不设置任何CORS相关的头部，避免触发预检请求
        xhr.open('POST', '/api', true);
        
        // 只设置必要的Content-Type头部
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        console.log('Sending POST request...');
        // 发送请求数据
        xhr.send(JSON.stringify(requestData));
      } catch (error) {
        console.error('Error in speech synthesis:', error);
        alert(`语音合成失败: ${error instanceof Error ? error.message : '未知错误'}`);
        reject(error);
      }
    });
  };

  const handleVoicePreview = () => {
    // 实现语音试听功能
    console.log('Preview voice:', voice);
    // 可以使用预设文本进行语音特性预览
    synthesizeSpeech('This is a preview of the selected voice.');
  };

  const handleAudioPreview = () => {
    // 实现文本转语音试听功能
    if (!text.trim()) {
      alert('请输入文本内容');
      return;
    }
    console.log('Preview audio with current settings');
    synthesizeSpeech(text);
  };

  const handleExport = () => {
    // 实现导出功能
    if (!text.trim()) {
      alert('请输入文本内容');
      return;
    }
    console.log('Export audio to:', exportPath);
    synthesizeSpeech(text, true);
  };

  const handleChangeExportPath = () => {
    // 实现选择导出路径功能
    // 这里可以调用文件选择器API或其他方式
    setExportPath('/path/to/save/audio.mp3');
  };

  return (
    <div style={{ padding: '24px', backgroundColor: token.colorBgLayout, minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '24px', color: token.colorTextHeading }}>文本转语音</h1>
      
      {/* 顶部标签栏 */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        style={tabStyle}
        items={[
          {
            key: '1',
            label: '编辑文字',
          },
          {
            key: '2',
            label: '插入停顿',
          },
          {
            key: '3',
            label: '插入静音',
          },
          {
            key: '4',
            label: '播放选中',
          },
        ]}
      />

      <div style={{ display: 'flex', gap: token.marginLG, flexWrap: 'wrap' }}>
        {/* 左侧文本编辑区 */}
        <Card style={{ ...cardStyle, flex: 1, minWidth: '300px' }}>
          <div style={{ marginBottom: token.marginMD }}>
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入待转换的文字..."
              rows={15}
              style={{ 
                fontSize: '16px', 
                borderColor: token.colorBorder, 
                borderRadius: token.borderRadius
              }}
              autoSize={{ minRows: 15, maxRows: 20 }}
            />
          </div>
          <div style={{ 
            textAlign: 'right', 
            color: token.colorTextSecondary,
            fontSize: '14px',
            marginTop: token.marginXS
          }}>
            {text.length} 个字符
          </div>
        </Card>

        {/* 右侧设置面板 */}
        <Card style={{ ...cardStyle, width: '400px', minWidth: '300px' }}>
          {/* 语言设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>语言</label>
            <Select
              value={language}
              onChange={setLanguage}
              style={{ 
                width: '100%',
                borderColor: token.colorBorder,
                borderRadius: token.borderRadius
              }}
            >
              <Option value="en-GB">English (United Kingdom)</Option>
              <Option value="zh-CN">中文 (中国大陆)</Option>
              <Option value="ja-JP">日本語 (日本)</Option>
              <Option value="ko-KR">한국어 (대한민국)</Option>
            </Select>
          </div>

          {/* 语音设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>语音</label>
            <Space.Compact style={{ width: '100%' }}>
              <Select
                value={voice}
                onChange={setVoice}
                style={{ 
                  width: '100%',
                  borderColor: token.colorBorder,
                  borderRadius: token.borderRadius
                }}
              >
                <Option value="en_GB-alan-medium">Ollie Multilingual, 男</Option>
                <Option value="zh_CN-huayan-medium">Sarah Multilingual, 女</Option>
                <Option value="en_US-lessac-medium">Emma, 女</Option>
                <Option value="en_GB-john-medium">John, 男</Option>
              </Select>
              <Button 
                type="default" 
                onClick={handleVoicePreview}
                style={{ borderColor: token.colorBorder }}
              >
                试听
              </Button>
            </Space.Compact>
          </div>

          {/* 风格设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>
              <Space>
                风格
                <Tooltip title="选择语音的表达风格">
                  <InfoCircleOutlined style={{ color: token.colorTextSecondary }} />
                </Tooltip>
              </Space>
            </label>
            <Select
              value={style}
              onChange={setStyle}
              style={{ 
                width: '100%',
                borderColor: token.colorBorder,
                borderRadius: token.borderRadius
              }}
            >
              <Option value="default">默认</Option>
              <Option value="formal">正式</Option>
              <Option value="casual">随意</Option>
              <Option value="emotional">情感化</Option>
              <Option value="narration">叙述</Option>
            </Select>
          </div>

          {/* 感性强度设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>感性强度</label>
            <Select
              value={emotionIntensity}
              onChange={setEmotionIntensity}
              style={{ 
                width: '100%',
                borderColor: token.colorBorder,
                borderRadius: token.borderRadius
              }}
            >
              <Option value="low">低</Option>
              <Option value="medium">中</Option>
              <Option value="high">高</Option>
              <Option value="very-high">极高</Option>
            </Select>
          </div>

          {/* 语速设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>语速</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Slider
                value={speed}
                onChange={setSpeed}
                min={0.5}
                max={2}
                step={0.1}
                marks={{
                  0.5: '0.5x',
                  1: '1x',
                  1.5: '1.5x',
                  2: '2x',
                }}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '30px', textAlign: 'center' }}>{speed}x</span>
            </div>
          </div>

          {/* 音调设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>音调</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Slider
                value={pitch}
                onChange={setPitch}
                min={0.5}
                max={2}
                step={0.1}
                marks={{
                  0.5: '0.5x',
                  1: '1x',
                  1.5: '1.5x',
                  2: '2x',
                }}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '30px', textAlign: 'center' }}>{pitch}x</span>
            </div>
          </div>

          {/* 导出路径设置 */}
          <div style={panelStyle}>
            <label style={labelStyle}>导出路径</label>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                value={exportPath}
                onChange={(e) => setExportPath(e.target.value)}
                placeholder="选择文件保存路径"
                style={{ 
                  borderColor: token.colorBorder,
                  borderRadius: token.borderRadius
                }}
              />
              <Button 
                type="default" 
                icon={<FolderOpenOutlined />}
                onClick={handleChangeExportPath}
                style={{ borderColor: token.colorBorder }}
              >
                更改
              </Button>
            </Space.Compact>
          </div>

          {/* 操作按钮 */}
          <div style={{ 
            display: 'flex', 
            gap: token.marginSM,
            marginTop: '32px'
          }}>
            <Button 
              type="primary" 
              icon={<AudioOutlined />} 
              style={{ 
                flex: 1,
                backgroundColor: token.colorPrimary,
                borderColor: token.colorPrimary
              }}
              onClick={handleAudioPreview}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : '试听一下'}
            </Button>
            <Button 
              type="default" 
              style={{ 
                flex: 1,
                borderColor: token.colorBorder
              }}
              onClick={handleExport}
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? '处理中...' : '导出'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TTsTestPage;