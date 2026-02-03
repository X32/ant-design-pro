/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  // ========== 登录注册路由（无需认证）==========
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './user',
      },
      {
        name: 'admin-login',
        path: '/user/admin/login',
        component: './user/admin/login',
        layout: false,  // 显式禁用布局
      },
      {
        name: 'profile',
        path: '/user/profile',
        component: './user/profile',
      },
      {
        name: 'forgetpsw',
        path: '/user/forgetpsw',
        component: './user/forgetpsw',
        layout: false,
      },
      {
        name: 'orderlog',
        path: '/user/orderlog',
        component: './user/orderlog',
        layout: false,
      },
      {
        name: 'test-auth',
        path: '/user/test-auth',
        component: './test-auth',
        layout: false,
      },
      {
        name: 'workflow-test',
        path: '/user/workflow-test',
        component: './test/workflow-test',
        layout: false,
      },
    ],
  },

  // ========== 首页（无需登录，完全自定义布局）==========
  {
    path: '/home',
    name: 'home',
    component: './home',
    layout: false,
  },
  
  // ========== 考试介绍页面（公开访问，无需登录）==========
  {
    path: '/home/intro',
    name: 'exam-intro',
    component: './home/intro',
    layout: false,
  },

  // ========== 考试目录（公开访问，无需登录，不显示菜单）==========
  {
    path: '/exam-catalog',
    name: 'exam-catalog',
    component: './exam-catalog',
    layout: false,  // 不显示左侧菜单和顶部导航
  },

  // ========== 后台管理路由（需要管理员权限）==========
  {
    path: '/back',
    name: 'back',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      {
        path: '/back',
        redirect: '/back/welcome',
      },
      {
        path: '/back/welcome',
        name: 'welcome',
        icon: 'smile',
        component: './Welcome',
      },
      {
        path: '/back/dashboard',
        name: 'dashboard',
        icon: 'dashboard',
        component: './dashboard',
      },
      {
        path: '/back/user-manager',
        name: 'user-manager',
        icon: 'team',
        component: './user/manager',
      },
      {
        name: 'messages',
        icon: 'message',
        path: '/back/messages',
        component: './messages',
      },
      {
        name: 'audio-recorder',
        icon: 'audio',
        path: '/back/audio-recorder',
        component: './AudioRecorder06/Example',
      },
      {
        name: 'spoken-practice',
        icon: 'sound',
        path: '/back/spoken-practice',
        component: './spokenPages',
      },
      {
        name: 'exam',
        icon: 'fileText',
        path: '/back/exam',
        routes: [
          {
            name: 'topics',
            icon: 'appstore',
            path: '/back/exam/topics',
            component: './exam/topics',
          },
          {
            name: 'exercises',
            icon: 'book',
            path: '/back/exam/exercises',
            component: './exam/exercises',
          },
          {
            name: 'workflow-type',
            icon: 'setting',
            path: '/back/exam/workflow-type',
            component: './exam/workflowType',
          },
          {
            path: '/back/exam',
            redirect: '/back/exam/list',
          },
          {
            name: 'exam-list',
            path: '/back/exam/list',
            component: './exam/examlist',
          },
          {
            name: 'exam-builder',
            path: '/back/exam/builder',
            component: './exam',
          },
          {
            name: 'exam-category',
            path: '/back/exam/category',
            component: './exam/category',
          },
          {
            name: 'cat-exam-list',
            path: '/back/exam/catexamList',
            component: './exam/catexamList',
          },
        ],
      },
      {
        name: 'orders',
        icon: 'shoppingCart',
        path: '/back/orders',
        routes: [
          {
            path: '/back/orders',
            redirect: '/back/orders/list',
          },
          {
            name: 'order-list',
            path: '/back/orders/list',
            component: './orders',
          },
          {
            name: 'product',
            path: '/back/orders/product',
            component: './orders/product',
          },
          {
            name: 'wallets',
            path: '/back/orders/wallets',
            component: './orders/wallets',
          },
          {
            name: 'wallet-logs',
            path: '/back/orders/wallet-logs',
            component: './orders/wallets/logs',
          },
          {
            name: 'vip-plans',
            icon: 'CrownOutlined',
            path: '/back/orders/vip-plans',
            component: './orders/viplist',
          },
          {
            name: 'vip-subscriptions',
            icon: 'CrownOutlined',
            path: '/back/orders/vip-subscriptions',
            component: './orders/vipSubscription',
          },
        ],
      },
    ],
  },
  
  // ========== 用户充值页面（普通用户，不显示侧边栏）==========
  {
    path: '/orders/recharge',
    component: './orders/recharge',
    layout: false,  // 不显示侧边栏
  },

  // ========== 前台功能页面（保留左侧菜单）==========
  {
    path: '/tts-mobile-pro',
    component: './tts_mobile_pro',
    layout: false,
  },
  
  // ========== 组件演示页面（开发测试）==========
  {
    path: '/demo/coin-drop',
    name: 'coin-drop-demo',
    component: '@/components/CoinDropAnimation/demo',
    layout: false,  // 不显示侧边栏，全屏演示
  },
  {
    path: '/demo/firework',
    name: 'firework-demo',
    component: '@/components/fireworkAnimation/demo',
    layout: false,  // 不显示侧边栏，全屏演示
  },
   {
    path: '/demo/loginmodel',
    name: 'login-demo',
    component: '@/components/LoginModal/demo',
    layout: false,  // 不显示侧边栏，全屏演示
  }, 
  // ========== 口语练习页面（普通用户，不显示侧边栏）==========
  {
    name: 'spoken-practice',
    icon: 'sound',
    path: '/spoken-practice',
    component: './spokenPages',
    layout: false,  // 普通用户不显示侧边栏
  },
  
  // ========== 口语考试练习页面（普通用户，不显示侧边栏）==========
  {
    name: 'spoken-exam-practice',
    icon: 'sound',
    path: '/spoken-exam-practice',
    component: './spokenExamPage/SpokenPractice',
    layout: false,  // 普通用户不显示侧边栏
  },
  
  // ========== 用户练习记录页面（不显示侧边栏）==========
  {
    path: '/messages/userpractice',
    name: 'user-practice',
    component: './messages/userpractice',
    layout: false,  // 不显示侧边栏
  },
  
  // ========== 练习记录查看页面（不显示侧边栏）==========
  {
    path: '/messages/viewpractice',
    name: 'view-practice',
    component: './messages/viewpractice',
    layout: false,  // 不显示侧边栏
  },
 
  // ========== 根路径重定向到首页 ==========
  {
    path: '/',
    redirect: '/home',
  },
  
  // ========== 404 页面 ==========
  {
    component: './404',
    layout: false,
    path: '/*',
  },
];
