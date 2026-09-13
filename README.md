# Agent 转行学习计划 · 进度看板

前端工程师转行 Agent 开发的六个月学习路线 + 进度管理看板。

**技术栈**：React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router

## 功能

| 页面 | 说明 |
|---|---|
| **仪表盘** | 总进度环、当前阶段、里程碑倒计时、今日任务（「去学习」直达课程页 /「已完成」就地标记）、本章节目标与学习建议 |
| **学习路线** | 左右布局：左侧甘特图（黑色「今天」基准线，左侧彩色——绿=已完成、红=延期，未来灰色），点击行右侧显示该章节路线卡片，默认选中当前阶段 |
| **学习目标** | 大目标（offer 北极星）、中目标（里程碑，随排期自动更新）、小目标（可验收数字）、能力清单、作品集目标 |
| **进度打卡** | 左右布局：左侧章节列表，右侧任务勾选、完成日期记录、周期调整——完成后所有阶段**自动级联重排** |

学习建议不设独立菜单，直接嵌入仪表盘与路线卡片。

## 进度保存在哪？

存在项目内 `data/progress.json`（**不使用浏览器 localStorage**），由本地服务提供读写 API：

- `GET /api/progress` 读取
- `PUT /api/progress` 保存

dev 模式由 Vite 插件承担同一 API；生产模式由 `server/index.mjs` 承担。

## 快速开始

```bash
npm install

# 开发模式（含进度持久化 API）
npm run dev

# 生产模式：构建 + 启动本地服务（http://localhost:4321）
npm run build
npm start            # 加 --open 参数自动打开浏览器
```

Windows 桌面快捷方式「Agent学习计划」等价于 `node server/index.mjs --open`。

## 部署说明

`.github/workflows/deploy.yml` 会在 push 到 `main` 时构建并部署到 GitHub Pages。
注意：Pages 为纯静态环境，进度读写 API 不可用，页面会提示「本地服务未运行」——
**完整体验（含进度落盘）请本地运行**。

## 动态重排规则

- 某阶段记录实际完成日期后，后续所有阶段从该日期次日级联顺延/前移
- 调整「周期天数」同样联动重排
- 里程碑日期、预计完成日、甘特图实时同步
