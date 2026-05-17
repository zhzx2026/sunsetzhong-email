import { renderApp } from "./ui";

interface Env {
  DB: D1Database;
  FILES: R2Bucket;
  CORS_ALLOW_ORIGIN?: string;
  INTERNAL_API_TOKEN?: string;
  GITHUB_REPOSITORY?: string;
  GITHUB_WORKFLOW_FILE?: string;
  GITHUB_LOGIN_WORKFLOW_FILE?: string;
  GITHUB_REF?: string;
  GITHUB_ACTIONS_TOKEN?: string;
  AUTH_SALT?: string;
  BOOTSTRAP_USERNAME?: string;
  BOOTSTRAP_PASSWORD?: string;
  ALLOW_PUBLIC_REGISTRATION?: string;
  S3_ENDPOINT?: string;
  S3_BUCKET?: string;
  S3_ACCESS_KEY_ID?: string;
  S3_SECRET_ACCESS_KEY?: string;
  S3_REGION?: string;
}

interface JobFileRecord {
  name: string;
  relative_path: string;
  bucket_key?: string;
  r2_bucket_key?: string;
  s3_bucket_key?: string;
  size_bytes?: number;
  content_type?: string;
  download_url?: string;
  r2_download_url?: string;
  s3_download_url?: string;
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

interface CookiePayload {
  cookies: Record<string, string>;
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

interface AuthPayload {
  username?: string;
  password?: string;
}

interface AuthPasswordPayload {
  current_password?: string;
  new_password?: string;
}

interface AdminLegalPayload {
  text?: string;
}

interface AuthUser {
  id: string;
  username: string;
  is_sudo: boolean;
}

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  is_sudo: number | string | null;
  created_at: string;
  legal_version?: string | null;
  legal_accepted_at?: string | null;
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
}

interface AdminStorageIndexRow {
  id: string;
  owner_user_id: string;
  username: string | null;
  updated_at: string;
  files_json: string;
}

interface AdminStorageItem {
  key: string;
  size: number;
  uploaded_at: string;
  etag: string;
  refs: number;
  names: string[];
  owners: string[];
  job_ids: string[];
  latest_job_updated_at: string | null;
  download_url: string;
}

interface LoginSessionRow {
  id: string;
  user_id: string;
  status: string;
  qr_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface LoginSessionRecord {
  id: string;
  status: string;
  qr_url: string;
  error_message: string;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface LoginSessionQRPayload {
  qr_url?: string;
}

interface LoginSessionCompletePayload {
  cookies?: Record<string, string>;
  error?: string;
}

const DEFAULT_WORKFLOW_FILE = "remote-runner.yml";
const DEFAULT_LOGIN_WORKFLOW_FILE = "windows-login.yml";
const SESSION_COOKIE_NAME = "godingtalk_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const DEFAULT_THREAD = 100;
const MAX_THREAD = 100;
const DEFAULT_JOBS_PAGE_SIZE = 10;
const FILE_RETENTION_LIMIT_BYTES = 2 * 1024 * 1024 * 1024;
const DEFAULT_LEGAL_VERSION = "2026-03-21";
const DEFAULT_LEGAL_TEXT = `## 一、用途限制
本系统仅可在你对相关内容拥有合法访问权、下载权、保存权或内部归档权的前提下使用。你不得将本系统用于任何违反适用法律法规、平台规则、合同约定、保密义务或知识产权规则的用途。

## 二、授权保证
你声明并保证：你提交的账号、Cookies、二维码登录、链接及相关内容，均已获得合法授权；你有权访问、处理、下载、保存和使用相应直播回放或文件。

## 三、禁止行为
你不得使用本系统实施未授权下载、批量抓取、绕过访问控制、规避安全限制、侵犯隐私、侵犯知识产权、传播违法内容、或从事任何可能引发第三方索赔、行政处罚或刑事风险的行为。

## 四、责任承担
你应独立承担因你的使用行为所引发的一切责任、损失、处罚、赔偿、争议、索赔、律师费及维权成本；若系统提供方因此遭受损失，你同意进行足额赔偿。

## 四点一、风控与封禁风险
你理解并同意：若因你使用本系统、重复登录、频繁扫码、批量操作、异常请求或其他与你的使用行为相关的原因，导致第三方平台对你的账号、设备、网络环境或访问权限采取风控、限制、冻结、封禁、降权、验证升级、访问拒绝或其他不利措施，相关后果均由你自行承担，系统提供方不承担任何责任。

## 五、服务免责
本系统按“现状”提供，不对可用性、稳定性、连续性、适法性、特定目的适用性、结果准确性或第三方平台兼容性作任何明示或默示保证。系统提供方有权随时中断、限制、修改或终止服务。

## 六、证据与记录
你同意系统记录你的接受时间、账号标识及后续操作，以作为你已阅读并接受本声明的电子记录。该记录可用于内部合规、争议处理与安全审计。

## 七、法律提示
本免责声明旨在强化风险提示、授权确认和责任分配，但其具体法律效力仍受适用法律、事实背景及司法解释影响。若要获得可执行、完整且适用于你业务场景的法律文本，应由持牌律师审阅并定稿。`;
const FILE_RETENTION_HOURS = 24;
const EMPTY_SHA256_HEX = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body, null, 2), {
    ...init,
    headers,
  });
}

function textResponse(body: string, init?: ResponseInit): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "text/plain; charset=utf-8");
  }
  return new Response(body, {
    ...init,
    headers,
  });
}

function htmlResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function redirectResponse(location: string, status = 302): Response {
  return new Response(null, {
    status,
    headers: {
      location,
      "cache-control": "no-store",
    },
  });
}

