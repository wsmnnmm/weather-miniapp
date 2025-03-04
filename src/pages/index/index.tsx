import { View, Text, Button } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useState } from "react";
import "./index.scss";

export default function Index() {
  const [scenario, setScenario] = useState("weather");
  const scenarios = [
    { id: "weather", name: "天气场景", icon: "⛅" },
    { id: "birthday", name: "生日祝福", icon: "🎂" },
    { id: "mbti", name: "MBTI个性", icon: "🧩" },
  ];

  const navigateToBless = () => {
    console.log(scenario, "scenario");

    Taro.navigateTo({ url: `/pages/bless/index?scenario=${scenario}` });
  };

  return (
    <View className="container">
      <Text className="title">选择祝福场景</Text>
      <View className="scenario-grid">
        {scenarios.map((item) => (
          <View
            key={item.id}
            className={`scenario-item ${scenario === item.id ? "active" : ""}`}
            onClick={() => setScenario(item.id)}
          >
            <Text className="icon">{item.icon}</Text>
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>
      <Button className="generate-btn" onClick={navigateToBless}>
        生成祝福语
      </Button>
    </View>
  );
}
