import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  HistoryOutlined,
  LockOutlined,
  LogoutOutlined,
  PhoneOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { App, Avatar, Button, Card, Form, Input, Spin, Statistic } from 'antd';
import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import {
  changeUsername,
  currentUser,
  updateUserPassword,
  updateUserProfile,
} from '@/services/ant-design-pro/api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, CONVERSATION_ID_KEY } from '@/config/apiConfig';
import './index.less';

const UserProfile: React.FC = () => {
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};

  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [usernameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // 使用钱包 Hook
  const { balance, loading: walletLoading, fetchBalance } = useWallet();

  /**
   * 截断过长文本，保留首尾字符
   * @param text 原始文本
   * @param maxLength 最大长度（默认20）
   * @param headLength 保留开头字符数（默认8）
   * @param tailLength 保留结尾字符数（默认6）
   * @returns 处理后的文本
   */
  const truncateMiddle = (
    text: string | undefined,
    maxLength: number = 20,
    headLength: number = 8,
    tailLength: number = 6,
  ): string => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    const head = text.slice(0, headLength);
    const tail = text.slice(-tailLength);
    return `${head}...${tail}`;
  };

  useEffect(() => {
    if (user) {
      usernameForm.setFieldsValue({
        username: user.name || user.email?.split('@')[0],
      });
    }
  }, [user, usernameForm]);

  // 查询钱包余额
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // 返回首页
  const handleBack = () => {
    //返回上一页
    history.back();
  };

  // 跳转到充值页面
  const handleRecharge = () => {
    history.push('/orders/recharge');
  };

  // 跳转到流水记录页面
  const handleViewLog = () => {
    history.push('/user/orderlog');
  };

  // 退出登录
  const handleLogout = () => {
    // 清除所有认证相关的 localStorage 数据
    const keysToRemove = [
      TOKEN_KEY,              // access_token
      REFRESH_TOKEN_KEY,      // refresh_token
      USER_ID_KEY,            // user_id
      CONVERSATION_ID_KEY,    // current_conversation_id
      'wechat_state',         // 微信登录状态（如果有）
      'wechat_openid',        // 微信 openid（如果有）
      'wechat_unionid',       // 微信 unionid（如果有）
    ];
    
    // 逐个删除指定的 key
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // 清除全局用户状态
    if (setInitialState) {
      setInitialState((s) => ({
        ...s,
        currentUser: undefined,
      }));
    }
    
    message.success('已退出登录');
    
    // 跳转到登录页
    setTimeout(() => {
      history.push('/user/login');
    }, 300);
  };

  // 修改用户名
  const handleUpdateUsername = async (values: any) => {
    try {
      setUsernameLoading(true);
      const response = await changeUsername({
        new_username: values.username,
      });

      if (response.success) {
        message.success('用户名修改成功');
        // 重新加载用户信息
        const userResponse = await currentUser();
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data.user;
          const updatedUser = {
            ...userData,
            name: userData.username || userData.email?.split('@')[0] || 'User',
            userid: userData.id?.toString(),
            access: userData.is_superuser ? 'admin' : 'user',
          };
          setInitialState((s) => ({ ...s, currentUser: updatedUser }));
        }
      } else {
        message.error(response.message || '用户名修改失败');
      }
    } catch (error) {
      message.error('用户名修改失败，请重试');
      console.error('修改用户名失败:', error);
    } finally {
      setUsernameLoading(false);
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
          返回
        </Button>
      </div>

      {/* 主内容 */}
      <div className="profile-content">
        <div className="profile-sidebar">
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1890ff' }}
          />
          <h2 className="user-name" title={user?.name || user?.email?.split('@')[0]}>
            {truncateMiddle(user?.name || user?.email?.split('@')[0], 20, 8, 6)}
          </h2>
          {user?.email && user.email.includes('@sms.local') ? (
            <p className="user-phone" title={user.email.split('@')[0]}>
              <PhoneOutlined /> {truncateMiddle(user.email.split('@')[0], 18, 7, 5)}
            </p>
          ) : (
            <p className="user-email" title={user?.email}>
              {truncateMiddle(user?.email, 24, 10, 8)}
            </p>
          )}
          <p className="user-role">
            {user?.access === 'admin' ? '管理员' : '普通用户'}
          </p>

          {/* 钱包余额显示 */}
          <Card
            className="wallet-card"
            style={{ marginTop: 24, width: '100%' }}
            bodyStyle={{ padding: '16px' }}
          >
            <Spin spinning={walletLoading}>
              <div style={{ textAlign: 'center' }}>
                <WalletOutlined
                  style={{ fontSize: 32, color: '#faad14', marginBottom: 8 }}
                />
                <div style={{ marginBottom: 8 }}>
                  <Statistic
                    title="金币余额"
                    value={balance?.balance || 0}
                    suffix="金币"
                    valueStyle={{
                      color: '#faad14',
                      fontSize: 28,
                      fontWeight: 'bold',
                    }}
                  />
                </div>
                {balance && !balance.exists && (
                  <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                    钱包未创建，请先充值
                  </div>
                )}
              </div>
            </Spin>
          </Card>

          {/* 充值入口按钮 */}
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={handleRecharge}
            style={{ marginTop: 16, width: '100%' }}
            size="large"
          >
            账户充值
          </Button>

          {/* 流水记录入口按钮 */}
          <Button
            icon={<HistoryOutlined />}
            onClick={handleViewLog}
            style={{ marginTop: 12, width: '100%' }}
            size="large"
          >
            流水记录
          </Button>

          {/* 退出登录按钮 */}
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ marginTop: 12, width: '100%' }}
            size="large"
          >
            退出登录
          </Button>
        </div>

        <div className="profile-main">
          {/* 修改用户名表单 */}
          <Card title="修改用户名" style={{ marginBottom: 24 }}>
            <Form
              form={usernameForm}
              layout="vertical"
              onFinish={handleUpdateUsername}
            >
              <Form.Item
                name="username"
                label="用户名(修改后登录用户名也修改为此用户名)"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                  { max: 20, message: '用户名最多20个字符' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={usernameLoading}
                  size="large"
                >
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
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={passwordLoading}
                  size="large"
                >
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
