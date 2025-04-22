# 大模型小说创作

![NovelAI](https://socialify.git.ci/qgming/llmnovel/image?language=1&logo=https%3A%2F%2Fraw.githubusercontent.com%2Fqgming%2Fllmnovel%2Fmain%2Fpublic%2Ffavicon.ico&name=1&owner=1&stargazers=1&theme=Light)

<p align="center">
  <h3 align="center"><strong>大模型小说创作平台</strong></h3>
  <p align="center">
    基于AI大模型的小说创作辅助工具
    <br />
    <br />
    <a href="https://book.jdwdai.com">在线体验</a>
    ·
    <a href="https://github.com/qgming/llmnovel/issues">报告Bug</a>
    ·
    <a href="https://github.com/qgming/llmnovel/issues">提出新特性</a>
  </p>
</p>

## ✨ 核心功能

- **AI 智能写作** - 基于 DeepSeek-V3 的章节内容生成
- **角色管理** - 完善的角色档案创建与维护
- **世界观构建** - 可视化世界观设定与管理
- **章节历史** - 版本控制与内容回溯
- **向量搜索** - 基于 BGE-M3 的内容语义检索

## 🚀 快速开始

### 安装步骤

1. 获取 API 密钥 [DeepSeek 平台](https://platform.deepseek.com/)
2. 克隆仓库

```sh
git clone https://github.com/qgming/llmnovel.git
```

3. 安装依赖

```sh
npm install
```

4. 配置环境变量

```sh
cp .env.example .env
```

5. 启动开发服务器

```sh
npm run dev
```

## 📂 项目结构

```
llmnovel/
├── public/
├── src/
│   ├── components/
│   │   ├── BackgroundSetting.vue
│   │   ├── CharacterProfile.vue
│   │   ├── WorldView.vue
│   │   └── WritingArea.vue
│   ├── services/
│   │   └── aiService.ts
│   ├── utils/
│   │   ├── aiwriting.ts
│   │   └── VectorSearch.ts
│   ├── views/
│   │   ├── CreateView.vue
│   │   └── HomeView.vue
│   └── main.ts
├── package.json
└── vite.config.ts
```

## 🛠️ 技术栈

- **前端框架**: Vue 3 + TypeScript
- **状态管理**: Pinia
- **AI 集成**: DeepSeek-V3 + BGE-M3
- **本地存储**: IndexedDB
- **构建工具**: Vite

## 🤝 参与贡献

欢迎提交 Pull Request 或 Issue 报告问题

## 📜 开源协议

MIT License © 2025

## 🙏 鸣谢

- [DeepSeek](https://deepseek.com)
- [Vercel](https://vercel.com)
