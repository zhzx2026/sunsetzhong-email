import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { dt, dingtalkEnabled, requireDingtalkEnabled } from "./dingtalk";
import { DINGTALK_PAGE } from "./dingtalk-page";

interface Env {
  DB: D1Database; ASSETS?: { fetch: (req: Request) => Promise<Response> };
  RESEND_KEY?: string; SENDER_DOMAIN?: string; AUTH_SALT?: string;
  BOOTSTRAP_USERNAME?: string; BOOTSTRAP_PASSWORD?: string;
  INTERNAL_API_TOKEN?: string; GITHUB_ACTIONS_TOKEN?: string;
  GITHUB_REPOSITORY?: string; GITHUB_WORKFLOW_FILE?: string;
  GITHUB_LOGIN_WORKFLOW_FILE?: string; GITHUB_REF?: string;
}
interface AuthUser { id: string; username: string; role: string; isSudo: boolean; }

// ── Crypto ──
function toHex(buf: ArrayBuffer) { return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join(""); }
async function sha256Hex(i: string) { return toHex(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(i))); }
function randomToken(b=32) { const a=new Uint8Array(b); crypto.getRandomValues(a); let s=""; for(const x of a)s+=String.fromCharCode(x); return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""); }
function nowIso() { return new Date().toISOString(); }
const SESSION = "em_session";
const USER_RE = /^[A-Za-z0-9_.-]{3,32}$/;
const MIN_PW = 4;

// ── MIME ──
function qpDecode(s: string) { const b: number[]=[]; let i=0; while(i<s.length){ if(s[i]==="="&&i+1<s.length&&s[i+1]==="\n"){i+=2;continue} if(s[i]==="="&&i+2<s.length&&s[i+1]==="\r"&&s[i+2]==="\n"){i+=3;continue} if(s[i]==="="&&i+2<s.length&&/^[0-9A-Fa-f]{2}$/.test(s.slice(i+1,i+3))){b.push(parseInt(s.slice(i+1,i+3),16));i+=3}else{b.push(s.charCodeAt(i));i++}} return new TextDecoder("utf-8").decode(new Uint8Array(b)); }
function parseMime(raw: string): {text:string;html:string} { let text="",html=""; const m=raw.match(/^Content-Type:\s*multipart\/[^;]*;\s*boundary="?([^";\r\n]+)"?/im); if(!m){const h=raw.indexOf("\r\n\r\n");return{text:h>=0?raw.slice(h+4).trim():raw,html:""}} const p=splitParts(raw,m[1]); for(const pt of p){const he=pt.indexOf("\r\n\r\n");if(he<0)continue;const hdr=pt.slice(0,he),body=pt.slice(he+4);const ct=(hdr.match(/Content-Type:\s*([^\r\n;]+)/i)?.[1]||"").toLowerCase();const enc=(hdr.match(/Content-Transfer-Encoding:\s*([^\r\n]+)/i)?.[1]||"").toLowerCase();let dec=body;if(enc.includes("quoted-printable"))dec=qpDecode(body);else if(enc.includes("base64")){try{const bin=atob(body.replace(/\s/g,""));const b8=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)b8[j]=bin.charCodeAt(j);dec=new TextDecoder("utf-8").decode(b8)}catch{}} if(ct.includes("multipart/")){const n=parseMime(pt);if(n.text&&!text)text=n.text.trim();if(n.html&&!html)html=n.html.trim()}else if(ct.includes("text/plain")&&!text)text=dec.trim();else if(ct.includes("text/html")&&!html)html=dec.trim()} if(!text&&!html){const he=raw.indexOf("\r\n\r\n");text=he>=0?raw.slice(he+4).trim():raw} return{text,html}; }
function splitParts(raw:string,b:string):string[]{const r:string[]=[],mk=`--${b}`,end=`--${b}--`;let s=raw.indexOf(mk);while(s>=0){s+=mk.length;if(raw[s]==="\r")s++;if(raw[s]==="\n")s++;const n=raw.indexOf(mk,s),e=n>=0?n:raw.length;const p=raw.slice(s,e).trim();if(p&&!p.startsWith("--"))r.push(p);if(n>=0&&raw.slice(n,n+end.length)===end)break;s=n}return r}

