/**
 * Dashboard 页面 - 数据统计面板
 * 显示各类业务指标和数据概览
 */

import React, { useState, useEffect } from 'react';
import {
  Card,
  Col,
  Row,
  Statistic,
  Table,
  Typography,
  Divider,
  Tag,
  Progress,
  Space,
  Spin,
  Badge,
} from 'antd';
import {
  ShoppingCartOutlined,
  DollarCircleOutlined,
  UsergroupAddOutlined,
  RiseOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import {
  getAdminStatsOverview,
  getAdminTopItems,
  getAdminAmountDistribution,
  getAdminPaymentChannels,
  getAdminUserGrowth,
  getAdminRevenueComparison,
  type StatsOverview,
  type TopItem,
  type AmountDistributionItem,
  type PaymentChannelItem,
  type UserGrowthItem,
  type RevenueComparison,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Title, Text } = Typography;

/**
 * Dashboard 页面组件
 */
const Dashboard: React.FC = () => {
  // 统计数据状态
  const [statsOverview, setStatsOverview] = useState<StatsOverview | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [amountDistribution, setAmountDistribution] = useState<AmountDistributionItem[]>([]);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannelItem[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthItem[]>([]);
  const [revenueComparison, setRevenueComparison] = useState<RevenueComparison | null>(null);
  
  // 加载状态
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [topItemsLoading, setTopItemsLoading] = useState(true);
  const [amountDistLoading, setAmountDistLoading] = useState(true);
  const [paymentChannelsLoading, setPaymentChannelsLoading] = useState(true);
  const [userGrowthLoading, setUserGrowthLoading] = useState(true);
  const [revenueComparisonLoading, setRevenueComparisonLoading] = useState(true);

  // 加载统计数据
  useEffect(() => {
    loadStatsOverview();
    loadTopItems();
    loadAmountDistribution();
    loadPaymentChannels();
    loadUserGrowth();
    loadRevenueComparison();
  }, []);

  /**
   * 加载数据概览
   */
  const loadStatsOverview = async () => {
    try {
      setOverviewLoading(true);
      const response = await getAdminStatsOverview();
      if (response && response.success) {
        setStatsOverview(response.data);
      }
    } catch (error) {
      console.error('加载数据概览失败:', error);
    } finally {
      setOverviewLoading(false);
    }
  };

  /**
   * 加载热门商品排行
   */
  const loadTopItems = async () => {
    try {
      setTopItemsLoading(true);
      const response = await getAdminTopItems(10);
      if (response && response.success) {
        setTopItems(response.data.items || []);
      }
    } catch (error) {
      console.error('加载热门商品排行失败:', error);
      setTopItems([]);
    } finally {
      setTopItemsLoading(false);
    }
  };

  /**
   * 加载金额分布统计
   */
  const loadAmountDistribution = async () => {
    try {
      setAmountDistLoading(true);
      const response = await getAdminAmountDistribution();
      if (response && response.success) {
        setAmountDistribution(response.data.distribution || []);
      }
    } catch (error) {
      console.error('加载金额分布统计失败:', error);
      setAmountDistribution([]);
    } finally {
      setAmountDistLoading(false);
    }
  };

  /**
   * 加载支付渠道分布
   */
  const loadPaymentChannels = async () => {
    try {
      setPaymentChannelsLoading(true);
      const response = await getAdminPaymentChannels();
      if (response && response.success) {
        setPaymentChannels(response.data.channels || []);
      }
    } catch (error) {
      console.error('加载支付渠道分布失败:', error);
      setPaymentChannels([]);
    } finally {
      setPaymentChannelsLoading(false);
    }
  };

  /**
   * 加载用户增长趋势
   */
  const loadUserGrowth = async () => {
    try {
      setUserGrowthLoading(true);
      const response = await getAdminUserGrowth(30);
      if (response && response.success) {
        setUserGrowth(response.data.growth || []);
      }
    } catch (error) {
      console.error('加载用户增长趋势失败:', error);
      setUserGrowth([]);
    } finally {
      setUserGrowthLoading(false);
    }
  };

  /**
   * 加载收入对比统计
   */
  const loadRevenueComparison = async () => {
    try {
      setRevenueComparisonLoading(true);
      const response = await getAdminRevenueComparison();
      if (response && response.success) {
        setRevenueComparison(response.data);
      }
    } catch (error) {
      console.error('加载收入对比统计失败:', error);
    } finally {
      setRevenueComparisonLoading(false);
    }
  };

  // 今日数据
  const todayData = statsOverview?.today;
  // 总体数据
  const totalData = statsOverview?.total;
  // 当前状态数据
  const currentData = statsOverview?.current;

  // 用简单表格代替图表展示用户增长趋势
  const userGrowthColumns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '新增用户',
      dataIndex: 'new_users',
      key: 'new_users',
    },
  ];

  // 用简单表格代替图表展示金额分布
  const amountDistributionColumns = [
    {
      title: '金额范围',
      dataIndex: 'range',
      key: 'range',
    },
    {
      title: '订单数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (value: number) => `¥${(value / 100).toFixed(2)}`,
    },
  ];

  // 热门商品表格列定义
  const topItemsColumns = [
    {
      title: '商品名称',
      dataIndex: 'item_name',
      key: 'item_name',
    },
    {
      title: '销售数量',
      dataIndex: 'sales_count',
      key: 'sales_count',
      sorter: (a: TopItem, b: TopItem) => b.sales_count - a.sales_count,
    },
    {
      title: '销售额',
      dataIndex: 'total_sales',
      key: 'total_sales',
      render: (value: number) => `¥${(value / 100).toFixed(2)}`,
      sorter: (a: TopItem, b: TopItem) => b.total_sales - a.total_sales,
    },
  ];

  // 支付渠道表格列定义
  const paymentChannelsColumns = [
    {
      title: '支付渠道',
      dataIndex: 'channel',
      key: 'channel',
    },
    {
      title: '订单数量',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '总金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (value: number) => `¥${(value / 100).toFixed(2)}`,
    },
    {
      title: '完成订单数',
      dataIndex: 'completed_count',
      key: 'completed_count',
    },
    {
      title: '完成率',
      key: 'completion_rate',
      render: (_: any, record: PaymentChannelItem) => (
        <Progress
          percent={Math.round((record.completed_count / record.count) * 100)}
          size="small"
          status="active"
        />
      ),
    },
  ];

  return (
    <div className="dashboard-page">
      <Title level={2} style={{ marginBottom: 24 }}>
        数据统计面板
      </Title>

      {/* 今日数据卡片 */}
      <Spin spinning={overviewLoading}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="今日订单数"
                value={todayData?.orders || 0}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="今日销售额"
                value={todayData?.amount ? todayData.amount / 100 : 0}
                precision={2}
                prefix={<DollarCircleOutlined />}
                valueStyle={{ color: '#3f8600' }}
                formatter={(value) => `¥${value}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="今日新增用户"
                value={todayData?.users || 0}
                prefix={<UsergroupAddOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="成功率"
                value={todayData?.success_rate || 0}
                precision={2}
                suffix="%"
                prefix={<RiseOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 总体数据卡片 */}
      <Spin spinning={overviewLoading}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="累计订单数"
                value={totalData?.orders || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="累计销售额"
                value={totalData?.amount ? totalData.amount / 100 : 0}
                precision={2}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => `¥${value}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="累计用户数"
                value={totalData?.users || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="平均客单价"
                value={totalData?.avg_amount ? totalData.avg_amount / 100 : 0}
                precision={2}
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => `¥${value}`}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 当前状态卡片 */}
      <Spin spinning={overviewLoading}>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="待处理订单"
                value={currentData?.pending_orders || 0}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="异常订单"
                value={currentData?.abnormal_orders || 0}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="总余额"
                value={currentData?.total_balance ? currentData.total_balance / 100 : 0}
                precision={2}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => `¥${value}`}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card className="stat-card">
              <Statistic
                title="在线用户"
                value={currentData?.online_users || 0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>

      {/* 收入对比统计 */}
      <Spin spinning={revenueComparisonLoading}>
        {revenueComparison && (
          <Card title="收入对比统计" style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div className="comparison-section">
                  <Title level={4}>本期数据</Title>
                  <div className="comparison-item">
                    <Text strong>收入：</Text>
                    <Text type="success">¥{(revenueComparison.current.revenue / 100).toFixed(2)}</Text>
                  </div>
                  <div className="comparison-item">
                    <Text strong>订单数：</Text>
                    <Text type="success">{revenueComparison.current.orders}</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="comparison-section">
                  <Title level={4}>上期数据</Title>
                  <div className="comparison-item">
                    <Text strong>收入：</Text>
                    <Text type="secondary">¥{(revenueComparison.previous.revenue / 100).toFixed(2)}</Text>
                  </div>
                  <div className="comparison-item">
                    <Text strong>订单数：</Text>
                    <Text type="secondary">{revenueComparison.previous.orders}</Text>
                  </div>
                </div>
              </Col>
            </Row>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <div className="comparison-section">
                  <Title level={4}>收入增长率</Title>
                  <div className="growth-rate">
                    {revenueComparison.growth.revenue_growth >= 0 ? (
                      <ArrowUpOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    )}
                    <Text
                      strong
                      style={{
                        color:
                          revenueComparison.growth.revenue_growth >= 0 ? '#f5222d' : '#52c41a',
                      }}
                    >
                      {Math.abs(revenueComparison.growth.revenue_growth)}%
                    </Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="comparison-section">
                  <Title level={4}>订单数增长率</Title>
                  <div className="growth-rate">
                    {revenueComparison.growth.orders_growth >= 0 ? (
                      <ArrowUpOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                    ) : (
                      <ArrowDownOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    )}
                    <Text
                      strong
                      style={{
                        color:
                          revenueComparison.growth.orders_growth >= 0 ? '#f5222d' : '#52c41a',
                      }}
                    >
                      {Math.abs(revenueComparison.growth.orders_growth)}%
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}
      </Spin>

      <Row gutter={16}>
        {/* 热门商品排行 */}
        <Col span={12}>
          <Spin spinning={topItemsLoading}>
            <Card title="热门商品排行" style={{ marginBottom: 24 }}>
              <Table
                columns={topItemsColumns}
                dataSource={topItems}
                rowKey="item_name"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Spin>
        </Col>

        {/* 支付渠道分布 */}
        <Col span={12}>
          <Spin spinning={paymentChannelsLoading}>
            <Card title="支付渠道分布" style={{ marginBottom: 24 }}>
              <Table
                columns={paymentChannelsColumns}
                dataSource={paymentChannels}
                rowKey="channel"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Spin>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 用户增长趋势 */}
        <Col span={12}>
          <Spin spinning={userGrowthLoading}>
            <Card title="用户增长趋势（近30天）" style={{ marginBottom: 24 }}>
              <Table
                columns={userGrowthColumns}
                dataSource={userGrowth.slice(0, 5)} // 只显示前5条数据
                rowKey="date"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Spin>
        </Col>

        {/* 金额分布统计 */}
        <Col span={12}>
          <Spin spinning={amountDistLoading}>
            <Card title="金额分布统计" style={{ marginBottom: 24 }}>
              <Table
                columns={amountDistributionColumns}
                dataSource={amountDistribution}
                rowKey="range"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Spin>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 支付渠道分布明细 */}
        <Col span={12}>
          <Spin spinning={paymentChannelsLoading}>
            <Card title="支付渠道占比明细" style={{ marginBottom: 24 }}>
              <Table
                columns={paymentChannelsColumns}
                dataSource={paymentChannels}
                rowKey="channel"
                pagination={{ pageSize: 5 }}
                size="small"
              />
            </Card>
          </Spin>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
