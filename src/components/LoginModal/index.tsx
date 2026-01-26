import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Input, message, Divider, Space } from 'antd';
import { WechatOutlined, MobileOutlined, SwapOutlined, CloseOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { wechatLogin } from '@/services/ant-design-pro/login';
import { TOKEN_KEY } from '@/config/apiConfig';
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

  // 处理微信登录回调（URL中的code参数）
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && visible) {
      handleWechatCallback(code, state);
    }
  }, [visible]);

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
        
        // 更新全局用户状态
        if (setInitialState) {
          await setInitialState((s) => ({
            ...s,
            currentUser: user,
          }));
        }
        
        // 显示成功消息
        if (is_new_user && auto_registered) {
          message.success('欢迎！已为您自动注册账号');
        } else {
          message.success('登录成功！');
        }
        
        // 清除URL参数
        window.history.replaceState({}, '', window.location.pathname);
        
        // 执行成功回调
        onSuccess?.();
        onCancel();
        
        // 刷新页面或跳转
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        message.error(response.message || '微信登录失败，请重试');
      }
    } catch (error: any) {
      console.error('微信登录失败:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || '微信登录失败，请重试';
      message.error(errorMsg);
      
      // 清除URL参数
      window.history.replaceState({}, '', window.location.pathname);
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

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
        message.error('请输入正确的手机号');
        return;
      }
      
      // TODO: 调用发送验证码接口
      message.success('验证码已发送');
      setCountdown(60);
    } catch (error) {
      message.error('验证码发送失败');
    }
  };

  // 手机号登录
  const handleMobileLogin = async (values: { phone: string; code: string }) => {
    setLoading(true);
    try {
      // TODO: 调用手机号登录接口
      console.log('手机号登录:', values);
      message.success('登录成功');
      onSuccess?.();
      onCancel();
    } catch (error) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 跳转到用户协议页面
  const handleViewAgreement = (type: 'terms' | 'privacy') => {
    const url = type === 'terms' ? '/user/terms' : '/user/privacy';
    window.open(url, '_blank');
  };

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      closeIcon={null}
      className="login-modal"
      centered
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
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Input
                        placeholder="请输入验证码"
                        maxLength={6}
                        style={{ flex: 1 }}
                      />
                      <Button
                        onClick={handleSendCode}
                        disabled={countdown > 0}
                        style={{ width: 120 }}
                      >
                        {countdown > 0 ? `${countdown}秒后重试` : '获取验证码'}
                      </Button>
                    </div>
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
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;
