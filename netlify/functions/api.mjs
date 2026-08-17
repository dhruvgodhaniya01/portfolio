import { getStore } from "@netlify/blobs";
import crypto from "node:crypto";

const DATA = "portfolio-data";
const FILES = "portfolio-files";
const SESSION_COOKIE = "dhruv_admin_session";
const SESSION_TTL = 1000 * 60 * 60 * 8; // 8 hours

const defaults = {
  content: {
    name: "Dhruv Godhaniya",
    eyebrow: "Web developer · Robotics & Automation student · AI/ML learner",
    headline: "I build digital experiences while learning to build intelligent machines.",
    description: "First-year B.Tech Robotics & Automation student at Government Engineering College Rajkot (GTU), building practical web projects while exploring AI/ML and automation.",
    availability: "OPEN TO OPPORTUNITIES"
  },
  projects: [
    {id:"01",title:"Tokicha",type:"CAFE SHOWCASE · CLIENT CONCEPT",url:"https://tokicha.netlify.app",linkLabel:"Open live project",status:"live",description:"A polished café showcase with menu, reviews, location and customer enquiry sections."},
    {id:"02",title:"Hostel Management",type:"MANAGEMENT WEB APPLICATION",url:"https://hostelmange.netlify.app/",linkLabel:"Open live project",status:"live",description:"A practical management application for student records, admissions, search and hostel workflows."},
    {id:"03",title:"Hotel Management",type:"MANAGEMENT + OPERATIONS",url:"https://hotelmanage1.netlify.app",linkLabel:"Open live project",status:"live",description:"Operations-focused web software covering customer accounts, menus, purchases, passes and transactions."},
    {id:"04",title:"Hilla Restaurant Cafe",type:"RESTAURANT SHOWCASE",url:"https://hilla-restaurant-cafe.netlify.app",linkLabel:"Open live project",status:"live",description:"A restaurant-focused showcase experience designed around menu discovery, presentation and customer action."},
    {id:"05",title:"Portfolio Hospital",type:"HEALTHCARE SHOWCASE",url:"https://portfoliohospital.netlify.app",linkLabel:"Open live project",status:"live",description:"A hospital website concept with healthcare information, doctors, services, facilities and appointment flow."}
  ]
};

const jsonStore = () => getStore(DATA);
const fileStore = () => getStore(FILES);

function response(body, status=200, extra={}) {
  const headers = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...extra};
  return new Response(JSON.stringify(body), {status,headers});
}
function textResponse(body,status=200,extra={}) {
  return new Response(body,{status,headers:{"Cache-Control":"no-store",...extra}});
}
function safeJson(value){return JSON.stringify(value);}
async function getJson(key, fallback){
  const store=jsonStore();
  const value=await store.get(key,{type:"json"});
  return value ?? fallback;
}
async function setJson(key,value){ await jsonStore().setJSON(key,value); }

