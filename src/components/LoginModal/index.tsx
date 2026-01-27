import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Input, message, Alert } from 'antd';
import { WechatOutlined, MobileOutlined, CloseOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { flushSync } from 'react-dom';
import { wechatLogin } from '@/services/ant-design-pro/login';
import { sendSmsCode, smsLogin, setPassword } from '@/services/ant-design-pro/api';
import { TOKEN_KEY, USER_ID_KEY } from '@/config/apiConfig';
import WECHAT_CONFIG from '@/config/wechatConfig';
import './index.less';

// 声明微信登录SDK类型
declare global {
  interface Window {
    WxLogin: any;
  }
}

interface LoginModalProps {
  /** 是否显示弹框 */
  visible: boolean;
  /** 关闭弹框回调 */
  onCancel: () => void;
  /** 登录成功回调 */
  onSuccess?: () => void;
}

type LoginType = 'wechat' | 'mobile';

/**
 * 登录入口组件 - 弹框形式
 * 支持微信扫码登录和手机号登录
 */
const LoginModal: React.FC<LoginModalProps> = ({ visible, onCancel, onSuccess }) => {
  const [loginType, setLoginType] = useState<LoginType>('wechat');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [form] = Form.useForm();
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const wxLoginInstanceRef = useRef<any>(null);
  const { initialState, setInitialState } = useModel('@@initialState');
  
  // 设置密码模态框状态
  const [setPasswordModalVisible, setSetPasswordModalVisible] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<any>(null);
  const [passwordForm] = Form.useForm();
  
  // 标记微信登录是否正在处理中
  const isProcessingWechatLogin = useRef(false);

  // 页面加载时检查URL中的code参数（不依赖弹窗状态）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    // 如果URL中有code参数且未处理，立即处理（不管弹窗是否打开）
    if (code && !isProcessingWechatLogin.current) {
      isProcessingWechatLogin.current = true;
      handleWechatCallback(code, state);
    }
  }, []); // 只在组件挂载时执行一次

  // 处理微信登录回调
  const handleWechatCallback = async (code: string, state: string | null) => {
    setLoading(true);
    try {
      console.log('微信登录回调，code:', code);
      
      // 调用后端接口
      const response = await wechatLogin({ code });
      
      if (response.success) {
        const { access_token, user, is_new_user, auto_registered } = response.data;
        
        // 保存 token
        localStorage.setItem(TOKEN_KEY, access_token);
        
        // 保存用户ID
        if (user && user.id) {
          localStorage.setItem(USER_ID_KEY, user.id.toString());
        }
        
        // 更新全局用户状态
        if (setInitialState) {
          await setInitialState((s) => ({
            ...s,
            currentUser: {
              ...user,
              name: user.email?.split('@')[0] || 'User',
              userid: user.id?.toString(),
              access: user.is_superuser ? 'admin' : 'user',
            },
          }));
        }
        
        // 清除URL参数（在跳转前清除，避免重复处理）
        window.history.replaceState({}, '', window.location.pathname);
        
        // 显示成功消息
        if (is_new_user && auto_registered) {
          message.success('欢迎！已为您自动注册账号');
        } else {
          message.success('登录成功！');
        }
        
        // 特殊处理：如果当前在登录页，需要跳转走
        const currentPath = window.location.pathname;
        console.log('[LoginModal] 微信登录成功，当前路径:', currentPath);
        
        if (currentPath === '/user/login') {
          console.log('[LoginModal] 检测到在登录页，准备跳转到首页');
          console.log('[LoginModal] Token 已保存:', !!localStorage.getItem(TOKEN_KEY));
          console.log('[LoginModal] User 已更新:', !!user);
          
          // 不执行 onSuccess 回调，避免登录页的逻辑干扰
          // 直接跳转，不等待
          setTimeout(() => {
            console.log('[LoginModal] 执行跳转...');
            history.push('/home');
          }, 500); // 确保状态完全更新
        } else {
          // 其他页面，执行成功回调
          onSuccess?.();
        }
        
        // 重置处理标记
        isProcessingWechatLogin.current = false;
      } else {
        message.error(response.message || '微信登录失败，请重试');
        isProcessingWechatLogin.current = false;
      }
    } catch (error: any) {
      console.error('微信登录失败:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || '微信登录失败，请重试';
      message.error(errorMsg);
      
      // 清除URL参数
      window.history.replaceState({}, '', window.location.pathname);
      
      // 重置处理标记
      isProcessingWechatLogin.current = false;
    } finally {
      setLoading(false);
    }
  };

  // 加载微信登录SDK
  useEffect(() => {
    const loadWxLoginScript = () => {
      return new Promise<void>((resolve, reject) => {
        // 检查是否已加载
        if (window.WxLogin) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('微信登录SDK加载失败'));
        document.body.appendChild(script);
      });
    };

    if (visible && loginType === 'wechat') {
      loadWxLoginScript()
        .then(() => {
          initWxLogin();
        })
        .catch((error) => {
          console.error('微信SDK加载失败:', error);
          message.error('微信登录初始化失败，请稍后重试');
        });
    }

    return () => {
      // 清理微信登录实例
      if (wxLoginInstanceRef.current) {
        wxLoginInstanceRef.current = null;
      }
    };
  }, [visible, loginType]);

  // 初始化微信登录
  const initWxLogin = () => {
    if (!window.WxLogin || !qrContainerRef.current) return;

    // 清空容器
    if (qrContainerRef.current) {
      qrContainerRef.current.innerHTML = '';
    }

    try {
      const redirectUri = WECHAT_CONFIG.getRedirectUri();
      const encodedRedirectUri = encodeURIComponent(redirectUri);
      
      console.log('微信登录配置:', {
        appid: WECHAT_CONFIG.appid,
        scope: WECHAT_CONFIG.scope,
        redirect_uri_原始: redirectUri,
        redirect_uri_编码后: encodedRedirectUri,
        self_redirect: WECHAT_CONFIG.selfRedirect,
      });

      wxLoginInstanceRef.current = new window.WxLogin({
        self_redirect: WECHAT_CONFIG.selfRedirect,
        id: 'wechat_qrcode_container',
        appid: WECHAT_CONFIG.appid,
        scope: WECHAT_CONFIG.scope,
        redirect_uri: encodedRedirectUri,
        state: Math.random().toString(36).substring(2), // 随机state防CSRF
        style: WECHAT_CONFIG.style,
        href: '', // 可自定义样式URL
        onReady: (isReady: boolean) => {
          console.log('微信登录二维码准备就绪:', isReady);
          if (!isReady) {
            message.warning('微信登录二维码加载失败，请刷新重试');
          }
        },
      });
    } catch (error) {
      console.error('初始化微信登录失败:', error);
      message.error('微信登录初始化失败');
    }
  };

  // 验证码倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 切换登录方式
  const switchLoginType = () => {
    setLoginType(loginType === 'wechat' ? 'mobile' : 'wechat');
    form.resetFields();
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
      
      // 执行成功回调并关闭弹窗
      onSuccess?.();
      onCancel();
    }
  };

  /**
   * 发送短信验证码
   */
  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        message.error('请输入正确的手机号');
        return;
      }
      
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
      
      const result = await sendSmsCode({ phone_number: phone });
      
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
   * 手机号登录
   */
  const handleMobileLogin = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      const result = await smsLogin({
        phone_number: values.phone,
        code: values.code,
      });
      
      if (result.success && result.data) {
        const isAutoRegistered = result.data.auto_registered || false;
        handleLoginSuccess(result, isAutoRegistered);
        return;
      }
      
      const errorMessage = result.message || '登录失败，请检查验证码';
      message.error(errorMessage);
    } catch (error: any) {
      const errorMessage = error?.message || '登录失败，请重试！';
      console.error(error);
      message.error(errorMessage);
    } finally {
      setLoading(false);
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
        
        // 执行成功回调并关闭弹窗
        onSuccess?.();
        onCancel();
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
    
    // 执行成功回调并关闭弹窗
    onSuccess?.();
    onCancel();
  };

  // 跳转到用户协议页面
  const handleViewAgreement = (type: 'terms' | 'privacy') => {
    const url = type === 'terms' ? '/user/terms' : '/user/privacy';
    window.open(url, '_blank');
  };

  return (
    <>
      <Modal
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
        closeIcon={null}
        className="login-modal"
        centered
        maskClosable={false}
      >
        <div className="login-modal-content">
          {/* 左侧：品牌区域 */}
          <div className="login-modal-left">
            <div className="brand-section">
              <div className="brand-logo">
                <img src={require('../../img/icon_200.png')} alt="Logo" />
              </div>
              <h1 className="brand-title">AI 口语练习平台</h1>
              <p className="brand-slogan">智能陪练，让口语更流利</p>
              <div className="brand-features">
                <div className="feature-item">✨ 24小时AI智能陪练</div>
                <div className="feature-item">🎯 个性化学习方案</div>
                <div className="feature-item">📊 实时反馈与纠正</div>
                <div className="feature-item">🏆 快速提升口语能力</div>
              </div>
            </div>
          </div>

          {/* 右侧：登录区域 */}
          <div className="login-modal-right">
            {/* 右上角切换按钮 */}
            <div className="switch-button-container">
              <Button
                type="text"
                icon={loginType === 'wechat' ? <MobileOutlined /> : <WechatOutlined />}
                onClick={switchLoginType}
                className="switch-button"
              >
                {loginType === 'wechat' ? '手机号登录' : '微信扫码登录'}
              </Button>
            </div>

            <div className="login-form-container">
              <h2 className="login-title">
                {loginType === 'wechat' ? '微信扫码登录' : '手机号登录'}
              </h2>

              {/* 微信扫码登录 */}
              {loginType === 'wechat' && (
                <div className="wechat-login">
                  <div className="qrcode-container">
                    {/* 微信二维码容器 */}
                    <div 
                      id="wechat_qrcode_container" 
                      ref={qrContainerRef}
                      className="wechat-qrcode-wrapper"
                    />
                    <p className="qrcode-desc">
                      打开微信扫一扫<br />
                      快速登录或注册
                    </p>
                  </div>
                </div>
              )}

              {/* 手机号登录 */}
              {loginType === 'mobile' && (
                <div className="mobile-login">
                  <Form
                    form={form}
                    onFinish={handleMobileLogin}
                    layout="vertical"
                    size="large"
                  >
                    <Form.Item
                      name="phone"
                      rules={[
                        { required: true, message: '请输入手机号' },
                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                      ]}
                    >
                      <Input
                        prefix={<MobileOutlined />}
                        placeholder="请输入手机号"
                        maxLength={11}
                      />
                    </Form.Item>

                    <Form.Item
                      name="code"
                      rules={[
                        { required: true, message: '请输入验证码' },
                        { len: 6, message: '验证码为6位数字' },
                      ]}
                    >
                      <Input
                        placeholder="请输入验证码"
                        maxLength={6}
                        addonAfter={
                          <Button
                            type="link"
                            onClick={handleSendCode}
                            disabled={countdown > 0}
                            style={{ padding: '0 16px', height: '100%' }}
                          >
                            {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                          </Button>
                        }
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        size="large"
                        style={{ height: 48 }}
                      >
                        登录
                      </Button>
                    </Form.Item>

                    <div className="login-tips">
                      <span style={{ color: '#999', fontSize: 12 }}>
                        首次使用手机号登录将自动注册账号
                      </span>
                    </div>
                  </Form>
                </div>
              )}
            </div>

            {/* 底部协议 */}
            <div className="agreement-section">
              <span className="agreement-text">
                登录即表示同意
                <a onClick={() => handleViewAgreement('terms')} className="agreement-link">
                  《用户协议》
                </a>
                和
                <a onClick={() => handleViewAgreement('privacy')} className="agreement-link">
                  《隐私政策》
                </a>
              </span>
            </div>
            
            {/* 关闭按钮 - 放在右下角 */}
            <div className="modal-close-btn-bottom" onClick={onCancel}>
              <CloseOutlined />
            </div>
          </div>
        </div>
      </Modal>

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
    </>
  );
};

export default LoginModal;
