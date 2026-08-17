
const fallback=[
{id:"01",title:"Tokicha",type:"CAFE SHOWCASE · CLIENT CONCEPT",url:"https://tokicha.netlify.app",case:"projects/tokicha.html",description:"A polished café showcase with menu, reviews, location and enquiry-focused sections.",tags:["HTML","CSS","JAVASCRIPT","NETLIFY"]},
{id:"02",title:"Hostel Management",type:"MANAGEMENT WEB APPLICATION",url:"https://hostelmange.netlify.app/",case:"projects/hostel-management.html",description:"A practical management application for student records, admissions, search and day-to-day hostel workflows.",tags:["HTML","CSS","JAVASCRIPT","DATA WORKFLOWS"]},
{id:"03",title:"Hotel Management",type:"MANAGEMENT + OPERATIONS",url:"https://hotelmanage1.netlify.app",case:"projects/hotel-management.html",description:"Operations-focused web software covering customer accounts, menus, purchases, passes and transactions.",tags:["HTML","CSS","JAVASCRIPT","WORKFLOWS"]},
{id:"04",title:"Hilla Restaurant Cafe",type:"RESTAURANT SHOWCASE",url:"https://hilla-restaurant-cafe.netlify.app",case:"projects/hilla-restaurant.html",description:"A restaurant showcase experience designed around menu discovery, visual presentation and customer action.",tags:["HTML","CSS","JAVASCRIPT","NETLIFY"]},
{id:"05",title:"Portfolio Hospital",type:"HEALTHCARE SHOWCASE",url:"https://portfoliohospital.netlify.app",case:"projects/portfolio-hospital.html",description:"A hospital website concept with healthcare information, doctors, services, facilities and appointment flow.",tags:["HTML","CSS","JAVASCRIPT","APPOINTMENT FLOW"]}
];
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function card(p,i){
 const img=p.title==="Tokicha"?"https://image.thum.io/get/width/1200/crop/720/noanimate/https://tokicha.netlify.app/":
 p.title==="Hostel Management"?"https://image.thum.io/get/width/1200/crop/720/noanimate/https://hostelmange.netlify.app/":
 p.title==="Hotel Management"?"https://image.thum.io/get/width/1200/crop/720/noanimate/https://hotelmanage1.netlify.app/":
 p.title==="Hilla Restaurant Cafe"?"https://image.thum.io/get/width/1200/crop/720/noanimate/https://hilla-restaurant-cafe.netlify.app/":
 "https://image.thum.io/get/width/1200/crop/720/noanimate/https://portfoliohospital.netlify.app/";
 return `<article class="project-card reveal"><a class="project-image" href="${esc(p.url||"#")}" target="_blank" rel="noopener" aria-label="Open ${esc(p.title)} live website"><span class="project-no">${esc(p.id||String(i+1).padStart(2,"0"))}</span><img src="${img}" alt="${esc(p.title)} preview" loading="lazy"></a><div class="project-body"><span class="kicker">${esc(p.type||"PROJECT")}</span><h3>${esc(p.title)}</h3><p>${esc(p.description||"A practical project built as part of Dhruv's learning journey.")}</p><div class="tags">${(p.tags||["WEB","PROJECT"]).map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div><div style="display:flex;gap:15px;align-items:center"><a class="project-link" href="${esc(p.case||p.url||"#")}">Case study ↗</a><a class="project-link muted" href="${esc(p.url||"#")}" target="_blank" rel="noopener">Live ↗</a></div></div></article>`
}
async function load(){
 let projects=fallback;
 try{const r=await fetch("/api/projects");if(r.ok){const d=await r.json();if(Array.isArray(d.projects)&&d.projects.length) projects=d.projects.map(p=>({...p,case:fallback.find(x=>x.title===p.title)?.case,tags:fallback.find(x=>x.title===p.title)?.tags||["WEB","PROJECT"]})).filter(p=>p.status!=="hidden")}}catch{}
 const host=document.querySelector("#projectRegistry");host.innerHTML=projects.map(card).join("");
 const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");o.unobserve(e.target)}}),{threshold:.1});document.querySelectorAll(".reveal").forEach(e=>o.observe(e));
}
load();
