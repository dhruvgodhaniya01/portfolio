
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const header=$(".site-header"), progress=$(".scroll-progress"), glow=$(".cursor-glow");
window.addEventListener("scroll",()=>{
  const max=document.documentElement.scrollHeight-innerHeight;
  if(progress) progress.style.width=(max?scrollY/max*100:0)+"%";
  header?.classList.toggle("scrolled",scrollY>20);
},{passive:true});
if(glow && matchMedia("(pointer:fine)").matches){
  let x=0,y=0,tx=0,ty=0;
  addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY},{passive:true});
  const loop=()=>{x+=(tx-x)*.1;y+=(ty-y)*.1;glow.style.left=x+"px";glow.style.top=y+"px";requestAnimationFrame(loop)};loop();
}
const menu=$("#menu");
menu?.addEventListener("click",()=>{$(".nav-links")?.classList.toggle("open")});
$$(".nav-links a").forEach(a=>a.addEventListener("click",()=>$(".nav-links")?.classList.remove("open")));
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}}),{threshold:.1});
$$(".reveal").forEach(e=>obs.observe(e));
const motion=$("#motionToggle");
if(motion){
 const key="dhruv-motion", off=localStorage.getItem(key)==="off";
 document.body.classList.toggle("motion-off",off); motion.textContent=off?"○ Motion":"✦ Motion";
 motion.onclick=()=>{const now=!document.body.classList.contains("motion-off");document.body.classList.toggle("motion-off",!now);motion.textContent=now?"✦ Motion":"○ Motion";localStorage.setItem(key,now?"on":"off")};
}
$$(".btn,.nav-cta").forEach(b=>{if(matchMedia("(pointer:fine)").matches){b.onpointermove=e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.06}px,${(e.clientY-r.top-r.height/2)*.06}px)`};b.onpointerleave=()=>b.style.transform=""}});
