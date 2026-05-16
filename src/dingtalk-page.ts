export const DINGTALK_PAGE = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>钉钉视频下载 — S-MAIL</title>
<style>
:root{--bg:#f8fafc;--panel:#fff;--text:#0f172a;--muted:#64748b;--blue:#2563eb;--green:#16a34a;--red:#dc2626;--amber:#ca8a04;--line:#e2e8f0;--font:"Google Sans","PingFang SC",system-ui,sans-serif;--radius:10px;--shadow:0 1px 2px rgba(0,0,0,.04)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;display:flex}
a{color:var(--blue);text-decoration:none}

/* sidebar */
#sidebar{width:232px;min-height:100vh;background:var(--panel);border-right:1px solid var(--line);padding:20px 0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.brand{display:flex;align-items:center;gap:10px;padding:0 20px 20px;border-bottom:1px solid var(--line);margin-bottom:12px}
.brand-dot{width:30px;height:30px;background:var(--blue);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:15px;font-weight:700}
.brand-text{font-size:15px;font-weight:600;color:var(--text)}
.nav-group-label{font-size:11px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;padding:12px 20px 6px}
.nav-item{padding:9px 20px;cursor:pointer;font-size:13px;color:var(--muted);transition:all .15s;display:flex;align-items:center;gap:8px;border-left:3px solid transparent;position:relative}
.nav-item:hover{color:var(--text);background:#f1f5f9}
.nav-item.active{color:var(--blue);background:#eff6ff;border-left-color:var(--blue);font-weight:500}
.nav-item.admin-only{display:none}
.nav-item.admin-only.show{display:flex}
.nav-dot{width:18px;height:18px;border-radius:50%;border:2px solid var(--line);display:inline-flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;transition:all .25s}
.nav-dot.done{background:var(--green);border-color:var(--green);color:#fff}
.nav-dot.warn{background:var(--amber);border-color:var(--amber);color:#fff}
.nav-item.active .nav-dot:not(.done):not(.warn){border-color:var(--blue);color:var(--blue)}
.nav-step-badge{font-size:10px;margin-left:auto;padding:2px 8px;border-radius:10px;font-weight:600}
.nav-step-badge.ok{background:#dcfce7;color:#166534}
.nav-step-badge.no{background:#fee2e2;color:#991b1b}
.sidebar-footer{padding:20px;margin-top:auto;border-top:1px solid var(--line)}
.sidebar-footer a{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted);transition:color .15s}
.sidebar-footer a:hover{color:var(--blue)}

/* main */
#main{flex:1;padding:36px 40px;overflow-y:auto;max-height:100vh}
.page{display:none;animation:fadeIn .2s ease}
.page.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}

h1{font-size:22px;font-weight:600;margin-bottom:24px;letter-spacing:-.3px}

/* cards */
.card{background:var(--panel);border-radius:14px;border:1px solid var(--line);padding:24px;margin-bottom:20px;box-shadow:var(--shadow)}
.card h2{font-size:15px;font-weight:600;margin-bottom:16px;color:var(--text);display:flex;align-items:center;gap:8px}

/* metric cards */
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:14px;margin-bottom:24px}
.metric{background:var(--panel);border-radius:14px;border:1px solid var(--line);padding:18px 20px;box-shadow:var(--shadow);transition:transform .15s}
.metric:hover{transform:translateY(-1px)}
.metric .label{font-size:11px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:.3px}
.metric .value{font-size:30px;font-weight:700;color:var(--text);line-height:1}
.metric .sub{font-size:11px;color:var(--muted);margin-top:4px}

/* form elements */
input[type="text"],input[type="password"],input[type="number"],select,textarea{
width:100%;border:1px solid var(--line);border-radius:10px;padding:10px 14px;font:inherit;font-size:14px;outline:none;transition:border-color .15s,box-shadow .15s;background:#fff;color:var(--text)
}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
button{background:var(--blue);color:#fff;border:none;border-radius:10px;padding:10px 20px;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s;display:inline-flex;align-items:center;gap:6px}
button:hover{background:#1d4ed8;transform:translateY(-.5px);box-shadow:0 2px 8px rgba(37,99,235,.25)}
button:active{transform:translateY(0)}
button:disabled{background:#94a3b8;cursor:not-allowed;transform:none;box-shadow:none}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--line)}
.btn-ghost:hover{background:#f8fafc;color:var(--text);transform:none;box-shadow:none}
.btn-danger{background:var(--red)}
.btn-danger:hover{background:#b91c1c;box-shadow:0 2px 8px rgba(220,38,38,.25)}
.btn-sm{padding:6px 14px;font-size:12px;border-radius:8px}

/* status badges */
.status-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13px}
.status-row:last-child{border-bottom:none}
.status-label{color:var(--muted);width:110px;flex-shrink:0}
.status-val{flex:1;font-weight:500}
.status-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.badge-ok{background:#dcfce7;color:#166534}
.badge-no{background:#fee2e2;color:#991b1b}
.badge-warn{background:#fef9c3;color:#854d0e}
.badge-info{background:#dbeafe;color:#1e40af}

/* url form */
.url-form{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap}
.url-form input{flex:1;min-width:200px}

/* jobs */
.job-item{border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:10px;cursor:pointer;transition:all .15s;background:var(--panel)}
.job-item:hover{border-color:var(--blue);box-shadow:0 2px 8px rgba(0,0,0,.04)}
.job-item.expanded{border-color:var(--blue);box-shadow:0 2px 8px rgba(37,99,235,.08)}
.job-header{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.job-id{font-size:11px;color:var(--muted);font-family:"SF Mono",monospace;background:#f1f5f9;padding:2px 8px;border-radius:4px}
.job-title{font-size:13px;font-weight:500;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.job-status{padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;flex-shrink:0}
.job-meta{display:flex;gap:16px;font-size:12px;color:var(--muted)}
.job-detail{display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
.job-item.expanded .job-detail{display:block}
.job-progress-bar{height:4px;background:#e2e8f0;border-radius:2px;margin:8px 0;overflow:hidden}
.job-progress-fill{height:100%;background:var(--blue);border-radius:2px;transition:width .4s ease}
.job-events{margin-top:10px;max-height:180px;overflow-y:auto;font-size:11px;font-family:"SF Mono",monospace;background:#f8fafc;border-radius:8px;padding:10px}
.job-event{padding:2px 0;color:var(--muted)}
.job-event.error{color:var(--red)}
.job-event.success{color:var(--green)}
.files-list{margin-top:8px}
.file-item{display:flex;align-items:center;gap:8px;padding:6px 10px;font-size:13px;background:#f8fafc;border-radius:8px;margin-bottom:4px}
.file-item a{color:var(--blue);font-size:12px;font-weight:500;padding:4px 12px;background:#eff6ff;border-radius:6px;transition:all .15s}
.file-item a:hover{background:var(--blue);color:#fff}
.retention-hint{font-size:11px;color:var(--muted);margin-top:8px;display:flex;align-items:center;gap:4px}

/* pagination */
.pagination{display:flex;align-items:center;gap:8px;margin-top:16px;justify-content:center}
.pagination button{padding:6px 14px;font-size:12px}
.page-info{font-size:12px;color:var(--muted);margin:0 8px}

/* qr */
.qr-box{display:flex;flex-direction:column;align-items:center;gap:16px;padding:24px}
.qr-image{width:220px;height:220px;border:2px dashed var(--line);border-radius:16px;background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;transition:border-color .3s}
.qr-image.has-code{border-style:solid;border-color:var(--line)}
.qr-image img{max-width:200px;max-height:200px;display:block}
.qr-spinner{width:36px;height:36px;border:3px solid var(--line);border-top-color:var(--blue);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.qr-status{font-size:13px;color:var(--muted);text-align:center;min-height:20px}
.login-actions{display:flex;gap:10px;justify-content:center}
.qr-hint{font-size:11px;color:var(--muted);text-align:center;max-width:280px;line-height:1.6}

/* legal */
.legal-text{background:#f8fafc;border-radius:10px;padding:20px;font-size:13px;line-height:1.8;max-height:360px;overflow-y:auto;margin-bottom:20px;border:1px solid var(--line)}
.checkbox-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;font-size:14px}
.checkbox-row input[type="checkbox"]{width:18px;height:18px;accent-color:var(--blue)}

/* password section */
.pw-form{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:12px}
.pw-form input{flex:1;min-width:160px;max-width:260px}
.pw-hint{font-size:12px;color:var(--muted);margin-top:8px}
.pw-strength{height:3px;border-radius:2px;margin-top:6px;transition:all .25s;max-width:260px}

/* gate */
#gate{display:none;position:fixed;inset:0;background:rgba(15,23,42,.6);z-index:1000;align-items:center;justify-content:center;backdrop-filter:blur(4px)}
#gate.show{display:flex}
.gate-card{background:#fff;border-radius:18px;padding:32px;max-width:480px;width:90%;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2)}
.gate-card h2{font-size:18px;margin-bottom:6px}
.gate-card p{font-size:13px;color:var(--muted);margin-bottom:20px;line-height:1.6}
.gate-progress{display:flex;gap:4px;margin-bottom:24px}
.gate-step-bar{flex:1;height:3px;background:var(--line);border-radius:2px;transition:background .3s}
.gate-step-bar.done{background:var(--green)}
.gate-step-bar.current{background:var(--blue)}
.gate-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px;text-align:center}
.gate-icon{font-size:48px;line-height:1}
.gate-icon.ok{color:var(--green)}
.gate-icon.no{color:var(--red)}
.gate-icon.warn{color:var(--amber)}
.gate-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}

/* toast */
#toast-container{position:fixed;top:20px;right:20px;z-index:2000;display:flex;flex-direction:column;gap:8px}
.toast{padding:12px 20px;border-radius:10px;font-size:13px;font-weight:500;box-shadow:0 4px 16px rgba(0,0,0,.12);animation:slideIn .25s ease;max-width:380px;display:flex;align-items:center;gap:8px}
.toast.ok{background:#166534;color:#fff}
.toast.err{background:#991b1b;color:#fff}
.toast.info{background:#1e40af;color:#fff}
@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

/* admin */
.admin-section{margin-bottom:32px}
.admin-section h2{font-size:16px;font-weight:600;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.admin-table{width:100%;border-collapse:collapse;font-size:13px}
.admin-table th{text-align:left;padding:8px 12px;background:#f8fafc;color:var(--muted);font-weight:500;border-bottom:1px solid var(--line);font-size:11px;text-transform:uppercase;letter-spacing:.3px}
.admin-table td{padding:10px 12px;border-bottom:1px solid var(--line)}
.admin-table tr:hover td{background:#f8fafc}
.admin-textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:13px;min-height:200px;resize:vertical;margin-top:8px}
.loading{text-align:center;padding:40px;color:var(--muted)}
.error-msg{color:var(--red);font-size:13px;padding:10px 14px;background:#fee2e2;border-radius:8px;margin-bottom:12px}
.info-msg{color:#166534;font-size:13px;padding:10px 14px;background:#dcfce7;border-radius:8px;margin-bottom:12px}

/* empty state */
.empty-state{text-align:center;padding:40px 20px;color:var(--muted)}
.empty-state .empty-icon{font-size:40px;margin-bottom:12px}
.empty-state .empty-text{font-size:14px}
</style>
</head>
<body>

<!-- sidebar -->
<div id="sidebar">
  <div class="brand">
    <div class="brand-dot">S</div>
    <div class="brand-text">视频下载</div>
  </div>
  <div class="nav">
    <div class="nav-group-label">主菜单</div>
    <div class="nav-item active" data-page="overview" onclick="navigate('overview')"><span class="nav-dot">1</span>仪表盘</div>
    <div class="nav-item" data-page="jobs" onclick="navigate('jobs')"><span class="nav-dot">4</span>详细记录</div>
    <div class="nav-group-label">设置</div>
    <div class="nav-item" data-page="legal" onclick="navigate('legal')"><span class="nav-dot" id="step-legal">1</span>条款确认<span class="nav-step-badge no" id="badge-legal">未完成</span></div>
    <div class="nav-item" data-page="qr" onclick="navigate('qr')"><span class="nav-dot" id="step-qr">2</span>钉钉验证<span class="nav-step-badge no" id="badge-qr">未完成</span></div>
    <div class="nav-item" data-page="password" onclick="navigate('password')"><span class="nav-dot" id="step-pw">3</span>下载密码<span class="nav-step-badge no" id="badge-pw">未完成</span></div>
    <div class="nav-group-label">管理</div>
    <div class="nav-item admin-only" data-page="admin" onclick="navigate('admin')"><span class="nav-dot">5</span>管理页</div>
  </div>
  <div class="sidebar-footer">
    <a href="/">← 返回邮箱</a>
  </div>
</div>

<!-- main content -->
<div id="main">

  <!-- overview -->
  <div id="page-overview" class="page active">
    <h1>仪表盘</h1>
    <div class="metrics" id="metrics"></div>

    <div class="card">
      <h2>状态概览</h2>
      <div id="status-rows"></div>
    </div>

    <div class="card">
      <h2>提交下载任务</h2>
      <div class="url-form">
        <input type="text" id="url-input" placeholder="输入视频页面 URL" />
        <input type="number" id="thread-input" placeholder="线程" style="width:100px" />
        <button onclick="submitJob()">提交任务</button>
      </div>
      <div id="submit-error" class="error-msg" style="display:none"></div>
      <div id="submit-info" class="info-msg" style="display:none"></div>
    </div>

    <div class="card">
      <h2>最近任务</h2>
      <div id="recent-jobs"></div>
      <div style="margin-top:12px"><button class="btn-ghost" onclick="navigate('jobs')">查看全部 →</button></div>
    </div>
  </div>

  <!-- legal -->
  <div id="page-legal" class="page">
    <h1>条款确认</h1>
    <div class="card">
      <div id="legal-content"></div>
    </div>
  </div>

  <!-- qr -->
  <div id="page-qr" class="page">
    <h1>钉钉验证</h1>
    <div class="card">
      <div id="qr-login-box" class="qr-box">
        <div id="qr-image" class="qr-image"><div class="empty-state"><div class="empty-icon">📱</div><div class="empty-text" style="font-size:12px">点击下方按钮获取二维码</div></div></div>
        <div id="qr-status" class="qr-status"></div>
        <div class="login-actions">
          <button id="btn-start-qr" onclick="startQRLogin()">获取二维码</button>
          <button class="btn-ghost btn-sm" onclick="checkLoginStatus()">刷新状态</button>
        </div>
        <div class="qr-hint">二维码有效期为 5 分钟<br>请使用钉钉 App 扫码<br>请勿刷新页面</div>
      </div>
      <div id="qr-error" class="error-msg" style="display:none"></div>
    </div>
  </div>

  <!-- password -->
  <div id="page-password" class="page">
    <h1>下载密码</h1>
    <div class="card">
      <h2>设置加密密码</h2>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">下载的视频将打包为加密 zip 文件，此密码为解压密码。设置后不可查看，请妥善保存。</p>
      <div class="pw-form">
        <input type="password" id="pw-input" placeholder="输入密码（至少4位）" />
        <input type="password" id="pw-confirm" placeholder="确认密码" />
        <button onclick="savePassword()">保存密码</button>
      </div>
      <div id="pw-msg" style="margin-top:12px"></div>
      <div id="pw-status-row" class="status-row" style="margin-top:12px">
        <span class="status-label">密码状态</span>
        <span class="status-val" id="pw-state"></span>
      </div>
    </div>
  </div>

  <!-- jobs -->
  <div id="page-jobs" class="page">
    <h1>详细记录</h1>
    <div class="card">
      <div id="jobs-list"></div>
      <div class="pagination" id="jobs-pagination"></div>
    </div>
  </div>

  <!-- admin -->
  <div id="page-admin" class="page">
    <h1>管理页</h1>
    <div id="admin-content"></div>
  </div>

</div>

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
    <h2 id="gate-title">正在进行</h2>
    <p id="gate-desc">请稍候...</p>
    <div id="gate-body" class="gate-state"></div>
    <div class="gate-actions"><button id="gate-btn" onclick="gateAction()" style="display:none">继续</button></div>
  </div>
</div>

<script>
let state = { user: null, status: null, legalState: null, legalText: '', currentPage: 1, totalPages: 1, jobs: [], loginSession: null, adminTab: 'users' };
let pollTimer = null;

async function api(path, opts) {
  const r = await fetch('/api' + path, { credentials: 'include', ...opts });
  const d = await r.json();
  if (!r.ok && r.status === 401) { location.href = '/login'; return null; }
  return d;
}

async function checkAuth() {
  const d = await api('/auth/me');
  if (!d || !d.ok || !d.user) { location.href = '/login'; return; }
  state.user = d.user;
  document.body.style.display = 'flex';
  init();
}

async function init() {
  if (state.user.isSudo) document.querySelectorAll('.admin-only').forEach(el => el.classList.add('show'));
  await loadStatus();
  await loadLegal();
  updateSidebarBadges();
  // Respect hash-based routing on initial load
  var hash = location.hash.replace(/^#/, '');
  if (hash === 'legal' || hash === 'qr' || hash === 'password' || hash === 'admin') {
    navigate(hash);
    if (hash !== 'admin') startPolling();
    return;
  }
  if (state.status && !state.status.legal_accepted) { showGate('legal'); return; }
  if (state.status && !state.status.cookies_ready) { showGate('qr'); return; }
  if (state.status && !state.status.has_zip_password) { showGate('password'); return; }
  var hash = location.hash.replace(/^#/, '');
  if (hash === 'jobs') { navigate('jobs'); startPolling(); return; }
  showOverview();
  startPolling();
}

async function loadStatus() {
  const d = await api('/dingtalk/status');
  if (d && d.ok) state.status = d;
}

async function loadLegal() {
  const d = await api('/dingtalk/legal');
  if (d) { state.legalState = { version: d.version, accepted: d.accepted }; state.legalText = d.text || ''; }
}

function showGate(type) {
  const g = document.getElementById('gate');
  const title = document.getElementById('gate-title');
  const desc = document.getElementById('gate-desc');
  const body = document.getElementById('gate-body');
  const btn = document.getElementById('gate-btn');
  const progress = document.getElementById('gate-progress');
  g.classList.add('show');
  btn.style.display = 'none';

  const steps = { legal: 0, qr: 1, password: 2 };
  const stepIdx = steps[type] || 0;
  if (progress) {
    progress.innerHTML = [0,1,2].map(i => '<div class="gate-step-bar' + (i < stepIdx ? ' done' : i === stepIdx ? ' current' : '') + '"></div>').join('');
  }

  if (type === 'legal') {
    title.textContent = '请先阅读并接受条款';
    desc.textContent = '继续使用钉钉视频下载服务前，请接受以下免责声明';
    body.innerHTML = '<div class="legal-text" style="max-height:260px;font-size:12px">' + renderMarkdown(state.legalText) + '</div><div class="checkbox-row"><input type="checkbox" id="gate-check"><label for="gate-check">我已阅读并接受上述所有条款</label></div>';
    btn.style.display = 'inline-flex';
    btn.textContent = '接受条款';
    btn.onclick = acceptLegal;
  } else if (type === 'qr') {
    title.textContent = '请完成钉钉验证';
    desc.textContent = '需要通过二维码登录获取有效的 Cookies 才能提交任务';
    body.innerHTML = '<div class="gate-icon warn">📱</div><div style="font-size:14px">您尚未完成钉钉验证</div><div style="margin-top:12px"><button onclick="closeGate();navigate(&quot;qr&quot;)">前往验证 →</button></div>';
  } else if (type === 'password') {
    title.textContent = '请设置下载密码';
    desc.textContent = '下载的视频将打包为加密 zip，需要设置解压密码';
    body.innerHTML = '<div class="gate-icon warn">🔑</div><div style="margin-bottom:12px;font-size:14px">请先设置下载密码</div>' +
      '<input type="password" id="gate-pw" placeholder="输入密码（至少4位）" style="margin-bottom:8px" />' +
      '<input type="password" id="gate-pw2" placeholder="确认密码" style="margin-bottom:8px" />' +
      '<div id="gate-pw-err" style="color:#dc2626;font-size:13px;margin-bottom:8px"></div>';
    btn.style.display = 'inline-flex';
    btn.textContent = '保存密码';
    btn.onclick = gateSavePw;
  }
}

async function gateSavePw() {
  const pw = document.getElementById('gate-pw').value;
  const pw2 = document.getElementById('gate-pw2').value;
  const err = document.getElementById('gate-pw-err');
  if (pw.length < 4) { err.textContent = '密码至少4位'; return; }
  if (pw !== pw2) { err.textContent = '两次输入不一致'; return; }
  const d = await api('/dingtalk/zip-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
  if (d && d.ok) { state.status.has_zip_password = true; closeGate(); showOverview(); }
  else { err.textContent = d.error || '保存失败'; }
}

async function acceptLegal() {
  const check = document.getElementById('gate-check');
  if (!check.checked) { alert('请先勾选接受条款'); return; }
  const d = await api('/dingtalk/legal', { method: 'POST' });
  if (d && d.ok) {
    state.legalState.accepted = true;
    closeGate();
    init();
  }
}

function closeGate() { document.getElementById('gate').classList.remove('show'); }
function gateAction() {}

function navigate(page) {
  if (location.hash !== '#' + page) {
    history.pushState(null, '', '#' + page);
  }
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  var navItem = document.querySelector('.nav-item[data-page="' + page + '"]');
  if (navItem) navItem.classList.add('active');
  document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (page === 'jobs') loadJobs(1);
  else if (page === 'admin') loadAdmin();
  else if (page === 'qr') { if (!state.loginSession) checkLoginStatus(); }
  else if (page === 'legal') renderLegal();
  else if (page === 'password') renderPasswordPage();
}

function showOverview() {
  renderMetrics();
  renderStatus();
  loadRecentJobs();
}

function renderMetrics() {
  const s = state.status || {};
  const el = document.getElementById('metrics');
  el.innerHTML = [
    card('总任务', s.total_jobs || 0, ''),
    card('排队中', s.queued_jobs || 0, 'badge-warn'),
    card('执行中', s.running_jobs || 0, 'badge-info'),
    card('已完成', s.succeeded_jobs || 0, 'badge-ok'),
    card('已失败', s.failed_jobs || 0, 'badge-no'),
  ].join('');
  function card(label, value, badge) {
    return '<div class="metric"><div class="label">' + label + '</div><div class="value">' + value + '</div></div>';
  }
}

function renderStatus() {
  const s = state.status || {};
  const legal = state.legalState || {};
  const items = [
    ['Cookie', s.cookies_ready ? '已就绪' : '未就绪', s.cookies_ready ? 'ok' : 'no'],
    ['条款', legal.accepted ? '已接受' : '未接受', legal.accepted ? 'ok' : 'no'],
    ['密码', s.has_zip_password ? '已设置' : '未设置', s.has_zip_password ? 'ok' : 'no'],
    ['用户', state.user ? state.user.username : '-', ''],
    ['管理员', state.user && state.user.isSudo ? '是' : '否', ''],
    ['保留期', s.artifact_retention_days ? s.artifact_retention_days + '天' : '-', ''],
    ['线程', s.default_thread || '-', ''],
  ];
  document.getElementById('status-rows').innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px">' +
    items.map(function(i) {
      var badge = i[2] ? '<span class="status-badge badge-' + (i[2] === 'ok' ? 'ok' : 'no') + '" style="font-size:10px">' + i[1] + '</span>' : '<span style="font-weight:500">' + i[1] + '</span>';
      return '<div style="background:#f8fafc;border-radius:10px;padding:12px 14px;text-align:center"><div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.3px;margin-bottom:4px">' + i[0] + '</div>' + badge + '</div>';
    }).join('') + '</div>';
}

async function loadRecentJobs() {
  const d = await api('/dingtalk/jobs?page_size=5');
  if (!d) return;
  const jobs = d.jobs || [];
  state.recentJobs = jobs;
  const html = jobs.length ? jobs.map(j => jobRowHTML(j, false)).join('') : '<div style="color:var(--muted);padding:20px;text-align:center">暂无任务记录</div>';
  document.getElementById('recent-jobs').innerHTML = html;
}

function jobRowHTML(job, expanded) {
  const statusMap = { queued: ['badge-warn','排队'], running: ['badge-info','执行中'], succeeded: ['badge-ok','完成'], failed: ['badge-no','失败'] };
  const [cls, label] = statusMap[job.status] || ['badge-warn','未知'];
  const pct = job.progress_percent || 0;
  const errors = (job.errors || []).slice(0, 3);
  const files = (job.files || []).slice(0, 5);
  const dt = new Date(job.created_at).toLocaleString('zh-CN');
  const retention = state.status?.artifact_retention_days || 90;

  let eventsHtml = '';
  if (expanded && job._events) {
    eventsHtml = '<div class="job-events">' + (job._events.map(e => '<div class="job-event ' + (e.level === 'error' ? 'error' : e.level === 'success' ? 'success' : '') + '">[' + e.created_at.slice(0,19) + '] ' + escHtml(e.message) + '</div>').join('')) + '</div>';
  }

  let filesHtml = '';
  if (expanded && files.length) {
    filesHtml = '<div class="files-list">' + files.map(f => '<div class="file-item"><span>' + escHtml(f.name || f.relative_path) + '</span>' + (f.download_url ? '<a href="' + escHtml(f.download_url) + '" target="_blank">下载加密包</a>' : '') + '</div>').join('') + '</div>' +
      '<div class="retention-hint">文件为加密 zip，密码为您设置的下载密码。Artifacts 将在 ' + retention + ' 天后过期。</div>';
  }

  // Succeeded jobs with full progress: show download button
  let downloadBtn = '';
  if (job.status === 'succeeded' && pct >= 100 && job.files && job.files.length && job.files[0].download_url) {
    downloadBtn = '<a href="' + escHtml(job.files[0].download_url) + '" target="_blank" style="display:inline-block;background:var(--blue);color:#fff;padding:5px 14px;border-radius:6px;font-size:12px;font-weight:500;margin-top:8px;text-decoration:none">下载加密包</a>';
  }

  // Cancel button for queued/running jobs
  var cancelBtn = '';
  if (job.status === 'queued' || job.status === 'running') {
    cancelBtn = '<button class="btn-ghost btn-sm" style="margin-top:8px;color:var(--red);border-color:var(--red)" onclick="event.stopPropagation();cancelJob(\\'' + job.id + '\\')">取消任务</button>';
  }

  return '<div class="job-item' + (expanded ? ' expanded' : '') + '" data-job-id="' + job.id + '" onclick="toggleJob(this,&quot;' + job.id + '&quot;)">' +
    '<div class="job-header">' +
      '<span class="job-id">' + job.id.slice(0,20) + '...</span>' +
      '<span class="job-title">' + escHtml(job.current_title || (job.urls && job.urls[0]) || '-') + '</span>' +
      '<span class="job-status ' + cls + '">' + label + '</span>' +
    '</div>' +
    '<div class="job-meta"><span>' + dt + '</span><span>线程: ' + job.thread + '</span><span>进度: ' + job.completed_parts + '/' + job.total_parts + '</span></div>' +
    downloadBtn + cancelBtn +
    (pct > 0 ? '<div class="job-progress-bar"><div class="job-progress-fill" style="width:' + pct + '%"></div></div>' : '') +
    (errors.length ? '<div style="font-size:12px;color:#dc2626;margin-top:6px">' + errors.join('; ') + '</div>' : '') +
    '<div class="job-detail">' + filesHtml + eventsHtml + '</div>' +
  '</div>';
}

async function toggleJob(el, jobId) {
  if (el.classList.contains('expanded')) { el.classList.remove('expanded'); return; }
  document.querySelectorAll('.job-item').forEach(j => j.classList.remove('expanded'));
  el.classList.add('expanded');
  const d = await api('/dingtalk/jobs/' + jobId + '?include=events');
  if (!d || !d.job) return;
  d.job._events = d.events || [];
  const jobs = state.recentJobs || [];
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx >= 0) jobs[idx] = d.job;
  const newEl = document.createElement('div');
  newEl.outerHTML = jobRowHTML(d.job, true);
  el.outerHTML = newEl.outerHTML;
}

async function loadJobs(page) {
  state.currentPage = page;
  const d = await api('/dingtalk/jobs?page=' + page + '&page_size=10');
  if (!d) return;
  state.jobs = d.jobs || [];
  state.totalPages = d.total_pages || 1;
  const html = state.jobs.length
    ? state.jobs.map(j => jobRowHTML(j, false)).join('')
    : '<div style="color:var(--muted);padding:20px;text-align:center">暂无任务记录</div>';
  document.getElementById('jobs-list').innerHTML = html;
  renderPagination(d.page, d.total_pages);
}

function renderPagination(page, total) {
  const p = document.getElementById('jobs-pagination');
  if (total <= 1) { p.innerHTML = ''; return; }
  p.innerHTML =
    '<button class="btn-ghost" onclick="loadJobs(' + (page - 1) + ')" ' + (page <= 1 ? 'disabled' : '') + '>上一页</button>' +
    '<span class="page-info">第 ' + page + ' / ' + total + ' 页</span>' +
    '<button class="btn-ghost" onclick="loadJobs(' + (page + 1) + ')" ' + (page >= total ? 'disabled' : '') + '>下一页</button>';
}

async function submitJob() {
  const urlInput = document.getElementById('url-input');
  const threadInput = document.getElementById('thread-input');
  const errEl = document.getElementById('submit-error');
  const infoEl = document.getElementById('submit-info');
  errEl.style.display = 'none';
  infoEl.style.display = 'none';

  const url = urlInput.value.trim();
  if (!url) { errEl.textContent = '请输入 URL'; errEl.style.display = 'block'; return; }

  const thread = parseInt(threadInput.value) || state.status?.default_thread || 100;

  errEl.style.display = 'none';
  infoEl.textContent = '正在提交...';
  infoEl.style.display = 'block';

  const d = await api('/dingtalk/jobs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, thread, create_video_list: true })
  });

  if (!d) return;
  if (d.error) {
    errEl.textContent = d.error;
    errEl.style.display = 'block';
    infoEl.style.display = 'none';
  } else {
    infoEl.textContent = '任务已提交！';
    urlInput.value = '';
    threadInput.value = '';
    await loadStatus();
    showOverview();
    setTimeout(() => { infoEl.style.display = 'none'; }, 3000);
  }
}

async function cancelJob(jobId) {
  if (!confirm('确定要取消此任务吗？')) return;
  var d = await api('/dingtalk/jobs/' + jobId + '/cancel', { method: 'POST' });
  if (d && d.ok) {
    toast('任务已取消', 'info');
    await loadStatus();
    showOverview();
  } else {
    toast(d?.error || '取消失败', 'err');
  }
}

// ── Password page ──
async function renderPasswordPage() {
  const d = await api('/dingtalk/zip-password');
  const hasPw = d && d.has_password;
  document.getElementById('pw-state').innerHTML = hasPw
    ? '<span class="status-badge badge-ok">已设置</span>'
    : '<span class="status-badge badge-no">未设置</span>';
  document.getElementById('pw-input').value = '';
  document.getElementById('pw-confirm').value = '';
  document.getElementById('pw-msg').textContent = '';
}

async function savePassword() {
  const pw = document.getElementById('pw-input').value;
  const pw2 = document.getElementById('pw-confirm').value;
  const msg = document.getElementById('pw-msg');
  if (pw.length < 4) { msg.textContent = '密码至少4位'; msg.style.color = '#dc2626'; return; }
  if (pw !== pw2) { msg.textContent = '两次输入不一致'; msg.style.color = '#dc2626'; return; }
  const d = await api('/dingtalk/zip-password', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password: pw }) });
  if (d && d.ok) {
    msg.textContent = '密码已保存'; msg.style.color = '#166534';
    state.status.has_zip_password = true;
    document.getElementById('pw-state').innerHTML = '<span class="status-badge badge-ok">已设置</span>';
    document.getElementById('pw-input').value = '';
    document.getElementById('pw-confirm').value = '';
  } else {
    msg.textContent = d.error || '保存失败'; msg.style.color = '#dc2626';
  }
}

// ── QR Login ──
async function startQRLogin() {
  const errEl = document.getElementById('qr-error');
  const statusEl = document.getElementById('qr-status');
  const btn = document.getElementById('btn-start-qr');
  errEl.style.display = 'none';
  btn.disabled = true;
  statusEl.textContent = '正在启动登录流程...';

  const d = await api('/dingtalk/login-workflow', { method: 'POST' });
  btn.disabled = false;
  if (!d) return;
  if (d.error) { errEl.textContent = d.error; errEl.style.display = 'block'; return; }

  state.loginSession = d.login_session;
  if (d.login_session) {
    var qrSrc = getQRImageSrc(d.login_session);
    if (qrSrc) {
      document.getElementById('qr-image').className = 'qr-image has-code';
      document.getElementById('qr-image').innerHTML = '<img src="' + qrSrc + '" alt="QR Code" />';
      statusEl.textContent = '二维码已生成，请在钉钉 App 中扫码';
    } else {
      document.getElementById('qr-image').className = 'qr-image';
      statusEl.textContent = '已启动，请等待 GitHub Actions 生成二维码（约10-30秒）...';
      document.getElementById('qr-image').innerHTML = '<div class="qr-spinner"></div>';
    }
  } else {
    document.getElementById('qr-image').className = 'qr-image';
    statusEl.textContent = '已启动，请等待 GitHub Actions 生成二维码（约10-30秒）...';
    document.getElementById('qr-image').innerHTML = '<div class="qr-spinner"></div>';
  }
}

async function checkLoginStatus() {
  const errEl = document.getElementById('qr-error');
  errEl.style.display = 'none';

  const d = await api('/dingtalk/login-workflow');
  if (!d) return;
  state.loginSession = d.login_session;

  if (!d.login_session) {
    document.getElementById('qr-image').innerHTML = '';
    document.getElementById('qr-status').textContent = '暂无登录会话，点击「获取二维码」开始';
    return;
  }

  const s = d.login_session;
  var qrSrc = getQRImageSrc(s);
  if (qrSrc) {
    document.getElementById('qr-image').innerHTML = '<img src="' + qrSrc + '" alt="QR Code" />';
  } else if (s.qr_url) {
    document.getElementById('qr-image').innerHTML = '<div style="padding:40px;color:var(--muted)">二维码已生成，请在钉钉 App 中打开链接扫码</div>';
  }

  const statusMap = {
    pending: ['等待 GitHub Actions 启动（约 30 秒）', 'badge-warn'],
    qr_ready: ['二维码已生成，请扫码（5 分钟内有效）', 'badge-info'],
    completed: ['登录成功，Cookies 已保存', 'badge-ok'],
    failed: ['登录失败', 'badge-no'],
  };
  const [label, cls] = statusMap[s.status] || ['未知状态: ' + s.status, 'badge-warn'];
  var statusHtml = '<span class="status-badge ' + cls + '">' + label + '</span>';
  if (s.status === 'failed' && s.error_message) {
    statusHtml += '<div style="font-size:11px;color:var(--muted);margin-top:4px">' + escHtml(s.error_message) + '</div>';
  }
  if (s.status === 'qr_ready' && s.created_at) {
    var elapsed = Math.floor((Date.now() - new Date(s.created_at).getTime()) / 1000);
    var remaining = Math.max(0, 300 - elapsed);
    statusHtml += '<div style="font-size:11px;color:var(--muted);margin-top:4px">剩余时间: ' + formatSeconds(remaining) + '</div>';
    if (remaining <= 0) {
      statusHtml += '<div style="margin-top:8px;color:var(--amber);font-size:13px">二维码已过期</div>';
      statusHtml += '<div style="margin-top:6px"><button class="btn-ghost btn-sm" onclick="startQRLogin()">重新获取二维码</button></div>';
    }
  }
  document.getElementById('qr-status').innerHTML = statusHtml;

  if (s.status === 'completed') {
    await loadStatus();
    await loadLegal();
    if (state.status && state.status.cookies_ready && state.status.legal_accepted) {
      closeGate();
      showOverview();
      errEl.textContent = '登录成功！Cookies 已保存。';
      errEl.style.display = 'block';
      errEl.style.background = '#dcfce7';
      errEl.style.color = '#166534';
    }
  }
}

function renderLegal() {
  const legal = state.legalState || {};
  const accepted = legal.accepted;
  const html =
    '<div style="margin-bottom:20px"><span class="status-badge ' + (accepted ? 'badge-ok' : 'badge-warn') + '">' + (accepted ? '已接受 v' + legal.version : '未接受') + '</span></div>' +
    '<div class="legal-text">' + renderMarkdown(state.legalText) + '</div>' +
    (!accepted ? '<div class="checkbox-row"><input type="checkbox" id="legal-check"><label for="legal-check">我已阅读并接受上述所有条款</label></div><button onclick="acceptLegalFromPage()">接受条款</button>' : '<div style="color:#166534;font-size:14px">✓ 您已接受当前版本条款</div>');
  document.getElementById('legal-content').innerHTML = html;
}

async function acceptLegalFromPage() {
  const check = document.getElementById('legal-check');
  if (check && !check.checked) { alert('请先勾选接受条款'); return; }
  const d = await api('/dingtalk/legal', { method: 'POST' });
  if (d && d.ok) {
    state.legalState.accepted = true;
    renderLegal();
  }
}

// admin
async function loadAdmin() {
  if (!state.user || !state.user.isSudo) return;
  const html =
    '<div class="admin-section">' +
      '<h2>用户管理</h2>' +
      '<div id="admin-users"></div>' +
    '</div>' +
    '<div class="admin-section">' +
      '<h2>条款管理</h2>' +
      '<div id="admin-legal"></div>' +
    '</div>';
  document.getElementById('admin-content').innerHTML = html;
  loadAdminUsers();
  loadAdminLegal();
}

async function loadAdminUsers() {
  const d = await api('/dingtalk/admin/users');
  if (!d) return;
  const users = d.users || [];
  const html = '<table class="admin-table"><thead><tr><th>用户名</th><th>Sudo</th><th>条款</th><th>Cookie</th><th>密码</th><th>任务</th><th>注册</th></tr></thead><tbody>' +
    users.map(u => '<tr>' +
      '<td>' + escHtml(u.username) + '</td>' +
      '<td>' + (u.is_sudo ? '✓' : '—') + '</td>' +
      '<td>' + (u.legal_accepted ? '✓' : '—') + '</td>' +
      '<td>' + (u.cookies_ready ? '<span class="status-badge badge-ok">是</span>' : '<span class="status-badge badge-no">否</span>') + '</td>' +
      '<td>' + (u.has_zip_password ? '<span class="status-badge badge-ok">是</span>' : '<span class="status-badge badge-no">否</span>') + '</td>' +
      '<td>' + u.total_jobs + '</td>' +
      '<td>' + (u.created_at ? new Date(u.created_at).toLocaleString('zh-CN') : '-') + '</td>' +
    '</tr>').join('') + '</tbody></table>';
  document.getElementById('admin-users').innerHTML = html || '<div style="color:var(--muted)">暂无数据</div>';
}

async function loadAdminLegal() {
  const d = await api('/dingtalk/admin/legal');
  if (!d) return;
  const html =
    '<div style="margin-bottom:12px;font-size:13px;color:var(--muted)">当前版本: <strong>' + escHtml(d.version || '') + '</strong></div>' +
    '<textarea id="admin-legal-text" class="admin-textarea" placeholder="输入条款内容...">' + escHtml(d.text || '') + '</textarea>' +
    '<div style="margin-top:10px"><button onclick="saveAdminLegal()">保存条款</button></div>' +
    '<div id="admin-legal-msg" style="margin-top:8px"></div>';
  document.getElementById('admin-legal').innerHTML = html;
}

async function saveAdminLegal() {
  const text = document.getElementById('admin-legal-text').value;
  const msg = document.getElementById('admin-legal-msg');
  if (!text.trim()) { msg.textContent = '条款内容不能为空'; msg.style.color = '#dc2626'; return; }
  const d = await api('/dingtalk/admin/legal', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
  if (d && d.ok) {
    msg.textContent = '条款已保存，所有用户需要重新接受';
    msg.style.color = '#166534';
  } else {
    msg.textContent = d.error || '保存失败';
    msg.style.color = '#dc2626';
  }
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
  if (b < 1024 * 1024 * 1024) return (b / (1024 * 1024)).toFixed(1) + ' MB';
  return (b / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatSeconds(s) {
  if (s < 60) return s + ' 秒';
  var m = Math.floor(s / 60);
  var sec = s % 60;
  return m + ' 分 ' + sec + ' 秒';
}

function updateSidebarBadges() {
  var s = state.status || {};
  var leg = state.legalState || {};
  var setBadge = function(id, done) {
    var el = document.getElementById(id);
    if (el) { el.className = 'nav-step-badge ' + (done ? 'ok' : 'no'); el.textContent = done ? '已完成' : '未完成'; }
  };
  var setDot = function(id, done) {
    var el = document.getElementById(id);
    if (el) { el.className = 'nav-dot' + (done ? ' done' : ''); el.textContent = done ? '✓' : el.getAttribute('data-step') || el.textContent; }
  };
  setBadge('badge-legal', leg.accepted);
  setBadge('badge-qr', s.cookies_ready);
  setBadge('badge-pw', s.has_zip_password);
  setDot('step-legal', leg.accepted);
  setDot('step-qr', s.cookies_ready);
  setDot('step-pw', s.has_zip_password);
}

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
      html += '<h3 style="font-size:15px;font-weight:600;margin:16px 0 8px">' + escHtml(line.replace(/^##\\s+/, '')) + '</h3>';
    } else if (/^-\\s/.test(line)) {
      if (!inList) { html += '<ul style="padding-left:20px;margin:4px 0">'; inList = true; }
      html += '<li style="margin-bottom:4px">' + escHtml(line.replace(/^-\\s+/, '')) + '</li>';
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

function toast(msg, type) {
  type = type || 'info';
  var container = document.getElementById('toast-container');
  var el = document.createElement('div');
  el.className = 'toast ' + type;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(function() { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(function() { el.remove(); }, 300); }, 3000);
}

function getQRImageSrc(session) {
  if (session.qr_image_base64) return 'data:image/png;base64,' + session.qr_image_base64;
  return null;
}

function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    await loadStatus();
    const s = state.status;
    if (!s) return;
    if (document.getElementById('page-overview').classList.contains('active')) {
      renderMetrics();
      renderStatus();
      if (state.recentJobs) {
        const r = await api('/dingtalk/jobs?page_size=5');
        if (r && JSON.stringify(r.jobs) !== JSON.stringify(state.recentJobs)) loadRecentJobs();
      }
    }
    // Auto-refresh expanded job details
    var expanded = document.querySelector('.job-item.expanded');
    if (expanded) {
      var jobId = expanded.getAttribute('data-job-id');
      if (jobId) {
        var d = await api('/dingtalk/jobs/' + jobId + '?include=events');
        if (d && d.job && (d.job.status === 'running' || d.job.status === 'queued')) {
          d.job._events = d.events || [];
          var newEl = document.createElement('div');
          newEl.outerHTML = jobRowHTML(d.job, true);
          expanded.outerHTML = newEl.outerHTML;
        }
      }
    }
    if (s.cookies_ready && s.legal_accepted && s.has_zip_password) {
      // All gates passed, stop polling sidebar badges
    }
    if (document.getElementById('page-qr').classList.contains('active') && state.loginSession) {
      if (state.loginSession.status !== 'completed') await checkLoginStatus();
    }
  }, 3000);
}

// Hash-based routing
function handleHashChange() {
  var hash = location.hash.replace(/^#/, '') || 'overview';
  var validPages = ['overview', 'legal', 'qr', 'password', 'jobs', 'admin'];
  if (validPages.indexOf(hash) < 0) hash = 'overview';
  // Only navigate if user is authenticated (state.user exists) and gates are passed
  if (state.user && state.status) {
    var s = state.status;
    var allGates = s.legal_accepted && s.cookies_ready && s.has_zip_password;
    if (hash === 'overview' || hash === 'jobs') {
      if (allGates) navigate(hash);
    } else {
      navigate(hash);
    }
  }
}
window.addEventListener('hashchange', handleHashChange);
window.addEventListener('popstate', function() {
  var hash = location.hash.replace(/^#/, '') || 'overview';
  navigate(hash);
});

checkAuth();
</script>
</body>
</html>`;