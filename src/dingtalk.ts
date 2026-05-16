// DingTalk integration — adapted from DingTalkGoGoGo, merged into S-MAIL Worker
// Table names use dt_ prefix; route prefixes: /api/dingtalk/* (user) /internal/dingtalk/* (runner)
// Auth: reuse S-MAIL session/device auth; isSudo replaces DingTalk's is_sudo
// Storage: GitHub Actions artifacts (90-day retention), no R2; zip encrypted with user-set password

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

// ── Types ──

interface Env {
  DB: D1Database;
  INTERNAL_API_TOKEN?: string;
  GITHUB_ACTIONS_TOKEN?: string;
  GITHUB_REPOSITORY?: string;
  GITHUB_WORKFLOW_FILE?: string;
  GITHUB_LOGIN_WORKFLOW_FILE?: string;
  GITHUB_REF?: string;
  AUTH_SALT?: string;
}

interface AuthUser {
  id: string;
  username: string;
  role: string;
  isSudo: boolean;
}

interface JobFileRecord {
  name: string;
  relative_path: string;
  artifact_name?: string;
  size_bytes?: number;
  content_type?: string;
  download_url?: string;
}

interface JobRow {
  id: string;
  owner_user_id: string;
  status: string;
  stage: string;
  urls_json: string;
  thread: number | string;
  output_subdir: string | null;
  create_video_list: number | string;
  current_title: string | null;
  completed_parts: number | string | null;
  total_parts: number | string | null;
  progress_percent: number | string | null;
  titles_json: string;
  errors_json: string;
  files_json: string;
  runner_run_id: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  finished_at: string | null;
}

interface JobRecord {
  id: string;
  status: string;
  stage: string;
  urls: string[];
  thread: number;
  output_subdir: string;
  create_video_list: boolean;
  current_title: string;
  completed_parts: number;
  total_parts: number;
  progress_percent: number;
  titles: string[];
  errors: string[];
  files: JobFileRecord[];
  runner_run_id: string;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  finished_at: string | null;
}

interface JobEventRow {
  id: number | string;
  level: string;
  message: string;
  created_at: string;
}

interface JobEventRecord {
  id: number;
  level: string;
  message: string;
  created_at: string;
}

