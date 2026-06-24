import { Helmet, history, useModel } from '@umijs/max';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';
import LoginModal from '@/components/LoginModal';
import Settings from '../../../../config/defaultSettings';

const useStyles = createStyles(({ token }) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      overflow: 'auto',
      backgroundImage:
        "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
      backgroundSize: '100% 100%',
    },
  };
});

const Login: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const { styles } = useStyles();
  const [modalVisible, setModalVisible] = useState(true);

  // 记录是否是微信登录（组件挂载时检查一次，之后不变）
  const isWechatLoginRef = React.useRef(
    new URLSearchParams(window.location.search).has('code'),
  );

  // 如果已登录，直接跳转（不管登录方式，避免 LoginModal 跳转失败时卡住）
  useEffect(() => {
    console.log('[登录页] currentUser 状态变化:', initialState?.currentUser);

    if (initialState?.currentUser) {
      const urlParams = new URL(window.location.href).searchParams;
      const redirect = urlParams.get('redirect');
      let defaultPath = '/home';
      if (initialState.currentUser.is_superuser) {
        defaultPath = '/back/welcome';
      }

      console.log(
        '[登录页] 检测到已登录，准备跳转到:',
        redirect || defaultPath,
      );

      setTimeout(() => {
        console.log('[登录页] 执行跳转到:', redirect || defaultPath);
        history.push(redirect || defaultPath);
      }, 300);
    }
  }, [initialState]);

  const handleLoginSuccess = () => {
    console.log('[登录页] handleLoginSuccess 被调用');
    setModalVisible(false);

    // 注意：微信登录的跳转由 LoginModal 内部处理
    // 这里只处理手机号登录等其他方式的跳转
    if (!isWechatLoginRef.current) {
      setTimeout(() => {
        console.log('[登录页] 非微信登录，跳转到首页');
        const urlParams = new URL(window.location.href).searchParams;
        const redirect = urlParams.get('redirect');
        history.push(redirect || '/home');
      }, 300);
    } else {
      console.log(
        '[登录页] 微信登录，跳转由 LoginModal 处理，登录页不执行任何操作',
      );
    }
  };

  const handleCancel = () => {
    // 取消登录，返回首页
    history.push('/home');
  };

  return (
    <div className={styles.container}>
      <Helmet>
        <title>
          登录页
          {Settings.title && ` - ${Settings.title}`}
        </title>
      </Helmet>

      <LoginModal
        visible={modalVisible}
        onCancel={handleCancel}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Login;
