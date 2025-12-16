declare const _default: {
    dev: {
        '/api/v1/conversations/**': {
            target: string;
            changeOrigin: boolean;
        };
        '/api/v1/': {
            target: string;
            changeOrigin: boolean;
            pathRewrite: {
                '^/api/v1': string;
            };
        };
        '/api/': {
            target: string;
            changeOrigin: boolean;
        };
        '/ws': {
            target: string;
            ws: boolean;
            changeOrigin: boolean;
            pathRewrite: {
                '^/ws': string;
            };
        };
    };
    /**
     * @name 详细的代理配置
     * @doc https://github.com/chimurai/http-proxy-middleware
     */
    test: {
        '/api/': {
            target: string;
            changeOrigin: boolean;
            pathRewrite: {
                '^': string;
            };
        };
    };
    pre: {
        '/api/': {
            target: string;
            changeOrigin: boolean;
            pathRewrite: {
                '^': string;
            };
        };
    };
};
export default _default;