interface LoginSessionRow {
  id: string;
  user_id: string;
  status: string;
  qr_url: string | null;
  qr_image_base64: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface LoginSessionRecord {
  id: string;
  status: string;
  qr_url: string;
  qr_image_base64: string;
  error_message: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface CreateJobPayload {
  url?: string;
  urls?: string[];
  thread?: number;
  output_subdir?: string;
  create_video_list?: boolean;
}

interface ProgressPayload {
  status?: string;
  stage?: string;
  current_title?: string;
  completed_parts?: number;
  total_parts?: number;
  progress_percent?: number;
  titles?: string[];
  errors?: string[];
  files?: JobFileRecord[];
  message?: string;
}

interface CompletePayload {
  status?: string;
  stage?: string;
  current_title?: string;
  completed_parts?: number;
  total_parts?: number;
  progress_percent?: number;
  titles?: string[];
  errors?: string[];
  files?: JobFileRecord[];
  message?: string;
}

interface LoginSessionQRPayload {
  qr_url?: string;
  qr_image_base64?: string;
}

interface LoginSessionCompletePayload {
  cookies?: Record<string, string>;
  error?: string;
}

interface AdminUserRecord {
  id: string;
  username: string;
  is_sudo: boolean;
  created_at: string;
  legal_accepted: boolean;
  legal_accepted_at: string | null;
  cookies_ready: boolean;
  total_jobs: number;
  has_zip_password: boolean;
}

// ── Constants ──

const DEFAULT_WORKFLOW_FILE = "remote-runner.yml";
const DEFAULT_LOGIN_WORKFLOW_FILE = "windows-login.yml";
const DEFAULT_THREAD = 100;
const MAX_THREAD = 100;
const DEFAULT_JOBS_PAGE_SIZE = 10;
const ARTIFACT_RETENTION_DAYS = 90;
const DEFAULT_LEGAL_VERSION = "2026-05-01";
const DEFAULT_LEGAL_TEXT = `## 一、用途限制
本系统仅可在你对相关内容拥有合法访问权、下载权、保存权或内部归档权的前提下使用。你不得将本系统用于任何违反适用法律法规、平台规则、合同约定、保密义务或知识产权规则的用途。

## 二、授权保证
你声明并保证：你提交的账号、Cookies、二维码登录、链接及相关内容，均已获得合法授权；你有权访问、处理、下载、保存和使用相应直播回放或文件。

## 三、禁止行为
你不得使用本系统实施未授权下载、批量抓取、绕过访问控制、规避安全限制、侵犯隐私、侵犯知识产权、传播违法内容、或从事任何可能引发第三方索赔、行政处罚或刑事风险的行为。

## 四、责任承担
你应独立承担因你的使用行为所引发的一切责任、损失、处罚、赔偿、争议、索赔、律师费及维权成本；若系统提供方因此遭受损失，你同意进行足额赔偿。

## 五、服务免责
本系统按"现状"提供，不对可用性、稳定性、连续性、适法性、特定目的适用性、结果准确性或第三方平台兼容性作任何明示或默示保证。系统提供方有权随时中断、限制、修改或终止服务。

## 六、证据与记录
你同意系统记录你的接受时间、账号标识及后续操作，以作为你已阅读并接受本声明的电子记录。该记录可用于内部合规、争议处理与安全审计。

## 七、法律提示
本免责声明旨在强化风险提示、授权确认和责任分配，但其具体法律效力仍受适用法律、事实背景及司法解释影响。若要获得可执行、完整且适用于你业务场景的法律文本，应由持牌律师审阅并定稿。`;

// ── Helpers ──

function nowISO(): string { return new Date().toISOString(); }
function nextJobID(): string { return `job-${Date.now()}-${crypto.randomUUID().split("-")[0]}`; }
function nextLoginSessionID(): string { return `login-${Date.now()}-${crypto.randomUUID().split("-")[0]}`; }

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function normalizeURLs(primary?: string, batch?: string[]): string[] {
  const urls: string[] = [];
  if (typeof primary === "string" && primary.trim()) urls.push(primary.trim());
  if (Array.isArray(batch)) for (const entry of batch) { if (typeof entry === "string" && entry.trim()) urls.push(entry.trim()); }
  return urls;
}

function clampThread(value: number): number { return Math.min(MAX_THREAD, Math.max(1, value)); }

function normalizeJobsPageSize(value: string | null): number {
  const parsed = toNumber(value);
  return parsed === 20 || parsed === 50 ? parsed : DEFAULT_JOBS_PAGE_SIZE;
}

function normalizePageNumber(value: string | null): number {
  const parsed = toNumber(value);
  return parsed > 0 ? parsed : 1;
}

function jobFileDownloadURL(jobID: string): string {
  return `/api/dingtalk/files?job_id=${encodeURIComponent(jobID)}`;
}

function githubWorkflowURL(repository: string, workflowFile: string): string {
  return `https://github.com/${repository}/actions/workflows/${workflowFile}`;
}

function githubRunHistoryURL(repository: string, workflowFile: string): string {
  return `${githubWorkflowURL(repository, workflowFile)}?query=event%3Aworkflow_dispatch`;
}

function enrichJobFile(jobID: string, file: JobFileRecord): JobFileRecord {
  const artifactName = (file.artifact_name || "").trim();
  return {
    ...file,
    artifact_name: artifactName || jobID,
    download_url: (artifactName || jobID) ? jobFileDownloadURL(jobID) : "",
  };
}

function requireSudo(user: AuthUser): Response | null {
  if (!user.isSudo) return Response.json({ error: "sudo required" }, { status: 403 });
  return null;
}

function pushUniqueLimited(target: string[], value: string, limit = 5): void {
  const normalized = value.trim();
  if (!normalized || target.includes(normalized) || target.length >= limit) return;
  target.push(normalized);
}

// ── Internal auth ──

async function requireInternalAuth(request: Request, env: Env): Promise<Response | null> {
  const expected = env.INTERNAL_API_TOKEN?.trim();
  if (!expected) return Response.json({ error: "INTERNAL_API_TOKEN is not configured" }, { status: 500 });
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
  if (token !== expected) return Response.json({ error: "missing or invalid internal token" }, { status: 401 });
  return null;
}

// ── DingTalk settings (dt_settings table) ──

async function getDtSetting(env: Env, key: string): Promise<string | null> {
  const row = await env.DB.prepare("SELECT value FROM dt_settings WHERE key = ?1").bind(key).first<{ value: string | null }>();
  return row?.value ?? null;
}

async function setDtSetting(env: Env, key: string, value: string): Promise<void> {
  await env.DB.prepare("INSERT INTO dt_settings (key, value, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at").bind(key, value, nowISO()).run();
}

async function getDtLegalConfig(env: Env): Promise<{ version: string; text: string }> {
  const [version, text] = await Promise.all([getDtSetting(env, "legal_version"), getDtSetting(env, "legal_text")]);
  return { version: version || DEFAULT_LEGAL_VERSION, text: text || DEFAULT_LEGAL_TEXT };
}

async function getUserLegalState(env: Env, userID: string): Promise<{ accepted: boolean; acceptedAt: string | null; version: string }> {
  const legalConfig = await getDtLegalConfig(env);
  const row = await env.DB.prepare("SELECT legal_version, legal_accepted_at FROM users WHERE id = ?1").bind(userID).first<{ legal_version: string | null; legal_accepted_at: string | null }>();
  const version = row?.legal_version || "";
  const acceptedAt = row?.legal_accepted_at || null;
  return { accepted: version === legalConfig.version && Boolean(acceptedAt), acceptedAt, version: legalConfig.version };
}

async function acceptLegalTerms(env: Env, userID: string): Promise<{ accepted: boolean; acceptedAt: string; version: string }> {
  const legalConfig = await getDtLegalConfig(env);
  const acceptedAt = nowISO();
  await env.DB.prepare("UPDATE users SET legal_version = ?2, legal_accepted_at = ?3 WHERE id = ?1").bind(userID, legalConfig.version, acceptedAt).run();
  return { accepted: true, acceptedAt, version: legalConfig.version };
}

// ── Cookies (dt_user_cookies table) ──

async function getUserCookieState(env: Env, userID: string): Promise<{ cookiesReady: boolean; cookiesUpdatedAt: string | null; cookies: Record<string, string> }> {
  const row = await env.DB.prepare("SELECT cookies_json, updated_at FROM dt_user_cookies WHERE user_id = ?1").bind(userID).first<{ cookies_json: string; updated_at: string }>();
  const cookies = parseJSON<Record<string, string>>(row?.cookies_json, {});
  const cookiesReady = Object.entries(cookies).some(([name, value]) => typeof name === "string" && name.trim().length > 0 && typeof value === "string" && value.trim().length > 0);
  return { cookiesReady, cookiesUpdatedAt: row?.updated_at || null, cookies };
}

async function saveUserCookies(env: Env, userID: string, cookies: Record<string, string>): Promise<void> {
  await env.DB.prepare("INSERT INTO dt_user_cookies (user_id, cookies_json, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET cookies_json = excluded.cookies_json, updated_at = excluded.updated_at").bind(userID, JSON.stringify(cookies), nowISO()).run();
}

// ── Login sessions (dt_login_sessions table) ──

function parseLoginSessionRow(row: LoginSessionRow): LoginSessionRecord {
  return { id: row.id, status: row.status || "pending", qr_url: row.qr_url || "", qr_image_base64: row.qr_image_base64 || "", error_message: row.error_message || "", created_at: row.created_at, updated_at: row.updated_at, completed_at: row.completed_at };
}

async function createLoginSession(env: Env, userID: string): Promise<LoginSessionRecord> {
  const now = nowISO(), id = nextLoginSessionID();
  await env.DB.prepare("INSERT INTO dt_login_sessions (id, user_id, status, qr_url, qr_image_base64, error_message, created_at, updated_at, completed_at) VALUES (?1, ?2, 'pending', '', '', '', ?3, ?3, NULL)").bind(id, userID, now).run();
  return { id, status: "pending", qr_url: "", qr_image_base64: "", error_message: "", created_at: now, updated_at: now, completed_at: null };
}

async function getLoginSession(env: Env, loginSessionID: string, userID?: string): Promise<LoginSessionRecord | null> {
  const row = userID
    ? await env.DB.prepare("SELECT * FROM dt_login_sessions WHERE id = ?1 AND user_id = ?2").bind(loginSessionID, userID).first<LoginSessionRow>()
    : await env.DB.prepare("SELECT * FROM dt_login_sessions WHERE id = ?1").bind(loginSessionID).first<LoginSessionRow>();
  return row ? parseLoginSessionRow(row) : null;
}

async function getLatestLoginSession(env: Env, userID: string): Promise<LoginSessionRecord | null> {
  const row = await env.DB.prepare("SELECT * FROM dt_login_sessions WHERE user_id = ?1 ORDER BY updated_at DESC LIMIT 1").bind(userID).first<LoginSessionRow>();
  return row ? parseLoginSessionRow(row) : null;
}

async function updateLoginSessionQR(env: Env, loginSessionID: string, qrURL: string, qrImageBase64?: string): Promise<LoginSessionRecord | null> {
  const image = (qrImageBase64 || "").trim();
  await env.DB.prepare("UPDATE dt_login_sessions SET status = 'qr_ready', qr_url = ?2, qr_image_base64 = ?3, error_message = '', updated_at = ?4 WHERE id = ?1").bind(loginSessionID, qrURL, image, nowISO()).run();
  return getLoginSession(env, loginSessionID);
}

async function completeLoginSession(env: Env, loginSessionID: string, payload: LoginSessionCompletePayload): Promise<LoginSessionRecord | null> {
  const sessionRow = await env.DB.prepare("SELECT * FROM dt_login_sessions WHERE id = ?1").bind(loginSessionID).first<LoginSessionRow>();
  if (!sessionRow) return null;
  const cookies = payload.cookies && typeof payload.cookies === "object" && !Array.isArray(payload.cookies)
    ? Object.fromEntries(Object.entries(payload.cookies).filter(([name, value]) => typeof name === "string" && name.trim().length > 0 && typeof value === "string" && value.trim().length > 0))
    : {};
  const currentTime = nowISO();
  if (Object.keys(cookies).length > 0) {
    await saveUserCookies(env, sessionRow.user_id, cookies);
    await env.DB.prepare("UPDATE dt_login_sessions SET status = 'completed', error_message = '', updated_at = ?2, completed_at = ?2 WHERE id = ?1").bind(loginSessionID, currentTime).run();
  } else {
    await env.DB.prepare("UPDATE dt_login_sessions SET status = 'failed', error_message = ?2, updated_at = ?3, completed_at = ?3 WHERE id = ?1").bind(loginSessionID, (payload.error || "login failed").trim(), currentTime).run();
  }
  return getLoginSession(env, loginSessionID);
}

// ── Jobs (dt_jobs + dt_job_events tables) ──

function parseJobRow(row: JobRow): JobRecord {
  const files = parseJSON<JobFileRecord[]>(row.files_json, []).map((file) => enrichJobFile(row.id, file));
  return {
    id: row.id, status: row.status, stage: row.stage,
    urls: parseJSON<string[]>(row.urls_json, []),
    thread: toNumber(row.thread), output_subdir: row.output_subdir || "",
    create_video_list: Boolean(toNumber(row.create_video_list)),
    current_title: row.current_title || "",
    completed_parts: toNumber(row.completed_parts), total_parts: toNumber(row.total_parts),
    progress_percent: toNumber(row.progress_percent),
    titles: parseJSON<string[]>(row.titles_json, []), errors: parseJSON<string[]>(row.errors_json, []),
    files, runner_run_id: row.runner_run_id || "",
    created_at: row.created_at, updated_at: row.updated_at,
    started_at: row.started_at, finished_at: row.finished_at,
  };
}

async function insertEvent(env: Env, jobID: string, level: string, message: string): Promise<void> {
  await env.DB.prepare("INSERT INTO dt_job_events (job_id, level, message, created_at) VALUES (?1, ?2, ?3, ?4)").bind(jobID, level, message, nowISO()).run();
}

async function getJob(env: Env, jobID: string, ownerUserID?: string): Promise<JobRecord | null> {
  const row = ownerUserID
    ? await env.DB.prepare("SELECT * FROM dt_jobs WHERE id = ?1 AND owner_user_id = ?2").bind(jobID, ownerUserID).first<JobRow>()
    : await env.DB.prepare("SELECT * FROM dt_jobs WHERE id = ?1").bind(jobID).first<JobRow>();
  return row ? parseJobRow(row) : null;
}

async function listJobsPage(env: Env, ownerUserID: string, page: number, pageSize: number): Promise<{ jobs: JobRecord[]; total: number; page: number; page_size: number; total_pages: number }> {
  const safePageSize = normalizeJobsPageSize(String(pageSize));
  const safePage = Math.max(1, page);
  const totalRow = await env.DB.prepare("SELECT COUNT(*) AS c FROM dt_jobs WHERE owner_user_id = ?1").bind(ownerUserID).first<{ c: number | string | null }>();
  const total = toNumber(totalRow?.c);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * safePageSize;
  const result = await env.DB.prepare("SELECT * FROM dt_jobs WHERE owner_user_id = ?1 ORDER BY updated_at DESC LIMIT ?2 OFFSET ?3").bind(ownerUserID, safePageSize, offset).all<JobRow>();
  const rows = Array.isArray(result.results) ? result.results : [];
  return { jobs: rows.map((row) => parseJobRow(row)), total, page: currentPage, page_size: safePageSize, total_pages: totalPages };
}

async function listJobEvents(env: Env, jobID: string, limit = 80): Promise<JobEventRecord[]> {
  const result = await env.DB.prepare("SELECT id, level, message, created_at FROM dt_job_events WHERE job_id = ?1 ORDER BY created_at DESC LIMIT ?2").bind(jobID, limit).all<JobEventRow>();
  const rows = Array.isArray(result.results) ? result.results : [];
  return rows.map((row) => ({ id: toNumber(row.id), level: row.level, message: row.message, created_at: row.created_at }));
}

async function updateJobProgress(env: Env, jobID: string, payload: ProgressPayload): Promise<void> {
  const current = await getJob(env, jobID);
  if (!current) throw new Error("job not found");
  const titles = Array.isArray(payload.titles) ? payload.titles : current.titles;
  const errors = Array.isArray(payload.errors) ? payload.errors : current.errors;
  const files = Array.isArray(payload.files) ? payload.files.map((file) => enrichJobFile(jobID, file)) : current.files;
  const status = payload.status || current.status || "running";
  const stage = payload.stage || current.stage || "running";
  await env.DB.prepare(
    `UPDATE dt_jobs SET status = ?2, stage = ?3, current_title = ?4, completed_parts = ?5, total_parts = ?6, progress_percent = ?7, titles_json = ?8, errors_json = ?9, files_json = ?10, updated_at = ?11 WHERE id = ?1`
  ).bind(jobID, status, stage, payload.current_title || current.current_title || "", payload.completed_parts ?? current.completed_parts, payload.total_parts ?? current.total_parts, payload.progress_percent ?? current.progress_percent, JSON.stringify(titles), JSON.stringify(errors), JSON.stringify(files), nowISO()).run();
  if (payload.message) await insertEvent(env, jobID, "info", payload.message);
}

async function completeJob(env: Env, jobID: string, payload: CompletePayload): Promise<JobRecord | null> {
  const current = await getJob(env, jobID);
  if (!current) return null;
  const status = payload.status || current.status || "failed";
  const stage = payload.stage || (status === "succeeded" ? "completed" : "failed");
  const titles = Array.isArray(payload.titles) ? payload.titles : current.titles;
  const errors = Array.isArray(payload.errors) ? payload.errors : current.errors;
  const files = Array.isArray(payload.files) ? payload.files.map((file) => enrichJobFile(jobID, file)) : current.files;
  await env.DB.prepare(
    `UPDATE dt_jobs SET status = ?2, stage = ?3, current_title = ?4, completed_parts = ?5, total_parts = ?6, progress_percent = ?7, titles_json = ?8, errors_json = ?9, files_json = ?10, updated_at = ?11, finished_at = ?12 WHERE id = ?1`
  ).bind(jobID, status, stage, payload.current_title || current.current_title || "", payload.completed_parts ?? current.completed_parts, payload.total_parts ?? current.total_parts, payload.progress_percent ?? current.progress_percent, JSON.stringify(titles), JSON.stringify(errors), JSON.stringify(files), nowISO(), nowISO()).run();
  if (payload.message) await insertEvent(env, jobID, status === "succeeded" ? "info" : "error", payload.message);
  return getJob(env, jobID);
}

// ── GitHub Actions dispatch ──

async function dispatchGitHubWorkflow(env: Env, workflowFile: string, inputs?: Record<string, string>): Promise<void> {
  if (!env.GITHUB_REPOSITORY || !env.GITHUB_ACTIONS_TOKEN) throw new Error("GitHub Actions dispatch is not configured");
  const ref = env.GITHUB_REF || "main";
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/vnd.github+json", authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`, "user-agent": "S-MAIL-DingTalk" },
      body: JSON.stringify({ ref, inputs: inputs || {} }),
    },
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`workflow dispatch failed (${response.status}): ${body.slice(0, 220)}`);
  }
}

