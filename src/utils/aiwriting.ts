import { aiService, extractKeywords } from '../services/aiService'
import type { AIConfig, AIStreamHandler, HybridSearchResult } from '../types/ai'
import { vectorizeText, searchSimilarVectors, formatSimilarity } from './vectorUtils'
import { VectorSearch } from './VectorSearch'
import { getChapters } from './db'

const WRITING_PROMPT_TEMPLATE = `# 身份设定
你是顶级网络小说创作专家，拥有以下特质：
1. 擅长黄金三章写法，开篇即能抓住读者
2. 精通各类网文套路(退婚流、系统流、重生流等)
3. 作品长期占据各大平台畅销榜

# 核心创作原则
## 基础要求
✓ 单句成段，每段不超过2行
✓ 语言通俗直白，避免复杂句式
✓ 每章不少于2000字
✓ 严格避免：绿帽、虐主、降智等毒点

## 进阶技巧
★ 每章包含完整起承转合结构：
- 起：自然承接上章，引出本章事件
- 承：展开矛盾冲突
- 转：制造意外转折
- 合：留下悬念钩子

★ 情绪渲染：
- 通过细节描写增强代入感
- 适当使用心理活动描写
- 关键情节强化情绪张力

# 创作素材库
[前文脉络 - 最新两章]
{recentChapters}

[世界观/角色资料]
{backgroundMemory}

# 用户明确指令
---
{userInput}
---

# 创作任务
请融合以上所有素材，创作一章高质量网文：
1. 开篇30字内抓住读者注意力
2. 中间情节有至少3个爽点/反转
3. 结尾留下强悬念
4. 保持与前文设定100%一致
5. 自然埋下后续剧情伏笔`

export async function generateWriting(
  userInput: string,
  config: AIConfig,
  handler: AIStreamHandler,
  bookId?: number
): Promise<void> {
  try {
    let recentChapters = ''
    let backgroundMemory = ''
    
    if (bookId) {
      // 提取关键词
      const { keywords } = await extractKeywords(userInput, config)
      console.log('提取的关键词:', keywords)
      
      // 获取查询向量
      const { vector } = await vectorizeText(userInput)
      
      // 执行混合搜索
      const result: HybridSearchResult = await VectorSearch.hybridSearch(
        vector,
        bookId,
        userInput,
        keywords,
        {
          worldviewThreshold: 0.55,
          characterThreshold: 0.6,
          keywordThreshold: 0.3
        }
      )
      
      // 构建背景记忆文本
      if (result.worldview) {
        backgroundMemory = `[世界观背景]\n${result.worldview}\n\n`
      }
      if (result.characters.length > 0) {
        backgroundMemory += '[相关角色信息(按相关性排序)]\n'
        backgroundMemory += result.characters
          .map(c => `- ${c.name}: ${c.description}`)
          .join('\n')
      }
      
      // 如果没有找到任何背景资料，则使用空字符串
      if (!result.worldview && result.characters.length === 0) {
        backgroundMemory = ''
      }
  
      // 获取最新两章内容（不通过搜索，直接从数据库获取）
      if (bookId) {
        const chapters = await getChapters(bookId)
        if (chapters.length > 0) {
          recentChapters = chapters
            .slice(0, 2) // 取最新两章
            .map(c => `[${c.title}]\n${c.content}`)
            .join('\n\n')
        }
      }
  
      // 构建背景记忆文本（通过向量/关键词搜索得到的内容）
      if (result.worldview) {
        backgroundMemory = `[世界观]\n${result.worldview}\n\n`
      }
      if (result.characters.length > 0) {
        if (backgroundMemory) {
          backgroundMemory += '\n'
        }
        backgroundMemory += '[相关角色]\n'
        backgroundMemory += result.characters
          .map(c => `- ${c.name}: ${c.description}`)
          .join('\n')
      }
    }

    // 构建完整提示词
    const fullPrompt = WRITING_PROMPT_TEMPLATE
      .replace('{backgroundMemory}', backgroundMemory)
      .replace('{recentChapters}', recentChapters)
      .replace('{userInput}', userInput)
    
    // 打印用户输入内容到控制台
    console.log('用户输入内容:', userInput)
    console.log('完整提示词:', fullPrompt)
    
    // 调用AI服务
    await aiService.createCompletion(fullPrompt, config, handler)
  } catch (error) {
    handler(error instanceof Error ? error : new Error(String(error)))
  }
}