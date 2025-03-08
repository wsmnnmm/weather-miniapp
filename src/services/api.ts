import Taro from "@tarojs/taro";
import { ForecastItem, WeatherData } from "./types";

type EnvType = "develop" | "trial" | "release";

const accountInfo = Taro.getAccountInfoSync();

const env = accountInfo.miniProgram.envVersion as EnvType;

// "http://localhost:3000"

const API_BASE =
  env === "develop"
    ? "http://localhost:3000"
    : env === "trial"
    ? "http://sad.wsmnnmm.online"
    : env === "release"
    ? "https://api.taro-weather.com"
    : "";

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
    let buffer = "";
    return new Promise((resolve, reject) => {
      const task = Taro.request({
        url: `${API_BASE}/api/blessing`,
        method: "GET",
        data: { type, ...params },
        enableChunked: true, // 关键参数：启用分块传输
        responseType: "arraybuffer", // 必须指定
        enableCache: false, // 安卓设备需要
        timeout: 3000000,
        success: (res) => {
          if (res.statusCode === 200) {
            Taro.eventCenter.trigger("blessing_end");
            resolve(true);
          }
        },

        fail: (err) => {
          Taro.eventCenter.trigger("blessing_error", err);
          reject(err);
        },
      });
      // 数据块接收回调
      task.onChunkReceived((res) => {
        console.log("onChunkReceived了吗？", res);

        try {
          const raw = new TextDecoder().decode(res.data);
          // 过滤心跳包
          if (raw.startsWith(":")) return;

          const payload = raw.replace(/^data: /, "");
          console.log("payload", payload, raw);
          Taro.eventCenter.trigger("blessing_chunk", JSON.parse(payload));
        } catch (e) {
          Taro.eventCenter.trigger("blessing_error", e);
        }
      });
    });
  },

  // 发送短信提醒
  async sendAlertSMS(phone: string, message: string) {
    return Taro.request({
      url: `${API_BASE}/api/sms`,
      method: "POST",
      data: { phone, message },
    });
  },
};