async function triggerGitHubRunner(env: Env, jobID: string): Promise<void> {
  if (!env.GITHUB_REPOSITORY || !env.GITHUB_ACTIONS_TOKEN) throw new Error("GitHub Actions dispatch is not configured");
  const workflowFile = env.GITHUB_WORKFLOW_FILE || DEFAULT_WORKFLOW_FILE;
  await dispatchGitHubWorkflow(env, workflowFile, { job_id: jobID });
}

async function triggerGitHubLogin(env: Env, loginSessionID: string, userID: string): Promise<{ ref: string; workflow_file: string; workflow_url: string; runs_url: string }> {
  if (!env.GITHUB_REPOSITORY || !env.GITHUB_ACTIONS_TOKEN) throw new Error("GitHub Actions dispatch is not configured");
  const workflowFile = env.GITHUB_LOGIN_WORKFLOW_FILE || DEFAULT_LOGIN_WORKFLOW_FILE;
  const ref = env.GITHUB_REF || "main";
  await dispatchGitHubWorkflow(env, workflowFile, { login_session_id: loginSessionID, owner_user_id: userID });
  return { ref, workflow_file: workflowFile, workflow_url: githubWorkflowURL(env.GITHUB_REPOSITORY, workflowFile), runs_url: githubRunHistoryURL(env.GITHUB_REPOSITORY, workflowFile) };
}