// ── Hono ──
const app = new Hono<{Bindings:Env;Variables:{user:AuthUser|null}}>();
app.use("*", cors({origin:"*",allowMethods:["GET","POST","PUT","DELETE","OPTIONS"],allowHeaders:["Content-Type"],credentials:true}));
app.use("*", async(c,next)=>{ const t=getCookie(c,SESSION)||""; if(t){const h=await sha256Hex((c.env.AUTH_SALT||"em-salt")+":session:"+t);const r=await c.env.DB.prepare("SELECT u.id,u.username,u.role,u.is_sudo FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?1 AND s.expires_at>?2 LIMIT 1").bind(h,nowIso()).first<AuthUser&{is_sudo:number}>();const au=r?{id:r.id,username:r.username,role:r.role,isSudo:r.is_sudo===1||r.role==="admin"}:null;c.set("user",au)}else{const ah=c.req.header("authorization")||"";const m=ah.match(/^Bearer\s+(.+)$/i);if(m){const h=await sha256Hex((c.env.AUTH_SALT||"em-salt")+":device:"+m[1].trim());const r=await c.env.DB.prepare("SELECT u.id,u.username,u.role,u.is_sudo FROM device_tokens d JOIN users u ON u.id=d.user_id WHERE d.token_hash=?1 LIMIT 1").bind(h).first<AuthUser&{is_sudo:number}>();c.set("user",r?{id:r.id,username:r.username,role:r.role,isSudo:r.is_sudo===1||r.role==="admin"}:null)}else c.set("user",null)} await next() });

async function auth(c:any):Promise<AuthUser>{ const u=c.get("user"); if(!u) throw new HTTPException(401,{message:"unauthorized"}); return u; }

// ── Auth ──
app.post("/api/auth/register", async(c)=>{
  const b=await c.req.json() as any; const un=(b.username||"").trim(),pw=(b.password||"").trim();
  if(!USER_RE.test(un)) return c.json({ok:false,error:"用户名 3-32 位字母/数字/._-"},400);
  if(pw.length<MIN_PW||pw.length>128) return c.json({ok:false,error:"密码 4-128 位"},400);
  const n=un.toLowerCase(); if(await c.env.DB.prepare("SELECT id FROM users WHERE username_norm=?1").bind(n).first()) return c.json({ok:false,error:"用户名已存在"},409);
  const id=crypto.randomUUID(),salt=randomToken(16),hash=await sha256Hex(salt+":"+pw);
  const cnt=(await c.env.DB.prepare("SELECT COUNT(*) as c FROM users").first<{c:number}>())?.c||0;
  const role=cnt===0?"admin":"user",now=nowIso();
  await c.env.DB.prepare("INSERT INTO users(id,username,username_norm,password_salt,password_hash,role,created_at,updated_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?7)").bind(id,un,n,salt,hash,role,now).run();
  const token=randomToken(32),th=await sha256Hex((c.env.AUTH_SALT||"em-salt")+":session:"+token);
  const exp=new Date(Date.now()+30*86400*1000).toISOString();
  await c.env.DB.prepare("INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?1,?2,?3,?4)").bind(th,id,now,exp).run();
  setCookie(c,SESSION,token,{httpOnly:true,sameSite:"Lax",path:"/",maxAge:30*86400,secure:isSecure(c)});
  return c.json({ok:true,user:{id,username:un,role}});
});

app.post("/api/auth/login", async(c)=>{
  const b=await c.req.json() as any; const un=(b.username||"").trim(),pw=(b.password||"").trim(),n=un.toLowerCase();
  const u=await c.env.DB.prepare("SELECT * FROM users WHERE username_norm=?1").bind(n).first<{id:string;username:string;role:string;password_salt:string;password_hash:string}>();
  if(!u) return c.json({ok:false,error:"用户名或密码错误"},401);
  if(await sha256Hex(u.password_salt+":"+pw)!==u.password_hash) return c.json({ok:false,error:"用户名或密码错误"},401);
  const token=randomToken(32),th=await sha256Hex((c.env.AUTH_SALT||"em-salt")+":session:"+token);
  const exp=new Date(Date.now()+30*86400*1000).toISOString();
  await c.env.DB.prepare("INSERT INTO sessions(token_hash,user_id,created_at,expires_at) VALUES(?1,?2,?3,?4)").bind(th,u.id,nowIso(),exp).run();
  setCookie(c,SESSION,token,{httpOnly:true,sameSite:"Lax",path:"/",maxAge:30*86400,secure:isSecure(c)});
  return c.json({ok:true,user:{id:u.id,username:u.username,role:u.role}});
});

app.post("/api/auth/logout", async(c)=>{ const t=getCookie(c,SESSION)||""; if(t){const h=await sha256Hex((c.env.AUTH_SALT||"em-salt")+":session:"+t);await c.env.DB.prepare("DELETE FROM sessions WHERE token_hash=?1").bind(h).run()} deleteCookie(c,SESSION,{path:"/"}); return c.json({ok:true}); });
app.get("/api/auth/me", c=>c.json({ok:true,user:c.get("user")}));

