import { ArrowLeftOutlined, WalletOutlined, PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Button, Card, Table, Tabs, Tag, App } from 'antd';
import React, { useEffect, useState } from 'react';
import { history } from '@umijs/max';
import { getRechargeLog, getConsumeLog, getAllWalletLog } from '@/services/ant-design-pro/api';
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
    } catch (error: any) {
      const errorMsg = error?.message || '查询流水失败';
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
            columns={columns}
            dataSource={dataSource}
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
