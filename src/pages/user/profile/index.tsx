import {
  ArrowLeftOutlined,
  CommentOutlined,
  CreditCardOutlined,
  CrownOutlined,
  HistoryOutlined,
  LockOutlined,
  LogoutOutlined,
  PhoneOutlined,
  UserOutlined,
  WalletOutlined,
  EditOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { App, Avatar, Button, Card, Form, Input, Spin, Statistic, Tag, List } from 'antd';
import React, { useEffect, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import LoginModal from '@/components/LoginModal';
import {
  changeUsername,
  currentUser,
  updateUserPassword,
  updateUserProfile,
  getMyArticlePermissions,
} from '@/services/ant-design-pro/api';
import { getMySubscription, UserSubscription, RenewalOption } from '@/services/ant-design-pro/api/vipSubscription';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, CONVERSATION_ID_KEY } from '@/config/apiConfig';
import './index.less';

const UserProfile: React.FC = () => {
  const { message } = App.useApp();
  const { initialState, setInitialState } = useModel('@@initialState');
  const { currentUser: user } = initialState || {};
  const isLoggedIn = !!user;

  const [loading, setLoading] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [usernameForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  // 文章权限状态
  const [articlePermissions, setArticlePermissions] = useState<API.MyPermissionItem[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);
  const [hasCreatePermission, setHasCreatePermission] = useState(false);

  // 使用钱包 Hook
  const { balance, loading: walletLoading, fetchBalance } = useWallet();

  // VIP订阅状态
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]); // 改为数组
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

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

  // 查询钱包余额（仅在已登录时）
  useEffect(() => {
    if (isLoggedIn) {
      fetchBalance();
    }
  }, [isLoggedIn, fetchBalance]);

  // 查询VIP订阅状态（仅在已登录时）
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isLoggedIn) return;

      try {
        setSubscriptionLoading(true);
        const response = await getMySubscription();

        if (response.success && response.data) {
          setHasSubscription(response.data.has_subscription);
          setSubscriptions(response.data.subscriptions || []); // 设置订阅数组
          console.log('VIP订阅信息:', response.data);
        } else {
          console.error('获取VIP订阅失败:', response.message);
        }
      } catch (error) {
        console.error('获取VIP订阅失败:', error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchSubscription();
  }, [isLoggedIn]);

  // 查询文章权限（仅在已登录时）
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!isLoggedIn) return;

      try {
        setPermissionsLoading(true);
        const response = await getMyArticlePermissions();

        if (response.success && response.data) {
          setArticlePermissions(response.data.permissions || []);
          // 检查是否有创建文章的激活权限
          const hasCreate = response.data.permissions?.some(
            (p) => p.permission_type === 'create' && p.status === 'active'
          );
          setHasCreatePermission(hasCreate || false);
          console.log('文章权限信息:', response.data);
        } else {
          console.error('获取文章权限失败:', response.message);
        }
      } catch (error) {
        console.error('获取文章权限失败:', error);
      } finally {
        setPermissionsLoading(false);
      }
    };

    fetchPermissions();
  }, [isLoggedIn]);

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

  // 跳转到反馈页面
  const handleFeedback = () => {
    history.push('/user/feedback');
  };

  // 跳转到写文章页面
  const handleWriteArticle = () => {
    history.push('/articles/edit');
  };

  // 跳转到我的文章页面
  const handleMyArticles = () => {
    history.push('/user/articles');
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
    
    // 跳转到首页并打开登录弹框
    setTimeout(() => {
      history.push('/home');
    }, 300);
  };

  // 登录成功回调
  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
    message.success('登录成功');
  };

  // 打开登录弹框
  const handleOpenLogin = () => {
    setLoginModalVisible(true);
  };

  // 如果未登录，显示提示页面
  if (!isLoggedIn) {
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

        {/* 未登录提示 */}
        <div className="profile-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#FFD93D',
            padding: '60px',
            borderRadius: '30px 25px 35px 20px',
            border: '4px solid #000',
            boxShadow: '8px 8px 0px #000',
            transform: 'rotate(-1deg)'
          }}>
            <UserOutlined style={{ fontSize: 80, color: '#1A535C', marginBottom: 24 }} />
            <h2 style={{ fontSize: 28, color: '#1A535C', marginBottom: 16, fontWeight: 900, textShadow: '2px 2px 0px #FFF' }}>
              请先登录
            </h2>
            <p style={{ fontSize: 16, color: '#1A535C', marginBottom: 32, fontWeight: 700 }}>
              登录后可以查看和管理您的个人信息
            </p>
            <Button
              type="primary"
              size="large"
              onClick={handleOpenLogin}
              style={{
                background: '#FF6B6B',
                border: '3px solid #000',
                borderRadius: '25px 20px 30px 15px',
                boxShadow: '4px 4px 0px #000',
                fontWeight: 700,
                color: 'white',
                height: 'auto',
                padding: '0.8rem 2.5rem'
              }}
            >
              立即登录
            </Button>
          </div>
        </div>

        {/* 登录弹框 */}
        <LoginModal
          visible={loginModalVisible}
          onCancel={() => setLoginModalVisible(false)}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

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
        // 清除认证信息并跳转到首页
        setTimeout(() => {
          localStorage.clear();
          
          // 清除全局用户状态
          if (setInitialState) {
            setInitialState((s) => ({
              ...s,
              currentUser: undefined,
            }));
          }
          
          history.push('/home');
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
            style={{ backgroundColor: '#FFD93D', color: '#1A535C' }}
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

          {/* 用户ID显示 */}
          <div className="user-id-card">
            <span className="user-id-label">用户ID：</span>
            <span className="user-id-value">{user?.userid || '-'}</span>
            <Button
              type="text"
              size="small"
              onClick={() => {
                navigator.clipboard.writeText(user?.userid || '');
                message.success('用户ID已复制到剪贴板');
              }}
              style={{ fontSize: '12px', padding: '0 4px' }}
            >
              复制
            </Button>
          </div>

          {/* 钱包余额显示 */}
          <Card
            className="wallet-card"
            style={{ marginTop: 24, width: '100%' }}
            bodyStyle={{ padding: '16px' }}
          >
            <Spin spinning={walletLoading}>
              <div style={{ textAlign: 'center' }}>
                <WalletOutlined
                  style={{ fontSize: 32, color: '#FF6B6B', marginBottom: 8 }}
                />
                <div style={{ marginBottom: 8 }}>
                  <Statistic
                    title="金币余额"
                    value={balance?.balance || 0}
                    suffix="金币"
                    valueStyle={{
                      color: '#FF6B6B',
                      fontSize: 28,
                      fontWeight: 900,
                      textShadow: '2px 2px 0px #000',
                    }}
                  />
                </div>
                {balance && !balance.exists && (
                  <div style={{ fontSize: 12, color: '#1A535C', marginTop: 8, fontWeight: 700 }}>
                    钱包未创建，请先充值
                  </div>
                )}
              </div>
            </Spin>
          </Card>

          {/* VIP订阅信息卡片 - 支持多个订阅 */}
          {hasSubscription && subscriptions.length > 0 ? (
            subscriptions.map((subscription, index) => (
              <div key={subscription.id}>
                <Card
                  className="vip-subscription-card"
                  style={{ marginTop: index === 0 ? 16 : 12, width: '100%' }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <Spin spinning={subscriptionLoading}>
                    <div style={{ textAlign: 'center' }}>
                      <CrownOutlined
                        style={{
                          fontSize: 32,
                          color: '#FF6B6B',
                          marginBottom: 8
                        }}
                      />

                      {/* 订阅信息 */}
                      <div style={{ marginBottom: 8 }}>
                        <div style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: '#1A535C',
                          marginBottom: 4
                        }}>
                          VIP会员
                        </div>
                        <Tag style={{
                          fontSize: 14,
                          padding: '4px 12px',
                          background: '#FFD93D',
                          border: '2px solid #000',
                          borderRadius: '8px 12px 6px 10px',
                          fontWeight: 'bold',
                          boxShadow: '2px 2px 0px #000',
                          color: '#1A535C'
                        }}>
                          {subscription.exam_level} 级别
                        </Tag>
                      </div>

                      {subscription.status === 'ACTIVE' ? (
                        <>
                          <div style={{ fontSize: 14, color: '#52c41a', marginTop: 8, fontWeight: 700 }}>
                            ✓ 订阅生效中
                          </div>
                          <div style={{ fontSize: 12, color: '#1A535C', marginTop: 4, fontWeight: 600 }}>
                            剩余 {subscription.remaining_days} 天
                          </div>
                          <div style={{ fontSize: 12, color: '#1A535C', marginTop: 4, fontWeight: 600 }}>
                            到期时间：{new Date(subscription.end_time).toLocaleDateString()}
                          </div>
                        </>
                      ) : subscription.status === 'EXPIRED' ? (
                        <div style={{ fontSize: 14, color: '#FF6B6B', marginTop: 8, fontWeight: 700 }}>
                          已过期
                        </div>
                      ) : (
                        <div style={{ fontSize: 14, color: '#999', marginTop: 8, fontWeight: 700 }}>
                          已取消
                        </div>
                      )}
                    </div>
                  </Spin>
                </Card>

                {/* 续费选项卡片 - 每个订阅对象自己的续费选项 */}
                {subscription.renewal_options && subscription.renewal_options.length > 0 && (
                  <Card
                    title={
                      <span style={{ fontSize: 16, fontWeight: 900, color: '#1A535C' }}>
                        <CrownOutlined style={{ marginRight: 6, color: '#FF6B6B' }} />
                        续费套餐选择
                      </span>
                    }
                    style={{ marginTop: 12, width: '100%', background: '#FFF9E6' }}
                    bodyStyle={{ padding: '12px' }}
                  >
                    <List
                      size="small"
                      dataSource={subscription.renewal_options}
                      renderItem={(option) => (
                        <List.Item
                          key={option.plan_id}
                          style={{
                            padding: '12px',
                            marginBottom: '8px',
                            border: option.is_recommended ? '3px solid #FFD93D' : '2px solid #000',
                            borderRadius: '12px 15px 10px 18px',
                            backgroundColor: option.is_recommended ? '#FFD93D' : '#FFF',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '3px 3px 0px rgba(0, 0, 0, 0.1)'
                          }}
                          onClick={() => {
                            message.info(`选择 ${option.plan_name}，请前往充值页面购买`);
                            history.push('/orders/recharge');
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '5px 5px 0px #000';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '3px 3px 0px rgba(0, 0, 0, 0.1)';
                          }}
                        >
                          <div style={{ width: '100%' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: 6
                            }}>
                              <div>
                                <span style={{
                                  fontSize: 15,
                                  fontWeight: 900,
                                  color: option.is_recommended ? '#FF6B6B' : '#1A535C'
                                }}>
                                  {option.plan_name}
                                </span>
                                {option.is_recommended === 1 && (
                                  <Tag style={{
                                    marginLeft: 8,
                                    fontSize: 11,
                                    background: '#FF6B6B',
                                    color: 'white',
                                    border: '2px solid #000',
                                    borderRadius: '6px 8px 4px 7px',
                                    fontWeight: 'bold',
                                    boxShadow: '2px 2px 0px #000'
                                  }}>
                                    推荐
                                  </Tag>
                                )}
                              </div>
                              <span style={{
                                fontSize: 16,
                                fontWeight: 900,
                                color: '#FF6B6B',
                                textShadow: '1px 1px 0px #000'
                              }}>
                                ¥{(option.price / 100).toFixed(2)}
                              </span>
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: 12,
                              color: '#1A535C',
                              fontWeight: 600
                            }}>
                              <span>{option.duration_days} 天</span>
                              <span>
                                到期时间: {new Date(option.expected_end_time).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                )}
              </div>
            ))
          ) : (
            /* 无订阅：显示提示 */
            <Card
              className="vip-subscription-card"
              style={{ marginTop: 16, width: '100%' }}
              bodyStyle={{ padding: '16px' }}
            >
              <Spin spinning={subscriptionLoading}>
                <div style={{ textAlign: 'center' }}>
                  <CrownOutlined
                    style={{
                      fontSize: 32,
                      color: '#999',
                      marginBottom: 8
                    }}
                  />
                  <div style={{ marginBottom: 8 }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: '#1A535C',
                      marginBottom: 4
                    }}>
                      暂无VIP订阅
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#1A535C', marginTop: 8, fontWeight: 600 }}>
                    订阅VIP享受无限次练习
                  </div>
                </div>
              </Spin>
            </Card>
          )}

          {/* 充值入口按钮 */}
          <Button
            type="primary"
            icon={<CreditCardOutlined />}
            onClick={handleRecharge}
            style={{
              marginTop: 16,
              width: '100%',
              background: '#4ECDC4',
              border: '3px solid #000',
              borderRadius: '20px 15px 25px 18px',
              boxShadow: '4px 4px 0px #000',
              fontWeight: 700,
              color: '#1A535C',
              height: 'auto',
              padding: '0.6rem 1.5rem'
            }}
            size="large"
          >
            账户充值
          </Button>

          {/* 流水记录入口按钮 */}
          <Button
            icon={<HistoryOutlined />}
            onClick={handleViewLog}
            style={{
              marginTop: 12,
              width: '100%',
              background: '#FFD93D',
              border: '3px solid #000',
              borderRadius: '18px 22px 16px 20px',
              boxShadow: '4px 4px 0px #000',
              fontWeight: 700,
              color: '#1A535C',
              height: 'auto',
              padding: '0.6rem 1.5rem'
            }}
            size="large"
          >
            流水记录
          </Button>

          {/* 用户反馈入口按钮 */}
          <Button
            icon={<CommentOutlined />}
            onClick={handleFeedback}
            style={{
              marginTop: 12,
              width: '100%',
              background: '#4ECDC4',
              border: '3px solid #000',
              borderRadius: '16px 20px 18px 22px',
              boxShadow: '4px 4px 0px #000',
              fontWeight: 700,
              color: '#1A535C',
              height: 'auto',
              padding: '0.6rem 1.5rem'
            }}
            size="large"
          >
            用户反馈
          </Button>

          {/* 写文章入口按钮 - 根据权限显示 */}
          {hasCreatePermission ? (
            <Button
              icon={<EditOutlined />}
              onClick={handleWriteArticle}
              style={{
                marginTop: 12,
                width: '100%',
                background: '#FFD93D',
                border: '3px solid #000',
                borderRadius: '18px 20px 16px 22px',
                boxShadow: '4px 4px 0px #000',
                fontWeight: 700,
                color: '#1A535C',
                height: 'auto',
                padding: '0.6rem 1.5rem'
              }}
              size="large"
            >
              写文章
            </Button>
          ) : (
            <Spin spinning={permissionsLoading} tip="检查权限中...">
              <Button
                disabled
                style={{
                  marginTop: 12,
                  width: '100%',
                  background: '#999',
                  border: '3px solid #000',
                  borderRadius: '18px 20px 16px 22px',
                  boxShadow: '4px 4px 0px #000',
                  fontWeight: 700,
                  color: '#666',
                  height: 'auto',
                  padding: '0.6rem 1.5rem'
                }}
                size="large"
              >
                暂无写文章权限
              </Button>
            </Spin>
          )}

          {/* 我的文章入口按钮 */}
          <Button
            icon={<FileTextOutlined />}
            onClick={handleMyArticles}
            style={{
              marginTop: 12,
              width: '100%',
              background: '#4ECDC4',
              border: '3px solid #000',
              borderRadius: '16px 20px 18px 22px',
              boxShadow: '4px 4px 0px #000',
              fontWeight: 700,
              color: '#1A535C',
              height: 'auto',
              padding: '0.6rem 1.5rem'
            }}
            size="large"
          >
            我的文章
          </Button>

          {/* 退出登录按钮 */}
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              marginTop: 12,
              width: '100%',
              background: '#FF6B6B',
              border: '3px solid #000',
              borderRadius: '22px 18px 20px 16px',
              boxShadow: '4px 4px 0px #000',
              fontWeight: 700,
              color: 'white',
              height: 'auto',
              padding: '0.6rem 1.5rem'
            }}
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
      
      {/* 登录弹框 */}
      <LoginModal
        visible={loginModalVisible}
        onCancel={() => setLoginModalVisible(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default UserProfile;