app.post("/api/auth/password", async(c)=>{
  const u=await auth(c); const b=await c.req.json() as any;
  const oldPw=(b.old_password||"").trim(),newPw=(b.new_password||"").trim();
  if(newPw.length<MIN_PW||newPw.length>128) return c.json({ok:false,error:"新密码 4-128 位"},400);
  const row=await c.env.DB.prepare("SELECT password_salt,password_hash FROM users WHERE id=?1").bind(u.id).first<{password_salt:string;password_hash:string}>();
  if(!row) return c.json({ok:false,error:"用户不存在"},404);
  if(await sha256Hex(row.password_salt+":"+oldPw)!==row.password_hash) return c.json({ok:false,error:"当前密码错误"},401);
  const salt=randomToken(16),hash=await sha256Hex(salt+":"+newPw);
  await c.env.DB.prepare("UPDATE users SET password_salt=?1,password_hash=?2,updated_at=?3 WHERE id=?4").bind(salt,hash,nowIso(),u.id).run();
  return c.json({ok:true});
});

// ── Device token (for Android background service) ──
app.post("/api/auth/device-key", async(c)=>{
  const u=await auth(c);
  const token=randomToken(32),hash=await sha256Hex((c.env.AUTH_SALT||"em-salt")+":device:"+token);
  await c.env.DB.prepare("INSERT INTO device_tokens(token_hash,user_id,created_at) VALUES(?1,?2,?3)").bind(hash,u.id,nowIso()).run();
  return c.json({ok:true,token});
});
app.delete("/api/auth/device-key", async(c)=>{
  const u=await auth(c);
  const ah=c.req.header("authorization")||"";const m=ah.match(/^Bearer\s+(.+)$/i);
  if(m){const h=await sha256Hex((c.env.AUTH_SALT||"em-salt")+":device:"+m[1].trim());await c.env.DB.prepare("DELETE FROM device_tokens WHERE token_hash=?1 AND user_id=?2").bind(h,u.id).run()}
  return c.json({ok:true});
});

// ── Contacts (recent recipients) ──
app.get("/api/contacts", async(c)=>{
  const u=await auth(c);
  const rows=await c.env.DB.prepare("SELECT DISTINCT address FROM emails WHERE owner_id=?1 AND direction='outbound' ORDER BY created_at DESC LIMIT 30").bind(u.id).all();
  const contacts=(rows.results||[]).map((r:any)=>r.address).filter(Boolean);
  return c.json({ok:true,contacts});
});

// ── Temp Email Addresses ──
app.get("/api/addresses", async(c)=>{
  const u=await auth(c);
  const rows=await c.env.DB.prepare("SELECT * FROM addresses WHERE user_id=?1 ORDER BY created_at DESC").bind(u.id).all();
  return c.json({ok:true,items:rows.results||[]});
});

app.post("/api/addresses", async(c)=>{
  const u=await auth(c);
  // Check limit
  const setting=await c.env.DB.prepare("SELECT value FROM system_settings WHERE key='max_temp_addresses'").first<{value:string}>();
  const maxV=parseInt(setting?.value||"5");
  const count=(await c.env.DB.prepare("SELECT COUNT(*) as c FROM addresses WHERE user_id=?1").bind(u.id).first<{c:number}>())?.c||0;
  if(maxV>=0&&count>=maxV&&u.role!=="admin") return c.json({ok:false,error:`最多创建 ${maxV} 个临时地址`},400);

  const name=`tmp-${randomToken(4).toLowerCase()}`;
  const domain=c.env.SENDER_DOMAIN||"sunsetzhong.indevs.in";
  const full=`${name}@${domain}`;
  const id=crypto.randomUUID(),now=nowIso();
  await c.env.DB.prepare("INSERT INTO addresses(id,user_id,name,full_address,created_at) VALUES(?1,?2,?3,?4,?5)").bind(id,u.id,name,full,now).run();
  // Also add to user_addresses for inbound routing
  await c.env.DB.prepare("INSERT OR IGNORE INTO user_addresses(user_id,address,created_at) VALUES(?1,?2,?3)").bind(u.id,full.toLowerCase(),now).run();
  return c.json({ok:true,data:{id,name,full_address:full}},201);
});

app.delete("/api/addresses/:id", async(c)=>{
  const u=await auth(c);
  const addr=await c.env.DB.prepare("SELECT full_address FROM addresses WHERE id=?1 AND user_id=?2").bind(c.req.param("id"),u.id).first<{full_address:string}>();
  if(!addr) return c.json({ok:false,error:"地址不存在"},404);
  await c.env.DB.prepare("DELETE FROM addresses WHERE id=?1").bind(c.req.param("id")).run();
  await c.env.DB.prepare("DELETE FROM user_addresses WHERE address=?1 AND user_id=?2").bind(addr.full_address.toLowerCase(),u.id).run();
  return c.json({ok:true});
});

// ── Public Settings (non-sensitive) ──
app.get("/api/settings/public", async(c) => {
  const rows = await c.env.DB.prepare("SELECT key,value FROM system_settings WHERE key IN ('poll_ms','max_temp_addresses')").all();
  const settings: any = {};
  for (const r of (rows.results || [])) settings[r.key] = r.value;
  // DingTalk toggle
  const dt = await c.env.DB.prepare("SELECT value FROM dt_settings WHERE key='dingtalk_enabled'").first<{value:string}>();
  settings.dingtalk_enabled = dt?.value || "off";
  return c.json({ ok: true, settings });
});