function b64url(buf){return Buffer.from(buf).toString("base64url")}
function fromB64url(str){return Buffer.from(str,"base64url")}
function secret(){
  const s=process.env.ADMIN_SESSION_SECRET;
  if(!s) throw new Error("ADMIN_SESSION_SECRET is not configured");
  return s;
}
function sign(payload){
  const body=b64url(Buffer.from(JSON.stringify(payload)));
  const sig=b64url(crypto.createHmac("sha256",secret()).update(body).digest());
  return `${body}.${sig}`;
}
function verify(token){
  try{
    const [body,sig]=String(token||"").split(".");
    if(!body||!sig) return null;
    const expected=crypto.createHmac("sha256",secret()).update(body).digest();
    if(!crypto.timingSafeEqual(fromB64url(sig),expected)) return null;
    const data=JSON.parse(fromB64url(body).toString("utf8"));
    if(!data.exp || Date.now()>data.exp) return null;
    return data;
  }catch{return null}
}
function cookie(name,value,maxAge=SESSION_TTL/1000){
  return `${name}=${value}; Path=/; Max-Age=${Math.floor(maxAge)}; HttpOnly; Secure; SameSite=Lax`;
}
function clearCookie(name){return `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`}
function sessionFrom(req){
  const cookies=req.headers.get("cookie")||"";
  const match=cookies.split(";").map(x=>x.trim()).find(x=>x.startsWith(SESSION_COOKIE+"="));
  return match ? verify(decodeURIComponent(match.slice(SESSION_COOKIE.length+1))) : null;
}
function authRequired(req){
  const s=sessionFrom(req);
  if(!s) return null;
  return s;
}
function originAllowed(req){
  const origin=req.headers.get("origin");
  if(!origin) return true; // same-origin navigation / server calls
  const site=new URL(req.url).origin;
  return origin===site;
}
async function readBody(req){
  try{return await req.json()}catch{return {}}
}
function hashPassword(password){
  const salt=crypto.randomBytes(16);
  const hash=crypto.scryptSync(password,salt,64);
  return `scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`;
}
function verifyPassword(password,stored){
  try{
    const [alg,salt64,hash64]=String(stored).split("$");
    if(alg!=="scrypt") return false;
    const salt=Buffer.from(salt64,"base64url");
    const expected=Buffer.from(hash64,"base64url");
    const actual=crypto.scryptSync(password,salt,expected.length);
    return crypto.timingSafeEqual(actual,expected);
  }catch{return false}
}
function validPassword(p){return typeof p==="string" && p.length>=10 && p.length<=200}

async function authHash(){
  const record=await getJson("auth.json",null);
  return record?.passwordHash || null;
}
async function ensureInitialized(){
  if(!process.env.ADMIN_SESSION_SECRET) throw new Error("ADMIN_SESSION_SECRET is missing");
  if(!process.env.ADMIN_INITIAL_PASSWORD && !(await authHash())) throw new Error("ADMIN_INITIAL_PASSWORD is missing");
}
async function login(body){
  await ensureInitialized();
  const username=process.env.ADMIN_USERNAME || "admin";
  if(body.username!==username || typeof body.password!=="string") return response({error:"Invalid credentials"},401);
  const stored=await authHash();
  const ok=stored ? verifyPassword(body.password,stored) : crypto.timingSafeEqual(Buffer.from(body.password),Buffer.from(process.env.ADMIN_INITIAL_PASSWORD));
  if(!ok) return response({error:"Invalid credentials"},401);
  const token=sign({sub:username,iat:Date.now(),exp:Date.now()+SESSION_TTL});
  return response({ok:true,user:{username}},200,{"Set-Cookie":cookie(SESSION_COOKIE,encodeURIComponent(token))});
}

async function logout(){return response({ok:true},200,{"Set-Cookie":clearCookie(SESSION_COOKIE)})}

async function changePassword(req,body,session){
  if(!session) return response({error:"Unauthorized"},401);
  if(!validPassword(body.newPassword)) return response({error:"Password must be 10–200 characters."},400);
  const current=await authHash();
  let ok=false;
  if(current) ok=verifyPassword(body.currentPassword||"",current);
  else ok=body.currentPassword===process.env.ADMIN_INITIAL_PASSWORD;
  if(!ok) return response({error:"Current password is incorrect."},400);
  await setJson("auth.json",{passwordHash:hashPassword(body.newPassword),changedAt:new Date().toISOString()});
  return response({ok:true,message:"Password changed. Your current session remains active."});
}

async function resetPassword(req,body){
  const token=process.env.ADMIN_RESET_TOKEN;
  if(!token || body.resetToken!==token) return response({error:"Invalid reset token."},403);
  if(!validPassword(body.newPassword)) return response({error:"Password must be 10–200 characters."},400);
  await setJson("auth.json",{passwordHash:hashPassword(body.newPassword),changedAt:new Date().toISOString(),reset:true});
  return response({ok:true,message:"Password reset. Sign in with the new password."});
}

