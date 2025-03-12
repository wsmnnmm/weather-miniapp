// eslint-disable-next-line import/no-commonjs
const webpack = require("webpack");
// 引入 webpack 模块
const config = {
  projectName: "weather-miniapp",
  date: "2025-2-28",
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: "src",
  outputRoot: "dist",
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {},
  },
  framework: "react",
  // compiler: "webpack5",
  compiler: {
    type: "webpack5",
    prebundle: {
      enable: false,
      include: ["text-encoding"], // 强制包含 text-encoding polyfill
      exclude: ["@nutui/nutui-react-taro", "@nutui/icons-react-taro"],
    },
  },
  cache: {
    enable: false, // Webpack 持久化缓存配置，建议开启。默认配置请参考：https://docs.taro.zone/docs/config-detail#cache
  },
  mini: {
    webpackChain(chain) {
      // 正确初始化 DefinePlugin
      chain
        .plugin("define")
        .use(webpack.DefinePlugin, [{}]) // 先定义插件
        .tap((args) => {
          // 合并原有环境变量（不要覆盖）
          args[0] = args[0] || {};
          args[0]["process.env"] = {
            ...(args[0]["process.env"] || {}),
            TARO_APP_API_BASE: JSON.stringify(process.env.TARO_APP_API_BASE),
          };
          return args;
        });
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
      url: {
        enable: true,
        config: {
          limit: 1024, // 设定转换尺寸上限
        },
      },

      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: "module", // 转换模式，取值为 global/module
          generateScopedName: "[name]__[local]___[hash:base64:5]",
        },
      },
    },
  },
  h5: {
    publicPath: "/",
    staticDirectory: "static",
    devServer: {
      proxy: {
        "/api": {
          target: "https://sad.wsmnnmm.online",
          changeOrigin: true,
        },
      },
    },
    onProxyReqWs(proxyReq) {
      proxyReq.setHeader("Connection", "keep-alive");
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {},
      },
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
        config: {
          namingPattern: "module", // 转换模式，取值为 global/module
          generateScopedName: "[name]__[local]___[hash:base64:5]",
        },
      },
    },
  },
  rn: {
    appName: "taroDemo",
    postcss: {
      cssModules: {
        enable: false, // 默认为 false，如需使用 css modules 功能，则设为 true
      },
    },
  },
};

module.exports = function (merge) {
  if (process.env.NODE_ENV === "development") {
    return merge({}, config, require("./dev"));
  }
  return merge({}, config, require("./prod"));
};