function applyCors(request: Request, response: Response, env: Env): Response {
  const headers = new Headers(response.headers);
  const allowedOrigin = env.CORS_ALLOW_ORIGIN?.trim() || "*";
  const requestOrigin = request.headers.get("Origin");

  if (allowedOrigin === "*") {
    headers.set("Access-Control-Allow-Origin", requestOrigin || "*");
  } else if (requestOrigin === allowedOrigin) {
    headers.set("Access-Control-Allow-Origin", requestOrigin);
  }

  headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function nowISO(): string {
  return new Date().toISOString();
}

function nextJobID(): string {
  return `job-${Date.now()}-${crypto.randomUUID().split("-")[0]}`;
}

function nextLoginSessionID(): string {
  return `login-${Date.now()}-${crypto.randomUUID().split("-")[0]}`;
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeURLs(primary?: string, batch?: string[]): string[] {
  const urls: string[] = [];
  if (typeof primary === "string" && primary.trim()) {
    urls.push(primary.trim());
  }
  if (Array.isArray(batch)) {
    for (const entry of batch) {
      if (typeof entry === "string" && entry.trim()) {
        urls.push(entry.trim());
      }
    }
  }
  return urls;
}

function parseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function jobFileDownloadURL(jobID: string, relativePath: string, storage?: "r2" | "s3"): string {
  const params = new URLSearchParams({
    job_id: jobID,
    path: relativePath,
  });
  if (storage) {
    params.set("storage", storage);
  }
  return `/api/files?${params.toString()}`;
}

function adminStorageDownloadURL(key: string, name?: string): string {
  const params = new URLSearchParams({ key });
  if (name) {
    params.set("name", name);
  }
  return `/api/admin/storage/file?${params.toString()}`;
}

function resolveR2BucketKey(file: JobFileRecord, env: Env): string {
  const direct = (file.r2_bucket_key || "").trim();
  if (direct) {
    return direct;
  }
  const legacy = (file.bucket_key || "").trim();
  if (!legacy) {
    return "";
  }
  if ((file.s3_bucket_key || "").trim()) {
    return "";
  }
  return storageUsesS3(env) ? "" : legacy;
}

function resolveS3BucketKey(file: JobFileRecord, env: Env): string {
  const direct = (file.s3_bucket_key || "").trim();
  if (direct) {
    return direct;
  }
  const legacy = (file.bucket_key || "").trim();
  if (!legacy) {
    return "";
  }
  if ((file.r2_bucket_key || "").trim()) {
    return "";
  }
  return storageUsesS3(env) ? legacy : "";
}

function enrichJobFile(env: Env, jobID: string, file: JobFileRecord): JobFileRecord {
  const r2BucketKey = resolveR2BucketKey(file, env);
  const s3BucketKey = resolveS3BucketKey(file, env);
  return {
    ...file,
    r2_bucket_key: r2BucketKey,
    s3_bucket_key: s3BucketKey,
    r2_download_url: r2BucketKey ? jobFileDownloadURL(jobID, file.relative_path, "r2") : "",
    s3_download_url: s3BucketKey ? jobFileDownloadURL(jobID, file.relative_path, "s3") : "",
    download_url: r2BucketKey
      ? jobFileDownloadURL(jobID, file.relative_path, "r2")
      : (s3BucketKey ? jobFileDownloadURL(jobID, file.relative_path, "s3") : ""),
  };
}

function storageUsesS3(env: Env): boolean {
  return Boolean(
    env.S3_ENDPOINT?.trim()
    && env.S3_BUCKET?.trim()
    && env.S3_ACCESS_KEY_ID?.trim()
    && env.S3_SECRET_ACCESS_KEY?.trim(),
  );
}

function s3EndpointHost(env: Env): string {
  const endpoint = env.S3_ENDPOINT?.trim();
  if (!endpoint) {
    return "";
  }
  try {
    return new URL(endpoint).hostname;
  } catch {
    return "";
  }
}

function s3Region(env: Env): string {
  const configured = env.S3_REGION?.trim();
  if (configured) {
    return configured;
  }
  const host = s3EndpointHost(env);
  if (host.endsWith(".r2.cloudflarestorage.com") || host.endsWith("hi168.com")) {
    return "auto";
  }
  return "us-east-1";
}

function s3ObjectURL(env: Env, bucketKey: string): URL {
  const endpoint = env.S3_ENDPOINT?.trim() || "";
  const bucket = env.S3_BUCKET?.trim() || "";
  const base = new URL(endpoint.endsWith("/") ? endpoint : `${endpoint}/`);
  const encodedKey = bucketKey.split("/").map((part) => encodeURIComponent(part)).join("/");
  base.pathname = `/${encodeURIComponent(bucket)}/${encodedKey}`;
  return base;
}

async function signedS3Request(env: Env, method: "GET" | "DELETE", bucketKey: string): Promise<Response> {
  const endpoint = env.S3_ENDPOINT?.trim() || "";
  const accessKeyID = env.S3_ACCESS_KEY_ID?.trim() || "";
  const secretAccessKey = env.S3_SECRET_ACCESS_KEY?.trim() || "";
  const region = s3Region(env);
  if (!endpoint || !accessKeyID || !secretAccessKey || !env.S3_BUCKET?.trim()) {
    throw new Error("S3 storage is not configured");
  }

  const url = s3ObjectURL(env, bucketKey);
  const currentTime = new Date();
  const amzDate = currentTime.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const shortDate = amzDate.slice(0, 8);
  const payloadHash = EMPTY_SHA256_HEX;
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    method,
    url.pathname,
    "",
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${shortDate}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = await hmacSha256Raw(new TextEncoder().encode(`AWS4${secretAccessKey}`), shortDate);
  const kRegion = await hmacSha256Raw(kDate, region);
  const kService = await hmacSha256Raw(kRegion, "s3");
  const kSigning = await hmacSha256Raw(kService, "aws4_request");
  const signature = await hmacSha256Hex(kSigning, stringToSign);

  const headers = new Headers();
  headers.set("x-amz-content-sha256", payloadHash);
  headers.set("x-amz-date", amzDate);
  headers.set(
    "Authorization",
    `AWS4-HMAC-SHA256 Credential=${accessKeyID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  );

  return fetch(url.toString(), {
    method,
    headers,
  });
}

async function deleteR2Objects(env: Env, keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }
  await (env.FILES as unknown as { delete(names: string[]): Promise<void> }).delete(keys);
}

function githubWorkflowURL(repository: string, workflowFile: string): string {
  return `https://github.com/${repository}/actions/workflows/${workflowFile}`;
}

function githubRunHistoryURL(repository: string, workflowFile: string): string {
  return `${githubWorkflowURL(repository, workflowFile)}?query=event%3Aworkflow_dispatch`;
}

function parseCookieHeader(raw: string | null): Record<string, string> {
  const source = raw || "";
  const result: Record<string, string> = {};
  source.split(";").forEach((entry) => {
    const item = entry.trim();
    if (!item) {
      return;
    }
    const index = item.indexOf("=");
    if (index === -1) {
      return;
    }
    const key = item.slice(0, index).trim();
    const value = item.slice(index + 1).trim();
    if (key) {
      result[key] = value;
    }
  });
  return result;
}

function getCookieValue(request: Request, name: string): string {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return cookies[name] || "";
}

function sessionCookie(token: string, maxAgeSeconds: number): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax; Secure`;
}

function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`;
}

function authSalt(env: Env): string {
  return env.AUTH_SALT?.trim() || "godingtalk-auth-salt-v1";
}

function parseEnvBool(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== "string") {
    return fallback;
  }
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return fallback;
  }
  if (normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no" || normalized === "off") {
    return false;
  }
  return fallback;
}

function registrationOpen(env: Env, usersCount: number): boolean {
  return usersCount === 0 || parseEnvBool(env.ALLOW_PUBLIC_REGISTRATION, true);
}

function clampThread(value: number): number {
  return Math.min(MAX_THREAD, Math.max(1, value));
}

function normalizeJobsPageSize(value: string | null): number {
  const parsed = toNumber(value);
  if (parsed === 20 || parsed === 50) {
    return parsed;
  }
  return DEFAULT_JOBS_PAGE_SIZE;
}

function normalizePageNumber(value: string | null): number {
  const parsed = toNumber(value);
  return parsed > 0 ? parsed : 1;
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(hash));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.trim();
  const bytes = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(normalized.slice(index * 2, (index * 2) + 2), 16);
  }
  return bytes;
}

async function hmacSha256Raw(key: ArrayBuffer | Uint8Array, message: string): Promise<ArrayBuffer> {
  const rawBytes = key instanceof Uint8Array ? key : new Uint8Array(key);
  const rawKey = rawBytes.slice();
  const importedKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", importedKey, new TextEncoder().encode(message));
}

