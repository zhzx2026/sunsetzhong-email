type AppPage = "overview" | "jobs" | "scan" | "login" | "account" | "legal" | "admin";

function renderLocaleSwitcher(): string {
  return `
      <div id="locale-switcher" class="locale-switcher">
        <button id="locale-trigger" class="locale-trigger" type="button" aria-haspopup="menu" aria-expanded="false">
          <span id="locale-current-flag" class="locale-flag">🇨🇳</span>
          <span id="locale-current-label" class="locale-label">ZH</span>
          <span class="locale-caret">⌄</span>
        </button>
        <div id="locale-menu" class="locale-menu hidden">
          <button class="locale-option active" type="button" data-locale-option="zh">
            <span class="locale-flag">🇨🇳</span>
            <span data-i18n="locale.zh">中文</span>
            <span class="locale-check">✓</span>
          </button>
          <button class="locale-option" type="button" data-locale-option="en">
            <span class="locale-flag">🇺🇸</span>
            <span data-i18n="locale.en">English</span>
            <span class="locale-check">✓</span>
          </button>
        </div>
      </div>`;
}

function renderSidebar(): string {
  return `
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-head">
          <a class="sidebar-brand" data-page-link href="/overview">
            <span class="brand-mark">G</span>
            <span class="brand-copy">
              <strong data-i18n="brand.name">GoDingtalk</strong>
              <span data-i18n="brand.subtitle">Public Control Console</span>
            </span>
          </a>
        </div>

        <nav class="sidebar-nav">
          <a id="nav-overview" class="nav-item" data-page-link href="/overview"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="2"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="2"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2"/></svg></span><span class="nav-label" data-i18n="nav.overview">仪表盘</span></a>
          <a id="nav-legal" class="nav-item" data-page-link href="/legal"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 4h12v16H6z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg></span><span class="nav-label" data-i18n="nav.legal">条款确认</span></a>
          <a id="nav-scan" class="nav-item" data-page-link href="/scan"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/><path d="M9 12h6M12 9v6"/></svg></span><span class="nav-label" data-i18n="nav.scan">钉钉验证</span></a>
          <a id="nav-jobs" class="nav-item" data-page-link href="/jobs"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M6 4h12M6 10h12M6 16h12"/><circle cx="4" cy="4" r="1.5"/><circle cx="4" cy="10" r="1.5"/><circle cx="4" cy="16" r="1.5"/></svg></span><span class="nav-label" data-i18n="nav.jobs">详细记录</span></a>
          <a id="nav-account" class="nav-item" data-page-link href="/account"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.8-3.4 5-5 8-5s6.2 1.6 8 5"/></svg></span><span class="nav-label" data-i18n="nav.account">账号设置</span></a>
          <a id="nav-admin" class="nav-item hidden" data-page-link href="/admin"><span class="nav-icon"><svg viewBox="0 0 24 24" fill="none"><path d="M12 3l8 4v5c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V7z"/><path d="M9.5 12l2 2 3-3"/></svg></span><span class="nav-label" data-i18n="nav.admin">管理页</span></a>
        </nav>

        <div class="sidebar-foot">
          <div class="sidebar-ghost" data-i18n="sidebar.publicMode">公益模式</div>
          <button id="sidebar-toggle-btn" type="button" class="sidebar-toggle"><span class="sidebar-toggle-icon">〈〈</span><span class="sidebar-toggle-label" data-i18n="sidebar.collapse">收起</span></button>
        </div>
      </aside>`;
}

function renderTopbar(titleKey: string, subtitleKey: string): string {
  return `
      <header class="topbar">
        <div class="topbar-copy">
          <div class="eyebrow" data-i18n="topbar.consoleEyebrow">Public Console</div>
          <h1 data-i18n="${titleKey}">-</h1>
          <p data-i18n="${subtitleKey}">-</p>
        </div>

        <div class="topbar-actions">
          <div id="top-status-chip" class="top-chip top-chip-status" data-i18n="topbar.status.waitLegal">待同意条款</div>
          <div id="top-public-chip" class="top-chip top-chip-public" data-i18n="topbar.publicMode">公益模式</div>
          ${renderLocaleSwitcher()}
          <div id="user-menu-wrap" class="user-menu-wrap hidden">
            <button id="user-menu-trigger" class="profile-trigger" type="button" aria-haspopup="menu" aria-expanded="false">
              <span id="avatar-fallback" class="avatar-fallback">U</span>
              <span class="profile-copy">
                <strong id="profile-name">未登录</strong>
                <span id="profile-role" data-i18n="role.user">用户</span>
              </span>
              <span class="profile-caret">⌄</span>
            </button>
            <div id="user-menu" class="user-menu hidden">
              <div class="user-menu-head">
                <div id="user-menu-name" class="user-menu-name">未登录</div>
                <div id="user-menu-role" class="user-menu-role" data-i18n="role.user">user</div>
              </div>
              <div class="user-menu-list">
                <a id="user-menu-account-link" data-page-link href="/account" class="user-menu-link" data-i18n="nav.account">账号设置</a>
                <a id="user-menu-scan-link" data-page-link href="/scan" class="user-menu-link" data-i18n="nav.scan">钉钉验证</a>
                <a id="user-menu-jobs-link" data-page-link href="/jobs" class="user-menu-link" data-i18n="nav.jobs">详细记录</a>
                <a id="user-menu-admin-link" data-page-link href="/admin" class="user-menu-link hidden" data-i18n="nav.admin">管理页</a>
                <button id="topbar-logout-btn" class="user-menu-link user-menu-action" type="button" data-i18n="auth.logout">退出登录</button>
              </div>
            </div>
          </div>
        </div>
      </header>`;
}

function renderMetricCards(): string {
  return `
      <section class="metric-grid">
        <article class="metric-card">
          <div class="metric-icon mint">✓</div>
          <div class="metric-copy">
            <span data-i18n="metric.cookies.label">钉钉验证</span>
            <strong id="stat-cookies">-</strong>
            <small data-i18n="metric.cookies.help">当前状态</small>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-icon blue">⌁</div>
          <div class="metric-copy">
            <span data-i18n="metric.total.label">总任务</span>
            <strong id="stat-total">0</strong>
            <small data-i18n="metric.total.help">全部下载任务</small>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-icon green">↗</div>
          <div class="metric-copy">
            <span data-i18n="metric.running.label">进行中</span>
            <strong id="stat-running">0</strong>
            <small data-i18n="metric.running.help">队列 + 运行中</small>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-icon purple">◆</div>
          <div class="metric-copy">
            <span data-i18n="metric.success.label">已完成</span>
            <strong id="stat-success">0</strong>
            <small data-i18n="metric.success.help">已完成下载</small>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-icon red">!</div>
          <div class="metric-copy">
            <span data-i18n="metric.failed.label">失败任务</span>
            <strong id="stat-failed">0</strong>
            <small data-i18n="metric.failed.help">需要处理</small>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-icon yellow">7</div>
          <div class="metric-copy">
            <span data-i18n="metric.week.label">近 7 天创建</span>
            <strong id="stat-created-week">0</strong>
            <small data-i18n="metric.week.help">滚动统计</small>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-icon blue">%</div>
          <div class="metric-copy">
            <span data-i18n="metric.rate.label">完成率</span>
            <strong id="stat-completion-rate">0%</strong>
            <small data-i18n="metric.rate.help">最近任务</small>
          </div>
        </article>
        <article class="metric-card">
          <div class="metric-icon mint">⏱</div>
          <div class="metric-copy">
            <span data-i18n="metric.cookieTime.label">最近验证</span>
            <strong id="stat-cookie-time">-</strong>
            <small data-i18n="metric.cookieTime.help">更新时间</small>
          </div>
        </article>
      </section>`;
}

function renderLoginPage(): string {
  return `
      <section class="login-shell">
        <div class="auth-toolbar">
          ${renderLocaleSwitcher()}
        </div>

        <section class="panel login-brand-panel">
          <div class="auth-brand-mark">G</div>
          <div class="eyebrow" data-i18n="auth.eyebrow">Public Control Console</div>
          <h1 data-i18n="auth.heroTitle">钉钉回放下载控制台</h1>
          <p data-i18n="auth.heroSubtitle">沿用当前业务结构，但视觉语言切到更接近 Sub2API 的后台风格。登录后按顺序完成条款确认、钉钉验证与下载提交。</p>
          <div class="login-points">
            <div class="login-point"><strong>1</strong><span data-i18n="auth.pointLegal">同意当前条款</span></div>
            <div class="login-point"><strong>2</strong><span data-i18n="auth.pointScan">二维码登录获取钉钉验证</span></div>
            <div class="login-point"><strong>3</strong><span data-i18n="auth.pointDownload">提交回放链接开始下载</span></div>
          </div>
        </section>

        <section class="panel login-form-panel">
          <div class="panel-head">
            <div>
              <div class="eyebrow" data-i18n="auth.formEyebrow">Secure Access</div>
              <h2 class="panel-title" data-i18n="auth.panelTitle">进入控制台</h2>
            </div>
          </div>
          <div class="auth-tabs" role="tablist" aria-label="登录注册切换">
            <button id="auth-tab-login" class="auth-tab active" type="button" data-i18n="auth.loginTab">登录</button>
            <button id="auth-tab-register" class="auth-tab" type="button" data-i18n="auth.registerTab">注册</button>
          </div>

          <section id="login-form-panel" class="auth-form-panel">
            <div class="field">
              <label for="login-username" data-i18n="auth.usernameLabel">用户名</label>
              <input id="login-username" data-i18n-placeholder="auth.usernamePlaceholder" placeholder="输入用户名" autocomplete="username" />
            </div>
            <div class="field">
              <label for="login-password" data-i18n="auth.passwordLabel">密码</label>
              <input id="login-password" type="password" data-i18n-placeholder="auth.passwordPlaceholder" placeholder="输入密码" autocomplete="current-password" />
            </div>
            <div class="muted form-note" data-i18n="auth.loginHint">登录后需完成条款确认与扫码验证</div>
            <div class="actions">
              <button id="login-btn" class="button-link primary" type="button" data-i18n="auth.loginAction">登录</button>
            </div>
          </section>

          <section id="register-form-panel" class="auth-form-panel hidden">
            <div class="field">
              <label for="register-username" data-i18n="auth.usernameLabel">用户名</label>
              <input id="register-username" data-i18n-placeholder="auth.registerUsernamePlaceholder" placeholder="至少 3 位" autocomplete="username" />
            </div>
            <div class="field">
              <label for="register-password" data-i18n="auth.passwordLabel">密码</label>
              <input id="register-password" type="password" data-i18n-placeholder="auth.registerPasswordPlaceholder" placeholder="至少 6 位" autocomplete="new-password" />
            </div>
            <div class="field">
              <label for="register-password-confirm" data-i18n="auth.passwordConfirmLabel">确认密码</label>
              <input id="register-password-confirm" type="password" data-i18n-placeholder="auth.passwordConfirmPlaceholder" placeholder="再次输入密码" autocomplete="new-password" />
            </div>
            <p id="register-card-hint" class="muted form-note" data-i18n="auth.registerHintOpen">注册成功后将直接进入条款确认</p>
            <div class="actions">
              <button id="register-btn" class="button-link" type="button" data-i18n="auth.registerAction">注册</button>
            </div>
          </section>
        </section>
      </section>`;
}

function renderOverviewPage(): string {
  return `
      ${renderTopbar("page.overview.title", "page.overview.subtitle")}

      ${renderMetricCards()}

      <section class="toolbar-card">
        <div class="toolbar-group">
          <strong data-i18n="overview.rangeLabel">时间范围</strong>
          <button id="overview-range-btn" type="button" class="select-chip" data-i18n="overview.range7">近 7 天</button>
        </div>
        <div class="toolbar-group">
          <strong data-i18n="overview.granularityLabel">粒度</strong>
          <button id="overview-granularity-btn" type="button" class="select-chip" data-i18n="overview.granularityDay">按天</button>
        </div>
      </section>

      <section class="analytics-grid">
        <section class="chart-card">
          <div class="section-head">
            <h2 data-i18n="overview.statusDistribution">任务状态分布</h2>
          </div>
          <div class="chart-shell donut-layout">
            <div id="overview-donut" class="donut"></div>
            <div id="overview-donut-table" class="mini-table"><div class="empty" data-i18n="common.loading">正在加载...</div></div>
          </div>
        </section>

        <section class="chart-card">
          <div class="section-head">
            <h2 id="overview-trend-title" data-i18n="overview.trend7">近 7 天任务趋势</h2>
          </div>
          <div class="chart-shell trend-layout">
            <div class="trend-legend">
              <span><i class="legend-dot blue"></i><span data-i18n="overview.legend.created">创建</span></span>
              <span><i class="legend-dot green"></i><span data-i18n="overview.legend.done">完成</span></span>
              <span><i class="legend-dot red"></i><span data-i18n="overview.legend.failed">失败</span></span>
            </div>
            <div id="overview-trend" class="trend-chart"><div class="empty" data-i18n="common.loading">正在加载...</div></div>
          </div>
        </section>
      </section>

      <section class="overview-grid">
        <section class="work-card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="overview.submitEyebrow">Submit</div>
              <h2 data-i18n="overview.submitTitle">提交下载</h2>
            </div>
          </div>

          <div id="overview-gate" class="gate-card">
            <div id="overview-gate-title" class="gate-title" data-i18n="overview.gate.needLegalTitle">请先同意条款</div>
            <p id="overview-gate-copy" class="muted" data-i18n="overview.gate.needLegalCopy">完成条款确认后，才可以继续完成钉钉验证。</p>
            <div class="actions">
              <a id="overview-gate-link" data-page-link href="/legal" class="button-link primary" data-i18n="overview.gate.needLegalAction">去同意条款</a>
            </div>
          </div>

          <div id="overview-download-form" class="hidden">
            <div class="field">
              <label for="urls" data-i18n="overview.urlsLabel">回放链接</label>
              <textarea id="urls" data-i18n-placeholder="overview.urlsPlaceholder" placeholder="粘贴回放链接，每行一个"></textarea>
            </div>
            <div class="actions">
              <button id="create-job-btn" class="button-link primary" type="button" data-i18n="overview.createJob">开始下载</button>
              <button id="refresh-btn" class="button-link" type="button" data-i18n="common.refresh">刷新状态</button>
            </div>
          </div>
        </section>

        <aside class="overview-side-stack">
          <section class="card">
            <div class="section-head">
              <div>
                <div class="eyebrow" data-i18n="overview.recentEyebrow">Recent</div>
                <h2 data-i18n="overview.recentTitle">近 10 条记录</h2>
              </div>
              <a data-page-link href="/jobs" class="mini-link" data-i18n="nav.jobs">详细记录</a>
            </div>
            <div id="recent-records" class="recent-list"><div class="empty" data-i18n="common.noRecords">暂无记录</div></div>
          </section>
        </aside>
      </section>`;
}

function renderLegalPage(): string {
  return `
      ${renderTopbar("page.legal.title", "page.legal.subtitle")}

      <section class="dual-grid">
        <section id="legal-step" class="card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="legal.stepEyebrow">Step 1</div>
              <h2 data-i18n="legal.title">同意当前条款</h2>
            </div>
            <span id="legal-badge" class="badge warn" data-i18n="status.notDone">未完成</span>
          </div>
          <div id="legal-state" class="notice hidden"></div>
          <div id="legal-version-meta" class="meta-line"></div>
          <label id="legal-checkbox-row" class="checkbox-row">
            <input id="legal-confirm-check" type="checkbox" />
            <span data-i18n="legal.checkbox">我已阅读并同意条款</span>
          </label>
          <div class="actions">
            <button id="accept-legal-btn" class="button-link primary" type="button" disabled data-i18n="legal.acceptAction">同意条款</button>
          </div>
        </section>

        <section class="card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="legal.documentEyebrow">Document</div>
              <h2 data-i18n="legal.documentTitle">条款全文</h2>
            </div>
          </div>
          <div id="legal-text" class="legal-text"><div class="empty" data-i18n="legal.loading">正在加载条款...</div></div>
        </section>
      </section>`;
}

function renderScanPage(): string {
  return `
      ${renderTopbar("page.scan.title", "page.scan.subtitle")}

      ${renderMetricCards()}

      <section class="scan-grid">
        <section class="scan-main-card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="scan.stepEyebrow">Step 2</div>
              <h2 data-i18n="scan.title">二维码登录</h2>
            </div>
            <span id="cookie-badge" class="badge warn" data-i18n="status.notDone">未完成</span>
          </div>
          <div id="cookie-state" class="notice hidden"></div>
          <div id="cookie-meta" class="meta-line"></div>
          <div class="actions">
            <button id="start-login-workflow-btn" class="button-link primary" type="button" data-i18n="scan.startAction">启动二维码登录</button>
          </div>
          <div id="login-box" class="scan-box hidden">
            <div id="login-status" class="scan-title" data-i18n="scan.generating">正在生成二维码</div>
            <div id="login-hint" class="muted" data-i18n="scan.defaultHint">二维码出现后，请使用钉钉扫码登录。</div>
            <div class="scan-qr-frame">
              <img id="login-qr-image" class="qr-image hidden" alt="登录二维码" data-i18n-alt="scan.qrAlt" />
            </div>
          </div>
        </section>

        <aside class="scan-side-card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="scan.flowEyebrow">Flow</div>
              <h2 data-i18n="scan.nextTitle">下一步</h2>
            </div>
          </div>
          <div class="scan-steps">
            <div class="scan-step"><strong>1</strong><span data-i18n="scan.step1">等待二维码出现</span></div>
            <div class="scan-step"><strong>2</strong><span data-i18n="scan.step2">使用钉钉扫码登录</span></div>
            <div class="scan-step"><strong>3</strong><span data-i18n="scan.step3">验证成功后可以继续下载，也可随时重新扫码</span></div>
          </div>
        </aside>
      </section>`;
}

