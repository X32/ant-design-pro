import React, { useEffect, useState } from 'react';
import { Card, Button, Descriptions, Alert } from 'antd';
import { TOKEN_KEY } from '@/config/apiConfig';
import { getWorkflowTypes } from '@/services/ant-design-pro/api';

const TestAuthPage: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<any>({});
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkToken = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      setTokenInfo({
        exists: true,
        length: token.length,
        prefix: token.substring(0, 20) + '...',
        full: token,
      });
    } else {
      setTokenInfo({ exists: false });
    }
  };

  const testRequest = async () => {
    setError(null);
    setRequestInfo(null);

    console.log('=== 开始测试请求 ===');
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('当前 token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    // 先使用原生 fetch 测试
    console.log('\n=== 测试 1: 使用原生 fetch ===');
    try {
      const fetchResponse = await fetch('/api/workflowtypes/?only_active=true&page=1&page_size=5', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch 响应状态:', fetchResponse.status, fetchResponse.statusText);
      const fetchData = await fetchResponse.json();
      console.log('Fetch 响应数据:', fetchData);

      if (fetchResponse.ok) {
        setRequestInfo({
          success: true,
          source: 'fetch',
          data: fetchData,
        });
        return; // 如果成功,直接返回
      }
    } catch (fetchErr: any) {
      console.error('Fetch 请求失败:', fetchErr);
    }

    // 如果 fetch 失败,再测试 umi-request
    console.log('\n=== 测试 2: 使用 umi-request (getWorkflowTypes) ===');
    try {
      const response = await getWorkflowTypes({
        only_active: true,
        page: 1,
        page_size: 5,
      });

      console.log('umi-request 请求成功:', response);
      setRequestInfo({
        success: true,
        source: 'umi-request',
        data: response,
      });
    } catch (err: any) {
      console.error('umi-request 请求失败:', err);
      console.error('错误详情:', {
        message: err.message,
        name: err.name,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        headers: err.response?.headers,
        requestUrl: err.config?.url,
        requestMethod: err.config?.method,
        requestHeaders: err.config?.headers,
      });

      setError(JSON.stringify({
        source: 'umi-request',
        message: err.message,
        name: err.name,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        requestConfig: {
          url: err.config?.url,
          method: err.config?.method,
          headers: err.config?.headers,
        },
      }, null, 2));
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Card title="Token 检查" style={{ marginBottom: 16 }}>
        <Descriptions column={1}>
          <Descriptions.Item label="Token 存在">{tokenInfo.exists ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="Token 长度">{tokenInfo.length || '-'}</Descriptions.Item>
          <Descriptions.Item label="Token 前缀">{tokenInfo.prefix || '-'}</Descriptions.Item>
        </Descriptions>
        <Button onClick={checkToken} style={{ marginTop: 16 }}>刷新 Token 信息</Button>
      </Card>

      <Card title="请求测试" style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={testRequest}>测试 getWorkflowTypes 请求</Button>

        {error && (
          <Alert
            type="error"
            message="请求失败"
            description={
              <div>
                <p>错误信息已输出到浏览器控制台,请查看详细内容</p>
                <details style={{ marginTop: 8 }}>
                  <summary>查看详细信息</summary>
                  <pre style={{ marginTop: 8, padding: 12, background: '#f5f5f5', overflow: 'auto' }}>
                    {error}
                  </pre>
                </details>
              </div>
            }
            style={{ marginTop: 16 }}
          />
        )}

        {requestInfo && (
          <Alert
            type="success"
            message="请求成功"
            description={`成功获取 ${requestInfo.data?.data?.length || 0} 条数据`}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Card title="调试说明">
        <p>1. 打开浏览器开发者工具 (F12)</p>
        <p>2. 切换到 Console 标签</p>
        <p>3. 点击"测试 getWorkflowTypes 请求"按钮</p>
        <p>4. 查看控制台输出,特别关注:</p>
        <ul>
          <li>=== 请求拦截器 === 相关的日志</li>
          <li>Authorization header 是否被正确添加</li>
          <li>Network 标签中的 Request Headers</li>
        </ul>
      </Card>
    </div>
  );
};

export default TestAuthPage;