// ── Artifact download ──

async function resolveArtifactDownloadURL(env: Env, artifactName: string): Promise<string | null> {
  if (!env.GITHUB_REPOSITORY || !env.GITHUB_ACTIONS_TOKEN) return null;
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/artifacts?name=${encodeURIComponent(artifactName)}&per_page=1`,
    {
      headers: { accept: "application/vnd.github+json", authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`, "user-agent": "S-MAIL-DingTalk" },
    },
  );
  if (!response.ok) return null;
  const data = await response.json() as { artifacts?: Array<{ archive_download_url?: string; expired?: boolean }> };
  const artifact = data.artifacts?.[0];
  if (!artifact || artifact.expired) return null;
  return artifact.archive_download_url || null;
}

// ── Create job ──

async function createJob(env: Env, ownerUserID: string, payload: CreateJobPayload): Promise<JobRecord> {
  const urls = normalizeURLs(payload.url, payload.urls);
  if (urls.length === 0) throw new Error("at least one url is required");
  const legalState = await getUserLegalState(env, ownerUserID);
  if (!legalState.accepted) throw new Error("legal disclaimer must be accepted before creating jobs");
  const cookieState = await getUserCookieState(env, ownerUserID);
  if (!cookieState.cookiesReady) throw new Error("cookies are missing or invalid");
  const userRow = await env.DB.prepare("SELECT dt_zip_password FROM users WHERE id = ?1").bind(ownerUserID).first<{ dt_zip_password: string | null }>();
  const zipPassword = (userRow?.dt_zip_password || "").trim();
  if (!zipPassword) throw new Error("zip password must be set before creating jobs");
  const threadInput = toNumber(payload.thread) || DEFAULT_THREAD;
  const thread = clampThread(threadInput);
  const createVideoList = payload.create_video_list !== false;
  const outputSubdir = (payload.output_subdir || "").trim();
  const createdAt = nowISO();
  const jobID = nextJobID();
  await env.DB.prepare(
    `INSERT INTO dt_jobs (id, owner_user_id, status, stage, urls_json, thread, output_subdir, create_video_list, current_title, completed_parts, total_parts, progress_percent, titles_json, errors_json, files_json, runner_run_id, created_at, updated_at, started_at, finished_at) VALUES (?1, ?2, 'queued', 'waiting_runner', ?3, ?4, ?5, ?6, '', 0, 0, 0, '[]', '[]', '[]', '', ?7, ?7, NULL, NULL)`
  ).bind(jobID, ownerUserID, JSON.stringify(urls), thread, outputSubdir, createVideoList ? 1 : 0, createdAt).run();
  await insertEvent(env, jobID, "info", "任务已创建，正在触发 GitHub Actions 远程下载器。");
  try { await triggerGitHubRunner(env, jobID); } catch (error) {
    const message = error instanceof Error ? error.message : "failed to trigger GitHub Actions";
    await completeJob(env, jobID, { status: "failed", stage: "failed", errors: [message], message });
    throw new Error(message);
  }
  return (await getJob(env, jobID, ownerUserID)) as JobRecord;
}

