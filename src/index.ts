import { Hono } from "hono";
import { cors } from "hono/cors";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { dt, getGuestToken, validateGuestToken, ensureGuestToken, guestOwnerId } from "./dingtalk";

interface Env {
  DB: D1Database; ASSETS?: { fetch: (req: Request) => Promise<Response> };
  RESEND_KEY?: string; SENDER_DOMAIN?: string;
  INTERNAL_API_TOKEN?: string; GITHUB_ACTIONS_TOKEN?: string;
  GITHUB_REPOSITORY?: string; GITHUB_WORKFLOW_FILE?: string;
  GITHUB_LOGIN_WORKFLOW_FILE?: string; GITHUB_REF?: string;
}
interface Session { id: string; created_at: string; }

const app = new Hono<{Bindings:Env;Variables:{session:Session|null}}>();

app.use("*", cors({origin:"*",allowMethods:["GET","POST","PUT","DELETE","OPTIONS"],allowHeaders:["Content-Type","Authorization","X-DT-Token"],credentials:true}));

// Anonymous session middleware
app.use("*", async(c,next)=>{
  let sid = getCookie(c, "em_sid") || "";
  if (sid) {
    const row = await c.env.DB.prepare("SELECT id, created_at FROM anon_sessions WHERE id=?1").bind(sid).first<Session>();
    if (row) {
      await c.env.DB.prepare("UPDATE anon_sessions SET last_active_at=?1 WHERE id=?2").bind(new Date().toISOString(), sid).run();
      c.set("session", row);
      return next();
    }
  }
  // Create new anonymous session
  sid = crypto.randomUUID();
  const now = new Date().toISOString();
  await c.env.DB.prepare("INSERT INTO anon_sessions(id,created_at,last_active_at) VALUES(?1,?2,?2)").bind(sid, now).run();
  setCookie(c, "em_sid", sid, {httpOnly:true,sameSite:"Lax",path:"/",maxAge:365*86400,secure:isSecure(c)});
  c.set("session", {id:sid, created_at:now});
  await next();
});

function requireSession(c:any): Session {
  const s = c.get("session");
  if (!s) throw new HTTPException(401,{message:"no session"});
  return s;
}

function isSecure(c:any) { return c.req.url.startsWith("https") || c.req.header("x-forwarded-proto") === "https"; }
function nowIso() { return new Date().toISOString(); }

// ── MIME ──
function qpDecode(s:string){const b:number[]=[];let i=0;while(i<s.length){if(s[i]==="="&&i+1<s.length&&s[i+1]==="\n"){i+=2;continue}if(s[i]==="="&&i+2<s.length&&s[i+1]==="\r"&&s[i+2]==="\n"){i+=3;continue}if(s[i]==="="&&i+2<s.length&&/^[0-9A-Fa-f]{2}$/.test(s.slice(i+1,i+3))){b.push(parseInt(s.slice(i+1,i+3),16));i+=3}else{b.push(s.charCodeAt(i));i++}}return new TextDecoder("utf-8").decode(new Uint8Array(b))}
function parseMime(raw:string):{text:string;html:string}{let text="",html="";const m=raw.match(/^Content-Type:\s*multipart\/[^;]*;\s*boundary="?([^";\r\n]+)"?/im);if(!m){const h=raw.indexOf("\r\n\r\n");return{text:h>=0?raw.slice(h+4).trim():raw,html:""}}const p=splitParts(raw,m[1]);for(const pt of p){const he=pt.indexOf("\r\n\r\n");if(he<0)continue;const hdr=pt.slice(0,he),body=pt.slice(he+4);const ct=(hdr.match(/Content-Type:\s*([^\r\n;]+)/i)?.[1]||"").toLowerCase();const enc=(hdr.match(/Content-Transfer-Encoding:\s*([^\r\n]+)/i)?.[1]||"").toLowerCase();let dec=body;if(enc.includes("quoted-printable"))dec=qpDecode(body);else if(enc.includes("base64")){try{const bin=atob(body.replace(/\s/g,""));const b8=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)b8[j]=bin.charCodeAt(j);dec=new TextDecoder("utf-8").decode(b8)}catch{}}if(ct.includes("multipart/")){const n=parseMime(pt);if(n.text&&!text)text=n.text.trim();if(n.html&&!html)html=n.html.trim()}else if(ct.includes("text/plain")&&!text)text=dec.trim();else if(ct.includes("text/html")&&!html)html=dec.trim()}if(!text&&!html){const he=raw.indexOf("\r\n\r\n");text=he>=0?raw.slice(he+4).trim():raw}return{text,html}}
function splitParts(raw:string,b:string):string[]{const r:string[]=[],mk=`--${b}`,end=`--${b}--`;let s=raw.indexOf(mk);while(s>=0){s+=mk.length;if(raw[s]==="\r")s++;if(raw[s]==="\n")s++;const n=raw.indexOf(mk,s),e=n>=0?n:raw.length;const p=raw.slice(s,e).trim();if(p&&!p.startsWith("--"))r.push(p);if(n>=0&&raw.slice(n,n+end.length)===end)break;s=n}return r}

