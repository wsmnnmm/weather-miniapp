import Taro from "@tarojs/taro";
import { ForecastItem, WeatherData } from "./types";

type EnvType = "develop" | "trial" | "release";

let env: EnvType = "release"; // 默认值

const getApiBase = (): string => {
  if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
    // 小程序逻辑
    const accountInfo = Taro.getAccountInfoSync();
    env = accountInfo.miniProgram.envVersion as EnvType;
    return env === "release"
      ? "http://localhost:3000"
      : "https://sad.wsmnnmm.online";
  } else {
    // H5 环境逻辑
    return process.env.NODE_ENV === "development"
      ? "https://sad.wsmnnmm.online"
      : "https://sad.wsmnnmm.online";
  }
};

const API_BASE = getApiBase();

export const weatherApi = {
  // 获取实时天气
  async getCurrentWeather(city?: string): Promise<WeatherData> {
    const res = await Taro.request({
      url: `${API_BASE}/api/weather`,
      method: "GET",
      data: { type: "live", city },
    });
    return res.data.data.live;
  },

  // 获取预报天气
  async getForecast(city?: string): Promise<ForecastItem[]> {
    const res = await Taro.request({
      url: `${API_BASE}/api/weather`,
      method: "GET",
      data: { type: "forecast", city },
    });
    return res.data.data.forecast;
  },
  // 生成祝福语
  async getBlessingStream(type: string, params: Record<string, any>) {
    const isH5 = Taro.getEnv() === Taro.ENV_TYPE.WEB;

    // H5 环境使用 Fetch API + ReadableStream
    if (isH5) {
      try {
        const query = new URLSearchParams({ type, ...params }).toString();
        const response = await fetch(`${API_BASE}/api/blessing?${query}`);

        if (!response.body) {
          throw new Error("流式响应不可用");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            Taro.eventCenter.trigger("blessing_end");
            return true;
          }
          processStreamChunk(value);
        }
      } catch (err) {
        Taro.eventCenter.trigger("blessing_error", err);
        throw err;
      }
    }

    // 小程序环境保持原有逻辑
    return new Promise((resolve, reject) => {
      const task = Taro.request({
        url: `${API_BASE}/api/blessing`,
        method: "GET",
        data: { type, ...params },
        enableChunked: true,
        responseType: "arraybuffer",
        enableCache: false,
        timeout: 300000,
        success: (res) => {
          if (res.statusCode === 200) resolve(true);
        },
        fail: (err) => {
          Taro.eventCenter.trigger("blessing_error", err);
          reject(err);
        },
      });

      task.onChunkReceived((res) => {
        processStreamChunk(res.data);
      });
    });
  },
  // async getBlessingStream(type: string, params: Record<string, any>) {
  //   return new Promise((resolve, reject) => {
  //     const task = Taro.request({
  //       url: `${API_BASE}/api/blessing`,
  //       method: "GET",
  //       data: { type, ...params },
  //       enableChunked: true, // 关键参数：启用分块传输
  //       responseType: "arraybuffer", // 必须指定
  //       enableCache: false, // 安卓设备需要
  //       timeout: 300000,
  //       success: (res) => {
  //         if (res.statusCode === 200) {
  //           Taro.eventCenter.trigger("blessing_end");
  //           resolve(true);
  //         }
  //       },

  //       fail: (err) => {
  //         Taro.eventCenter.trigger("blessing_error", err);
  //         reject(err);
  //       },
  //     });
  //     // 数据块接收回调
  //     task.onChunkReceived((res) => {
  //       console.log("onChunkReceived了吗？", res);

  //       try {
  //         //  const base64 = Taro.arrayBufferToBase64(res.data);
  //         // const raw =  decodeURIComponent(escape(atob(base64)));
  //         const raw = new TextDecoder().decode(res.data);
  //         // 过滤心跳包
  //         if (raw.startsWith(":")) return;

  //         // 关键修改：按 data: 分割并清理空块
  //         const chunks = raw
  //           .split("data: ") // 分割数据块
  //           .map((chunk) => chunk.trim()) // 清理空格
  //           .filter((chunk) => chunk !== ""); // 过滤空块
  //         console.log(chunks, "chunks");

  //         chunks.forEach((chunk) => {
  //           try {
  //             const payload = JSON.parse(chunk);
  //             console.log("处理块:", payload);
  //             if (payload?.text?.includes("[DONE]")) {
  //               // 结束标志处理
  //               Taro.eventCenter.trigger("blessing_end");
  //               task.abort(); // 终止请求
  //             } else {
  //               Taro.eventCenter.trigger("blessing_chunk", payload);
  //             }
  //           } catch (e) {
  //             if (chunk.includes("[DONE]")) {
  //               // 结束标志处理
  //               Taro.eventCenter.trigger("blessing_end");
  //               task.abort(); // 终止请求
  //             }
  //             console.error("解析失败:", e, "原始数据:", chunk);
  //           }
  //         });
  //       } catch (e) {
  //         // Taro.eventCenter.trigger("blessing_error", e);
  //         console.error("解析失败:", e, "原始数据:");
  //       }
  //     });
  //   });
  // },

  // 发送短信提醒
  async sendAlertSMS(phone: string, message: string) {
    return Taro.request({
      url: `${API_BASE}/api/sms`,
      method: "POST",
      data: { phone, message },
    });
  },
};

// 新增公共方法：处理流式数据块（复用逻辑）
const processStreamChunk = (chunkData: ArrayBuffer | Uint8Array) => {
  try {
    // 统一转换成 ArrayBuffer
    const buffer =
      chunkData instanceof Uint8Array
        ? new Uint8Array(chunkData).buffer
        : chunkData;

    const raw = new TextDecoder().decode(buffer);

    // 过滤 SSE 协议心跳包
    if (raw.startsWith(":")) return;

    // 按协议分割数据块
    const chunks = raw
      .split("data: ")
      .map((chunk) => chunk.trim())
      .filter((chunk) => chunk !== "");

    chunks.forEach((chunk) => {
      try {
        // 结束标记检测
        if (chunk.includes("[DONE]")) {
          Taro.eventCenter.trigger("blessing_end");
          return;
        }

        const payload = JSON.parse(chunk);
        if (payload?.text) {
          Taro.eventCenter.trigger("blessing_chunk", payload);
        }
      } catch (e) {
        console.error("JSON 解析失败:", e, "原始数据:", chunk);
      }
    });
  } catch (e) {
    console.error("数据块处理异常:", e);
  }
};
