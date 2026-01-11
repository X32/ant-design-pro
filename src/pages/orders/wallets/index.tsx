/**
 * 用户钱包列表页面
 * 管理用户钱包余额，支持查看流水和手动调整
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  message,
  Space,
  Modal,
  Card,
  Tooltip,
  Form,
  Input,
  InputNumber,
  Drawer,
  Descriptions,
  Tag,
  Statistic,
  Row,
  Col,
  Timeline,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  WalletOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getAdminWallets,
  getAdminWalletDetail,
  getAdminWalletLogs,
  adjustAdminWallet,
  type WalletItem,
  type WalletDetail,
  type WalletLog,
  type WalletListParams,
  type WalletAdjustParams,
} from '@/services/ant-design-pro/api';
import './index.less';

const { TextArea } = Input;

// 流水类型映射
const BIZ_TYPE_MAP: Record<string, { text: string; color: string }> = {
  recharge_order: { text: '充值订单', color: 'green' },
  consume: { text: '消费', color: 'orange' },
  admin_adjust: { text: '管理员调整', color: 'blue' },
  refund: { text: '退款', color: 'purple' },
};

/**
 * 用户钱包列表页面组件
 */
const WalletList: React.FC = () => {
  // 数据状态
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // 筛选条件
  const [searchUserId, setSearchUserId] = useState<number | undefined>(undefined);
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [minBalance, setMinBalance] = useState<number | undefined>(undefined);
  const [maxBalance, setMaxBalance] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('balance');
  const [sortOrder, setSortOrder] = useState<string>('desc');

  // 弹窗状态
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [logsDrawerVisible, setLogsDrawerVisible] = useState(false);
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [currentWallet, setCurrentWallet] = useState<WalletItem | null>(null);
  const [walletDetail, setWalletDetail] = useState<WalletDetail | null>(null);
  const [walletLogs, setWalletLogs] = useState<WalletLog[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsPageSize] = useState(50);
  const [adjusting, setAdjusting] = useState(false);

  const [adjustForm] = Form.useForm();

  /**
   * 获取钱包列表
   */
  const fetchWallets = useCallback(async () => {
    setLoading(true);
    try {
      const params: WalletListParams = {
        page: currentPage,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (searchUserId) params.user_id = searchUserId;
      if (searchEmail) params.user_email = searchEmail;
      if (minBalance !== undefined) params.min_balance = minBalance;
      if (maxBalance !== undefined) params.max_balance = maxBalance;

      const response = await getAdminWallets(params);

      if (response && response.success) {
        setWallets(response.data || []);
        setTotal(response.total || 0);
      } else {
        setWallets([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('获取钱包列表失败:', error);
      message.error(error?.message || '获取钱包列表失败');
      setWallets([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchUserId, searchEmail, minBalance, maxBalance, sortBy, sortOrder]);

  // 初始化加载
  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  /**
   * 刷新列表
   */
  const handleRefresh = () => {
    fetchWallets();
  };

  /**
   * 搜索
   */
  const handleSearch = () => {
    setCurrentPage(1);
    fetchWallets();
  };

  /**
   * 重置筛选
   */
  const handleReset = () => {
    setSearchUserId(undefined);
    setSearchEmail('');
    setMinBalance(undefined);
    setMaxBalance(undefined);
    setSortBy('balance');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  /**
   * 查看钱包详情
   */
  const handleViewDetail = async (wallet: WalletItem) => {
    setCurrentWallet(wallet);
    setDetailDrawerVisible(true);

    try {
      const response = await getAdminWalletDetail(wallet.user_id);
      if (response && response.success) {
        setWalletDetail(response.data);
      }
    } catch (error: any) {
      message.error(error?.message || '获取钱包详情失败');
    }
  };

  /**
   * 查看流水
   */
  const handleViewLogs = async (wallet: WalletItem) => {
    setCurrentWallet(wallet);
    setLogsDrawerVisible(true);
    setLogsPage(1);
    await fetchWalletLogs(wallet.user_id, 1);
  };

  /**
   * 获取钱包流水
   */
  const fetchWalletLogs = async (userId: number, page: number) => {
    try {
      const response = await getAdminWalletLogs(userId, {
        page,
        page_size: logsPageSize,
      });

      if (response && response.success) {
        setWalletLogs(response.data || []);
        setLogsTotal(response.total || 0);
      } else {
        setWalletLogs([]);
        setLogsTotal(0);
      }
    } catch (error: any) {
      message.error(error?.message || '获取流水失败');
      setWalletLogs([]);
      setLogsTotal(0);
    }
  };

  /**
   * 手动调整余额
   */
  const handleAdjust = (wallet: WalletItem) => {
    setCurrentWallet(wallet);
    adjustForm.resetFields();
    setAdjustModalVisible(true);
  };

  /**
   * 提交调整
   */
  const handleAdjustSubmit = async () => {
    if (!currentWallet) return;

    try {
      const values = await adjustForm.validateFields();
      setAdjusting(true);

      const params: WalletAdjustParams = {
        change_amount: values.change_amount,
        remark: values.remark,
      };

      const response = await adjustAdminWallet(currentWallet.user_id, params);

      if (response.success) {
        message.success(response.message || '调整成功');
        setAdjustModalVisible(false);
        adjustForm.resetFields();
        fetchWallets();
      } else {
        throw new Error(response.message || '调整失败');
      }
    } catch (error: any) {
      message.error(error?.message || '调整失败');
    } finally {
      setAdjusting(false);
    }
  };

  /**
   * 表格列定义
   */
  const columns: ColumnsType<WalletItem> = [
    {
      title: '用户ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 80,
      align: 'center',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '昵称',
      dataIndex: 'username',
      key: 'username',
      width: 120,
      ellipsis: true,
    },
    {
      title: '当前余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      align: 'right',
      sorter: true,
      render: (balance: number) => (
        <span className="balance-amount" style={{ color: '#52c41a', fontWeight: 600 }}>
          {balance}
        </span>
      ),
    },
    {
      title: '冻结余额',
      dataIndex: 'frozen_balance',
      key: 'frozen_balance',
      width: 100,
      align: 'right',
      render: (frozen: number) => (
        <span style={{ color: frozen > 0 ? '#faad14' : '#8c8c8c' }}>
          {frozen}
        </span>
      ),
    },
    {
      title: '总充值',
      dataIndex: 'total_recharge',
      key: 'total_recharge',
      width: 100,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#1890ff' }}>{amount}</span>
      ),
    },
    {
      title: '总消费',
      dataIndex: 'total_consume',
      key: 'total_consume',
      width: 100,
      align: 'right',
      render: (amount: number) => (
        <span style={{ color: '#ff4d4f' }}>{amount}</span>
      ),
    },
    {
      title: '最后交易时间',
      dataIndex: 'last_transaction_time',
      key: 'last_transaction_time',
      width: 160,
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
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
          <Tooltip title="查看流水">
            <Button
              type="text"
              size="small"
              icon={<WalletOutlined />}
              onClick={() => handleViewLogs(record)}
            />
          </Tooltip>
          <Tooltip title="手动调整">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleAdjust(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="wallet-list-page">
      <Card className="page-card">
        {/* 筛选栏 */}
        <div className="filter-bar">
          <Space wrap>
            <Input
              placeholder="用户ID"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value ? Number(e.target.value) : undefined)}
              style={{ width: 120 }}
              allowClear
            />
            <Input
              placeholder="用户邮箱"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              style={{ width: 180 }}
              allowClear
            />
            <InputNumber
              placeholder="最小余额"
              value={minBalance}
              onChange={(val) => setMinBalance(val ?? undefined)}
              style={{ width: 120 }}
            />
            <InputNumber
              placeholder="最大余额"
              value={maxBalance}
              onChange={(val) => setMaxBalance(val ?? undefined)}
              style={{ width: 120 }}
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
          className="wallet-table"
          columns={columns}
          dataSource={wallets}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (t) => `共 ${t} 个钱包`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size || 20);
            },
          }}
          onChange={(pagination, filters, sorter: any) => {
            if (sorter.field === 'balance') {
              setSortBy('balance');
              setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
            }
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 钱包详情抽屉 */}
      <Drawer
        title="钱包详情"
        open={detailDrawerVisible}
        onClose={() => setDetailDrawerVisible(false)}
        width={600}
      >
        {walletDetail && (
          <div>
            <Card title="用户信息" size="small" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="用户ID">{walletDetail.user.user_id}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{walletDetail.user.email}</Descriptions.Item>
                <Descriptions.Item label="昵称">{walletDetail.user.username}</Descriptions.Item>
                <Descriptions.Item label="账号状态">
                  <Tag color={walletDetail.user.is_active ? 'green' : 'red'}>
                    {walletDetail.user.is_active ? '正常' : '禁用'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  {dayjs(walletDetail.user.created_at).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="钱包余额" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="当前余额" value={walletDetail.wallet.balance} suffix="金币" valueStyle={{ color: '#52c41a' }} />
                </Col>
                <Col span={12}>
                  <Statistic title="冻结余额" value={walletDetail.wallet.frozen_balance} suffix="金币" valueStyle={{ color: '#faad14' }} />
                </Col>
              </Row>
            </Card>

            <Card title="统计信息" size="small">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="总充值金额">
                  <span style={{ color: '#1890ff', fontWeight: 600 }}>{walletDetail.statistics.total_recharge}</span> 金币
                </Descriptions.Item>
                <Descriptions.Item label="总消费金额">
                  <span style={{ color: '#ff4d4f', fontWeight: 600 }}>{walletDetail.statistics.total_consume}</span> 金币
                </Descriptions.Item>
                <Descriptions.Item label="交易次数">{walletDetail.statistics.transaction_count}</Descriptions.Item>
                <Descriptions.Item label="最后交易时间">
                  {walletDetail.statistics.last_transaction_time
                    ? dayjs(walletDetail.statistics.last_transaction_time).format('YYYY-MM-DD HH:mm:ss')
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        )}
      </Drawer>

      {/* 流水记录抽屉 */}
      <Drawer
        title={`流水记录 - ${currentWallet?.username || ''}`}
        open={logsDrawerVisible}
        onClose={() => setLogsDrawerVisible(false)}
        width={700}
      >
        <Timeline
          items={walletLogs.map((log) => ({
            color: log.change_amount > 0 ? 'green' : 'red',
            children: (
              <div className="log-item">
                <div className="log-header">
                  <Space>
                    <Tag color={BIZ_TYPE_MAP[log.biz_type]?.color || 'default'}>
                      {BIZ_TYPE_MAP[log.biz_type]?.text || log.biz_type}
                    </Tag>
                    <span className="log-time">{dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                  </Space>
                  <span
                    className="log-amount"
                    style={{
                      color: log.change_amount > 0 ? '#52c41a' : '#ff4d4f',
                      fontWeight: 600,
                      fontSize: 16,
                    }}
                  >
                    {log.change_amount > 0 ? '+' : ''}{log.change_amount}
                  </span>
                </div>
                <div className="log-balance">
                  余额：{log.balance_before} → {log.balance_after}
                </div>
                {log.remark && <div className="log-remark">备注：{log.remark}</div>}
              </div>
            ),
          }))}
        />
        {logsTotal > logsPageSize && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Button
              onClick={() => {
                const nextPage = logsPage + 1;
                setLogsPage(nextPage);
                if (currentWallet) {
                  fetchWalletLogs(currentWallet.user_id, nextPage);
                }
              }}
              disabled={logsPage * logsPageSize >= logsTotal}
            >
              加载更多
            </Button>
          </div>
        )}
      </Drawer>

      {/* 手动调整余额弹窗 */}
      <Modal
        title={`调整余额 - ${currentWallet?.username || ''}`}
        open={adjustModalVisible}
        onOk={handleAdjustSubmit}
        onCancel={() => setAdjustModalVisible(false)}
        confirmLoading={adjusting}
        destroyOnClose
      >
        {currentWallet && (
          <div style={{ marginBottom: 16 }}>
            <p>当前余额：<span style={{ color: '#52c41a', fontWeight: 600, fontSize: 16 }}>{currentWallet.balance}</span> 金币</p>
          </div>
        )}
        <Form form={adjustForm} layout="vertical" preserve={false}>
          <Form.Item
            name="change_amount"
            label="变动金额"
            rules={[
              { required: true, message: '请输入变动金额' },
              { type: 'number', message: '请输入数字' },
              {
                validator: (_, value) => {
                  if (value === 0) {
                    return Promise.reject('变动金额不能为0');
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra="正数为增加，负数为减少"
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="例如：100 或 -50"
            />
          </Form.Item>

          <Form.Item
            name="remark"
            label="调整原因"
            rules={[
              { required: true, message: '请输入调整原因' },
              { max: 200, message: '原因最长200个字符' },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="请说明调整原因，例如：系统补偿、错误订单扣减等"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default WalletList;
