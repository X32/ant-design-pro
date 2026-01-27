import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {
  FormattedMessage,
  Helmet,
  SelectLang,
  useIntl,
  useModel,
  history,
} from '@umijs/max';
import { App, Tabs, Modal, Form, Input, Alert } from 'antd';
import { createStyles } from 'antd-style';
import React, { useState } from 'react';
import { flushSync } from 'react-dom';
import { Footer } from '@/components';
import { login, sendSmsCode, smsLogin, setPassword } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import { TOKEN_KEY, USER_ID_KEY } from '@/config/apiConfig';
import Settings from '../../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    action: {
      marginLeft: '8px',
      color: 'rgba(0, 0, 0, 0.2)',
      fontSize: '24px',
      verticalAlign: 'middle',
      cursor: 'pointer',
      transition: 'color 0.3s',
      '&:hover': {
        color: token.colorPrimaryActive,
      },
    },
    lang: {
      width: 42,
      height: 42,
      lineHeight: '42px',
      position: 'fixed',
      right: 16,
      borderRadius: token.borderRadius,
      ':hover': {
        backgroundColor: token.colorBgTextHover,
      },
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const ActionIcons = () => {
  const { styles } = useStyles();

  return (
    <>
      <AlipayCircleOutlined
        key="AlipayCircleOutlined"
        className={styles.action}
      />
      <TaobaoCircleOutlined
        key="TaobaoCircleOutlined"
        className={styles.action}
      />
      <WeiboCircleOutlined
        key="WeiboCircleOutlined"
        className={styles.action}
      />
    </>
  );
};

const Lang = () => {
  const { styles } = useStyles();

  return (
    <div className={styles.lang} data-lang>
      {SelectLang && <SelectLang />}
    </div>
  );
};

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => {
  return (
    <Alert
      style={{
        marginBottom: 24,
      }}
      message={content}
      type="error"
      showIcon
    />
  );
};

const Login: React.FC = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState<string>('account'); // 默认用户名密码登录
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const { message, modal } = App.useApp();
  const intl = useIntl();
  
  // 调试：组件挂载时输出日志
  React.useEffect(() => {
    console.log('[Admin Login] 组件已挂载');
    console.log('[Admin Login] 当前路径:', window.location.pathname);
    console.log('[Admin Login] 当前用户:', initialState?.currentUser);
  }, []);
  
  // 设置密码模态框状态
  const [setPasswordModalVisible, setSetPasswordModalVisible] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [passwordForm] = Form.useForm();
  const [countdown, setCountdown] = useState(0);

  // 倒计时逻辑
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };
  
  /**
   * 处理登录成功后的逻辑
   */
  const handleLoginSuccess = (result: any, isAutoRegistered: boolean = false) => {
    const { access_token, user } = result.data;
    
    // 保存token
    if (access_token) {
      localStorage.setItem(TOKEN_KEY, access_token);
    }
    
    // 保存用户ID
    if (user && user.id) {
      localStorage.setItem(USER_ID_KEY, user.id.toString());
    }
    
    // 更新用户信息到state
    if (user) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: {
            ...user,
            name: user.email?.split('@')[0] || 'User',
            userid: user.id?.toString(),
            access: user.is_superuser ? 'admin' : 'user',
          },
        }));
      });
    }
    
    // 如果是手机号自动注册，提示设置密码
    if (isAutoRegistered) {
      message.success('登录成功（首次登录已自动注册）');
      setCurrentUserData(result.data);
      setSetPasswordModalVisible(true);
    } else {
      const successMessage = result.message || '登录成功！';
      message.success(successMessage);
      
      // 跳转逻辑
      const urlParams = new URL(window.location.href).searchParams;
      const redirect = urlParams.get('redirect');
      let defaultPath = '/home';
      if (user && user.is_superuser) {
        defaultPath = '/back/welcome';
      }
      
      setTimeout(() => {
        history.push(redirect || defaultPath);
      }, 100);
    }
  };
  
  /**
   * 处理邮箱密码登录
   */
  const handleEmailLogin = async (values: API.LoginParams) => {
    try {
      const result = await login({ ...values, type });
      
      if (result.success && result.data) {
        handleLoginSuccess(result, false);
        return;
      }
      
      const errorMessage = result.error || '登录失败，请重试！';
      message.error(errorMessage);
      setUserLoginState({ status: 'error', type });
    } catch (error: any) {
      const errorMessage = error?.message || '登录失败，请重试！';
      console.error(error);
      message.error(errorMessage);
      setUserLoginState({ status: 'error', type });
    }
  };
  
  /**
   * 处理手机号验证码登录
   */
  const handleSmsLogin = async (values: { mobile: string; captcha: string }) => {
    try {
      const result = await smsLogin({
        phone_number: values.mobile,
        code: values.captcha,
      });
      
      if (result.success && result.data) {
        const isAutoRegistered = result.data.auto_registered || false;
        handleLoginSuccess(result, isAutoRegistered);
        return;
      }
      
      const errorMessage = result.message || '登录失败，请检查验证码';
      message.error(errorMessage);
      setUserLoginState({ status: 'error', type: 'mobile' });
    } catch (error: any) {
      const errorMessage = error?.message || '登录失败，请重试！';
      console.error(error);
      message.error(errorMessage);
      setUserLoginState({ status: 'error', type: 'mobile' });
    }
  };
  
  /**
   * 处理表单提交
   */
  const handleSubmit = async (values: any) => {
    if (type === 'account') {
      await handleEmailLogin(values);
    } else {
      await handleSmsLogin(values);
    }
  };
  
  /**
   * 发送短信验证码
   */
  const handleSendSmsCode = async (phoneNumber: string) => {
    try {
      // 前端防刷：检查发送频率（5分钟内最多3次）
      const SEND_HISTORY_KEY = 'sms_send_history';
      const MAX_SENDS_PER_5MIN = 3;
      const FIVE_MINUTES = 5 * 60 * 1000;
      
      const history = JSON.parse(localStorage.getItem(SEND_HISTORY_KEY) || '[]');
      const now = Date.now();
      const recentSends = history.filter((time: number) => now - time < FIVE_MINUTES);
      
      if (recentSends.length >= MAX_SENDS_PER_5MIN) {
        message.error('发送过于频繁，请5分钟后再试');
        return;
      }
      
      const result = await sendSmsCode({ phone_number: phoneNumber });
      
      if (result.success) {
        // 记录本次发送时间
        const newHistory = [...recentSends, now];
        localStorage.setItem(SEND_HISTORY_KEY, JSON.stringify(newHistory));
        
        message.success(result.message || '验证码发送成功');
        // 固定60秒倒计时
        setCountdown(60);
      } else {
        message.error(result.message || '验证码发送失败');
      }
    } catch (error: any) {
      message.error(error?.message || '验证码发送失败');
    }
  };
  
  /**
   * 处理设置密码
   */
  const handleSetPassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      
      const result = await setPassword({
        new_password: values.password,
      });
      
      if (result.success) {
        message.success('密码设置成功，下次可以使用用户名密码登录');
        setSetPasswordModalVisible(false);
        passwordForm.resetFields();
        
        // 跳转到首页
        const urlParams = new URL(window.location.href).searchParams;
        const redirect = urlParams.get('redirect');
        let defaultPath = '/home';
        if (currentUserData?.user?.is_superuser) {
          defaultPath = '/back/welcome';
        }
        
        setTimeout(() => {
          history.push(redirect || defaultPath);
        }, 100);
      } else {
        message.error(result.message || '密码设置失败');
      }
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error?.message || '密码设置失败');
    }
  };
  
  /**
   * 跳过设置密码
   */
  const handleSkipSetPassword = () => {
    setSetPasswordModalVisible(false);
    passwordForm.resetFields();
    
    // 跳转到首页
    const urlParams = new URL(window.location.href).searchParams;
    const redirect = urlParams.get('redirect');
    let defaultPath = '/home';
    if (currentUserData?.user?.is_superuser) {
      defaultPath = '/back/welcome';
    }
    
    setTimeout(() => {
      history.push(redirect || defaultPath);
    }, 100);
  };
  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          {intl.formatMessage({
            id: 'menu.login',
            defaultMessage: '登录页',
          })}
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>
      <Lang />
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" src="/logo.svg" />}
          title="英语口语学习平台"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          //登录初始值
          initialValues={{
            autoLogin: true,
           
          }}
          actions={[
            <FormattedMessage
              key="loginWith"
              id="pages.login.loginWith"
              defaultMessage="其他登录方式"
            />,
            <ActionIcons key="icons" />,
          ]}
          onFinish={async (values) => {
            await handleSubmit(values as API.LoginParams);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '用户名密码登录',
              },
              {
                key: 'mobile',
                label: '手机号登录',
              },
            ]}
          />

          {status === 'error' && loginType === 'account' && (
            <LoginMessage content="用户名或密码错误" />
          )}
          {type === 'account' && (
            <>
              <ProFormText
                name="email"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder="请输入用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名！',
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码: ant.design',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {status === 'error' && loginType === 'mobile' && (
            <LoginMessage content="验证码错误或已过期" />
          )}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined />,
                }}
                name="mobile"
                placeholder="请输入手机号"
                rules={[
                  {
                    required: true,
                    message: '请输入手机号！',
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: '手机号格式错误！',
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder="请输入验证码"
                captchaTextRender={(timing, count) => {
                  if (countdown > 0) {
                    return `${countdown} 秒后重试`;
                  }
                  if (timing) {
                    return `${count} 秒后重试`;
                  }
                  return '获取验证码';
                }}
                name="captcha"
                phoneName="mobile"
                rules={[
                  {
                    required: true,
                    message: '请输入验证码！',
                  },
                  {
                    len: 6,
                    message: '验证码为6位数字',
                  },
                ]}
                onGetCaptcha={async (mobile) => {
                  if (!mobile) {
                    message.error('请先输入手机号');
                    throw new Error('请先输入手机号');
                  }
                  console.log('发送验证码到手机号:', mobile);
                  await handleSendSmsCode(mobile);
                }}
              />
              <div style={{ marginBottom: 16, color: '#666', fontSize: 12 }}>
                <span>提示：首次使用手机号登录将自动注册账号</span>
              </div>
            </>
          )}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage
                id="pages.login.rememberMe"
                defaultMessage="自动登录"
              />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
              onClick={() => history.push('/user/forgetpsw')}
            >
              <FormattedMessage
                id="pages.login.forgotPassword"
                defaultMessage="忘记密码"
              />
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
      
      {/* 设置密码模态框 */}
      <Modal
        title="设置登录密码"
        open={setPasswordModalVisible}
        onOk={handleSetPassword}
        onCancel={handleSkipSetPassword}
        okText="设置密码"
        cancelText="跳过"
        width={500}
        maskClosable={false}
      >
        <div style={{ marginBottom: 24 }}>
          <Alert
            message="欢迎使用！"
            description="您是首次使用手机号登录，建议设置一个密码，以便下次使用邮箱密码登录。也可以选择跳过，稍后在个人中心设置。"
            type="info"
            showIcon
          />
        </div>
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="设置密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
              { max: 20, message: '密码最多20位' },
            ]}
          >
            <Input.Password placeholder="请输入密码（至少6位）" size="large" />
          </Form.Item>
          
          <Form.Item
            label="确认密码"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" size="large" />
          </Form.Item>
          
          <div style={{ color: '#666', fontSize: 12, marginTop: -8 }}>
            提示：设置密码后，您可以使用用户名和密码登录,用户名默认为手机号。
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
