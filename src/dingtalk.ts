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

// ── Constants ──

const DEFAULT_WORKFLOW_FILE = "remote-runner.yml";
const DEFAULT_LOGIN_WORKFLOW_FILE = "windows-login.yml";
const DEFAULT_THREAD = 100;
const MAX_THREAD = 100;
const DEFAULT_JOBS_PAGE_SIZE = 10;
const ARTIFACT_RETENTION_DAYS = 90;

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

async function getGuestSetting(env: Env, guestId: string, key: string): Promise<string | null> {
  return getDtSetting(env, `guest:${guestId}:${key}`);
}

async function setGuestSetting(env: Env, guestId: string, key: string, value: string): Promise<void> {
  await setDtSetting(env, `guest:${guestId}:${key}`, value);
}

function getUserLegalState(env: Env, userID: string): Promise<{ accepted: boolean; acceptedAt: string | null; version: string }> {
  return Promise.resolve({ accepted: true, acceptedAt: nowISO(), version: "1.0" });
}

async function acceptLegalTerms(env: Env, userID: string): Promise<{ accepted: boolean; acceptedAt: string; version: string }> {
  const legalConfig = await getDtLegalConfig(env);
  const acceptedAt = nowISO();
  if (isGuestUser(userID)) {
    await setGuestSetting(env, userID, "legal_accepted", legalConfig.version);
  } else {
    await env.DB.prepare("UPDATE users SET legal_version = ?2, legal_accepted_at = ?3 WHERE id = ?1").bind(userID, legalConfig.version, acceptedAt).run();
  }
  return { accepted: true, acceptedAt, version: legalConfig.version };
}

// ── Cookies (dt_user_cookies table) ──

async function getUserCookieState(env: Env, userID: string): Promise<{ cookiesReady: boolean; cookiesUpdatedAt: string | null; cookies: Record<string, string> }> {
  const json = await getDtSetting(env, `cookie:${userID}`);
  const cookies = JSON.parse(json || "{}");
  const cookiesReady = Object.values(cookies).some((v:any) => typeof v === "string" && v.trim().length > 0);
  return { cookiesReady, cookiesUpdatedAt: null, cookies };
}