async function api(req){
  if(!originAllowed(req)) return response({error:"Cross-site request blocked."},403);
  const url=new URL(req.url);
  const path=url.pathname.replace(/^\/.netlify\/functions\/api\/?/,"").replace(/^\/api\/?/,"");
  const parts=path.split("/").filter(Boolean);
  const method=req.method.toUpperCase();

  if(method==="GET" && parts[0]==="health"){
    return response({ok:true,service:"Dhruv Portfolio API",storage:"Netlify Blobs"});
  }
  if(method==="POST" && parts[0]==="auth" && parts[1]==="login") return login(await readBody(req));
  if(method==="POST" && parts[0]==="auth" && parts[1]==="logout") return logout();
  if(method==="POST" && parts[0]==="auth" && parts[1]==="reset") return resetPassword(req,await readBody(req));

  if(method==="GET" && parts[0]==="projects"){
    const projects=await getJson("projects.json",defaults.projects);
    return response({projects});
  }
  if(method==="GET" && parts[0]==="content"){
    const content=await getJson("content.json",defaults.content);
    return response({content});
  }
  if(method==="GET" && parts[0]==="session"){
    const s=sessionFrom(req);
    return response({authenticated:!!s,user:s?{username:s.sub}:null});
  }

  const session=authRequired(req);
  if(!session) return response({error:"Unauthorized"},401);

  if(method==="POST" && parts[0]==="auth" && parts[1]==="change-password"){
    return changePassword(req,await readBody(req),session);
  }

  if(method==="PUT" && parts[0]==="projects"){
    const body=await readBody(req);
    if(!Array.isArray(body.projects)) return response({error:"projects must be an array"},400);
    const projects=body.projects.map((p,i)=>({
      id:String(p.id||String(i+1).padStart(2,"0")).slice(0,8),
      title:String(p.title||"Untitled").slice(0,120),
      type:String(p.type||"PROJECT").slice(0,100),
      url:String(p.url||"#").slice(0,500),
      linkLabel:String(p.linkLabel||"Open project").slice(0,80),
      status:["live","draft","hidden"].includes(p.status)?p.status:"draft",
      description:String(p.description||"").slice(0,800)
    }));
    await setJson("projects.json",projects);
    return response({ok:true,projects});
  }

  if(method==="PUT" && parts[0]==="content"){
    const b=await readBody(req);
    const content={
      name:String(b.name||defaults.content.name).slice(0,100),
      eyebrow:String(b.eyebrow||"").slice(0,160),
      headline:String(b.headline||"").slice(0,220),
      description:String(b.description||"").slice(0,800),
      availability:String(b.availability||"AVAILABLE").slice(0,40)
    };
    await setJson("content.json",content);
    return response({ok:true,content});
  }

  if(method==="GET" && parts[0]==="files"){
    const list=await fileStore().list({paginate:false});
    return response({files:list.blobs.map(x=>({key:x.key,size:x.size,updatedAt:x.uploadedAt}))});
  }

  if(method==="POST" && parts[0]==="files"){
    const form=await req.formData();
    const file=form.get("file");
    if(!file || typeof file.arrayBuffer!=="function") return response({error:"No file uploaded"},400);
    if(file.size>5*1024*1024) return response({error:"File is larger than 5 MB."},400);
    const safeName=String(file.name||"upload").replace(/[^a-zA-Z0-9._-]/g,"_").slice(0,120);
    const key=`${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    await fileStore().set(key,await file.arrayBuffer(),{metadata:{contentType:file.type||"application/octet-stream",originalName:safeName}});
    return response({ok:true,key,name:safeName});
  }

  if(method==="DELETE" && parts[0]==="files" && parts[1]){
    await fileStore().delete(decodeURIComponent(parts.slice(1).join("/")));
    return response({ok:true});
  }

  if(method==="GET" && parts[0]==="file" && parts[1]){
    const key=decodeURIComponent(parts.slice(1).join("/"));
    const got=await fileStore().getWithMetadata(key);
    if(!got) return textResponse("Not found",404);
    const meta=got.metadata||{};
    return new Response(got.data,{headers:{
      "Content-Type":meta.contentType||"application/octet-stream",
      "Cache-Control":"public, max-age=31536000, immutable"
    }});
  }

  return response({error:"Not found"},404);
}

export default async (req) => {
  try{return await api(req)}
  catch(err){
    console.error(err);
    return response({error:"Server error. Check Netlify Function logs.",detail:process.env.NODE_ENV==="development"?String(err.message):undefined},500);
  }
};
