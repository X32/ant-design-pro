/**
 * 订单管理列表页面
 * 显示充值订单列表，支持筛选、排序、查看详情
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  message,
  Space,
  Modal,
  Card,
  Tooltip,
  DatePicker,
  Descriptions,
  Badge,
  Statistic,
  Row,
  Col,
  Timeline,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DollarOutlined,
  ShoppingOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
  getAdminOrders,
  getAdminOrderDetail,
  getOrderStatsOverview,
  type OrderItem,
  type OrderDetail,
  type OrderStatsOverview,
} from '@/services/ant-design-pro/api';
import './index.less';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 订单状态枚举（与后端一致）
const ORDER_STATUS = {
  ALL: '',
  CREATED: 'CREATED',
  PAID: 'PAID',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
};

// 订单状态中文映射
const ORDER_STATUS_MAP: Record<string, { text: string; color: string }> = {
  CREATED: { text: '待支付', color: 'orange' },
  PAID: { text: '已支付', color: 'blue' },
  COMPLETED: { text: '已完成', color: 'green' },
  CANCELED: { text: '已取消', color: 'default' },
};

// 支付渠道映射
const PAY_CHANNEL_MAP: Record<string, { text: string; color: string }> = {
  mock: { text: '模拟支付', color: 'purple' },
  wechat: { text: '微信支付', color: 'green' },
  alipay: { text: '支付宝', color: 'blue' },
};

// 时间范围快捷选项
const TIME_RANGES = {
  TODAY: 'today',
  WEEK: 'week',
  MONTH: 'month',
  CUSTOM: 'custom',
};

/**
 * 订单管理列表页面组件
 */