function renderJobsPage(): string {
  return `
      ${renderTopbar("page.jobs.title", "page.jobs.subtitle")}

      ${renderMetricCards()}

      <section class="records-card">
        <div class="records-toolbar">
          <div class="records-size-group">
            <span class="muted" data-i18n="jobs.pageSizeLabel">每页显示</span>
            <div class="records-size-buttons">
              <button class="size-chip active" data-page-size="10" type="button">10</button>
              <button class="size-chip" data-page-size="20" type="button">20</button>
              <button class="size-chip" data-page-size="50" type="button">50</button>
            </div>
          </div>
          <div id="jobs-pagination-summary" class="muted" data-i18n="jobs.pageOne">第 1 页</div>
        </div>
        <div id="jobs-detail-list" class="records-list"><div class="empty" data-i18n="jobs.loading">正在加载记录...</div></div>
        <div class="records-footer">
          <button id="jobs-prev-btn" class="button-link" type="button" data-i18n="jobs.prev">上一页</button>
          <div id="jobs-page-indicator" class="muted">1 / 1</div>
          <button id="jobs-next-btn" class="button-link" type="button" data-i18n="jobs.next">下一页</button>
        </div>
      </section>`;
}

function renderAccountPage(): string {
  return `
      ${renderTopbar("page.account.title", "page.account.subtitle")}

      <section class="dual-grid">
        <section class="card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="account.profileEyebrow">Profile</div>
              <h2 data-i18n="account.profileTitle">当前账号</h2>
            </div>
          </div>
          <p id="account-summary" class="muted" data-i18n="common.loading">正在加载...</p>
          <div class="actions">
            <button id="topbar-logout-btn-inline" class="button-link" type="button" data-i18n="auth.logout">退出登录</button>
          </div>
        </section>

        <section class="card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="account.securityEyebrow">Security</div>
              <h2 data-i18n="account.securityTitle">修改密码</h2>
            </div>
          </div>
          <div class="field">
            <label for="current-password" data-i18n="account.currentPassword">当前密码</label>
            <input id="current-password" type="password" data-i18n-placeholder="account.currentPasswordPlaceholder" placeholder="当前密码" autocomplete="current-password" />
          </div>
          <div class="field">
            <label for="new-password" data-i18n="account.newPassword">新密码</label>
            <input id="new-password" type="password" data-i18n-placeholder="account.newPasswordPlaceholder" placeholder="至少 6 位" autocomplete="new-password" />
          </div>
          <div class="field">
            <label for="confirm-new-password" data-i18n="account.confirmPassword">确认新密码</label>
            <input id="confirm-new-password" type="password" data-i18n-placeholder="account.confirmPasswordPlaceholder" placeholder="再次输入新密码" autocomplete="new-password" />
          </div>
          <div class="actions">
            <button id="change-password-btn" class="button-link primary" type="button" data-i18n="account.savePassword">保存新密码</button>
          </div>
        </section>
      </section>`;
}

function renderAdminPage(): string {
  return `
      ${renderTopbar("page.admin.title", "page.admin.subtitle")}

      <section class="admin-grid">
        <section class="card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="admin.storageEyebrow">R2 Storage</div>
              <h2 data-i18n="admin.storageTitle">R2 文件</h2>
            </div>
          </div>
          <div class="storage-toolbar">
            <div class="field storage-search">
              <label for="admin-storage-prefix" data-i18n="admin.storagePrefix">对象前缀</label>
              <input id="admin-storage-prefix" data-i18n-placeholder="admin.storagePrefixPlaceholder" placeholder="例如 dedup/" />
            </div>
            <div class="actions">
              <button id="admin-storage-refresh-btn" class="button-link primary" type="button" data-i18n="admin.refreshStorage">刷新文件</button>
            </div>
          </div>
          <div id="admin-storage-meta" class="meta-line"></div>
          <div id="admin-storage-list" class="storage-list"><div class="empty" data-i18n="admin.storageLoading">正在加载 R2 文件...</div></div>
          <div class="actions">
            <button id="admin-storage-more-btn" class="button-link hidden" type="button" data-i18n="admin.loadMore">加载更多</button>
          </div>
        </section>

        <section class="card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="admin.usersEyebrow">Users</div>
              <h2 data-i18n="admin.usersTitle">需要处理的用户</h2>
            </div>
          </div>
          <div id="admin-user-meta" class="meta-line"></div>
          <div id="admin-users" class="admin-users"><div class="empty" data-i18n="admin.usersLoading">正在加载用户数据...</div></div>
        </section>

        <section class="card">
          <div class="section-head">
            <div>
              <div class="eyebrow" data-i18n="admin.legalEyebrow">Legal</div>
              <h2 data-i18n="admin.legalTitle">条款管理</h2>
            </div>
          </div>
          <div class="field">
            <label for="admin-legal-text" data-i18n="admin.legalField">条款内容</label>
            <textarea id="admin-legal-text" class="large-textarea" data-i18n-placeholder="admin.legalPlaceholder" placeholder="输入新的条款正文"></textarea>
          </div>
          <div class="actions">
            <button id="save-legal-btn" class="button-link primary" type="button" data-i18n="admin.saveLegal">保存条款</button>
          </div>
          <div id="admin-legal-meta" class="meta-line"></div>
        </section>
      </section>`;
}

function renderPageBody(page: AppPage): string {
  switch (page) {
    case "login":
      return renderLoginPage();
    case "legal":
      return renderLegalPage();
    case "scan":
      return renderScanPage();
    case "jobs":
      return renderJobsPage();
    case "account":
      return renderAccountPage();
    case "admin":
      return renderAdminPage();
    case "overview":
    default:
      return renderOverviewPage();
  }
}