async function hmacSha256Hex(key: ArrayBuffer | Uint8Array, message: string): Promise<string> {
  const signature = await hmacSha256Raw(key, message);
  return Array.from(new Uint8Array(signature)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function passwordHash(env: Env, username: string, password: string): Promise<string> {
  return sha256Hex(`${authSalt(env)}:${username}:${password}`);
}

async function sessionTokenHash(env: Env, token: string): Promise<string> {
  return sha256Hex(`${authSalt(env)}:session:${token}`);
}

async function requireInternalAuth(request: Request, env: Env): Promise<Response | null> {
  const expected = env.INTERNAL_API_TOKEN?.trim();
  if (!expected) {
    return jsonResponse({ error: "INTERNAL_API_TOKEN is not configured" }, { status: 500 });
  }
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim() || "";
  if (token !== expected) {
    return jsonResponse({ error: "missing or invalid internal token" }, { status: 401 });
  }
  return null;
}

async function listUsersCount(env: Env): Promise<number> {
  const row = await env.DB.prepare("SELECT COUNT(*) AS c FROM users").first<{ c: number | string | null }>();
  return toNumber(row?.c);
}

async function getAppSetting(env: Env, key: string): Promise<string | null> {
  const row = await env.DB
    .prepare("SELECT value FROM settings WHERE key = ?1")
    .bind(key)
    .first<{ value: string | null }>();
  return row?.value ?? null;
}

async function setAppSetting(env: Env, key: string, value: string): Promise<void> {
  await env.DB
    .prepare(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (?1, ?2, ?3)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
    )
    .bind(key, value, nowISO())
    .run();
}

async function ensureDefaultLegalConfig(env: Env): Promise<void> {
  const [version, text] = await Promise.all([
    getAppSetting(env, "legal_version"),
    getAppSetting(env, "legal_text"),
  ]);
  if (!version) {
    await setAppSetting(env, "legal_version", DEFAULT_LEGAL_VERSION);
  }
  if (!text) {
    await setAppSetting(env, "legal_text", DEFAULT_LEGAL_TEXT);
  }
}

async function getLegalConfig(env: Env): Promise<{ version: string; text: string }> {
  await ensureDefaultLegalConfig(env);
  const [version, text] = await Promise.all([
    getAppSetting(env, "legal_version"),
    getAppSetting(env, "legal_text"),
  ]);
  return {
    version: version || DEFAULT_LEGAL_VERSION,
    text: text || DEFAULT_LEGAL_TEXT,
  };
}

async function getUserByUsername(env: Env, username: string): Promise<UserRow | null> {
  return env.DB
    .prepare("SELECT id, username, password_hash, is_sudo, created_at FROM users WHERE username = ?1")
    .bind(username)
    .first<UserRow>();
}

async function getUserLegalState(env: Env, userID: string): Promise<{
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
}> {
  const legalConfig = await getLegalConfig(env);
  const row = await env.DB
    .prepare("SELECT legal_version, legal_accepted_at FROM users WHERE id = ?1")
    .bind(userID)
    .first<{ legal_version: string | null; legal_accepted_at: string | null }>();

  const version = row?.legal_version || "";
  const acceptedAt = row?.legal_accepted_at || null;
  return {
    accepted: version === legalConfig.version && Boolean(acceptedAt),
    acceptedAt,
    version: legalConfig.version,
  };
}

async function acceptLegalTerms(env: Env, userID: string): Promise<{
  accepted: boolean;
  acceptedAt: string | null;
  version: string;
}> {
  const legalConfig = await getLegalConfig(env);
  const acceptedAt = nowISO();
  await env.DB
    .prepare(
      `UPDATE users
       SET legal_version = ?2,
           legal_accepted_at = ?3
       WHERE id = ?1`,
    )
    .bind(userID, legalConfig.version, acceptedAt)
    .run();
  return {
    accepted: true,
    acceptedAt,
    version: legalConfig.version,
  };
}

async function updateUserPassword(env: Env, userID: string, newPasswordHash: string): Promise<void> {
  await env.DB
    .prepare("UPDATE users SET password_hash = ?2 WHERE id = ?1")
    .bind(userID, newPasswordHash)
    .run();
}

async function listAdminUsers(env: Env): Promise<AdminUserRecord[]> {
  const legalConfig = await getLegalConfig(env);
  const result = await env.DB
    .prepare(
      `SELECT
         users.id AS id,
         users.username AS username,
         users.is_sudo AS is_sudo,
         users.created_at AS created_at,
         users.legal_version AS legal_version,
         users.legal_accepted_at AS legal_accepted_at,
         user_cookies.cookies_json AS cookies_json,
         COUNT(jobs.id) AS total_jobs
       FROM users
       LEFT JOIN user_cookies ON user_cookies.user_id = users.id
       LEFT JOIN jobs ON jobs.owner_user_id = users.id
       GROUP BY users.id
       ORDER BY users.created_at DESC`,
    )
    .all<UserRow & { cookies_json: string | null; total_jobs: number | string | null }>();

  const rows = Array.isArray(result.results) ? result.results : [];
  return rows.map((row) => {
    const cookies = parseJSON<Record<string, string>>(row.cookies_json, {});
    const cookiesReady = Object.values(cookies).some((value) => typeof value === "string" && value.trim().length > 0);
    return {
      id: row.id,
      username: row.username,
      is_sudo: toNumber(row.is_sudo) === 1,
      created_at: row.created_at,
      legal_accepted: row.legal_version === legalConfig.version && Boolean(row.legal_accepted_at),
      legal_accepted_at: row.legal_accepted_at || null,
      cookies_ready: cookiesReady,
      total_jobs: toNumber(row.total_jobs),
    };
  });
}

function pushUniqueLimited(target: string[], value: string, limit = 5): void {
  const normalized = value.trim();
  if (!normalized || target.includes(normalized) || target.length >= limit) {
    return;
  }
  target.push(normalized);
}

async function buildAdminStorageMetadataMap(env: Env): Promise<Map<string, {
  refs: number;
  names: string[];
  owners: string[];
  job_ids: string[];
  latest_job_updated_at: string | null;
}>> {
  const result = await env.DB
    .prepare(
      `SELECT
         jobs.id AS id,
         jobs.owner_user_id AS owner_user_id,
         users.username AS username,
         jobs.updated_at AS updated_at,
         jobs.files_json AS files_json
       FROM jobs
       LEFT JOIN users ON users.id = jobs.owner_user_id
       WHERE jobs.files_json IS NOT NULL
         AND jobs.files_json != '[]'`,
    )
    .all<AdminStorageIndexRow>();

  const rows = Array.isArray(result.results) ? result.results : [];
  const metadata = new Map<string, {
    refs: number;
    names: string[];
    owners: string[];
    job_ids: string[];
    latest_job_updated_at: string | null;
  }>();

  rows.forEach((row) => {
    const files = parseJSON<JobFileRecord[]>(row.files_json, []);
    files.forEach((file) => {
      const key = resolveR2BucketKey(file, env);
      if (!key) {
        return;
      }

      const current = metadata.get(key) || {
        refs: 0,
        names: [],
        owners: [],
        job_ids: [],
        latest_job_updated_at: null,
      };

      current.refs += 1;
      pushUniqueLimited(current.names, file.name || file.relative_path || key, 6);
      pushUniqueLimited(current.owners, row.username || row.owner_user_id, 6);
      pushUniqueLimited(current.job_ids, row.id, 8);
      if (!current.latest_job_updated_at || row.updated_at > current.latest_job_updated_at) {
        current.latest_job_updated_at = row.updated_at;
      }
      metadata.set(key, current);
    });
  });

  return metadata;
}

async function listAdminStorage(
  env: Env,
  options: { cursor?: string; prefix?: string; limit?: number },
): Promise<{ items: AdminStorageItem[]; cursor: string; has_more: boolean }> {
  const prefix = (options.prefix || "").trim();
  const limit = Math.min(100, Math.max(1, toNumber(options.limit || 50)));
  const [metadataMap, listResult] = await Promise.all([
    buildAdminStorageMetadataMap(env),
    env.FILES.list({
      cursor: (options.cursor || "").trim() || undefined,
      prefix: prefix || undefined,
      limit,
    }),
  ]);

  const objects = Array.isArray(listResult.objects) ? listResult.objects : [];
  const items = objects.map((object) => {
    const metadata = metadataMap.get(object.key);
    const displayName = metadata?.names?.[0] || object.key.split("/").pop() || object.key;
    return {
      key: object.key,
      size: toNumber(object.size),
      uploaded_at: object.uploaded instanceof Date ? object.uploaded.toISOString() : String(object.uploaded || ""),
      etag: object.httpEtag || object.etag || "",
      refs: metadata?.refs || 0,
      names: metadata?.names || [displayName],
      owners: metadata?.owners || [],
      job_ids: metadata?.job_ids || [],
      latest_job_updated_at: metadata?.latest_job_updated_at || null,
      download_url: adminStorageDownloadURL(object.key, displayName),
    } satisfies AdminStorageItem;
  });

  return {
    items,
    cursor: listResult.cursor || "",
    has_more: Boolean(listResult.truncated),
  };
}

function requireSudo(user: AuthUser): Response | null {
  if (!user.is_sudo) {
    return jsonResponse({ error: "sudo required" }, { status: 403 });
  }
  return null;
}

async function getAdminLegalConfig(env: Env): Promise<{ version: string; text: string }> {
  return getLegalConfig(env);
}

async function updateAdminLegalConfig(env: Env, text: string): Promise<{ version: string; text: string }> {
  const normalized = text.trim();
  if (!normalized) {
    throw new Error("legal text cannot be empty");
  }
  const version = nowISO();
  await Promise.all([
    setAppSetting(env, "legal_text", normalized),
    setAppSetting(env, "legal_version", version),
  ]);
  return { version, text: normalized };
}

async function getAuthUser(request: Request, env: Env): Promise<AuthUser | null> {
  const token = getCookieValue(request, SESSION_COOKIE_NAME);
  if (!token) {
    return null;
  }
  const tokenHash = await sessionTokenHash(env, token);
  const row = await env.DB
    .prepare(
      `SELECT users.id AS id, users.username AS username, users.is_sudo AS is_sudo
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?1
         AND sessions.expires_at > ?2`,
    )
    .bind(tokenHash, nowISO())
    .first<{ id: string; username: string; is_sudo: number | string | null }>();
  if (!row) {
    return null;
  }
  return {
    id: row.id,
    username: row.username,
    is_sudo: toNumber(row.is_sudo) === 1,
  };
}

async function requireUserAuth(request: Request, env: Env): Promise<{ user: AuthUser | null; response: Response | null }> {
  const user = await getAuthUser(request, env);
  if (!user) {
    return {
      user: null,
      response: jsonResponse({ error: "login required" }, { status: 401 }),
    };
  }
  return { user, response: null };
}

async function createUser(env: Env, username: string, password: string): Promise<AuthUser> {
  const normalized = username.trim();
  const isSudo = normalized.toLowerCase() === "zhong";
  const id = crypto.randomUUID();
  await env.DB
    .prepare(
      `INSERT INTO users (id, username, password_hash, is_sudo, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5)`,
    )
    .bind(id, normalized, await passwordHash(env, normalized, password), isSudo ? 1 : 0, nowISO())
    .run();
  return { id, username: normalized, is_sudo: isSudo };
}

async function createSession(env: Env, userID: string): Promise<string> {
  const token = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const tokenHash = await sessionTokenHash(env, token);
  const createdAt = Date.now();
  const expiresAt = new Date(createdAt + (SESSION_TTL_SECONDS * 1000)).toISOString();
  await env.DB
    .prepare(
      `INSERT INTO sessions (token_hash, user_id, created_at, expires_at)
       VALUES (?1, ?2, ?3, ?4)`,
    )
    .bind(tokenHash, userID, new Date(createdAt).toISOString(), expiresAt)
    .run();
  return token;
}

async function dropSession(request: Request, env: Env): Promise<void> {
  const token = getCookieValue(request, SESSION_COOKIE_NAME);
  if (!token) {
    return;
  }
  const tokenHash = await sessionTokenHash(env, token);
  await env.DB
    .prepare("DELETE FROM sessions WHERE token_hash = ?1")
    .bind(tokenHash)
    .run();
}

async function ensureBootstrapUser(env: Env): Promise<void> {
  const username = env.BOOTSTRAP_USERNAME?.trim() || "";
  const password = env.BOOTSTRAP_PASSWORD?.trim() || "";
  if (!username || !password) {
    return;
  }
  const usersCount = await listUsersCount(env);
  if (usersCount > 0) {
    return;
  }
  await createUser(env, username, password);
}

async function getUserCookieState(env: Env, userID: string): Promise<{
  cookiesReady: boolean;
  cookiesUpdatedAt: string | null;
  cookies: Record<string, string>;
}> {
  const row = await env.DB
    .prepare("SELECT cookies_json, updated_at FROM user_cookies WHERE user_id = ?1")
    .bind(userID)
    .first<{ cookies_json: string; updated_at: string }>();

  const cookies = parseJSON<Record<string, string>>(row?.cookies_json, {});
  const cookiesReady = Object.entries(cookies).some(([name, value]) => (
    typeof name === "string"
    && name.trim().length > 0
    && typeof value === "string"
    && value.trim().length > 0
  ));
  return {
    cookiesReady,
    cookiesUpdatedAt: row?.updated_at || null,
    cookies,
  };
}

async function saveUserCookies(env: Env, userID: string, cookies: Record<string, string>): Promise<void> {
  await env.DB
    .prepare(
      `INSERT INTO user_cookies (user_id, cookies_json, updated_at)
       VALUES (?1, ?2, ?3)
       ON CONFLICT(user_id) DO UPDATE SET
         cookies_json = excluded.cookies_json,
         updated_at = excluded.updated_at`,
    )
    .bind(userID, JSON.stringify(cookies), nowISO())
    .run();
}

function parseLoginSessionRow(row: LoginSessionRow): LoginSessionRecord {
  return {
    id: row.id,
    status: row.status || "pending",
    qr_url: row.qr_url || "",
    error_message: row.error_message || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
    completed_at: row.completed_at,
  };
}

async function createLoginSession(env: Env, userID: string): Promise<LoginSessionRecord> {
  const now = nowISO();
  const id = nextLoginSessionID();
  await env.DB
    .prepare(
      `INSERT INTO login_sessions (id, user_id, status, qr_url, error_message, created_at, updated_at, completed_at)
       VALUES (?1, ?2, 'pending', '', '', ?3, ?3, NULL)`,
    )
    .bind(id, userID, now)
    .run();
  return {
    id,
    status: "pending",
    qr_url: "",
    error_message: "",
    created_at: now,
    updated_at: now,
    completed_at: null,
  };
}

async function getLoginSession(env: Env, loginSessionID: string, userID?: string): Promise<LoginSessionRecord | null> {
  const row = userID
    ? await env.DB
      .prepare("SELECT * FROM login_sessions WHERE id = ?1 AND user_id = ?2")
      .bind(loginSessionID, userID)
      .first<LoginSessionRow>()
    : await env.DB
      .prepare("SELECT * FROM login_sessions WHERE id = ?1")
      .bind(loginSessionID)
      .first<LoginSessionRow>();
  return row ? parseLoginSessionRow(row) : null;
}

async function getLatestLoginSession(env: Env, userID: string): Promise<LoginSessionRecord | null> {
  const row = await env.DB
    .prepare(
      `SELECT *
       FROM login_sessions
       WHERE user_id = ?1
       ORDER BY updated_at DESC
       LIMIT 1`,
    )
    .bind(userID)
    .first<LoginSessionRow>();
  return row ? parseLoginSessionRow(row) : null;
}

async function updateLoginSessionQR(env: Env, loginSessionID: string, qrURL: string): Promise<LoginSessionRecord | null> {
  await env.DB
    .prepare(
      `UPDATE login_sessions
       SET status = 'qr_ready',
           qr_url = ?2,
           error_message = '',
           updated_at = ?3
       WHERE id = ?1`,
    )
    .bind(loginSessionID, qrURL, nowISO())
    .run();
  return getLoginSession(env, loginSessionID);
}

async function completeLoginSession(
  env: Env,
  loginSessionID: string,
  payload: LoginSessionCompletePayload,
): Promise<LoginSessionRecord | null> {
  const sessionRow = await env.DB
    .prepare("SELECT * FROM login_sessions WHERE id = ?1")
    .bind(loginSessionID)
    .first<LoginSessionRow>();
  if (!sessionRow) {
    return null;
  }

  const cookies = payload.cookies && typeof payload.cookies === "object" && !Array.isArray(payload.cookies)
    ? Object.fromEntries(
      Object.entries(payload.cookies).filter(([name, value]) => (
        typeof name === "string"
        && name.trim().length > 0
        && typeof value === "string"
        && value.trim().length > 0
      )),
    )
    : {};

  const currentTime = nowISO();
  if (Object.keys(cookies).length > 0) {
    await saveUserCookies(env, sessionRow.user_id, cookies);
    await env.DB
      .prepare(
        `UPDATE login_sessions
         SET status = 'completed',
             error_message = '',
             updated_at = ?2,
             completed_at = ?2
         WHERE id = ?1`,
      )
      .bind(loginSessionID, currentTime)
      .run();
  } else {
    await env.DB
      .prepare(
        `UPDATE login_sessions
         SET status = 'failed',
             error_message = ?2,
             updated_at = ?3,
             completed_at = ?3
         WHERE id = ?1`,
      )
      .bind(loginSessionID, (payload.error || "login failed").trim(), currentTime)
      .run();
  }

  return getLoginSession(env, loginSessionID);
}

function parseJobRow(env: Env, row: JobRow): JobRecord {
  const files = parseJSON<JobFileRecord[]>(row.files_json, []).map((file) => enrichJobFile(env, row.id, file));
  return {
    id: row.id,
    status: row.status,
    stage: row.stage,
    urls: parseJSON<string[]>(row.urls_json, []),
    thread: toNumber(row.thread),
    output_subdir: row.output_subdir || "",
    create_video_list: Boolean(toNumber(row.create_video_list)),
    current_title: row.current_title || "",
    completed_parts: toNumber(row.completed_parts),
    total_parts: toNumber(row.total_parts),
    progress_percent: toNumber(row.progress_percent),
    titles: parseJSON<string[]>(row.titles_json, []),
    errors: parseJSON<string[]>(row.errors_json, []),
    files,
    runner_run_id: row.runner_run_id || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
    started_at: row.started_at,
    finished_at: row.finished_at,
  };
}

async function insertEvent(env: Env, jobID: string, level: string, message: string): Promise<void> {
  await env.DB
    .prepare(
      `INSERT INTO job_events (job_id, level, message, created_at)
       VALUES (?1, ?2, ?3, ?4)`,
    )
    .bind(jobID, level, message, nowISO())
    .run();
}

async function getJob(env: Env, jobID: string, ownerUserID?: string): Promise<JobRecord | null> {
  const row = ownerUserID
    ? await env.DB
      .prepare("SELECT * FROM jobs WHERE id = ?1 AND owner_user_id = ?2")
      .bind(jobID, ownerUserID)
      .first<JobRow>()
    : await env.DB
      .prepare("SELECT * FROM jobs WHERE id = ?1")
      .bind(jobID)
      .first<JobRow>();
  return row ? parseJobRow(env, row) : null;
}

async function listJobs(env: Env, ownerUserID: string): Promise<JobRecord[]> {
  const result = await env.DB
    .prepare(
      `SELECT *
       FROM jobs
       WHERE owner_user_id = ?1
       ORDER BY updated_at DESC`,
    )
    .bind(ownerUserID)
    .all<JobRow>();
  const rows = Array.isArray(result.results) ? result.results : [];
  return rows.map((row) => parseJobRow(env, row));
}

async function listJobsPage(
  env: Env,
  ownerUserID: string,
  page: number,
  pageSize: number,
): Promise<{ jobs: JobRecord[]; total: number; page: number; page_size: number; total_pages: number }> {
  const safePageSize = normalizeJobsPageSize(String(pageSize));
  const safePage = Math.max(1, page);
  const totalRow = await env.DB
    .prepare("SELECT COUNT(*) AS c FROM jobs WHERE owner_user_id = ?1")
    .bind(ownerUserID)
    .first<{ c: number | string | null }>();
  const total = toNumber(totalRow?.c);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * safePageSize;

  const result = await env.DB
    .prepare(
      `SELECT *
       FROM jobs
       WHERE owner_user_id = ?1
       ORDER BY updated_at DESC
       LIMIT ?2 OFFSET ?3`,
    )
    .bind(ownerUserID, safePageSize, offset)
    .all<JobRow>();
  const rows = Array.isArray(result.results) ? result.results : [];
  return {
    jobs: rows.map((row) => parseJobRow(env, row)),
    total,
    page: currentPage,
    page_size: safePageSize,
    total_pages: totalPages,
  };
}

async function listJobEvents(env: Env, jobID: string, limit = 80): Promise<JobEventRecord[]> {
  const result = await env.DB
    .prepare(
      `SELECT id, level, message, created_at
       FROM job_events
       WHERE job_id = ?1
       ORDER BY created_at DESC
       LIMIT ?2`,
    )
    .bind(jobID, limit)
    .all<JobEventRow>();
  const rows = Array.isArray(result.results) ? result.results : [];
  return rows.map((row) => ({
    id: toNumber(row.id),
    level: row.level,
    message: row.message,
    created_at: row.created_at,
  }));
}

async function updateJobProgress(env: Env, jobID: string, payload: ProgressPayload): Promise<void> {
  const current = await getJob(env, jobID);
  if (!current) {
    throw new Error("job not found");
  }

  const titles = Array.isArray(payload.titles) ? payload.titles : current.titles;
  const errors = Array.isArray(payload.errors) ? payload.errors : current.errors;
  const files = Array.isArray(payload.files)
    ? payload.files.map((file) => enrichJobFile(env, jobID, file))
    : current.files;
  const status = payload.status || current.status || "running";
  const stage = payload.stage || current.stage || "running";

  await env.DB
    .prepare(
      `UPDATE jobs
       SET status = ?2,
           stage = ?3,
           current_title = ?4,
           completed_parts = ?5,
           total_parts = ?6,
           progress_percent = ?7,
           titles_json = ?8,
           errors_json = ?9,
           files_json = ?10,
           updated_at = ?11
       WHERE id = ?1`,
    )
    .bind(
      jobID,
      status,
      stage,
      payload.current_title || current.current_title || "",
      payload.completed_parts ?? current.completed_parts,
      payload.total_parts ?? current.total_parts,
      payload.progress_percent ?? current.progress_percent,
      JSON.stringify(titles),
      JSON.stringify(errors),
      JSON.stringify(files),
      nowISO(),
    )
    .run();

  if (payload.message) {
    await insertEvent(env, jobID, "info", payload.message);
  }
}

async function completeJob(env: Env, jobID: string, payload: CompletePayload): Promise<JobRecord | null> {
  const current = await getJob(env, jobID);
  if (!current) {
    return null;
  }

  const status = payload.status || current.status || "failed";
  const stage = payload.stage || (status === "succeeded" ? "completed" : "failed");
  const titles = Array.isArray(payload.titles) ? payload.titles : current.titles;
  const errors = Array.isArray(payload.errors) ? payload.errors : current.errors;
  const files = Array.isArray(payload.files)
    ? payload.files.map((file) => enrichJobFile(env, jobID, file))
    : current.files;

  await env.DB
    .prepare(
      `UPDATE jobs
       SET status = ?2,
           stage = ?3,
           current_title = ?4,
           completed_parts = ?5,
           total_parts = ?6,
           progress_percent = ?7,
           titles_json = ?8,
           errors_json = ?9,
           files_json = ?10,
           updated_at = ?11,
           finished_at = ?12
       WHERE id = ?1`,
    )
    .bind(
      jobID,
      status,
      stage,
      payload.current_title || current.current_title || "",
      payload.completed_parts ?? current.completed_parts,
      payload.total_parts ?? current.total_parts,
      payload.progress_percent ?? current.progress_percent,
      JSON.stringify(titles),
      JSON.stringify(errors),
      JSON.stringify(files),
      nowISO(),
      nowISO(),
    )
    .run();

  if (payload.message) {
    await insertEvent(env, jobID, status === "succeeded" ? "info" : "error", payload.message);
  }

  return getJob(env, jobID);
}

async function cleanupExpiredFiles(env: Env): Promise<{ jobs: number; files: number }> {
  const usageResult = await env.DB
    .prepare(
      `SELECT files_json
       FROM jobs
       WHERE files_json IS NOT NULL
         AND files_json != '[]'`,
    )
    .all<{ files_json: string }>();

  const usageRows = Array.isArray(usageResult.results) ? usageResult.results : [];
  const bucketStats = new Map<string, { refs: number; size: number }>();
  let totalBytes = 0;

  for (const row of usageRows) {
    const files = parseJSON<JobFileRecord[]>(row.files_json, []);
    for (const file of files) {
      const key = resolveR2BucketKey(file, env);
      if (!key) {
        continue;
      }
      const current = bucketStats.get(key);
      if (current) {
        current.refs += 1;
      } else {
        const size = toNumber(file.size_bytes);
        bucketStats.set(key, { refs: 1, size });
        totalBytes += size;
      }
    }
  }

  if (totalBytes <= FILE_RETENTION_LIMIT_BYTES) {
    return {
      jobs: 0,
      files: 0,
    };
  }

  const cutoff = new Date(Date.now() - (FILE_RETENTION_HOURS * 60 * 60 * 1000)).toISOString();
  const result = await env.DB
    .prepare(
      `SELECT *
       FROM jobs
       WHERE finished_at IS NOT NULL
         AND finished_at <= ?1
         AND files_json IS NOT NULL
         AND files_json != '[]'
       ORDER BY finished_at ASC`,
    )
    .bind(cutoff)
    .all<JobRow>();

  const rows = Array.isArray(result.results) ? result.results : [];
  let cleanedJobs = 0;
  let deletedFiles = 0;

  for (const row of rows) {
    if (totalBytes <= FILE_RETENTION_LIMIT_BYTES) {
      break;
    }

    const files = parseJSON<JobFileRecord[]>(row.files_json, []);
    const deletableFiles: JobFileRecord[] = [];
    const keptFiles: JobFileRecord[] = [];

    for (const file of files) {
      const key = resolveR2BucketKey(file, env);
      if (!key) {
        keptFiles.push(file);
        continue;
      }
      const stat = bucketStats.get(key);
      if (stat && stat.refs <= 1) {
        deletableFiles.push(file);
        if (resolveS3BucketKey(file, env)) {
          keptFiles.push({
            ...file,
            bucket_key: resolveS3BucketKey(file, env) ? "" : file.bucket_key,
            r2_bucket_key: "",
          });
        }
      } else {
        keptFiles.push(file);
      }
    }

    if (deletableFiles.length === 0) {
      continue;
    }

    const keys = deletableFiles
      .map((file) => resolveR2BucketKey(file, env))
      .filter((key) => key.length > 0);

    if (keys.length > 0) {
      await deleteR2Objects(env, keys);
      deletedFiles += keys.length;
    }

    let releasedBytes = 0;
    for (const file of deletableFiles) {
      const key = resolveR2BucketKey(file, env);
      if (!key) {
        continue;
      }
      const stat = bucketStats.get(key);
      if (stat) {
        releasedBytes += stat.size;
        bucketStats.delete(key);
      }
    }

    const nextErrors = Array.from(new Set([
      ...parseJSON<string[]>(row.errors_json, []),
      `older R2 files were deleted because total R2 usage exceeded 2 GB`,
    ]));

    await env.DB
      .prepare(
        `UPDATE jobs
         SET files_json = ?2,
             errors_json = ?3,
             updated_at = ?4
         WHERE id = ?1`,
      )
      .bind(row.id, JSON.stringify(keptFiles), JSON.stringify(nextErrors), nowISO())
      .run();

    cleanedJobs++;
    totalBytes = Math.max(0, totalBytes - releasedBytes);
  }

  return {
    jobs: cleanedJobs,
    files: deletedFiles,
  };
}

async function createJob(env: Env, ownerUserID: string, payload: CreateJobPayload): Promise<JobRecord> {
  const urls = normalizeURLs(payload.url, payload.urls);
  if (urls.length === 0) {
    throw new Error("at least one url is required");
  }

  const legalState = await getUserLegalState(env, ownerUserID);
  if (!legalState.accepted) {
    throw new Error("legal disclaimer must be accepted before creating jobs");
  }

  const cookieState = await getUserCookieState(env, ownerUserID);
  if (!cookieState.cookiesReady) {
    throw new Error("cookies are missing or invalid");
  }

  const threadInput = toNumber(payload.thread) || DEFAULT_THREAD;
  const thread = clampThread(threadInput);
  const createVideoList = payload.create_video_list !== false;
  const outputSubdir = (payload.output_subdir || "").trim();
  const createdAt = nowISO();
  const jobID = nextJobID();

  await env.DB
    .prepare(
      `INSERT INTO jobs (
         id, owner_user_id, status, stage, urls_json, thread, output_subdir, create_video_list,
         current_title, completed_parts, total_parts, progress_percent, titles_json,
         errors_json, files_json, runner_run_id, created_at, updated_at, started_at, finished_at
       ) VALUES (?1, ?2, 'queued', 'waiting_runner', ?3, ?4, ?5, ?6, '', 0, 0, 0, '[]', '[]', '[]', '', ?7, ?7, NULL, NULL)`,
    )
    .bind(
      jobID,
      ownerUserID,
      JSON.stringify(urls),
      thread,
      outputSubdir,
      createVideoList ? 1 : 0,
      createdAt,
    )
    .run();

  await insertEvent(env, jobID, "info", "任务已创建，正在触发 GitHub Actions 远程下载器。");

  try {
    await triggerGitHubRunner(env, jobID);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed to trigger GitHub Actions";
    await completeJob(env, jobID, {
      status: "failed",
      stage: "failed",
      errors: [message],
      message,
    });
    throw new Error(message);
  }

  return (await getJob(env, jobID, ownerUserID)) as JobRecord;
}

async function triggerGitHubRunner(env: Env, jobID: string): Promise<void> {
  if (!env.GITHUB_REPOSITORY || !env.GITHUB_ACTIONS_TOKEN) {
    throw new Error("GitHub Actions dispatch is not configured");
  }

  const workflowFile = env.GITHUB_WORKFLOW_FILE || DEFAULT_WORKFLOW_FILE;
  await dispatchGitHubWorkflow(env, workflowFile, { job_id: jobID });
}

async function dispatchGitHubWorkflow(
  env: Env,
  workflowFile: string,
  inputs?: Record<string, string>,
): Promise<void> {
  if (!env.GITHUB_REPOSITORY || !env.GITHUB_ACTIONS_TOKEN) {
    throw new Error("GitHub Actions dispatch is not configured");
  }

  const ref = env.GITHUB_REF || "main";
  const response = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPOSITORY}/actions/workflows/${workflowFile}/dispatches`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/vnd.github+json",
        authorization: `Bearer ${env.GITHUB_ACTIONS_TOKEN}`,
        "user-agent": "GoDingtalk-Control-Plane",
      },
      body: JSON.stringify({
        ref,
        inputs: inputs || {},
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`workflow dispatch failed (${response.status}): ${body.slice(0, 220)}`);
  }
}

async function triggerGitHubLogin(env: Env, loginSessionID: string, userID: string): Promise<{
  ref: string;
  workflow_file: string;
  workflow_url: string;
  runs_url: string;
}> {
  if (!env.GITHUB_REPOSITORY || !env.GITHUB_ACTIONS_TOKEN) {
    throw new Error("GitHub Actions dispatch is not configured");
  }

  const workflowFile = env.GITHUB_LOGIN_WORKFLOW_FILE || DEFAULT_LOGIN_WORKFLOW_FILE;
  const ref = env.GITHUB_REF || "main";
  await dispatchGitHubWorkflow(env, workflowFile, {
    login_session_id: loginSessionID,
    owner_user_id: userID,
  });

  return {
    ref,
    workflow_file: workflowFile,
    workflow_url: githubWorkflowURL(env.GITHUB_REPOSITORY, workflowFile),
    runs_url: githubRunHistoryURL(env.GITHUB_REPOSITORY, workflowFile),
  };
}

function withSetCookie(response: Response, cookie: string): Response {
  const headers = new Headers(response.headers);
  headers.append("Set-Cookie", cookie);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function handleAuthMe(request: Request, env: Env): Promise<Response> {
  await ensureBootstrapUser(env);
  const legalConfig = await getLegalConfig(env);
  const user = await getAuthUser(request, env);
  const usersCount = await listUsersCount(env);
  const isRegistrationOpen = registrationOpen(env, usersCount);
  const workflowRepository = env.GITHUB_REPOSITORY || "";
  const workflowFile = env.GITHUB_WORKFLOW_FILE || DEFAULT_WORKFLOW_FILE;
  const loginWorkflowFile = env.GITHUB_LOGIN_WORKFLOW_FILE || DEFAULT_LOGIN_WORKFLOW_FILE;
  const workflowRef = env.GITHUB_REF || "main";
  if (!user) {
    return jsonResponse({
      authenticated: false,
      registration_open: isRegistrationOpen,
      legal_version: legalConfig.version,
      legal_accepted: false,
      legal_accepted_at: null,
      workflow_repository: workflowRepository,
      workflow_file: workflowFile,
      workflow_url: workflowRepository ? githubWorkflowURL(workflowRepository, workflowFile) : "",
      login_workflow_file: loginWorkflowFile,
      login_workflow_url: workflowRepository ? githubWorkflowURL(workflowRepository, loginWorkflowFile) : "",
      login_runs_url: workflowRepository ? githubRunHistoryURL(workflowRepository, loginWorkflowFile) : "",
      workflow_ref: workflowRef,
    });
  }

  const cookieState = await getUserCookieState(env, user.id);
  const legalState = await getUserLegalState(env, user.id);
  return jsonResponse({
    authenticated: true,
    registration_open: isRegistrationOpen,
    user,
    cookies_ready: cookieState.cookiesReady,
    cookies_updated_at: cookieState.cookiesUpdatedAt,
    legal_version: legalState.version,
    legal_accepted: legalState.accepted,
    legal_accepted_at: legalState.acceptedAt,
    workflow_repository: workflowRepository,
    workflow_file: workflowFile,
    workflow_url: workflowRepository ? githubWorkflowURL(workflowRepository, workflowFile) : "",
    login_workflow_file: loginWorkflowFile,
    login_workflow_url: workflowRepository ? githubWorkflowURL(workflowRepository, loginWorkflowFile) : "",
    login_runs_url: workflowRepository ? githubRunHistoryURL(workflowRepository, loginWorkflowFile) : "",
    workflow_ref: workflowRef,
  });
}

async function handleAuthRegister(request: Request, env: Env): Promise<Response> {
  const payload = (await request.json()) as AuthPayload;
  const username = (payload.username || "").trim();
  const password = (payload.password || "").trim();
  if (username.length < 3 || password.length < 6) {
    return jsonResponse({ error: "username >= 3 and password >= 6 are required" }, { status: 400 });
  }

  const usersCount = await listUsersCount(env);
  if (!registrationOpen(env, usersCount)) {
    return jsonResponse({ error: "registration is closed" }, { status: 403 });
  }

  const existing = await getUserByUsername(env, username);
  if (existing) {
    return jsonResponse({ error: "username already exists" }, { status: 409 });
  }

  const user = await createUser(env, username, password);
  const token = await createSession(env, user.id);
  const response = jsonResponse({ ok: true, user });
  return withSetCookie(response, sessionCookie(token, SESSION_TTL_SECONDS));
}

async function handleAuthLogin(request: Request, env: Env): Promise<Response> {
  await ensureBootstrapUser(env);

  const payload = (await request.json()) as AuthPayload;
  const username = (payload.username || "").trim();
  const password = (payload.password || "").trim();
  if (!username || !password) {
    return jsonResponse({ error: "username and password are required" }, { status: 400 });
  }

  const user = await getUserByUsername(env, username);
  if (!user) {
    return jsonResponse({ error: "invalid username or password" }, { status: 401 });
  }

  const expected = await passwordHash(env, user.username, password);
  if (expected !== user.password_hash) {
    return jsonResponse({ error: "invalid username or password" }, { status: 401 });
  }

  const token = await createSession(env, user.id);
  const response = jsonResponse({
    ok: true,
    user: {
      id: user.id,
      username: user.username,
      is_sudo: toNumber(user.is_sudo) === 1,
    },
  });
  return withSetCookie(response, sessionCookie(token, SESSION_TTL_SECONDS));
}

async function handleAuthLogout(request: Request, env: Env): Promise<Response> {
  await dropSession(request, env);
  const response = jsonResponse({ ok: true });
  return withSetCookie(response, clearSessionCookie());
}

async function handleAuthPassword(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, { status: 405 });
  }

  const payload = (await request.json()) as AuthPasswordPayload;
  const currentPassword = (payload.current_password || "").trim();
  const newPassword = (payload.new_password || "").trim();
  if (!currentPassword || !newPassword) {
    return jsonResponse({ error: "current_password and new_password are required" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return jsonResponse({ error: "new password must be at least 6 characters" }, { status: 400 });
  }

  const userRow = await getUserByUsername(env, user.username);
  if (!userRow) {
    return jsonResponse({ error: "user not found" }, { status: 404 });
  }

  const expected = await passwordHash(env, userRow.username, currentPassword);
  if (expected !== userRow.password_hash) {
    return jsonResponse({ error: "current password is incorrect" }, { status: 401 });
  }

  const nextHash = await passwordHash(env, userRow.username, newPassword);
  await updateUserPassword(env, user.id, nextHash);
  return jsonResponse({ ok: true, message: "password updated" });
}

async function handleLegal(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method === "GET") {
    const [legalState, legalConfig] = await Promise.all([
      getUserLegalState(env, user.id),
      getLegalConfig(env),
    ]);
    return jsonResponse({
      version: legalState.version,
      accepted: legalState.accepted,
      accepted_at: legalState.acceptedAt,
      text: legalConfig.text,
    });
  }

  if (request.method === "POST") {
    const legalState = await acceptLegalTerms(env, user.id);
    return jsonResponse({
      ok: true,
      version: legalState.version,
      accepted: legalState.accepted,
      accepted_at: legalState.acceptedAt,
    });
  }

  return jsonResponse({ error: "method not allowed" }, { status: 405 });
}

async function handleAdminUsers(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ error: "method not allowed" }, { status: 405 });
  }
  const sudoError = requireSudo(user);
  if (sudoError) {
    return sudoError;
  }
  return jsonResponse({
    users: await listAdminUsers(env),
  });
}

async function handleAdminLegal(request: Request, env: Env, user: AuthUser): Promise<Response> {
  const sudoError = requireSudo(user);
  if (sudoError) {
    return sudoError;
  }

  if (request.method === "GET") {
    return jsonResponse(await getAdminLegalConfig(env));
  }

  if (request.method === "POST") {
    const payload = (await request.json()) as AdminLegalPayload;
    try {
      const result = await updateAdminLegalConfig(env, payload.text || "");
      return jsonResponse({
        ok: true,
        message: "legal disclaimer updated; all users must accept the new version again",
        ...result,
      });
    } catch (error) {
      return jsonResponse({ error: error instanceof Error ? error.message : "failed to update legal config" }, { status: 400 });
    }
  }

  return jsonResponse({ error: "method not allowed" }, { status: 405 });
}

async function handleAdminStorage(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method !== "GET") {
    return jsonResponse({ error: "method not allowed" }, { status: 405 });
  }

  const sudoError = requireSudo(user);
  if (sudoError) {
    return sudoError;
  }

  const url = new URL(request.url);
  const payload = await listAdminStorage(env, {
    cursor: url.searchParams.get("cursor") || "",
    prefix: url.searchParams.get("prefix") || "",
    limit: toNumber(url.searchParams.get("limit") || 50) || 50,
  });

  return jsonResponse({
    prefix: (url.searchParams.get("prefix") || "").trim(),
    ...payload,
  });
}

async function handleAdminStorageFile(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return jsonResponse({ error: "method not allowed" }, { status: 405 });
  }

  const sudoError = requireSudo(user);
  if (sudoError) {
    return sudoError;
  }

  const url = new URL(request.url);
  const key = (url.searchParams.get("key") || "").trim();
  if (!key) {
    return jsonResponse({ error: "key is required" }, { status: 400 });
  }

  const object = await env.FILES.get(key);
  if (!object) {
    return jsonResponse({ error: "object not found in r2" }, { status: 404 });
  }

  const downloadName = (url.searchParams.get("name") || key.split("/").pop() || "download.bin").trim();
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "private, max-age=120");
  headers.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(downloadName)}`);
  if (!headers.get("content-type")) {
    headers.set("content-type", "application/octet-stream");
  }

  return new Response(request.method === "HEAD" ? null : object.body, { headers });
}

