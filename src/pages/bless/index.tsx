// pages/bless/index.tsx
import { useRequest } from "ahooks";
import { View, Text, Input, Textarea, Button } from "@tarojs/components";
import Taro, { useRouter } from "@tarojs/taro";
import { useState, useEffect } from "react";
import "./index.scss";
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

  const handleChunk = (chunk: { text: string }) => {
    console.log(chunk, "chunk");

    setBlessText((prev) => {
      // 增量更新文本内容
      const newText = prev + chunk?.text;
      console.log(newText, "newText");

      // 自动滚动到底部（如果有多行文本）
      setTimeout(() => {
        const query = Taro.createSelectorQuery();
        query.select("#blessing-text").boundingClientRect();
        query.selectViewport().scrollOffset();
        query.exec((res) => {
          if (res?.[1]) {
            Taro.pageScrollTo({
              scrollTop: res[1].scrollTop + 500,
              duration: 300,
            });
          }
        });
      }, 50);

      return newText;
    });
  };

  const handleStreamEnd = () => {
    Taro.showToast({
      title: "生成完成",
      icon: "success",
    });
    setLoading(false);
  };

  const handleError = (error: any) => {
    Taro.showToast({
      title: `生成失败: ${error.errMsg || "未知错误"}`,
      icon: "none",
    });
    setLoading(false);
  };

  // 1. 验证事件监听器绑定状态
  useEffect(() => {
    console.log("绑定监听器前:", {
      blessing_chunk: Taro.eventCenter,
      blessing_end: Taro.eventCenter,
    });

    const realHandleChunk = (data) => {
      console.log("实际处理函数被调用", data);
      handleChunk(data);
    };

    Taro.eventCenter.on("blessing_chunk", realHandleChunk);
    Taro.eventCenter.on("blessing_end", handleStreamEnd);
    Taro.eventCenter.on("blessing_error", handleError);

    console.log("绑定监听器后:", {
      blessing_chunk: Taro.eventCenter,
      blessing_end: Taro.eventCenter,
    });

    return () => {
      console.log("清理监听器");
      Taro.eventCenter.off("blessing_chunk", realHandleChunk);
      Taro.eventCenter.off("blessing_end", handleStreamEnd);
      Taro.eventCenter.off("blessing_error", handleError);
    };
  }, []);

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
    setBlessText(""); // 清空之前的内容

    try {
      await weatherApi.getBlessingStream(scenario, params);
    } catch (error) {
      console.error("请求初始化失败:", error);
    } finally {
      // 注意：这里不能设置loading=false，需等待end/error事件
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
          onClick={() => {
            if (!loading) {
              generateBless();
            }
          }}
          loading={loading}
        >
          {loading ? "生成中..." : "生成祝福"}
        </Button>

        <View className="send-buttons">
          {/* <Button className="send-btn sms" onClick={() => sendBless("sms")}>
            短信发送
          </Button> */}
          {/* <Button className="send-btn email" onClick={() => sendBless("email")}>
            邮件发送
          </Button> */}
        </View>
      </View>
    </View>
  );
}
