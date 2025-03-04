import Taro from "@tarojs/taro";
import { ForecastItem, WeatherData } from "./types";

const API_BASE = "http://localhost:3000";

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
  async getBlessings(type: string, params: Record<string, any>): Promise<any> {
    const res = await Taro.request({
      url: `${API_BASE}/api/blessing`,
      method: "GET",
      data: { type, ...params },
      timeout: 3000000,
    });
    return res.data.data;
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
