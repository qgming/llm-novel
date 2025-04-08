# 大模型小说创作

一个基于 Vue 3 和 LLM 技术的网络小说创作工具，帮助作者高效完成小说创作。

## 主要功能

- 📖 **书籍管理**：创建/删除小说项目，管理多部作品
- ✍️ **智能写作**：根据章节梗概自动生成完整内容
- 🧠 **背景知识库**：存储世界观、人物设定等背景资料
- 🔍 **智能检索**：自动关联当前写作与已有内容
- 📚 **章节管理**：保存和回顾已创作章节

## 技术栈

- 前端：Vue 3 + Pinia + Vite
- AI 集成：DeepSeek-V3 + BGE-M3 嵌入模型
- 存储：IndexedDB + localStorage
- UI：现代响应式设计

## 快速开始

1. 安装依赖

```sh
npm install
```

2. 配置 API 密钥

- 在设置页面填写您的 AI 服务 API 密钥
- 支持自定义 API 端点

3. 启动开发服务器

```sh
npm run dev
```

4. 开始创作

- 创建新书籍
- 添加世界观和人物设定
- 输入章节梗概开始写作

## 生产构建

```sh
npm run build
```

## 项目结构

src/
├── components/ # 可复用组件
│ ├── BackgroundInfo.vue # 背景资料管理
│ └── PreviousSummary.vue # 前情提要
├── stores/ # Pinia 状态管理
├── utils/ # 工具函数和 API
├── views/ # 页面视图
└── main.js # 应用入口

## 在线体验

本项目由 Vercel 驱动，在线体验：[LLMNOVEL](https://book.jdwdai.com)。

## 推荐 IDE

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (推荐禁用 Vetur)

## 自定义配置

查看 [Vite 配置参考](https://vite.dev/config/)