// ── Admin users ──

async function listAdminUsers(env: Env): Promise<AdminUserRecord[]> {
  const legalConfig = await getDtLegalConfig(env);
  const result = await env.DB.prepare(
    `SELECT users.id AS id, users.username AS username, users.is_sudo AS is_sudo, users.created_at AS created_at, users.legal_version AS legal_version, users.legal_accepted_at AS legal_accepted_at, users.dt_zip_password AS dt_zip_password, dt_user_cookies.cookies_json AS cookies_json, COUNT(dt_jobs.id) AS total_jobs FROM users LEFT JOIN dt_user_cookies ON dt_user_cookies.user_id = users.id LEFT JOIN dt_jobs ON dt_jobs.owner_user_id = users.id GROUP BY users.id ORDER BY users.created_at DESC`
  ).all<{ id: string; username: string; is_sudo: number | string | null; created_at: string; legal_version: string | null; legal_accepted_at: string | null; dt_zip_password: string | null; cookies_json: string | null; total_jobs: number | string | null }>();
  const rows = Array.isArray(result.results) ? result.results : [];
  return rows.map((row) => {
    const cookies = parseJSON<Record<string, string>>(row.cookies_json, {});
    const cookiesReady = Object.values(cookies).some((value) => typeof value === "string" && value.trim().length > 0);
    return { id: row.id, username: row.username, is_sudo: toNumber(row.is_sudo) === 1, created_at: row.created_at, legal_accepted: row.legal_version === legalConfig.version && Boolean(row.legal_accepted_at), legal_accepted_at: row.legal_accepted_at || null, cookies_ready: cookiesReady, total_jobs: toNumber(row.total_jobs), has_zip_password: Boolean((row.dt_zip_password || "").trim()) };
  });
}

