import OpenAI from "openai";
import { useConfigStore } from "@/stores/configStore";

function getBaseUrl(provider) {
  // 直接返回用户输入的provider作为完整URL
  return provider;
}

export function createAIClient() {
  const config = useConfigStore().writingConfig;

  const openai = new OpenAI({
    baseURL: getBaseUrl(config.provider),
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
  });

  return {
    async getCompletion(messages, options = {}) {
      try {
        const finalOptions = {
          model: config.model,
          temperature: 0.7,
          stream: true,
          ...options,
          messages,
        };

        if (finalOptions.stream) {
          const stream = await openai.chat.completions.create(finalOptions);
          return stream;
        } else {
          const completion = await openai.chat.completions.create(finalOptions);
          return completion.choices[0].message.content;
        }
      } catch (error) {
        console.error("API请求出错:", error);
        return null;
      }
    },
  };
}