// ── Admin Settings ──
app.get("/api/admin/settings", async(c)=>{
  const u=await auth(c); if(u.role!=="admin") return c.json({ok:false,error:"需要管理员权限"},403);
  const rows=await c.env.DB.prepare("SELECT key,value FROM system_settings").all();
  const settings:any={}; for(const r of (rows.results||[])) settings[r.key]=r.value;
  const userCount=(await c.env.DB.prepare("SELECT COUNT(*) as c FROM users").first<{c:number}>())?.c||0;
  const dt=await c.env.DB.prepare("SELECT value FROM dt_settings WHERE key='dingtalk_enabled'").first<{value:string}>();
  settings.dingtalk_enabled=dt?.value||"off";
  return c.json({ok:true,settings,userCount});
});

app.get("/api/dingtalk/admin/settings", async(c)=>{
  const u=await auth(c); if(!u.isSudo) return c.json({ok:false,error:"需要管理员权限"},403);
  const rows=await c.env.DB.prepare("SELECT key,value FROM dt_settings").all();
  const settings:any={}; for(const r of (rows.results||[])) settings[r.key]=r.value;
  return c.json({ok:true,settings});
});
app.post("/api/dingtalk/admin/settings", async(c)=>{
  const u=await auth(c); if(!u.isSudo) return c.json({ok:false,error:"需要管理员权限"},403);
  const b=await c.req.json() as any; const now=nowIso();
  for(const k of Object.keys(b)){
    await c.env.DB.prepare("INSERT INTO dt_settings(key,value,updated_at) VALUES(?1,?2,?3) ON CONFLICT(key) DO UPDATE SET value=?2,updated_at=?3").bind(k,String(b[k]),now).run();
  }
  return c.json({ok:true});
});

app.post("/api/admin/settings", async(c)=>{
  const u=await auth(c); if(u.role!=="admin") return c.json({ok:false,error:"需要管理员权限"},403);
  const b=await c.req.json() as any; const now=nowIso();
  if('dingtalk_enabled' in b){
    await c.env.DB.prepare("INSERT INTO dt_settings(key,value,updated_at) VALUES('dingtalk_enabled',?1,?2) ON CONFLICT(key) DO UPDATE SET value=?1,updated_at=?2").bind(String(b.dingtalk_enabled),now).run();
    delete b.dingtalk_enabled;
  }
  for(const k of Object.keys(b)){
    await c.env.DB.prepare("INSERT INTO system_settings(key,value,updated_at) VALUES(?1,?2,?3) ON CONFLICT(key) DO UPDATE SET value=?2,updated_at=?3").bind(k,String(b[k]),now).run();
  }
  return c.json({ok:true});
});

// ── Emails ──
app.get("/api/inbox", async(c)=>{ const u=await auth(c); const r=await c.env.DB.prepare("SELECT id,source,subject,body_text,body_html,address,message_id,created_at FROM emails WHERE direction='inbound' AND owner_id=?1 ORDER BY created_at DESC LIMIT 200").bind(u.id).all(); return c.json({ok:true,items:r.results}); });
app.get("/api/sent", async(c)=>{ const u=await auth(c); const r=await c.env.DB.prepare("SELECT id,source,subject,body_text,body_html,address,created_at FROM emails WHERE direction='outbound' AND owner_id=?1 ORDER BY created_at DESC LIMIT 200").bind(u.id).all(); return c.json({ok:true,items:r.results}); });
app.get("/api/mail/:id", async(c)=>{ const u=await auth(c); const r=await c.env.DB.prepare("SELECT * FROM emails WHERE id=?1 AND owner_id=?2 LIMIT 1").bind(c.req.param("id"),u.id).first(); if(!r) return c.json({ok:false,error:"not found"},404); return c.json({ok:true,data:r}); });
app.delete("/api/mail/:id", async(c)=>{ const u=await auth(c); await c.env.DB.prepare("DELETE FROM emails WHERE id=?1 AND owner_id=?2").bind(c.req.param("id"),u.id).run(); return c.json({ok:true}); });

