/**
 * 全局钱包流水页面
 * 显示所有用户的钱包流水记录，支持多维度筛选
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Space,
  DatePicker,
  Select,
  Input,
  Button,
  message,
  Tag,
  Timeline,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getGlobalWalletLogs,
  type WalletLog,
  type GlobalWalletLogParams,
} from '@/services/ant-design-pro/api';
import './index.less';

const { RangePicker } = DatePicker;
const { Option } = Select;

// 流水类型映射
const BIZ_TYPE_MAP: Record<string, { text: string; color: string }> = {
  recharge_order: { text: '充值订单', color: 'green' },
  consume: { text: '消费', color: 'orange' },
  admin_adjust: { text: '管理员调整', color: 'blue' },
  refund: { text: '退款', color: 'purple' },
};

/**
 * 全局钱包流水页面组件
 */
const GlobalWalletLogs: React.FC = () => {
  // 数据状态
  const [logs, setLogs] = useState<WalletLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  // 筛选条件
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  /**
   * 处理日期范围选择
   */
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]]);
    } else {
      setDateRange(null);
    }
  };
  const [bizType, setBizType] = useState<string | undefined>(undefined);
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);

  /**
   * 获取全局钱包流水
   */
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: GlobalWalletLogParams = {
        page: currentPage,
        page_size: pageSize,
      };

      if (userId) params.user_id = userId;
      if (dateRange) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      if (bizType) params.biz_type = bizType;
      if (minAmount !== undefined) params.min_amount = minAmount;
      if (maxAmount !== undefined) params.max_amount = maxAmount;

      const response = await getGlobalWalletLogs(params);

      if (response && response.success) {
        setLogs(response.data || []);
        setTotal(response.total || 0);
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取全局钱包流水失败:', error);
      message.error(error?.message || '获取全局钱包流水失败');
      setLogs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, userId, dateRange, bizType, minAmount, maxAmount]);

  // 初始化加载
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  /**
   * 刷新列表
   */
  const handleRefresh = () => {
    fetchLogs();
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  /**
   * 重置筛选
   */
  const handleReset = () => {
    setUserId(undefined);
    setDateRange(null);
    setBizType(undefined);
    setMinAmount(undefined);
    setMaxAmount(undefined);
    setCurrentPage(1);
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<WalletLog> = [
    {
      title: '流水ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 100,
      align: 'center',
    },
    {
      title: '变动金额',
      dataIndex: 'change_amount',
      key: 'change_amount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: amount > 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }}>
          {amount > 0 ? '+' : ''}{amount}
        </span>
      ),
    },
    {
      title: '变动前余额',
      dataIndex: 'balance_before',
      key: 'balance_before',
      width: 120,
      align: 'right',
      render: (balance: number) => (
        <span style={{ color: '#8c8c8c' }}>{balance}</span>
      ),
    },
    {
      title: '变动后余额',
      dataIndex: 'balance_after',
      key: 'balance_after',
      width: 120,
      align: 'right',
      render: (balance: number) => (
        <span style={{ color: '#1890ff', fontWeight: 600 }}>{balance}</span>
      ),
    },
    {
      title: '业务类型',
      dataIndex: 'biz_type',
      key: 'biz_type',
      width: 120,
      render: (type: string) => {
        const bizInfo = BIZ_TYPE_MAP[type];
        return bizInfo ? (
          <Tag color={bizInfo.color}>{bizInfo.text}</Tag>
        ) : (
          <Tag>{type}</Tag>
        );
      },
    },
    {
      title: '业务ID',
      dataIndex: 'biz_id',
      key: 'biz_id',
      width: 100,
      align: 'center',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  return (
    <div className="global-wallet-logs-page">
      <Card className="page-card">
        {/* 筛选栏 */}
        <div className="filter-bar">
          <Space wrap>
            <Input
              placeholder="用户ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: 120 }}
              allowClear
            />
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder={['开始日期', '结束日期']}
              style={{ width: 240 }}
            />
            <Select
              placeholder="业务类型"
              value={bizType}
              onChange={setBizType}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="recharge_order">充值订单</Option>
              <Option value="consume">消费</Option>
              <Option value="admin_adjust">管理员调整</Option>
              <Option value="refund">退款</Option>
            </Select>
            <Input
              placeholder="最小金额"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: 100 }}
              allowClear
            />
            <Input
              placeholder="最大金额"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: 100 }}
              allowClear
            />
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              搜索
            </Button>
            <Button onClick={handleReset}>重置</Button>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
              刷新
            </Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          className="wallet-logs-table"
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 条流水记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 50);
            },
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default GlobalWalletLogs;
