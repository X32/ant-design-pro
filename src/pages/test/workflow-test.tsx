import React, { useState } from 'react';
import { Button, Card, Space, Table, message, Typography, Tag, Spin } from 'antd';
import { getWorkflowTypes, getPublicExamCategories } from '@/services/ant-design-pro/api';

const { Title, Paragraph, Text } = Typography;

// 工作流类型选项接口
interface WorkflowTypeOption {
  id: number;
  label: string;
  value: string;
  price: number;
  description?: string;
  sort?: number;
  is_active: number;
}

// 考试分类接口
interface ExamCategory {
  id: number;
  name: string;
  description?: string;
  is_active: number;
  created_at?: string;
}

const WorkflowTypesTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WorkflowTypeOption[]>([]);
  const [examCategories, setExamCategories] = useState<ExamCategory[]>([]);
  const [requestInfo, setRequestInfo] = useState<{
    url?: string;
    status?: number;
    error?: string;
    timestamp?: string;
  }>({});

  /**
   * 测试获取工作流类型列表（只获取激活的）
   */
  const handleTestActive = async () => {
    try {
      setLoading(true);
      setRequestInfo({ timestamp: new Date().toLocaleString() });
      
      console.log('🔵 开始请求 getWorkflowTypes({ only_active: true })');
      const response = await getWorkflowTypes({ only_active: true });
      
      console.log('✅ 响应成功:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setData(response.data);
        setRequestInfo({
          url: '/api/workflowtypes?only_active=true',
          status: 200,
          timestamp: new Date().toLocaleString(),
        });
        message.success(`成功获取 ${response.data.length} 条激活的工作流类型`);
      } else {
        message.error('响应格式异常');
        setRequestInfo({
          url: '/api/workflowtypes?only_active=true',
          error: '响应格式异常',
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (error: any) {
      console.error('❌ 请求失败:', error);
      setRequestInfo({
        url: '/api/workflowtypes?only_active=true',
        error: error.message || '请求失败',
        timestamp: new Date().toLocaleString(),
      });
      message.error(`请求失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 测试获取所有工作流类型（包括未激活的）
   */
  const handleTestAll = async () => {
    try {
      setLoading(true);
      setRequestInfo({ timestamp: new Date().toLocaleString() });
      
      console.log('🔵 开始请求 getWorkflowTypes({ only_active: false })');
      const response = await getWorkflowTypes({ only_active: false });
      
      console.log('✅ 响应成功:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setData(response.data);
        setRequestInfo({
          url: '/api/workflowtypes?only_active=false',
          status: 200,
          timestamp: new Date().toLocaleString(),
        });
        message.success(`成功获取 ${response.data.length} 条工作流类型（包括未激活）`);
      } else {
        message.error('响应格式异常');
        setRequestInfo({
          url: '/api/workflowtypes?only_active=false',
          error: '响应格式异常',
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (error: any) {
      console.error('❌ 请求失败:', error);
      setRequestInfo({
        url: '/api/workflowtypes?only_active=false',
        error: error.message || '请求失败',
        timestamp: new Date().toLocaleString(),
      });
      message.error(`请求失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 测试分页获取
   */
  const handleTestPagination = async () => {
    try {
      setLoading(true);
      setRequestInfo({ timestamp: new Date().toLocaleString() });
      
      console.log('🔵 开始请求 getWorkflowTypes({ only_active: true, page: 1, page_size: 5 })');
      const response = await getWorkflowTypes({ 
        only_active: true, 
        page: 1, 
        page_size: 5 
      });
      
      console.log('✅ 响应成功:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setData(response.data);
        setRequestInfo({
          url: '/api/workflowtypes?only_active=true&page=1&page_size=5',
          status: 200,
          timestamp: new Date().toLocaleString(),
        });
        message.success(`成功获取 ${response.data.length} 条工作流类型（分页）`);
      } else {
        message.error('响应格式异常');
        setRequestInfo({
          url: '/api/workflowtypes?only_active=true&page=1&page_size=5',
          error: '响应格式异常',
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (error: any) {
      console.error('❌ 请求失败:', error);
      setRequestInfo({
        url: '/api/workflowtypes?only_active=true&page=1&page_size=5',
        error: error.message || '请求失败',
        timestamp: new Date().toLocaleString(),
      });
      message.error(`请求失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 清空数据
   */
  const handleClear = () => {
    setData([]);
    setExamCategories([]);
    setRequestInfo({});
    message.info('已清空数据');
  };

  /**
   * 测试获取公开考试分类
   */
  const handleTestExamCategories = async () => {
    try {
      setLoading(true);
      setRequestInfo({ timestamp: new Date().toLocaleString() });
      
      console.log('🔵 开始请求 getPublicExamCategories({ only_active: true })');
      const response = await getPublicExamCategories({ only_active: true });
      
      console.log('✅ 响应成功:', response);
      
      if (response && response.success && Array.isArray(response.data)) {
        setExamCategories(response.data);
        setRequestInfo({
          url: '/api/exam/public/categories?only_active=true',
          status: 200,
          timestamp: new Date().toLocaleString(),
        });
        message.success(`成功获取 ${response.data.length} 条考试分类`);
      } else {
        message.error('响应格式异常');
        setRequestInfo({
          url: '/api/exam/public/categories?only_active=true',
          error: '响应格式异常',
          timestamp: new Date().toLocaleString(),
        });
      }
    } catch (error: any) {
      console.error('❌ 请求失败:', error);
      setRequestInfo({
        url: '/api/exam/public/categories?only_active=true',
        error: error.message || '请求失败',
        timestamp: new Date().toLocaleString(),
      });
      message.error(`请求失败: ${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 表格列定义 - 工作流类型
   */
  const workflowColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      width: 150,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Price (分)',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${(price / 100).toFixed(2)}`,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Sort',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
    },
    {
      title: 'Active',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (isActive: number) => (
        <Tag color={isActive === 1 ? 'green' : 'red'}>
          {isActive === 1 ? '激活' : '未激活'}
        </Tag>
      ),
    },
  ];

  /**
   * 表格列定义 - 考试分类
   */
  const examCategoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 80,
      render: (isActive: number) => (
        <Tag color={isActive === 1 ? 'green' : 'red'}>
          {isActive === 1 ? '激活' : '未激活'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <Title level={2}>🧪 工作流类型 API 测试</Title>
        <Paragraph>
          测试 <Text code>getWorkflowTypes</Text> 方法，验证 Authorization 头是否正确携带
        </Paragraph>

        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" onClick={handleTestActive} loading={loading}>
            测试：只获取激活的工作流
          </Button>
          <Button onClick={handleTestAll} loading={loading}>
            测试：获取所有工作流
          </Button>
          <Button onClick={handleTestPagination} loading={loading}>
            测试：分页获取工作流
          </Button>
          <Button onClick={handleTestExamCategories} loading={loading} type="dashed">
            测试：获取考试分类
          </Button>
          <Button danger onClick={handleClear} disabled={loading}>
            清空数据
          </Button>
        </Space>

        {/* 请求信息 */}
        {requestInfo.timestamp && (
          <Card 
            size="small" 
            title="📋 请求信息" 
            style={{ marginBottom: 16 }}
            type="inner"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>请求 URL: </Text>
                <Text code>{requestInfo.url || '-'}</Text>
              </div>
              <div>
                <Text strong>请求时间: </Text>
                <Text>{requestInfo.timestamp}</Text>
              </div>
              {requestInfo.status && (
                <div>
                  <Text strong>状态码: </Text>
                  <Tag color="green">{requestInfo.status}</Tag>
                </div>
              )}
              {requestInfo.error && (
                <div>
                  <Text strong>错误信息: </Text>
                  <Text type="danger">{requestInfo.error}</Text>
                </div>
              )}
              <div>
                <Text type="secondary">
                  💡 提示：打开浏览器开发者工具 Network 面板查看详细请求头
                </Text>
              </div>
            </Space>
          </Card>
        )}

        {/* 数据展示 */}
        <Spin spinning={loading}>
          {/* 工作流类型数据 */}
          {data.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <Title level={4}>📊 工作流类型数据</Title>
              <Table
                columns={workflowColumns}
                dataSource={data}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Text type="secondary">共 {data.length} 条工作流类型记录</Text>
              </div>
            </div>
          )}

          {/* 考试分类数据 */}
          {examCategories.length > 0 && (
            <div>
              <Title level={4}>📚 考试分类数据</Title>
              <Table
                columns={examCategoryColumns}
                dataSource={examCategories}
                rowKey="id"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Text type="secondary">共 {examCategories.length} 条考试分类记录</Text>
              </div>
            </div>
          )}

          {/* 空状态 */}
          {data.length === 0 && examCategories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
              暂无数据，点击上方按钮开始测试
            </div>
          )}
        </Spin>
      </Card>

      {/* 调试说明 */}
      <Card style={{ marginTop: 16 }} title="🔍 调试说明">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>1. 工作流类型接口测试</Text>
            <ul>
              <li>接口：<Text code>GET /api/workflowtypes</Text></li>
              <li>需要 Authorization 头</li>
              <li>应该走 8001 → proxy → 9002</li>
              <li>检查是否有 307 重定向问题</li>
            </ul>
          </div>
          <div>
            <Text strong>2. 考试分类接口测试</Text>
            <ul>
              <li>接口：<Text code>GET /api/exam/public/categories</Text></li>
              <li>公开接口，不需要 Authorization</li>
              <li>同样应该走 8001 → proxy → 9002</li>
              <li>用于对比验证代理配置是否正常</li>
            </ul>
          </div>
          <div>
            <Text strong>3. 检查 Network 面板</Text>
            <ul>
              <li>查看请求 URL 是否是 <Text code>http://localhost:8001/api/...</Text></li>
              <li>检查 Request Headers 中是否有 <Text code>Authorization: Bearer xxx</Text>（工作流接口）</li>
              <li>确认没有 307 重定向</li>
              <li>查看终端是否有 proxy 日志输出</li>
            </ul>
          </div>
          <div>
            <Text strong>4. 预期行为</Text>
            <ul>
              <li>请求应该发到 8001 端口（前端 dev server）</li>
              <li>由 proxy.ts 代理转发到 9002 端口（后端服务）</li>
              <li>工作流接口：Authorization 头应该从 8001 一直带到 9002</li>
              <li>考试分类接口：无需 token，直接代理转发</li>
              <li>都不应该出现 307 重定向</li>
            </ul>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default WorkflowTypesTest;
