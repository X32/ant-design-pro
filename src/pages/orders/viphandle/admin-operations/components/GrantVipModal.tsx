import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, message, Spin, Alert } from 'antd';
import { CrownOutlined } from '@ant-design/icons';
import {
  getAdminVipPlans,
  getWalletByEmail,
  grantVip,
  type GrantVipRequest,
  type AdminVipPlan,
} from '@/services/ant-design-pro/api/adminOperations';

interface GrantVipModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const GrantVipModal: React.FC<GrantVipModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vipPlans, setVipPlans] = useState<AdminVipPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdminVipPlan | null>(null);

  // 加载VIP套餐
  useEffect(() => {
    if (visible) {
      loadVipPlans();
    }
  }, [visible]);

  const loadVipPlans = async () => {
    try {
      setPlansLoading(true);
      const response = await getAdminVipPlans();
      if (response.success) {
        setVipPlans(response.data || []);
      } else {
        message.error(response.message || '加载VIP套餐失败');
      }
    } catch (error: any) {
      message.error(error.message || '加载VIP套餐失败');
    } finally {
      setPlansLoading(false);
    }
  };

  // 选择套餐时更新默认天数
  const handlePlanChange = (planId: number) => {
    const plan = vipPlans.find((p) => p.id === planId);
    if (plan) {
      setSelectedPlan(plan);
      form.setFieldsValue({ duration_days: plan.duration_days });
    }
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setLoading(true);

      const requestData: GrantVipRequest = {
        user_id: values.user_id,
        plan_id: values.plan_id,
        remark: values.remark,
      };

      // 如果自定义了天数
      if (values.duration_days) {
        requestData.duration_days = values.duration_days;
      }

      const response = await grantVip(requestData);

      if (response.success) {
        message.success(response.message || 'VIP开通成功');
        form.resetFields();
        setSelectedPlan(null);
        onSuccess();
      } else {
        message.error(response.message || 'VIP开通失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error.message || 'VIP开通失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置表单
  const handleCancel = () => {
    form.resetFields();
    setSelectedPlan(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <span>
          <CrownOutlined style={{ marginRight: 8, color: '#722ed1' }} />
          开通VIP
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
        description="为用户开通VIP订阅，支持自定义天数和智能续费"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Spin spinning={plansLoading}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ duration_days: undefined }}
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
              placeholder="输入用户ID"
              style={{ width: '100%' }}
              min={1}
            />
          </Form.Item>

          <Form.Item
            label="VIP套餐"
            name="plan_id"
            rules={[{ required: true, message: '请选择VIP套餐' }]}
          >
            <Select
              placeholder="选择VIP套餐"
              onChange={handlePlanChange}
              options={vipPlans.map((plan) => ({
                label: `${plan.plan_name} - ${plan.exam_level} (${plan.duration_days}天) - ¥${(plan.sale_price / 100).toFixed(2)}`,
                value: plan.id,
              }))}
            />
          </Form.Item>

          {selectedPlan && (
            <Alert
              message="套餐信息"
              description={`${selectedPlan.description} | 原价: ¥${(selectedPlan.original_price / 100).toFixed(2)}`}
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Form.Item
            label="自定义天数（可选）"
            name="duration_days"
            extra="不填则使用套餐默认天数，可填1-3650天"
          >
            <InputNumber
              min={1}
              max={3650}
              placeholder="使用套餐默认天数"
              style={{ width: '100%' }}
              suffix="天"
            />
          </Form.Item>

          <Form.Item
            label="开通原因"
            name="remark"
            rules={[
              { required: true, message: '请输入开通原因' },
              { min: 1, max: 200, message: '长度为1-200字符' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="请输入开通原因，例如：活动赠送、客服补偿等"
              showCount
              maxLength={200}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default GrantVipModal;
