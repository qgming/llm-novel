import { defineStore } from "pinia";
import { ref } from "vue";

export const useConfigStore = defineStore("config", () => {
  const writingConfig = ref({
    provider: "https://api.siliconflow.cn/v1",
    model: "deepseek-ai/DeepSeek-V3",
    apiKey: "",
  });

  const embeddingConfig = ref({
    provider: "https://api.siliconflow.cn/v1/embeddings",
    model: "BAAI/bge-m3",
    apiKey: "",
  });

  // 从本地存储加载配置
  const loadConfig = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("modelConfig") || "{}");

      writingConfig.value = {
        ...writingConfig.value,
        ...(saved.writing || {}),
      };

      embeddingConfig.value = {
        ...embeddingConfig.value,
        ...(saved.embedding || {}),
      };
    } catch (error) {
      console.error("加载配置失败:", error);
    }
  };

  // 保存配置到本地存储
  const saveConfig = () => {
    try {
      localStorage.setItem(
        "modelConfig",
        JSON.stringify({
          writing: writingConfig.value,
          embedding: embeddingConfig.value,
        })
      );
      return true;
    } catch (error) {
      console.error("保存配置失败:", error);
      return false;
    }
  };

  return { writingConfig, embeddingConfig, loadConfig, saveConfig };
});
