const API = "/api";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const DEFAULT = {
  projects: [
    {id:"01",title:"Tokicha",type:"CAFE SHOWCASE · CLIENT CONCEPT",url:"https://tokicha.netlify.app",linkLabel:"Open live project",status:"live",description:"A polished café showcase with menu, reviews, location and customer enquiry sections."},
    {id:"02",title:"Hostel Management",type:"MANAGEMENT WEB APPLICATION",url:"https://hostelmange.netlify.app/",linkLabel:"Open live project",status:"live",description:"A practical management application for student records, admissions, search and hostel workflows."},
    {id:"03",title:"Hotel Management",type:"MANAGEMENT + OPERATIONS",url:"https://hotelmanage1.netlify.app",linkLabel:"Open live project",status:"live",description:"Operations-focused web software covering customer accounts, menus, purchases, passes and transactions."},
    {id:"04",title:"Hilla Restaurant Cafe",type:"RESTAURANT SHOWCASE",url:"https://hilla-restaurant-cafe.netlify.app",linkLabel:"Open live project",status:"live",description:"A restaurant-focused showcase experience designed around menu discovery, presentation and customer action."},
    {id:"05",title:"Portfolio Hospital",type:"HEALTHCARE SHOWCASE",url:"https://portfoliohospital.netlify.app",linkLabel:"Open live project",status:"live",description:"A hospital website concept with healthcare information, doctors, services, facilities and appointment flow."}
  ],
  content:{name:"Dhruv Godhaniya",eyebrow:"Building at the intersection of code & machines",headline:"Engineering ideas into real experiences.",description:"Robotics & Automation student focused on web development, AI/ML and practical technology projects.",availability:"AVAILABLE"},
  motion:{intensity:78,glow:true,tilt:true,reveal:true}
};
let state={...structuredClone(DEFAULT)};

async function api(path,options={}){
  const opts={...options,headers:{...(options.headers||{})}};
  if(options.body && typeof options.body==="object" && !(options.body instanceof FormData)){
    opts.headers["Content-Type"]="application/json";opts.body=JSON.stringify(options.body);
  }
  const r=await fetch(API+path,{credentials:"same-origin",...opts});
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.error||`Request failed (${r.status})`);
  return data;
}
function esc(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function escAttr(v){return esc(v)}
function setError(id,msg){const el=$(id);if(el)el.textContent=msg||""}
function toast(msg,good=true){
  const el=$("#saveState");if(el){el.textContent=(good?"● ":"! ")+msg;el.style.color=good?"var(--accent)":"var(--danger)";setTimeout(()=>el.textContent="● Server synced",2200)}
}

async function boot(){
  try{
    const session=await api("/session");
    if(!session.authenticated){showLogin();return}
    $("#loginScreen")?.classList.add("hidden");
    await loadData();
    await initFiles();
    renderAll();
    const hash=location.hash.slice(1);if(hash)showView(hash);
  }catch(e){showLogin();setError("#loginError",e.message)}
}
function showLogin(){
  $("#loginScreen")?.classList.remove("hidden");
  document.body.classList.add("locked");
}
function hideLogin(){
  $("#loginScreen")?.classList.add("hidden");
  document.body.classList.remove("locked");
}
async function loadData(){
  const [p,c]=await Promise.all([api("/projects"),api("/content")]);
  state.projects=p.projects||DEFAULT.projects;
  state.content=c.content||DEFAULT.content;
}
function renderAll(){renderProjects();renderContent();renderMotion();updateStats()}
function renderProjects(){
  const host=$("#projectAdminList");if(!host)return;
  host.innerHTML=state.projects.map((p,i)=>`
    <div class="project-row" data-index="${i}">
      <span class="num">${esc(p.id)}</span>
      <div><h3>${esc(p.title)}</h3><p>${esc(p.type)} · ${esc(p.description||"")}</p></div>
      <span class="type">${esc(p.linkLabel)}</span>
      <span class="pill ${p.status==="live"?"live":""}">${esc(p.status).toUpperCase()}</span>
      <button class="row-link edit-project" type="button">Edit</button>
    </div>`).join("");
  $$(".edit-project").forEach(b=>b.addEventListener("click",()=>editProject(+b.closest(".project-row").dataset.index)));
}
function editProject(i){
  const p=state.projects[i];
  const title=prompt("Project title",p.title);if(title===null)return;
  const type=prompt("Project category/type",p.type);if(type===null)return;
  const url=prompt("Project URL",p.url);if(url===null)return;
  const label=prompt("Button label",p.linkLabel);if(label===null)return;
  const desc=prompt("Short description",p.description||"");if(desc===null)return;
  const status=prompt("Status: live, draft or hidden",p.status||"live");if(status===null)return;
  state.projects[i]={...p,title,type,url,linkLabel:label,description:desc,status};
  saveProjects();
}
async function saveProjects(){
  try{await api("/projects",{method:"PUT",body:{projects:state.projects}});toast("Projects saved");renderProjects();updateStats()}catch(e){toast(e.message,false)}
}
function renderContent(){
  const f=$("#contentForm");if(!f)return;
  Object.keys(state.content).forEach(k=>{if(f.elements[k])f.elements[k].value=state.content[k]});
  $("#copyPreviewTitle").textContent=state.content.headline;
  $("#copyPreviewText").textContent=state.content.description;
}
function renderMotion(){
  const m=state.motion;
  if($("#motionRange"))$("#motionRange").value=m.intensity;
  if($("#motionValue"))$("#motionValue").textContent=m.intensity+"%";
  if($("#glowSwitch"))$("#glowSwitch").checked=m.glow;
  if($("#tiltSwitch"))$("#tiltSwitch").checked=m.tilt;
  if($("#revealSwitch"))$("#revealSwitch").checked=m.reveal;
}
function updateStats(){
  $("#statProjects")&&($("#statProjects").textContent=String(state.projects.length).padStart(2,"0"));
  $("#statMotion")&&($("#statMotion").textContent=state.motion.intensity>0?"ON":"OFF");
}
function showView(name){
  const valid=["dashboard","projects","content","files","motion","settings"];
  if(!valid.includes(name))name="dashboard";
  $$(".view").forEach(v=>v.classList.toggle("active",v.id===name));
  $$(".side-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  const titles={dashboard:["OVERVIEW","Portfolio overview"],projects:["PROJECTS","Project registry"],content:["CONTENT","Content system"],files:["FILES","Asset vault"],motion:["MOTION","Motion lab"],settings:["SETTINGS","Workspace settings"]};
  const t=titles[name];$("#viewName").textContent=t[0];$("#pageTitle").textContent=t[1];
  $("#sidebar")?.classList.remove("open");
}
$$(".side-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$$("[data-view-jump]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.viewJump)));
$("#mobileMenu")?.addEventListener("click",()=>$("#sidebar")?.classList.toggle("open"));
$("#previewBtn")?.addEventListener("click",()=>window.open("../","_blank"));