const OrderList: React.FC = () => {
  // 数据状态
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  // 统计数据
  const [stats, setStats] = useState<OrderStatsOverview | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // 分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
  });

  // 筛选状态
  const [searchUserId, setSearchUserId] = useState('');
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [timeRange, setTimeRange] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  // 排序状态
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // 详情弹窗状态
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [detailOrder, setDetailOrder] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /**
   * 获取日期范围
   */
  const getDateRange = useCallback((): { start_date?: string; end_date?: string } => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      return {
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
      };
    }

    const today = dayjs();
    switch (timeRange) {
      case TIME_RANGES.TODAY:
        return {
          start_date: today.format('YYYY-MM-DD'),
          end_date: today.format('YYYY-MM-DD'),
        };
      case TIME_RANGES.WEEK:
        return {
          start_date: today.subtract(7, 'day').format('YYYY-MM-DD'),
          end_date: today.format('YYYY-MM-DD'),
        };
      case TIME_RANGES.MONTH:
        return {
          start_date: today.subtract(30, 'day').format('YYYY-MM-DD'),
          end_date: today.format('YYYY-MM-DD'),
        };
      default:
        return {};
    }
  }, [timeRange, dateRange]);

  /**
   * 获取统计数据
   */
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await getOrderStatsOverview();
      if (response && response.success) {
        setStats(response.data);
      }
    } catch (error: any) {
      console.error('获取统计数据失败:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /**
   * 获取订单列表
   */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { start_date, end_date } = getDateRange();

      const params: Record<string, any> = {
        page: pagination.current,
        page_size: pagination.pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (selectedStatus) params.status = selectedStatus;
      if (searchUserId) params.user_id = parseInt(searchUserId, 10);
      if (searchOrderNo) params.order_no = searchOrderNo;
      if (start_date) params.start_date = start_date;
      if (end_date) params.end_date = end_date;

      const response = await getAdminOrders(params);

      if (response && response.success) {
        setOrders(response.data || []);
        setTotal(response.total || 0);
      } else {
        setOrders([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取订单列表失败:', error);
      message.error(error?.message || '获取订单列表失败');
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    pagination,
    sortBy,
    sortOrder,
    selectedStatus,
    searchUserId,
    searchOrderNo,
    getDateRange,
  ]);

  // 初始化加载
  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, []);

  // 筛选变化时重新加载
  useEffect(() => {
    fetchOrders();
  }, [pagination, sortBy, sortOrder]);

  /**
   * 处理分页变化
   */
  const handleTableChange = (
    paginationConfig: TablePaginationConfig,
    _filters: any,
    sorter: any,
  ) => {
    setPagination({
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 20,
    });

    if (sorter.field) {
      setSortBy(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
    fetchOrders();
  };

  /**
   * 重置筛选
   */
  const handleReset = () => {
    setSearchUserId('');
    setSearchOrderNo('');
    setSelectedStatus('');
    setTimeRange('');
    setDateRange(null);
    setSortBy('created_at');
    setSortOrder('desc');
    setPagination({ current: 1, pageSize: 20 });
  };

  /**
   * 刷新列表
   */
  const handleRefresh = () => {
    fetchStats();
    fetchOrders();
  };

  /**
   * 查看详情
   */
  const handleViewDetail = async (order: OrderItem) => {
    setDetailModalVisible(true);
    setDetailLoading(true);
    try {
      const response = await getAdminOrderDetail(order.order_no);
      if (response && response.success) {
        setDetailOrder(response.data);
      } else {
        message.error(response?.message || '获取订单详情失败');
      }
    } catch (error: any) {
      message.error(error?.message || '获取订单详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * 关闭详情弹窗
   */
  const handleDetailClose = () => {
    setDetailModalVisible(false);
    setDetailOrder(null);
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<OrderItem> = [
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 200,
      fixed: 'left',
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="order-no">{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '用户信息',
      key: 'user_info',
      width: 180,
      render: (_, record) => (
        <div className="user-info">
          <div className="user-id">ID: {record.user_id}</div>
          <div className="user-email" title={record.user_email}>
            {record.user_email}
          </div>
        </div>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'item_name',
      key: 'item_name',
      width: 120,
      ellipsis: true,
    },
    {
      title: '金币数量',
      dataIndex: 'coin_amount',
      key: 'coin_amount',
      width: 100,
      align: 'right',
      render: (amount: number) => (
        <span className="coin-amount">+{amount}</span>
      ),
    },
    {
      title: '订单金额',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 100,
      align: 'right',
      sorter: true,
      render: (amount: number) => (
        <span className="order-amount">¥{(amount / 100).toFixed(2)}</span>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: string) => {
        const statusInfo = ORDER_STATUS_MAP[status] || { text: status, color: 'default' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '支付渠道',
      dataIndex: 'pay_channel',
      key: 'pay_channel',
      width: 100,
      align: 'center',
      render: (channel: string) => {
        const channelInfo = PAY_CHANNEL_MAP[channel] || { text: channel, color: 'default' };
        return <Tag color={channelInfo.color}>{channelInfo.text}</Tag>;
      },
    },
    {
      title: '金币到账',
      dataIndex: 'has_wallet_log',
      key: 'has_wallet_log',
      width: 90,
      align: 'center',
      render: (hasLog: boolean) => (
        <Badge
          status={hasLog ? 'success' : 'warning'}
          text={hasLog ? '已到账' : '未到账'}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      sorter: true,
      defaultSortOrder: 'descend',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="order-list-page">
      {/* 统计卡片 */}
      <Row gutter={16} className="stats-row">
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="今日订单"
              value={stats?.today.orders || 0}
              prefix={<ShoppingOutlined />}
              suffix="笔"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="今日金额"
              value={(stats?.today.amount || 0) / 100}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="今日用户"
              value={stats?.today.users || 0}
              prefix={<UserOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={statsLoading}>
            <Statistic
              title="成功率"
              value={stats?.today.success_rate || 0}
              precision={2}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="page-card">
        {/* 筛选区域 */}
        <div className="filter-section">
          <div className="filter-row">
            <Input
              placeholder="用户ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              style={{ width: 120 }}
              allowClear
            />
            <Input
              placeholder="订单号"
              value={searchOrderNo}
              onChange={(e) => setSearchOrderNo(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              placeholder="订单状态"
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="">全部状态</Option>
              <Option value={ORDER_STATUS.CREATED}>待支付</Option>
              <Option value={ORDER_STATUS.PAID}>已支付</Option>
              <Option value={ORDER_STATUS.COMPLETED}>已完成</Option>
              <Option value={ORDER_STATUS.CANCELED}>已取消</Option>
            </Select>
            <Select
              placeholder="时间范围"
              value={timeRange}
              onChange={(value) => {
                setTimeRange(value);
                if (value !== TIME_RANGES.CUSTOM) {
                  setDateRange(null);
                }
              }}
              style={{ width: 120 }}
              allowClear
            >
              <Option value={TIME_RANGES.TODAY}>今天</Option>
              <Option value={TIME_RANGES.WEEK}>近7天</Option>
              <Option value={TIME_RANGES.MONTH}>近30天</Option>
              <Option value={TIME_RANGES.CUSTOM}>自定义</Option>
            </Select>
            {timeRange === TIME_RANGES.CUSTOM && (
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                style={{ width: 240 }}
              />
            )}
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </div>
        </div>

        {/* 表格 */}
        <Table
          className="order-table"
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条订单`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 订单详情弹窗 */}
      <Modal
        title="订单详情"
        open={detailModalVisible}
        onCancel={handleDetailClose}
        footer={[
          <Button key="close" onClick={handleDetailClose}>
            关闭
          </Button>,
        ]}
        width={800}
        loading={detailLoading}
      >
        {detailOrder && (
          <div className="order-detail">
            {/* 订单基本信息 */}
            <Descriptions title="订单信息" bordered column={2} size="small">
              <Descriptions.Item label="订单号" span={2}>
                {detailOrder.order.order_no}
              </Descriptions.Item>
              <Descriptions.Item label="商品名称">
                {detailOrder.order.item_name}
              </Descriptions.Item>
              <Descriptions.Item label="金币数量">
                <span className="coin-amount">+{detailOrder.order.coin_amount}</span>
              </Descriptions.Item>
              <Descriptions.Item label="订单金额">
                <span className="order-amount">
                  ¥{(detailOrder.order.total_amount / 100).toFixed(2)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="订单状态">
                {(() => {
                  const statusInfo = ORDER_STATUS_MAP[detailOrder.order.status] || {
                    text: detailOrder.order.status,
                    color: 'default',
                  };
                  return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="支付渠道">
                {(() => {
                  const channelInfo = PAY_CHANNEL_MAP[detailOrder.order.pay_channel] || {
                    text: detailOrder.order.pay_channel,
                    color: 'default',
                  };
                  return <Tag color={channelInfo.color}>{channelInfo.text}</Tag>;
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="支付单号">
                {detailOrder.order.pay_order_no || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {dayjs(detailOrder.order.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(detailOrder.order.updated_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="过期时间">
                {dayjs(detailOrder.order.expired_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="金币到账">
                <Badge
                  status={detailOrder.has_wallet_log ? 'success' : 'warning'}
                  text={detailOrder.has_wallet_log ? '已到账' : '未到账'}
                />
              </Descriptions.Item>
            </Descriptions>

            {/* 用户信息 */}
            <Descriptions title="用户信息" bordered column={2} size="small" style={{ marginTop: 24 }}>
              <Descriptions.Item label="用户ID">
                {detailOrder.user.user_id}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">
                {detailOrder.user.email}
              </Descriptions.Item>
              <Descriptions.Item label="当前余额">
                <span className="coin-amount">{detailOrder.user.current_balance} 金币</span>
              </Descriptions.Item>
              <Descriptions.Item label="账户状态">
                <Badge
                  status={detailOrder.user.is_active ? 'success' : 'error'}
                  text={detailOrder.user.is_active ? '正常' : '禁用'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="累计订单">
                {detailOrder.user.total_orders} 笔
              </Descriptions.Item>
              <Descriptions.Item label="累计充值">
                ¥{(detailOrder.user.total_recharge_amount / 100).toFixed(2)}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间" span={2}>
                {dayjs(detailOrder.user.created_at).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            </Descriptions>

            {/* 钱包流水 */}
            {detailOrder.wallet_logs && detailOrder.wallet_logs.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4>钱包流水</h4>
                <Timeline
                  items={detailOrder.wallet_logs.map((log) => ({
                    color: log.change_amount > 0 ? 'green' : 'red',
                    children: (
                      <div>
                        <div>
                          <strong>
                            {log.change_amount > 0 ? '+' : ''}{log.change_amount} 金币
                          </strong>
                        </div>
                        <div style={{ color: '#666', fontSize: 12 }}>
                          余额: {log.balance_before} → {log.balance_after}
                        </div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          {log.remark}
                        </div>
                        <div style={{ color: '#999', fontSize: 12 }}>
                          {dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderList;