async function handleStatus(env: Env, user: AuthUser): Promise<Response> {
  const [countsRow, cookieState, legalState] = await Promise.all([
    env.DB
      .prepare(
        `SELECT
           COUNT(*) AS total_jobs,
           SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) AS queued_jobs,
           SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) AS running_jobs,
           SUM(CASE WHEN status = 'succeeded' THEN 1 ELSE 0 END) AS succeeded_jobs,
           SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) AS failed_jobs
         FROM jobs
         WHERE owner_user_id = ?1`,
      )
      .bind(user.id)
      .first<Record<string, number | string | null>>(),
    getUserCookieState(env, user.id),
    getUserLegalState(env, user.id),
  ]);

  const workflowRepository = env.GITHUB_REPOSITORY || "";
  const workflowFile = env.GITHUB_WORKFLOW_FILE || DEFAULT_WORKFLOW_FILE;
  const loginWorkflowFile = env.GITHUB_LOGIN_WORKFLOW_FILE || DEFAULT_LOGIN_WORKFLOW_FILE;
  const workflowRef = env.GITHUB_REF || "main";

  return jsonResponse({
    mode: "private-control-plane",
    user,
    cookies_ready: cookieState.cookiesReady,
    cookies_updated_at: cookieState.cookiesUpdatedAt,
    legal_version: legalState.version,
    legal_accepted: legalState.accepted,
    legal_accepted_at: legalState.acceptedAt,
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
    public_downloads: false,
    default_thread: DEFAULT_THREAD,
  });
}

