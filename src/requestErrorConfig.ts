import type { RequestOptions } from '@@/plugin-request/request';
import type { RequestConfig } from '@umijs/max';
import { TOKEN_KEY } from '@/config/apiConfig';

// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { success, data, errorCode, errorMessage, showType } =
        res as unknown as ResponseStructure;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, showType, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              // 避免使用静态 message，让业务组件自行处理警告
              console.warn(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              // 避免使用静态 message，让业务组件自行处理错误
              console.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              // 避免使用静态 notification
              console.error(`Notification: ${errorCode} - ${errorMessage}`);
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              // 避免使用静态 message
              console.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        console.error(`Response status:${error.response.status}`);
        // 抛出错误让业务组件处理
        throw error;
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        console.error('None response! Please retry.');
        // 抛出错误让业务组件处理
        throw error;
      } else {
        // 发送请求时出了点问题
        console.error('Request error, please retry.');
        // 抛出错误让业务组件处理
        throw error;
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    // 第一个拦截器：确保使用相对路径
    (config: RequestOptions) => {
      // 如果 URL 是完整的 https://api.qtoplay.com 地址，转换为相对路径
      if (config.url && typeof config.url === 'string') {
        config.url = config.url.replace('https://api.qtoplay.com', '');
        // config.url = config.url.replace('http://localhost:9002', '');
      }
      return config;
    },
    // 第二个拦截器：打印请求信息
    (config: RequestOptions) => {
      console.log('\n=== [requestErrorConfig.ts] Request Interceptor ===');
      console.log('1. URL:', config.url);
      console.log('2. Method:', config.method);
      console.log('3. Headers:', config.headers);
      console.log('4. BaseURL:', config.baseURL);
      console.log('====================================================\n');
      return config;
    },
    // 第二个拦截器：添加 Authorization
    (config: RequestOptions) => {
      // 从 localStorage 获取 token
      const token = localStorage.getItem(TOKEN_KEY);
      
      // 如果有 token，添加到请求头
      if (token) {
        // 处理 umi-request 的 headers 结构
        if (!config.headers) {
          config.headers = {};
        }

        // 直接设置 Authorization，umi-request 会正确处理
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      if (data?.success === false) {
        // 避免使用静态 message，使用 console.error 替代
        console.error('请求失败！');
      }
      return response;
    },
  ],
};
