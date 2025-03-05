// pages/bless/index.tsx
import { View, Text, Input, Textarea, Button } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import "./index.scss";
import { useRequest } from "ahooks";
import { weatherApi } from "../../services/api";

type ScenarioType = "weather" | "birthday" | "mbti";

export default function Bless() {
  const router = useRouter();
  const [scenario, setScenario] = useState<ScenarioType>("weather");
  const [params, setParams] = useState<Record<string, any>>({});
  const [blessText, setBlessText] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);

  useRequest(() => weatherApi.getCurrentWeather("440100"), {
    onSuccess: (data) => {
      setParams({ temp: data?.temperature, weather: data?.weather });
    },
  });

  // 初始化场景参数
  useEffect(() => {
    const scenarioParam = router.params.scenario as ScenarioType;
    setScenario(scenarioParam || "weather");

    const initParams = {
      weather: { temp: "", weather: "" },
      birthday: { name: "", age: "", zodiac: "" },
      mbti: { mbtiType: "", relationship: "" },
    }[scenarioParam];

    setParams(initParams);
  }, []);

  // 动态生成输入字段
  const renderInputs = () => {
    const fields = {
      weather: [
        { key: "temp", label: "当前温度", type: "number" },
        { key: "weather", label: "天气状况" },
      ],
      birthday: [
        { key: "name", label: "寿星姓名" },
        { key: "age", label: "年龄", type: "number" },
        { key: "zodiac", label: "生肖" },
      ],
      mbti: [
        { key: "mbtiType", label: "MBTI类型" },
        { key: "relationship", label: "你们的关系" },
      ],
    }[scenario];

    return fields?.map(({ key, label, type }) => (
      <View key={key} className="input-group">
        <Text className="input-label">{label}</Text>
        <Input
          type={type as any}
          value={params[key]}
          placeholder={`请输入${label}`}
          onInput={(e) => setParams({ ...params, [key]: e.detail.value })}
          className="input-field"
        />
      </View>
    ));
  };

  const generateBless = async () => {
    setLoading(true);
    // API调用逻辑
    try {
      const blessings = await weatherApi.getBlessings(scenario, params);
      setBlessText(blessings?.content ?? "无");
    } catch (error) {
      Taro.showToast({
        title: `生成失败...`,
        icon: "error",
      });
      console.error("Failed to generate blessings:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendBless = (type: "sms" | "email") => {
    if (!contact) {
      Taro.showToast({
        title: `请输入${type === "sms" ? "手机号" : "邮箱"}`,
        icon: "none",
      });
      return;
    }
    // 发送逻辑
  };

  return (
    <View className="bless-container">
      {/* 场景参数输入区 */}
      <View className="scenario-section">
        <View className="input-grid">{renderInputs()}</View>
      </View>

      {/* 联系方式输入 */}
      <View className="contact-section">
        <Input
          value={contact}
          placeholder="请输入邮箱"
          onInput={(e) => setContact(e.detail.value)}
          className="contact-input"
        />
      </View>

      {/* 生成结果区 */}
      <View className="result-section">
        <Textarea
          value={blessText}
          placeholder="生成的祝福语将出现在这里"
          className={`result-area ${loading ? "loading" : ""}`}
          disabled={loading}
        />
      </View>

      {/* 操作按钮组 */}
      <View className="action-bar">
        <Button
          className="generate-btn"
          onClick={generateBless}
          loading={loading}
        >
          {loading ? "生成中..." : "生成祝福"}
        </Button>

        <View className="send-buttons">
          {/* <Button className="send-btn sms" onClick={() => sendBless("sms")}>
            短信发送
          </Button> */}
          <Button className="send-btn email" onClick={() => sendBless("email")}>
            邮件发送
          </Button>
        </View>
      </View>
    </View>
  );
}