async function handleLoginWorkflow(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method === "GET") {
    const url = new URL(request.url);
    const loginSessionID = (url.searchParams.get("id") || "").trim();
    const loginSession = loginSessionID
      ? await getLoginSession(env, loginSessionID, user.id)
      : await getLatestLoginSession(env, user.id);

    return jsonResponse({
      ok: true,
      login_session: loginSession,
    });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, { status: 405 });
  }

  const legalState = await getUserLegalState(env, user.id);
  if (!legalState.accepted) {
    return jsonResponse({ error: "legal disclaimer must be accepted before starting QR login" }, { status: 403 });
  }

  const loginSession = await createLoginSession(env, user.id);

  try {
    const payload = await triggerGitHubLogin(env, loginSession.id, user.id);
    return jsonResponse({
      ok: true,
      message: "已启动远程登录，请等待二维码。",
      login_session: loginSession,
      ...payload,
    });
  } catch (error) {
    await completeLoginSession(env, loginSession.id, {
      error: error instanceof Error ? error.message : "failed to start login workflow",
    });
    throw error;
  }
}

async function handleInternalLoginSessionQR(request: Request, env: Env, loginSessionID: string): Promise<Response> {
  const authError = await requireInternalAuth(request, env);
  if (authError) {
    return authError;
  }

  const payload = (await request.json()) as LoginSessionQRPayload;
  const qrURL = (payload.qr_url || "").trim();
  if (!qrURL) {
    return jsonResponse({ error: "qr_url is required" }, { status: 400 });
  }

  const session = await updateLoginSessionQR(env, loginSessionID, qrURL);
  if (!session) {
    return jsonResponse({ error: "login session not found" }, { status: 404 });
  }

  return jsonResponse({
    ok: true,
    login_session: session,
  });
}

