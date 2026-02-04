import React, { useState } from 'react';
import { Modal, Form, Input, InputNumber, message, Alert, Typography, Space, Statistic } from 'antd';
import { DollarOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import {
  getWalletByEmail,
  getWalletDetail,
  adjustBalance,
  type AdjustBalanceRequest,
  type WalletDetail,
} from '@/services/ant-design-pro/api/adminOperations';

const { Text } = Typography;

interface AdjustCoinsModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const AdjustCoinsModal: React.FC<AdjustCoinsModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [walletDetail, setWalletDetail] = useState<WalletDetail | null>(null);

  // 查询用户钱包信息
  const handleUserIdBlur = async () => {
    const userId = form.getFieldValue('user_id');
    if (!userId) return;

    try {
      const detailResponse = await getWalletDetail(userId);
      if (detailResponse.success) {
        setWalletDetail(detailResponse.data);
        message.success(`找到用户: ${detailResponse.data.user.email} (余额: ${detailResponse.data.wallet.balance})`);
      } else {
        setWalletDetail(null);
        message.error('未找到该用户或钱包不存在');
      }
    } catch (error: any) {
      setWalletDetail(null);
      message.error(error.message || '查询用户失败');
    }
  };

  // 计算调整后余额
  const getNewBalance = () => {
    if (!walletDetail) return 0;
    const changeAmount = form.getFieldValue('change_amount') || 0;
    return walletDetail.wallet.balance + changeAmount;
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!walletDetail) {
        message.error('请先输入用户ID并查询钱包信息');
        return;
      }

      // 验证余额不会为负
      const newBalance = getNewBalance();
      if (newBalance < 0) {
        message.error(`调整后余额不能为负数（当前余额: ${walletDetail.wallet.balance}）`);
        return;
      }

      // 确认操作
      const changeAmount = values.change_amount;
      const confirmText = changeAmount > 0
        ? `确定为用户增加 ${changeAmount} 金币吗？`
        : `确定为用户减少 ${Math.abs(changeAmount)} 金币吗？`;

      Modal.confirm({
        title: '确认操作',
        content: (
          <div>
            <p>{confirmText}</p>
            <p>用户ID: {walletDetail.user.user_id}</p>
            <p>用户邮箱: {walletDetail.user.email}</p>
            <p>当前余额: {walletDetail.wallet.balance}</p>
            <p>调整后余额: {newBalance}</p>
          </div>
        ),
        onOk: async () => {
          setLoading(true);

          try {
            const requestData: AdjustBalanceRequest = {
              change_amount: values.change_amount,
              remark: values.remark,
            };

            const response = await adjustBalance(walletDetail.user.user_id, requestData);

            if (response.success) {
              message.success(response.message || '金币调整成功');
              form.resetFields();
              setWalletDetail(null);
              onSuccess();
            } else {
              message.error(response.message || '金币调整失败');
            }
          } catch (error: any) {
            message.error(error.message || '金币调整失败');
          } finally {
            setLoading(false);
          }
        },
      });
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
    }
  };

  // 重置表单
  const handleCancel = () => {
    form.resetFields();
    setWalletDetail(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <span>
          <DollarOutlined style={{ marginRight: 8, color: '#faad14' }} />
          调整金币
        </span>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Alert
        message="提示"
        description="正数表示增加金币，负数表示减少金币。调整后余额不能为负数。"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="用户ID"
          name="user_id"
          rules={[
            { required: true, message: '请输入用户ID' },
            { type: 'number', message: '请输入有效的用户ID' },
          ]}
        >
          <InputNumber
            placeholder="输入用户ID后自动查询钱包"
            onBlur={handleUserIdBlur}
            style={{ width: '100%' }}
            min={1}
          />
        </Form.Item>

        {walletDetail && (
          <Alert
            message="用户钱包信息"
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>用户ID: {walletDetail.user.user_id}</Text>
                <Text>当前余额: <Text strong>{walletDetail.wallet.balance}</Text> 金币</Text>
                <Text>冻结余额: {walletDetail.wallet.frozen_balance} 金币</Text>
                <Text>累计充值: {walletDetail.statistics.total_recharge} 金币</Text>
                <Text>累计消费: {walletDetail.statistics.total_consume} 金币</Text>
                <Text>交易次数: {walletDetail.statistics.transaction_count} 次</Text>
              </Space>
            }
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form.Item
          label="调整金额"
          name="change_amount"
          rules={[
            { required: true, message: '请输入调整金额' },
            {
              validator: (_, value) => {
                if (!walletDetail) return Promise.resolve();
                const newBalance = walletDetail.wallet.balance + (value || 0);
                if (newBalance < 0) {
                  return Promise.reject(new Error(`调整后余额不能为负数（当前余额: ${walletDetail.wallet.balance}）`));
                }
                return Promise.resolve();
              },
            },
          ]}
          extra={
            <Space>
              <Text type="secondary">正数表示增加，负数表示减少</Text>
              {walletDetail && (
                <Text type={getNewBalance() >= 0 ? 'success' : 'danger'}>
                  调整后余额: {getNewBalance()}
                </Text>
              )}
            </Space>
          }
        >
          <InputNumber
            style={{ width: '100%' }}
            placeholder="输入调整金额"
            controls={{
              upIcon: <PlusOutlined />,
              downIcon: <MinusOutlined />,
            }}
          />
        </Form.Item>

        <Form.Item
          label="调整原因"
          name="remark"
          rules={[
            { required: true, message: '请输入调整原因' },
            { min: 1, max: 200, message: '长度为1-200字符' },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请输入调整原因，例如：系统补偿、异常退款等"
            showCount
            maxLength={200}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdjustCoinsModal;
