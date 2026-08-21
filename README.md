# 哈利·波特 · 魔法纪元

魔法世界沙盘 · 超高自由度人生模拟器。基于《哈利·波特》原著七部小说的交互式文字冒险游戏，由 DeepSeek 大模型驱动世界模拟。

你不是"大难不死的男孩"。你只是这个魔法世界里出生的一个人。

## 技术栈

- **前端**：React 19 + Vite 8 + Zustand + react-markdown
- **AI 引擎**：DeepSeek API（`deepseek-v4-pro`），流式输出
- **存档**：浏览器 localStorage + JSON 导出/导入

## 本地开发

```bash
npm install
# 复制 .env.example 为 .env 并填入 DeepSeek API Key
npm run dev
```

打开 http://localhost:5173

## 生产部署

```bash
npm run build
PORT=8787 node server.mjs
```

`server.mjs` 同时托管 `dist` 静态文件，并把 `/api/*` 请求代理到 DeepSeek（密钥只在服务端，不暴露给浏览器）。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥（写在 `.env`，已加入 `.gitignore`） |
| `PORT` | 生产服务器端口，默认 `8787` |

## 部署隔离说明

本项目可与其他项目在同一台服务器共存。通过设置不同的 `PORT` 环境变量（如 `PORT=8787`）即可做到端口隔离、互不干扰。密钥放在本项目自己的 `.env` 文件中，不与其他项目共享。