async function handleInternalLoginSessionComplete(request: Request, env: Env, loginSessionID: string): Promise<Response> {
  const authError = await requireInternalAuth(request, env);
  if (authError) {
    return authError;
  }

  const payload = (await request.json()) as LoginSessionCompletePayload;
  const session = await completeLoginSession(env, loginSessionID, payload);
  if (!session) {
    return jsonResponse({ error: "login session not found" }, { status: 404 });
  }

  return jsonResponse({
    ok: true,
    login_session: session,
  });
}

async function handleCookies(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method not allowed" }, { status: 405 });
  }
  void request;
  void env;
  void user;
  return jsonResponse({ error: "manual cookie upload disabled; use QR login" }, { status: 403 });
}

async function handleJobs(request: Request, env: Env, user: AuthUser): Promise<Response> {
  if (request.method === "GET") {
    const url = new URL(request.url);
    return jsonResponse(
      await listJobsPage(
        env,
        user.id,
        normalizePageNumber(url.searchParams.get("page")),
        normalizeJobsPageSize(url.searchParams.get("page_size")),
      ),
    );
  }
  if (request.method === "POST") {
    try {
      const payload = (await request.json()) as CreateJobPayload;
      const job = await createJob(env, user.id, payload);
      return jsonResponse(job, { status: 202 });
    } catch (error) {
      return jsonResponse(
        { error: error instanceof Error ? error.message : "failed to create job" },
        { status: 400 },
      );
    }
  }
  return jsonResponse({ error: "method not allowed" }, { status: 405 });
}

