import { ArrowLeftOutlined, LockOutlined, MailOutlined, UserOutlined, CreditCardOutlined } from '@ant-design/icons';
import { App, Avatar, Button, Card, Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { history, useModel } from '@umijs/max';
import { currentUser, updateUserProfile, updateUserPassword } from '@/services/ant-design-pro/api';
import './index.less';

const UserProfile: React.FC = () => {
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        email: user.email,
        name: user.name || user.email?.split('@')[0],
      });
    }
  }, [user, profileForm]);

  // 返回首页
  const handleBack = () => {
    history.push('/home');
  };

  // 跳转到充值页面
  const handleRecharge = () => {
    history.push('/orders/recharge');
  };

  // 更新个人信息
  const handleUpdateProfile = async (values: any) => {
    try {
      setLoading(true);
      const response = await updateUserProfile({
        email: values.email,
        name: values.name,
      });

      if (response.success) {
        message.success('个人信息更新成功');
        // 重新加载用户信息
        const userResponse = await currentUser();
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data.user;
          const updatedUser = {
            ...userData,
            name: userData.email?.split('@')[0] || 'User',
            userid: userData.id?.toString(),
            access: userData.is_superuser ? 'admin' : 'user',
          };
          setInitialState((s) => ({ ...s, currentUser: updatedUser }));
        }
      } else {
        message.error(response.message || '更新失败');
      }
    } catch (error) {
      message.error('更新失败，请重试');
      console.error('更新个人信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const handleUpdatePassword = async (values: any) => {
    try {
      setPasswordLoading(true);
      const response = await updateUserPassword({
        old_password: values.oldPassword,
        new_password: values.newPassword,
      });

      if (response.success) {
        message.success('密码修改成功，请重新登录');
        passwordForm.resetFields();
        // 跳转到登录页
        setTimeout(() => {
          localStorage.clear();
          history.push('/user/login');
        }, 1500);
      } else {
        message.error(response.message || '密码修改失败');
      }
    } catch (error) {
      message.error('密码修改失败，请重试');
      console.error('修改密码失败:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="user-profile-container">
      {/* 顶部导航 */}
      <div className="profile-header">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
          size="large"
        >
          返回首页
        </Button>
      </div>

      {/* 主内容 */}
      <div className="profile-content">
        <div className="profile-sidebar">
          <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <h2 className="user-name">{user?.name || user?.email?.split('@')[0]}</h2>
          <p className="user-email">{user?.email}</p>
          <p className="user-role">{user?.access === 'admin' ? '管理员' : '普通用户'}</p>
          {/* 充值入口按钮 */}
          <Button 
            type="primary" 
            icon={<CreditCardOutlined />} 
            onClick={handleRecharge}
            style={{ marginTop: 24, width: '100%' }}
          >
            账户充值
          </Button>
        </div>

        <div className="profile-main">
          {/* 个人信息表单 */}
          <Card title="个人信息" style={{ marginBottom: 24 }}>
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="请输入邮箱" 
                  size="large"
                  disabled // 邮箱通常不允许修改
                />
              </Form.Item>

              <Form.Item
                name="name"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="请输入用户名" 
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} size="large">
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>

          {/* 修改密码表单 */}
          <Card title="修改密码">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="请输入当前密码" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码至少6位' },
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="请输入新密码（至少6位）" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认新密码"
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
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={passwordLoading} size="large">
                  修改密码
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;