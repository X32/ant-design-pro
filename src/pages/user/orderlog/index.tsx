import { ArrowLeftOutlined, WalletOutlined, PlusCircleOutlined, MinusCircleOutlined, CrownOutlined } from '@ant-design/icons';
import { Button, Card, Table, Tabs, Tag, App } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import { getRechargeLog, getConsumeLog, getAllWalletLog } from '@/services/ant-design-pro/api';
import { getSubscriptionHistory, SubscriptionHistory } from '@/services/ant-design-pro/api/vipSubscription';
import dayjs from 'dayjs';
import './index.less';

// 流水记录类型
interface WalletLog {
  id: number;
  change_amount: number;
  balance_before: number;
  balance_after: number;
  biz_type: string;
  remark: string;
  created_at: string;
}

// 业务类型映射
const BIZ_TYPE_MAP: Record<string, { text: string; color: string }> = {
  'recharge_order': { text: '充值订单', color: 'green' },
  'consume_conversation': { text: 'AI对话练习', color: 'blue' },
  'consume_practice': { text: '口语练习', color: 'orange' },
  'consume_exam': { text: '模拟考试', color: 'purple' },
};

const OrderLog: React.FC = () => {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<WalletLog[]>([]);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionHistory[]>([]); // VIP订阅历史数据
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 返回上一页
  const handleBack = () => {
    history.back();
  };

  // 获取流水数据
  const fetchData = async (page: number = 1, pageSize: number = 20) => {
    setLoading(true);
    try {
      let response;
      
      if (activeTab === 'subscription') {
        // VIP订阅历史
        response = await getSubscriptionHistory({ page, page_size: pageSize });
        
        if (response.success && response.data) {
          setSubscriptionData(response.data.subscriptions);
          setPagination({
            current: response.data.page,
            pageSize: response.data.page_size,
            total: response.data.total,
          });
        } else {
          message.error(response.message || '查询订阅历史失败');
        }
      } else {
        // 金币流水
        switch (activeTab) {
          case 'recharge':
            response = await getRechargeLog({ page, page_size: pageSize });
            break;
          case 'consume':
            response = await getConsumeLog({ page, page_size: pageSize });
            break;
          case 'all':
          default:
            response = await getAllWalletLog({ page, page_size: pageSize });
            break;
        }

        if (response.success) {
          setDataSource(response.logs);
          setPagination({
            current: response.page,
            pageSize: response.page_size,
            total: response.total,
          });
        } else {
          message.error(response.message || '查询流水失败');
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || '查询失败';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 页面加载时查询数据
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // 处理分页变化
  const handleTableChange = (newPagination: any) => {
    fetchData(newPagination.current, newPagination.pageSize);
  };

  // 表格列定义
  const columns = [
    {
      title: '流水ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'biz_type',
      key: 'biz_type',
      width: 120,
      render: (bizType: string) => {
        const config = BIZ_TYPE_MAP[bizType] || { text: bizType, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '变动金额',
      dataIndex: 'change_amount',
      key: 'change_amount',
      width: 120,
      render: (amount: number) => {
        const isPositive = amount > 0;
        return (
          <span style={{ 
            color: isPositive ? '#52c41a' : '#ff4d4f',
            fontWeight: 'bold',
            fontSize: 16,
          }}>
            {isPositive ? <PlusCircleOutlined /> : <MinusCircleOutlined />}
            {' '}
            {isPositive ? `+${amount}` : amount} 金币
          </span>
        );
      },
    },
    {
      title: '变动前余额',
      dataIndex: 'balance_before',
      key: 'balance_before',
      width: 120,
      render: (balance: number) => `${balance} 金币`,
    },
    {
      title: '变动后余额',
      dataIndex: 'balance_after',
      key: 'balance_after',
      width: 120,
      render: (balance: number) => (
        <span style={{ fontWeight: 'bold', color: '#faad14' }}>
          {balance} 金币
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  // VIP订阅历史表格列定义
  const subscriptionColumns = [
    {
      title: '订阅ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: '考试级别',
      dataIndex: 'exam_level',
      key: 'exam_level',
      width: 100,
      render: (level: string) => (
        <Tag color="gold" icon={<CrownOutlined />}>
          {level}
        </Tag>
      ),
    },
    {
      title: '套餐类型',
      dataIndex: 'plan_type',
      key: 'plan_type',
      width: 120,
      render: (planType: string) => {
        const typeMap: Record<string, string> = {
          'monthly': '月卡',
          'quarterly': '季卡',
          'yearly': '年卡',
        };
        return typeMap[planType] || planType;
      },
    },
    {
      title: '订单号',
      dataIndex: 'order_no',
      key: 'order_no',
      width: 200,
      ellipsis: true,
    },
    {
      title: '支付金额',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ color: '#faad14', fontWeight: 'bold', fontSize: 16 }}>
          ¥{(amount / 100).toFixed(2)}
        </span>
      ),
    },
    {
      title: '首购',
      dataIndex: 'is_first_buy',
      key: 'is_first_buy',
      width: 80,
      render: (isFirst: number) => 
        isFirst === 1 ? <Tag color="green">首购</Tag> : <Tag>续费</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          'ACTIVE': { text: '生效中', color: 'green' },
          'EXPIRED': { text: '已过期', color: 'red' },
          'CANCELED': { text: '已取消', color: 'default' },
        };
        const config = statusMap[status] || { text: status, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '开始时间',
      dataIndex: 'start_time',
      key: 'start_time',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '结束时间',
      dataIndex: 'end_time',
      key: 'end_time',
      width: 180,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <WalletOutlined /> 全部流水
        </span>
      ),
    },
    {
      key: 'recharge',
      label: (
        <span>
          <PlusCircleOutlined /> 充值记录
        </span>
      ),
    },
    {
      key: 'consume',
      label: (
        <span>
          <MinusCircleOutlined /> 消费记录
        </span>
      ),
    },
    {
      key: 'subscription',
      label: (
        <span>
          <CrownOutlined /> VIP订阅历史
        </span>
      ),
    },
  ];

  return (
    <div className="order-log-container">
      {/* 顶部导航 */}
      <div className="log-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          size="large"
        >
          返回
        </Button>
        <h2>
          <WalletOutlined /> 流水记录
        </h2>
      </div>

      {/* 主内容 */}
      <div className="log-content">
        <Card>
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            onChange={setActiveTab}
            size="large"
          />

          <Table
            columns={activeTab === 'subscription' ? subscriptionColumns : columns}
            dataSource={(activeTab === 'subscription' ? subscriptionData : dataSource) as any}
            loading={loading}
            rowKey="id"
            pagination={pagination}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        </Card>
      </div>
    </div>
  );
};

export default OrderLog;