// ── Temp Email Addresses ──
app.get("/api/addresses", async(c)=>{
  const s = requireSession(c);
  const rows = await c.env.DB.prepare("SELECT * FROM addresses WHERE user_id=?1 ORDER BY created_at DESC").bind(s.id).all();
  return c.json({ok:true,items:rows.results||[]});
});

app.post("/api/addresses", async(c)=>{
  const s = requireSession(c);
  const b = await c.req.json().catch(()=>({}));
  let name = (b.name||"").trim().toLowerCase();
  const domain = c.env.SENDER_DOMAIN||"sunsetzhong.indevs.in";
  if (!name || !/^[a-z0-9_.-]{3,32}$/.test(name)) {
    name = `tmp-${randomToken(4).toLowerCase()}`;
  }
  const full = `${name}@${domain}`;
  const existing = await c.env.DB.prepare("SELECT id FROM addresses WHERE full_address=?1").bind(full).first();
  if (existing) return c.json({ok:false,error:"该地址已被使用"},400);
  const id = crypto.randomUUID(), now = nowIso();
  await c.env.DB.prepare("INSERT INTO addresses(id,user_id,name,full_address,created_at) VALUES(?1,?2,?3,?4,?5)").bind(id,s.id,name,full,now).run();
  return c.json({ok:true,data:{id,name,full_address:full}},201);
});

app.delete("/api/addresses/:id", async(c)=>{
  const s = requireSession(c);
  const addr = await c.env.DB.prepare("SELECT full_address FROM addresses WHERE id=?1 AND user_id=?2").bind(c.req.param("id"),s.id).first<{full_address:string}>();
  if (!addr) return c.json({ok:false,error:"地址不存在"},404);
  await c.env.DB.prepare("DELETE FROM addresses WHERE id=?1").bind(c.req.param("id")).run();
  return c.json({ok:true});
});

// ── Emails ──
app.get("/api/inbox", async(c)=>{
  const s = requireSession(c);
  const r = await c.env.DB.prepare("SELECT id,source,subject,body_text,body_html,address,message_id,created_at FROM emails WHERE direction='inbound' AND owner_id=?1 ORDER BY created_at DESC LIMIT 200").bind(s.id).all();
  return c.json({ok:true,items:r.results});
});
app.get("/api/sent", async(c)=>{
  const s = requireSession(c);
  const r = await c.env.DB.prepare("SELECT id,source,subject,body_text,body_html,address,created_at FROM emails WHERE direction='outbound' AND owner_id=?1 ORDER BY created_at DESC LIMIT 200").bind(s.id).all();
  return c.json({ok:true,items:r.results});
});
app.get("/api/mail/:id", async(c)=>{
  const s = requireSession(c);
  const r = await c.env.DB.prepare("SELECT * FROM emails WHERE id=?1 AND owner_id=?2 LIMIT 1").bind(c.req.param("id"),s.id).first();
  if(!r) return c.json({ok:false,error:"not found"},404);
  return c.json({ok:true,data:r});
});
app.delete("/api/mail/:id", async(c)=>{
  const s = requireSession(c);
  await c.env.DB.prepare("DELETE FROM emails WHERE id=?1 AND owner_id=?2").bind(c.req.param("id"),s.id).run();
  return c.json({ok:true});
});

