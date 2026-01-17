import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import { TOKEN_KEY } from '@/config/apiConfig';
import {
  AvatarDropdown,
  AvatarName,
  Footer,
  Question,
  SelectLang,
} from '@/components';
import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';
import '@ant-design/v5-patch-for-react-19';

const isDev = process.env.NODE_ENV === 'development';
const isDevOrTest = isDev || process.env.CI;
const loginPath = '/user/login';

/**
 * @see https://umijs.org/docs/api/runtime-config#getinitialstate
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      const msg = await queryCurrentUser({
        skipErrorHandler: true,
      });
      // 返回 msg.data.user 并处理字段映射
      const user = msg.data?.user;
      if (user) {
        // 确定显示名称的优先级：username > phone > email前缀 > 'User'
        let displayName = 'User';
        if (user.username) {
          displayName = user.username;
        } else if (user.phone) {
          displayName = user.phone;
        } else if (user.email) {
          displayName = user.email.split('@')[0];
        }
        
        return {
          ...user,
          name: displayName,
          userid: user.id?.toString(),
          access: user.is_superuser ? 'admin' : 'user',
        };
      }
      return undefined;
    } catch (_error) {
      history.push(loginPath);
    }
    return undefined;
  };
  // 如果不是登录页面，执行
  const { location } = history;
  // 为测试路由添加白名单，允许未登录访问
  const testRoutes = [
    loginPath,
    '/user/register',
    '/user/register-result',
    '/test-page',
    // '/audio-recorder-test',
    // '/audio',
    // '/audio-recorder'
  ];

  // 公开页面：允许匿名访问，但如果有token也尝试加载用户信息
  const publicRoutes = ['/home', '/exam-catalog'];

  if (!testRoutes.includes(location.pathname)) {
    // 对于公开页面，先检查是否有token
    if (publicRoutes.includes(location.pathname)) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        // 有token，尝试加载用户信息
        try {
          const currentUser = await fetchUserInfo();
          return {
            fetchUserInfo,
            currentUser,
            settings: defaultSettings as Partial<LayoutSettings>,
          };
        } catch (error) {
          // 加载失败，也允许访问
          return {
            fetchUserInfo,
            settings: defaultSettings as Partial<LayoutSettings>,
          };
        }
      } else {
        // 没有token，直接允许访问
        return {
          fetchUserInfo,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      }
    } else {
      // 非公开页面，必须登录
      const currentUser = await fetchUserInfo();
      return {
        fetchUserInfo,
        currentUser,
        settings: defaultSettings as Partial<LayoutSettings>,
      };
    }
  }
  return {
    fetchUserInfo,
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({
  initialState,
  setInitialState,
}) => {
  return {
    actionsRender: () => [
      <Question key="doc" />,
      <SelectLang key="SelectLang" />,
    ],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (_, avatarChildren) => (
        <AvatarDropdown>{avatarChildren}</AvatarDropdown>
      ),
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 为测试路由添加白名单，允许未登录访问
      const testRoutes = [
        loginPath,
        '/user/register',
        '/user/register-result',
        '/test-page',
        '/audio-recorder-test',
        '/audio',
        '/audio-recorder',
      ];
      // 如果没有登录且路径不在白名单中，重定向到 login
      if (
        !initialState?.currentUser &&
        !testRoutes.includes(location.pathname)
      ) {
        history.push(loginPath);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDevOrTest
      ? [
          <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
            <LinkOutlined />
            <span>OpenAPI 文档</span>
          </Link>,
        ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDevOrTest && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.settings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    ...initialState?.settings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request: RequestConfig = {
  baseURL: isDev ? '' : 'https://proapi.azurewebsites.net',
  ...errorConfig,
};
