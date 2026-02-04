import React, { useState, useEffect, useRef } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Card, Select, DatePicker, Space, message, Tag, Typography, Statistic, Row, Col } from 'antd';
import { ReloadOutlined, CrownOutlined, DollarOutlined, BarChartOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import type { Dayjs } from 'dayjs';
import {
  getOperationLogs,
  getOperationStatistics,
  type OperationLog,
  type OperationType,
} from '@/services/ant-design-pro/api/adminOperations';
import GrantVipModal from './components/GrantVipModal';
import AdjustCoinsModal from './components/AdjustCoinsModal';

const { RangePicker } = DatePicker;
const { Text } = Typography;

const AdminOperationsPage: React.FC = () => {
  const actionRef = useRef<ActionType>(null);
  const { initialState } = useModel('@@initialState');
  
  const [operationType, setOperationType] = useState<OperationType>('all');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([null, null]);
  const [grantVipVisible, setGrantVipVisible] = useState(false);
  const [adjustCoinsVisible, setAdjustCoinsVisible] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    const user = initialState?.currentUser;
    if (!user?.is_superuser) {
      message.error('需要超级管理员权限');
      history.push('/');
    }
  }, [initialState]);

  const loadStatistics = async () => {
    try {
      const params: any = {};
      if (dateRange[0] && dateRange[1]) {
        params.start_date = dateRange[0].format('YYYY-MM-DD');
        params.end_date = dateRange[1].format('YYYY-MM-DD');
      }
      const response = await getOperationStatistics(params);
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  useEffect(() => {
    loadStatistics();
  }, [dateRange]);

  const columns: ProColumns<OperationLog>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 120,
      ellipsis: true,
      search: false,
    },
    {
      title: '操作类型',
      dataIndex: 'operation_type',
      width: 120,
      valueEnum: {
        grant_vip: { text: 'VIP开通', status: 'Processing' },
        adjust_balance: { text: '金币调整', status: 'Success' },
      },
      render: (_, record) => {
        if (record.operation_type === 'grant_vip') {
          return <Tag color="purple" icon={<CrownOutlined />}>VIP开通</Tag>;
        }
        return <Tag color="gold" icon={<DollarOutlined />}>金币调整</Tag>;
      },
    },
    {
      title: '操作员',
      dataIndex: 'operator_email',
      width: 200,
      ellipsis: true,
      render: (text: any) => text || '-',
    },
    {
      title: '用户ID',
      dataIndex: 'user_id',
      width: 100,
    },
    {
      title: '用户邮箱',
      dataIndex: 'user_email',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作描述',
      dataIndex: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: '数量',
      dataIndex: 'amount',
      width: 100,
      render: (text: any, record: OperationLog) => {
        if (record.operation_type === 'grant_vip') {
          return <Text>{text} 天</Text>;
        }
        const amount = Number(text);
        return (
          <Text type={amount > 0 ? 'success' : 'danger'}>
            {amount > 0 ? '+' : ''}{amount}
          </Text>
        );
      },
    },
    {
      title: '原因/备注',
      dataIndex: 'remark',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作时间',
      dataIndex: 'created_at',
      width: 180,
      valueType: 'dateTime',
      sorter: true,
    },
  ];

  const handleRefresh = () => {
    actionRef.current?.reload();
    loadStatistics();
  };

  return (
    <PageContainer
      header={{
        title: '管理员操作面板',
        subTitle: '管理VIP开通和金币调整',
        extra: [
          <Button key="refresh" icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>,
        ],
      }}
    >
      {statistics && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={6}>
              <Statistic
                title="总操作次数"
                value={statistics.total_operations}
                prefix={<BarChartOutlined />}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="VIP开通次数"
                value={statistics.grant_vip_count}
                prefix={<CrownOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="累计发放金币"
                value={statistics.total_coins_granted}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col span={6}>
              <Statistic
                title="累计扣减金币"
                value={statistics.total_coins_deducted}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Col>
          </Row>
        </Card>
      )}

      <ProTable<OperationLog>
        actionRef={actionRef}
        rowKey="id"
        search={false}
        toolbar={{
          actions: [
            <Button key="grantVip" type="primary" icon={<CrownOutlined />} onClick={() => setGrantVipVisible(true)}>
              开通VIP
            </Button>,
            <Button key="adjustCoins" type="primary" icon={<DollarOutlined />} onClick={() => setAdjustCoinsVisible(true)}>
              调整金币
            </Button>,
          ],
        }}
        toolBarRender={() => [
          <Space key="filters">
            <Select
              style={{ width: 150 }}
              value={operationType}
              onChange={(value: OperationType) => {
                setOperationType(value);
                actionRef.current?.reload();
              }}
              options={[
                { label: '全部操作', value: 'all' },
                { label: 'VIP开通', value: 'grant_vip' },
                { label: '金币调整', value: 'adjust_balance' },
              ]}
            />
            <RangePicker
              value={dateRange}
              onChange={(dates) => {
                setDateRange(dates as [Dayjs | null, Dayjs | null]);
                actionRef.current?.reload();
              }}
              placeholder={['开始日期', '结束日期']}
            />
          </Space>,
        ]}
        columns={columns}
        request={async (params) => {
          try {
            const requestParams: any = {
              page: params.current,
              page_size: params.pageSize,
            };

            if (operationType && operationType !== 'all') {
              requestParams.operation_type = operationType;
            }

            if (dateRange[0] && dateRange[1]) {
              requestParams.start_date = dateRange[0].format('YYYY-MM-DD');
              requestParams.end_date = dateRange[1].format('YYYY-MM-DD');
            }

            const response = await getOperationLogs(requestParams);

            if (response.success) {
              return {
                data: response.data || [],
                total: response.total || 0,
                success: true,
              };
            }

            message.error(response.message || '查询失败');
            return {
              data: [],
              total: 0,
              success: false,
            };
          } catch (error: any) {
            message.error(error.message || '查询失败');
            return {
              data: [],
              total: 0,
              success: false,
            };
          }
        }}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      />

      <GrantVipModal
        visible={grantVipVisible}
        onCancel={() => setGrantVipVisible(false)}
        onSuccess={() => {
          setGrantVipVisible(false);
          handleRefresh();
        }}
      />

      <AdjustCoinsModal
        visible={adjustCoinsVisible}
        onCancel={() => setAdjustCoinsVisible(false)}
        onSuccess={() => {
          setAdjustCoinsVisible(false);
          handleRefresh();
        }}
      />
    </PageContainer>
  );
};

export default AdminOperationsPage;
