// 在admin路由下添加新的子路由
export default [
  { path: '/user', layout: false, routes: [{ name: 'login', path: '/user/login', component: './user/login' }] },
  // 设置根路径重定向到testIndex，作为首页
  { path: '/', redirect: '/testIndex' },
  { path: '/welcome', name: 'welcome', icon: 'smile', component: './Welcome' },
  { path: '/admin', name: 'admin', icon: 'crown', access: 'canAdmin', routes: [{ path: '/admin', redirect: '/admin/sub-page' }, { path: '/admin/sub-page', name: 'sub-page', component: './Admin' }] },
  { name: 'list.table-list', icon: 'table', path: '/list', component: './table-list' },
  // 添加testIndex路由，设置layout: false隐藏左侧侧边栏
  { path: '/TTsPage', component: './TTsPage', layout: false }, 
  { path: '/testShowPaqe', component: './testShowPaqe', layout: false }, // 修正组件路径以匹配实际文件名
  { path: '/TTsTestPage', component: './TTsTestPage', layout: false }, // 修正组件路径以匹配实际文件名
  { path: '/testIndex', component: './testIndex', layout: false },
  { path: '/tts-mobile', component: './tts_mobile', layout: false },
];
