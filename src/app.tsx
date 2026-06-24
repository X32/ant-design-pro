import { LinkOutlined } from '@ant-design/icons';
import type { Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RequestConfig, RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import React from 'react';
import {
  AvatarDropdown,
  AvatarName,
  Footer,
  Question,
  SelectLang,
} from '@/components';
import { TOKEN_KEY } from '@/config/apiConfig';
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
    } catch (error) {
      console.log('[fetchUserInfo] 获取用户信息失败，可能未登录');
      return undefined;
    }
  };
  // 如果不是登录页面，执行
  const { location } = history;

  console.log('[getInitialState] 当前路径:', location.pathname);

  // 为测试路由添加白名单，允许未登录访问
  const testRoutes = [
    loginPath,
    '/user/admin/login', // 后台管理员登录页
    '/user/register',
    '/user/register-result',
    '/user/forgetpsw',
    '/test-page',
    // '/audio-recorder-test',
    // '/audio',
    // '/audio-recorder'
  ];

  // 公开页面：允许匿名访问，但如果有token也尝试加载用户信息
  // 注意：使用 startsWith 匹配，支持带斜杠和不带斜杠的路径
  const publicRoutes = [
    '/home',
    '/about',
    '/downloads',
    '/articles',
    '/articles/:id',
    '/exam-catalog',
    '/ket-speaking',
    '/pet-speaking',
    '/fce-speaking',
    '/home/intro',
    '/home/proto/user-agreement',
    '/home/proto/privacy-policy',
    '/',
  ];

  // 检查是否为公开路由（支持末尾斜杠）
  const isPublicRoute = (pathname: string) => {
    return publicRoutes.some((route) => {
      if (route === '/') return pathname === '/';
      return (
        pathname === route ||
        pathname === route + '/' ||
        pathname.startsWith(route + '/')
      );
    });
  };

  // 检查是否为测试路由（支持末尾斜杠）
  const isTestRoute = (pathname: string) => {
    // 移除末尾的斜杠进行比较
    const normalizedPath = pathname.replace(/\/$/, '');
    return testRoutes.some((route) => {
      const normalizedRoute = route.replace(/\/$/, '');
      return normalizedPath === normalizedRoute;
    });
  };

  // 如果是测试路由或登录相关页面，直接返回不加载用户信息
  if (isTestRoute(location.pathname)) {
    console.log('[getInitialState] 测试路由，不加载用户信息');
    return {
      fetchUserInfo,
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }

  // 如果是公开页面（支持末尾斜杠）
  if (isPublicRoute(location.pathname)) {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('[getInitialState] 公开页面，token存在:', !!token);
    console.log('[getInitialState] 公开页面路径:', location.pathname);

    if (token) {
      // 有token，尝试加载用户信息
      try {
        const currentUser = await fetchUserInfo();
        console.log('[getInitialState] 用户信息加载成功:', !!currentUser);

        // 如果加载成功，返回用户信息
        if (currentUser) {
          return {
            fetchUserInfo,
            currentUser,
            settings: defaultSettings as Partial<LayoutSettings>,
          };
        }

        // 如果加载失败（返回 undefined），清除无效 token，但仍允许访问公开页面
        console.log(
          '[getInitialState] token可能已失效，清除token，但允许访问公开页面',
        );
        localStorage.removeItem(TOKEN_KEY);
        return {
          fetchUserInfo,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      } catch (error) {
        console.log(
          '[getInitialState] 用户信息加载失败，清除无效token，但允许访问公开页面',
        );
        // 加载失败，清除可能无效的 token，但仍允许访问公开页面
        localStorage.removeItem(TOKEN_KEY);
        return {
          fetchUserInfo,
          settings: defaultSettings as Partial<LayoutSettings>,
        };
      }
    } else {
      console.log('[getInitialState] 无token，允许访问公开页面');
      // 没有token，直接允许访问公开页面
      return {
        fetchUserInfo,
        settings: defaultSettings as Partial<LayoutSettings>,
      };
    }
  }

  // 非公开页面，必须登录
  console.log('[getInitialState] 非公开页面，需要登录');
  const currentUser = await fetchUserInfo();

  // 如果获取用户信息失败，跳转到登录页
  if (!currentUser) {
    console.log('[getInitialState] 未登录，跳转到登录页');
    history.push(loginPath);
  }

  return {
    fetchUserInfo,
    currentUser,
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
        '/user/admin/login', // 后台管理员登录页
        '/user/register',
        '/user/register-result',
        '/user/forgetpsw',
        '/test-page',
        '/audio-recorder-test',
        '/audio',
        '/audio-recorder',
      ];

      // 公开页面：允许匿名访问（必须与 getInitialState 中的 publicRoutes 保持一致）
      const publicRoutes = [
        '/home',
        '/about',
        '/downloads',
        '/articles',
        '/articles/:id',
        '/exam-catalog',
        '/ket-speaking',
        '/pet-speaking',
        '/fce-speaking',
        '/home/intro',
        '/home/proto/user-agreement',
        '/home/proto/privacy-policy',
        '/',
      ];

      // 检查是否为公开路由（支持末尾斜杠）
      const isPublicRoute = (pathname: string) => {
        return publicRoutes.some((route) => {
          if (route === '/') return pathname === '/';
          return (
            pathname === route ||
            pathname === route + '/' ||
            pathname.startsWith(route + '/')
          );
        });
      };

      // 检查是否为测试路由（支持末尾斜杠）
      const isTestRoute = (pathname: string) => {
        // 移除末尾的斜杠进行比较
        const normalizedPath = pathname.replace(/\/$/, '');
        return testRoutes.some((route) => {
          const normalizedRoute = route.replace(/\/$/, '');
          return normalizedPath === normalizedRoute;
        });
      };

      console.log('[路由守卫] 当前路径:', location.pathname);
      console.log('[路由守卫] 是否登录:', !!initialState?.currentUser);
      console.log('[路由守卫] 是否公开路由:', isPublicRoute(location.pathname));
      console.log('[路由守卫] 是否测试路由:', isTestRoute(location.pathname));

      // 特殊处理：如果是根路径 '/'，不进行任何拦截，让路由配置的 redirect 生效
      if (location.pathname === '/') {
        console.log('[路由守卫] 根路径，跳过拦截');
        return;
      }

      // 如果是公开页面，无论是否登录都允许访问（支持末尾斜杠）
      if (isPublicRoute(location.pathname)) {
        console.log('[路由守卫] 公开页面，允许访问');
        return;
      }

      // 如果是测试路由，允许访问（支持末尾斜杠）
      if (isTestRoute(location.pathname)) {
        console.log('[路由守卫] 测试路由，允许访问');
        return;
      }

      // 如果没有登录且路径不在白名单中，重定向到 login
      if (!initialState?.currentUser) {
        console.log('[路由守卫] 需要登录，重定向到登录页');
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
  // dev: 走 UmiJS dev server proxy
  // prod: 走边缘 nginx 同域反代 (容器内 nginx /api/ → backend:9002)
  // 两种都用相对路径,避免跨域 + 不依赖外部硬编码域名
  prefix: '',
  baseURL: '',
  timeout: 60000,
  ...errorConfig,
};