// ── DingTalk gate middleware ──

type DingtalkState = "off" | "hidden" | "visible";

async function dingtalkEnabled(env: Env): Promise<DingtalkState> {
  const v = await getDtSetting(env, "dingtalk_enabled");
  return v === "visible" || v === "hidden" ? v : "off";
}

async function requireDingtalkEnabled(env: Env): Promise<Response | null> {
  const state = await dingtalkEnabled(env);
  if (state === "off") return Response.json({ error: "dingtalk is not enabled" }, { status: 404 });
  return null;
}

// ── Hono sub-app ──

const dt = new Hono<{ Bindings: Env; Variables: { user: AuthUser } }>();

// Helper: get authenticated user from context (set by S-MAIL main app auth middleware)
function getUser(c: any): AuthUser {
  const u = c.get("user");
  if (!u) throw new HTTPException(401, { message: "unauthorized" });
  return u;
}

// ── Status ──
dt.get("/status", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const [countsRow, cookieState, legalState, zipRow] = await Promise.all([
    env.DB.prepare(
      `SELECT COUNT(*) AS total_jobs, SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) AS queued_jobs, SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) AS running_jobs, SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) AS succeeded_jobs, SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_jobs FROM dt_jobs WHERE owner_user_id = ?1`
    ).bind(u.id).first<Record<string, number | string | null>>(),
    getUserCookieState(env, u.id),
    getUserLegalState(env, u.id),
    env.DB.prepare("SELECT dt_zip_password FROM users WHERE id = ?1").bind(u.id).first<{ dt_zip_password: string | null }>(),
  ]);
  const hasZipPassword = Boolean((zipRow?.dt_zip_password || "").trim());
  const workflowRepository = env.GITHUB_REPOSITORY || "";
  const workflowFile = env.GITHUB_WORKFLOW_FILE || DEFAULT_WORKFLOW_FILE;
  const loginWorkflowFile = env.GITHUB_LOGIN_WORKFLOW_FILE || DEFAULT_LOGIN_WORKFLOW_FILE;
  const workflowRef = env.GITHUB_REF || "main";
  return c.json({
    ok: true,
    mode: "private-control-plane",
    user: { id: u.id, username: u.username, is_sudo: u.isSudo },
    cookies_ready: cookieState.cookiesReady,
    cookies_updated_at: cookieState.cookiesUpdatedAt,
    legal_version: legalState.version,
    legal_accepted: legalState.accepted,
    legal_accepted_at: legalState.acceptedAt,
    has_zip_password: hasZipPassword,
    total_jobs: toNumber(countsRow?.total_jobs),
    queued_jobs: toNumber(countsRow?.queued_jobs),
    running_jobs: toNumber(countsRow?.running_jobs),
    succeeded_jobs: toNumber(countsRow?.succeeded_jobs),
    failed_jobs: toNumber(countsRow?.failed_jobs),
    workflow_repository: workflowRepository,
    workflow_file: workflowFile,
    workflow_url: workflowRepository ? githubWorkflowURL(workflowRepository, workflowFile) : "",
    login_workflow_file: loginWorkflowFile,
    login_workflow_url: workflowRepository ? githubWorkflowURL(workflowRepository, loginWorkflowFile) : "",
    login_runs_url: workflowRepository ? githubRunHistoryURL(workflowRepository, loginWorkflowFile) : "",
    workflow_ref: workflowRef,
    artifact_retention_days: ARTIFACT_RETENTION_DAYS,
    default_thread: DEFAULT_THREAD,
  });
});

