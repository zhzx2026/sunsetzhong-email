export const DINGTALK_PAGE = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>钉钉视频下载 — S-MAIL</title>
<style>
:root{
  --bg:#f0f2f5;--panel:#fff;--text:#0f172a;--muted:#64748b;
  --blue:#2563eb;--blue-lt:#eff6ff;--green:#16a34a;--red:#dc2626;--amber:#ca8a04;
  --line:#e2e8f0;--hover:#f1f5f9;--tag:#f8fafc;
  --font:"Google Sans","PingFang SC",system-ui,sans-serif;
  --radius:14px;--radius-sm:10px;
  --shadow-sm:0 1px 2px rgba(0,0,0,.04);
  --shadow:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --shadow-md:0 4px 12px rgba(0,0,0,.08);
  --shadow-lg:0 12px 40px rgba(0,0,0,.12);
  color-scheme:light;
}
@media (prefers-color-scheme:dark){
  :root{
    --bg:#0f172a;--panel:#1e293b;--text:#e2e8f0;--muted:#94a3b8;
    --blue:#60a5fa;--blue-lt:rgba(96,165,250,.12);--green:#4ade80;--red:#f87171;--amber:#fbbf24;
    --line:#334155;--hover:rgba(255,255,255,.05);--tag:#1e293b;
    --shadow-sm:0 1px 2px rgba(0,0,0,.3);
    --shadow:0 1px 3px rgba(0,0,0,.4);
    --shadow-md:0 4px 12px rgba(0,0,0,.5);
    --shadow-lg:0 12px 40px rgba(0,0,0,.6);
    color-scheme:dark;
  }
  input,select,textarea{background:var(--panel)!important;color:var(--text)!important}
  .status-item,.job-events,.file-item,.legal-text,.admin-table th{background:var(--tag)!important}
  .metric .value{color:var(--text)}
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;min-height:100dvh;-webkit-font-smoothing:antialiased}
a{color:var(--blue);text-decoration:none}
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
@media (prefers-color-scheme:dark){::-webkit-scrollbar-thumb{background:#475569}}

/* main content — same on mobile & desktop */
#main{flex:1;padding:16px 16px 80px;max-width:720px;margin:0 auto;width:100%}
.guest-badge{display:inline-block;font-size:11px;background:var(--blue);color:#fff;padding:3px 10px;border-radius:10px;font-weight:500;letter-spacing:.2px;vertical-align:middle;margin-left:8px}

/* sidebar — desktop only */
#sidebar{display:none}
@media (min-width:768px){
  body{display:flex}
  #sidebar{display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;width:200px;background:var(--panel);border-right:1px solid var(--line);z-index:100;padding:0}
  .sidebar-brand{padding:18px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--line)}
  .sidebar-brand-icon{width:32px;height:32px;background:var(--blue);border-radius:9px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;flex-shrink:0}
  .sidebar-brand-text{font-size:14px;font-weight:600}
  .sidebar-nav{padding:8px;flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:2px}
  .sidebar-item{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:9px;cursor:pointer;font-size:13px;color:var(--muted);transition:all .12s ease;font-weight:450}
  .sidebar-item svg{width:18px;height:18px;opacity:.55;flex-shrink:0;transition:opacity .12s}
  .sidebar-item:hover{color:var(--text);background:var(--hover)}
  .sidebar-item.active{color:var(--blue);background:var(--blue-lt);font-weight:550}
  .sidebar-item.active svg{opacity:1}
  .sidebar-footer{padding:12px 16px;border-top:1px solid var(--line)}
  .sidebar-footer a{font-size:12px;color:var(--muted);display:flex;align-items:center;gap:6px;transition:color .12s;text-decoration:none}
  .sidebar-footer a:hover{color:var(--text)}
  #main{margin-left:200px;padding:32px 36px 40px;max-width:calc(720px + 200px)}
  #bottom-nav{display:none}
  .metrics{grid-template-columns:repeat(4,1fr)}
  .status-grid{grid-template-columns:repeat(3,1fr)}
}
.tab{display:none;animation:fadeIn .25s ease}
.tab.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

h2{font-size:16px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px}

/* cards */
.card{background:var(--panel);border-radius:var(--radius);border:1px solid var(--line);padding:18px;margin-bottom:12px;box-shadow:var(--shadow);transition:box-shadow .2s}
.card h3{font-size:13px;font-weight:600;margin-bottom:10px;color:var(--text)}

/* metric cards */
.metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px}
.metric{background:var(--panel);border-radius:var(--radius);border:1px solid var(--line);padding:14px 16px;box-shadow:var(--shadow);position:relative;overflow:hidden;transition:transform .15s,box-shadow .15s}
.metric::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;opacity:0;transition:opacity .2s}
.metric:hover{transform:translateY(-1px);box-shadow:var(--shadow-md)}
.metric:nth-child(1)::before{background:var(--blue);opacity:1}
.metric:nth-child(2)::before{background:var(--amber);opacity:1}
.metric:nth-child(3)::before{background:var(--green);opacity:1}
.metric:nth-child(4)::before{background:var(--red);opacity:1}
.metric .label{font-size:10px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px;font-weight:600}
.metric .value{font-size:28px;font-weight:700;color:var(--text);line-height:1}
.metric .value.ok{color:var(--green)}
.metric .value.warn{color:var(--amber)}
.metric .value.err{color:var(--red)}
.metric .value.info{color:var(--blue)}

/* status grid */
.status-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.status-item{background:var(--tag);border-radius:10px;padding:10px 12px;text-align:center;transition:background .15s}
.status-item .s-label{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;font-weight:600}
.status-item .s-val{font-size:13px;font-weight:500}

/* form */
input[type="text"],input[type="password"],input[type="number"],select,textarea{
width:100%;border:1px solid var(--line);border-radius:10px;padding:10px 12px;font:inherit;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;background:var(--panel);color:var(--text)
}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.12)}
button{background:var(--blue);color:#fff;border:none;border-radius:10px;padding:10px 20px;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s ease;display:inline-flex;align-items:center;justify-content:center;gap:6px;user-select:none;-webkit-tap-highlight-color:transparent}
button:active{transform:scale(.97)}
button:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--line)}
.btn-ghost:hover{background:var(--hover);color:var(--text)}
.btn-danger{background:var(--red)}
.btn-danger:hover{opacity:.9}
.btn-danger:active{opacity:.8;transform:scale(.97)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:8px}
.btn-block{width:100%}

/* bottom nav — mobile only */
#bottom-nav{position:fixed;bottom:0;left:0;right:0;z-index:100;background:var(--panel);border-top:1px solid var(--line);display:flex;padding:4px 0 env(safe-area-inset-bottom,4px) 0;box-shadow:0 -1px 8px rgba(0,0,0,.06)}
@media (min-width:768px){#bottom-nav{display:none}}
.nav-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 0 4px;cursor:pointer;border:none;background:none;color:var(--muted);font-size:10px;font-weight:500;transition:color .15s;-webkit-tap-highlight-color:transparent;position:relative}
.nav-tab::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:0;height:2px;background:var(--blue);border-radius:0 0 2px 2px;transition:width .2s}
.nav-tab.active{color:var(--blue)}
.nav-tab.active::before{width:24px}
.nav-tab svg{width:22px;height:22px;flex-shrink:0}

/* status badges */
.status-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.badge-ok{background:rgba(22,163,74,.1);color:var(--green)}
.badge-no{background:rgba(220,38,38,.1);color:var(--red)}
.badge-warn{background:rgba(202,138,4,.1);color:var(--amber)}
.badge-info{background:rgba(37,99,235,.1);color:var(--blue)}