async function handleJobDetail(request: Request, env: Env, user: AuthUser, jobID: string): Promise<Response> {
  const job = await getJob(env, jobID, user.id);
  if (!job) {
    return jsonResponse({ error: "job not found" }, { status: 404 });
  }

  const includeEvents = new URL(request.url).searchParams.get("include") === "events";
  if (!includeEvents) {
    return jsonResponse(job);
  }
  return jsonResponse({
    job,
    events: await listJobEvents(env, jobID),
  });
}

async function handleFileDownload(request: Request, env: Env, user: AuthUser): Promise<Response> {
  const url = new URL(request.url);
  const jobID = url.searchParams.get("job_id") || "";
  const relativePath = url.searchParams.get("path") || "";
  const storage = (url.searchParams.get("storage") || "").trim().toLowerCase();
  if (!jobID || !relativePath) {
    return jsonResponse({ error: "job_id and path are required" }, { status: 400 });
  }

  const job = await getJob(env, jobID, user.id);
  if (!job) {
    return jsonResponse({ error: "job not found" }, { status: 404 });
  }

  const file = job.files.find((entry) => entry.relative_path === relativePath || entry.name === relativePath);
  if (!file) {
    return jsonResponse({ error: "file not found" }, { status: 404 });
  }

  const r2BucketKey = (file.r2_bucket_key || "").trim();
  const s3BucketKey = (file.s3_bucket_key || "").trim();
  if (!r2BucketKey && !s3BucketKey && !file.bucket_key) {
    return jsonResponse({ error: "file is missing storage metadata" }, { status: 404 });
  }

  if (storage === "r2" || (!storage && r2BucketKey)) {
    if (!r2BucketKey) {
      return jsonResponse({ error: "object not uploaded to r2 yet" }, { status: 404 });
    }
    const object = await env.FILES.get(r2BucketKey);
    if (!object) {
      return jsonResponse({ error: "object not found in r2" }, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", "private, max-age=120");
    headers.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`);
    if (!headers.get("content-type")) {
      headers.set("content-type", file.content_type || "application/octet-stream");
    }
    return new Response(object.body, { headers });
  }

  const s3Key = s3BucketKey || (storageUsesS3(env) ? (file.bucket_key || "").trim() : "");
  if (!s3Key) {
    return jsonResponse({ error: "object not uploaded to s3 yet" }, { status: 404 });
  }
  if (!storageUsesS3(env)) {
    return jsonResponse({ error: "s3 storage is not configured" }, { status: 404 });
  }

  const response = await signedS3Request(env, "GET", s3Key);
  if (response.status === 404) {
    return jsonResponse({ error: "object not found in s3" }, { status: 404 });
  }
  if (!response.ok || !response.body) {
    return jsonResponse({ error: "failed to fetch object from s3" }, { status: 502 });
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  } else {
    headers.set("content-type", file.content_type || "application/octet-stream");
  }
  const etag = response.headers.get("etag");
  if (etag) {
    headers.set("etag", etag);
  }
  headers.set("cache-control", "private, max-age=120");
  headers.set("content-disposition", `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`);
  return new Response(response.body, { headers });
}

async function handleInternalClaim(request: Request, env: Env, jobID: string): Promise<Response> {
  const authError = await requireInternalAuth(request, env);
  if (authError) {
    return authError;
  }

  const row = await env.DB
    .prepare("SELECT owner_user_id, status FROM jobs WHERE id = ?1")
    .bind(jobID)
    .first<{ owner_user_id: string; status: string }>();

  if (!row) {
    return jsonResponse({ error: "job not found" }, { status: 404 });
  }
  if (row.status === "running") {
    return jsonResponse({ error: "job is already running" }, { status: 409 });
  }
  if (row.status === "succeeded" || row.status === "failed") {
    return jsonResponse({ error: "job already finished" }, { status: 409 });
  }
  if (!row.owner_user_id) {
    return jsonResponse({ error: "job owner is missing" }, { status: 409 });
  }

  const cookieState = await getUserCookieState(env, row.owner_user_id);
  if (!cookieState.cookiesReady) {
    return jsonResponse({ error: "cookies are missing or invalid" }, { status: 409 });
  }

  const job = await getJob(env, jobID);
  if (!job) {
    return jsonResponse({ error: "job not found" }, { status: 404 });
  }

  await env.DB
    .prepare(
      `UPDATE jobs
       SET status = 'running',
           stage = 'preparing',
           runner_run_id = ?2,
           started_at = COALESCE(started_at, ?3),
           updated_at = ?3
       WHERE id = ?1`,
    )
    .bind(
      jobID,
      request.headers.get("X-GitHub-Run-ID") || "",
      nowISO(),
    )
    .run();

  await insertEvent(env, jobID, "info", "GitHub Actions 运行器已领取任务。");

  return jsonResponse({
    id: job.id,
    urls: job.urls,
    thread: job.thread,
    output_subdir: job.output_subdir,
    create_video_list: job.create_video_list,
    cookies: cookieState.cookies,
  });
}

async function handleInternalProgress(request: Request, env: Env, jobID: string): Promise<Response> {
  const authError = await requireInternalAuth(request, env);
  if (authError) {
    return authError;
  }

  const payload = (await request.json()) as ProgressPayload;
  try {
    await updateJobProgress(env, jobID, payload);
    return jsonResponse({ ok: true });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "failed to update job" },
      { status: 404 },
    );
  }
}

async function handleInternalComplete(request: Request, env: Env, jobID: string): Promise<Response> {
  const authError = await requireInternalAuth(request, env);
  if (authError) {
    return authError;
  }

  const payload = (await request.json()) as CompletePayload;
  const job = await completeJob(env, jobID, payload);
  if (!job) {
    return jsonResponse({ error: "job not found" }, { status: 404 });
  }
  return jsonResponse(job);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return applyCors(request, new Response(null, { status: 204 }), env);
    }

    const url = new URL(request.url);

    try {
      let response: Response;

      if (
        url.pathname === "/"
        || url.pathname === "/overview"
        || url.pathname === "/download"
        || url.pathname === "/jobs"
        || url.pathname === "/scan"
        || url.pathname === "/admin"
        || url.pathname === "/login"
        || url.pathname === "/settings"
        || url.pathname === "/legal"
        || url.pathname === "/account"
      ) {
        const authUser = await getAuthUser(request, env);

        if (url.pathname === "/") {
          if (!authUser) {
            response = redirectResponse(`${url.origin}/login`);
          } else {
            const [legalState, cookieState] = await Promise.all([
              getUserLegalState(env, authUser.id),
              getUserCookieState(env, authUser.id),
            ]);
            if (!legalState.accepted) {
              response = redirectResponse(`${url.origin}/legal`);
            } else if (!cookieState.cookiesReady) {
              response = redirectResponse(`${url.origin}/scan`);
            } else {
              response = redirectResponse(`${url.origin}/overview`);
            }
          }
        } else if (!authUser) {
          response = url.pathname === "/login"
            ? htmlResponse(renderApp(url.origin, "login"))
            : redirectResponse(`${url.origin}/login`);
        } else if (url.pathname === "/login") {
          response = redirectResponse(`${url.origin}/`);
        } else if (url.pathname === "/account") {
          response = htmlResponse(renderApp(url.origin, "account"));
        } else if (url.pathname === "/admin") {
          if (!authUser.is_sudo) {
            response = redirectResponse(`${url.origin}/overview`);
          } else {
            response = htmlResponse(renderApp(url.origin, "admin"));
          }
        } else if (url.pathname === "/jobs") {
          response = htmlResponse(renderApp(url.origin, "jobs"));
        } else if (url.pathname === "/legal") {
          const [legalState, cookieState] = await Promise.all([
            getUserLegalState(env, authUser.id),
            getUserCookieState(env, authUser.id),
          ]);
          response = legalState.accepted
            ? redirectResponse(`${url.origin}${cookieState.cookiesReady ? "/overview" : "/scan"}`)
            : htmlResponse(renderApp(url.origin, "legal"));
        } else if (url.pathname === "/scan" || url.pathname === "/settings") {
          response = htmlResponse(renderApp(url.origin, "scan"));
        } else if (url.pathname === "/download" || url.pathname === "/overview") {
          response = htmlResponse(renderApp(url.origin, "overview"));
        } else {
          response = jsonResponse({ error: "not found" }, { status: 404 });
        }
      } else if (url.pathname === "/api/auth/me" && request.method === "GET") {
        response = await handleAuthMe(request, env);
      } else if (url.pathname === "/api/auth/register" && request.method === "POST") {
        response = await handleAuthRegister(request, env);
      } else if (url.pathname === "/api/auth/login" && request.method === "POST") {
        response = await handleAuthLogin(request, env);
      } else if (url.pathname === "/api/auth/logout" && request.method === "POST") {
        response = await handleAuthLogout(request, env);
      } else if (url.pathname === "/api/auth/password") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleAuthPassword(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/status" && request.method === "GET") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleStatus(env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/cookies") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleCookies(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/login-workflow" && (request.method === "GET" || request.method === "POST")) {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleLoginWorkflow(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/legal" && (request.method === "GET" || request.method === "POST")) {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleLegal(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/admin/users") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleAdminUsers(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/admin/legal") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleAdminLegal(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/admin/storage") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleAdminStorage(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/admin/storage/file" && (request.method === "GET" || request.method === "HEAD")) {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleAdminStorageFile(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname === "/api/legal-config" && request.method === "GET") {
        response = jsonResponse(await getLegalConfig(env));
      } else if (url.pathname === "/api/jobs") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleJobs(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname.startsWith("/api/jobs/") && request.method === "GET") {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleJobDetail(request, env, auth.user as AuthUser, url.pathname.replace("/api/jobs/", ""));
        }
      } else if (url.pathname === "/api/files" && (request.method === "GET" || request.method === "HEAD")) {
        const auth = await requireUserAuth(request, env);
        if (auth.response) {
          response = auth.response;
        } else {
          response = await handleFileDownload(request, env, auth.user as AuthUser);
        }
      } else if (url.pathname.startsWith("/internal/jobs/")) {
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length === 4 && parts[0] === "internal" && parts[1] === "jobs") {
          const jobID = parts[2];
          const action = parts[3];
          if (action === "claim" && request.method === "GET") {
            response = await handleInternalClaim(request, env, jobID);
          } else if (action === "progress" && request.method === "POST") {
            response = await handleInternalProgress(request, env, jobID);
          } else if (action === "complete" && request.method === "POST") {
            response = await handleInternalComplete(request, env, jobID);
          } else {
            response = jsonResponse({ error: "method not allowed" }, { status: 405 });
          }
        } else {
          response = jsonResponse({ error: "not found" }, { status: 404 });
        }
      } else if (url.pathname.startsWith("/internal/login-sessions/")) {
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length === 4 && parts[0] === "internal" && parts[1] === "login-sessions") {
          const loginSessionID = parts[2];
          const action = parts[3];
          if (action === "qr" && request.method === "POST") {
            response = await handleInternalLoginSessionQR(request, env, loginSessionID);
          } else if (action === "complete" && request.method === "POST") {
            response = await handleInternalLoginSessionComplete(request, env, loginSessionID);
          } else {
            response = jsonResponse({ error: "method not allowed" }, { status: 405 });
          }
        } else {
          response = jsonResponse({ error: "not found" }, { status: 404 });
        }
      } else {
        response = jsonResponse({ error: "not found" }, { status: 404 });
      }

      return applyCors(request, response, env);
    } catch (error) {
      const message = error instanceof Error ? error.message : "internal error";
      return applyCors(request, jsonResponse({ error: message }, { status: 500 }), env);
    }
  },
  async scheduled(_controller: unknown, env: Env): Promise<void> {
    await cleanupExpiredFiles(env);
  },
};