export function renderApp(_appOrigin: string, page: AppPage): string {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="data:," />
    <title>GoDingtalk</title>
    <style>
      :root {
        --bg: #f9fafb;
        --sidebar-bg: #ffffff;
        --surface: #ffffff;
        --surface-soft: #f8fafc;
        --line: #e5e7eb;
        --line-strong: #d1d5db;
        --text: #111827;
        --muted: #6b7280;
        --accent: #12a594;
        --accent-strong: #0e8b7d;
        --accent-soft: rgba(18,165,148,0.10);
        --blue: #3b82f6;
        --green: #10b981;
        --purple: #8b5cf6;
        --yellow: #f59e0b;
        --red: #ef4444;
        --warn: #d97706;
        --shadow: 0 8px 20px rgba(15, 23, 42, 0.05);
        --radius-xl: 24px;
        --radius-lg: 16px;
        --radius-md: 12px;
        --radius-sm: 10px;
        --sidebar-width: 256px;
        --sidebar-collapsed-width: 72px;
      }
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background: var(--bg);
        color: var(--text);
        font-family: "SF Pro Text", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
      }
      body { padding: 0; overflow-x: hidden; }
      a { color: inherit; }
      button, input, textarea { font: inherit; }
      .hidden { display: none !important; }
      body.page-ready .shell { opacity: 1; transform: none; }
      body.page-leaving .shell { opacity: 0; transform: translateY(8px); }
      .shell {
        min-height: 100vh;
        display: grid;
        grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
        opacity: 0;
        transform: translateY(6px);
        transition: opacity 180ms ease, transform 220ms ease;
      }
      body.sidebar-collapsed .shell {
        grid-template-columns: var(--sidebar-collapsed-width) minmax(0, 1fr);
      }
      .sidebar {
        padding: 0;
        background: var(--sidebar-bg);
        border-right: 1px solid var(--line);
        display: grid;
        grid-template-rows: auto 1fr auto;
        gap: 0;
      }
      .sidebar-head {
        display: flex;
        align-items: center;
        min-height: 64px;
        padding: 0 18px;
        border-bottom: 1px solid #f3f4f6;
      }
      .sidebar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0;
        text-decoration: none;
        width: 100%;
      }
      .brand-mark {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        border: 1px solid rgba(14, 139, 125, 0.24);
        background: linear-gradient(135deg, #0a57de, #14b8a6);
        color: white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 900;
      }
      .brand-copy strong {
        display: block;
        font-size: 18px;
        line-height: 1;
      }
      .brand-copy span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 10px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      body.sidebar-collapsed .brand-copy,
      body.sidebar-collapsed .nav-label,
      body.sidebar-collapsed .sidebar-toggle-label {
        display: none;
      }
      .sidebar-nav {
        display: grid;
        gap: 6px;
        align-content: start;
        padding: 12px;
      }
      .nav-item {
        min-height: 42px;
        border-radius: 12px;
        display: grid;
        grid-template-columns: 22px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        padding: 0 12px;
        color: #374151;
        font-size: 14px;
        font-weight: 600;
        text-decoration: none;
        border: 1px solid transparent;
        transition: background 140ms ease, border-color 140ms ease, color 140ms ease;
      }
      .nav-item.active {
        background: #e9f8f4;
        border-color: #d2efe8;
        color: var(--accent);
      }
      .nav-item:hover {
        background: #f5f8fc;
        border-color: #e3e8f0;
      }
      .nav-icon {
        width: auto;
        height: auto;
        border: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
      }
      .nav-icon svg {
        width: 18px;
        height: 18px;
      }
      .nav-icon svg * {
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      }
      body.sidebar-collapsed .nav-item {
        grid-template-columns: 1fr;
        justify-items: center;
        padding: 0;
      }
      .sidebar-foot {
        display: grid;
        gap: 8px;
        border-top: 1px solid #f3f4f6;
        padding: 12px 12px 14px;
      }
      .sidebar-ghost {
        min-height: 38px;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: #ffffff;
        color: #475467;
        font-size: 13px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .sidebar-toggle {
        min-height: 38px;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #475467;
        font-size: 13px;
        font-weight: 700;
      }
      .sidebar-toggle-icon {
        font-size: 11px;
        letter-spacing: -0.16em;
      }
      .main {
        padding: 18px 20px 24px;
        background:
          linear-gradient(180deg, #f4fbfb 0%, #f0f7f7 52%, #eff5f7 100%);
      }
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
        margin: -18px -20px 16px;
        padding: 12px 20px;
        min-height: 64px;
        border-bottom: 1px solid #e5e7eb;
        background: rgba(255, 255, 255, 0.84);
        backdrop-filter: blur(8px);
      }
      .topbar-copy .eyebrow {
        display: none;
      }
      .topbar-copy h1 {
        margin: 0;
        font-size: 18px;
        line-height: 1.22;
        letter-spacing: -0.02em;
        font-weight: 600;
      }
      .topbar-copy p {
        margin: 3px 0 0;
        color: var(--muted);
        font-size: 11px;
        line-height: 1.35;
      }
      .topbar-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .icon-chip {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: #f8fafc;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #667085;
      }
      .icon-chip svg {
        width: 15px;
        height: 15px;
      }
      .icon-chip svg path {
        stroke: currentColor;
        stroke-width: 1.8;
        stroke-linecap: round;
        stroke-linejoin: round;
        fill: none;
      }
      .top-chip {
        min-height: 34px;
        padding: 0 12px;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: #f8fafc;
        display: inline-flex;
        align-items: center;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
      }
      .top-chip-light {
        color: #374151;
      }
      .top-chip-money {
        color: var(--accent);
      }
      .user-menu-wrap {
        position: relative;
      }
      .profile-trigger {
        min-height: 40px;
        padding: 0 12px 0 0;
        border-radius: 999px;
        border: 0;
        background: transparent;
        color: var(--text);
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .profile-trigger:hover {
        background: rgba(255,255,255,0.76);
      }
      .avatar-fallback {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        border: 1px solid var(--line-strong);
        background: linear-gradient(135deg, #0f766e, #14b8a6);
        color: white;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
      }
      .profile-copy {
        display: grid;
        text-align: left;
        line-height: 1.15;
      }
      .profile-copy strong {
        font-size: 14px;
      }
      .profile-copy span {
        font-size: 11px;
        color: var(--muted);
      }
      .profile-caret {
        color: #94a3b8;
        font-size: 14px;
      }
      .user-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 240px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.98);
        box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
        padding: 14px;
        z-index: 30;
      }
      .user-menu-head {
        padding: 4px 4px 12px;
        border-bottom: 1px solid var(--line);
      }
      .user-menu-name {
        font-weight: 800;
      }
      .user-menu-role {
        margin-top: 6px;
        color: var(--muted);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      .user-menu-list {
        display: grid;
        gap: 8px;
        margin-top: 12px;
      }
      .user-menu-link {
        min-height: 40px;
        border-radius: 12px;
        padding: 0 12px;
        text-decoration: none;
        display: flex;
        align-items: center;
        color: var(--text);
        border: 1px solid transparent;
        background: transparent;
      }
      .user-menu-link:hover {
        background: var(--surface-soft);
        border-color: rgba(207, 216, 227, 0.8);
      }
      .user-menu-action {
        justify-content: flex-start;
        width: 100%;
      }
      .metric-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-top: 14px;
      }
      .metric-card {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        padding: 14px 16px;
        display: grid;
        grid-template-columns: 44px minmax(0, 1fr);
        gap: 12px;
        align-items: center;
        min-height: 96px;
      }
      .metric-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 15px;
      }
      .metric-icon.mint { background: rgba(16,185,129,0.14); color: var(--green); }
      .metric-icon.blue { background: rgba(59,130,246,0.14); color: var(--blue); }
      .metric-icon.green { background: rgba(34,197,94,0.14); color: var(--green); }
      .metric-icon.purple { background: rgba(139,92,246,0.14); color: var(--purple); }
      .metric-copy span {
        display: block;
        color: var(--muted);
        font-size: 12px;
      }
      .metric-copy strong {
        display: block;
        margin-top: 3px;
        font-size: 27px;
        line-height: 1.1;
      }
      .metric-copy small {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: var(--muted);
      }
      .toolbar-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 14px;
        margin-top: 14px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
      }
      .toolbar-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .toolbar-group strong {
        font-size: 15px;
      }
      .select-chip,
      .button-link,
      .mini-link,
      .size-chip {
        min-height: 36px;
        padding: 0 12px;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: #ffffff;
        color: #374151;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
      }
      .button-link.primary {
        border-color: transparent;
        background: linear-gradient(180deg, var(--accent) 0%, var(--accent-strong) 100%);
        color: white;
      }
      .button-link:hover,
      .mini-link:hover,
      .size-chip:hover,
      .select-chip:hover {
        border-color: var(--line-strong);
        background: #f8fafc;
      }
      .button-link:disabled,
      .size-chip:disabled {
        opacity: 0.55;
        cursor: not-allowed;
        box-shadow: none;
      }
      .select-chip.active {
        border-color: rgba(18,165,148,0.35);
        background: rgba(18,165,148,0.08);
        color: var(--accent-strong);
      }
      .analytics-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: 14px;
        margin-top: 14px;
      }
      .chart-card,
      .card,
      .records-card {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        padding: 16px;
      }
      .section-head {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 12px;
      }
      .section-head h2 {
        margin: 6px 0 0;
        font-size: 18px;
      }
      .mini-table {
        display: grid;
        gap: 10px;
      }
      .donut-layout {
        display: grid;
        grid-template-columns: 210px minmax(0, 1fr);
        gap: 16px;
        align-items: center;
        margin-top: 12px;
        min-height: 252px;
      }
      .donut {
        width: 170px;
        height: 170px;
        border-radius: 999px;
        background: conic-gradient(var(--blue) 0 88%, var(--green) 88% 96%, var(--red) 96% 100%);
        display: grid;
        place-items: center;
        margin: 0 auto;
      }
      .donut::after {
        content: "";
        width: 80px;
        height: 80px;
        border-radius: 999px;
        background: white;
      }
      .mini-table-head,
      .mini-table-row {
        display: grid;
        grid-template-columns: 1.15fr 0.7fr 0.7fr 0.8fr;
        gap: 10px;
        font-size: 13px;
      }
      .mini-table-head {
        color: var(--muted);
        font-weight: 700;
      }
      .mini-table-row {
        min-height: 32px;
        align-items: center;
        padding: 0 8px;
        border-radius: 8px;
        background: var(--surface-soft);
        border: 1px solid #edf2f7;
      }
      .trend-layout {
        margin-top: 12px;
        display: grid;
        gap: 12px;
        min-height: 252px;
      }
      .trend-legend {
        display: flex;
        gap: 14px;
        flex-wrap: wrap;
        font-size: 12px;
        color: var(--muted);
      }
      .legend-dot {
        display: inline-block;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        margin-right: 6px;
      }
      .legend-dot.blue { background: var(--blue); }
      .legend-dot.green { background: var(--green); }
      .legend-dot.red { background: var(--red); }
      .trend-chart {
        min-height: 228px;
        border: 1px solid #eef2f7;
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(22,163,163,0.05), transparent 70%), #ffffff;
        overflow: hidden;
        position: relative;
      }
      .trend-chart::before {
        content: "";
        position: absolute;
        inset: 0;
        background:
          linear-gradient(to right, transparent 0, transparent calc(33.333% - 1px), rgba(211,218,228,0.7) calc(33.333% - 1px), rgba(211,218,228,0.7) 33.333%, transparent 33.333%) 0 0 / 100% 100%,
          linear-gradient(to top, rgba(211,218,228,0.55) 1px, transparent 1px) 0 0 / 100% 22%;
        pointer-events: none;
      }
      .trend-chart svg {
        width: 100%;
        height: 100%;
        display: block;
        position: relative;
        z-index: 1;
      }
      .overview-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.15fr) 360px;
        gap: 14px;
        margin-top: 14px;
      }
      .overview-side-stack {
        display: grid;
        gap: 14px;
      }
      .work-card,
      .scan-main-card,
      .scan-side-card {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        padding: 16px;
      }
      .field {
        display: grid;
        gap: 8px;
        margin-top: 16px;
      }
      .field > label {
        font-size: 12px;
        color: var(--muted);
        font-weight: 700;
      }
      input, textarea {
        width: 100%;
        border: 1px solid var(--line-strong);
        background: #ffffff;
        color: var(--text);
        border-radius: var(--radius-md);
        padding: 12px 14px;
      }
      textarea {
        min-height: 160px;
        resize: vertical;
        line-height: 1.65;
      }
      input:focus, textarea:focus {
        outline: none;
        border-color: rgba(22, 163, 163, 0.42);
        box-shadow: 0 0 0 4px rgba(22, 163, 163, 0.10);
      }
      .gate-card {
        margin-top: 12px;
        padding: 12px;
        border-radius: 12px;
        border: 1px dashed rgba(22,163,163,0.28);
        background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(246,252,252,0.98));
      }
      .gate-title {
        font-size: 16px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .recent-list {
        display: grid;
        gap: 8px;
        margin-top: 10px;
      }
      .recent-row {
        min-height: 72px;
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) auto;
        gap: 10px;
        align-items: center;
        padding: 0 14px;
        border-radius: 14px;
        background: #f8fafc;
        border: 1px solid var(--line);
        transition: background 120ms ease, border-color 120ms ease;
      }
      .recent-row:hover {
        background: #ffffff;
        border-color: var(--line-strong);
      }
      .recent-icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: rgba(22,163,163,0.14);
        color: var(--accent);
        font-size: 14px;
        font-weight: 900;
      }
      .recent-main {
        min-width: 0;
      }
      .recent-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
        font-weight: 700;
      }
      .recent-subtitle {
        margin-top: 2px;
        color: var(--muted);
        font-size: 12px;
      }
      .recent-side {
        text-align: right;
      }
      .recent-amount {
        font-size: 13px;
        font-weight: 800;
        color: var(--green);
      }
      .recent-amount.ok { color: #16a34a; }
      .recent-amount.warn { color: #dc2626; }
      .recent-amount.active { color: #2563eb; }
      .recent-meta {
        margin-top: 2px;
        color: var(--muted);
        font-size: 11px;
      }
      .legal-layout,
      .scan-grid {
        display: grid;
        grid-template-columns: minmax(320px, 0.72fr) minmax(0, 1.28fr);
        gap: 16px;
        margin-top: 16px;
      }
      .checkbox-row {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        margin-top: 16px;
        line-height: 1.7;
      }
      .checkbox-row input {
        width: 18px;
        height: 18px;
        margin-top: 3px;
      }
      .notice {
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 14px;
        line-height: 1.6;
        border: 1px solid transparent;
        font-size: 13px;
      }
      .notice.ok {
        background: rgba(16,185,129,0.08);
        color: var(--green);
        border-color: rgba(16,185,129,0.16);
      }
      .notice.warn {
        background: rgba(245,158,11,0.08);
        color: var(--warn);
        border-color: rgba(245,158,11,0.16);
      }
      .notice.error {
        background: rgba(239,68,68,0.08);
        color: var(--red);
        border-color: rgba(239,68,68,0.16);
      }
      .meta-line, .muted {
        color: var(--muted);
        line-height: 1.6;
        font-size: 12px;
      }
      .legal-text {
        display: grid;
        gap: 10px;
        line-height: 1.68;
      }
      .legal-text h3 {
        margin: 0;
        font-size: 16px;
      }
      .legal-text p {
        margin: 0;
      }
      .scan-box {
        margin-top: 16px;
        border-radius: 14px;
        border: 1px solid rgba(22,163,163,0.18);
        background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(245,252,252,0.95));
        padding: 14px;
      }
      .scan-title {
        font-size: 20px;
        font-weight: 800;
        letter-spacing: -0.02em;
      }
      .scan-qr-frame {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 250px;
        margin-top: 14px;
        border-radius: 14px;
        background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
        border: 1px dashed rgba(22,163,163,0.24);
      }
      .qr-image {
        display: block;
        width: 220px;
        max-width: 100%;
        border-radius: 12px;
        border: 1px solid var(--line);
        background: #fff;
      }
      .scan-steps {
        display: grid;
        gap: 12px;
      }
      .scan-step {
        display: grid;
        grid-template-columns: 34px minmax(0, 1fr);
        gap: 12px;
        align-items: start;
      }
      .scan-step strong {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 12px;
      }
      .records-card {
        margin-top: 16px;
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
        padding: 16px;
      }
      .records-toolbar,
      .records-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        flex-wrap: wrap;
      }
      .records-size-group {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .records-size-buttons {
        display: flex;
        gap: 8px;
      }
      .size-chip {
        min-height: 36px;
      }
      .size-chip.active {
        border-color: rgba(22,163,163,0.24);
        background: rgba(22,163,163,0.08);
        color: var(--accent);
      }
      .records-list {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }
      .job-row {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--surface-soft);
        overflow: hidden;
      }
      .job-row-main {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 96px 120px 72px auto;
        gap: 10px;
        align-items: center;
        min-height: 48px;
        padding: 0 12px;
        cursor: pointer;
      }
      .job-row-main:hover {
        background: #f3faf9;
      }
      .job-row-title {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 600;
      }
      .job-row-meta {
        color: var(--muted);
        font-size: 12px;
        white-space: nowrap;
      }
      .job-row-detail {
        border-top: 1px solid var(--line);
        padding: 14px;
        background: #ffffff;
      }
      .job-row-detail-grid {
        display: grid;
        gap: 10px;
      }
      .job-inline-files {
        display: grid;
        gap: 8px;
      }
      .job-inline-file {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: var(--surface-soft);
        padding: 8px 10px;
      }
      .job-inline-errors {
        color: var(--red);
        line-height: 1.7;
      }
      .dual-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
      .admin-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
        margin-top: 16px;
      }
      .admin-users,
      .storage-list {
        display: grid;
        gap: 10px;
      }
      .admin-user,
      .storage-item {
        border: 1px solid var(--line);
        border-radius: 14px;
        background: var(--surface-soft);
        padding: 14px;
      }
      .admin-user-name,
      .storage-name {
        font-size: 15px;
        font-weight: 800;
      }
      .storage-toolbar {
        display: flex;
        align-items: end;
        gap: 12px;
        flex-wrap: wrap;
      }
      .storage-search {
        flex: 1 1 220px;
      }
      .storage-head {
        display: flex;
        align-items: start;
        justify-content: space-between;
        gap: 12px;
      }
      .storage-key {
        color: var(--muted);
        font-size: 11px;
        word-break: break-all;
      }
      .storage-meta-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 12px;
        color: var(--muted);
        font-size: 12px;
      }
      .storage-meta-grid strong {
        color: var(--text);
      }
      .storage-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .storage-tag {
        display: inline-flex;
        min-height: 24px;
        align-items: center;
        padding: 0 8px;
        border-radius: 999px;
        background: rgba(22,163,163,0.08);
        color: var(--accent);
        font-size: 11px;
        font-weight: 700;
      }
      .empty {
        padding: 24px 12px;
        text-align: center;
        color: var(--muted);
        font-size: 13px;
      }
      @media (max-width: 1280px) {
        .metric-grid,
        .analytics-grid,
        .overview-grid,
        .scan-grid,
        .dual-grid,
        .admin-grid {
          grid-template-columns: 1fr 1fr;
        }
        .metric-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .overview-grid,
        .scan-grid,
        .dual-grid,
        .admin-grid {
          grid-template-columns: 1fr;
        }
        .donut-layout {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 980px) {
        .sidebar {
          grid-template-rows: auto;
        }
        .sidebar-nav {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        body.sidebar-collapsed .shell {
          grid-template-columns: 1fr;
        }
        body.sidebar-collapsed .nav-label,
        body.sidebar-collapsed .brand-copy,
        body.sidebar-collapsed .sidebar-toggle-label {
          display: unset;
        }
      }
      @media (max-width: 720px) {
        .metric-grid,
        .sidebar-nav {
          grid-template-columns: 1fr;
        }
        .main {
          padding-left: 14px;
          padding-right: 14px;
        }
        .topbar,
        .toolbar-card,
        .records-toolbar,
        .records-footer,
        .section-head,
        .panel-head,
        .storage-head {
          flex-direction: column;
          align-items: start;
        }
        .job-row-main,
        .recent-row {
          grid-template-columns: 1fr;
          min-height: auto;
          padding-top: 10px;
          padding-bottom: 10px;
        }
      }
      body {
        position: relative;
        background: linear-gradient(135deg, #f5f7fb 0%, #eef8f5 48%, #f4f6fb 100%);
      }
      body::before,
      body::after {
        content: "";
        position: fixed;
        inset: auto;
        pointer-events: none;
        z-index: 0;
        border-radius: 999px;
        filter: blur(70px);
      }
      body::before {
        width: 360px;
        height: 360px;
        top: -90px;
        right: -100px;
        background: rgba(16, 185, 129, 0.15);
      }
      body::after {
        width: 420px;
        height: 420px;
        left: -120px;
        bottom: -140px;
        background: rgba(59, 130, 246, 0.12);
      }
      body[data-page="login"]::before {
        width: 420px;
        height: 420px;
        top: -80px;
        right: -60px;
      }
      body[data-page="login"]::after {
        width: 520px;
        height: 520px;
        left: -160px;
        bottom: -160px;
      }
      .shell,
      .main,
      .sidebar,
      .topbar,
      .panel,
      .card,
      .records-card,
      .chart-card,
      .work-card,
      .scan-main-card,
      .scan-side-card {
        position: relative;
        z-index: 1;
      }
      .shell {
        grid-template-columns: minmax(0, 272px) minmax(0, 1fr);
        gap: 20px;
        padding: 18px;
      }
      body.sidebar-collapsed .shell {
        grid-template-columns: 88px minmax(0, 1fr);
      }
      .main {
        padding: 0 0 32px;
        background: transparent;
      }
      .sidebar {
        height: calc(100vh - 36px);
        position: sticky;
        top: 18px;
        border: 1px solid rgba(255, 255, 255, 0.7);
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(22px);
        box-shadow: 0 24px 70px rgba(15, 23, 42, 0.09);
        overflow: hidden;
      }
      .sidebar-head {
        min-height: 76px;
        padding: 0 22px;
        border-bottom: 1px solid rgba(226, 232, 240, 0.86);
      }
      .brand-mark {
        width: 40px;
        height: 40px;
        border: 0;
        background: linear-gradient(135deg, #14b8a6, #2563eb);
        box-shadow: 0 16px 28px rgba(20, 184, 166, 0.26);
      }
      .brand-copy strong {
        font-size: 19px;
      }
      .brand-copy span {
        margin-top: 5px;
        font-size: 10px;
        letter-spacing: 0.12em;
      }
      .sidebar-nav {
        padding: 18px 14px;
        gap: 8px;
      }
      .nav-item {
        min-height: 48px;
        border-radius: 16px;
        border: 1px solid transparent;
        color: #4b5563;
      }
      .nav-item.active {
        background: linear-gradient(180deg, rgba(20, 184, 166, 0.16), rgba(37, 99, 235, 0.07));
        border-color: rgba(20, 184, 166, 0.2);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
      }
      .nav-item:hover {
        background: rgba(255, 255, 255, 0.8);
      }
      .sidebar-foot {
        padding: 14px;
        border-top: 1px solid rgba(226, 232, 240, 0.86);
      }
      .sidebar-ghost,
      .sidebar-toggle {
        min-height: 42px;
        border-radius: 14px;
        background: rgba(248, 250, 252, 0.85);
      }
      .sidebar-ghost {
        color: #0f766e;
        border-color: rgba(20, 184, 166, 0.16);
        background: rgba(236, 253, 245, 0.95);
      }
      .sidebar-toggle {
        color: #475569;
      }
      .topbar {
        position: sticky;
        top: 18px;
        margin: 0 0 18px;
        padding: 16px 18px;
        min-height: 76px;
        border: 1px solid rgba(255, 255, 255, 0.68);
        border-radius: 24px;
        background: rgba(255, 255, 255, 0.68);
        backdrop-filter: blur(22px);
        box-shadow: 0 18px 54px rgba(15, 23, 42, 0.08);
      }
      .topbar-copy .eyebrow {
        display: block;
        margin-bottom: 4px;
        color: #14b8a6;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .topbar-copy h1 {
        font-size: 24px;
        font-weight: 700;
      }
      .topbar-copy p {
        margin-top: 6px;
        font-size: 13px;
        max-width: 620px;
      }
      .topbar-actions {
        gap: 10px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }
      .top-chip {
        min-height: 38px;
        padding: 0 14px;
        border-radius: 14px;
        border-color: rgba(203, 213, 225, 0.8);
        background: rgba(248, 250, 252, 0.92);
      }
      .top-chip-status {
        color: #0f766e;
        background: rgba(236, 253, 245, 0.95);
        border-color: rgba(20, 184, 166, 0.16);
      }
      .top-chip-public {
        color: #6d28d9;
        background: rgba(245, 243, 255, 0.96);
        border-color: rgba(167, 139, 250, 0.24);
      }
      .locale-switcher {
        position: relative;
      }
      .locale-trigger {
        min-height: 38px;
        padding: 0 12px;
        border-radius: 14px;
        border: 1px solid rgba(203, 213, 225, 0.8);
        background: rgba(248, 250, 252, 0.92);
        color: #475569;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
      }
      .locale-trigger:hover {
        background: #ffffff;
      }
      .locale-flag {
        font-size: 15px;
        line-height: 1;
      }
      .locale-label {
        letter-spacing: 0.04em;
      }
      .locale-menu {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        min-width: 150px;
        border-radius: 18px;
        border: 1px solid rgba(226, 232, 240, 0.95);
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(20px);
        box-shadow: 0 20px 48px rgba(15, 23, 42, 0.12);
        padding: 8px;
      }
      .locale-option {
        width: 100%;
        min-height: 42px;
        padding: 0 12px;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: #334155;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .locale-option:hover {
        background: rgba(248, 250, 252, 0.9);
      }
      .locale-option.active {
        color: #0f766e;
        background: rgba(236, 253, 245, 0.92);
      }
      .locale-check {
        margin-left: auto;
        opacity: 0;
      }
      .locale-option.active .locale-check {
        opacity: 1;
      }
      .profile-trigger {
        min-height: 44px;
        padding: 4px 12px 4px 4px;
        border-radius: 18px;
        background: rgba(248, 250, 252, 0.92);
        border: 1px solid rgba(203, 213, 225, 0.72);
      }
      .profile-trigger:hover {
        background: #ffffff;
      }
      .user-menu {
        top: calc(100% + 12px);
        width: 260px;
        border-radius: 22px;
        border-color: rgba(226, 232, 240, 0.95);
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(20px);
      }
      .badge {
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 12px;
        border-radius: 999px;
        border: 1px solid transparent;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
      }
      .badge.ok {
        color: #047857;
        background: rgba(236, 253, 245, 0.94);
        border-color: rgba(16, 185, 129, 0.18);
      }
      .badge.warn {
        color: #b45309;
        background: rgba(255, 247, 237, 0.96);
        border-color: rgba(245, 158, 11, 0.22);
      }
      .badge.active {
        color: #1d4ed8;
        background: rgba(239, 246, 255, 0.95);
        border-color: rgba(59, 130, 246, 0.2);
      }
      .card,
      .records-card,
      .chart-card,
      .work-card,
      .scan-main-card,
      .scan-side-card {
        border: 1px solid rgba(255, 255, 255, 0.75);
        border-radius: 26px;
        background: rgba(255, 255, 255, 0.74);
        backdrop-filter: blur(22px);
        box-shadow: 0 22px 64px rgba(15, 23, 42, 0.07);
      }
      .metric-grid {
        gap: 16px;
      }
      .metric-card {
        min-height: 110px;
        border-radius: 22px;
        border: 1px solid rgba(255, 255, 255, 0.7);
        background: rgba(255, 255, 255, 0.74);
        backdrop-filter: blur(18px);
        box-shadow: 0 18px 46px rgba(15, 23, 42, 0.05);
        transition: transform 180ms ease, box-shadow 180ms ease;
      }
      .metric-card:hover,
      .recent-row:hover,
      .job-row:hover,
      .admin-user:hover,
      .storage-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 18px 44px rgba(15, 23, 42, 0.09);
      }
      .metric-copy span {
        font-size: 11px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .metric-copy strong {
        font-size: 30px;
      }
      .toolbar-card,
      .scan-box,
      .gate-card {
        border: 1px solid rgba(255, 255, 255, 0.78);
        border-radius: 22px;
        background: rgba(248, 250, 252, 0.72);
        backdrop-filter: blur(18px);
        box-shadow: 0 16px 38px rgba(15, 23, 42, 0.05);
      }
      .button-link,
      .select-chip,
      .mini-link,
      .size-chip {
        min-height: 40px;
        padding: 0 14px;
        border-radius: 14px;
      }
      .button-link.primary {
        background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
        box-shadow: 0 14px 28px rgba(20, 184, 166, 0.2);
      }
      .button-link.primary:hover {
        background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
        border-color: transparent;
        filter: brightness(0.98);
      }
      .section-head {
        margin-bottom: 4px;
      }
      .section-head h2 {
        margin-top: 8px;
        font-size: 22px;
        letter-spacing: -0.03em;
      }
      .eyebrow {
        color: #14b8a6;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
      .chart-shell {
        padding: 6px 2px 0;
      }
      .donut {
        width: 184px;
        height: 184px;
        box-shadow: inset 0 0 0 12px rgba(255, 255, 255, 0.3);
      }
      .donut::after {
        width: 88px;
        height: 88px;
        background: rgba(255, 255, 255, 0.92);
        box-shadow: inset 0 0 0 1px rgba(203, 213, 225, 0.5);
      }
      .trend-chart {
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.72));
      }
      .field {
        gap: 10px;
      }
      .field > label {
        font-size: 12px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      input,
      textarea {
        border-radius: 16px;
        border-color: rgba(203, 213, 225, 0.9);
        background: rgba(255, 255, 255, 0.92);
      }
      .actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 18px;
      }
      .recent-row,
      .job-row,
      .admin-user,
      .storage-item {
        border-radius: 18px;
        border-color: rgba(226, 232, 240, 0.92);
        background: rgba(248, 250, 252, 0.74);
      }
      .job-row-detail,
      .job-inline-file {
        background: rgba(255, 255, 255, 0.92);
      }
      .login-shell {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
        gap: 24px;
        min-height: calc(100vh - 64px);
        align-items: stretch;
      }
      .auth-toolbar {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 4;
      }
      body[data-page="login"] .shell {
        display: block;
        padding: 32px 24px 40px;
        max-width: 1220px;
        margin: 0 auto;
      }
      body[data-page="login"] .main {
        padding: 0;
      }
      .panel {
        border: 1px solid rgba(255, 255, 255, 0.76);
        border-radius: 32px;
        background: rgba(255, 255, 255, 0.72);
        backdrop-filter: blur(22px);
        box-shadow: 0 24px 72px rgba(15, 23, 42, 0.09);
        padding: 34px;
      }
      .login-brand-panel {
        overflow: hidden;
        background:
          linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(239, 246, 255, 0.62)),
          linear-gradient(180deg, rgba(20, 184, 166, 0.06), rgba(37, 99, 235, 0.04));
      }
      .auth-brand-mark {
        width: 58px;
        height: 58px;
        border-radius: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #14b8a6 0%, #2563eb 100%);
        color: #ffffff;
        font-size: 26px;
        font-weight: 900;
        box-shadow: 0 18px 36px rgba(20, 184, 166, 0.24);
      }
      .login-brand-panel h1 {
        margin: 16px 0 12px;
        font-size: clamp(34px, 5vw, 56px);
        line-height: 1.04;
        letter-spacing: -0.05em;
      }
      .login-brand-panel p {
        max-width: 560px;
        margin: 0;
        color: #64748b;
        font-size: 16px;
        line-height: 1.8;
      }
      .login-points {
        margin-top: 28px;
        display: grid;
        gap: 14px;
      }
      .login-point {
        display: grid;
        grid-template-columns: 42px minmax(0, 1fr);
        gap: 14px;
        align-items: center;
        padding: 14px 16px;
        border-radius: 20px;
        border: 1px solid rgba(255, 255, 255, 0.82);
        background: rgba(255, 255, 255, 0.72);
      }
      .login-point strong {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #0f766e;
        background: rgba(236, 253, 245, 0.92);
      }
      .login-form-panel {
        justify-content: center;
      }
      .panel-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
      }
      .panel-title {
        margin: 8px 0 0;
        font-size: 30px;
        letter-spacing: -0.04em;
      }
      .auth-tabs {
        display: inline-grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 6px;
        padding: 6px;
        border-radius: 18px;
        background: rgba(241, 245, 249, 0.9);
      }
      .auth-tab {
        min-height: 42px;
        padding: 0 18px;
        border: 0;
        border-radius: 14px;
        background: transparent;
        color: #64748b;
        font-weight: 700;
      }
      .auth-tab.active {
        color: #0f172a;
        background: #ffffff;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
      }
      .auth-form-panel {
        margin-top: 18px;
      }
      .form-note {
        margin-top: 16px;
      }
      .notice {
        border-radius: 18px;
      }
      @media (max-width: 1120px) {
        .login-shell {
          grid-template-columns: 1fr;
          padding-top: 56px;
        }
      }
      @media (max-width: 980px) {
        .shell {
          grid-template-columns: 1fr;
          padding: 14px;
        }
        .sidebar {
          position: relative;
          top: auto;
          height: auto;
          margin-bottom: 8px;
        }
        body.sidebar-collapsed .shell {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 720px) {
        body[data-page="login"] .shell {
          padding: 18px 14px 24px;
        }
        .topbar {
          top: 14px;
        }
        .topbar-copy h1 {
          font-size: 20px;
        }
        .login-brand-panel h1 {
          font-size: 34px;
        }
        .panel {
          padding: 22px;
          border-radius: 24px;
        }
        .metric-card,
        .card,
        .records-card,
        .chart-card,
        .work-card,
        .scan-main-card,
        .scan-side-card {
          border-radius: 22px;
        }
      }
    </style>
  </head>
  <body data-page="${page}">
    <div class="shell">
      ${page === "login" ? "" : renderSidebar()}
      <main class="main">
        <div id="notice" class="notice ok hidden"></div>
        ${renderPageBody(page)}
      </main>
    </div>

    <script>
      const PAGE = ${JSON.stringify(page)};
      const SIDEBAR_KEY = "godingtalk_sidebar_collapsed";
      const LOCALE_KEY = "godingtalk_locale";
      const LOCALE_META = {
        zh: { flag: "🇨🇳", label: "ZH", lang: "zh-CN" },
        en: { flag: "🇺🇸", label: "EN", lang: "en" },
      };
      const I18N = {
        zh: {
          "locale.zh": "中文",
          "locale.en": "English",
          "brand.name": "GoDingtalk",
          "brand.subtitle": "公益回放控制台",
          "sidebar.publicMode": "公益模式",
          "sidebar.collapse": "收起",
          "sidebar.expand": "展开",
          "nav.overview": "仪表盘",
          "nav.legal": "条款确认",
          "nav.scan": "钉钉验证",
          "nav.jobs": "详细记录",
          "nav.account": "账号设置",
          "nav.admin": "管理页",
          "topbar.consoleEyebrow": "Public Console",
          "topbar.publicMode": "公益模式",
          "topbar.status.waitLegal": "待同意条款",
          "topbar.status.waitCookie": "待钉钉验证",
          "topbar.status.ready": "验证已就绪",
          "role.user": "用户",
          "role.sudo": "管理员",
          "auth.eyebrow": "Public Control Console",
          "auth.heroTitle": "钉钉回放下载控制台",
          "auth.heroSubtitle": "沿用当前业务结构，但视觉语言切到更接近 Sub2API 的后台风格。登录后按顺序完成条款确认、钉钉验证与下载提交。",
          "auth.pointLegal": "同意当前条款",
          "auth.pointScan": "二维码登录获取钉钉验证",
          "auth.pointDownload": "提交回放链接开始下载",
          "auth.formEyebrow": "Secure Access",
          "auth.panelTitle": "进入控制台",
          "auth.loginTab": "登录",
          "auth.registerTab": "注册",
          "auth.usernameLabel": "用户名",
          "auth.usernamePlaceholder": "输入用户名",
          "auth.registerUsernamePlaceholder": "至少 3 位",
          "auth.passwordLabel": "密码",
          "auth.passwordPlaceholder": "输入密码",
          "auth.registerPasswordPlaceholder": "至少 6 位",
          "auth.passwordConfirmLabel": "确认密码",
          "auth.passwordConfirmPlaceholder": "再次输入密码",
          "auth.loginHint": "登录后需完成条款确认与扫码验证",
          "auth.registerHintOpen": "注册成功后将直接进入条款确认",
          "auth.registerHintClosed": "当前未开放注册",
          "auth.loginAction": "登录",
          "auth.registerAction": "注册",
          "auth.logout": "退出登录",
          "page.login.title": "登录",
          "page.overview.title": "仪表盘",
          "page.overview.subtitle": "欢迎回来，这里展示当前账号的任务、验证和整体状态。",
          "page.legal.title": "条款确认",
          "page.legal.subtitle": "新注册用户需要先完成当前版本条款确认，条款更新后会再次要求确认。",
          "page.scan.title": "钉钉验证",
          "page.scan.subtitle": "当前仅支持二维码登录导入钉钉验证态。验证会过期，可随时重新扫码。",
          "page.jobs.title": "详细记录",
          "page.jobs.subtitle": "按页查看所有任务，点击单条记录可以展开文件和错误详情。",
          "page.account.title": "账号设置",
          "page.account.subtitle": "保留当前账号信息、密码修改和退出登录等基础操作。",
          "page.admin.title": "管理页",
          "page.admin.subtitle": "这里只保留 sudo 需要处理的内容：存储对象、异常用户与条款管理。",
          "metric.cookies.label": "钉钉验证",
          "metric.cookies.help": "当前状态",
          "metric.cookies.ready": "已就绪",
          "metric.cookies.pending": "未验证",
          "metric.total.label": "总任务",
          "metric.total.help": "全部下载任务",
          "metric.running.label": "进行中",
          "metric.running.help": "队列 + 运行中",
          "metric.success.label": "已完成",
          "metric.success.help": "已完成下载",
          "metric.failed.label": "失败任务",
          "metric.failed.help": "需要处理",
          "metric.week.label": "近 7 天创建",
          "metric.week.help": "滚动统计",
          "metric.rate.label": "完成率",
          "metric.rate.help": "最近任务",
          "metric.cookieTime.label": "最近验证",
          "metric.cookieTime.help": "更新时间",
          "overview.rangeLabel": "时间范围",
          "overview.range7": "近 7 天",
          "overview.range30": "近 30 天",
          "overview.granularityLabel": "粒度",
          "overview.granularityDay": "按天",
          "overview.granularityHour": "按小时",
          "overview.statusDistribution": "任务状态分布",
          "overview.trend7": "近 7 天任务趋势",
          "overview.trend30": "近 30 天任务趋势",
          "overview.trend24h": "近 24 小时任务趋势",
          "overview.legend.created": "创建",
          "overview.legend.done": "完成",
          "overview.legend.failed": "失败",
          "overview.submitEyebrow": "Submit",
          "overview.submitTitle": "提交下载",
          "overview.urlsLabel": "回放链接",
          "overview.urlsPlaceholder": "粘贴回放链接，每行一个",
          "overview.createJob": "开始下载",
          "overview.recentEyebrow": "Recent",
          "overview.recentTitle": "近 10 条记录",
          "overview.quickEyebrow": "Quick Actions",
          "overview.quickTitle": "快捷操作",
          "overview.quickScanHint": "重新扫码刷新验证状态",
          "overview.quickJobsTitle": "查看记录",
          "overview.quickJobsHint": "进入详细任务列表",
          "overview.quickAccountHint": "修改密码与退出登录",
          "overview.gate.needLegalTitle": "请先同意条款",
          "overview.gate.needLegalCopy": "完成条款确认后，才可以继续完成钉钉验证。",
          "overview.gate.needLegalAction": "去同意条款",
          "overview.gate.needScanTitle": "请先完成钉钉验证",
          "overview.gate.needScanCopy": "当前仅支持二维码登录获取钉钉验证。",
          "overview.gate.needScanAction": "去钉钉验证",
          "overview.table.status": "状态",
          "overview.table.count": "数量",
          "overview.table.percent": "占比",
          "overview.table.note": "说明",
          "overview.table.success": "已完成",
          "overview.table.running": "进行中",
          "overview.table.failed": "失败",
          "overview.table.readyNote": "可下载",
          "overview.table.runningNote": "处理中",
          "overview.table.failedNote": "需重试",
          "legal.stepEyebrow": "Step 1",
          "legal.title": "同意当前条款",
          "legal.checkbox": "我已阅读并同意条款",
          "legal.acceptAction": "同意条款",
          "legal.documentEyebrow": "Document",
          "legal.documentTitle": "条款全文",
          "legal.loading": "正在加载条款...",
          "legal.empty": "暂无条款内容",
          "legal.versionCurrent": "当前版本：{version}",
          "legal.stateAccepted": "当前版本已同意",
          "legal.statePending": "同意当前版本后，将自动进入钉钉验证",
          "scan.stepEyebrow": "Step 2",
          "scan.title": "二维码登录",
          "scan.startAction": "启动二维码登录",
          "scan.restartAction": "重新二维码登录",
          "scan.generating": "正在生成二维码",
          "scan.defaultHint": "二维码出现后，请使用钉钉扫码登录。",
          "scan.qrAlt": "登录二维码",
          "scan.flowEyebrow": "Flow",
          "scan.nextTitle": "下一步",
          "scan.step1": "等待二维码出现",
          "scan.step2": "使用钉钉扫码登录",
          "scan.step3": "验证成功后可以继续下载，也可随时重新扫码",
          "scan.ready": "钉钉验证已就绪",
          "scan.pending": "钉钉验证尚未就绪",
          "scan.metaUpdated": "最近更新时间：{time}",
          "scan.metaQrOnly": "仅支持通过二维码登录获取钉钉验证",
          "scan.generatingHint": "通常约 1 分钟内出现二维码，请保持页面开启。",
          "scan.readyTitle": "请使用钉钉扫码登录",
          "scan.readyHint": "扫码成功后，钉钉验证会自动绑定到当前账号。",
          "scan.completedTitle": "钉钉验证完成",
          "scan.completedHint": "二维码登录成功，你现在可以返回下载页面，或随时重新扫码刷新验证态。",
          "scan.failedTitle": "登录失败",
          "scan.failedFallback": "登录失败，请重试。",
          "jobs.pageSizeLabel": "每页显示",
          "jobs.pageOne": "第 1 页",
          "jobs.loading": "正在加载记录...",
          "jobs.prev": "上一页",
          "jobs.next": "下一页",
          "jobs.pageSummary": "共 {total} 条 · 每页 {pageSize} 条",
          "jobs.empty": "暂无记录",
          "jobs.defaultTitle": "下载任务",
          "jobs.downloadFile": "下载文件",
          "jobs.processing": "处理中",
          "jobs.jobId": "任务 ID：{id}",
          "jobs.createdAt": "创建时间：{time}",
          "jobs.noName": "未命名文件",
          "jobs.status.finished": "已完成",
          "jobs.status.failed": "失败",
          "jobs.status.running": "进行中",
          "account.profileEyebrow": "Profile",
          "account.profileTitle": "当前账号",
          "account.securityEyebrow": "Security",
          "account.securityTitle": "修改密码",
          "account.currentPassword": "当前密码",
          "account.currentPasswordPlaceholder": "当前密码",
          "account.newPassword": "新密码",
          "account.newPasswordPlaceholder": "至少 6 位",
          "account.confirmPassword": "确认新密码",
          "account.confirmPasswordPlaceholder": "再次输入新密码",
          "account.savePassword": "保存新密码",
          "account.pleaseLogin": "请先登录。",
          "account.currentUser": "当前用户：{username} · {status}",
          "account.statusNormal": "状态正常",
          "account.statusNeedLegal": "待同意条款",
          "account.statusNeedScan": "待钉钉验证",
          "admin.storageEyebrow": "R2 Storage",
          "admin.storageTitle": "R2 文件",
          "admin.storagePrefix": "对象前缀",
          "admin.storagePrefixPlaceholder": "例如 dedup/",
          "admin.refreshStorage": "刷新文件",
          "admin.storageLoading": "正在加载 R2 文件...",
          "admin.loadMore": "加载更多",
          "admin.usersEyebrow": "Users",
          "admin.usersTitle": "需要处理的用户",
          "admin.usersLoading": "正在加载用户数据...",
          "admin.legalEyebrow": "Legal",
          "admin.legalTitle": "条款管理",
          "admin.legalField": "条款内容",
          "admin.legalPlaceholder": "输入新的条款正文",
          "admin.saveLegal": "保存条款",
          "admin.userSummary": "需要处理 {attention} 人 · 状态正常 {normal} 人",
          "admin.userEmpty": "当前没有需要处理的用户",
          "admin.userRegistered": "注册时间：{time}",
          "admin.userNeedLegal": "待同意条款",
          "admin.userNeedScan": "待钉钉验证",
          "admin.userTasks": "任务数：{count}",
          "admin.userSudoSuffix": " (sudo)",
          "admin.legalVersion": "当前版本：{version}。保存后所有用户需要重新同意。",
          "admin.storageMeta": "{prefix}当前已加载 {count} 个对象",
          "admin.storagePrefixMeta": "前缀：{prefix} · ",
          "admin.storageEmpty": "当前没有匹配的 R2 文件",
          "admin.storageSize": "大小",
          "admin.storageUploadedAt": "上传时间",
          "admin.storageRefs": "引用",
          "admin.storageAliases": "别名：{names}",
          "admin.downloadFile": "下载文件",
          "status.notDone": "未完成",
          "status.done": "已完成",
          "status.inProgress": "进行中",
          "status.normal": "状态正常",
          "common.loading": "正在加载...",
          "common.noRecords": "暂无记录",
          "common.refresh": "刷新状态",
          "common.total": "总计",
          "common.active": "活跃",
          "common.download": "下载文件",
          "common.processing": "处理中",
          "common.unnamed": "未命名文件",
          "common.none": "-",
          "error.invalidCredentials": "账号或密码错误",
          "error.usernamePasswordRequirements": "用户名至少 3 位，密码至少 6 位",
          "error.usernameExists": "用户名已存在",
          "error.registrationClosed": "当前未开放注册",
          "error.currentPasswordIncorrect": "当前密码错误",
          "error.newPasswordShort": "新密码至少 6 位",
          "error.currentAndNewRequired": "请完整填写密码信息",
          "error.credentialsRequired": "请填写用户名和密码",
          "error.loginRequired": "请登录后继续",
          "error.needLegalBeforeQR": "请先同意条款",
          "error.needLegalBeforeJobs": "请先同意条款",
          "error.cookiesMissing": "请先完成扫码登录",
          "error.qrOnly": "钉钉验证仅支持二维码登录获取",
          "error.sudoRequired": "需要 sudo 权限",
          "error.passwordMismatch": "两次输入的密码不一致",
          "error.legalEmpty": "条款内容不能为空",
          "error.needUrls": "请先填入回放链接",
          "error.generic": "操作失败，请重试",
          "notice.loginWorkflowStarted": "二维码登录已启动。",
          "notice.passwordUpdated": "密码已更新。",
          "notice.legalUpdated": "条款已更新，所有用户需要重新同意。",
          "notice.jobCreatedOne": "任务已创建：{id}",
          "notice.jobCreatedMany": "已创建 {count} 个任务。",
          "stage.waiting_runner": "等待 runner",
          "stage.preparing": "准备中",
          "stage.queued": "排队中",
          "stage.resolving": "解析中",
          "stage.downloading": "下载中",
          "stage.converting": "转码中",
          "stage.uploading_r2": "上传中",
          "stage.completed": "已完成",
          "stage.failed": "失败",
          "job.status.queued": "等待开始",
          "job.status.running": "进行中",
          "job.status.succeeded": "已完成",
          "job.status.failed": "失败",
        },
        en: {
          "locale.zh": "Chinese",
          "locale.en": "English",
          "brand.name": "GoDingtalk",
          "brand.subtitle": "Public Replay Console",
          "sidebar.publicMode": "Public Mode",
          "sidebar.collapse": "Collapse",
          "sidebar.expand": "Expand",
          "nav.overview": "Dashboard",
          "nav.legal": "Terms",
          "nav.scan": "DingTalk Login",
          "nav.jobs": "Records",
          "nav.account": "Account",
          "nav.admin": "Admin",
          "topbar.consoleEyebrow": "Public Console",
          "topbar.publicMode": "Public Mode",
          "topbar.status.waitLegal": "Terms Pending",
          "topbar.status.waitCookie": "Login Pending",
          "topbar.status.ready": "Ready",
          "role.user": "User",
          "role.sudo": "Admin",
          "auth.eyebrow": "Public Control Console",
          "auth.heroTitle": "DingTalk Replay Console",
          "auth.heroSubtitle": "The business flow stays the same, but the interface is rebuilt in a Sub2API-like console style. Sign in, accept the terms, scan for DingTalk, then submit replay links.",
          "auth.pointLegal": "Accept the current terms",
          "auth.pointScan": "Scan a QR code to bind DingTalk login",
          "auth.pointDownload": "Submit replay links to start downloading",
          "auth.formEyebrow": "Secure Access",
          "auth.panelTitle": "Enter Console",
          "auth.loginTab": "Sign In",
          "auth.registerTab": "Register",
          "auth.usernameLabel": "Username",
          "auth.usernamePlaceholder": "Enter your username",
          "auth.registerUsernamePlaceholder": "At least 3 characters",
          "auth.passwordLabel": "Password",
          "auth.passwordPlaceholder": "Enter your password",
          "auth.registerPasswordPlaceholder": "At least 6 characters",
          "auth.passwordConfirmLabel": "Confirm Password",
          "auth.passwordConfirmPlaceholder": "Enter it again",
          "auth.loginHint": "After signing in, you still need to accept the terms and complete DingTalk login.",
          "auth.registerHintOpen": "Successful registration will take you straight to terms confirmation.",
          "auth.registerHintClosed": "Registration is currently closed.",
          "auth.loginAction": "Sign In",
          "auth.registerAction": "Register",
          "auth.logout": "Sign Out",
          "page.login.title": "Sign In",
          "page.overview.title": "Dashboard",
          "page.overview.subtitle": "A quick view of tasks, DingTalk login state, and overall health for this account.",
          "page.legal.title": "Terms Confirmation",
          "page.legal.subtitle": "New users must accept the current terms first. If the terms change, acceptance is required again.",
          "page.scan.title": "DingTalk Login",
          "page.scan.subtitle": "Only QR login is supported for importing DingTalk cookies. The session expires, so rescanning is allowed.",
          "page.jobs.title": "Job Records",
          "page.jobs.subtitle": "Browse all tasks page by page. Click any row to expand files and errors.",
          "page.account.title": "Account Settings",
          "page.account.subtitle": "Keep only the essentials here: account info, password changes, and sign out.",
          "page.admin.title": "Admin",
          "page.admin.subtitle": "This page keeps only what sudo users need: storage objects, users needing attention, and terms management.",
          "metric.cookies.label": "DingTalk Login",
          "metric.cookies.help": "Current state",
          "metric.cookies.ready": "Ready",
          "metric.cookies.pending": "Missing",
          "metric.total.label": "Total Jobs",
          "metric.total.help": "All download jobs",
          "metric.running.label": "Running",
          "metric.running.help": "Queued + running",
          "metric.success.label": "Completed",
          "metric.success.help": "Finished downloads",
          "metric.failed.label": "Failed",
          "metric.failed.help": "Need attention",
          "metric.week.label": "Created in 7 Days",
          "metric.week.help": "Rolling count",
          "metric.rate.label": "Completion Rate",
          "metric.rate.help": "Recent jobs",
          "metric.cookieTime.label": "Last Login",
          "metric.cookieTime.help": "Last update",
          "overview.rangeLabel": "Range",
          "overview.range7": "Last 7 Days",
          "overview.range30": "Last 30 Days",
          "overview.granularityLabel": "Granularity",
          "overview.granularityDay": "By Day",
          "overview.granularityHour": "By Hour",
          "overview.statusDistribution": "Job Status Distribution",
          "overview.trend7": "7-Day Job Trend",
          "overview.trend30": "30-Day Job Trend",
          "overview.trend24h": "24-Hour Job Trend",
          "overview.legend.created": "Created",
          "overview.legend.done": "Done",
          "overview.legend.failed": "Failed",
          "overview.submitEyebrow": "Submit",
          "overview.submitTitle": "Submit Download",
          "overview.urlsLabel": "Replay Links",
          "overview.urlsPlaceholder": "Paste replay links, one per line",
          "overview.createJob": "Start Download",
          "overview.recentEyebrow": "Recent",
          "overview.recentTitle": "Latest 10 Jobs",
          "overview.quickEyebrow": "Quick Actions",
          "overview.quickTitle": "Quick Actions",
          "overview.quickScanHint": "Rescan to refresh DingTalk login",
          "overview.quickJobsTitle": "View Records",
          "overview.quickJobsHint": "Open the detailed job list",
          "overview.quickAccountHint": "Change password or sign out",
          "overview.gate.needLegalTitle": "Accept the Terms First",
          "overview.gate.needLegalCopy": "You need to accept the current terms before proceeding to DingTalk login.",
          "overview.gate.needLegalAction": "Review Terms",
          "overview.gate.needScanTitle": "Complete DingTalk Login First",
          "overview.gate.needScanCopy": "Only QR login is supported for obtaining DingTalk cookies.",
          "overview.gate.needScanAction": "Open DingTalk Login",
          "overview.table.status": "Status",
          "overview.table.count": "Count",
          "overview.table.percent": "Share",
          "overview.table.note": "Note",
          "overview.table.success": "Completed",
          "overview.table.running": "Running",
          "overview.table.failed": "Failed",
          "overview.table.readyNote": "Ready to download",
          "overview.table.runningNote": "In progress",
          "overview.table.failedNote": "Retry needed",
          "legal.stepEyebrow": "Step 1",
          "legal.title": "Accept Current Terms",
          "legal.checkbox": "I have read and agree to the terms",
          "legal.acceptAction": "Accept Terms",
          "legal.documentEyebrow": "Document",
          "legal.documentTitle": "Full Terms",
          "legal.loading": "Loading terms...",
          "legal.empty": "No terms content available.",
          "legal.versionCurrent": "Current version: {version}",
          "legal.stateAccepted": "The current version is already accepted.",
          "legal.statePending": "After you accept the current version, the flow will continue to DingTalk login.",
          "scan.stepEyebrow": "Step 2",
          "scan.title": "QR Login",
          "scan.startAction": "Start QR Login",
          "scan.restartAction": "Restart QR Login",
          "scan.generating": "Generating QR Code",
          "scan.defaultHint": "When the QR code appears, use DingTalk to scan it.",
          "scan.qrAlt": "Login QR code",
          "scan.flowEyebrow": "Flow",
          "scan.nextTitle": "What Happens Next",
          "scan.step1": "Wait for the QR code to appear",
          "scan.step2": "Scan it with DingTalk",
          "scan.step3": "After success, return to downloading or rescan anytime",
          "scan.ready": "DingTalk login is ready",
          "scan.pending": "DingTalk login is not ready yet",
          "scan.metaUpdated": "Last updated: {time}",
          "scan.metaQrOnly": "DingTalk login can only be obtained through QR login",
          "scan.generatingHint": "The QR code usually appears within about one minute. Keep this page open.",
          "scan.readyTitle": "Scan with DingTalk",
          "scan.readyHint": "After a successful scan, DingTalk cookies will be bound to the current account automatically.",
          "scan.completedTitle": "DingTalk Login Complete",
          "scan.completedHint": "QR login succeeded. You can go back to downloads now, or rescan later to refresh the session.",
          "scan.failedTitle": "Login Failed",
          "scan.failedFallback": "Login failed. Please try again.",
          "jobs.pageSizeLabel": "Page Size",
          "jobs.pageOne": "Page 1",
          "jobs.loading": "Loading records...",
          "jobs.prev": "Previous",
          "jobs.next": "Next",
          "jobs.pageSummary": "{total} records · {pageSize} per page",
          "jobs.empty": "No records yet",
          "jobs.defaultTitle": "Download Job",
          "jobs.downloadFile": "Download",
          "jobs.processing": "Processing",
          "jobs.jobId": "Job ID: {id}",
          "jobs.createdAt": "Created: {time}",
          "jobs.noName": "Unnamed file",
          "jobs.status.finished": "Completed",
          "jobs.status.failed": "Failed",
          "jobs.status.running": "Running",
          "account.profileEyebrow": "Profile",
          "account.profileTitle": "Current Account",
          "account.securityEyebrow": "Security",
          "account.securityTitle": "Change Password",
          "account.currentPassword": "Current Password",
          "account.currentPasswordPlaceholder": "Current password",
          "account.newPassword": "New Password",
          "account.newPasswordPlaceholder": "At least 6 characters",
          "account.confirmPassword": "Confirm Password",
          "account.confirmPasswordPlaceholder": "Enter the new password again",
          "account.savePassword": "Save New Password",
          "account.pleaseLogin": "Please sign in first.",
          "account.currentUser": "Current user: {username} · {status}",
          "account.statusNormal": "All good",
          "account.statusNeedLegal": "Terms pending",
          "account.statusNeedScan": "DingTalk login pending",
          "admin.storageEyebrow": "R2 Storage",
          "admin.storageTitle": "R2 Files",
          "admin.storagePrefix": "Object Prefix",
          "admin.storagePrefixPlaceholder": "For example: dedup/",
          "admin.refreshStorage": "Refresh Files",
          "admin.storageLoading": "Loading R2 files...",
          "admin.loadMore": "Load More",
          "admin.usersEyebrow": "Users",
          "admin.usersTitle": "Users Needing Attention",
          "admin.usersLoading": "Loading user data...",
          "admin.legalEyebrow": "Legal",
          "admin.legalTitle": "Terms Management",
          "admin.legalField": "Terms Content",
          "admin.legalPlaceholder": "Enter the new terms text",
          "admin.saveLegal": "Save Terms",
          "admin.userSummary": "{attention} users need attention · {normal} normal",
          "admin.userEmpty": "No users currently need attention",
          "admin.userRegistered": "Registered: {time}",
          "admin.userNeedLegal": "Terms pending",
          "admin.userNeedScan": "DingTalk login pending",
          "admin.userTasks": "Jobs: {count}",
          "admin.userSudoSuffix": " (sudo)",
          "admin.legalVersion": "Current version: {version}. Saving will require all users to accept again.",
          "admin.storageMeta": "{prefix}{count} objects loaded",
          "admin.storagePrefixMeta": "Prefix: {prefix} · ",
          "admin.storageEmpty": "No matching R2 files found",
          "admin.storageSize": "Size",
          "admin.storageUploadedAt": "Uploaded",
          "admin.storageRefs": "Refs",
          "admin.storageAliases": "Aliases: {names}",
          "admin.downloadFile": "Download",
          "status.notDone": "Pending",
          "status.done": "Done",
          "status.inProgress": "Running",
          "status.normal": "Normal",
          "common.loading": "Loading...",
          "common.noRecords": "No records yet",
          "common.refresh": "Refresh",
          "common.total": "Total",
          "common.active": "active",
          "common.download": "Download",
          "common.processing": "Processing",
          "common.unnamed": "Unnamed file",
          "common.none": "-",
          "error.invalidCredentials": "Invalid username or password",
          "error.usernamePasswordRequirements": "Username must be at least 3 characters and password at least 6",
          "error.usernameExists": "Username already exists",
          "error.registrationClosed": "Registration is closed",
          "error.currentPasswordIncorrect": "Current password is incorrect",
          "error.newPasswordShort": "New password must be at least 6 characters",
          "error.currentAndNewRequired": "Please fill out the password fields",
          "error.credentialsRequired": "Please enter your username and password",
          "error.loginRequired": "Please sign in first",
          "error.needLegalBeforeQR": "Please accept the terms first",
          "error.needLegalBeforeJobs": "Please accept the terms first",
          "error.cookiesMissing": "Please complete QR login first",
          "error.qrOnly": "DingTalk login can only be obtained via QR login",
          "error.sudoRequired": "Sudo privileges are required",
          "error.passwordMismatch": "The two passwords do not match",
          "error.legalEmpty": "Terms content cannot be empty",
          "error.needUrls": "Please enter at least one replay URL",
          "error.generic": "The action failed. Please try again.",
          "notice.loginWorkflowStarted": "QR login has been started.",
          "notice.passwordUpdated": "Password updated.",
          "notice.legalUpdated": "Terms updated. All users need to accept them again.",
          "notice.jobCreatedOne": "Created job: {id}",
          "notice.jobCreatedMany": "Created {count} jobs.",
          "stage.waiting_runner": "Waiting for runner",
          "stage.preparing": "Preparing",
          "stage.queued": "Queued",
          "stage.resolving": "Resolving",
          "stage.downloading": "Downloading",
          "stage.converting": "Converting",
          "stage.uploading_r2": "Uploading",
          "stage.completed": "Completed",
          "stage.failed": "Failed",
          "job.status.queued": "Queued",
          "job.status.running": "Running",
          "job.status.succeeded": "Completed",
          "job.status.failed": "Failed",
        },
      };

      function detectLocale() {
        const stored = String(localStorage.getItem(LOCALE_KEY) || "").trim().toLowerCase();
        if (stored === "zh" || stored === "en") return stored;
        const browser = String(navigator.language || "").toLowerCase();
        return browser.startsWith("zh") ? "zh" : "en";
      }

      function t(key, vars) {
        const locale = state && state.locale ? state.locale : detectLocale();
        const dict = I18N[locale] || I18N.zh;
        const source = dict[key] || I18N.zh[key] || key;
        if (!vars) return source;
        return source.replace(/\{([a-zA-Z0-9_]+)\}/g, function (_, name) {
          return Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : "";
        });
      }

      const state = {
        locale: detectLocale(),
        authenticated: false,
        registrationOpen: false,
        authTab: "login",
        legalAccepted: false,
        legalAcceptedAt: "",
        legalVersion: "",
        legalText: "",
        legalConfirmVersion: "",
        cookiesReady: false,
        cookiesUpdatedAt: "",
        user: null,
        loginSessionId: "",
        loginSessionStatus: "",
        lastLoginSession: null,
        recentJobs: [],
        overviewJobs: [],
        overviewRangeDays: 7,
        overviewGranularity: "day",
        jobsPageItems: [],
        jobsPage: 1,
        jobsPageSize: 10,
        jobsTotal: 0,
        jobsTotalPages: 1,
        expandedJobId: "",
        adminStorageItems: [],
        adminStorageCursor: "",
        adminStorageHasMore: false,
        adminStoragePrefix: "",
        adminLegalDirty: false,
      };

      const el = {
        notice: document.getElementById("notice"),
        shell: document.querySelector(".shell"),
        sidebar: document.getElementById("sidebar"),
        sidebarToggleBtn: document.getElementById("sidebar-toggle-btn"),
        navOverview: document.getElementById("nav-overview"),
        navLegal: document.getElementById("nav-legal"),
        navScan: document.getElementById("nav-scan"),
        navJobs: document.getElementById("nav-jobs"),
        navAccount: document.getElementById("nav-account"),
        navAdmin: document.getElementById("nav-admin"),
        topStatusChip: document.getElementById("top-status-chip"),
        topPublicChip: document.getElementById("top-public-chip"),
        localeSwitcher: document.getElementById("locale-switcher"),
        localeTrigger: document.getElementById("locale-trigger"),
        localeMenu: document.getElementById("locale-menu"),
        localeCurrentFlag: document.getElementById("locale-current-flag"),
        localeCurrentLabel: document.getElementById("locale-current-label"),
        localeOptions: Array.from(document.querySelectorAll("[data-locale-option]")),
        userMenuWrap: document.getElementById("user-menu-wrap"),
        userMenuTrigger: document.getElementById("user-menu-trigger"),
        userMenu: document.getElementById("user-menu"),
        userMenuName: document.getElementById("user-menu-name"),
        userMenuRole: document.getElementById("user-menu-role"),
        userMenuAdminLink: document.getElementById("user-menu-admin-link"),
        avatarFallback: document.getElementById("avatar-fallback"),
        profileName: document.getElementById("profile-name"),
        profileRole: document.getElementById("profile-role"),
        topbarLogoutBtn: document.getElementById("topbar-logout-btn"),
        topbarLogoutBtnInline: document.getElementById("topbar-logout-btn-inline"),
        authTabLogin: document.getElementById("auth-tab-login"),
        authTabRegister: document.getElementById("auth-tab-register"),
        loginFormPanel: document.getElementById("login-form-panel"),
        registerFormPanel: document.getElementById("register-form-panel"),
        loginUsername: document.getElementById("login-username"),
        loginPassword: document.getElementById("login-password"),
        registerUsername: document.getElementById("register-username"),
        registerPassword: document.getElementById("register-password"),
        registerPasswordConfirm: document.getElementById("register-password-confirm"),
        registerCardHint: document.getElementById("register-card-hint"),
        loginBtn: document.getElementById("login-btn"),
        registerBtn: document.getElementById("register-btn"),
        userStatusLine: document.getElementById("user-status-line"),
        statusHelper: document.getElementById("status-helper"),
        statCookies: document.getElementById("stat-cookies"),
        statTotal: document.getElementById("stat-total"),
        statRunning: document.getElementById("stat-running"),
        statSuccess: document.getElementById("stat-success"),
        statFailed: document.getElementById("stat-failed"),
        statCreatedWeek: document.getElementById("stat-created-week"),
        statCompletionRate: document.getElementById("stat-completion-rate"),
        statCookieTime: document.getElementById("stat-cookie-time"),
        overviewGate: document.getElementById("overview-gate"),
        overviewGateTitle: document.getElementById("overview-gate-title"),
        overviewGateCopy: document.getElementById("overview-gate-copy"),
        overviewGateLink: document.getElementById("overview-gate-link"),
        overviewDownloadForm: document.getElementById("overview-download-form"),
        overviewDonut: document.getElementById("overview-donut"),
        overviewDonutTable: document.getElementById("overview-donut-table"),
        overviewTrend: document.getElementById("overview-trend"),
        overviewTrendTitle: document.getElementById("overview-trend-title"),
        overviewRangeBtn: document.getElementById("overview-range-btn"),
        overviewGranularityBtn: document.getElementById("overview-granularity-btn"),
        urls: document.getElementById("urls"),
        createJobBtn: document.getElementById("create-job-btn"),
        refreshBtn: document.getElementById("refresh-btn"),
        recentRecords: document.getElementById("recent-records"),
        legalBadge: document.getElementById("legal-badge"),
        legalState: document.getElementById("legal-state"),
        legalVersionMeta: document.getElementById("legal-version-meta"),
        legalText: document.getElementById("legal-text"),
        legalConfirmCheck: document.getElementById("legal-confirm-check"),
        legalCheckboxRow: document.getElementById("legal-checkbox-row"),
        acceptLegalBtn: document.getElementById("accept-legal-btn"),
        cookieBadge: document.getElementById("cookie-badge"),
        cookieState: document.getElementById("cookie-state"),
        cookieMeta: document.getElementById("cookie-meta"),
        startLoginWorkflowBtn: document.getElementById("start-login-workflow-btn"),
        loginBox: document.getElementById("login-box"),
        loginStatus: document.getElementById("login-status"),
        loginHint: document.getElementById("login-hint"),
        loginQRImage: document.getElementById("login-qr-image"),
        jobsDetailList: document.getElementById("jobs-detail-list"),
        jobsPaginationSummary: document.getElementById("jobs-pagination-summary"),
        jobsPageIndicator: document.getElementById("jobs-page-indicator"),
        jobsPrevBtn: document.getElementById("jobs-prev-btn"),
        jobsNextBtn: document.getElementById("jobs-next-btn"),
        pageSizeButtons: Array.from(document.querySelectorAll("[data-page-size]")),
        accountSummary: document.getElementById("account-summary"),
        currentPassword: document.getElementById("current-password"),
        newPassword: document.getElementById("new-password"),
        confirmNewPassword: document.getElementById("confirm-new-password"),
        changePasswordBtn: document.getElementById("change-password-btn"),
        adminUsers: document.getElementById("admin-users"),
        adminUserMeta: document.getElementById("admin-user-meta"),
        adminStoragePrefix: document.getElementById("admin-storage-prefix"),
        adminStorageRefreshBtn: document.getElementById("admin-storage-refresh-btn"),
        adminStorageMeta: document.getElementById("admin-storage-meta"),
        adminStorageList: document.getElementById("admin-storage-list"),
        adminStorageMoreBtn: document.getElementById("admin-storage-more-btn"),
        adminLegalText: document.getElementById("admin-legal-text"),
        saveLegalBtn: document.getElementById("save-legal-btn"),
        adminLegalMeta: document.getElementById("admin-legal-meta"),
      };

      let pollingHandle = null;
      let userMenuOpen = false;
      let localeMenuOpen = false;

      function localeTag() {
        return state.locale === "en" ? "en-US" : "zh-CN";
      }

      function applyTranslations() {
        const meta = LOCALE_META[state.locale] || LOCALE_META.zh;
        document.documentElement.lang = meta.lang;
        document.querySelectorAll("[data-i18n]").forEach((node) => {
          const key = node.getAttribute("data-i18n") || "";
          node.textContent = t(key);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
          const key = node.getAttribute("data-i18n-placeholder") || "";
          node.setAttribute("placeholder", t(key));
        });
        document.querySelectorAll("[data-i18n-alt]").forEach((node) => {
          const key = node.getAttribute("data-i18n-alt") || "";
          node.setAttribute("alt", t(key));
        });
        if (el.localeCurrentFlag) el.localeCurrentFlag.textContent = meta.flag;
        if (el.localeCurrentLabel) el.localeCurrentLabel.textContent = meta.label;
        el.localeOptions.forEach((item) => {
          const option = item;
          const code = option.getAttribute("data-locale-option") || "";
          option.classList.toggle("active", code === state.locale);
        });
        document.title = t("brand.name") + " · " + t("page." + PAGE + ".title");
        if (el.topPublicChip) el.topPublicChip.textContent = t("topbar.publicMode");
        if (el.sidebarToggleBtn) {
          setSidebarCollapsed(document.body.classList.contains("sidebar-collapsed"));
        }
      }

      function setLocale(nextLocale) {
        if (nextLocale !== "zh" && nextLocale !== "en") return;
        state.locale = nextLocale;
        localStorage.setItem(LOCALE_KEY, nextLocale);
        applyTranslations();
        renderHeaderState();
        renderAccountState();
        renderLegalState();
        renderScanState();
        if (state.lastLoginSession) {
          renderLoginSession({ login_session: state.lastLoginSession });
        }
        if (state.overviewJobs && state.overviewJobs.length) {
          renderOverviewCharts(state.overviewJobs);
          renderRecentJobs(state.overviewJobs.slice(0, 10));
        }
        if (state.jobsPageItems && state.jobsPageItems.length) {
          renderJobsPageList({
            jobs: state.jobsPageItems,
            page: state.jobsPage,
            page_size: state.jobsPageSize,
            total: state.jobsTotal,
            total_pages: state.jobsTotalPages,
          });
        }
        renderAdminStorage();
      }

      function setNotice(message, type) {
        if (!el.notice) return;
        el.notice.textContent = message;
        el.notice.className = "notice " + (type || "ok");
        el.notice.classList.remove("hidden");
      }

      function setBusy(button, busy) {
        if (!button) return;
        button.disabled = busy;
      }

      function normalizeErrorMessage(message) {
        const source = String(message || "").trim();
        const mapping = {
          "invalid username or password": "error.invalidCredentials",
          "username >= 3 and password >= 6 are required": "error.usernamePasswordRequirements",
          "username already exists": "error.usernameExists",
          "registration is closed": "error.registrationClosed",
          "current password is incorrect": "error.currentPasswordIncorrect",
          "new password must be at least 6 characters": "error.newPasswordShort",
          "current_password and new_password are required": "error.currentAndNewRequired",
          "username and password are required": "error.credentialsRequired",
          "login required": "error.loginRequired",
          "legal disclaimer must be accepted before starting QR login": "error.needLegalBeforeQR",
          "legal disclaimer must be accepted before creating jobs": "error.needLegalBeforeJobs",
          "cookies are missing or invalid": "error.cookiesMissing",
          "manual cookie upload disabled; use QR login": "error.qrOnly",
          "sudo required": "error.sudoRequired",
          "两次输入的密码不一致": "error.passwordMismatch",
          "请先填入回放链接": "error.needUrls",
        };
        return mapping[source] ? t(mapping[source]) : (source || t("error.generic"));
      }

      function escapeHTML(value) {
        return String(value)
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;")
          .replaceAll('"', "&quot;");
      }

      function formatTime(value) {
        if (!value) return "-";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleString(localeTag());
      }

      function formatBytes(value) {
        const size = Number(value || 0);
        if (!Number.isFinite(size) || size <= 0) return "0 B";
        const units = ["B", "KB", "MB", "GB", "TB"];
        let current = size;
        let index = 0;
        while (current >= 1024 && index < units.length - 1) {
          current /= 1024;
          index += 1;
        }
        const digits = current >= 100 || index === 0 ? 0 : 1;
        return current.toFixed(digits) + " " + units[index];
      }

      function formatStage(stage) {
        switch (stage) {
          case "waiting_runner": return t("stage.waiting_runner");
          case "preparing": return t("stage.preparing");
          case "queued": return t("stage.queued");
          case "resolving": return t("stage.resolving");
          case "downloading": return t("stage.downloading");
          case "converting": return t("stage.converting");
          case "uploading_r2": return t("stage.uploading_r2");
          case "completed": return t("stage.completed");
          case "failed": return t("stage.failed");
          default: return stage || "-";
        }
      }

      function formatStatus(status) {
        switch (String(status || "").toLowerCase()) {
          case "queued": return t("job.status.queued");
          case "running": return t("job.status.running");
          case "succeeded": return t("job.status.succeeded");
          case "failed": return t("job.status.failed");
          default: return status || "-";
        }
      }

      function request(path, options) {
        return fetch(path, {
          ...(options || {}),
          headers: {
            ...(options && options.headers ? options.headers : {}),
            ...(options && options.body ? { "Content-Type": "application/json" } : {}),
          },
        }).then(async (response) => {
          const contentType = response.headers.get("content-type") || "";
          const payload = contentType.includes("application/json") ? await response.json() : await response.text();
          if (!response.ok) {
            const message = typeof payload === "string" ? payload : (payload.error || payload.message || ("Request failed: " + response.status));
            throw new Error(message);
          }
          return payload;
        });
      }

      function redirectTo(path) {
        window.location.href = path;
      }

      function setBadge(element, type, text) {
        if (!element) return;
        element.className = "badge " + type;
        element.textContent = text;
      }

      function setSidebarCollapsed(collapsed) {
        document.body.classList.toggle("sidebar-collapsed", collapsed);
        if (el.sidebarToggleBtn) {
          el.sidebarToggleBtn.innerHTML = collapsed
            ? '<span class="sidebar-toggle-icon">〉〉</span><span class="sidebar-toggle-label">' + escapeHTML(t("sidebar.expand")) + '</span>'
            : '<span class="sidebar-toggle-icon">〈〈</span><span class="sidebar-toggle-label">' + escapeHTML(t("sidebar.collapse")) + '</span>';
        }
        localStorage.setItem(SIDEBAR_KEY, collapsed ? "1" : "0");
      }

      function setupSidebar() {
        if (!el.sidebarToggleBtn) return;
        const initial = localStorage.getItem(SIDEBAR_KEY) === "1";
        setSidebarCollapsed(initial);
        el.sidebarToggleBtn.addEventListener("click", () => {
          setSidebarCollapsed(!document.body.classList.contains("sidebar-collapsed"));
        });
      }

      function setUserMenuOpen(nextOpen) {
        userMenuOpen = Boolean(nextOpen);
        if (!el.userMenu || !el.userMenuTrigger) return;
        if (userMenuOpen) {
          el.userMenu.classList.remove("hidden");
          el.userMenuTrigger.setAttribute("aria-expanded", "true");
        } else {
          el.userMenu.classList.add("hidden");
          el.userMenuTrigger.setAttribute("aria-expanded", "false");
        }
      }

      function setupUserMenu() {
        if (!el.userMenuWrap || !el.userMenuTrigger || !el.userMenu) return;
        const prefersHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (prefersHover) {
          el.userMenuWrap.addEventListener("mouseenter", () => setUserMenuOpen(true));
          el.userMenuWrap.addEventListener("mouseleave", () => setUserMenuOpen(false));
        }
        el.userMenuTrigger.addEventListener("click", (event) => {
          event.stopPropagation();
          setUserMenuOpen(!userMenuOpen);
        });
        document.addEventListener("click", (event) => {
          if (!el.userMenuWrap.contains(event.target)) {
            setUserMenuOpen(false);
          }
        });
      }

      function setLocaleMenuOpen(nextOpen) {
        localeMenuOpen = Boolean(nextOpen);
        if (!el.localeMenu || !el.localeTrigger) return;
        el.localeMenu.classList.toggle("hidden", !localeMenuOpen);
        el.localeTrigger.setAttribute("aria-expanded", localeMenuOpen ? "true" : "false");
      }

      function setupLocaleMenu() {
        if (!el.localeTrigger || !el.localeMenu || !el.localeSwitcher) return;
        el.localeTrigger.addEventListener("click", (event) => {
          event.stopPropagation();
          setLocaleMenuOpen(!localeMenuOpen);
        });
        el.localeOptions.forEach((item) => {
          const option = item;
          option.addEventListener("click", (event) => {
            event.stopPropagation();
            setLocale(option.getAttribute("data-locale-option") || "zh");
            setLocaleMenuOpen(false);
          });
        });
        document.addEventListener("click", (event) => {
          if (!el.localeSwitcher.contains(event.target)) {
            setLocaleMenuOpen(false);
          }
        });
      }

      function setupPageTransitions() {
        requestAnimationFrame(() => {
          document.body.classList.add("page-ready");
        });
        document.querySelectorAll("[data-page-link]").forEach((link) => {
          const anchor = link;
          if (anchor.dataset.transitionBound === "1") return;
          anchor.dataset.transitionBound = "1";
          anchor.addEventListener("click", (event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            if (anchor.target && anchor.target !== "_self") return;
            const href = anchor.getAttribute("href") || "";
            if (!href.startsWith("/")) return;
            event.preventDefault();
            setUserMenuOpen(false);
            document.body.classList.add("page-leaving");
            window.setTimeout(() => {
              window.location.href = href;
            }, 120);
          });
        });
      }

      function switchAuthTab(nextTab) {
        state.authTab = nextTab === "register" ? "register" : "login";
        if (el.authTabLogin) el.authTabLogin.classList.toggle("active", state.authTab === "login");
        if (el.authTabRegister) el.authTabRegister.classList.toggle("active", state.authTab === "register");
        if (el.loginFormPanel) el.loginFormPanel.classList.toggle("hidden", state.authTab !== "login");
        if (el.registerFormPanel) el.registerFormPanel.classList.toggle("hidden", state.authTab !== "register");
      }

      function renderHeaderState() {
        if (!el.userMenuWrap) return;
        if (!state.authenticated || !state.user) {
          el.userMenuWrap.classList.add("hidden");
          if (el.topStatusChip) el.topStatusChip.textContent = t("topbar.status.waitLegal");
          return;
        }
        el.userMenuWrap.classList.remove("hidden");
        const username = state.user.username || "";
        const initials = username.slice(0, 2).toUpperCase() || "U";
        if (el.avatarFallback) el.avatarFallback.textContent = initials;
        if (el.profileName) el.profileName.textContent = username;
        if (el.profileRole) el.profileRole.textContent = state.user.is_sudo ? t("role.sudo") : t("role.user");
        if (el.userMenuName) el.userMenuName.textContent = username;
        if (el.userMenuRole) el.userMenuRole.textContent = state.user.is_sudo ? t("role.sudo") : t("role.user");
        if (el.userMenuAdminLink) {
          if (state.user.is_sudo) el.userMenuAdminLink.classList.remove("hidden"); else el.userMenuAdminLink.classList.add("hidden");
        }
        if (el.navAdmin) {
          if (state.user.is_sudo) el.navAdmin.classList.remove("hidden"); else el.navAdmin.classList.add("hidden");
        }
        if (el.navLegal) {
          if (state.legalAccepted) el.navLegal.classList.add("hidden"); else el.navLegal.classList.remove("hidden");
        }
        if (el.topStatusChip) {
          if (!state.legalAccepted) {
            el.topStatusChip.textContent = t("topbar.status.waitLegal");
          } else if (!state.cookiesReady) {
            el.topStatusChip.textContent = t("topbar.status.waitCookie");
          } else {
            el.topStatusChip.textContent = t("topbar.status.ready");
          }
        }
        if (el.topPublicChip) {
          el.topPublicChip.textContent = t("topbar.publicMode");
        }
        [
          [el.navOverview, PAGE === "overview"],
          [el.navLegal, PAGE === "legal"],
          [el.navScan, PAGE === "scan"],
          [el.navJobs, PAGE === "jobs"],
          [el.navAccount, PAGE === "account"],
          [el.navAdmin, PAGE === "admin"],
        ].forEach(([element, active]) => {
          if (element) element.classList.toggle("active", active);
        });
      }

      function renderMetricStrip(payload) {
        if (el.statCookies) el.statCookies.textContent = state.cookiesReady ? t("metric.cookies.ready") : t("metric.cookies.pending");
        if (el.statTotal) el.statTotal.textContent = String(payload.total_jobs || 0);
        if (el.statRunning) el.statRunning.textContent = String((payload.running_jobs || 0) + (payload.queued_jobs || 0));
        if (el.statSuccess) el.statSuccess.textContent = String(payload.succeeded_jobs || 0);
        if (el.statFailed) el.statFailed.textContent = String(payload.failed_jobs || 0);
        if (el.statCookieTime) el.statCookieTime.textContent = state.cookiesUpdatedAt ? formatTime(state.cookiesUpdatedAt).replace(/.*\s/, "") : "-";
        const recentJobs = Array.isArray(state.overviewJobs) ? state.overviewJobs : [];
        const weekCutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const weeklyCreated = recentJobs.filter((job) => {
          const ts = new Date(job.created_at || "").getTime();
          return Number.isFinite(ts) && ts >= weekCutoff;
        }).length;
        const completed = recentJobs.filter((job) => String(job.status).toLowerCase() === "succeeded").length;
        const completionRate = recentJobs.length ? Math.round((completed / recentJobs.length) * 100) : 0;
        if (el.statCreatedWeek) el.statCreatedWeek.textContent = String(weeklyCreated);
        if (el.statCompletionRate) el.statCompletionRate.textContent = completionRate + "%";
      }

      function renderOverviewGate() {
        if (!el.overviewGate || !el.overviewGateTitle || !el.overviewGateCopy || !el.overviewGateLink || !el.overviewDownloadForm) return;
        if (!state.legalAccepted) {
          el.overviewGate.classList.remove("hidden");
          el.overviewDownloadForm.classList.add("hidden");
          el.overviewGateTitle.textContent = t("overview.gate.needLegalTitle");
          el.overviewGateCopy.textContent = t("overview.gate.needLegalCopy");
          el.overviewGateLink.textContent = t("overview.gate.needLegalAction");
          el.overviewGateLink.setAttribute("href", "/legal");
          return;
        }
        if (!state.cookiesReady) {
          el.overviewGate.classList.remove("hidden");
          el.overviewDownloadForm.classList.add("hidden");
          el.overviewGateTitle.textContent = t("overview.gate.needScanTitle");
          el.overviewGateCopy.textContent = t("overview.gate.needScanCopy");
          el.overviewGateLink.textContent = t("overview.gate.needScanAction");
          el.overviewGateLink.setAttribute("href", "/scan");
          return;
        }
        el.overviewGate.classList.add("hidden");
        el.overviewDownloadForm.classList.remove("hidden");
      }

      function renderOverviewToolbar() {
        if (el.overviewRangeBtn) {
          el.overviewRangeBtn.textContent = state.overviewRangeDays === 30 ? t("overview.range30") : t("overview.range7");
          el.overviewRangeBtn.classList.toggle("active", state.overviewRangeDays === 30);
        }
        if (el.overviewGranularityBtn) {
          el.overviewGranularityBtn.textContent = state.overviewGranularity === "hour" ? t("overview.granularityHour") : t("overview.granularityDay");
          el.overviewGranularityBtn.classList.toggle("active", state.overviewGranularity === "hour");
        }
        if (el.overviewTrendTitle) {
          if (state.overviewGranularity === "hour") {
            el.overviewTrendTitle.textContent = t("overview.trend24h");
          } else {
            el.overviewTrendTitle.textContent = state.overviewRangeDays === 30 ? t("overview.trend30") : t("overview.trend7");
          }
        }
      }

      function renderOverviewCharts(jobs) {
        if (!el.overviewDonut || !el.overviewDonutTable || !el.overviewTrend) return;
        renderOverviewToolbar();
        const records = Array.isArray(jobs) ? jobs : [];
        const counts = {
          succeeded: records.filter((job) => String(job.status).toLowerCase() === "succeeded").length,
          running: records.filter((job) => ["running", "queued"].includes(String(job.status).toLowerCase())).length,
          failed: records.filter((job) => String(job.status).toLowerCase() === "failed").length,
        };
        const total = Math.max(1, counts.succeeded + counts.running + counts.failed);
        const succeededPct = (counts.succeeded / total) * 100;
        const runningPct = (counts.running / total) * 100;
        el.overviewDonut.style.background = "conic-gradient(var(--blue) 0 " + succeededPct + "%, var(--green) " + succeededPct + "% " + (succeededPct + runningPct) + "%, var(--red) " + (succeededPct + runningPct) + "% 100%)";
        el.overviewDonutTable.innerHTML = [
          '<div class="mini-table-head"><div>' + escapeHTML(t("overview.table.status")) + '</div><div>' + escapeHTML(t("overview.table.count")) + '</div><div>' + escapeHTML(t("overview.table.percent")) + '</div><div>' + escapeHTML(t("overview.table.note")) + '</div></div>',
          '<div class="mini-table-row"><div>' + escapeHTML(t("overview.table.success")) + '</div><div>' + counts.succeeded + '</div><div>' + Math.round((counts.succeeded / total) * 100) + '%</div><div style="color:var(--green);">' + escapeHTML(t("overview.table.readyNote")) + '</div></div>',
          '<div class="mini-table-row"><div>' + escapeHTML(t("overview.table.running")) + '</div><div>' + counts.running + '</div><div>' + Math.round((counts.running / total) * 100) + '%</div><div style="color:var(--blue);">' + escapeHTML(t("overview.table.runningNote")) + '</div></div>',
          '<div class="mini-table-row"><div>' + escapeHTML(t("overview.table.failed")) + '</div><div>' + counts.failed + '</div><div>' + Math.round((counts.failed / total) * 100) + '%</div><div style="color:var(--red);">' + escapeHTML(t("overview.table.failedNote")) + '</div></div>',
        ].join("");

        const timeline = [];
        if (state.overviewGranularity === "hour") {
          for (let offset = 23; offset >= 0; offset -= 1) {
            const date = new Date();
            date.setMinutes(0, 0, 0);
            date.setHours(date.getHours() - offset);
            const key = date.toISOString().slice(0, 13);
            timeline.push({
              key,
              label: String(date.getHours()).padStart(2, "0") + ":00",
              created: 0,
              done: 0,
              failed: 0,
            });
          }
          records.forEach((job) => {
            const raw = job.updated_at || job.created_at || "";
            const ts = new Date(raw);
            if (Number.isNaN(ts.getTime())) return;
            const key = ts.toISOString().slice(0, 13);
            const target = timeline.find((entry) => entry.key === key);
            if (!target) return;
            target.created += 1;
            if (String(job.status).toLowerCase() === "succeeded") target.done += 1;
            if (String(job.status).toLowerCase() === "failed") target.failed += 1;
          });
        } else {
          for (let offset = state.overviewRangeDays - 1; offset >= 0; offset -= 1) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - offset);
            const key = date.toISOString().slice(0, 10);
            timeline.push({
              key,
              label: date.toLocaleDateString(localeTag(), { month: "numeric", day: "numeric" }),
              created: 0,
              done: 0,
              failed: 0,
            });
          }
          records.forEach((job) => {
            const raw = job.updated_at || job.created_at || "";
            const ts = new Date(raw);
            if (Number.isNaN(ts.getTime())) return;
            const key = ts.toISOString().slice(0, 10);
            const target = timeline.find((entry) => entry.key === key);
            if (!target) return;
            target.created += 1;
            if (String(job.status).toLowerCase() === "succeeded") target.done += 1;
            if (String(job.status).toLowerCase() === "failed") target.failed += 1;
          });
        }
        const maxValue = Math.max(1, ...timeline.flatMap((item) => [item.created, item.done, item.failed]));
        const width = 640;
        const height = 220;
        const paddingX = 36;
        const paddingY = 24;
        const step = (width - paddingX * 2) / Math.max(1, timeline.length - 1);
        const pathFor = (key) => timeline
          .map((item, index) => {
            const x = paddingX + step * index;
            const y = height - paddingY - ((item[key] / maxValue) * (height - paddingY * 2));
            return (index === 0 ? "M" : "L") + x + " " + y;
          })
          .join(" ");
        const areaFor = (key) => {
          const points = timeline.map((item, index) => {
            const x = paddingX + step * index;
            const y = height - paddingY - ((item[key] / maxValue) * (height - paddingY * 2));
            return x + " " + y;
          });
          const startX = paddingX;
          const endX = paddingX + step * Math.max(0, timeline.length - 1);
          const baselineY = height - paddingY;
          return "M " + startX + " " + baselineY + " L " + points.join(" L ") + " L " + endX + " " + baselineY + " Z";
        };
        const pointsFor = (key, color) => timeline.map((item, index) => {
          const x = paddingX + step * index;
          const y = height - paddingY - ((item[key] / maxValue) * (height - paddingY * 2));
          return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="' + color + '" stroke="white" stroke-width="1.5"></circle>';
        }).join("");
        const labelStep = state.overviewGranularity === "hour"
          ? 3
          : (timeline.length > 14 ? 4 : 1);
        const labels = timeline.map((item, index) => {
          if (index !== timeline.length - 1 && index % labelStep !== 0) return "";
          const x = paddingX + step * index;
          return '<text x="' + x + '" y="' + (height - 4) + '" text-anchor="middle" fill="#94a3b8" font-size="11">' + item.label + '</text>';
        }).join("");
        el.overviewTrend.innerHTML = [
          '<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="none">',
          '<path d="' + areaFor("created") + '" fill="rgba(59,130,246,0.16)"></path>',
          '<path d="' + pathFor("created") + '" fill="none" stroke="var(--blue)" stroke-width="3" stroke-linecap="round"></path>',
          '<path d="' + pathFor("done") + '" fill="none" stroke="var(--green)" stroke-width="3" stroke-linecap="round"></path>',
          '<path d="' + pathFor("failed") + '" fill="none" stroke="var(--red)" stroke-width="3" stroke-linecap="round"></path>',
          pointsFor("created", "var(--blue)"),
          pointsFor("done", "var(--green)"),
          pointsFor("failed", "var(--red)"),
          labels,
          '</svg>',
        ].join("");
      }

      function renderRecentJobs(jobs) {
        if (!el.recentRecords) return;
        const records = Array.isArray(jobs) ? jobs : [];
        if (records.length === 0) {
          el.recentRecords.innerHTML = '<div class="empty">' + escapeHTML(t("common.noRecords")) + '</div>';
          return;
        }
        el.recentRecords.innerHTML = records.slice(0, 10).map((job) => {
          const title = job.current_title || (Array.isArray(job.titles) && job.titles[0]) || t("jobs.defaultTitle");
          const badgeClass = job.status === "succeeded" ? "ok" : (job.status === "failed" ? "warn" : "active");
          const amountText = job.status === "succeeded"
            ? t("jobs.status.finished")
            : (job.status === "failed" ? t("jobs.status.failed") : t("jobs.status.running"));
          const subtitle = formatTime(job.updated_at || job.created_at);
          return [
            '<div class="recent-row">',
            '<div class="recent-icon">⌁</div>',
            '<div class="recent-main"><div class="recent-title">' + escapeHTML(title) + '</div><div class="recent-subtitle">' + escapeHTML(subtitle) + '</div></div>',
            '<div class="recent-side"><div class="recent-amount ' + badgeClass + '">' + escapeHTML(amountText) + '</div><div class="recent-meta">' + escapeHTML(String(Math.round(Number(job.progress_percent || 0)))) + '%</div></div>',
            '</div>',
          ].join("");
        }).join("");
      }

      function renderLegalText(text) {
        if (!el.legalText) return;
        const source = String(text || "").trim();
        if (!source) {
          el.legalText.innerHTML = '<div class="empty">' + escapeHTML(t("legal.empty")) + '</div>';
          return;
        }
        const blocks = source.split(/\\n\\s*\\n/g).map((block) => block.trim()).filter(Boolean);
        el.legalText.innerHTML = blocks.map((block) => {
          if (block.startsWith("## ")) {
            return "<h3>" + escapeHTML(block.slice(3).trim()) + "</h3>";
          }
          return "<p>" + escapeHTML(block).replaceAll("\\n", "<br/>") + "</p>";
        }).join("");
      }

      function renderLegalState() {
        if (!el.legalBadge || !el.legalState || !el.legalVersionMeta || !el.acceptLegalBtn || !el.legalConfirmCheck || !el.legalCheckboxRow) return;
        el.legalVersionMeta.textContent = state.legalVersion ? t("legal.versionCurrent", { version: state.legalVersion }) : "";
        if (state.legalAccepted) {
          setBadge(el.legalBadge, "ok", t("status.done"));
          el.legalState.textContent = t("legal.stateAccepted");
          el.legalState.className = "notice ok";
          el.legalState.classList.remove("hidden");
          el.legalCheckboxRow.classList.add("hidden");
          el.acceptLegalBtn.classList.add("hidden");
        } else {
          setBadge(el.legalBadge, "warn", t("status.notDone"));
          el.legalState.textContent = t("legal.statePending");
          el.legalState.className = "notice warn";
          el.legalState.classList.remove("hidden");
          el.legalCheckboxRow.classList.remove("hidden");
          el.acceptLegalBtn.classList.remove("hidden");
          el.legalConfirmCheck.disabled = false;
          el.legalConfirmCheck.checked = state.legalConfirmVersion === state.legalVersion && Boolean(state.legalVersion);
          el.acceptLegalBtn.disabled = !state.legalVersion || state.legalConfirmVersion !== state.legalVersion;
        }
      }

      function qrImageURL(value) {
        if (!value) return "";
        return "https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=" + encodeURIComponent(value);
      }

      function renderScanState() {
        if (!el.cookieBadge || !el.cookieState || !el.cookieMeta || !el.startLoginWorkflowBtn) return;
        const loginBusy = state.loginSessionStatus === "pending" || state.loginSessionStatus === "qr_ready";
        if (state.cookiesReady) {
          setBadge(el.cookieBadge, "ok", t("status.done"));
          el.cookieState.textContent = t("scan.ready");
          el.cookieState.className = "notice ok";
          el.cookieState.classList.remove("hidden");
          el.cookieMeta.textContent = state.cookiesUpdatedAt ? t("scan.metaUpdated", { time: formatTime(state.cookiesUpdatedAt) }) : "";
          el.startLoginWorkflowBtn.textContent = t("scan.restartAction");
        } else {
          setBadge(el.cookieBadge, loginBusy ? "active" : "warn", loginBusy ? t("status.inProgress") : t("status.notDone"));
          el.cookieState.textContent = t("scan.pending");
          el.cookieState.className = "notice warn";
          el.cookieState.classList.remove("hidden");
          el.cookieMeta.textContent = t("scan.metaQrOnly");
          el.startLoginWorkflowBtn.textContent = t("scan.startAction");
        }
        el.startLoginWorkflowBtn.disabled = !state.legalAccepted || loginBusy;
      }

      function renderLoginSession(payload) {
        if (!el.loginBox || !el.loginStatus || !el.loginHint || !el.loginQRImage) return;
        const session = payload && payload.login_session ? payload.login_session : null;
        if (!session) {
          state.loginSessionId = "";
          state.loginSessionStatus = "";
          state.lastLoginSession = null;
          el.loginBox.classList.add("hidden");
          el.loginQRImage.classList.add("hidden");
          return;
        }
        state.loginSessionId = session.id || "";
        state.loginSessionStatus = session.status || "";
        state.lastLoginSession = session;
        el.loginBox.classList.remove("hidden");
        if (session.status === "pending") {
          el.loginStatus.textContent = t("scan.generating");
          el.loginHint.textContent = t("scan.generatingHint");
          el.loginQRImage.classList.add("hidden");
        } else if (session.status === "qr_ready") {
          el.loginStatus.textContent = t("scan.readyTitle");
          el.loginHint.textContent = t("scan.readyHint");
          el.loginQRImage.src = qrImageURL(session.qr_url || "");
          el.loginQRImage.classList.remove("hidden");
        } else if (session.status === "completed") {
          el.loginStatus.textContent = t("scan.completedTitle");
          el.loginHint.textContent = t("scan.completedHint");
          el.loginQRImage.classList.add("hidden");
        } else {
          el.loginStatus.textContent = t("scan.failedTitle");
          el.loginHint.textContent = session.error_message || t("scan.failedFallback");
          el.loginQRImage.classList.add("hidden");
        }
      }

      function renderJobsPageList(payload) {
        if (!el.jobsDetailList || !el.jobsPageIndicator || !el.jobsPaginationSummary || !el.jobsPrevBtn || !el.jobsNextBtn) return;
        const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
        state.jobsPageItems = jobs;
        state.jobsTotal = Number(payload.total || 0);
        state.jobsTotalPages = Math.max(1, Number(payload.total_pages || 1));
        state.jobsPage = Number(payload.page || 1);
        state.jobsPageSize = Number(payload.page_size || 10);

        el.pageSizeButtons.forEach((button) => {
          button.classList.toggle("active", Number(button.getAttribute("data-page-size") || 10) === state.jobsPageSize);
        });
        el.jobsPageIndicator.textContent = state.jobsPage + " / " + state.jobsTotalPages;
        el.jobsPaginationSummary.textContent = t("jobs.pageSummary", { total: state.jobsTotal, pageSize: state.jobsPageSize });
        el.jobsPrevBtn.disabled = state.jobsPage <= 1;
        el.jobsNextBtn.disabled = state.jobsPage >= state.jobsTotalPages;

        if (jobs.length === 0) {
          el.jobsDetailList.innerHTML = '<div class="empty">' + escapeHTML(t("jobs.empty")) + '</div>';
          return;
        }

        el.jobsDetailList.innerHTML = jobs.map((job) => {
          const title = job.current_title || (Array.isArray(job.titles) && job.titles[0]) || t("jobs.defaultTitle");
          const badgeClass = job.status === "succeeded" ? "ok" : (job.status === "failed" ? "warn" : "active");
          const isExpanded = state.expandedJobId === job.id;
          const files = Array.isArray(job.files) ? job.files : [];
          const errors = Array.isArray(job.errors) ? job.errors : [];
          return [
            '<section class="job-row">',
            '<div class="job-row-main" data-job-toggle="' + escapeHTML(job.id) + '">',
            '<div class="job-row-title">' + escapeHTML(title) + '</div>',
            '<div class="job-row-meta">' + escapeHTML(formatStatus(job.status)) + '</div>',
            '<div class="job-row-meta">' + escapeHTML(formatTime(job.updated_at || job.created_at)) + '</div>',
            '<div class="job-row-meta">' + escapeHTML(String(Math.round(Number(job.progress_percent || 0)))) + '%</div>',
            '<span class="badge ' + badgeClass + '">' + escapeHTML(formatStage(job.stage)) + '</span>',
            '</div>',
            isExpanded ? '<div class="job-row-detail"><div class="job-row-detail-grid">' + [
              '<div class="meta-line">' + escapeHTML(t("jobs.jobId", { id: job.id })) + '</div>',
              '<div class="meta-line">' + escapeHTML(t("jobs.createdAt", { time: formatTime(job.created_at) })) + '</div>',
              files.length ? '<div class="job-inline-files">' + files.map((file) => [
                '<div class="job-inline-file">',
                '<div class="file-name">' + escapeHTML(file.name || file.relative_path || t("jobs.noName")) + '</div>',
                file.download_url ? '<a class="mini-link" href="' + escapeHTML(file.download_url) + '" target="_blank" rel="noreferrer">' + escapeHTML(t("jobs.downloadFile")) + '</a>' : '<span class="muted">' + escapeHTML(t("jobs.processing")) + '</span>',
                '</div>',
              ].join("")).join("") + '</div>' : '',
              errors.length ? '<div class="job-inline-errors">' + errors.map(escapeHTML).join("<br/>") + '</div>' : '',
            ].join("") + '</div></div>' : '',
            '</section>',
          ].join("");
        }).join("");

        el.jobsDetailList.querySelectorAll("[data-job-toggle]").forEach((item) => {
          item.addEventListener("click", () => {
            const jobId = item.getAttribute("data-job-toggle") || "";
            state.expandedJobId = state.expandedJobId === jobId ? "" : jobId;
            renderJobsPageList({
              jobs: state.jobsPageItems,
              page: state.jobsPage,
              page_size: state.jobsPageSize,
              total: state.jobsTotal,
              total_pages: state.jobsTotalPages,
            });
          });
        });
      }

      function renderAccountState() {
        if (!el.accountSummary) return;
        if (!state.authenticated || !state.user) {
          el.accountSummary.textContent = t("account.pleaseLogin");
          return;
        }
        const status = [];
        if (!state.legalAccepted) status.push(t("account.statusNeedLegal"));
        if (!state.cookiesReady) status.push(t("account.statusNeedScan"));
        if (status.length === 0) status.push(t("account.statusNormal"));
        el.accountSummary.textContent = t("account.currentUser", { username: state.user.username, status: status.join(" · ") });
      }

      function renderAdminUsers(users) {
        if (!el.adminUsers || !el.adminUserMeta) return;
        const records = Array.isArray(users) ? users : [];
        const needingAttention = records.filter((user) => !user.legal_accepted || !user.cookies_ready);
        const normalCount = records.length - needingAttention.length;
        el.adminUserMeta.textContent = t("admin.userSummary", { attention: needingAttention.length, normal: normalCount });

        if (needingAttention.length === 0) {
          el.adminUsers.innerHTML = '<div class="empty">' + escapeHTML(t("admin.userEmpty")) + '</div>';
          return;
        }

        el.adminUsers.innerHTML = needingAttention.map((user) => [
          '<section class="admin-user">',
          '<div class="admin-user-name">' + escapeHTML(user.username) + (user.is_sudo ? escapeHTML(t("admin.userSudoSuffix")) : '') + '</div>',
          '<div class="meta-line">' + escapeHTML(t("admin.userRegistered", { time: formatTime(user.created_at) })) + '</div>',
          (!user.legal_accepted ? '<div class="meta-line">' + escapeHTML(t("admin.userNeedLegal")) + '</div>' : ''),
          (!user.cookies_ready ? '<div class="meta-line">' + escapeHTML(t("admin.userNeedScan")) + '</div>' : ''),
          '<div class="meta-line">' + escapeHTML(t("admin.userTasks", { count: String(user.total_jobs || 0) })) + '</div>',
          '</section>',
        ].join("")).join("");
      }

      function renderAdminLegal(version, text, force) {
        if (el.adminLegalText && (!state.adminLegalDirty || force)) {
          el.adminLegalText.value = text || "";
        }
        if (el.adminLegalMeta) {
          el.adminLegalMeta.textContent = version ? t("admin.legalVersion", { version }) : "";
        }
      }

      function renderAdminStorage() {
        if (!el.adminStorageList || !el.adminStorageMeta) return;
        const items = Array.isArray(state.adminStorageItems) ? state.adminStorageItems : [];
        const prefix = String(state.adminStoragePrefix || "").trim();
        el.adminStorageMeta.textContent = t("admin.storageMeta", {
          prefix: prefix ? t("admin.storagePrefixMeta", { prefix }) : "",
          count: items.length,
        });

        if (items.length === 0) {
          el.adminStorageList.innerHTML = '<div class="empty">' + escapeHTML(t("admin.storageEmpty")) + '</div>';
        } else {
          el.adminStorageList.innerHTML = items.map((item) => {
            const names = Array.isArray(item.names) ? item.names : [];
            const owners = Array.isArray(item.owners) ? item.owners : [];
            const extraNames = names.length > 1 ? names.slice(1, 4) : [];
            return [
              '<section class="storage-item">',
              '<div class="storage-head">',
              '<div>',
              '<div class="storage-name">' + escapeHTML(names[0] || item.key) + '</div>',
              '<div class="storage-key">' + escapeHTML(item.key || "-") + '</div>',
              '</div>',
              item.download_url ? '<a class="button-link primary" href="' + escapeHTML(item.download_url) + '" target="_blank" rel="noreferrer">' + escapeHTML(t("admin.downloadFile")) + '</a>' : '',
              '</div>',
              '<div class="storage-meta-grid">',
              '<span><strong>' + escapeHTML(t("admin.storageSize")) + '</strong> ' + escapeHTML(formatBytes(item.size)) + '</span>',
              '<span><strong>' + escapeHTML(t("admin.storageUploadedAt")) + '</strong> ' + escapeHTML(formatTime(item.uploaded_at)) + '</span>',
              '<span><strong>' + escapeHTML(t("admin.storageRefs")) + '</strong> ' + escapeHTML(String(item.refs || 0)) + '</span>',
              '</div>',
              owners.length ? '<div class="storage-tags">' + owners.slice(0, 6).map((owner) => '<span class="storage-tag">' + escapeHTML(owner) + '</span>').join("") + '</div>' : '',
              extraNames.length ? '<div class="meta-line">' + escapeHTML(t("admin.storageAliases", { names: extraNames.join(" / ") })) + '</div>' : '',
              '</section>',
            ].join("");
          }).join("");
        }

        if (el.adminStorageMoreBtn) {
          if (state.adminStorageHasMore) el.adminStorageMoreBtn.classList.remove("hidden"); else el.adminStorageMoreBtn.classList.add("hidden");
        }
      }

      function refreshAuth() {
        return request("/api/auth/me").then((payload) => {
          state.authenticated = Boolean(payload.authenticated);
          state.registrationOpen = Boolean(payload.registration_open);
          state.legalAccepted = Boolean(payload.legal_accepted);
          state.legalAcceptedAt = payload.legal_accepted_at || "";
          state.legalVersion = payload.legal_version || "";
          state.cookiesReady = Boolean(payload.cookies_ready);
          state.cookiesUpdatedAt = payload.cookies_updated_at || "";
          state.user = payload.user || null;

          if (state.legalConfirmVersion && state.legalConfirmVersion !== state.legalVersion) {
            state.legalConfirmVersion = "";
          }

          if (PAGE !== "login" && !state.authenticated) {
            redirectTo("/login");
            return payload;
          }

          if (PAGE === "login" && el.registerCardHint) {
            el.registerCardHint.textContent = state.registrationOpen ? t("auth.registerHintOpen") : t("auth.registerHintClosed");
          }
          if (PAGE === "login" && el.authTabRegister && el.registerFormPanel) {
            if (state.registrationOpen) {
              el.authTabRegister.classList.remove("hidden");
            } else {
              el.authTabRegister.classList.add("hidden");
              switchAuthTab("login");
            }
          }

          renderHeaderState();
          return payload;
        });
      }

      function refreshStatus() {
        if (!state.authenticated) return Promise.resolve(null);
        return request("/api/status").then((payload) => {
          renderMetricStrip(payload);
          renderOverviewGate();
          return payload;
        });
      }

      function refreshOverviewData() {
        if (!state.authenticated || (!el.recentRecords && !el.overviewDonut)) return Promise.resolve(null);
        return request("/api/jobs?page=1&page_size=50").then((payload) => {
          state.overviewJobs = Array.isArray(payload.jobs) ? payload.jobs : [];
          renderRecentJobs(state.overviewJobs.slice(0, 10));
          renderOverviewCharts(state.overviewJobs);
          return payload;
        });
      }

      function refreshJobsPage() {
        if (!state.authenticated || !el.jobsDetailList) return Promise.resolve(null);
        return request("/api/jobs?page=" + encodeURIComponent(String(state.jobsPage)) + "&page_size=" + encodeURIComponent(String(state.jobsPageSize))).then((payload) => {
          renderJobsPageList(payload);
          return payload;
        });
      }

      function refreshLegalConfig() {
        if (!el.legalText && !el.legalVersionMeta) return Promise.resolve(null);
        return request("/api/legal-config").then((payload) => {
          state.legalVersion = payload.version || state.legalVersion;
          state.legalText = payload.text || "";
          renderLegalText(state.legalText);
          renderLegalState();
          return payload;
        });
      }

      function refreshLoginSession() {
        if (!state.authenticated) return Promise.resolve(null);
        const suffix = state.loginSessionId ? ("?id=" + encodeURIComponent(state.loginSessionId)) : "";
        return request("/api/login-workflow" + suffix).then((payload) => {
          if (el.loginBox) {
            renderLoginSession(payload);
          } else {
            const session = payload && payload.login_session ? payload.login_session : null;
            state.loginSessionId = session ? (session.id || "") : "";
            state.loginSessionStatus = session ? (session.status || "") : "";
          }
          renderScanState();
          return payload;
        });
      }

      function refreshAdminUsers() {
        if (!state.authenticated || !state.user || !state.user.is_sudo || !el.adminUsers) return Promise.resolve(null);
        return request("/api/admin/users").then((payload) => {
          renderAdminUsers(payload.users || []);
          return payload;
        });
      }

      function refreshAdminLegal() {
        if (!state.authenticated || !state.user || !state.user.is_sudo || !el.adminLegalText) return Promise.resolve(null);
        return request("/api/admin/legal").then((payload) => {
          renderAdminLegal(payload.version || "", payload.text || "", false);
          return payload;
        });
      }

      function refreshAdminStorage(reset) {
        if (!state.authenticated || !state.user || !state.user.is_sudo || !el.adminStorageList) return Promise.resolve(null);
        const prefix = (el.adminStoragePrefix ? el.adminStoragePrefix.value : state.adminStoragePrefix || "").trim();
        const params = new URLSearchParams();
        if (prefix) params.set("prefix", prefix);
        if (!reset && state.adminStorageCursor) params.set("cursor", state.adminStorageCursor);
        return request("/api/admin/storage" + (params.toString() ? ("?" + params.toString()) : "")).then((payload) => {
          state.adminStoragePrefix = prefix;
          state.adminStorageCursor = payload.cursor || "";
          state.adminStorageHasMore = Boolean(payload.has_more);
          state.adminStorageItems = reset ? (payload.items || []) : state.adminStorageItems.concat(payload.items || []);
          renderAdminStorage();
          return payload;
        });
      }

      function login() {
        return request("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            username: (el.loginUsername ? el.loginUsername.value : "").trim(),
            password: (el.loginPassword ? el.loginPassword.value : "").trim(),
          }),
        }).then(() => {
          redirectTo("/overview");
        });
      }

      function registerUser() {
        const username = (el.registerUsername ? el.registerUsername.value : "").trim();
        const password = (el.registerPassword ? el.registerPassword.value : "").trim();
        const confirmPassword = (el.registerPasswordConfirm ? el.registerPasswordConfirm.value : "").trim();
        if (password !== confirmPassword) {
          return Promise.reject(new Error(t("error.passwordMismatch")));
        }
        return request("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        }).then(() => {
          redirectTo("/legal");
        });
      }

      function logout() {
        return request("/api/auth/logout", { method: "POST" }).then(() => {
          redirectTo("/login");
        });
      }

      function acceptLegal() {
        return request("/api/legal", { method: "POST", body: JSON.stringify({}) }).then((payload) => {
          state.legalAccepted = Boolean(payload.accepted);
          state.legalAcceptedAt = payload.accepted_at || "";
          state.legalVersion = payload.version || state.legalVersion;
          state.legalConfirmVersion = state.legalVersion;
          renderLegalState();
          redirectTo("/scan");
        });
      }

      function startLoginWorkflow() {
        return request("/api/login-workflow", { method: "POST", body: JSON.stringify({}) }).then((payload) => {
          renderLoginSession(payload);
          renderScanState();
          setNotice(payload.message || t("notice.loginWorkflowStarted"), "ok");
        });
      }

      function createJob() {
        const urls = (el.urls ? el.urls.value : "").split("\\n").map((item) => item.trim()).filter(Boolean);
        if (urls.length === 0) {
          return Promise.reject(new Error(t("error.needUrls")));
        }
        return urls.reduce((chain, url) => {
          return chain.then((jobIDs) => {
            return request("/api/jobs", {
              method: "POST",
              body: JSON.stringify({ url, thread: 100, create_video_list: true, output_subdir: "" }),
            }).then((payload) => {
              jobIDs.push(payload.id);
              return jobIDs;
            });
          });
        }, Promise.resolve([])).then((jobIDs) => {
          setNotice(jobIDs.length === 1 ? t("notice.jobCreatedOne", { id: jobIDs[0] }) : t("notice.jobCreatedMany", { count: jobIDs.length }), "ok");
          return refreshOverviewData();
        });
      }

      function changePassword() {
        const currentPassword = (el.currentPassword ? el.currentPassword.value : "").trim();
        const newPassword = (el.newPassword ? el.newPassword.value : "").trim();
        const confirmPassword = (el.confirmNewPassword ? el.confirmNewPassword.value : "").trim();
        if (newPassword !== confirmPassword) {
          return Promise.reject(new Error(t("error.passwordMismatch")));
        }
        return request("/api/auth/password", {
          method: "POST",
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
        }).then((payload) => {
          if (el.currentPassword) el.currentPassword.value = "";
          if (el.newPassword) el.newPassword.value = "";
          if (el.confirmNewPassword) el.confirmNewPassword.value = "";
          setNotice(payload.message || t("notice.passwordUpdated"), "ok");
        });
      }

      function saveAdminLegal() {
        const text = el.adminLegalText ? String(el.adminLegalText.value || "").trim() : "";
        if (!text) {
          return Promise.reject(new Error(t("error.legalEmpty")));
        }
        return request("/api/admin/legal", {
          method: "POST",
          body: JSON.stringify({ text }),
        }).then((payload) => {
          state.adminLegalDirty = false;
          renderAdminLegal(payload.version || "", payload.text || text, true);
          setNotice(t("notice.legalUpdated"), "ok");
        });
      }

      function bindEvents() {
        applyTranslations();
        setupSidebar();
        setupUserMenu();
        setupLocaleMenu();
        setupPageTransitions();
        switchAuthTab("login");

        if (el.loginBtn) el.loginBtn.addEventListener("click", () => {
          setBusy(el.loginBtn, true);
          login().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.loginBtn, false));
        });
        if (el.registerBtn) el.registerBtn.addEventListener("click", () => {
          setBusy(el.registerBtn, true);
          registerUser().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.registerBtn, false));
        });
        if (el.authTabLogin) el.authTabLogin.addEventListener("click", () => switchAuthTab("login"));
        if (el.authTabRegister) el.authTabRegister.addEventListener("click", () => switchAuthTab("register"));
        if (el.topbarLogoutBtn) el.topbarLogoutBtn.addEventListener("click", () => {
          setBusy(el.topbarLogoutBtn, true);
          logout().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.topbarLogoutBtn, false));
        });
        if (el.topbarLogoutBtnInline) el.topbarLogoutBtnInline.addEventListener("click", () => {
          setBusy(el.topbarLogoutBtnInline, true);
          logout().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.topbarLogoutBtnInline, false));
        });
        if (el.legalConfirmCheck) el.legalConfirmCheck.addEventListener("change", () => {
          state.legalConfirmVersion = el.legalConfirmCheck.checked ? (state.legalVersion || "") : "";
          if (el.acceptLegalBtn) {
            el.acceptLegalBtn.disabled = !state.legalVersion || state.legalConfirmVersion !== state.legalVersion;
          }
        });
        if (el.acceptLegalBtn) el.acceptLegalBtn.addEventListener("click", () => {
          setBusy(el.acceptLegalBtn, true);
          acceptLegal().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.acceptLegalBtn, false));
        });
        if (el.startLoginWorkflowBtn) el.startLoginWorkflowBtn.addEventListener("click", () => {
          setBusy(el.startLoginWorkflowBtn, true);
          startLoginWorkflow().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.startLoginWorkflowBtn, false));
        });
        if (el.createJobBtn) el.createJobBtn.addEventListener("click", () => {
          setBusy(el.createJobBtn, true);
          createJob().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.createJobBtn, false));
        });
        if (el.refreshBtn) el.refreshBtn.addEventListener("click", () => {
          refreshAll().catch((error) => setNotice(normalizeErrorMessage(error.message), "error"));
        });
        if (el.overviewRangeBtn) el.overviewRangeBtn.addEventListener("click", () => {
          state.overviewRangeDays = state.overviewRangeDays === 7 ? 30 : 7;
          renderOverviewCharts(state.overviewJobs);
        });
        if (el.overviewGranularityBtn) el.overviewGranularityBtn.addEventListener("click", () => {
          state.overviewGranularity = state.overviewGranularity === "day" ? "hour" : "day";
          renderOverviewCharts(state.overviewJobs);
        });
        if (el.changePasswordBtn) el.changePasswordBtn.addEventListener("click", () => {
          setBusy(el.changePasswordBtn, true);
          changePassword().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.changePasswordBtn, false));
        });
        if (el.saveLegalBtn) el.saveLegalBtn.addEventListener("click", () => {
          setBusy(el.saveLegalBtn, true);
          saveAdminLegal().catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.saveLegalBtn, false));
        });
        if (el.adminLegalText) el.adminLegalText.addEventListener("input", () => { state.adminLegalDirty = true; });
        if (el.adminStorageRefreshBtn) el.adminStorageRefreshBtn.addEventListener("click", () => {
          setBusy(el.adminStorageRefreshBtn, true);
          refreshAdminStorage(true).catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.adminStorageRefreshBtn, false));
        });
        if (el.adminStorageMoreBtn) el.adminStorageMoreBtn.addEventListener("click", () => {
          setBusy(el.adminStorageMoreBtn, true);
          refreshAdminStorage(false).catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.adminStorageMoreBtn, false));
        });
        if (el.adminStoragePrefix) el.adminStoragePrefix.addEventListener("keydown", (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          if (!el.adminStorageRefreshBtn) return;
          setBusy(el.adminStorageRefreshBtn, true);
          refreshAdminStorage(true).catch((error) => setNotice(normalizeErrorMessage(error.message), "error")).finally(() => setBusy(el.adminStorageRefreshBtn, false));
        });
        el.pageSizeButtons.forEach((button) => {
          button.addEventListener("click", () => {
            state.jobsPageSize = Number(button.getAttribute("data-page-size") || 10);
            state.jobsPage = 1;
            refreshJobsPage().catch((error) => setNotice(normalizeErrorMessage(error.message), "error"));
          });
        });
        if (el.jobsPrevBtn) el.jobsPrevBtn.addEventListener("click", () => {
          if (state.jobsPage <= 1) return;
          state.jobsPage -= 1;
          refreshJobsPage().catch((error) => setNotice(normalizeErrorMessage(error.message), "error"));
        });
        if (el.jobsNextBtn) el.jobsNextBtn.addEventListener("click", () => {
          if (state.jobsPage >= state.jobsTotalPages) return;
          state.jobsPage += 1;
          refreshJobsPage().catch((error) => setNotice(normalizeErrorMessage(error.message), "error"));
        });
      }

      function applyRouteGuards() {
        if (!state.authenticated) return false;
        if (PAGE === "legal" && state.legalAccepted) {
          redirectTo(state.cookiesReady ? "/overview" : "/scan");
          return true;
        }
        if (PAGE === "admin" && state.user && !state.user.is_sudo) {
          redirectTo("/overview");
          return true;
        }
        return false;
      }

      function refreshAll() {
        return refreshAuth().then(() => {
          if (PAGE !== "login" && !state.authenticated) return;
          if (applyRouteGuards()) return;

          const tasks = [];
          if (PAGE === "overview") {
            tasks.push(refreshStatus());
            tasks.push(refreshOverviewData());
          }
          if (PAGE === "jobs") {
            tasks.push(refreshStatus());
            tasks.push(refreshJobsPage());
          }
          if (PAGE === "legal") {
            tasks.push(refreshLegalConfig());
          }
          if (PAGE === "scan") {
            tasks.push(refreshStatus());
            tasks.push(refreshLoginSession());
          }
          if (PAGE === "account") {
            tasks.push(refreshStatus());
          }
          if (PAGE === "admin") {
            tasks.push(refreshAdminUsers());
            tasks.push(refreshAdminLegal());
            tasks.push(refreshAdminStorage(true));
          }
          return Promise.all(tasks);
        });
      }

      bindEvents();
      refreshAll().catch((error) => setNotice(normalizeErrorMessage(error.message), "error"));
      if (pollingHandle) clearInterval(pollingHandle);
      pollingHandle = setInterval(() => {
        refreshAll().catch(() => {});
      }, 5000);
    </script>
  </body>
</html>`;
}