app.post("/api/send", async(c)=>{
  const u=await auth(c); const key=c.env.RESEND_KEY; if(!key) return c.json({ok:false,error:"未配置 API 密钥"},500);
  const b=await c.req.json() as any; const domain=c.env.SENDER_DOMAIN||"sunsetzhong.indevs.in";
  const from=b.from||`${u.username}@${domain}`,to=(b.to||"").trim(),subject=(b.subject||"").trim();
  const html=(b.html||"").trim(),text=(b.text||"").trim();
  if(!to||!subject||(!html&&!text)) return c.json({ok:false,error:"to, subject, html/text 必填"},400);
  const now=nowIso(),msgId=crypto.randomUUID();
  // Ensure sender address registered
  const fromLower=from.toLowerCase();
  await c.env.DB.prepare("INSERT OR IGNORE INTO user_addresses(user_id,address,created_at) VALUES(?1,?2,?3)").bind(u.id,fromLower,now).run();
  await c.env.DB.prepare("INSERT INTO emails(id,owner_id,source,address,subject,body_text,body_html,raw_json,direction,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'outbound',?9)").bind(msgId,u.id,from,to,subject,text,html,JSON.stringify({from,to,subject}),now).run();
  const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({from,to:[to],subject,html:html||text})});
  const data=await resp.json() as any; if(!resp.ok) return c.json({ok:false,error:"发送失败",detail:data},resp.status);
  return c.json({ok:true,data:{id:msgId,...data}});
});

app.post("/api/reply", async(c)=>{
  const u=await auth(c); const key=c.env.RESEND_KEY; if(!key) return c.json({ok:false,error:"未配置 API 密钥"},500);
  const b=await c.req.json() as any; const domain=c.env.SENDER_DOMAIN||"sunsetzhong.indevs.in";
  const from=b.from||`${u.username}@${domain}`,to=(b.to||"").trim(),subject=(b.subject||"").trim();
  const html=(b.html||"").trim(),text=(b.text||"").trim();
  const inReplyTo=(b.in_reply_to||"").trim(),references=(b.references||"").trim();
  if(!to||!subject||(!html&&!text)) return c.json({ok:false,error:"to, subject, html/text 必填"},400);
  const now=nowIso(),msgId=crypto.randomUUID();
  const headers:any={"Content-Type":"application/json",Authorization:`Bearer ${key}`};
  const payload:any={from,to:[to],subject,html:html||text};
  if(inReplyTo){payload.headers={"In-Reply-To":inReplyTo,"References":references||inReplyTo};}
  await c.env.DB.prepare("INSERT OR IGNORE INTO user_addresses(user_id,address,created_at) VALUES(?1,?2,?3)").bind(u.id,from.toLowerCase(),now).run();
  await c.env.DB.prepare("INSERT INTO emails(id,owner_id,source,address,subject,body_text,body_html,raw_json,direction,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'outbound',?9)").bind(msgId,u.id,from,to,"Re: "+subject.replace(/^Re:\s*/i,""),text,html,JSON.stringify({from,to,subject,inReplyTo,references}),now).run();
  const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers,body:JSON.stringify(payload)});
  const data=await resp.json() as any; if(!resp.ok) return c.json({ok:false,error:"发送失败",detail:data},resp.status);
  return c.json({ok:true,data:{id:msgId,...data}});
});

// ── Push Notifications ──
const VAPID_SUBJECT = "mailto:admin@sunsetzhong.indevs.in";
let vapidKeys: { publicKey: string; privateKey: string } | null = null;

async function ensureVapidKeys(env: Env) {
  if (vapidKeys) return vapidKeys;
  const row = await env.DB.prepare("SELECT value FROM system_settings WHERE key='vapid_keys'").first<{value:string}>();
  if (row?.value) { vapidKeys = JSON.parse(row.value); return vapidKeys; }
  // Generate new VAPID key pair (ECDSA P-256)
  const kp = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
  const pubRaw = await crypto.subtle.exportKey("raw", kp.publicKey);
  const privRaw = await crypto.subtle.exportKey("pkcs8", kp.privateKey);
  vapidKeys = {
    publicKey: btoa(String.fromCharCode(...new Uint8Array(pubRaw))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),
    privateKey: btoa(String.fromCharCode(...new Uint8Array(privRaw))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""),
  };
  await env.DB.prepare("INSERT INTO system_settings(key,value,updated_at) VALUES('vapid_keys',?1,?2) ON CONFLICT(key) DO UPDATE SET value=?1,updated_at=?2").bind(JSON.stringify(vapidKeys), nowIso()).run();
  return vapidKeys;
}

app.get("/api/push/vapid-public-key", async(c) => {
  const u = await auth(c);
  const keys = await ensureVapidKeys(c.env);
  return c.json({ ok: true, publicKey: keys.publicKey });
});

app.post("/api/push/subscribe", async(c) => {
  const u = await auth(c);
  const b = await c.req.json() as any;
  const { endpoint, keys: { p256dh, auth: authKey } } = b;
  if (!endpoint || !p256dh || !authKey) return c.json({ ok: false, error: "missing subscription fields" }, 400);
  const id = crypto.randomUUID();
  await c.env.DB.prepare("INSERT OR REPLACE INTO push_subscriptions(id,user_id,endpoint,p256dh,auth,created_at) VALUES(?1,?2,?3,?4,?5,?6)").bind(id, u.id, endpoint, p256dh, authKey, nowIso()).run();
  return c.json({ ok: true });
});