// ── Login workflow ──
dt.get("/login-workflow", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const url = new URL(c.req.url);
  const loginSessionID = (url.searchParams.get("id") || "").trim();
  const loginSession = loginSessionID ? await getLoginSession(env, loginSessionID, u.id) : await getLatestLoginSession(env, u.id);
  return c.json({ ok: true, login_session: loginSession });
});

dt.post("/login-workflow", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const legalState = await getUserLegalState(env, u.id);
  if (!legalState.accepted) return c.json({ error: "legal disclaimer must be accepted before starting QR login" }, 403);
  const loginSession = await createLoginSession(env, u.id);
  try {
    const payload = await triggerGitHubLogin(env, loginSession.id, u.id);
    return c.json({ ok: true, message: "已启动远程登录，请等待二维码。", login_session: loginSession, ...payload });
  } catch (error) {
    await completeLoginSession(env, loginSession.id, { error: error instanceof Error ? error.message : "failed to start login workflow" });
    throw error;
  }
});

// ── Legal ──
dt.get("/legal", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const [legalState, legalConfig] = await Promise.all([getUserLegalState(env, u.id), getDtLegalConfig(env)]);
  return c.json({ version: legalState.version, accepted: legalState.accepted, accepted_at: legalState.acceptedAt, text: legalConfig.text });
});

dt.post("/legal", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const legalState = await acceptLegalTerms(env, u.id);
  return c.json({ ok: true, version: legalState.version, accepted: legalState.accepted, accepted_at: legalState.acceptedAt });
});

// ── Cookies (manual upload disabled; use QR login) ──
dt.post("/cookies", async (c) => c.json({ error: "manual cookie upload disabled; use QR login" }, 403));

// ── Zip password ──
dt.get("/zip-password", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const row = await env.DB.prepare("SELECT dt_zip_password FROM users WHERE id = ?1").bind(u.id).first<{ dt_zip_password: string | null }>();
  return c.json({ has_password: Boolean((row?.dt_zip_password || "").trim()) });
});

dt.post("/zip-password", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const body = await c.req.json() as { password?: string };
  const password = (body.password || "").trim();
  if (!password) return c.json({ error: "password cannot be empty" }, 400);
  if (password.length < 4) return c.json({ error: "password must be at least 4 characters" }, 400);
  await env.DB.prepare("UPDATE users SET dt_zip_password = ?2 WHERE id = ?1").bind(u.id, password).run();
  return c.json({ ok: true });
});

// ── Jobs ──
dt.get("/jobs", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const url = new URL(c.req.url);
  return c.json(await listJobsPage(env, u.id, normalizePageNumber(url.searchParams.get("page")), normalizeJobsPageSize(url.searchParams.get("page_size"))));
});

dt.post("/jobs", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  try {
    const payload = await c.req.json() as CreateJobPayload;
    const job = await createJob(env, u.id, payload);
    return c.json(job, 202);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "failed to create job" }, 400);
  }
});

dt.get("/jobs/:id", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const jobID = c.req.param("id");
  const job = await getJob(env, jobID, u.id);
  if (!job) return c.json({ error: "job not found" }, 404);
  const includeEvents = new URL(c.req.url).searchParams.get("include") === "events";
  if (!includeEvents) return c.json(job);
  return c.json({ job, events: await listJobEvents(env, jobID) });
});

// ── File download (artifact proxy) ──
dt.get("/files", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const url = new URL(c.req.url);
  const jobID = url.searchParams.get("job_id") || "";
  if (!jobID) return c.json({ error: "job_id is required" }, 400);
  const job = await getJob(env, jobID, u.id);
  if (!job) return c.json({ error: "job not found" }, 404);
  if (job.status !== "succeeded") return c.json({ error: "job is not completed" }, 400);
  const artifactName = jobID;
  const downloadURL = await resolveArtifactDownloadURL(env, artifactName);
  if (!downloadURL) return c.json({ error: "artifact not found or expired (artifacts are retained for " + ARTIFACT_RETENTION_DAYS + " days)" }, 404);
  // Fetch the artifact zip from GitHub and stream it to the user
  const ghResponse = await fetch(downloadURL, {
    headers: { authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`, "user-agent": "S-MAIL-DingTalk" },
    redirect: "follow",
  });
  if (!ghResponse.ok) return c.json({ error: "failed to fetch artifact from GitHub" }, 502);
  const headers = new Headers();
  headers.set("content-type", "application/zip");
  headers.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(jobID + ".zip")}`);
  const contentLength = ghResponse.headers.get("content-length");
  if (contentLength) headers.set("content-length", contentLength);
  return new Response(ghResponse.body, { headers });
});

// ── Admin: users ──
dt.get("/admin/users", async (c) => {
  const u = getUser(c);
  const err = requireSudo(u);
  if (err) return err;
  return c.json({ users: await listAdminUsers(c.env as Env) });
});

// ── Admin: legal config ──
dt.get("/admin/legal", async (c) => {
  const u = getUser(c);
  const err = requireSudo(u);
  if (err) return err;
  return c.json(await getDtLegalConfig(c.env as Env));
});

dt.post("/admin/legal", async (c) => {
  const u = getUser(c);
  const err = requireSudo(u);
  if (err) return err;
  const env = c.env as Env;
  const payload = await c.req.json() as { text?: string };
  try {
    const normalized = (payload.text || "").trim();
    if (!normalized) throw new Error("legal text cannot be empty");
    const version = nowISO();
    await Promise.all([setDtSetting(env, "legal_text", normalized), setDtSetting(env, "legal_version", version)]);
    return c.json({ ok: true, message: "legal disclaimer updated; all users must accept the new version again", version, text: normalized });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "failed to update legal config" }, 400);
  }
});

