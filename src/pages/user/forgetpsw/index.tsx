import { LockOutlined, MobileOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { App, Button, Form, Input, Steps } from 'antd';
import React, { useState, useEffect } from 'react';
import { history } from '@umijs/max';
import { forgotPasswordStep1, forgotPasswordStep2, forgotPasswordStep3 } from '@/services/ant-design-pro/api';
import { TOKEN_KEY, USER_ID_KEY } from '@/config/apiConfig';
import './index.less';

const { Step } = Steps;

const ForgotPassword: React.FC = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  
  // 当前步骤：0=输入手机号，1=验证码验证，2=设置新密码
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // 存储手机号和验证码
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  /**
   * Step 1: 发送验证码
   */
  const handleStep1 = async (values: { phone: string }) => {
    try {
      setLoading(true);
      const result = await forgotPasswordStep1({
        phone_number: values.phone,
      });

      if (result.success) {
        message.success(result.message || '验证码发送成功');
        setPhoneNumber(values.phone);
        setCurrentStep(1);
        
        // 设置倒计时
        if (result.data?.remaining_seconds) {
          setCountdown(result.data.remaining_seconds);
        } else {
          setCountdown(60);
        }
      } else {
        message.error(result.message || '发送失败');
      }
    } catch (error: any) {
      message.error(error?.message || '发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: 验证验证码
   */
  const handleStep2 = async (values: { code: string }) => {
    try {
      setLoading(true);
      const result = await forgotPasswordStep2({
        phone_number: phoneNumber,
        code: values.code,
      });

      if (result.success) {
        message.success(result.message || '验证成功');
        setVerificationCode(values.code);
        setCurrentStep(2);
      } else {
        message.error(result.message || '验证失败');
      }
    } catch (error: any) {
      message.error(error?.message || '验证失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3: 设置新密码
   */
  const handleStep3 = async (values: { newPassword: string }) => {
    try {
      setLoading(true);
      const result = await forgotPasswordStep3({
        phone_number: phoneNumber,
        code: verificationCode,
        new_password: values.newPassword,
      });

      if (result.success && result.data) {
        message.success('密码重置成功，即将自动登录');
        
        // 保存 token 和用户信息
        if (result.data.access_token) {
          localStorage.setItem(TOKEN_KEY, result.data.access_token);
        }
        if (result.data.user?.id) {
          localStorage.setItem(USER_ID_KEY, result.data.user.id.toString());
        }
        
        // 跳转到首页或登录页
        setTimeout(() => {
          history.push('/home');
        }, 1000);
      } else {
        message.error(result.message || '密码重置失败');
      }
    } catch (error: any) {
      message.error(error?.message || '密码重置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 返回登录页
   */
  const handleBackToLogin = () => {
    history.push('/user/login');
  };

  /**
   * 重新发送验证码
   */
  const handleResendCode = async () => {
    try {
      setLoading(true);
      const result = await forgotPasswordStep1({
        phone_number: phoneNumber,
      });

      if (result.success) {
        message.success('验证码已重新发送');
        if (result.data?.remaining_seconds) {
          setCountdown(result.data.remaining_seconds);
        } else {
          setCountdown(60);
        }
      } else {
        message.error(result.message || '发送失败');
      }
    } catch (error: any) {
      message.error(error?.message || '发送失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {/* 顶部返回按钮 */}
      <div className="back-button">
        <Button 
          type="link" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBackToLogin}
        >
          返回登录
        </Button>
      </div>

      {/* 标题 */}
      <div className="forgot-password-header">
        <h1>找回密码</h1>
        <p>通过手机号验证找回密码</p>
      </div>

      {/* 步骤条 */}
      <Steps current={currentStep} className="steps-container">
        <Step title="验证手机号" />
        <Step title="验证身份" />
        <Step title="设置新密码" />
      </Steps>

      {/* 表单内容 */}
      <div className="form-container">
        {/* Step 1: 输入手机号 */}
        {currentStep === 0 && (
          <Form
            form={form}
            onFinish={handleStep1}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入有效的手机号' },
              ]}
            >
              <Input
                prefix={<MobileOutlined />}
                placeholder="请输入已注册的手机号"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                发送验证码
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Step 2: 验证验证码 */}
        {currentStep === 1 && (
          <Form
            form={form}
            onFinish={handleStep2}
            layout="vertical"
            size="large"
          >
            <div className="phone-display">
              <p>验证码已发送至：<strong>{phoneNumber}</strong></p>
            </div>

            <Form.Item
              name="code"
              label="验证码"
              rules={[
                { required: true, message: '请输入验证码' },
                { len: 6, message: '验证码为6位数字' },
              ]}
            >
              <Input
                prefix={<LockOutlined />}
                placeholder="请输入6位验证码"
                maxLength={6}
              />
            </Form.Item>

            <div className="resend-code">
              {countdown > 0 ? (
                <span className="countdown">{countdown}秒后可重新发送</span>
              ) : (
                <Button type="link" onClick={handleResendCode} loading={loading}>
                  重新发送验证码
                </Button>
              )}
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                下一步
              </Button>
            </Form.Item>
          </Form>
        )}

        {/* Step 3: 设置新密码 */}
        {currentStep === 2 && (
          <Form
            form={form}
            onFinish={handleStep3}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
                { max: 20, message: '密码最多20位' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入新密码（至少6位）"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入新密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                完成
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
