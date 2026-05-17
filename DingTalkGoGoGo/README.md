# DingTalkGoGoGo

基于 Go 的钉钉直播回放下载工具，附带 HTTP 服务、Cloudflare Worker 控制面、GitHub Actions 远程执行，以及一个用于打开控制台的 Android WebView 壳。

## 目录说明

| 路径 | 说明 |
| --- | --- |
| `main.go` `config.go` `server.go` `remote_runner.go` | Go 主程序，支持本地下载、登录、HTTP 服务、远程任务执行 |
| `M3u8Downloader/` | m3u8 下载与合并逻辑 |
| `worker/` | Cloudflare Worker 控制面，负责登录、任务、下载列表、管理页 |
| `android/` | Android WebView 壳，用来打开 Worker 控制台 |
| `scripts/s3_put.py` | GitHub Actions 远程任务上传结果到 R2 的辅助脚本 |
| `Dockerfile` `docker-compose.yml` | 自建 HTTP 服务的容器化部署文件 |
| `deploy/cloudflared/` | Cloudflare Tunnel 示例配置 |
| `upstream-sync.json` | 记录与上游下载器版本的同步信息 |

## 功能概览

- 本地模式：扫码登录后直接下载单条或批量直播回放。
- 服务模式：启动一个带 Bearer Token 的 HTTP API，接收下载任务并暴露文件下载地址。
- 远程任务模式：配合 Worker 和 GitHub Actions，在 Runner 上执行下载并把结果回传。
- Worker 控制面：提供登录、条款确认、任务面板、账号设置、管理员页面。
- Android 壳：把 Worker 控制台封装成简单移动端入口。

## 环境要求

- Go `1.25`
- `ffmpeg`
- Chrome 或 Chromium
- Node.js `20+`（用于 `worker/`）
- Cloudflare 账号（如果要部署 Worker、D1、R2）

## Go 程序使用

先编译：

```bash
go build -o GoDingtalk .
```

常见用法：

```bash
# 仅登录，刷新 cookies
./GoDingtalk -login

# 无头模式生成二维码，适合远程环境
./GoDingtalk -loginQR -loginQRFile login-qr.png

# 下载单条回放
./GoDingtalk -url "https://n.dingtalk.com/dingding/live-room/index.html?roomId=xxxx&liveUuid=xxxx"

# 批量下载
./GoDingtalk -urlFile ./urls.txt -videoList ./video-list.txt

# 启动 HTTP 服务
./GoDingtalk -serve -listen :8080 -saveDir ./video
```

程序会优先读取配置文件，再用环境变量和命令行参数覆盖。仓库提供了 [`config.example.json`](./config.example.json) 作为示例。

服务模式常用环境变量：

- `GODINGTALK_SERVER_LISTEN`
- `GODINGTALK_SERVER_AUTH_TOKEN`
- `GODINGTALK_PUBLIC_BASE_URL`
- `GODINGTALK_SERVER_MAX_CONCURRENT_JOBS`
- `GODINGTALK_CONTROL_URL`
- `GODINGTALK_INTERNAL_API_TOKEN`

## Worker 控制面

`worker/` 是一个 Cloudflare Worker 项目，依赖 D1 存储用户、会话、条款和任务状态，依赖 R2 存储下载结果。

初始化与部署：

```bash
cd worker
npm install
npx wrangler d1 migrations apply DB --remote
npm run typecheck
npx wrangler deploy
```

至少需要配置这些 Worker secret：

```bash
printf '%s' 'change-this-internal-token' | npx wrangler secret put INTERNAL_API_TOKEN
printf '%s' 'ghp_xxx' | npx wrangler secret put GITHUB_ACTIONS_TOKEN
printf '%s' 'change-this-auth-salt' | npx wrangler secret put AUTH_SALT
```

可选：

- `BOOTSTRAP_USERNAME`
- `BOOTSTRAP_PASSWORD`
- `ALLOW_PUBLIC_REGISTRATION`

## 远程执行链路

推荐链路如下：

```text
Browser
  -> Cloudflare Worker
  -> D1 / R2
  -> GitHub Actions workflow_dispatch
  -> GitHub Runner
  -> GoDingtalk
```

关键 workflow：

- `remote-runner.yml`：执行远程下载任务并上传结果到 R2
- `windows-login.yml`：在 Windows Runner 上发起二维码登录
- `deploy-worker.yml`：部署 Worker
- `release.yml`：构建桌面端和 Android 发布物

远程执行至少需要这些 GitHub Secrets：

- `GODINGTALK_CONTROL_URL`
- `GODINGTALK_INTERNAL_TOKEN`
- `GODINGTALK_R2_BUCKET`
- `GODINGTALK_R2_ACCESS_KEY_ID`
- `GODINGTALK_R2_SECRET_ACCESS_KEY`
- `CLOUDFLARE_ACCOUNT_ID`

## Docker 部署

如果只想运行 Go HTTP 服务，可以直接使用容器：

```bash
docker build -t godingtalk .
docker run --rm -p 8080:8080 \
  -e GODINGTALK_SERVER_AUTH_TOKEN=change-this-token \
  -e GODINGTALK_PUBLIC_BASE_URL=https://api.example.com \
  -v "$(pwd)/data:/data" \
  godingtalk
```

仓库里的 [`docker-compose.yml`](./docker-compose.yml) 额外提供了 `cloudflared` 服务，适合通过 Tunnel 暴露本地服务。示例配置位于 [`deploy/cloudflared/config.yml.example`](./deploy/cloudflared/config.yml.example)。

## Android 壳

`android/` 是一个非常轻量的 WebView 应用：

- 首次启动可输入 Worker 控制台地址
- 如果发布时已预置地址，可直接打开工作台
- 主要用于移动端访问控制面，不负责下载逻辑本身

## 开发与测试

Go：

```bash
go test ./...
```

Worker：

```bash
cd worker
npm install
npm run typecheck
```

## 说明

- 仓库当前核心是“下载器 + 控制面 + 远程执行”，README 以这三部分为准。
- `worker/src/ui.ts` 仍然承载主要前端页面渲染逻辑。
- `windows-login.yml` 和 `remote-runner.yml` 文件名不要随意修改，Worker 中有对应调度配置。
