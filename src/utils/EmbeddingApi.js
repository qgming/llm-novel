import { useConfigStore } from "@/stores/configStore";

function getBaseUrl(provider) {
  // 直接返回用户输入的provider作为完整URL
  return provider;
}

export const getEmbedding = async (text) => {
  try {
    const config = useConfigStore().embeddingConfig;

    const response = await fetch(config.provider, {
      // 直接使用配置中的完整URL
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        input: text,
        encoding_format: "float",
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error("获取嵌入失败:", error);
    throw error;
  }
};

export const calculateSimilarity = (embedding1, embedding2) => {
  if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length)
    return 0;

  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    magnitude1 += embedding1[i] * embedding1[i];
    magnitude2 += embedding2[i] * embedding2[i];
  }

  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);

  return magnitude1 * magnitude2 ? dotProduct / (magnitude1 * magnitude2) : 0;
};
