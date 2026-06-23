/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
const isDev = process.env.NODE_ENV === 'development';

// ============ 后端服务地址配置 ============
// 主后端服务（业务API、认证、考试等）
// 优先读 env:Docker dev compose 注入 http://backend:9002 / ws://spoken-flow:9001
// 裸跑默认回落到 localhost
const MAIN_API_TARGET = process.env.MAIN_API_TARGET || 'http://localhost:9002';
// const MAIN_API_TARGET = 'https://api.qtoplay.com';
// 对话服务（AI 对话相关）
const CONVERSATION_API_TARGET =
  process.env.CONVERSATION_API_TARGET || 'http://localhost:9019';
// WebSocket 服务
const WS_TARGET = process.env.WS_TARGET || 'ws://localhost:9001';
// 局域网调试地址（备用）
const LAN_WS_TARGET = process.env.LAN_WS_TARGET || 'ws://192.168.4.30:9001';

// 获取当前端口，默认8001
const getCurrentPort = () => {
  return process.env.PORT || '8001';
};

export default {
  // 如果需要自定义本地开发服务器  请取消注释按需调 /api/spoken/
  dev: {
    // ============ 主后端服务代理 (9002) ============

    // 工作流类型代理 - 最高优先级
    '/api/workflowtypes': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
      pathRewrite: { '^/api/workflowtypes': '/api/workflowtypes' },
      onProxyReq: (proxyReq: any, req: any, res: any) => {
        console.log('\n=== Workflow Types Proxy ===');
        console.log('[Proxy] 请求:', req.method, req.url);
        console.log('[Proxy] 代理到:', proxyReq.path);
        console.log('[Proxy] Target:', MAIN_API_TARGET);
        console.log('===========================\n');
      },
      onProxyRes: (proxyRes: any, req: any, res: any) => {
        console.log('[Proxy Response] Status:', proxyRes.statusCode);
      },
      onError: (err: any, req: any, res: any) => {
        console.error('[Proxy Error]:', err.message);
      },
    },

    // 口语练习服务代理
    '/api/spoken/**': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
      onProxyReq: (proxyReq: any, req: any, res: any) => {
        console.log('\n=== spoken Types Proxy ===');
        console.log('[Proxy] 请求:', req.method, req.url);
        console.log('[Proxy] 代理到:', proxyReq.path);
        console.log('[Proxy] Target:', MAIN_API_TARGET);
        console.log('===========================\n');
      },
      onProxyRes: (proxyRes: any, req: any, res: any) => {
        console.log('[Proxy Response] Status:', proxyRes.statusCode);
      },
      onError: (err: any, req: any, res: any) => {
        console.error('[Proxy Error]:', err.message);
      },
    },
    // 订单服务代理
    '/api/articles/**': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
      onProxyReq: (proxyReq: any, req: any) => {
        console.log('[Order Proxy]', req.method, req.url);
      },
    },

    // 订单服务代理
    '/api/order/**': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
      onProxyReq: (proxyReq: any, req: any) => {
        console.log('[Order Proxy]', req.method, req.url);
      },
    },

    // 考试服务代理
    '/api/exam/**': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
      onProxyReq: (proxyReq: any, req: any) => {
        console.log('[Exam Proxy]', req.method, req.url);
      },
    },

    // 口语服务代理
    '/api/oral/**': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
    },

    // 管理员后台服务代理
    '/api/admin/**': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
    },

    // 认证服务代理
    '/api/auth/**': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
    },

    // 音频上传服务代理
    '/api/upload': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
    },

    // 转写状态查询服务代理
    '/api/transcription_status': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
    },

    // ============ 对话服务代理 (9019) ============

    // 对话会话代理
    '/api/v1/conversations/**': {
      target: CONVERSATION_API_TARGET,
      changeOrigin: true,
    },

    // 对话 API v1 代理
    '/api/v1/': {
      target: CONVERSATION_API_TARGET,
      changeOrigin: true,
      pathRewrite: { '^/api/v1': '/api/v1' },
    },

    // ============ 其他代理配置（已注释） ============

    // 通用 API 代理（优先级最低）
    // 注意：这个规则优先级最低，仅处理未被其他规则匹配的请求
    // '/api/': {
    //   target: `http://localhost:${getCurrentPort()}`,
    //   changeOrigin: true,
    // },

    // WebSocket 代理（需要时取消注释）
    // '/ws': {
    //   target: WS_TARGET,  // 或使用 LAN_WS_TARGET 进行局域网调试
    //   ws: true,
    //   changeOrigin: true,
    //   pathRewrite: { '^/ws': '' },
    // },
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  // test: {
  //   // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
  //   '/api/': {
  //     target: 'https://proapi.azurewebsites.net',
  //     changeOrigin: true,
  //     pathRewrite: { '^': '' },
  //   },
  // },
  pre: {
    '/api/': {
      target: MAIN_API_TARGET,
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