app.post("/api/send", async(c)=>{
  const s = requireSession(c); const key=c.env.RESEND_KEY; if(!key) return c.json({ok:false,error:"未配置 API 密钥"},500);
  const b=await c.req.json() as any; const domain=c.env.SENDER_DOMAIN||"sunsetzhong.indevs.in";
  const from=(b.from||"").trim(),to=(b.to||"").trim(),subject=(b.subject||"").trim();
  const html=(b.html||"").trim(),text=(b.text||"").trim();
  if(!from||!to||!subject||(!html&&!text)) return c.json({ok:false,error:"from, to, subject, html/text 必填"},400);
  const now=nowIso(),msgId=crypto.randomUUID();
  await c.env.DB.prepare("INSERT INTO emails(id,owner_id,source,address,subject,body_text,body_html,raw_json,direction,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'outbound',?9)").bind(msgId,s.id,from,to,subject,text,html,JSON.stringify({from,to,subject}),now).run();
  const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({from,to:[to],subject,html:html||text})});
  const data=await resp.json() as any; if(!resp.ok) return c.json({ok:false,error:"发送失败",detail:data},resp.status);
  return c.json({ok:true,data:{id:msgId,...data}});
});

app.post("/api/reply", async(c)=>{
  const s = requireSession(c); const key=c.env.RESEND_KEY; if(!key) return c.json({ok:false,error:"未配置 API 密钥"},500);
  const b=await c.req.json() as any; const domain=c.env.SENDER_DOMAIN||"sunsetzhong.indevs.in";
  const from=(b.from||"").trim(),to=(b.to||"").trim(),subject=(b.subject||"").trim();
  const html=(b.html||"").trim(),text=(b.text||"").trim();
  const inReplyTo=(b.in_reply_to||"").trim(),references=(b.references||"").trim();
  if(!from||!to||!subject||(!html&&!text)) return c.json({ok:false,error:"from, to, subject, html/text 必填"},400);
  const now=nowIso(),msgId=crypto.randomUUID();
  const payload:any={from,to:[to],subject,html:html||text};
  if(inReplyTo){payload.headers={"In-Reply-To":inReplyTo,"References":references||inReplyTo}}
  await c.env.DB.prepare("INSERT INTO emails(id,owner_id,source,address,subject,body_text,body_html,raw_json,direction,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'outbound',?9)").bind(msgId,s.id,from,to,"Re: "+subject.replace(/^Re:\s*/i,""),text,html,JSON.stringify({from,to,subject,inReplyTo,references}),now).run();
  const resp=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify(payload)});
  const data=await resp.json() as any; if(!resp.ok) return c.json({ok:false,error:"发送失败",detail:data},resp.status);
  return c.json({ok:true,data:{id:msgId,...data}});
});

// ── Contacts (recent recipients) ──
app.get("/api/contacts", async(c)=>{
  const s = requireSession(c);
  const rows = await c.env.DB.prepare("SELECT DISTINCT address FROM emails WHERE owner_id=?1 AND direction='outbound' ORDER BY created_at DESC LIMIT 30").bind(s.id).all();
  return c.json({ok:true,contacts:(rows.results||[]).map((r:any)=>r.address).filter(Boolean)});
});

// ── Version ──
app.get("/api/version", c => c.json({ ok: true, version: "2.56" }));

