# Ledger App

个人实验性自动记账 Web App。当前版本基于 `SPEC.md`，优先完成手动记账、标签和基础统计，后续再接入文字/语音/图片 AI 解析。

## 技术栈

- Next.js App Router + TypeScript
- Ant Design
- ECharts
- SQLite + Drizzle schema
- 本地 `data/` 目录保存数据库和未来上传文件

## 本地启动

```bash
npm install
npm run dev
```

打开 http://localhost:3000。

首次启动时应用会自动创建 `data/ledger.db` 和三张核心表：

- `entries`
- `tags`
- `entry_tags`

## 常用命令

```bash
npm run lint
npm run typecheck
npm run build
npm run db:studio
```

## 数据和密钥

- SQLite 数据库：`data/ledger.db`
- 上传目录：`data/uploads/`
- 环境变量示例：`.env.example`

`data/` 和 `.env*` 默认不会提交到 Git。后续接入 AI 时，API Key 只应放在 `.env.local` 中，并且所有 AI 调用都应在服务端执行。

## 当前已实现范围

- 首页当天账目
- 手动新增、编辑、删除账目
- 日期、类型、分类、标签筛选
- 标签新增、编辑、删除
- 卡片/表格切换
- 统计页：分类占比、分类柱状图、每日趋势、分类明细

## 后续计划

1. 文本 AI 解析并回填账目表单
2. 浏览器录音 + STT + 文本解析
3. 图片上传 + 视觉模型识别
4. 更完善的错误处理和端到端测试
