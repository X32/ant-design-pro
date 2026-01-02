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
// 获取当前端口，默认8001
const getCurrentPort = () => {
  return process.env.PORT || '8001';
};

export default {
  // 如果需要自定义本地开发服务器  请取消注释按需调整
  dev: {
    // 认证服务代理 - 最高优先级
    '/api/oral/**': {
      target: 'http://localhost:9002',
      changeOrigin: true,
    },
    // 认证服务代理 - 最高优先级
    '/api/auth/**': {
      target: 'http://localhost:9002',
      changeOrigin: true,
    },
    // 音频上传服务代理 - 移到最前面，确保优先级高于通用的/api/代理
    '/api/upload': {
      target: 'http://127.0.0.1:9002',
      changeOrigin: true,
    },
    // 转写状态查询服务代理
    '/api/transcription_status': {
      target: 'http://127.0.0.1:9002',
      changeOrigin: true,
    },
    // localhost:8001/api/v1/conversations/ -> http://localhost:9019/api/v1/conversations/
    '/api/v1/conversations/**': {
      // 要代理的地址 - 指向实际的后端服务器
      target: 'http://localhost:9019',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
    },
    // localhost:8001/api/v1/ -> http://localhost:9019/api/v1/
    '/api/v1/': {
      // 要代理的地址 - 指向实际的后端服务器
      target: 'http://localhost:9019',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      // 路径重写：将 /api/v1/ 前缀保留，确保后端收到正确的路径
      pathRewrite: { '^/api/v1': '/api/v1' },
    },
    // localhost:8001/api/** -> http://localhost:8001/api/
    '/api/': {
      // 要代理的地址 - 指向开发服务器自身
      target: `http://localhost:${getCurrentPort()}`,
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      // 添加路径排除，确保/api/upload、/api/upload_audio、/api/transcription_status和/api/auth请求不会被此规则捕获
      bypass: function(req: any) {
        if (req.url.startsWith('/api/upload') || 
            req.url.startsWith('/api/transcription_status') || 
            req.url.startsWith('/api/auth')) {
          return false; // 不绕过，让更具体的规则处理
        }
        return undefined; // 使用默认代理行为
      },
    },
    // 将ws://localhost:8001/ws?userId=1&conversationId=1代理到ws://localhost:9001
    '/ws': {
      target: 'ws://localhost:9001',
      ws: true,
      changeOrigin: true,
      // 保留原始路径和查询参数
      pathRewrite: { '^/ws': '' }
    }
  },
  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