app.post("/api/push/unsubscribe", async(c) => {
  const u = await auth(c);
  const b = await c.req.json() as any;
  await c.env.DB.prepare("DELETE FROM push_subscriptions WHERE user_id=?1 AND endpoint=?2").bind(u.id, b.endpoint||"").run();
  return c.json({ ok: true });
});

// Web Push: send push message to a subscription
async function sendWebPush(sub: { endpoint: string; p256dh: string; auth: string }, payload: string, vapidKeys: { publicKey: string; privateKey: string }) {
  try {
    // Decode keys
    const b64urlDecode = (s: string) => new Uint8Array(atob(s.replace(/-/g,"+").replace(/_/g,"/")).split("").map(c => c.charCodeAt(0)));
    const subAuth = b64urlDecode(sub.auth);
    const subP256dh = b64urlDecode(sub.p256dh);
    const vapidPub = b64urlDecode(vapidKeys.publicKey);
    const vapidPriv = b64urlDecode(vapidKeys.privateKey);

    // Import subscriber's public key
    const subKey = await crypto.subtle.importKey("raw", subP256dh, { name: "ECDH", namedCurve: "P-256" }, false, []);
    // Generate local ECDH key pair
    const localKp = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
    const localPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", localKp.publicKey));

    // Derive shared secret
    const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits(
      { name: "ECDH", public: subKey }, localKp.privateKey, 256
    ));

    // HKDF to derive encryption key and nonce
    const authInfo = new TextEncoder().encode("WebPush: info\0" + String.fromCharCode(...subP256dh) + String.fromCharCode(...localPubRaw));
    const ikm = await crypto.subtle.importKey("raw", sharedSecret, { name: "HKDF" }, false, ["deriveBits"]);
    const prk = new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: subAuth, info: authInfo }, ikm, 256));

    // Extract encryption params
    const cekInfo = new TextEncoder().encode("Content-Encoding: aes128gcm\0");
    const cek = new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: prk.slice(0, 32), info: cekInfo }, ikm, 128));

    const nonceInfo = new TextEncoder().encode("Content-Encoding: nonce\0");
    const nonce = new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt: prk.slice(0, 32), info: nonceInfo }, ikm, 96));

    // Encrypt payload with AES-128-GCM
    const encKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
    const padLen = 0;
    const plaintext = new TextEncoder().encode(String.fromCharCode(padLen) + "\0" + payload);
    const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, additionalData: new Uint8Array(0), tagLength: 128 }, encKey, plaintext));

    // Build request body
    const body = new Uint8Array(21 + localPubRaw.length + ciphertext.length);
    body[0] = 0x04; // key length
    body[1] = 0x00; body[2] = 0x00; body[3] = 0x00; body[4] = 0x00; // padding
    body[5] = 0x00; body[6] = 0x41; // keyid length
    body.set(localPubRaw, 7);
    const keyEnd = 7 + localPubRaw.length;
    body[keyEnd] = 0x02; // content encoding length
    body[keyEnd+1] = 0x00; body[keyEnd+2] = 0x00; body[keyEnd+3] = 0x00; body[keyEnd+4] = 0x00; // padding
    body[keyEnd+5] = 0x00; body[keyEnd+6] = 0x10; // data length
    body.set(ciphertext, keyEnd+7);

    // VAPID JWT
    const jwtHeader = { typ: "JWT", alg: "ES256" };
    const jwtPayload = { aud: new URL(sub.endpoint).origin, exp: Math.floor(Date.now()/1000)+86400, sub: VAPID_SUBJECT };
    const encJwt = (obj: any) => btoa(JSON.stringify(obj)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    const token = encJwt(jwtHeader) + "." + encJwt(jwtPayload);
    // Sign JWT
    const vapidPrivKey = await crypto.subtle.importKey("pkcs8", vapidPriv, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
    const sigRaw = new Uint8Array(await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, vapidPrivKey, new TextEncoder().encode(token)));
    const sigB64 = btoa(String.fromCharCode(...sigRaw)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
    const vapidJwt = token + "." + sigB64;

    await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "Authorization": "WebPush " + vapidJwt,
        "TTL": "86400",
      },
      body,
    });
  } catch (e) { /* ignore push errors */ }
}

async function notifyUser(env: Env, userId: string, title: string, body: string) {
  const subs = await env.DB.prepare("SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id=?1").bind(userId).all();
  if (!subs.results.length) return;
  const keys = await env.DB.prepare("SELECT value FROM system_settings WHERE key='vapid_keys'").first<{value:string}>();
  if (!keys?.value) return;
  const vk = JSON.parse(keys.value) as { publicKey: string; privateKey: string };
  const payload = JSON.stringify({ title, body, icon: "/icon-192.png", tag: "new-mail" });
  await Promise.allSettled(subs.results.map((s: any) => sendWebPush(s, payload, vk)));
}

