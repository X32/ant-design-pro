declare const _default: {
    stagewise?: unknown;
    openAPI?: false | {
        requestLibPath?: string;
        schemaPath?: string;
        mock?: boolean;
        projectName?: string;
        apiPrefix?: (string | (() => any));
        namespace?: string;
        hook?: {
            customFunctionName?: (() => any);
            customClassName?: (() => any);
        };
    }[] | {
        requestLibPath?: string;
        schemaPath?: string;
        mock?: boolean;
        projectName?: string;
        apiPrefix?: (string | (() => any));
        namespace?: string;
        hook?: {
            customFunctionName?: (() => any);
            customClassName?: (() => any);
        };
    } | undefined;
    keepalive?: false | unknown[] | undefined;
    tabsLayout?: (boolean | {
        hasCustomTabs?: boolean;
        hasDropdown?: boolean;
        hasFixedHeader?: boolean;
    }) | undefined;
    requestRecord?: false | {
        exclude?: unknown[];
        type?: boolean;
        namespace?: string;
        comment?: boolean;
        outputDir?: string;
        successFilter?: (() => any);
        role?: string;
        mock?: {
            outputDir?: string;
            fileName?: string;
            usingRole?: string;
        };
    } | undefined;
    codeSplitting?: false | {
        jsStrategy: "bigVendors" | "depPerChunk" | "granularChunks";
        jsStrategyOptions?: ({} | undefined);
        cssStrategy?: ("mergeAll" | undefined);
        cssStrategyOptions?: ({} | undefined);
    } | undefined;
    title?: string | false | undefined;
    styles?: false | (string | {
        src?: (string | undefined);
    } | {
        content?: (string | undefined);
    } | {
        [x: string]: any;
    })[] | undefined;
    scripts?: false | (string | {
        src?: (string | undefined);
    } | {
        content?: (string | undefined);
    } | {
        [x: string]: any;
    })[] | undefined;
    routes?: false | ({
        component?: (string | undefined);
        layout?: (false | undefined);
        path?: (string | undefined);
        redirect?: (string | undefined);
        routes?: (/*elided*/ any | {
            [x: string]: any;
        })[];
        wrappers?: (Array<string> | undefined);
    } | {
        [x: string]: any;
    })[] | undefined;
    routeLoader?: false | {
        moduleType: "esm" | "cjs";
    } | undefined;
    reactRouter5Compat?: boolean | {} | undefined;
    presets?: false | string[] | undefined;
    plugins?: false | string[] | undefined;
    npmClient?: false | "pnpm" | "tnpm" | "cnpm" | "yarn" | "npm" | undefined;
    mountElementId?: string | false | undefined;
    metas?: false | ({
        charset?: (string | undefined);
        content?: (string | undefined);
        "http-equiv"?: (string | undefined);
        name?: (string | undefined);
    } | {
        [x: string]: any;
    })[] | undefined;
    links?: false | ({
        crossorigin?: (string | undefined);
        href?: (string | undefined);
        hreflang?: (string | undefined);
        media?: (string | undefined);
        referrerpolicy?: (string | undefined);
        rel?: (string | undefined);
        sizes?: (any | undefined);
        title?: (any | undefined);
        type?: (any | undefined);
    } | {
        [x: string]: any;
    })[] | undefined;
    historyWithQuery?: false | {} | undefined;
    history?: false | {
        type: "browser" | "hash" | "memory";
    } | undefined;
    headScripts?: false | (string | {
        src?: (string | undefined);
    } | {
        content?: (string | undefined);
    } | {
        [x: string]: any;
    })[] | undefined;
    esbuildMinifyIIFE?: boolean | undefined;
    conventionRoutes?: false | {
        base?: (string | undefined);
        exclude?: (Array<any> | undefined);
    } | undefined;
    conventionLayout?: boolean | undefined;
    base?: string | false | undefined;
    analyze?: false | {} | undefined;
    writeToDisk?: boolean | undefined;
    transformRuntime?: false | {
        [x: string]: any;
    } | undefined;
    theme?: false | {
        [x: string]: any;
    } | undefined;
    targets?: false | {
        [x: string]: any;
    } | undefined;
    svgr?: false | {
        [x: string]: any;
    } | undefined;
    svgo?: boolean | {
        [x: string]: any;
    } | undefined;
    stylusLoader?: false | {
        [x: string]: any;
    } | undefined;
    styleLoader?: false | {
        [x: string]: any;
    } | undefined;
    srcTranspilerOptions?: false | {
        esbuild?: ({
            [x: string]: any;
        } | undefined);
        swc?: ({
            [x: string]: any;
        } | undefined);
    } | undefined;
    srcTranspiler?: false | "babel" | "esbuild" | "swc" | undefined;
    sassLoader?: false | {
        [x: string]: any;
    } | undefined;
    runtimePublicPath?: false | {} | undefined;
    purgeCSS?: false | {
        [x: string]: any;
    } | undefined;
    publicPath?: string | false | undefined;
    proxy?: false | any[] | {
        [x: string]: any;
    } | undefined;
    postcssLoader?: false | {
        [x: string]: any;
    } | undefined;
    outputPath?: string | false | undefined;
    normalCSSLoaderModules?: false | {
        [x: string]: any;
    } | undefined;
    mfsu?: boolean | {
        cacheDirectory?: (string | undefined);
        chainWebpack?: (((...args: any[]) => unknown) | undefined);
        esbuild?: (boolean | undefined);
        exclude?: (Array<string | any> | undefined);
        include?: (Array<string> | undefined);
        mfName?: (string | undefined);
        remoteAliases?: (Array<string> | undefined);
        remoteName?: (string | undefined);
        runtimePublicPath?: (boolean | undefined);
        shared?: ({
            [x: string]: any;
        } | undefined);
        strategy?: ("eager" | "normal" | undefined);
    } | undefined;
    mdx?: false | {
        loader?: (string | undefined);
        loaderOptions?: ({
            [x: string]: any;
        } | undefined);
    } | undefined;
    manifest?: false | {
        basePath?: (string | undefined);
        fileName?: (string | undefined);
    } | undefined;
    lessLoader?: false | {
        [x: string]: any;
    } | undefined;
    jsMinifierOptions?: false | {
        [x: string]: any;
    } | undefined;
    jsMinifier?: false | "none" | "esbuild" | "swc" | "terser" | "uglifyJs" | undefined;
    inlineLimit?: number | false | undefined;
    ignoreMomentLocale?: boolean | undefined;
    https?: false | {
        cert?: (string | undefined);
        hosts?: (Array<string> | undefined);
        http2?: (boolean | undefined);
        key?: (string | undefined);
    } | undefined;
    hash?: boolean | undefined;
    forkTSChecker?: false | {
        [x: string]: any;
    } | undefined;
    fastRefresh?: boolean | undefined;
    extraPostCSSPlugins?: false | any[] | undefined;
    extraBabelPresets?: false | (string | any[])[] | undefined;
    extraBabelPlugins?: false | (string | any[])[] | undefined;
    extraBabelIncludes?: false | any[] | undefined;
    externals?: string | false | {
        [x: string]: any;
    } | ((...args: any[]) => unknown) | undefined;
    esm?: false | {} | undefined;
    devtool?: boolean | "cheap-source-map" | "cheap-module-source-map" | "eval" | "eval-source-map" | "eval-cheap-source-map" | "eval-cheap-module-source-map" | "eval-nosources-cheap-source-map" | "eval-nosources-cheap-module-source-map" | "eval-nosources-source-map" | "source-map" | "hidden-source-map" | "hidden-nosources-cheap-source-map" | "hidden-nosources-cheap-module-source-map" | "hidden-nosources-source-map" | "hidden-cheap-source-map" | "hidden-cheap-module-source-map" | "inline-source-map" | "inline-cheap-source-map" | "inline-cheap-module-source-map" | "inline-nosources-cheap-source-map" | "inline-nosources-cheap-module-source-map" | "inline-nosources-source-map" | "nosources-source-map" | "nosources-cheap-source-map" | "nosources-cheap-module-source-map" | undefined;
    depTranspiler?: false | "none" | "babel" | "esbuild" | "swc" | undefined;
    define?: false | {
        [x: string]: any;
    } | undefined;
    deadCode?: false | {
        context?: (string | undefined);
        detectUnusedExport?: (boolean | undefined);
        detectUnusedFiles?: (boolean | undefined);
        exclude?: (Array<string> | undefined);
        failOnHint?: (boolean | undefined);
        patterns?: (Array<string> | undefined);
    } | undefined;
    cssPublicPath?: string | false | undefined;
    cssMinifierOptions?: false | {
        [x: string]: any;
    } | undefined;
    cssMinifier?: false | "none" | "esbuild" | "cssnano" | "parcelCSS" | undefined;
    cssLoaderModules?: false | {
        [x: string]: any;
    } | undefined;
    cssLoader?: false | {
        [x: string]: any;
    } | undefined;
    copy?: false | (string | {
        from: string;
        to: string;
    })[] | undefined;
    checkDepCssModules?: boolean | undefined;
    cacheDirectoryPath?: string | false | undefined;
    babelLoaderCustomize?: string | false | undefined;
    autoprefixer?: false | {
        [x: string]: any;
    } | undefined;
    autoCSSModules?: boolean | undefined;
    alias?: false | {
        [x: string]: any;
    } | undefined;
    crossorigin?: boolean | {
        includes?: (Array<any> | undefined);
    } | undefined;
    esmi?: false | {
        cdnOrigin: string;
        shimUrl?: (string | undefined);
    } | undefined;
    exportStatic?: false | {
        extraRoutePaths?: (((...args: any[]) => unknown) | Array<string> | undefined);
        ignorePreRenderError?: (boolean | undefined);
    } | undefined;
    favicons?: false | string[] | undefined;
    helmet?: boolean | undefined;
    icons?: false | {
        autoInstall?: ({} | undefined);
        defaultComponentConfig?: ({} | undefined);
        alias?: ({} | undefined);
        include?: (Array<string> | undefined);
    } | undefined;
    mock?: false | {
        exclude?: (Array<string> | undefined);
        include?: (Array<string> | undefined);
    } | undefined;
    mpa?: false | {
        template?: (string | undefined);
        layout?: (string | undefined);
        getConfigFromEntryFile?: (boolean | undefined);
        entry?: ({} | undefined);
    } | undefined;
    phantomDependency?: false | {
        exclude?: (Array<string> | undefined);
    } | undefined;
    polyfill?: false | {
        imports?: (Array<string> | undefined);
    } | undefined;
    routePrefetch?: false | {
        defaultPrefetch?: ("none" | "intent" | "render" | "viewport" | undefined);
        defaultPrefetchTimeout?: (number | undefined);
    } | undefined;
    terminal?: false | {} | undefined;
    tmpFiles?: boolean | undefined;
    clientLoader?: false | {} | undefined;
    routeProps?: false | {} | undefined;
    ssr?: false | {
        serverBuildPath?: (string | undefined);
        serverBuildTarget?: ("express" | "worker" | undefined);
        platform?: (string | undefined);
        builder?: ("esbuild" | "webpack" | "mako" | undefined);
        __INTERNAL_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: ({
            pureApp?: (boolean | undefined);
            pureHtml?: (boolean | undefined);
        } | undefined);
        useStream?: (boolean | undefined);
    } | undefined;
    lowImport?: false | {
        libs?: (Array<any> | undefined);
        css?: (string | undefined);
    } | undefined;
    vite?: false | {} | undefined;
    apiRoute?: false | {
        platform?: (string | undefined);
    } | undefined;
    monorepoRedirect?: boolean | {
        srcDir?: (Array<string> | undefined);
        exclude?: (Array<any> | undefined);
        peerDeps?: (boolean | undefined);
    } | undefined;
    test?: false | {} | undefined;
    clickToComponent?: false | {
        editor?: (string | undefined);
    } | undefined;
    legacy?: false | {
        buildOnly?: (boolean | undefined);
        nodeModulesTransform?: (boolean | undefined);
        checkOutput?: (boolean | undefined);
    } | undefined;
    classPropertiesLoose?: boolean | {} | undefined;
    ui?: false | {} | undefined;
    mako?: false | {
        plugins?: (Array<{
            load?: (((...args: any[]) => unknown) | undefined);
            generateEnd?: (((...args: any[]) => unknown) | undefined);
        }> | undefined);
        px2rem?: ({
            root?: (number | undefined);
            propBlackList?: (Array<string> | undefined);
            propWhiteList?: (Array<string> | undefined);
            selectorBlackList?: (Array<string> | undefined);
            selectorWhiteList?: (Array<string> | undefined);
            selectorDoubleList?: (Array<string> | undefined);
        } | undefined);
        experimental?: ({
            webpackSyntaxValidate?: (Array<string> | undefined);
        } | undefined);
        flexBugs?: (boolean | undefined);
        optimization?: ({
            skipModules?: (boolean | undefined);
        } | undefined);
    } | undefined;
    utoopack?: false | {} | undefined;
    hmrGuardian?: boolean | undefined;
    forget?: false | {
        ReactCompilerConfig?: ({} | undefined);
    } | undefined;
    verifyCommit?: false | {
        scope?: (Array<string> | undefined);
        allowEmoji?: (boolean | undefined);
    } | undefined;
    run?: false | {
        globals?: (Array<string> | undefined);
    } | undefined;
    access?: false | {
        [x: string]: any;
    } | undefined;
    analytics?: false | {
        baidu?: (string | undefined);
        ga?: (string | undefined);
        ga_v2?: (string | undefined);
    } | undefined;
    antd?: false | {
        dark?: (boolean | undefined);
        compact?: (boolean | undefined);
        import?: (boolean | undefined);
        style?: ("less" | "css" | undefined);
        theme?: ({
            components: {
                [x: string]: {
                    [x: string]: any;
                };
            };
        } | {
            [x: string]: any;
        } | undefined);
        appConfig?: ({
            [x: string]: any;
        } | undefined);
        momentPicker?: (boolean | undefined);
        styleProvider?: ({
            [x: string]: any;
        } | undefined);
        configProvider?: ({
            theme: {
                components: {
                    [x: string]: {
                        [x: string]: any;
                    };
                };
            } | {
                [x: string]: any;
            };
        } | {
            [x: string]: any;
        } | undefined);
    } | undefined;
    dva?: false | {
        extraModels?: (Array<string> | undefined);
        immer?: ({
            [x: string]: any;
        } | undefined);
        skipModelValidate?: (boolean | undefined);
    } | undefined;
    initialState?: false | {
        loading?: (string | undefined);
    } | undefined;
    layout?: false | {
        [x: string]: any;
    } | undefined;
    locale?: false | {
        default?: (string | undefined);
        useLocalStorage?: (boolean | undefined);
        baseNavigator?: (boolean | undefined);
        title?: (boolean | undefined);
        antd?: (boolean | undefined);
        baseSeparator?: (string | undefined);
    } | undefined;
    mf?: false | {
        name?: (string | undefined);
        remotes?: (Array<{
            aliasName?: (string | undefined);
            name: string;
            entry?: (string | undefined);
            entries?: ({} | undefined);
            keyResolver?: (string | undefined);
        }> | undefined);
        shared?: ({
            [x: string]: any;
        } | undefined);
        library?: ({
            [x: string]: any;
        } | undefined);
        remoteHash?: (boolean | undefined);
    } | undefined;
    model?: false | {
        extraModels?: (Array<string> | undefined);
        sort?: ((((...args: any[]) => unknown) | undefined) | undefined);
    } | undefined;
    moment2dayjs?: false | {
        preset?: ("antd" | "antdv3" | "none" | undefined);
        plugins?: (Array<string> | undefined);
    } | undefined;
    qiankun?: false | {
        slave?: ({
            [x: string]: any;
        } | undefined);
        master?: ({
            [x: string]: any;
        } | undefined);
        externalQiankun?: (boolean | undefined);
    } | undefined;
    reactQuery?: false | {
        devtool?: ({
            [x: string]: any;
        } | boolean | undefined);
        queryClient?: ({
            [x: string]: any;
        } | boolean | undefined);
    } | undefined;
    request?: false | {
        dataField?: (string | undefined);
    } | undefined;
    styledComponents?: false | {
        babelPlugin?: ({
            [x: string]: any;
        } | undefined);
    } | undefined;
    tailwindcss?: false | {
        [x: string]: any;
    } | undefined;
    valtio?: false | {} | undefined;
} & import("@umijs/preset-umi").IConfig;
export default _default;
