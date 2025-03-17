import { useEffect, useState } from "react";
import { View, Text, Button, Input } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { weatherApi } from "../../services/api";
import { WeatherData, ForecastItem } from "../../services/types";
import "./index.scss";

// 在天气数据处使用

export default function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState<WeatherData>();
  const [forecast, setForecast] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("13800138000");

  // 初始化加载数据
  useEffect(() => {
    loadWeatherData();
  }, []);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const [current, forecastData] = await Promise.all([
        weatherApi.getCurrentWeather("440100"),
        weatherApi.getForecast("440100"),
      ]);

      checkWeatherAlert(current);
      setCurrentWeather(current);
      setForecast(forecastData);
    } catch (error) {
      Taro.showToast({ title: "数据加载失败", icon: "none" });
    } finally {
      setLoading(false);
    }
  };

  // 检查天气预警
  const checkWeatherAlert = (data: WeatherData) => {
    const alerts = [];
    if (data.humidity > 85) alerts.push("高湿");
    if (data.tempMin < 10) alerts.push("低温");

    if (alerts.length > 0) {
      Taro.showModal({
        title: "天气预警",
        content: `检测到${alerts.join("+")}天气，请注意防护！`,
        confirmText: "发送提醒",
      }).then((res) => {
        if (res.confirm) handleSendSMS(alerts);
      });
    }
  };

  // 发送短信提醒
  const handleSendSMS = async (alerts: string[]) => {
    try {
      await weatherApi.sendAlertSMS(
        phone,
        `【天气提醒】检测到${alerts.join("+")}天气，请注意防潮保暖`
      );
      Taro.showToast({ title: "提醒已发送" });
    } catch (error) {
      Taro.showToast({ title: "发送失败", icon: "none" });
    }
  };

  // 渲染加载状态
  if (loading) {
    return (
      <View className="loading">
        <Text>天气数据加载中...</Text>
      </View>
    );
  }

  return (
    <View className="container">
      {/* 当前天气模块 */}
      <View className="current-weather">
        <Text className="city">{currentWeather?.city}</Text>
        <Text className="temp"> 当前温度：{currentWeather?.temperature}℃</Text>
        <View className="details">
          <Text>湿度: {currentWeather?.humidity}%</Text>
          <Text>天气: {currentWeather?.weather}</Text>
          <Text>数据发布时间: {currentWeather?.reporttime}</Text>
        </View>
        <View>
          <Text>湿度: {currentWeather?.humidity}%</Text>
          <View>
            <iconfont name="tianqi1" size="30" />
          </View>
        </View>
      </View>

      {/* 天气预报模块 */}
      <View className="forecast">
        <Text className="title">三日预报</Text>
        {forecast.map((item, index) => (
          <View key={index} className="forecast-item">
            <Text>
              {item.date} ({item.week})
            </Text>
            <Text>
              白天: {item.dayWeather} {item.dayTemp}℃
            </Text>
            <Text>
              夜间: {item.nightWeather} {item.nightTemp}℃
            </Text>
          </View>
        ))}
      </View>

      {/* 短信提醒设置 */}
      <View className="sms-section">
        <Text>接收手机号:</Text>
        <Input
          value={phone}
          onInput={(e) => setPhone(e.detail.value)}
          placeholder="请输入手机号"
        />
        {/* {currentWeather?.isAlert && ( */}
        <Button className="sms-button" onClick={handleSendSMS}>
          发送防潮提醒
        </Button>
        {/* )} */}
      </View>
    </View>
  );
}