async function saveUserCookies(env: Env, userID: string, cookies: Record<string, string>): Promise<void> {
  await setDtSetting(env, `cookie:${userID}`, JSON.stringify(cookies));
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

async function getGuestToken(env: Env): Promise<string> {
  const row = await env.DB.prepare("SELECT value FROM dt_settings WHERE key='guest_token'").first<{value:string}>();
  return row?.value || '';
}

async function validateGuestToken(env: Env, token: string): Promise<boolean> {
  const valid = await getGuestToken(env);
  return valid !== '' && token === valid;
}

async function ensureGuestToken(env: Env): Promise<string> {
  let token = await getGuestToken(env);
  if (!token) {
    token = crypto.randomUUID();
    await env.DB.prepare("INSERT INTO dt_settings(key,value,updated_at) VALUES('guest_token',?1,?2) ON CONFLICT(key) DO UPDATE SET value=?1,updated_at=?2").bind(token, new Date().toISOString()).run();
  }
  return token;
}

function guestOwnerId(token: string): string {
  return "guest:" + token.slice(0, 16);
}

function isGuestUser(userID: string): boolean {
  return userID.startsWith("guest:");
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
  const s = c.get("session") as Session;
  const env = c.env as Env;
  const hasCookies = Boolean(await getDtSetting(env, `cookie:${s.id}`));
  const hasZipPassword = Boolean(await getDtSetting(env, `zip:${s.id}`));
  const [countsRow] = await Promise.all([
    env.DB.prepare(`SELECT COUNT(*) AS total_jobs, SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) AS queued_jobs, SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) AS running_jobs, SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) AS succeeded_jobs, SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_jobs FROM dt_jobs WHERE owner_user_id = ?1`).bind(s.id).first<Record<string, number | string | null>>(),
  ]);
  return c.json({
    ok: true, cookies_ready: hasCookies, has_zip_password: hasZipPassword,
    total_jobs: toNumber(countsRow?.total_jobs), queued_jobs: toNumber(countsRow?.queued_jobs),
    running_jobs: toNumber(countsRow?.running_jobs), succeeded_jobs: toNumber(countsRow?.succeeded_jobs),
    failed_jobs: toNumber(countsRow?.failed_jobs),
    default_thread: DEFAULT_THREAD, artifact_retention_days: ARTIFACT_RETENTION_DAYS,
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

dt.delete("/cookies", async (c) => {
  const u = getUser(c);
  await setDtSetting(c.env as Env, `cookie:${u.id}`, "");
  return c.json({ ok: true });
});

// ── Zip password ──
dt.get("/zip-password", async (c) => {
  const u = getUser(c);
  const pw = await getDtSetting(c.env as Env, `zip:${u.id}`);
  return c.json({ has_password: Boolean(pw) });
});

dt.post("/zip-password", async (c) => {
  const u = getUser(c);
  const body = await c.req.json() as { password?: string };
  const password = (body.password || "").trim();
  if (!password) return c.json({ error: "password cannot be empty" }, 400);
  if (password.length < 4) return c.json({ error: "password must be at least 4 characters" }, 400);
  await setDtSetting(c.env as Env, `zip:${u.id}`, password);
  return c.json({ ok: true });
});

dt.delete("/zip-password", async (c) => {
  const u = getUser(c);
  await setDtSetting(c.env as Env, `zip:${u.id}`, "");
  return c.json({ ok: true });
});
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

// ── Cancel job ──
dt.post("/jobs/:id/cancel", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const jobID = c.req.param("id");
  const job = await getJob(env, jobID, u.id);
  if (!job) return c.json({ error: "job not found" }, 404);
  if (job.status !== "queued" && job.status !== "running") return c.json({ error: "job cannot be cancelled in its current state" }, 400);
  // Cancel the GitHub Actions run if we have a run ID
  if (job.runner_run_id && env.GITHUB_REPOSITORY && env.GITHUB_ACTIONS_TOKEN) {
    try {
      await fetch(
        `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/runs/${job.runner_run_id}/cancel`,
        {
          method: "POST",
          headers: { accept: "application/vnd.github+json", authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`, "user-agent": "S-MAIL-DingTalk" },
        },
      );
    } catch { /* best-effort cancel */ }
  }
  await completeJob(env, jobID, { status: "failed", stage: "cancelled", errors: ["用户取消任务"], message: "用户取消了任务" });
  return c.json({ ok: true });
});

// ── Delete job ──
dt.delete("/jobs/:id", async (c) => {
  const u = getUser(c);
  const env = c.env as Env;
  const jobID = c.req.param("id");
  const job = await getJob(env, jobID, u.id);
  if (!job) return c.json({ error: "job not found" }, 404);
  await env.DB.prepare("DELETE FROM dt_job_events WHERE job_id = ?1").bind(jobID).run();
  await env.DB.prepare("DELETE FROM dt_jobs WHERE id = ?1").bind(jobID).run();
  return c.json({ ok: true });
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

// ── Admin: regenerate guest token ──
dt.post("/admin/regenerate-token", async (c) => {
  const token = crypto.randomUUID();
  await setDtSetting(c.env as Env, "guest_token", token);
  return c.json({ ok: true, token });
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
  let zipPassword = (await getGuestSetting(env, row.owner_user_id, "zip_password")) || "";
  if (!zipPassword) return c.json({ error: "zip password not set" }, 409);
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

export { dt, dingtalkEnabled, requireDingtalkEnabled, getGuestToken, validateGuestToken, ensureGuestToken, guestOwnerId };
export type { Env as DtEnv, AuthUser as DtAuthUser };
