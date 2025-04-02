import { getEmbedding, calculateSimilarity } from "./EmbeddingApi";

export const searchRelevantBackground = async (bookName, queryText) => {
  try {
    // 获取查询文本的嵌入向量
    const queryEmbedding = await getEmbedding(queryText);

    // 从IndexedDB获取所有背景信息
    const backgrounds = await new Promise((resolve, reject) => {
      const request = indexedDB.open(bookName);
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction("settings", "readonly");
        const store = transaction.objectStore("settings");

        store.getAll().onsuccess = (e) => resolve(e.target.result);
      };
      request.onerror = reject;
    });

    // 计算综合得分（相似度 + 时间衰减 + 类型权重）
    const results = backgrounds
      .filter((item) => item.embedding)
      .map((item) => {
        const similarity = calculateSimilarity(queryEmbedding, item.embedding);
        const daysSinceCreated = item.createdAt
          ? (Date.now() - new Date(item.createdAt).getTime()) / 86400000
          : 30;

        // 时间衰减因子（最近3天权重更高）
        const timeWeight = 1 + Math.log1p(3 / (daysSinceCreated + 1));

        // 类型权重系数
        const typeWeight =
          {
            worldview: 1.2,
            character: 1.1,
            chapter: 1.0,
          }[item.type] || 1.0;

        return {
          ...item,
          similarity,
          score: similarity * timeWeight * typeWeight,
        };
      })
      // 动态阈值：根据查询长度调整（短查询阈值更低）
      .filter(
        (item) => item.score > Math.max(0.4, 0.5 - queryText.length / 1000)
      );

    // 分类型获取最佳结果
    const getTopByType = (type, count) =>
      results
        .filter((i) => i.type === type)
        .sort((a, b) => b.score - a.score)
        .slice(0, count);

    // 合并结果并保证每类至少1个
    const mergedResults = [
      ...getTopByType("worldview", 2),
      ...getTopByType("character", 2),
      ...getTopByType("chapter", 1),
    ].sort((a, b) => b.score - a.score);

    // 最终选取前5个结果
    const finalResults = Array.from(new Set(mergedResults))
      .slice(0, 5)
      .sort((a, b) => b.type.localeCompare(a.type)); // 世界观 > 人物 > 章节

    // 结构化输出
    const formatResult = (item) => {
      switch (item.type) {
        case "worldview":
          return `【世界观】${item.content}`;
        case "character":
          return `【人物设定】${item.name}：${
            item.description || item.content
          }`;
        case "chapter":
          return `【前情回顾】以下是基于向量搜索匹配到的前文内容，仅供参考：\n${item.content}`;
        default:
          return "";
      }
    };

    return finalResults.map(formatResult).join("\n\n");
  } catch (error) {
    console.error("背景信息搜索失败:", error);
    return null;
  }
};