// ── DingTalk API routes (gated by dingtalk_enabled) ──
app.use("/api/dingtalk/*", async (c, next) => {
  const err = await requireDingtalkEnabled(c.env);
  if (err) return err;
  await next();
});
app.use("/internal/dingtalk/*", async (c, next) => { await next(); }); // internal routes self-auth via token
app.route("/api/dingtalk", dt);
app.route("/internal/dingtalk", dt);

// ── DingTalk page ──
app.get("/dingtalk", async (c) => {
  const u = c.get("user");
  if (!u) return c.redirect("/login");
  const enabled = await dingtalkEnabled(c.env);
  if (enabled === "off") return c.notFound();
  return c.html(DINGTALK_PAGE);
});

// ── Version ──
app.get("/api/version", c => c.json({ ok: true, version: "2.17", apk_url: "/app.apk" }));

// Helper: determine if connection is secure, even behind Cloudflare proxy
function isSecure(c: any) {
  return c.req.url.startsWith("https") || c.req.header("x-forwarded-proto") === "https";
}

// ── PWA Icons ──
function genIcon(size: number): Response {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size*0.2}" fill="#2563eb"/><text x="${size/2}" y="${size*0.68}" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="${size*0.55}">S</text></svg>`;
  return new Response(svg, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, max-age=86400" } });
}
app.get("/icon-192.png", c => genIcon(192));
app.get("/icon-512.png", c => genIcon(512));

// ── SPA & bootstrap ──
app.get("/login", c=>c.html(LOGIN_PAGE));
app.get("/register", c=>c.html(REGISTER_PAGE));

let booted=false;
async function bootstrap(env:Env){
  if(booted)return; booted=true;
  // Ensure push_subscriptions table exists
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS push_subscriptions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, endpoint TEXT NOT NULL, p256dh TEXT NOT NULL, auth TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))").run();
  // Ensure device_tokens table exists
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS device_tokens (token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL, created_at TEXT NOT NULL, FOREIGN KEY (user_id) REFERENCES users(id))").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id)").run();
  // One-time fix: re-parse MIME bodies — first pass fixed base64, second pass fixes qpDecode NUL bug
  const fixDone = await env.DB.prepare("SELECT value FROM system_settings WHERE key='fix_qp_nul'").first<{value:string}>();
  if (!fixDone) {
    const rows = await env.DB.prepare("SELECT id, raw_json FROM emails WHERE direction='inbound'").all();
    for (const r of (rows.results||[]) as {id:string;raw_json:string}[]) {
      try { const { text, html } = parseMime(r.raw_json); await env.DB.prepare("UPDATE emails SET body_text=?1, body_html=?2 WHERE id=?3").bind(text, html, r.id).run() } catch {}
    }
    await env.DB.prepare("INSERT INTO system_settings(key,value,updated_at) VALUES('fix_qp_nul','1',?1) ON CONFLICT(key) DO UPDATE SET value='1',updated_at=?1").bind(nowIso()).run();
  }
  if(!env.BOOTSTRAP_USERNAME||!env.BOOTSTRAP_PASSWORD)return;
  const n=env.BOOTSTRAP_USERNAME.toLowerCase();
  if(await env.DB.prepare("SELECT id FROM users WHERE username_norm=?1").bind(n).first())return;
  const id=crypto.randomUUID(),salt=randomToken(16),hash=await sha256Hex(salt+":"+env.BOOTSTRAP_PASSWORD),now=nowIso();
  await env.DB.prepare("INSERT INTO users(id,username,username_norm,password_salt,password_hash,role,created_at,updated_at) VALUES(?1,?2,?3,?4,?5,'admin',?6,?6)").bind(id,env.BOOTSTRAP_USERNAME,n,salt,hash,now).run();
  console.log("bootstrap admin:",env.BOOTSTRAP_USERNAME);
}

const STATIC_FILES = new Set(["/sw.js","/manifest.json","/offline.html","/app.apk","/icon-192.png","/icon-512.png"]);

