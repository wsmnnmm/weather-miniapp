import { PropsWithChildren } from "react";
import { TextEncoder, TextDecoder } from "text-encoding-polyfill";
import { useLaunch } from "@tarojs/taro";
import "./app.scss";

if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder as any;
}

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log("App launched.");
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;
