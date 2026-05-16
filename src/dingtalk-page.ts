export const DINGTALK_PAGE = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>钉钉视频下载 — S-MAIL</title>
<style>
:root{--bg:#f8fafc;--panel:#fff;--text:#0f172a;--muted:#64748b;--blue:#2563eb;--line:#e2e8f0;--font:"Google Sans","PingFang SC",system-ui,sans-serif;--radius:10px}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;display:flex}
a{color:var(--blue);text-decoration:none}

/* sidebar */
#sidebar{width:220px;min-height:100vh;background:var(--panel);border-right:1px solid var(--line);padding:20px 0;display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
.brand{display:flex;align-items:center;gap:10px;padding:0 20px 20px;border-bottom:1px solid var(--line);margin-bottom:16px}
.brand-dot{width:28px;height:28px;background:var(--blue);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700}
.brand-text{font-size:15px;font-weight:600;color:var(--text)}
.nav{margin-bottom:4px}
.nav-item{padding:10px 20px;cursor:pointer;font-size:14px;color:var(--muted);transition:all .15s;display:flex;align-items:center;gap:8px;border-left:3px solid transparent}
.nav-item:hover{color:var(--text);background:#f1f5f9}
.nav-item.active{color:var(--blue);background:#eff6ff;border-left-color:var(--blue);font-weight:500}
.nav-item.admin-only{display:none}
.nav-item.admin-only.show{display:flex}
.sidebar-footer{padding:20px;margin-top:auto;border-top:1px solid var(--line)}
.sidebar-footer a{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--muted)}
.sidebar-footer a:hover{color:var(--blue)}

/* main */
#main{flex:1;padding:32px;overflow:hidden}
.page{display:none}
.page.active{display:block}

h1{font-size:20px;font-weight:600;margin-bottom:24px}

/* cards */
.card{background:var(--panel);border-radius:16px;border:1px solid var(--line);padding:24px;margin-bottom:20px}
.card h2{font-size:15px;font-weight:600;margin-bottom:16px;color:var(--text)}

/* metric cards */
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:24px}
.metric{background:var(--panel);border-radius:16px;border:1px solid var(--line);padding:20px}
.metric .label{font-size:12px;color:var(--muted);margin-bottom:6px}
.metric .value{font-size:28px;font-weight:700;color:var(--text)}
.metric .sub{font-size:12px;color:var(--muted);margin-top:4px}

/* form elements */
input[type="text"],input[type="password"],input[type="number"],select,textarea{
width:100%;border:1px solid var(--line);border-radius:10px;padding:10px 14px;font:inherit;font-size:14px;outline:none;transition:border-color .15s,box-shadow .15s;background:#fff;color:var(--text)
}
input:focus,select:focus,textarea:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
button{background:var(--blue);color:#fff;border:none;border-radius:10px;padding:10px 20px;font:inherit;font-size:14px;font-weight:500;cursor:pointer;transition:background .15s}
button:hover{background:#1d4ed8}
button:disabled{background:#94a3b8;cursor:not-allowed}
.btn-ghost{background:transparent;color:var(--muted);border:1px solid var(--line)}
.btn-ghost:hover{background:#f8fafc;color:var(--text)}

/* overview */
.overview-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.status-row{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:14px}
.status-row:last-child{border-bottom:none}
.status-label{color:var(--muted);width:100px}
.status-val{flex:1;font-weight:500}
.status-badge{padding:2px 10px;border-radius:20px;font-size:12px;font-weight:500}
.badge-ok{background:#dcfce7;color:#166534}
.badge-no{background:#fee2e2;color:#991b1b}
.badge-warn{background:#fef9c3;color:#854d0e}
.badge-info{background:#dbeafe;color:#1e40af}

/* url form */
.url-form{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
.url-form input{flex:1;min-width:200px}

/* jobs */
.job-item{border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:12px;cursor:pointer;transition:border-color .15s}
.job-item:hover{border-color:var(--blue)}
.job-item.expanded{border-color:var(--blue);background:#f8fafc}
.job-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
.job-id{font-size:12px;color:var(--muted);font-family:monospace}
.job-title{font-size:14px;font-weight:500;flex:1;margin:0 12px}
.job-status{padding:2px 10px;border-radius:20px;font-size:12px;font-weight:500}
.job-meta{display:flex;gap:16px;font-size:13px;color:var(--muted)}
.job-detail{display:none;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)}
.job-item.expanded .job-detail{display:block}
.job-progress-bar{height:6px;background:#e2e8f0;border-radius:3px;margin:10px 0;overflow:hidden}
.job-progress-fill{height:100%;background:var(--blue);border-radius:3px;transition:width .3s}
.job-events{margin-top:10px;max-height:200px;overflow-y:auto;font-size:12px;font-family:monospace}
.job-event{padding:3px 0;color:var(--muted)}
.job-event.error{color:#dc2626}
.job-event.success{color:#166534}
.files-list{margin-top:8px}
.file-item{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px}
.file-item a{color:var(--blue);font-size:13px}
.retention-hint{font-size:12px;color:var(--muted);margin-top:6px}

/* pagination */
.pagination{display:flex;align-items:center;gap:8px;margin-top:16px}
.pagination button{padding:6px 14px;font-size:13px}
.page-info{font-size:13px;color:var(--muted);margin:0 8px}

/* qr */
.qr-box{display:flex;flex-direction:column;align-items:center;gap:16px;padding:20px}
.qr-image{border:1px solid var(--line);border-radius:12px;padding:8px;background:#fff;min-width:200px;min-height:200px;display:flex;align-items:center;justify-content:center}
.qr-image img{max-width:180px;max-height:180px}
.qr-status{font-size:14px;color:var(--muted);text-align:center}
.login-actions{display:flex;gap:12px;justify-content:center}

/* legal */
.legal-text{background:#f8fafc;border-radius:10px;padding:20px;font-size:13px;line-height:1.8;max-height:400px;overflow-y:auto;white-space:pre-wrap;margin-bottom:20px}
.checkbox-row{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.checkbox-row input[type="checkbox"]{width:18px;height:18px;accent-color:var(--blue)}

/* password section */
.pw-form{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:12px}
.pw-form input{flex:1;min-width:160px;max-width:280px}
.pw-status{font-size:13px;color:var(--muted)}

/* gate */
#gate{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center}
#gate.show{display:flex}
.gate-card{background:#fff;border-radius:16px;padding:32px;max-width:500px;width:90%;max-height:90vh;overflow-y:auto}
.gate-card h2{font-size:18px;margin-bottom:8px}
.gate-card p{font-size:14px;color:var(--muted);margin-bottom:20px}
.gate-state{display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px;text-align:center}
.gate-icon{font-size:48px}
.gate-icon.ok{color:#16a34a}
.gate-icon.no{color:#dc2626}
.gate-icon.warn{color:#ca8a04}

/* admin */
.admin-section{margin-bottom:32px}
.admin-section h2{font-size:16px;font-weight:600;margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--line)}
.admin-table{width:100%;border-collapse:collapse;font-size:13px}
.admin-table th{text-align:left;padding:8px 12px;background:#f8fafc;color:var(--muted);font-weight:500;border-bottom:1px solid var(--line)}
.admin-table td{padding:10px 12px;border-bottom:1px solid var(--line)}
.admin-table tr:hover td{background:#f8fafc}
.admin-textarea{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px;font:inherit;font-size:13px;min-height:200px;resize:vertical;margin-top:8px}
.loading{text-align:center;padding:40px;color:var(--muted)}
.error-msg{color:#dc2626;font-size:13px;padding:8px 12px;background:#fee2e2;border-radius:8px;margin-bottom:16px}
.info-msg{color:#166534;font-size:13px;padding:8px 12px;background:#dcfce7;border-radius:8px;margin-bottom:16px}
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
    <div class="nav-item active" data-page="overview" onclick="navigate('overview')">仪表盘</div>
    <div class="nav-item" data-page="legal" onclick="navigate('legal')">条款确认</div>
    <div class="nav-item" data-page="qr" onclick="navigate('qr')">钉钉验证</div>
    <div class="nav-item" data-page="password" onclick="navigate('password')">下载密码</div>
    <div class="nav-item" data-page="jobs" onclick="navigate('jobs')">详细记录</div>
    <div class="nav-item admin-only" data-page="admin" onclick="navigate('admin')">管理页</div>
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
        <input type="text" id="url-input" placeholder="输入视频页面 URL，支持批量（每行一个）" />
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
        <div id="qr-image" class="qr-image"></div>
        <div id="qr-status" class="qr-status">点击开始获取二维码</div>
        <div class="login-actions">
          <button id="btn-start-qr" onclick="startQRLogin()">获取二维码</button>
          <button class="btn-ghost" onclick="checkLoginStatus()">刷新状态</button>
        </div>
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

<!-- gate overlay -->
<div id="gate">
  <div class="gate-card">
    <h2 id="gate-title">正在进行</h2>
    <p id="gate-desc">请稍候...</p>
    <div id="gate-body" class="gate-state"></div>
    <div style="margin-top:16px;text-align:right"><button id="gate-btn" onclick="gateAction()" style="display:none">继续</button></div>
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
  if (state.status && !state.status.legal_accepted) { showGate('legal'); return; }
  if (state.status && !state.status.cookies_ready) { showGate('qr'); return; }
  if (state.status && !state.status.has_zip_password) { showGate('password'); return; }
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
  g.classList.add('show');
  btn.style.display = 'none';

  if (type === 'legal') {
    title.textContent = '请先阅读并接受条款';
    desc.textContent = '继续使用钉钉视频下载服务前，请接受以下免责声明';
    body.innerHTML = '<div class="legal-text" style="max-height:300px;font-size:12px">' + escHtml(state.legalText) + '</div><div class="checkbox-row"><input type="checkbox" id="gate-check"><label for="gate-check">我已阅读并接受上述所有条款</label></div>';
    btn.style.display = 'inline-block';
    btn.onclick = acceptLegal;
  } else if (type === 'qr') {
    title.textContent = '请完成钉钉验证';
    desc.textContent = '需要通过二维码登录获取有效的 Cookies 才能提交任务';
    body.innerHTML = '<div class="gate-icon warn">⚠</div><div>您尚未完成钉钉验证，请前往「钉钉验证」页面扫码登录</div><div style="margin-top:12px"><button onclick="closeGate();navigate(&quot;qr&quot;)">前往验证 →</button></div>';
  } else if (type === 'password') {
    title.textContent = '请设置下载密码';
    desc.textContent = '下载的视频将打包为加密 zip，需要设置解压密码';
    body.innerHTML = '<div class="gate-icon warn">🔑</div><div style="margin-bottom:12px">请先设置下载密码</div>' +
      '<input type="password" id="gate-pw" placeholder="输入密码（至少4位）" style="margin-bottom:8px" />' +
      '<input type="password" id="gate-pw2" placeholder="确认密码" style="margin-bottom:8px" />' +
      '<div id="gate-pw-err" style="color:#dc2626;font-size:13px;margin-bottom:8px"></div>';
    btn.style.display = 'inline-block';
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
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.querySelector('.nav-item[data-page="' + page + '"]').classList.add('active');
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
  const rows = [
    ['Cookie状态', s.cookies_ready ? '<span class="status-badge badge-ok">已就绪</span>' : '<span class="status-badge badge-no">未就绪</span>'],
    ['条款接受', legal.accepted ? '<span class="status-badge badge-ok">已接受</span>' : '<span class="status-badge badge-no">未接受</span>'],
    ['下载密码', s.has_zip_password ? '<span class="status-badge badge-ok">已设置</span>' : '<span class="status-badge badge-no">未设置</span>'],
    ['当前用户', state.user ? state.user.username : '-'],
    ['管理员', state.user && state.user.isSudo ? '<span class="status-badge badge-ok">是</span>' : '<span class="status-badge badge-warn">否</span>'],
    ['Artifact保留', s.artifact_retention_days ? s.artifact_retention_days + ' 天' : '-'],
    ['默认线程', s.default_thread || '-'],
  ];
  document.getElementById('status-rows').innerHTML = rows.map(([l, v]) => '<div class="status-row"><span class="status-label">' + l + '</span><span class="status-val">' + v + '</span></div>').join('');
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

  // Succeeded jobs: show download button even without expanding
  let downloadBtn = '';
  if (job.status === 'succeeded' && job.files && job.files.length && job.files[0].download_url) {
    downloadBtn = ' <a href="' + escHtml(job.files[0].download_url) + '" target="_blank" style="font-size:12px;color:var(--blue)">下载</a>';
  }

  return '<div class="job-item' + (expanded ? ' expanded' : '') + '" onclick="toggleJob(this,&quot;' + job.id + '&quot;)">' +
    '<div class="job-header">' +
      '<span class="job-id">' + job.id.slice(0,20) + '...</span>' +
      '<span class="job-title">' + escHtml(job.current_title || (job.urls && job.urls[0]) || '-') + downloadBtn + '</span>' +
      '<span class="job-status ' + cls + '">' + label + '</span>' +
    '</div>' +
    '<div class="job-meta"><span>' + dt + '</span><span>线程: ' + job.thread + '</span><span>进度: ' + job.completed_parts + '/' + job.total_parts + '</span></div>' +
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

  const raw = urlInput.value.trim();
  if (!raw) { errEl.textContent = '请输入 URL'; errEl.style.display = 'block'; return; }

  const urls = raw.split(/\\n/).map(u => u.trim()).filter(Boolean);
  const thread = parseInt(threadInput.value) || state.status?.default_thread || 100;

  errEl.style.display = 'none';
  infoEl.textContent = '正在提交...';
  infoEl.style.display = 'block';

  const d = await api('/dingtalk/jobs', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ urls, thread, create_video_list: true })
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
      document.getElementById('qr-image').innerHTML = '<img src="' + qrSrc + '" alt="QR Code" />';
      statusEl.textContent = '二维码已生成，请在钉钉 App 中扫码';
    } else {
      statusEl.textContent = '已启动，请等待 GitHub Actions 生成二维码（约10-30秒）...';
      document.getElementById('qr-image').innerHTML = '<div style="padding:40px;color:var(--muted)">加载中...</div>';
    }
  } else {
    statusEl.textContent = '已启动，请等待 GitHub Actions 生成二维码（约10-30秒）...';
    document.getElementById('qr-image').innerHTML = '<div style="padding:40px;color:var(--muted)">加载中...</div>';
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
    pending: ['等待启动', 'badge-warn'],
    qr_ready: ['二维码已就绪', 'badge-info'],
    completed: ['登录完成', 'badge-ok'],
    failed: ['登录失败: ' + (s.error_message || ''), 'badge-no'],
  };
  const [label, cls] = statusMap[s.status] || [s.status, 'badge-warn'];
  document.getElementById('qr-status').innerHTML = '<span class="status-badge ' + cls + '">' + label + '</span>';

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
    '<div class="legal-text">' + escHtml(state.legalText) + '</div>' +
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

function escHtml(s) {
  if (s == null) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
    if (s.cookies_ready && s.legal_accepted && s.has_zip_password) return;
    if (document.getElementById('page-qr').classList.contains('active') && state.loginSession) {
      if (state.loginSession.status !== 'completed') await checkLoginStatus();
    }
  }, 5000);
}

checkAuth();
</script>
</body>
</html>`;