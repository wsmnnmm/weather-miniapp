// export default defineAppConfig({
//   pages: [
//     'pages/index/index'
//   ],
//   window: {
//     backgroundTextStyle: 'light',
//     navigationBarBackgroundColor: '#fff',
//     navigationBarTitleText: 'WeChat',
//     navigationBarTextStyle: 'black'
//   }
// })
export default {
  pages: ["pages/index/index", "pages/weather/index", "pages/bless/index"],
  tabBar: {
    color: "#999",
    selectedColor: "#2f5aff",
    backgroundColor: "#fff",
    list: [
      {
        pagePath: "pages/index/index",
        text: "首页",
        // iconPath: 'assets/home.png',
        // selectedIconPath: 'assets/home-active.png'
      },
      {
        pagePath: "pages/weather/index",
        text: "天气",
      },
      // {
      //   pagePath: "pages/bless/index",
      //   text: "祝福语",
      // },
    ],
  },
  window: {
    navigationBarTitleText: "祝福语",
    backgroundTextStyle: "light",
  },
  networkTimeout: {
    request: 10000,
  },
  usingComponents: {
    iconfont: "iconfont/iconfont",
  },
  // 配置合法域名
  requiredBackgroundModes: ["getLocation"],
  permission: {
    "scope.userLocation": {
      desc: "需要获取您的位置信息用于天气服务",
    },
  },
};