// ── Internal routes (runner → control plane, requires INTERNAL_API_TOKEN) ──

// Claim job
dt.get("/internal/jobs/:id/claim", async (c) => {
  const env = c.env as Env;
  const authError = await requireInternalAuth(c.req.raw, env);
  if (authError) return authError;
  const jobID = c.req.param("id");
  const row = await env.DB.prepare("SELECT owner_user_id, status FROM dt_jobs WHERE id = ?1").bind(jobID).first<{ owner_user_id: string; status: string }>();
  if (!row) return c.json({ error: "job not found" }, 404);
  if (row.status === "running") return c.json({ error: "job is already running" }, 409);
  if (row.status === "succeeded" || row.status === "failed") return c.json({ error: "job already finished" }, 409);
  if (!row.owner_user_id) return c.json({ error: "job owner is missing" }, 409);
  const cookieState = await getUserCookieState(env, row.owner_user_id);
  if (!cookieState.cookiesReady) return c.json({ error: "cookies are missing or invalid" }, 409);
  const zipRow = await env.DB.prepare("SELECT dt_zip_password FROM users WHERE id = ?1").bind(row.owner_user_id).first<{ dt_zip_password: string | null }>();
  const zipPassword = (zipRow?.dt_zip_password || "").trim();
  const job = await getJob(env, jobID);
  if (!job) return c.json({ error: "job not found" }, 404);
  await env.DB.prepare("UPDATE dt_jobs SET status = 'running', stage = 'preparing', runner_run_id = ?2, started_at = COALESCE(started_at, ?3), updated_at = ?3 WHERE id = ?1").bind(jobID, c.req.header("X-GitHub-Run-ID") || "", nowISO()).run();
  await insertEvent(env, jobID, "info", "GitHub Actions 运行器已领取任务。");
  return c.json({ id: job.id, urls: job.urls, thread: job.thread, output_subdir: job.output_subdir, create_video_list: job.create_video_list, cookies: cookieState.cookies, zip_password: zipPassword });
});

// Progress update
dt.post("/internal/jobs/:id/progress", async (c) => {
  const env = c.env as Env;
  const authError = await requireInternalAuth(c.req.raw, env);
  if (authError) return authError;
  const jobID = c.req.param("id");
  const payload = await c.req.json() as ProgressPayload;
  try { await updateJobProgress(env, jobID, payload); return c.json({ ok: true }); } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "failed to update job" }, 404);
  }
});

// Complete job
dt.post("/internal/jobs/:id/complete", async (c) => {
  const env = c.env as Env;
  const authError = await requireInternalAuth(c.req.raw, env);
  if (authError) return authError;
  const jobID = c.req.param("id");
  const payload = await c.req.json() as CompletePayload;
  const job = await completeJob(env, jobID, payload);
  if (!job) return c.json({ error: "job not found" }, 404);
  return c.json(job);
});

// Login session QR
dt.post("/internal/login-sessions/:id/qr", async (c) => {
  const env = c.env as Env;
  const authError = await requireInternalAuth(c.req.raw, env);
  if (authError) return authError;
  const loginSessionID = c.req.param("id");
  const payload = await c.req.json() as LoginSessionQRPayload;
  const qrURL = (payload.qr_url || "").trim();
  if (!qrURL) return c.json({ error: "qr_url is required" }, 400);
  const session = await updateLoginSessionQR(env, loginSessionID, qrURL, payload.qr_image_base64);
  if (!session) return c.json({ error: "login session not found" }, 404);
  return c.json({ ok: true, login_session: session });
});

// Login session complete
dt.post("/internal/login-sessions/:id/complete", async (c) => {
  const env = c.env as Env;
  const authError = await requireInternalAuth(c.req.raw, env);
  if (authError) return authError;
  const loginSessionID = c.req.param("id");
  const payload = await c.req.json() as LoginSessionCompletePayload;
  const session = await completeLoginSession(env, loginSessionID, payload);
  if (!session) return c.json({ error: "login session not found" }, 404);
  return c.json({ ok: true, login_session: session });
});

// ── Export sub-app ──

export { dt, dingtalkEnabled, requireDingtalkEnabled };
export type { Env as DtEnv, AuthUser as DtAuthUser };