/* job items */
.job-item{border:1px solid var(--line);border-radius:12px;padding:14px;margin-bottom:8px;cursor:pointer;transition:all .15s ease;background:var(--panel)}
.job-item:hover{border-color:var(--muted)}
.job-item:active{transform:scale(.995)}
.job-item.expanded{border-color:var(--blue);box-shadow:var(--shadow-md)}
.job-header{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
.job-id{font-size:10px;color:var(--muted);font-family:"SF Mono","JetBrains Mono",monospace;background:var(--tag);padding:2px 8px;border-radius:4px;letter-spacing:.3px}
.job-title{font-size:13px;font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.job-status{padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;flex-shrink:0}
.job-meta{display:flex;gap:14px;font-size:11px;color:var(--muted);flex-wrap:wrap}
.job-detail{display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--line);animation:fadeIn .2s ease}
.job-item.expanded .job-detail{display:block}
.job-progress-bar{height:5px;background:var(--line);border-radius:3px;margin:8px 0;overflow:hidden}
.job-progress-fill{height:100%;background:var(--blue);border-radius:3px;transition:width .6s ease}
.job-progress-fill.progress-queued{background:var(--amber);animation:pulse 2s ease-in-out infinite}
.job-progress-fill.progress-done{background:var(--green)}
@keyframes pulse{0%,100%{opacity:.6}50%{opacity:1}}
.job-events{margin-top:8px;max-height:200px;overflow-y:auto;font-size:11px;background:var(--tag);border-radius:8px;padding:10px}
.job-event{display:flex;align-items:center;gap:6px;padding:3px 0;color:var(--muted)}
.job-event.error{color:var(--red)}
.job-event.success{color:var(--green)}
.files-list{margin-top:8px}
.file-item{display:flex;align-items:center;gap:8px;padding:6px 10px;font-size:12px;background:var(--tag);border-radius:8px;margin-bottom:4px;justify-content:space-between}
.retention-hint{font-size:10px;color:var(--muted);margin-top:6px}
.dl-btn{display:inline-flex;align-items:center;gap:4px;background:var(--blue);color:#fff;padding:6px 14px;border-radius:8px;font-size:11px;font-weight:500;text-decoration:none;transition:all .15s}
.dl-btn:hover{opacity:.9;transform:translateY(-1px)}
.dl-btn:active{transform:scale(.97)}

/* pagination */
.pagination{display:flex;align-items:center;gap:8px;margin-top:14px;justify-content:center}
.pagination button{padding:6px 16px;font-size:12px}
.page-info{font-size:12px;color:var(--muted);min-width:60px;text-align:center}

/* settings */
.legal-text{background:var(--tag);border-radius:10px;padding:14px;font-size:12px;line-height:1.8;max-height:280px;overflow-y:auto;margin-bottom:14px;border:1px solid var(--line)}
.checkbox-row{display:flex;align-items:center;gap:8px;margin-bottom:12px;font-size:13px;cursor:pointer}
.checkbox-row input[type="checkbox"]{width:16px;height:16px;accent-color:var(--blue);cursor:pointer}

/* qr */
.qr-box{display:flex;flex-direction:column;align-items:center;gap:14px;padding:20px}
.qr-image{width:200px;height:200px;border:2px dashed var(--line);border-radius:16px;background:var(--tag);display:flex;align-items:center;justify-content:center;overflow:hidden;transition:all .3s ease}
.qr-image.has-code{border-style:solid;border-color:var(--blue)}
.qr-image img{width:100%;height:100%;object-fit:contain;display:block;padding:8px}
.qr-spinner{width:32px;height:32px;border:3px solid var(--line);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite}
.info-spinner{display:inline-block;width:12px;height:12px;border:2px solid var(--green);border-top-color:transparent;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:4px}
@keyframes spin{to{transform:rotate(360deg)}}
.qr-status{font-size:12px;color:var(--muted);text-align:center;min-height:18px}

/* gate */
#gate{display:none;position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:200;align-items:flex-end;justify-content:center;-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
#gate.show{display:flex}
.gate-card{background:var(--panel);border-radius:18px 18px 0 0;padding:24px 20px 32px;width:100%;max-width:640px;max-height:85vh;overflow-y:auto;box-shadow:var(--shadow-lg)}
.gate-card h2{font-size:16px;margin-bottom:4px}
.gate-card p{font-size:12px;color:var(--muted);margin-bottom:16px;line-height:1.6}
.gate-progress{display:flex;gap:4px;margin-bottom:20px}
.gate-step-bar{flex:1;height:3px;background:var(--line);border-radius:2px;transition:background .3s}
.gate-step-bar.done{background:var(--green)}
.gate-step-bar.current{background:var(--blue)}

/* toast */
#toast-container{position:fixed;top:16px;right:12px;left:12px;z-index:300;display:flex;flex-direction:column;gap:8px;max-width:640px;margin:0 auto;pointer-events:none}
.toast{padding:12px 16px;border-radius:12px;font-size:13px;font-weight:500;box-shadow:var(--shadow-lg);animation:slideIn .3s cubic-bezier(.34,1.56,.64,1);display:flex;align-items:center;gap:8px;pointer-events:auto}
.toast.ok{background:#059669;color:#fff}
.toast.err{background:#dc2626;color:#fff}
.toast.info{background:var(--blue);color:#fff}
@media (prefers-color-scheme:dark){.toast.ok{background:#059669}.toast.err{background:#b91c1c}.toast.info{background:#2563eb}}
@keyframes slideIn{from{opacity:0;transform:translateY(-12px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}

/* admin */
.admin-section{margin-bottom:28px}
.admin-section h3{font-size:14px;font-weight:600;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.admin-table{width:100%;border-collapse:collapse;font-size:11px}
.admin-table th{text-align:left;padding:7px 8px;background:var(--tag);color:var(--muted);font-weight:600;border-bottom:1px solid var(--line);font-size:10px;text-transform:uppercase;letter-spacing:.3px}
.admin-table td{padding:9px 8px;border-bottom:1px solid var(--line);font-size:11px}
.admin-table tr:hover td{background:var(--hover)}
.admin-table tr:active td{background:var(--hover)}
.admin-textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:13px;min-height:180px;resize:vertical;margin-top:6px;background:var(--panel);color:var(--text)}

/* utility */
.error-msg{color:var(--red);font-size:12px;padding:8px 12px;background:rgba(220,38,38,.08);border-radius:8px;margin-bottom:10px}
.info-msg{color:var(--green);font-size:12px;padding:8px 12px;background:rgba(22,163,74,.08);border-radius:8px;margin-bottom:10px}
.empty-state{text-align:center;padding:40px 16px;color:var(--muted);font-size:13px}
.empty-icon{font-size:40px;margin-bottom:10px;opacity:.4}
.pw-form{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.pw-form input{flex:1;min-width:120px}
.pw-hint{font-size:11px;color:var(--muted);margin-top:8px}

</style>
</head>
<body>

<!-- desktop sidebar -->
<div id="sidebar">
  <div class="sidebar-brand">
    <div class="sidebar-brand-icon">S</div>
    <div class="sidebar-brand-text">视频下载</div>
  </div>
  <div class="sidebar-nav">
    <div class="sidebar-item active" data-page="dashboard" onclick="switchTab('dashboard')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> 仪表盘</div>
    <div class="sidebar-item" data-page="jobs" onclick="switchTab('jobs')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg> 任务列表</div>
    <div class="sidebar-item" data-page="settings" id="sidebar-settings" onclick="switchTab('settings')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> 设置</div>
    <div class="sidebar-item admin-only" data-page="admin" onclick="switchTab('admin')" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z"/></svg> 管理页</div>
  </div>
  <div class="sidebar-footer"><a href="/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="width:14px;height:14px"><path d="M19 12H5M12 19l-7-7 7-7"/></svg> 返回邮箱</a></div>
</div>

<!-- main content -->
<div id="main">

  <!-- Tab: Dashboard -->
  <div id="tab-dashboard" class="tab active">
    <h2>钉钉视频下载 <span class="guest-badge" id="guest-badge" style="display:none">免登录</span></h2>
    <div class="metrics" id="metrics"></div>

    <div class="card">
      <h3>状态概览</h3>
      <div class="status-grid" id="status-grid"></div>
    </div>

    <div class="card">
      <h3>提交下载任务</h3>
      <textarea id="url-input" placeholder="输入视频页面 URL，每行一个，支持批量" rows="3" style="margin-bottom:8px;resize:vertical;min-height:60px"></textarea>
      <div id="url-count" style="font-size:11px;color:var(--muted);margin-bottom:6px;display:none"></div>
      <input type="number" id="thread-input" placeholder="线程数（默认100）" />
      <button onclick="submitJob()" class="btn-block" style="margin-top:8px">提交任务</button>
      <div id="submit-error" class="error-msg" style="display:none;margin-top:8px"></div>
      <div id="submit-info" class="info-msg" style="display:none;margin-top:8px"></div>
    </div>

    <div class="card">
      <h3>最近任务</h3>
      <div id="recent-jobs"></div>
      <div style="margin-top:10px"><button class="btn-ghost btn-sm" onclick="switchTab('jobs')">查看全部 →</button></div>
    </div>
  </div>

  <!-- Tab: Jobs -->
  <div id="tab-jobs" class="tab">
    <div class="card">
      <h3>任务列表</h3>
      <div id="jobs-list"></div>
      <div class="pagination" id="jobs-pagination"></div>
    </div>
  </div>

  <!-- Tab: Settings -->
  <div id="tab-settings" class="tab">
    <div class="card">
      <h3>条款确认</h3>
      <div id="legal-content"></div>
    </div>

    <div class="card">
      <h3>钉钉验证</h3>
      <div id="qr-login-box" class="qr-box">
        <div class="qr-image" id="qr-image"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;opacity:.3;margin-bottom:8px"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg><div style="font-size:11px">点击下方按钮获取二维码</div></div></div>
        <div class="qr-status" id="qr-status"></div>
        <div style="display:flex;gap:8px" id="qr-buttons">
          <button id="btn-start-qr" onclick="startQRLogin()">获取二维码</button>
        </div>
        <div style="font-size:10px;color:var(--muted);text-align:center">有效期5分钟，请用钉钉 App 扫码</div>
      </div>
      <div id="qr-error" class="error-msg" style="display:none"></div>
    </div>

    <div class="card">
      <h3>下载密码</h3>
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">下载的视频将打包为加密 zip，此密码为解压密码。设置后不可查看。</p>
      <div class="pw-form">
        <input type="password" id="pw-input" placeholder="输入密码（至少4位）" />
        <input type="password" id="pw-confirm" placeholder="确认密码" />
        <button onclick="savePassword()">保存</button>
      </div>
      <div id="pw-msg" style="margin-top:8px;font-size:12px"></div>
      <div style="margin-top:8px;font-size:12px;color:var(--muted)">密码状态: <span id="pw-state">—</span></div>
    </div>
    <div style="text-align:center;margin-top:16px"><a href="/" style="font-size:13px;color:var(--muted)">← 返回邮箱</a></div>
  </div>

  <!-- Tab: Admin -->
  <div id="tab-admin" class="tab">
    <h2>管理页</h2>
    <div id="admin-content"></div>
  </div>

</div>

<!-- bottom nav -->
<nav id="bottom-nav">
  <button class="nav-tab active" data-tab="dashboard" onclick="switchTab('dashboard')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    仪表盘
  </button>
  <button class="nav-tab" data-tab="jobs" onclick="switchTab('jobs')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
    任务
  </button>
  <button class="nav-tab" data-tab="settings" id="nav-settings" onclick="switchTab('settings')">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    设置
  </button>
</nav>

<!-- toast container -->
<div id="toast-container"></div>

<!-- gate overlay -->
<div id="gate">
  <div class="gate-card">
    <div class="gate-progress" id="gate-progress">
      <div class="gate-step-bar current"></div>
      <div class="gate-step-bar"></div>
      <div class="gate-step-bar"></div>
    </div>
    <h2 id="gate-title"></h2>
    <p id="gate-desc"></p>
    <div id="gate-body"></div>
    <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px">
      <button class="btn-ghost" id="gate-skip" style="display:none" onclick="closeGate()">跳过</button>
      <button id="gate-btn" style="display:none"></button>
    </div>
  </div>
</div>

<script>
let state = { user: null, status: null, legalState: null, legalText: '', currentPage: 1, totalPages: 1, jobs: [], loginSession: null, currentTab: 'dashboard' };
let pollTimer = null;
const DT_TOKEN = window.__DT_TOKEN || '';
const isGuest = !!DT_TOKEN;

if (isGuest) {
  document.getElementById('guest-badge').style.display = 'inline-block';
}

async function api(path, opts) {
  opts = opts || {};
  if (DT_TOKEN) {
    var h = opts.headers || {};
    h['x-dt-token'] = DT_TOKEN;
    opts.headers = h;
  }
  try {
    var r = await fetch('/api' + path, { credentials: 'include', ...opts });
    var d = await r.json();
    if (!r.ok && r.status === 401) { if (!DT_TOKEN) location.href = '/login'; return null; }
    return d;
  } catch(e) { return null; }
}

async function checkAuth() {
  if (isGuest) { init(); return; }
  var d = await api('/auth/me');
  if (!d || !d.ok || !d.user) {
    if (navigator.onLine) { location.href = '/login'; return; }
    document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:var(--font);text-align:center;padding:20px"><div><div style="font-size:48px;margin-bottom:16px">📡</div><p style="font-size:16px;color:var(--text);margin-bottom:8px">无网络连接</p><p style="font-size:13px;color:var(--muted);margin-bottom:24px">检查网络连接后重试</p><button onclick="location.reload()" style="padding:10px 24px;background:var(--blue);color:#fff;border:none;border-radius:10px;font-size:14px;cursor:pointer">刷新</button></div></div>';
    return;
  }
  state.user = d.user;
  init();
}

async function init() {
  if (state.user && state.user.isSudo) {
    var ns = document.getElementById('nav-settings');
    if (ns) ns.insertAdjacentHTML('afterend', '<button class="nav-tab" data-tab="admin" onclick="switchTab(\\'admin\\')"><svg viewBox=\\"0 0 24 24\\" fill=\\"none\\" stroke=\\"currentColor\\" stroke-width=\\"1.8\\"><path d=\\"M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z\\"/></svg>管理</button>');
    var sa = document.querySelector('.sidebar-item.admin-only');
    if (sa) sa.style.display = 'flex';
  }
  await Promise.all([loadStatus(), loadLegal()]);
  checkGates();
}

async function loadStatus() {
  var d = await api('/dingtalk/status' + (DT_TOKEN ? '?dt_token=' + DT_TOKEN : ''));
  if (d && d.ok) state.status = d;
}

async function loadLegal() {
  var d = await api('/dingtalk/legal');
  if (d) { state.legalState = { version: d.version, accepted: d.accepted }; state.legalText = d.text || ''; }
}

function checkGates() {
  var s = state.status;
  if (!s) return;
  console.log('[Gate] checkGates legal:', s.legal_accepted, 'cookies:', s.cookies_ready, 'password:', s.has_zip_password);
  if (!s.legal_accepted) { showGate('legal'); return; }
  if (!s.cookies_ready) { showGate('qr'); return; }
  if (!s.has_zip_password) { showGate('password'); return; }
  startPolling();
}

function showGate(type) {
  var g = document.getElementById('gate');
  var title = document.getElementById('gate-title');
  var desc = document.getElementById('gate-desc');
  var body = document.getElementById('gate-body');
  var btn = document.getElementById('gate-btn');
  var skip = document.getElementById('gate-skip');
  var progress = document.getElementById('gate-progress');
  g.classList.add('show');
  btn.style.display = 'none';
  skip.style.display = 'none';

  var steps = { legal: 0, qr: 1, password: 2 };
  var stepIdx = steps[type] || 0;
  progress.innerHTML = [0,1,2].map(function(i) {
    return '<div class="gate-step-bar' + (i < stepIdx ? ' done' : i === stepIdx ? ' current' : '') + '"></div>';
  }).join('');

  if (type === 'legal') {
    title.textContent = '请先阅读并接受条款';
    desc.textContent = '继续使用前需接受免责声明';
    body.innerHTML = '<div class="legal-text" style="max-height:200px;font-size:11px">' + renderMarkdown(state.legalText) + '</div><div class="checkbox-row"><input type="checkbox" id="gate-check"><label for="gate-check">我已阅读并接受上述所有条款</label></div>';
    btn.style.display = 'inline-flex';
    btn.textContent = '接受条款';
    btn.onclick = acceptLegal;
  } else if (type === 'qr') {
    title.textContent = '请完成钉钉验证';
    desc.textContent = '扫码登录钉钉后自动保存 Cookies';
    body.innerHTML = '<div style="text-align:center;padding:20px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" style="width:48px;height:48px;opacity:.4;margin-bottom:12px"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg><div style="font-size:14px;margin-bottom:16px">需要钉钉扫码获取有效 Cookies 才能下载视频</div></div>';
    btn.style.display = 'inline-flex';
    btn.textContent = '前往设置';
    btn.onclick = function() { closeGate(); switchTab('settings'); };
  } else if (type === 'password') {
    title.textContent = '请设置下载密码';
    desc.textContent = '下载的视频将打包为加密 zip';
    body.innerHTML = '<div style="padding:8px 0"><input type="password" id="gate-pw" placeholder="输入密码（至少4位）" style="margin-bottom:8px" /><input type="password" id="gate-pw2" placeholder="确认密码" style="margin-bottom:8px" /><div id="gate-pw-err" style="color:#dc2626;font-size:12px;margin-bottom:4px"></div></div>';
    btn.style.display = 'inline-flex';
    btn.textContent = '保存密码';
    btn.onclick = gateSavePw;
  }
}

async function gateSavePw() {
  var pw = document.getElementById('gate-pw').value;
  var pw2 = document.getElementById('gate-pw2').value;
  var err = document.getElementById('gate-pw-err');
  if (pw.length < 4) { err.textContent = '密码至少4位'; return; }
  if (pw !== pw2) { err.textContent = '两次输入不一致'; return; }
  var d = await api('/dingtalk/zip-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
  if (d && d.ok) { state.status.has_zip_password = true; closeGate(); startPolling(); }
  else { err.textContent = (d && d.error) || '保存失败'; }
}

async function acceptLegal() {
  if (!document.getElementById('gate-check').checked) { alert('请先勾选接受条款'); return; }
  var d = await api('/dingtalk/legal', { method: 'POST' });
  if (d && d.ok) { state.legalState.accepted = true; closeGate(); checkGates(); }
}

function closeGate() { document.getElementById('gate').classList.remove('show'); }

function switchTab(tab) {
  if (state.currentTab === tab) return;
  state.currentTab = tab;
  document.querySelectorAll('.tab').forEach(function(el) { el.classList.remove('active'); });
  var tabEl = document.getElementById('tab-' + tab);
  if (tabEl) tabEl.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach(function(el) { el.classList.toggle('active', el.getAttribute('data-tab') === tab); });
  document.querySelectorAll('.sidebar-item').forEach(function(el) { el.classList.toggle('active', el.getAttribute('data-page') === tab); });
  if (tab === 'dashboard') showOverview();
  else if (tab === 'jobs') loadJobs(1);
  else if (tab === 'settings') renderSettings();
  else if (tab === 'admin') loadAdmin();
}

function showOverview() {
  renderMetrics();
  renderStatus();
  loadRecentJobs();
}

function renderMetrics() {
  var s = state.status || {};
  document.getElementById('metrics').innerHTML = [
    { label: '总任务', value: s.total_jobs || 0, cls: '' },
    { label: '排队中', value: s.queued_jobs || 0, cls: 'warn' },
    { label: '已完成', value: s.succeeded_jobs || 0, cls: 'ok' },
    { label: '已失败', value: s.failed_jobs || 0, cls: 'err' },
  ].map(function(m) {
    return '<div class="metric"><div class="label">' + m.label + '</div><div class="value' + (m.cls ? ' ' + m.cls : '') + '">' + m.value + '</div></div>';
  }).join('');
}

function renderStatus() {
  var s = state.status || {};
  var leg = state.legalState || {};
  var items = [
    ['Cookie', s.cookies_ready ? '已就绪' : '未就绪', s.cookies_ready ? 'ok' : 'no'],
    ['条款', leg.accepted ? '已接受' : '未接受', leg.accepted ? 'ok' : 'no'],
    ['密码', s.has_zip_password ? '已设置' : '未设置', s.has_zip_password ? 'ok' : 'no'],
    ['保留期', s.artifact_retention_days ? s.artifact_retention_days + '天' : '-', ''],
    ['线程', s.default_thread || '-', ''],
  ];
  document.getElementById('status-grid').innerHTML = items.map(function(i) {
    var badge = i[2] ? '<span class="status-badge badge-' + (i[2] === 'ok' ? 'ok' : 'no') + '" style="font-size:10px">' + i[1] + '</span>' : '<span style="font-weight:500">' + i[1] + '</span>';
    return '<div class="status-item"><div class="s-label">' + i[0] + '</div><div class="s-val">' + badge + '</div></div>';
  }).join('');
}

async function loadRecentJobs() {
  var d = await api('/dingtalk/jobs?page_size=5' + (DT_TOKEN ? '&dt_token=' + DT_TOKEN : ''));
  if (!d) return;
  var jobs = d.jobs || [];
  state.recentJobs = jobs;
  document.getElementById('recent-jobs').innerHTML = jobs.length
    ? jobs.map(function(j) { return jobRowHTML(j, false); }).join('')
    : '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;opacity:.3;margin-bottom:8px"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><div>暂无任务记录</div></div>';
}

function stageLabel(stage) {
  var map = {
    waiting_runner: '等待下载器启动',
    preparing: '正在准备',
    downloading: '正在下载视频',
    merging: '正在合并视频',
    encrypting: '正在加密打包',
    uploading: '正在上传结果',
    completed: '已完成',
    failed: '已失败',
    cancelled: '已取消',
  };
  return map[stage] || (stage || '等待中');
}

function elapsedTime(createdAt, finishedAt) {
  var start = new Date(createdAt).getTime();
  var end = finishedAt ? new Date(finishedAt).getTime() : Date.now();
  var sec = Math.floor((end - start) / 1000);
  if (sec < 60) return sec + '秒';
  if (sec < 3600) return Math.floor(sec / 60) + '分' + (sec % 60) + '秒';
  return Math.floor(sec / 3600) + '时' + Math.floor((sec % 3600) / 60) + '分';
}

function jobRowHTML(job, expanded) {
  var statusMap = { queued: ['badge-warn','排队中'], running: ['badge-info','执行中'], succeeded: ['badge-ok','已完成'], failed: ['badge-no','失败'] };
  var st = statusMap[job.status] || ['badge-warn','未知'];
  var pct = job.progress_percent || 0;
  var errors = (job.errors || []).slice(0, 3);
  var files = (job.files || []).slice(0, 5);
  var dt = new Date(job.created_at).toLocaleString('zh-CN');
  var retention = (state.status && state.status.artifact_retention_days) || 90;
  var isActive = job.status === 'running' || job.status === 'queued';

  var eventsHtml = '';
  if (expanded && job._events) {
    eventsHtml = '<div class="job-events">' + job._events.map(function(e) {
      var icon = e.level === 'error' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>'
        : e.level === 'success' ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;flex-shrink:0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;flex-shrink:0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>';
      return '<div class="job-event ' + (e.level === 'error' ? 'error' : e.level === 'success' ? 'success' : '') + '">' + icon + '<span>' + escHtml(e.message) + '</span><span style="font-size:10px;color:var(--muted);flex-shrink:0">' + (e.created_at||'').slice(11,19) + '</span></div>';
    }).join('') + '</div>';
  }

  // Show latest event as status line for active jobs
  var latestEvent = '';
  if (isActive && job._events && job._events.length) {
    var latest = job._events[job._events.length - 1];
    latestEvent = '<div style="font-size:11px;color:var(--muted);margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + escHtml(latest.message) + '</div>';
  }

  var filesHtml = '';
  if (expanded && files.length) {
    filesHtml = '<div class="files-list">' + files.map(function(f) {
      var dl = f.download_url ? '<a class="dl-btn" href="' + escHtml(f.download_url) + '" download="' + escHtml(f.name || f.relative_path || 'download.zip') + '">下载</a>' : '';
      return '<div class="file-item"><span>' + escHtml(f.name || f.relative_path) + '</span>' + dl + '</div>';
    }).join('') + '</div><div class="retention-hint">加密 zip，密码为设置的下载密码。' + retention + '天后过期。</div>';
  }

  var downloadBtn = '';
  if (job.status === 'succeeded' && pct >= 100 && files.length && files[0].download_url) {
    downloadBtn = '<a class="dl-btn" href="' + escHtml(files[0].download_url) + '" download="' + escHtml(files[0].name || 'download.zip') + '" style="margin-top:6px">下载加密包</a>';
  }

  var cancelBtn = '';
  if (isActive) {
    cancelBtn = '<button class="btn-ghost btn-sm" style="color:var(--red);border-color:var(--red);margin-top:6px" onclick="event.stopPropagation();cancelJob(\\'' + job.id + '\\')">取消</button>';
  }

  var deleteBtn = '<button class="btn-ghost btn-sm" style="margin-top:6px;margin-left:4px" onclick="event.stopPropagation();deleteJob(\\'' + job.id + '\\')">删除</button>';

  var progressBar = '';
  if (isActive) {
    var barPct = Math.max(pct, 2);
    var barCls = job.status === 'queued' ? 'progress-queued' : '';
    progressBar = '<div class="job-progress-bar"><div class="job-progress-fill ' + barCls + '" style="width:' + barPct + '%"></div></div>' +
      '<div style="font-size:10px;color:var(--muted);margin-top:2px;display:flex;justify-content:space-between">' +
        '<span>' + stageLabel(job.stage) + (job.current_title ? ' — ' + escHtml(job.current_title) : '') + '</span>' +
        '<span>' + elapsedTime(job.created_at) + ' / ' + (pct || 0) + '%</span>' +
      '</div>';
  } else if (job.status === 'succeeded') {
    progressBar = '<div class="job-progress-bar"><div class="job-progress-fill progress-done" style="width:100%"></div></div>' +
      '<div style="font-size:10px;color:var(--muted);margin-top:2px;display:flex;justify-content:space-between"><span>耗时 ' + elapsedTime(job.created_at, job.finished_at) + '</span><span>100%</span></div>';
  }

  return '<div class="job-item' + (expanded ? ' expanded' : '') + '" data-job-id="' + job.id + '" onclick="toggleJob(this,\\'' + job.id + '\\')">' +
    '<div class="job-header">' +
      '<span class="job-id">' + job.id.slice(0,12) + '</span>' +
      '<span class="job-title">' + escHtml(job.current_title || (job.urls && job.urls[0]) || '-') + '</span>' +
      '<span class="job-status ' + st[0] + '">' + st[1] + '</span>' +
    '</div>' +
    '<div class="job-meta"><span>' + dt + '</span><span>' + (isActive ? stageLabel(job.stage) : (job.status === 'succeeded' ? '耗时 ' + elapsedTime(job.created_at, job.finished_at) : '')) + '</span></div>' +
    progressBar +
    downloadBtn + cancelBtn + deleteBtn +
    latestEvent +
    (errors.length ? '<div style="font-size:11px;color:#dc2626;margin-top:4px">' + errors.join('; ') + '</div>' : '') +
    '<div class="job-detail">' + filesHtml + eventsHtml + '</div>' +
  '</div>';
}

async function toggleJob(el, jobId) {
  if (el.classList.contains('expanded')) { el.classList.remove('expanded'); return; }
  document.querySelectorAll('.job-item').forEach(function(j) { j.classList.remove('expanded'); });
  el.classList.add('expanded');
  var d = await api('/dingtalk/jobs/' + jobId + '?include=events' + (DT_TOKEN ? '&dt_token=' + DT_TOKEN : ''));
  if (!d || !d.job) return;
  d.job._events = d.events || [];
  var jobs = state.recentJobs || [];
  var idx = jobs.findIndex(function(j) { return j.id === jobId; });
  if (idx >= 0) jobs[idx] = d.job;
  var newEl = document.createElement('div');
  newEl.outerHTML = jobRowHTML(d.job, true);
  el.outerHTML = newEl.outerHTML;
}

async function loadJobs(page) {
  state.currentPage = page;
  var d = await api('/dingtalk/jobs?page=' + page + '&page_size=10' + (DT_TOKEN ? '&dt_token=' + DT_TOKEN : ''));
  if (!d) return;
  state.jobs = d.jobs || [];
  state.totalPages = d.total_pages || 1;
  document.getElementById('jobs-list').innerHTML = state.jobs.length
    ? state.jobs.map(function(j) { return jobRowHTML(j, false); }).join('')
    : '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;opacity:.3;margin-bottom:8px"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg><div>暂无任务记录</div></div>';
  renderPagination(d.page, d.total_pages);
}

function renderPagination(page, total) {
  var p = document.getElementById('jobs-pagination');
  if (total <= 1) { p.innerHTML = ''; return; }
  p.innerHTML =
    '<button class="btn-ghost btn-sm" onclick="loadJobs(' + (page - 1) + ')" ' + (page <= 1 ? 'disabled' : '') + '>上一页</button>' +
    '<span class="page-info">' + page + ' / ' + total + '</span>' +
    '<button class="btn-ghost btn-sm" onclick="loadJobs(' + (page + 1) + ')" ' + (page >= total ? 'disabled' : '') + '>下一页</button>';
}

async function submitJob() {
  var urlInput = document.getElementById('url-input');
  var threadInput = document.getElementById('thread-input');
  var errEl = document.getElementById('submit-error');
  var infoEl = document.getElementById('submit-info');
  var btn = document.querySelector('#tab-dashboard button.btn-block');
  errEl.style.display = 'none';
  infoEl.style.display = 'none';

  var lines = urlInput.value.trim().split(/[\\n\\r]+/).map(function(l) { return l.trim(); }).filter(Boolean);
  if (lines.length === 0) { errEl.textContent = '请输入至少一个视频页面 URL'; errEl.style.display = 'block'; return; }

  var thread = parseInt(threadInput.value) || (state.status && state.status.default_thread) || 100;

  btn.disabled = true;
  btn.textContent = '提交中...';
  var plural = lines.length > 1 ? '（' + lines.length + ' 个）' : '';
  infoEl.innerHTML = '<span class="info-spinner"></span> 正在提交' + plural + '...';
  infoEl.style.display = 'block';

  var body = lines.length === 1 ? { url: lines[0], thread: thread, create_video_list: true }
    : { urls: lines, thread: thread, create_video_list: true };
  var d = await api('/dingtalk/jobs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  btn.disabled = false;
  btn.textContent = '提交任务';

  if (!d) {
    errEl.textContent = '网络错误，请重试';
    errEl.style.display = 'block';
    infoEl.style.display = 'none';
    return;
  }
  if (d.error) {
    errEl.textContent = d.error;
    errEl.style.display = 'block';
    infoEl.style.display = 'none';
  } else {
    infoEl.textContent = '任务 ' + (d.job ? d.job.id.slice(0,12) : '') + ' 已提交，' + lines.length + ' 个 URL 等待下载器启动...';
    urlInput.value = '';
    document.getElementById('url-count').style.display = 'none';
    threadInput.value = '';
    loadStatus();
    showOverview();
    setTimeout(function() { infoEl.style.display = 'none'; }, 5000);
  }
}

// Show URL count on input
(function() {
  var urlInput = document.getElementById('url-input');
  if (urlInput) {
    urlInput.addEventListener('input', function() {
      var count = this.value.trim().split(/[\\n\\r]+/).filter(function(l) { return l.trim(); }).length;
      var el = document.getElementById('url-count');
      if (count > 1) { el.textContent = '已输入 ' + count + ' 个 URL'; el.style.display = 'block'; }
      else { el.style.display = 'none'; }
    });
  }
})();

async function cancelJob(jobId) {
  if (!confirm('确定要取消此任务吗？')) return;
  var d = await api('/dingtalk/jobs/' + jobId + '/cancel', { method: 'POST' });
  if (d && d.ok) { toast('任务已取消', 'info'); loadStatus(); showOverview(); }
  else { toast((d && d.error) || '取消失败', 'err'); }
}

async function deleteJob(jobId) {
  if (!confirm('确定要删除此任务记录吗？')) return;
  var d = await api('/dingtalk/jobs/' + jobId, { method: 'DELETE' });
  if (d && d.ok) { toast('已删除', 'info'); loadStatus(); showOverview(); if (document.getElementById('tab-jobs').classList.contains('active')) loadJobs(state.currentPage); }
  else { toast((d && d.error) || '删除失败', 'err'); }
}

// ── Settings ──
function renderSettings() {
  renderLegal();
  renderPasswordState();
  if (state.status && state.status.cookies_ready) {
    state.loginSession = null;
    state.qrReadyAt = null;
    document.getElementById('qr-image').className = 'qr-image';
    document.getElementById('qr-image').innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;opacity:.3;margin-bottom:8px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg><div style="font-size:12px;color:#166534">Cookies 已就绪</div></div>';
    document.getElementById('qr-status').innerHTML = '<span class="status-badge badge-ok">已通过钉钉验证</span>';
    var btn = document.getElementById('btn-start-qr');
    if (btn) btn.style.display = 'none';
    var qrButtons = document.getElementById('qr-buttons');
    if (qrButtons) qrButtons.innerHTML = '<button class="btn-ghost btn-sm" style="color:var(--red);border-color:var(--red)" onclick="deleteCookies()">清除 Cookies</button>';
    return;
  }
  if (!state.loginSession || state.loginSession.status === 'completed' || state.loginSession.status === 'failed') {
    // restore normal button
    var qrButtons = document.getElementById('qr-buttons');
    if (qrButtons && !qrButtons.querySelector('#btn-start-qr')) qrButtons.innerHTML = '<button id="btn-start-qr" onclick="startQRLogin()">获取二维码</button>';
    startQRLogin();
  } else {
    checkLoginStatus();
  }
}

function renderLegal() {
  var leg = state.legalState || {};
  var accepted = leg.accepted;
  document.getElementById('legal-content').innerHTML =
    '<div style="margin-bottom:12px"><span class="status-badge ' + (accepted ? 'badge-ok' : 'badge-warn') + '">' + (accepted ? '已接受' : '未接受') + '</span></div>' +
    '<div class="legal-text">' + renderMarkdown(state.legalText) + '</div>' +
    (!accepted ? '<div class="checkbox-row"><input type="checkbox" id="legal-check"><label for="legal-check">我已阅读并接受上述所有条款</label></div><button onclick="acceptLegalFromPage()">接受条款</button>' : '<div style="color:#166534;font-size:13px">✓ 您已接受当前版本条款</div>');
}

async function acceptLegalFromPage() {
  var check = document.getElementById('legal-check');
  if (check && !check.checked) { alert('请先勾选接受条款'); return; }
  var d = await api('/dingtalk/legal', { method: 'POST' });
  if (d && d.ok) { state.legalState.accepted = true; renderLegal(); }
}

async function renderPasswordState() {
  var d = await api('/dingtalk/zip-password');
  var hasPw = d && d.has_password;
  document.getElementById('pw-state').innerHTML = hasPw
    ? '<span class="status-badge badge-ok">已设置</span> <button class="btn-ghost btn-sm" style="color:var(--red);border-color:var(--red);margin-left:8px" onclick="deletePassword()">清除密码</button>'
    : '<span class="status-badge badge-no">未设置</span>';
  document.getElementById('pw-input').value = '';
  document.getElementById('pw-confirm').value = '';
  document.getElementById('pw-msg').textContent = '';
}

async function savePassword() {
  var pw = document.getElementById('pw-input').value;
  var pw2 = document.getElementById('pw-confirm').value;
  var msg = document.getElementById('pw-msg');
  if (pw.length < 4) { msg.textContent = '密码至少4位'; msg.style.color = '#dc2626'; return; }
  if (pw !== pw2) { msg.textContent = '两次输入不一致'; msg.style.color = '#dc2626'; return; }
  var d = await api('/dingtalk/zip-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
  if (d && d.ok) {
    msg.textContent = '密码已保存'; msg.style.color = '#166534';
    state.status.has_zip_password = true;
    document.getElementById('pw-state').innerHTML = '<span class="status-badge badge-ok">已设置</span>';
    document.getElementById('pw-input').value = '';
    document.getElementById('pw-confirm').value = '';
  } else {
    msg.textContent = (d && d.error) || '保存失败'; msg.style.color = '#dc2626';
  }
}

async function deleteCookies() {
  if (!confirm('确定要清除 Cookies 吗？清除后需重新扫码验证。')) return;
  console.log('[QR] deleteCookies called');
  var d = await api('/dingtalk/cookies', { method: 'DELETE' });
  if (d && d.ok) {
    state.status.cookies_ready = false;
    state.loginSession = null;
    state.qrReadyAt = null;
    toast('Cookies 已清除', 'info');
    loadStatus();
    // Reset QR UI to initial state without auto-starting
    document.getElementById('qr-image').className = 'qr-image';
    document.getElementById('qr-image').innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:40px;height:40px;opacity:.3;margin-bottom:8px"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg><div style="font-size:11px">点击下方按钮获取二维码</div></div>';
    document.getElementById('qr-status').textContent = '';
    var qrButtons = document.getElementById('qr-buttons');
    if (qrButtons) qrButtons.innerHTML = '<button id="btn-start-qr" onclick="startQRLogin()">获取二维码</button>';
  } else {
    toast((d && d.error) || '清除失败', 'err');
  }
}

async function deletePassword() {
  if (!confirm('确定要清除下载密码吗？清除后需重新设置才能下载视频。')) return;
  var d = await api('/dingtalk/zip-password', { method: 'DELETE' });
  if (d && d.ok) {
    state.status.has_zip_password = false;
    toast('密码已清除', 'info');
    renderPasswordState();
  } else {
    toast((d && d.error) || '清除失败', 'err');
  }
}

// ── QR Login ──
async function startQRLogin() {
  console.log('[QR] startQRLogin called, session:', state.loginSession && state.loginSession.status);
  if (state.loginSession) {
    var s = state.loginSession;
    if (s.status === 'pending' || s.status === 'qr_ready') {
      console.log('[QR] startQRLogin skipped — active session:', s.status);
      return;
    }
  }
  state.qrStartedAt = Date.now();
  state.qrReadyAt = null;
  var errEl = document.getElementById('qr-error');
  errEl.style.display = 'none';
  var btn = document.getElementById('btn-start-qr');
  btn.disabled = true;
  btn.style.display = 'none';
  document.getElementById('qr-status').innerHTML = '<span class="qr-spinner" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:6px"></span>正在启动...';

  var d = await api('/dingtalk/login-workflow', { method: 'POST' });
  if (!d) { console.log('[QR] startQRLogin API returned null'); btn.disabled = false; btn.style.display = ''; return; }
  if (d.error) { console.log('[QR] startQRLogin error:', d.error); errEl.textContent = d.error; errEl.style.display = 'block'; btn.disabled = false; btn.style.display = ''; return; }

  console.log('[QR] session created, status:', d.login_session && d.login_session.status);
  state.loginSession = d.login_session;
  btn.disabled = false;
  btn.style.display = 'none';
  if (d.login_session) {
    var qrSrc = getQRImageSrc(d.login_session);
    if (qrSrc) {
      document.getElementById('qr-image').className = 'qr-image has-code';
      document.getElementById('qr-image').innerHTML = '<img src="' + qrSrc + '" alt="QR Code" />';
      document.getElementById('qr-status').textContent = '请用钉钉 App 扫码';
    } else {
      document.getElementById('qr-image').className = 'qr-image';
      document.getElementById('qr-status').textContent = '等待生成二维码（约10-30秒）...';
      document.getElementById('qr-image').innerHTML = '<div class="qr-spinner"></div>';
    }
  } else {
    document.getElementById('qr-image').className = 'qr-image';
    document.getElementById('qr-status').textContent = '等待生成二维码（约10-30秒）...';
    document.getElementById('qr-image').innerHTML = '<div class="qr-spinner"></div>';
  }
}

async function checkLoginStatus() {
  var errEl = document.getElementById('qr-error');
  if (errEl) errEl.style.display = 'none';

  var d = await api('/dingtalk/login-workflow');
  if (!d) { console.log('[QR] checkLoginStatus API returned null'); return; }
  state.loginSession = d.login_session;

  if (!d.login_session) {
    console.log('[QR] no session, restarting...');
    document.getElementById('qr-image').innerHTML = '<div class="qr-spinner"></div>';
    document.getElementById('qr-status').textContent = '正在重新启动...';
    var btn = document.getElementById('btn-start-qr');
    if (btn) btn.style.display = 'none';
    setTimeout(function() { startQRLogin(); }, 2000);
    return;
  }

  var s = d.login_session;
  console.log('[QR] status:', s.status, 'qrReadyAt:', state.qrReadyAt);
  var qrSrc = getQRImageSrc(s);
  if (qrSrc) {
    document.getElementById('qr-image').className = 'qr-image has-code';
    document.getElementById('qr-image').innerHTML = '<img src="' + qrSrc + '" alt="QR Code" />';
  } else if (s.qr_url) {
    document.getElementById('qr-image').innerHTML = '<div class="qr-spinner"></div>';
  }

  if (s.status === 'qr_ready' && !state.qrReadyAt) {
    state.qrReadyAt = Date.now();
    console.log('[QR] qr_ready at:', state.qrReadyAt);
  }

  var statusMap = {
    pending: ['等待远程生成', 'badge-warn'],
    qr_ready: ['请用钉钉扫码', 'badge-info'],
    completed: ['登录成功', 'badge-ok'],
    failed: ['登录失败', 'badge-no'],
  };
  var stInfo = statusMap[s.status] || ['未知: ' + s.status, 'badge-warn'];
  var statusHtml = '<span class="status-badge ' + stInfo[1] + '">' + stInfo[0] + '</span>';

  if (s.status === 'pending') {
    var waited = Math.floor((Date.now() - (state.qrStartedAt || Date.now())) / 1000);
    statusHtml += '<div style="font-size:10px;color:var(--muted);margin-top:4px">已等待 ' + waited + ' 秒，约需 10-30 秒</div>';
  }

  if (s.status === 'failed') {
    console.log('[QR] login failed:', s.error_message);
    if (s.error_message) statusHtml += '<div style="font-size:10px;color:var(--muted);margin-top:4px">' + escHtml(s.error_message) + '</div>';
    statusHtml += '<div style="margin-top:6px;color:var(--amber);font-size:12px">正在自动重试...</div>';
    state.qrReadyAt = null;
    setTimeout(function() { startQRLogin(); }, 2000);
  }

  if (s.status === 'qr_ready') {
    var qrAge = Math.floor((Date.now() - (state.qrReadyAt || Date.now())) / 1000);
    var remaining = Math.max(0, 300 - qrAge);
    var remainText = remaining > 60 ? Math.floor(remaining / 60) + '分' + (remaining % 60) + '秒' : remaining + '秒';
    statusHtml += '<div style="font-size:10px;color:var(--muted);margin-top:4px">剩余: ' + remainText + '</div>';
    if (remaining <= 0) {
      console.log('[QR] code expired');
      statusHtml += '<div style="margin-top:8px;color:var(--red);font-size:12px">二维码已过期</div>';
      statusHtml += '<button class="btn-ghost btn-sm" style="margin-top:4px" onclick="event.stopPropagation();startQRLogin()">重新获取</button>';
      state.qrReadyAt = null;
    } else if (remaining < 60) {
      statusHtml += '<div style="margin-top:4px;font-size:10px;color:var(--amber)">即将过期，请尽快扫码</div>';
    }
  }

  document.getElementById('qr-status').innerHTML = statusHtml;

  // Button visibility based on state
  var btn = document.getElementById('btn-start-qr');
  if (btn) {
    if (s.status === 'pending' || s.status === 'qr_ready') {
      btn.style.display = 'none';
    } else {
      btn.style.display = '';
      btn.disabled = false;
    }
  }

  if (s.status === 'completed') {
    console.log('[QR] login completed, cleaning up');
    state.loginSession = null;
    state.qrReadyAt = null;
    var wasReady = state.status && state.status.cookies_ready;
    await loadStatus();
    var nowReady = state.status && state.status.cookies_ready;
    if (!wasReady && nowReady) {
      closeGate();
      toast('钉钉验证成功！Cookies 已就绪', 'ok');
      setTimeout(function() { switchTab('dashboard'); }, 1500);
    }
    if (errEl) { errEl.textContent = '登录成功！Cookies 已保存。'; errEl.style.display = 'block'; errEl.style.background = '#dcfce7'; errEl.style.color = '#166534'; }
    document.getElementById('qr-image').className = 'qr-image';
    document.getElementById('qr-image').innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;color:var(--green);margin-bottom:8px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg><div style="font-size:13px;color:#166534;font-weight:500">登录成功</div></div>';
    if (btn) btn.style.display = 'none';
  }
}

// ── Admin ──
async function loadAdmin() {
  if (!state.user || !state.user.isSudo) return;
  document.getElementById('admin-content').innerHTML =
    '<div class="admin-section"><h3>免登录链接</h3><div id="admin-guest-url"></div></div>' +
    '<div class="admin-section"><h3>用户管理</h3><div id="admin-users"></div></div>' +
    '<div class="admin-section"><h3>条款管理</h3><div id="admin-legal"></div></div>';
  loadAdminGuestURL();
  loadAdminUsers();
  loadAdminLegal();
}

async function loadAdminGuestURL() {
  var d = await api('/dingtalk/admin/settings');
  if (!d || !d.settings) return;
  var token = d.settings.guest_token || '';
  if (!token) {
    document.getElementById('admin-guest-url').innerHTML = '<div style="color:var(--red);font-size:12px">无法加载</div>';
    return;
  }
  var url = location.origin + '/dingtalk?token=' + token;
  document.getElementById('admin-guest-url').innerHTML =
    '<div style="font-size:12px;color:var(--muted);margin-bottom:10px">持有此链接的人可免登录使用。请勿公开分享。</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap"><input type="text" value="' + escHtml(url) + '" readonly style="flex:1;min-width:200px;font-size:11px;font-family:monospace" id="guest-url-input" />' +
    '<button onclick="copyGuestURL()">复制</button>' +
    '<button class="btn-ghost btn-sm" onclick="regenerateToken()">重新生成</button></div>' +
    '<div id="guest-url-msg" style="margin-top:6px;font-size:11px"></div>';
}

function copyGuestURL() {
  var input = document.getElementById('guest-url-input');
  if (!input) return;
  input.select();
  document.execCommand('copy');
  document.getElementById('guest-url-msg').innerHTML = '<span style="color:#166534">已复制</span>';
}

async function regenerateToken() {
  if (!confirm('确定要重新生成吗？旧链接将立即失效。')) return;
  var d = await api('/dingtalk/admin/regenerate-token', { method: 'POST' });
  if (d && d.ok) { loadAdminGuestURL(); document.getElementById('guest-url-msg').innerHTML = '<span style="color:#166534">已生成新链接</span>'; }
  else { alert((d && d.error) || '操作失败'); }
}

async function loadAdminUsers() {
  var d = await api('/dingtalk/admin/users');
  if (!d) return;
  var users = d.users || [];
  document.getElementById('admin-users').innerHTML = users.length
    ? '<table class="admin-table"><thead><tr><th>用户名</th><th>Sudo</th><th>条款</th><th>Cookie</th><th>密码</th><th>任务</th><th>注册</th></tr></thead><tbody>' +
      users.map(function(u) { return '<tr><td>' + escHtml(u.username) + '</td><td>' + (u.is_sudo ? '✓' : '—') + '</td><td>' + (u.legal_accepted ? '✓' : '—') + '</td><td>' + (u.cookies_ready ? '<span class="status-badge badge-ok">是</span>' : '<span class="status-badge badge-no">否</span>') + '</td><td>' + (u.has_zip_password ? '<span class="status-badge badge-ok">是</span>' : '<span class="status-badge badge-no">否</span>') + '</td><td>' + u.total_jobs + '</td><td>' + (u.created_at ? new Date(u.created_at).toLocaleString('zh-CN') : '-') + '</td></tr>'; }).join('') +
      '</tbody></table>'
    : '<div style="color:var(--muted);font-size:12px">暂无数据</div>';
}

async function loadAdminLegal() {
  var d = await api('/dingtalk/admin/legal');
  if (!d) return;
  document.getElementById('admin-legal').innerHTML =
    '<div style="margin-bottom:10px;font-size:12px;color:var(--muted)">当前版本: <strong>' + escHtml(d.version || '') + '</strong></div>' +
    '<textarea id="admin-legal-text" class="admin-textarea" placeholder="输入条款内容...">' + escHtml(d.text || '') + '</textarea>' +
    '<div style="margin-top:8px"><button onclick="saveAdminLegal()">保存条款</button></div>' +
    '<div id="admin-legal-msg" style="margin-top:8px;font-size:12px"></div>';
}

async function saveAdminLegal() {
  var text = document.getElementById('admin-legal-text').value;
  var msg = document.getElementById('admin-legal-msg');
  if (!text.trim()) { msg.textContent = '条款内容不能为空'; msg.style.color = '#dc2626'; return; }
  var d = await api('/dingtalk/admin/legal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text: text }) });
  if (d && d.ok) { msg.textContent = '条款已保存'; msg.style.color = '#166534'; }
  else { msg.textContent = (d && d.error) || '保存失败'; msg.style.color = '#dc2626'; }
}

// ── Utilities ──
function escHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderMarkdown(text) {
  if (!text) return '';
  var lines = text.split('\\n');
  var html = '';
  var inList = false;
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (/^##\\s/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<h3 style="font-size:14px;font-weight:600;margin:12px 0 6px">' + escHtml(line.replace(/^##\\s+/, '')) + '</h3>';
    } else if (/^-\\s/.test(line)) {
      if (!inList) { html += '<ul style="padding-left:18px;margin:4px 0">'; inList = true; }
      html += '<li style="margin-bottom:3px">' + escHtml(line.replace(/^-\\s+/, '')) + '</li>';
    } else if (/^\\s*$/.test(line)) {
      if (inList) { html += '</ul>'; inList = false; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<p style="margin:4px 0">' + escHtml(line) + '</p>';
    }
  }
  if (inList) html += '</ul>';
  return html;
}

function formatSeconds(s) {
  if (s < 60) return s + '秒';
  return Math.floor(s / 60) + '分' + (s % 60) + '秒';
}

function toast(msg, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(function() { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(function() { el.remove(); }, 300); }, 2500);
}

function getQRImageSrc(session) {
  if (session.qr_image_base64) return 'data:image/png;base64,' + session.qr_image_base64;
  return null;
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async function() {
    await loadStatus();
    if (document.getElementById('tab-dashboard').classList.contains('active')) {
      renderMetrics();
      renderStatus();
      loadRecentJobs();
    }
    if (document.getElementById('tab-jobs').classList.contains('active')) {
      loadJobs(state.currentPage);
    }
    var expanded = document.querySelector('.job-item.expanded');
    if (expanded) {
      var jobId = expanded.getAttribute('data-job-id');
      if (jobId) {
        var d = await api('/dingtalk/jobs/' + jobId + '?include=events' + (DT_TOKEN ? '&dt_token=' + DT_TOKEN : ''));
        if (d && d.job && (d.job.status === 'running' || d.job.status === 'queued')) {
          d.job._events = d.events || [];
          var newEl = document.createElement('div');
          newEl.outerHTML = jobRowHTML(d.job, true);
          expanded.outerHTML = newEl.outerHTML;
        }
      }
    }
    if (document.getElementById('tab-settings').classList.contains('active') && state.loginSession) {
      if (state.loginSession.status !== 'completed') await checkLoginStatus();
    }
  }, 2000);
}

window.addEventListener('online', function() { location.reload(); });

checkAuth();
</script>
</body>
</html>`;