import React, { useState, useEffect } from 'react';
import { Helmet, useModel, history } from '@umijs/max';
import { createStyles } from 'antd-style';
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

  // 如果已登录，直接跳转
  useEffect(() => {
    if (initialState?.currentUser) {
      const urlParams = new URL(window.location.href).searchParams;
      const redirect = urlParams.get('redirect');
      let defaultPath = '/home';
      if (initialState.currentUser.is_superuser) {
        defaultPath = '/back/welcome';
      }
      history.push(redirect || defaultPath);
    }
  }, [initialState?.currentUser]);

  const handleLoginSuccess = () => {
    setModalVisible(false);
    
    // 跳转逻辑
    const urlParams = new URL(window.location.href).searchParams;
    const redirect = urlParams.get('redirect');
    let defaultPath = '/home';
    if (initialState?.currentUser?.is_superuser) {
      defaultPath = '/back/welcome';
    }
    
    setTimeout(() => {
      history.push(redirect || defaultPath);
    }, 500);
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
