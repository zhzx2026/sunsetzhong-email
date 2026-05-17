# S-MAIL — Sunsetzhong Email

自托管邮件系统：Cloudflare Worker 后端 + SPA 前端 + Android TWA 应用。

用户获得 `@sunsetzhong.indevs.in` 邮箱地址，通过 Resend API 发送邮件，Cloudflare Email Workers 接收邮件，支持 PWA 推送通知。

## 技术栈

- **后端**: Hono v4 + Cloudflare Workers + D1 (SQLite)
- **前端**: 单页应用 (SPA)，PWA，Service Worker 推送
- **移动端**: Android Trusted Web Activity (TWA)
- **邮件**: Resend API (发件) + Cloudflare Email Workers (收件)

## 命令

```bash
npm run dev          # 本地开发 (wrangler dev)
npm run deploy       # 升级版本号 + 同步 + 部署到 Cloudflare
```

## 项目结构

```
src/
  index.ts           # 主入口：邮件 Worker + API 路由
  dingtalk.ts        # 钉钉视频下载模块
  dingtalk-page.ts   # 钉钉下载前端页面
public/              # SPA 静态资源 (index.html, sw.js, manifest.json)
migrations/          # D1 数据库迁移文件
apk/EmailApp/        # Android TWA 应用
```

## 相关项目

- [DingTalkGoGoGo](https://github.com/zhzx2026/DingTalkGoGoGo) — 钉钉视频下载 Go Runner，通过 GitHub Actions 远程执行

## 环境变量 / Secrets

通过 `npx wrangler secret put` 设置：

| Secret | 说明 |
|--------|------|
| `RESEND_KEY` | Resend API 密钥（发件） |
| `AUTH_SALT` | 会话 / 设备 Token 哈希盐值 |
| `BOOTSTRAP_USERNAME` / `BOOTSTRAP_PASSWORD` | 首次部署自动创建的管理员账号 |
| `INTERNAL_API_TOKEN` | Runner 与 Worker 间的内部 API 认证 |
| `GITHUB_ACTIONS_TOKEN` | GitHub PAT（用于触发 Workflow 和下载 Artifacts） |

`wrangler.toml` 中的静态变量：
- `SENDER_DOMAIN` = `sunsetzhong.indevs.in`
- `GITHUB_REPOSITORY` = `zhzx2026/DingTalkGoGoGo`