$("#loginForm")?.addEventListener("submit",async e=>{
  e.preventDefault();setError("#loginError","");
  const f=new FormData(e.currentTarget);
  try{await api("/auth/login",{method:"POST",body:{username:f.get("username"),password:f.get("password")}});hideLogin();await loadData();await initFiles();renderAll();toast("Signed in")}catch(err){setError("#loginError",err.message)}
});

$("#contentForm")?.addEventListener("submit",async e=>{
  e.preventDefault();const f=new FormData(e.currentTarget);
  try{state.content=Object.fromEntries(f.entries());await api("/content",{method:"PUT",body:state.content});renderContent();toast("Content saved")}catch(err){toast(err.message,false)}
});

$("#passwordForm")?.addEventListener("submit",async e=>{
  e.preventDefault();setError("#passwordMessage","");
  const f=new FormData(e.currentTarget);
  if(f.get("newPassword")!==f.get("confirmPassword")){setError("#passwordMessage","New passwords do not match.");return}
  try{
    await api("/auth/change-password",{method:"POST",body:{currentPassword:f.get("currentPassword"),newPassword:f.get("newPassword")}});
    e.currentTarget.reset();setError("#passwordMessage","Password changed successfully.");
  }catch(err){setError("#passwordMessage",err.message)}
});
$("#logoutBtn")?.addEventListener("click",async()=>{await api("/auth/logout",{method:"POST"});location.reload()});

$("#motionRange")?.addEventListener("input",e=>{state.motion.intensity=+e.target.value;$("#motionValue").textContent=state.motion.intensity+"%"});
$("#glowSwitch")?.addEventListener("change",e=>state.motion.glow=e.target.checked);
$("#tiltSwitch")?.addEventListener("change",e=>state.motion.tilt=e.target.checked);
$("#revealSwitch")?.addEventListener("change",e=>state.motion.reveal=e.target.checked);

function exportWorkspace(){
  const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),projects:state.projects,content:state.content,motion:state.motion},null,2)],{type:"application/json"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="dhruv-portfolio-backup.json";a.click();URL.revokeObjectURL(a.href);
}
$("#exportBtn")?.addEventListener("click",exportWorkspace);$("#exportBtn2")?.addEventListener("click",exportWorkspace);

let files=[];
async function initFiles(){try{const r=await api("/files");files=r.files||[];renderFiles()}catch(e){toast(e.message,false)}}
function renderFiles(){
  const host=$("#fileGrid");if(!host)return;
  const q=($("#fileSearch")?.value||"").toLowerCase();
  const filtered=files.filter(f=>f.key.toLowerCase().includes(q));
  host.innerHTML=filtered.map(f=>`
    <article class="file-card">
      <div class="file-thumb"><span>FILE</span></div>
      <div class="file-info"><b title="${escAttr(f.key)}">${esc(f.key.split("/").pop())}</b><small>${f.size?formatBytes(f.size):"SERVER ASSET"} · <a href="/api/file/${encodeURIComponent(f.key)}" target="_blank" rel="noopener">Open ↗</a></small></div>
    </article>`).join("") || `<div class="panel" style="grid-column:1/-1"><span class="small-muted">No uploaded assets yet.</span></div>`;
  $("#statFiles")&&($("#statFiles").textContent=String(files.length).padStart(2,"0"));
}
function formatBytes(n){if(n<1024)return n+" B";if(n<1048576)return(n/1024).toFixed(1)+" KB";return(n/1048576).toFixed(1)+" MB"}
$("#fileSearch")?.addEventListener("input",renderFiles);
$("#fileInput")?.addEventListener("change",async e=>{
  const selected=[...e.target.files];if(!selected.length)return;
  try{
    for(const file of selected){
      if(file.size>5*1024*1024)throw new Error(`${file.name} is larger than 5 MB.`);
      const fd=new FormData();fd.append("file",file);
      await api("/files",{method:"POST",body:fd});
    }
    await initFiles();toast("Assets uploaded");
  }catch(err){toast(err.message,false)}
  e.target.value="";
});

boot();