// ── DingTalk routes (keep existing) ──
app.use("/api/dingtalk/*", async (c, next) => {
  const s = c.get("session") as Session | null;
  if (s) {
    c.set("user", {id: s.id, username: "匿名", role: "user", isSudo: false});
  } else {
    const dtToken = c.req.query("dt_token") || c.req.header("x-dt-token") || "";
    if (dtToken && await validateGuestToken(c.env, dtToken)) {
      const gid = guestOwnerId(dtToken);
      c.set("session", {id: gid, created_at: nowIso()});
      c.set("user", {id: gid, username: "访客", role: "guest", isSudo: false});
    }
  }
  await next();
});
app.use("/internal/dingtalk/*", async (c, next) => { await next(); });
app.route("/api/dingtalk", dt);
app.route("/internal/dingtalk", dt);

// ── DingTalk page ──
app.get("/dingtalk", async (c) => {
  const token = c.req.query("token") || "";
  const validToken = await getGuestToken(c.env);
  const isGuest = validToken && token === validToken;
  const url = new URL(c.req.url);
  url.pathname = "/dingtalk.html";
  const assetReq = new Request(url.toString());
  const assetRes = await c.env.ASSETS.fetch(assetReq);
  let html = await assetRes.text();
  if (isGuest) {
    setCookie(c, "dt_guest", token, {
      httpOnly: true, sameSite: "Lax", path: "/",
      maxAge: 30 * 86400, secure: c.req.url.startsWith("https"),
    });
    html = html.replace("window.__DT_TOKEN = ''", "window.__DT_TOKEN = '" + token + "'");
  }
  return c.html(html);
});

// ── PWA Icons ──
app.get("/icon-192.png", c => genIcon(192));
app.get("/icon-512.png", c => genIcon(512));

function genIcon(size:number):Response{
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size*0.2}" fill="#2563eb"/><text x="${size/2}" y="${size*0.68}" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="bold" font-size="${size*0.55}">S</text></svg>`;
  return new Response(svg,{headers:{"Content-Type":"image/svg+xml","Cache-Control":"public, max-age=86400"}});
}

// ── SPA ──
app.get("/login", c=>c.redirect("/"));
app.get("/register", c=>c.redirect("/"));

let booted=false;
async function bootstrap(env:Env){
  if(booted)return; booted=true;
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS anon_sessions (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, last_active_at TEXT NOT NULL)").run();
  // Ensure inbox column exists for owner_id if it was owner_id before
  // The emails table should have owner_id column
}

const STATIC_FILES = new Set(["/sw.js","/manifest.json","/offline.html","/icon-192.png","/icon-512.png"]);

export default {
  async fetch(r:Request,e:Env){
    await bootstrap(e);
    const u=new URL(r.url);
    if(e.ASSETS && !u.pathname.startsWith("/api/") && !u.pathname.startsWith("/internal/") && !["/login","/register","/dingtalk"].includes(u.pathname)){
      if(STATIC_FILES.has(u.pathname) || u.pathname.startsWith("/.well-known/")) return e.ASSETS.fetch(r);
      return e.ASSETS.fetch(new Request(new URL("/index.html",r.url),r));
    }
    return app.fetch(r,e);
  },
  async email(msg:ForwardableEmailMessage,env:Env){
    const raw = await new Response(msg.raw).text();
    const from = msg.headers.get("from") || msg.from || "";
    const to = (msg.to||"").toLowerCase();
    const subj = msg.headers.get("subject") || "无主题";
    const id = crypto.randomUUID(), now = nowIso();
    const { text, html } = parseMime(raw);
    // Look up owner by address in addresses table
    const owner = await env.DB.prepare("SELECT user_id FROM addresses WHERE LOWER(full_address)=?1 LIMIT 1").bind(to).first<{user_id:string}>();
    await env.DB.prepare("INSERT INTO emails(id,owner_id,message_id,source,address,subject,body_text,body_html,raw_json,direction,created_at) VALUES(?1,?2,?3,?4,?5,?6,?7,?8,?9,'inbound',?10)").bind(id, owner?.user_id || null, msg.headers.get("message-id") || "", from, to, subj, text, html, raw, now).run();
  },
};

function randomToken(b=32){const a=new Uint8Array(b);crypto.getRandomValues(a);let s="";for(const x of a)s+=String.fromCharCode(x);return btoa(s).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"")}
