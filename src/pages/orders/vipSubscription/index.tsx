import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Tag, 
  Input,
  Select, 
  message,
  Statistic,
  Row,
  Col,
  Drawer,
  Descriptions,
  List,
  Empty,
  Typography,
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined,
  CrownOutlined,
  UserOutlined,
  DollarOutlined,
  TeamOutlined,
  RiseOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/es/table';
import {
  adminGetSubscriptionList,
  adminGetUserSubscriptionSummary,
  adminGetUserSubscriptionHistory,
  adminGetSubscriptionStatistics,
  AdminSubscriptionRecord,
  UserSubscriptionSummary,
  SubscriptionStatus,
} from '@/services/ant-design-pro/api/vipSubscription';
import './index.less';

const { Search } = Input;
const { Option } = Select;
const { Text, Title } = Typography;

const VipSubscriptionManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<AdminSubscriptionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
  // 筛选条件
  const [filterUserId, setFilterUserId] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<SubscriptionStatus | undefined>();
  
  // 统计数据
  const [statistics, setStatistics] = useState<any>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  
  // 用户详情抽屉
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userSummary, setUserSummary] = useState<UserSubscriptionSummary | null>(null);
  const [userHistory, setUserHistory] = useState<AdminSubscriptionRecord[]>([]);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);

  // 获取订阅列表
  const fetchSubscriptionList = async () => {
    setLoading(true);
    try {
      const response = await adminGetSubscriptionList({
        user_id: filterUserId,
        status: filterStatus,
        page: currentPage,
        page_size: pageSize,
      });

      if (response.success && response.data) {
        setDataSource(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取订阅列表失败');
      }
    } catch (error: any) {
      message.error(error.message || '获取订阅列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取统计数据
  const fetchStatistics = async () => {
    setStatisticsLoading(true);
    try {
      const response = await adminGetSubscriptionStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    } finally {
      setStatisticsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionList();
  }, [currentPage, pageSize, filterUserId, filterStatus]);

  useEffect(() => {
    fetchStatistics();
  }, []);

  // 查看用户详情
  const handleViewUserDetail = async (userId: number) => {
    setDrawerVisible(true);
    setUserHistoryLoading(true);
    
    try {
      // 获取用户摘要
      const summaryResponse = await adminGetUserSubscriptionSummary(userId);
      if (summaryResponse.success && summaryResponse.data) {
        setUserSummary(summaryResponse.data);
      }
      
      // 获取用户历史
      const historyResponse = await adminGetUserSubscriptionHistory(userId, {
        page: 1,
        page_size: 50,
      });
      if (historyResponse.success && historyResponse.data) {
        setUserHistory(historyResponse.data.records);
      }
    } catch (error: any) {
      message.error('获取用户详情失败');
    } finally {
      setUserHistoryLoading(false);
    }
  };

  // 订阅状态渲染
  const renderStatus = (status: SubscriptionStatus) => {
    const statusMap = {
      ACTIVE: { color: 'success', text: '生效中' },
      EXPIRED: { color: 'default', text: '已过期' },
      CANCELED: { color: 'error', text: '已取消' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 表格列定义
  const columns: ColumnsType<AdminSubscriptionRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户信息',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.username}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.user_id}</Text>
        </Space>
      ),
    },
    {
      title: '套餐信息',
      key: 'plan',
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <CrownOutlined style={{ color: '#faad14' }} />
            <Text strong>{record.plan_name}</Text>
          </Space>
          <Space size="small">
            <Tag color="blue">{record.exam_level}</Tag>
            <Tag>{record.plan_type}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.duration_days}天</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: '订阅时间',
      key: 'time',
      width: 200,
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text style={{ fontSize: 12 }}>开始: {new Date(record.start_time).toLocaleString()}</Text>
          <Text style={{ fontSize: 12 }}>结束: {new Date(record.end_time).toLocaleString()}</Text>
        </Space>
      ),
    },
    {
      title: '支付金额',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      width: 120,
      render: (amount: number, record) => (
        <Space direction="vertical" size={0}>
          <Text strong style={{ color: '#faad14' }}>¥{(amount / 100).toFixed(2)}</Text>
          {record.is_first_buy === 1 && (
            <Tag color="red" style={{ fontSize: 11 }}>首购</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatus,
    },
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 180,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewUserDetail(record.user_id)}
        >
          查看用户
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'VIP订阅管理',
        breadcrumb: {},
      }}
    >
      {/* 统计卡片 */}
      {statistics && (
        <Card
          loading={statisticsLoading}
          style={{ marginBottom: 24 }}
          title={
            <Space>
              <RiseOutlined />
              <span>订阅统计</span>
            </Space>
          }
        >
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="总订阅数"
                value={statistics.overall?.total_subscriptions || 0}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="有效订阅"
                value={statistics.overall?.active_subscriptions || 0}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="已过期"
                value={statistics.overall?.expired_subscriptions || 0}
                valueStyle={{ color: '#999' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="总收入"
                value={(statistics.overall?.total_revenue || 0) / 100}
                precision={2}
                prefix={<DollarOutlined />}
                suffix="元"
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
          </Row>

          {/* 按套餐类型统计 */}
          {statistics.by_plan_type && statistics.by_plan_type.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <Title level={5}>按套餐类型统计</Title>
              <Row gutter={16}>
                {statistics.by_plan_type.map((item: any) => (
                  <Col span={8} key={item.plan_type}>
                    <Card size="small">
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Text strong>{item.plan_type === 'monthly' ? '月卡' : item.plan_type === 'quarterly' ? '季卡' : '年卡'}</Text>
                        <Space split="|">
                          <Text>订阅数: <Text type="success">{item.count}</Text></Text>
                          <Text>收入: <Text type="warning">¥{(item.revenue / 100).toFixed(2)}</Text></Text>
                        </Space>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card>
      )}

      {/* 订阅记录表格 */}
      <Card>
        {/* 筛选栏 */}
        <Space style={{ marginBottom: 16 }} wrap>
          <Input
            placeholder="输入用户ID搜索"
            prefix={<UserOutlined />}
            style={{ width: 200 }}
            onChange={(e) => {
              const value = e.target.value;
              setFilterUserId(value ? Number(value) : undefined);
              setCurrentPage(1);
            }}
            allowClear
          />
          <Select
            placeholder="订阅状态"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => {
              setFilterStatus(value);
              setCurrentPage(1);
            }}
          >
            <Option value="ACTIVE">生效中</Option>
            <Option value="EXPIRED">已过期</Option>
            <Option value="CANCELED">已取消</Option>
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setFilterUserId(undefined);
              setFilterStatus(undefined);
              setCurrentPage(1);
              fetchSubscriptionList();
              fetchStatistics();
            }}
          >
            重置
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          rowKey="id"
          scroll={{ x: 1500 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 20);
            },
          }}
        />
      </Card>

      {/* 用户详情抽屉 */}
      <Drawer
        title="用户订阅详情"
        width={720}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setUserSummary(null);
          setUserHistory([]);
        }}
      >
        {userSummary ? (
          <>
            {/* 用户摘要 */}
            <Card
              title={
                <Space>
                  <UserOutlined />
                  <span>用户摘要</span>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <Descriptions column={2} size="small">
                <Descriptions.Item label="用户ID">{userSummary.user_id}</Descriptions.Item>
                <Descriptions.Item label="用户名">{userSummary.username}</Descriptions.Item>
                <Descriptions.Item label="总订阅次数">
                  <Tag color="blue">{userSummary.total_subscriptions}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="有效订阅数">
                  <Tag color="green">{userSummary.active_subscriptions}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="累计支付" span={2}>
                  <Text strong style={{ color: '#faad14', fontSize: 16 }}>
                    ¥{(userSummary.total_paid_amount / 100).toFixed(2)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="最后到期时间" span={2}>
                  <Text strong style={{ color: '#52c41a' }}>
                    {new Date(userSummary.last_subscription_end_time).toLocaleString()}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="首次订阅">
                  {new Date(userSummary.first_subscription_time).toLocaleDateString()}
                </Descriptions.Item>
                <Descriptions.Item label="最近订阅">
                  {new Date(userSummary.last_subscription_time).toLocaleDateString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* 订阅历史 */}
            <Card
              title={
                <Space>
                  <CrownOutlined style={{ color: '#faad14' }} />
                  <span>订阅历史</span>
                </Space>
              }
              loading={userHistoryLoading}
            >
              {userHistory.length > 0 ? (
                <List
                  dataSource={userHistory}
                  renderItem={(item) => (
                    <List.Item key={item.id}>
                      <List.Item.Meta
                        avatar={<CrownOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                        title={
                          <Space>
                            <Text strong>{item.plan_name}</Text>
                            {renderStatus(item.status)}
                            {item.is_first_buy === 1 && <Tag color="red">首购</Tag>}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">
                              {new Date(item.start_time).toLocaleDateString()} - {new Date(item.end_time).toLocaleDateString()} ({item.duration_days}天)
                            </Text>
                            <Space size="middle">
                              <Text type="secondary">支付: ¥{(item.paid_amount / 100).toFixed(2)}</Text>
                              <Text type="secondary">订单: {item.order_no}</Text>
                            </Space>
                          </Space>
                        }
                      />
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(item.created_at).toLocaleString()}
                        </Text>
                      </div>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="暂无订阅记录" />
              )}
            </Card>
          </>
        ) : (
          <Empty description="加载中..." />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default VipSubscriptionManagement;