export default {
  async fetch(r:Request,e:Env){
    await bootstrap(e);
    const u=new URL(r.url);
    if(e.ASSETS && !u.pathname.startsWith("/api/") && !u.pathname.startsWith("/internal/") && !["/login","/register","/dingtalk"].includes(u.pathname)){
      // Serve known static files directly, SPA fallback for everything else
      if(STATIC_FILES.has(u.pathname) || u.pathname.startsWith("/.well-known/")){
        return e.ASSETS.fetch(r);
      }
      return e.ASSETS.fetch(new Request(new URL("/index.html",r.url),r));
    }
    return app.fetch(r,e);
  },
  async email(msg:ForwardableEmailMessage,env:Env){
    const raw = await new Response(msg.raw).text();
    const from = msg.headers.get("from") || msg.from || "";
    const to = msg.to || "";
    const subj = msg.headers.get("subject") || "无主题";
    const id = crypto.randomUUID(), now = nowIso();
    const { text, html } = parseMime(raw);
    const owner = await env.DB.prepare("SELECT user_id FROM user_addresses WHERE address=?1 LIMIT 1").bind(to.toLowerCase()).first<{user_id:string}>();
    await env.DB.prepare("INSERT INTO emails(id,owner_id,message_id,source,address,subject,body_text,body_html,raw_json,direction,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,'inbound',?10)").bind(id, owner?.user_id || null, msg.headers.get("message-id") || "", from, to, subj, text, html, raw, now).run();
    // Send push notification to owner
    if (owner?.user_id) {
      const sender = from.replace(/<.*?>|"/g, "").trim().split("@")[0] || from;
      await notifyUser(env, owner.user_id, "新邮件", `${sender}: ${subj}`);
    }
  },
};

const LOGIN_PAGE=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>登录</title>
<style>:root{--bg:#f8fafc;--panel:#fff;--text:#0f172a;--muted:#64748b;--blue:#2563eb;--line:#e2e8f0;--font:"Google Sans","PingFang SC",sans-serif}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.c{background:var(--panel);border-radius:16px;border:1px solid var(--line);padding:40px;width:100%;max-width:380px}
h1{font-size:22px;font-weight:600;margin-bottom:4px}.sub{color:var(--muted);font-size:14px;margin-bottom:28px}
input{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px 14px;font:inherit;font-size:15px;margin-bottom:10px;outline:none;transition:border-color .15s}
input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
button{width:100%;background:var(--blue);color:#fff;border:none;border-radius:10px;padding:12px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
button:hover{background:#1d4ed8}.err{color:#dc2626;font-size:13px;margin-bottom:10px}
.link{text-align:center;margin-top:16px;font-size:13px;color:var(--muted)}.link a{color:var(--blue);text-decoration:none;font-weight:500}
</style></head><body><div class="c">
<h1>Sunsetzhong</h1><div class="sub">登录邮箱</div><div id="err" class="err"></div>
<form id="f"><input name="username" placeholder="用户名" autocomplete="username" required><input name="password" type="password" placeholder="密码" autocomplete="current-password" required><button type="submit">登录</button></form>
<div class="link">没有账号？<a href="/register">注册</a></div><div style="text-align:center;margin-top:20px;padding-top:16px;border-top:1px solid var(--line)"><a href="/app.apk" style="font-size:13px;color:var(--muted);text-decoration:none;display:flex;align-items:center;justify-content:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>下载 Android App</a></div></div>
<script>document.getElementById("f").addEventListener("submit",async e=>{e.preventDefault();const er=document.getElementById("err");er.textContent="";const fd=new FormData(e.target);try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({username:fd.get("username"),password:fd.get("password")})});const d=await r.json();if(!r.ok){er.textContent=d.error||"登录失败";return}location.href="/"}catch{er.textContent="网络错误"}});</script></body></html>`;

const REGISTER_PAGE=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>注册</title>
<style>:root{--bg:#f8fafc;--panel:#fff;--text:#0f172a;--muted:#64748b;--blue:#2563eb;--line:#e2e8f0;--font:"Google Sans","PingFang SC",sans-serif}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
.c{background:var(--panel);border-radius:16px;border:1px solid var(--line);padding:40px;width:100%;max-width:380px}
h1{font-size:22px;font-weight:600;margin-bottom:4px}.sub{color:var(--muted);font-size:14px;margin-bottom:28px}
input{width:100%;border:1px solid var(--line);border-radius:10px;padding:12px 14px;font:inherit;font-size:15px;margin-bottom:10px;outline:none;transition:border-color .15s}
input:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(37,99,235,.1)}
button{width:100%;background:var(--blue);color:#fff;border:none;border-radius:10px;padding:12px;font:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:.15s}
button:hover{background:#1d4ed8}.err{color:#dc2626;font-size:13px;margin-bottom:10px}
.link{text-align:center;margin-top:16px;font-size:13px;color:var(--muted)}.link a{color:var(--blue);text-decoration:none;font-weight:500}
</style></head><body><div class="c">
<h1>Sunsetzhong</h1><div class="sub">创建账号</div><div id="err" class="err"></div>
<form id="f"><input name="username" placeholder="用户名 (3-32 位)" autocomplete="username" required><input name="password" type="password" placeholder="密码 (至少4位)" autocomplete="new-password" required><button type="submit">注册</button></form>
<div class="link">已有账号？<a href="/login">登录</a></div></div>
<script>document.getElementById("f").addEventListener("submit",async e=>{e.preventDefault();const er=document.getElementById("err");er.textContent="";const fd=new FormData(e.target);try{const r=await fetch("/api/auth/register",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({username:fd.get("username"),password:fd.get("password")})});const d=await r.json();if(!r.ok){er.textContent=d.error||"注册失败";return}location.href="/"}catch{er.textContent="网络错误"}});</script></body></html>`;
