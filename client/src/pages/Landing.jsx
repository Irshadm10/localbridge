import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useMotionTemplate, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/useAuth';
import { useFooterOffset } from '../utils/useFooterOffset';

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─────────────────────────────────────────────────── */
const AVATAR_GRAD = {
  amber:'from-amber-400 to-orange-500',emerald:'from-emerald-400 to-teal-500',
  sky:'from-sky-400 to-blue-500',rose:'from-rose-400 to-pink-500',
  violet:'from-violet-400 to-purple-500',teal:'from-teal-400 to-emerald-500',
  orange:'from-orange-400 to-rose-500',pink:'from-pink-400 to-rose-500',
};
const ACTIVITY=[
  {ini:'TN',name:'Tyler N.',tone:'amber',text:'booked Interview Prep',with:'Maya Chen',time:'2m ago'},
  {ini:'PS',name:'Priya S.',tone:'emerald',text:'landed a Staff PM role',time:'1h ago',win:true},
  {ini:'LK',name:'Liam K.',tone:'sky',text:'booked Resume Review',with:'Jordan R.',time:'5m ago'},
  {ini:'AM',name:'Aisha M.',tone:'rose',text:'accepted an offer at Figma',time:'3h ago',win:true},
  {ini:'JD',name:'James D.',tone:'violet',text:'booked Career Advice',with:'Elena Voss',time:'8m ago'},
  {ini:'SR',name:'Sofia R.',tone:'teal',text:'left a 5-star review',with:'Marcus Lee',time:'11m ago'},
  {ini:'KH',name:'Kai H.',tone:'orange',text:'booked a Networking call',with:'Tom Rodriguez',time:'15m ago'},
  {ini:'NP',name:'Nina P.',tone:'pink',text:'made the switch from finance',time:'6h ago',win:true},
];
const MENTORS_ROW1=[
  {name:'Maya Chen',title:'Director of Product',co:'Linear',tags:['PM Strategy','Promotion'],rate:95,rating:4.9,sessions:86,tone:'amber',online:true},
  {name:'Jordan Reeves',title:'Ex-FAANG Recruiter',co:'Google',tags:['Interview Prep','Offers'],rate:60,rating:4.8,sessions:142,tone:'orange'},
  {name:'Elena Voss',title:'RN → UX Designer',co:'IDEO',tags:['Career Switch','Portfolio'],rate:45,rating:5.0,sessions:58,tone:'rose',online:true},
  {name:'Marcus Lee',title:'Engineering Manager',co:'Stripe',tags:['EM Path','System Design'],rate:120,rating:4.9,sessions:203,tone:'sky'},
  {name:'Dr. Aisha Park',title:'Biotech Founder',co:'Stanford',tags:['Fundraising','Science Biz'],rate:150,rating:4.7,sessions:37,tone:'violet',online:true},
  {name:'Tom Rodriguez',title:'VP of Sales',co:'Salesforce',tags:['Enterprise Sales','SDR→AE'],rate:55,rating:4.8,sessions:95,tone:'teal'},
];
const MENTORS_ROW2=[
  {name:'Sarah Kim',title:'Head of Design',co:'Airbnb',tags:['Design Systems','Leadership'],rate:85,rating:4.9,sessions:64,tone:'pink',online:true},
  {name:'Raj Patel',title:'Principal Engineer',co:'Meta',tags:['Architecture','Staff Eng'],rate:110,rating:4.8,sessions:118,tone:'emerald'},
  {name:'Camille Dubois',title:'Brand Strategist',co:'Nike',tags:['Brand','Creative Strategy'],rate:70,rating:5.0,sessions:43,tone:'rose'},
  {name:'Alex Wong',title:'Growth Lead',co:'Notion',tags:['Growth','Retention'],rate:90,rating:4.7,sessions:77,tone:'amber'},
  {name:'Diana Ferreira',title:'Data Science Manager',co:'Spotify',tags:['ML','Analytics'],rate:100,rating:4.9,sessions:52,tone:'sky'},
  {name:'Omar Hassan',title:'Startup Founder',co:'YC W23',tags:['Fundraising','0→1'],rate:130,rating:4.8,sessions:29,tone:'teal'},
];
const OUTCOMES=[
  {result:'Got the offer',metric:'+32% comp',name:'Tyler N.',role:'Senior Engineer',tone:'amber',quote:'Two sessions with a former FAANG recruiter. She rewrote my "tell me about yourself" in ten minutes. Offer came a week later.'},
  {result:'Changed industries',metric:'Banking → PM',name:'Priya S.',role:'Ex-Analyst, now PM',tone:'emerald',quote:'I was terrified to leave finance. One session with someone who made the exact same jump saved me six months of second-guessing.'},
  {result:'Got promoted',metric:'IC → Staff',name:'Jordan E.',role:'Staff Engineer',tone:'sky',quote:"Stuck at Senior for four years. My mentor called out exactly which work didn't count. Promoted in the next cycle."},
  {result:'Landed dream role',metric:'PM at Stripe',name:'Anika R.',role:'Product Manager',tone:'violet',quote:'I had 12 final rounds in my career and bombed 11. After two sessions on frameworks and positioning, I closed my dream offer.'},
];
const WHY_ROWS=[
  {label:'You get a response',dm:'~10% reply rate',coaching:'Always',bridge:'Always — mentors opt in'},
  {label:"They've done your job",dm:'Maybe',coaching:'Rarely',bridge:"Yes — that's the filter"},
  {label:'Structured session',dm:'No',coaching:'Yes',bridge:'Yes — 4 named formats'},
  {label:'Price shown upfront',dm:'—',coaching:'Often hidden',bridge:'On every profile'},
  {label:'Real unfiltered reviews',dm:'No',coaching:'Curated only',bridge:'All reviews, unfiltered'},
  {label:'Commitment',dm:'None',coaching:'Multi-session pkg',bridge:'One session at a time'},
];

/* ─── WebGL Mesh Gradient ───────────────────────────────────── */
const VERT=`attribute vec2 a;void main(){gl_Position=vec4(a,0,1);}`;
const FRAG=`precision mediump float;
uniform float t;uniform vec2 res;uniform vec2 mouse;
float h(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+34.23);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/res;uv.y=1.-uv.y;
  vec2 m=mouse/res;
  float md=length(uv-m);
  float v=n(uv*1.6+vec2(t*.07,t*.05))*.5+n(uv*3.1-vec2(t*.05,t*.08))*.28+n(uv*6.+vec2(t*.04,-t*.06))*.15;
  v=v*.5+.5+smoothstep(.4,.0,md)*.32;
  vec3 a=vec3(.03,.008,.006),b=vec3(.68,.2,.03),c=vec3(.94,.5,.07);
  vec3 col=mix(a,b,smoothstep(.22,.62,v));col=mix(col,c,smoothstep(.58,.88,v)*.42);
  float vig=1.-smoothstep(.3,1.1,length((uv-.5)*vec2(1.3,1.)));col*=vig*.9+.06;col*=.58;
  gl_FragColor=vec4(col,1.);
}`;

function WebGLBg() {
  const ref = useRef(null);
  const mouse = useRef([0,0]);
  useEffect(()=>{
    const c=ref.current;if(!c)return;
    const gl=c.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power'});
    if(!gl)return;
    const mk=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;};
    const prog=gl.createProgram();
    gl.attachShader(prog,mk(gl.VERTEX_SHADER,VERT));
    gl.attachShader(prog,mk(gl.FRAGMENT_SHADER,FRAG));
    gl.linkProgram(prog);gl.useProgram(prog);
    const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(prog,'a');gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    const uT=gl.getUniformLocation(prog,'t'),uR=gl.getUniformLocation(prog,'res'),uM=gl.getUniformLocation(prog,'mouse');
    let W=0,H=0,id;
    const resize=()=>{W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;gl.viewport(0,0,W,H);};
    resize();
    const ro=new ResizeObserver(resize);ro.observe(c);
    const onM=(e)=>{mouse.current=[e.clientX,e.clientY];};
    window.addEventListener('mousemove',onM,{passive:true});
    const draw=(now)=>{
      id=requestAnimationFrame(draw);
      gl.uniform1f(uT,now/1000);gl.uniform2f(uR,W,H);gl.uniform2f(uM,...mouse.current);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    };
    id=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(id);ro.disconnect();window.removeEventListener('mousemove',onM);gl.deleteProgram(prog);};
  },[]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{display:'block'}} />;
}

/* ─── Hooks ─────────────────────────────────────────────────── */
function useCountUp(target,duration=2200){
  const ref=useRef(null);const[val,setVal]=useState(0);const[go,setGo]=useState(false);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setGo(true);obs.disconnect();}},{threshold:0.3});
    obs.observe(el);return()=>obs.disconnect();
  },[]);
  useEffect(()=>{
    if(!go)return;let s=null;
    const raf=requestAnimationFrame(function tick(now){
      if(!s)s=now;const t=Math.min((now-s)/duration,1);const e=1-Math.pow(1-t,4);
      setVal(Math.round(target*e));if(t<1)requestAnimationFrame(tick);
    });
    return()=>cancelAnimationFrame(raf);
  },[go,target,duration]);
  return[ref,val];
}

/* ─── Magnetic Wrap ─────────────────────────────────────────── */
function Mag({children,s=0.3}){
  const r=useRef(null),f=useRef(null);
  return(
    <div ref={r}
      onMouseMove={e=>{if(f.current)cancelAnimationFrame(f.current);f.current=requestAnimationFrame(()=>{
        const el=r.current;if(!el)return;const b=el.getBoundingClientRect();
        el.style.transform=`translate(${(e.clientX-(b.left+b.width/2))*s}px,${(e.clientY-(b.top+b.height/2))*s}px)`;
      });}}
      onMouseLeave={()=>{const el=r.current;if(el)el.style.transform='';}}
      style={{transition:'transform 360ms cubic-bezier(0.2,0.9,0.32,1)',display:'inline-block'}}>
      {children}
    </div>
  );
}

/* ─── Tilt Card ─────────────────────────────────────────────── */
function Tilt({children,className='',n=8,onClick}){
  const r=useRef(null);
  const mm=useCallback(e=>{
    const el=r.current;if(!el)return;const b=el.getBoundingClientRect();
    const x=(e.clientX-b.left)/b.width,y=(e.clientY-b.top)/b.height;
    el.style.setProperty('--tx',`${(y-.5)*-n}deg`);el.style.setProperty('--ty',`${(x-.5)*n}deg`);
    el.style.setProperty('--mx',`${x*100}%`);el.style.setProperty('--my',`${y*100}%`);
  },[n]);
  const ml=useCallback(()=>{const el=r.current;if(!el)return;
    el.style.setProperty('--tx','0deg');el.style.setProperty('--ty','0deg');
  },[]);
  return(
    <div ref={r} className={`tilt-card cursor-glow ${className}`}
      style={{'--tx':'0deg','--ty':'0deg'}}
      onMouseMove={mm} onMouseLeave={ml} onClick={onClick}>
      {children}
    </div>
  );
}

/* ─── Reveal on scroll ──────────────────────────────────────── */
function Rev({children,delay=0,className=''}){
  const r=useRef(null);const[v,setV]=useState(false);
  useEffect(()=>{
    const el=r.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);obs.disconnect();}},{threshold:0.12});
    obs.observe(el);return()=>obs.disconnect();
  },[]);
  return(
    <div ref={r} className={className} style={{
      opacity:v?1:0,transform:v?'translateY(0)':'translateY(32px)',
      transition:`opacity 700ms ease ${delay}ms, transform 800ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>{children}</div>
  );
}

/* ─── Floating Dock ─────────────────────────────────────────── */
function FloatingDock(){
  const[on,setOn]=useState(false);
  const bRef=useFooterOffset(24);
  useEffect(()=>{const t=setTimeout(()=>setOn(true),800);return()=>clearTimeout(t);},[]);
  const go=id=>{if(id==='top'){window.scrollTo({top:0,behavior:'smooth'});return;}
    document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});};
  const items=[{l:'Home',id:'top'},{l:'How It Works',id:'how'},{l:'Mentors',id:'mentors'},{l:'Outcomes',id:'outcomes'},{l:'Get Started',id:'start',p:true}];
  return createPortal(
    <div ref={bRef} className="pointer-events-none fixed left-1/2 z-[9999]"
      style={{bottom:24,transform:`translateX(-50%) translateY(${on?'0':'5rem'})`,opacity:on?1:0,transition:'transform 500ms cubic-bezier(0.16,1,0.3,1),opacity 380ms ease'}}>
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.07] bg-[#0c0906]/95 px-2 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_100px_rgba(234,88,12,0.12)] backdrop-blur-2xl">
        {items.map((item,i)=>(
          <button key={i} onClick={()=>go(item.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold transition-all duration-200 ${item.p?'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_30px_rgba(234,88,12,0.5)]':'text-white/38 hover:bg-white/[0.06] hover:text-white/80'}`}>
            {item.l}
          </button>
        ))}
      </nav>
    </div>,
    document.body
  );
}

/* ─── Stat cell ─────────────────────────────────────────────── */
function StatCell({target,suffix,label,accent,decimal}){
  const raw=decimal?Math.round(target*10):target;
  const[r,v]=useCountUp(raw,2400);
  const disp=decimal?(v/10).toFixed(1):v.toLocaleString();
  return(
    <div ref={r} className="flex flex-col gap-2">
      <p className={`font-display font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r ${accent}`}
        style={{fontSize:'clamp(2.8rem,5vw,5rem)',lineHeight:1}}>
        {disp}{suffix}
      </p>
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-faint)]">{label}</p>
    </div>
  );
}

/* ─── Mentor Marquee Card ───────────────────────────────────── */
function MCard({m}){
  const r=useRef(null);
  const mm=e=>{const el=r.current;if(!el)return;const b=el.getBoundingClientRect();
    el.style.setProperty('--tx',`${((e.clientY-b.top)/b.height-.5)*-6}deg`);
    el.style.setProperty('--ty',`${((e.clientX-b.left)/b.width-.5)*6}deg`);
    el.style.setProperty('--mx',`${((e.clientX-b.left)/b.width)*100}%`);
    el.style.setProperty('--my',`${((e.clientY-b.top)/b.height)*100}%`);};
  const ml=()=>{const el=r.current;if(!el)return;el.style.setProperty('--tx','0deg');el.style.setProperty('--ty','0deg');};
  return(
    <div ref={r} onMouseMove={mm} onMouseLeave={ml}
      className="tilt-card cursor-glow inline-flex shrink-0 w-60 flex-col gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-bridge-card transition-all hover:border-orange-500/35 hover:shadow-bridge-glow">
      <div className="flex items-center gap-2.5">
        <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[11px] font-bold text-white`}>
          {m.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
          {m.online&&<span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[var(--bridge-surface)]"><span className="h-1.5 w-1.5 rounded-full bg-emerald-200"/></span>}
        </div>
        <div className="min-w-0"><p className="truncate text-[12px] font-semibold text-[var(--bridge-text)]">{m.name}</p><p className="truncate text-[10px] text-[var(--bridge-text-faint)]">{m.co}</p></div>
      </div>
      <p className="text-[11px] text-[var(--bridge-text-muted)]">{m.title}</p>
      <div className="flex flex-wrap gap-1">
        {m.tags.slice(0,2).map(t=><span key={t} className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-semibold text-orange-600 dark:text-orange-300">{t}</span>)}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-2.5">
        <span className="text-[10px] text-[var(--bridge-text-muted)]">★ {m.rating} · {m.sessions} sessions</span>
        <span className="text-[11px] font-bold text-orange-500">${m.rate}/hr</span>
      </div>
    </div>
  );
}

/* ─── App Preview Tabs ──────────────────────────────────────── */
function AppPreview(){
  const[s,setS]=useState(0);
  useEffect(()=>{const id=setInterval(()=>setS(x=>(x+1)%3),3800);return()=>clearInterval(id);},[]);
  const scenes=[
    <div key="a" className="p-5 flex flex-col gap-3">
      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-orange-400">AI Mentor Match</p>
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2.5">
        <svg className="h-3.5 w-3.5 shrink-0 text-white/28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>
        <span className="text-[11px] text-white/36">I want to become a PM at a Series B</span>
        <span className="ml-auto h-3.5 w-px animate-pulse bg-orange-400"/>
      </div>
      <div className="space-y-1.5">
        {[{ini:'MC',name:'Maya Chen',tag:'PM Strategy',match:98,tone:'amber'},{ini:'JR',name:'Jordan Reeves',tag:'Product Growth',match:94,tone:'orange'},{ini:'EV',name:'Elena Voss',tag:'Career Switch',match:91,tone:'rose'}].map((m,i)=>(
          <div key={i} className="flex items-center gap-2.5 rounded-xl bg-white/[0.035] px-3 py-2 hover:bg-white/[0.065] transition-all">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[9px] font-bold text-white`}>{m.ini}</div>
            <div className="min-w-0 flex-1"><p className="text-[11px] font-semibold text-white">{m.name}</p><p className="text-[9px] text-white/30">{m.tag}</p></div>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-12 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" style={{width:`${m.match}%`}}/></div>
              <span className="text-[10px] font-bold text-orange-400">{m.match}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>,
    <div key="b" className="p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white">MC</div>
        <div><p className="text-sm font-semibold text-white">Maya Chen</p><p className="text-[11px] text-white/38">Director of Product · Linear</p></div>
        <div className="ml-auto rounded-full bg-emerald-500/12 border border-emerald-500/18 px-2.5 py-1 text-[9px] font-bold text-emerald-400">● Available</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[['4.9 ★','Rating'],['86','Sessions'],['$95/hr','Rate']].map(([v,l])=>(
          <div key={l} className="rounded-xl bg-white/[0.04] px-2 py-2 text-center"><p className="text-sm font-bold text-white">{v}</p><p className="text-[9px] text-white/28">{l}</p></div>
        ))}
      </div>
      <div className="space-y-1.5">
        {['Career Advice','Interview Prep','Resume Review'].map(t=>(
          <div key={t} className="flex items-center gap-2 rounded-xl border border-white/[0.05] px-3 py-2 text-[11px] text-white/48 transition hover:border-orange-500/28 hover:text-white/80 cursor-pointer">
            <svg className="h-3 w-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" strokeLinecap="round"/></svg>{t}
          </div>
        ))}
      </div>
    </div>,
    <div key="c" className="p-5 flex flex-col items-center gap-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-[0_0_60px_rgba(16,185,129,0.6)]">
        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div><p className="text-base font-bold text-white">Session confirmed!</p><p className="mt-0.5 text-[11px] text-white/38">Tomorrow · 3:00 PM EST · 45 min</p></div>
      <div className="w-full rounded-2xl border border-emerald-500/16 bg-emerald-500/[0.065] p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[10px] font-bold text-white">MC</div>
          <div className="text-left"><p className="text-[11px] font-semibold text-white">Maya Chen</p><p className="text-[10px] text-white/30">Career Advice</p></div>
          <div className="ml-auto flex items-center gap-1 rounded-full bg-white/[0.07] px-2 py-1 text-[9px] text-white/45">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z" strokeLinecap="round"/></svg>Live
          </div>
        </div>
      </div>
      <div className="flex w-full gap-2">
        <div className="flex-1 rounded-xl bg-white/[0.05] py-2 text-[11px] font-medium text-white/40">Add to Calendar</div>
        <div className="flex-1 rounded-xl bg-orange-500 py-2 text-[11px] font-bold text-white shadow-[0_0_28px_rgba(234,88,12,0.55)]">Join Room</div>
      </div>
    </div>,
  ];
  return(
    <div className="bridge-shine-overlay relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0906] shadow-[0_0_120px_rgba(234,88,12,0.2),0_48px_90px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.055] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/65"/><span className="h-2.5 w-2.5 rounded-full bg-yellow-500/65"/><span className="h-2.5 w-2.5 rounded-full bg-green-500/65"/>
        <span className="ml-auto text-[9px] text-white/14">bridge.app</span>
      </div>
      <div className="flex border-b border-white/[0.055]">
        {['AI Match','Profile','Booked ✓'].map((tab,i)=>(
          <button key={i} onClick={()=>setS(i)}
            className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] transition-all ${s===i?'border-b-2 border-orange-400 text-orange-400':'text-white/20 hover:text-white/45'}`}>{tab}</button>
        ))}
      </div>
      <div key={s} style={{animation:'bAppear 320ms cubic-bezier(0.16,1,0.3,1)'}}>{scenes[s]}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING
═══════════════════════════════════════════════════════════ */
export default function Landing(){
  const{user}=useAuth();
  const[ready,setReady]=useState(false);
  const heroRef=useRef(null);
  const headRef=useRef(null);
  const[activeQ,setActiveQ]=useState(0);

  useEffect(()=>{const t=setTimeout(()=>setReady(true),60);return()=>clearTimeout(t);},[]);

  useEffect(()=>{
    const id=setInterval(()=>setActiveQ(i=>(i+1)%OUTCOMES.length),5500);
    return()=>clearInterval(id);
  },[]);

  // GSAP: stagger hero headline words on load
  useEffect(()=>{
    if(!ready||!headRef.current)return;
    const words=headRef.current.querySelectorAll('[data-w]');
    gsap.fromTo(words,
      {y:60,opacity:0,rotateX:-25},
      {y:0,opacity:1,rotateX:0,duration:1.1,ease:'power4.out',stagger:0.09,delay:0.1,transformOrigin:'0% 50%'}
    );
  },[ready]);

  // GSAP: section number counters animate on scroll
  useEffect(()=>{
    const els=document.querySelectorAll('[data-gsap-fade]');
    els.forEach(el=>{
      gsap.fromTo(el,{y:40,opacity:0},{y:0,opacity:1,duration:0.9,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 85%',once:true}});
    });
    return()=>ScrollTrigger.getAll().forEach(t=>t.kill());
  },[]);

  return(
    <div className="relative overflow-x-hidden">
      <style>{`
        @keyframes bTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes bTickerRev{from{transform:translateX(-50%)}to{transform:translateX(0)}}
        @keyframes bFloat{0%,100%{transform:translateY(0) rotate(-.4deg)}50%{transform:translateY(-13px) rotate(.4deg)}}
        @keyframes bFloatB{0%,100%{transform:translateY(0) rotate(.3deg)}50%{transform:translateY(-8px) rotate(-.5deg)}}
        @keyframes bBlob{0%,100%{border-radius:42% 58% 36% 64%/54% 44% 56% 46%}50%{border-radius:58% 42% 64% 36%/44% 58% 46% 54%}}
        @keyframes bSpin{to{transform:rotate(360deg)}}
        @keyframes bAppear{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
        @keyframes bPulse{0%{box-shadow:0 0 0 0 rgba(234,88,12,.65)}70%{box-shadow:0 0 0 16px rgba(234,88,12,0)}100%{box-shadow:0 0 0 0 rgba(234,88,12,0)}}
        @keyframes bScanLine{0%{transform:translateY(-100%);opacity:0}10%{opacity:1}90%{opacity:.8}100%{transform:translateY(110vh);opacity:0}}
        @keyframes bPortal{from{transform:rotateX(72deg) rotate(0)}to{transform:rotateX(72deg) rotate(360deg)}}
        .b-ticker{animation:bTicker 44s linear infinite}
        .b-ticker-r{animation:bTickerRev 50s linear infinite}
        .b-marq:hover .b-ticker,.b-marq:hover .b-ticker-r{animation-play-state:paused}
        .b-float{animation:bFloat 8s ease-in-out infinite}
        .b-float-b{animation:bFloatB 10.5s ease-in-out infinite}
        .b-blob{animation:bBlob 20s ease-in-out infinite}
        .b-pulse{animation:bPulse 2.2s ease-out infinite}
        .b-scan{animation:bScanLine 10s linear infinite;animation-delay:-4s}
        .b-mask-x{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)}
        [data-w]{display:inline-block;perspective:600px}
      `}</style>

      <FloatingDock/>

      {/* ══════════════════════════════════════════
          HERO — WebGL background, massive type
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen overflow-hidden" style={{backgroundColor:'#060302'}}>
        <WebGLBg/>

        {/* Scan line */}
        <div aria-hidden className="b-scan pointer-events-none absolute inset-x-0 top-0 h-[2px] opacity-70"
          style={{background:'linear-gradient(90deg,transparent 0%,rgba(234,88,12,.6) 35%,rgba(251,191,36,.55) 50%,rgba(234,88,12,.6) 65%,transparent 100%)'}}/>
        {/* Noise */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.022]"/>
        {/* Grid */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{backgroundImage:'linear-gradient(rgba(234,88,12,.042) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,.042) 1px,transparent 1px)',backgroundSize:'88px 88px'}}/>
        {/* Bottom vignette */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-60"
          style={{background:'linear-gradient(to bottom,transparent,#060302)'}}/>

        <div className="relative z-10 mx-auto max-w-7xl px-5 pt-36 pb-28 sm:px-8 lg:pt-44">
          {/* Live badge */}
          <div className={`flex justify-center lg:justify-start transition-all duration-700 ${ready?'opacity-100 translate-y-0':'opacity-0 translate-y-4'}`}>
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-5 py-2 backdrop-blur-xl">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65"/><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]"/></span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Live · 2,400+ vetted mentors</span>
            </div>
          </div>

          {/* Headline */}
          <div className="mt-10 lg:max-w-4xl" ref={headRef} style={{perspective:'800px',overflow:'hidden'}}>
            <h1 className="font-display font-black leading-[0.84] tracking-[-0.035em] text-white/88"
              style={{fontSize:'clamp(3.6rem,9.5vw,9rem)'}}>
              <span data-w className="block">Your next</span>
              <span data-w className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
                style={{filter:'drop-shadow(0 0 100px rgba(234,88,12,.75))'}}>
                career move
              </span>
              <span data-w className="block">starts with</span>
              <span data-w className="block font-editorial italic text-white/14" style={{fontSize:'0.78em'}}>one conversation.</span>
            </h1>
          </div>

          {/* Sub + CTAs */}
          <div className={`mt-10 grid lg:grid-cols-[1fr_auto] lg:items-end gap-8 transition-all duration-1000 delay-500 ${ready?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}>
            <div>
              <p className="max-w-md text-[1.05rem] leading-relaxed" style={{color:'rgba(255,255,255,.35)'}}>
                Real mentors. Real sessions. Real outcomes. Skip the cold messages — book a 1-on-1 with someone who's already walked your path.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Mag>
                  <Link to={user?'/mentors':'/register'}
                    className="b-pulse btn-sheen inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-9 py-4 text-[0.95rem] font-bold text-white shadow-[0_0_80px_rgba(234,88,12,.6)] transition-all hover:scale-[1.05] hover:shadow-[0_0_110px_rgba(234,88,12,.85)] active:scale-[0.97]">
                    Find your mentor
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </Mag>
                <Mag>
                  <Link to="/mentors"
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-8 py-4 text-[0.95rem] font-semibold backdrop-blur-sm transition-all hover:border-white/[0.18] hover:bg-white/[0.07]"
                    style={{color:'rgba(255,255,255,.48)'}}>
                    Browse mentors →
                  </Link>
                </Mag>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1">
                {['No credit card required','First session guaranteed','Cancel anytime'].map((t,i)=>(
                  <span key={i} className="flex items-center gap-2 text-[10px]" style={{color:'rgba(255,255,255,.2)'}}>
                    {i>0&&<span className="h-1 w-1 rounded-full bg-white/15"/>}{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating mentor card + chips */}
            <div className="relative hidden lg:block w-[360px] xl:w-[400px] shrink-0">
              {/* AI match chip */}
              <div className="b-float pointer-events-none absolute -left-10 -top-6 z-20">
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-[#0c0906]/96 px-4 py-3 backdrop-blur-xl shadow-[0_12px_50px_rgba(234,88,12,.22)]">
                  <span className="text-sm">🎯</span>
                  <div><p className="text-[10px] font-bold text-white">98% AI Match</p><p className="text-[9px] text-white/28">Maya Chen · PM Strategy</p></div>
                </div>
              </div>
              {/* Offer chip */}
              <div className="b-float-b pointer-events-none absolute -right-8 -top-4 z-20">
                <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/14 bg-[#0c0906]/96 px-4 py-3 backdrop-blur-xl">
                  <span className="text-sm">🎉</span>
                  <div><p className="text-[10px] font-bold text-emerald-400">Offer accepted</p><p className="text-[9px] text-white/28">+32% comp · Tyler N.</p></div>
                </div>
              </div>
              {/* Live chip */}
              <div className="b-float pointer-events-none absolute -left-12 bottom-6 z-20" style={{animationDelay:'-3s'}}>
                <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-[#0c0906]/96 px-4 py-3 backdrop-blur-xl">
                  <span className="relative flex h-2.5 w-2.5 shrink-0"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-65"/><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400"/></span>
                  <p className="text-[10px] font-bold text-white/50">3 people booking now</p>
                </div>
              </div>
              {/* Rating chip */}
              <div className="b-float-b pointer-events-none absolute -right-10 bottom-2 z-20" style={{animationDelay:'-5s'}}>
                <div className="flex items-center gap-2.5 rounded-2xl border border-amber-500/14 bg-[#0c0906]/96 px-4 py-3 backdrop-blur-xl">
                  <span className="text-sm">⭐</span>
                  <div><p className="text-[10px] font-bold text-amber-400">4.9 / 5 avg</p><p className="text-[9px] text-white/28">4,800+ sessions</p></div>
                </div>
              </div>
              {/* Glass mentor card */}
              <HeroMentorCard/>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ACTIVITY TICKER
      ══════════════════════════════════════════ */}
      <div className="b-marq relative border-y border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/35 py-2.5">
        <div className="overflow-hidden b-mask-x">
          <div className="b-ticker flex w-max gap-2.5 pr-3">
            {[...ACTIVITY,...ACTIVITY].map((a,i)=>(
              <div key={i} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)]/90 px-4 py-2 backdrop-blur-sm">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[a.tone]} text-[8px] font-bold text-white`}>{a.ini}</div>
                <span className="whitespace-nowrap text-[11px] text-[var(--bridge-text-secondary)]">
                  <span className="font-bold text-[var(--bridge-text)]">{a.name}</span> {a.text}
                  {a.with&&<> <span className="text-[var(--bridge-text-muted)]">with</span> <span className="font-bold text-[var(--bridge-text)]">{a.with}</span></>}
                </span>
                {a.win&&<span className="rounded-full border border-emerald-500/16 bg-emerald-500/9 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-300">🎉 Win</span>}
                <span className="text-[10px] text-[var(--bridge-text-faint)]">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          EDITORIAL — "Cold outreach is dead."
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{background:'radial-gradient(ellipse 50% 60% at 50% 50%,rgba(234,88,12,.05),transparent 70%)'}}/>
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
          <Rev>
            <div className="border-l-2 border-orange-500/40 pl-8">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500 mb-4">The problem</p>
              <p className="font-display font-black tracking-tight text-[var(--bridge-text)]"
                style={{fontSize:'clamp(2rem,5vw,4rem)',lineHeight:1.05}}>
                Cold outreach<br/>
                <span className="text-gradient-bridge">doesn't work.</span><br/>
                Generic coaches<br/>
                <span className="font-editorial italic text-[var(--bridge-text-muted)]" style={{fontSize:'0.92em'}}>haven't been there.</span>
              </p>
              <p className="mt-6 max-w-lg text-base text-[var(--bridge-text-muted)] leading-relaxed">
                LinkedIn DMs get a ~10% reply rate. Career coaches rarely have your specific background. You need someone who's made the exact transition you're trying to make — and will actually respond.
              </p>
            </div>
          </Rev>

          {/* Two-col before/after */}
          <div className="mt-14 grid gap-4 sm:grid-cols-2">
            <Rev delay={0}>
              <Tilt n={4} className="group relative overflow-hidden rounded-3xl border border-red-500/14 bg-[var(--bridge-surface)] p-7">
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl" style={{background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(239,68,68,.05),transparent 70%)'}}/>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-500/18 bg-red-500/7 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"/> Without Bridge
                </div>
                <div className="space-y-3">
                  {['Cold LinkedIn DMs — ~10% reply','Unverified coaches, hidden pricing','Generic advice that doesn\'t fit','Forced 3-month package lock-ins'].map((t,i)=>(
                    <div key={i} className="flex items-center gap-3 text-[13px] text-[var(--bridge-text-muted)]">
                      <svg className="h-4 w-4 shrink-0 text-red-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
                      <span className="line-through decoration-red-400/40">{t}</span>
                    </div>
                  ))}
                </div>
              </Tilt>
            </Rev>
            <Rev delay={100}>
              <Tilt n={4} className="group relative overflow-hidden rounded-3xl border border-orange-500/24 bg-[var(--bridge-surface)] p-7 shadow-bridge-glow">
                <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl" style={{background:'radial-gradient(ellipse 70% 50% at 50% 0%,rgba(234,88,12,.1),transparent 70%)'}}/>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/24 bg-orange-500/9 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                  <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-55"/><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-400"/></span> With Bridge
                </div>
                <div className="space-y-3">
                  {['AI matches in seconds — guaranteed response','Vetted pros only, rates shown upfront','Structured sessions, exact-fit expertise','One session at a time, zero lock-in'].map((t,i)=>(
                    <div key={i} className="flex items-center gap-3 text-[13px] text-[var(--bridge-text-secondary)]">
                      <svg className="h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {t}
                    </div>
                  ))}
                </div>
              </Tilt>
            </Rev>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS — dark section, huge numbers
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24"
        style={{background:'linear-gradient(180deg,var(--bridge-canvas) 0%,#0d0703 12%,#080503 100%)'}}>
        <div aria-hidden className="b-blob pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20"
          style={{background:'radial-gradient(circle,rgba(234,88,12,.45) 0%,transparent 65%)'}}/>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{backgroundImage:'linear-gradient(rgba(234,88,12,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,.04) 1px,transparent 1px)',backgroundSize:'88px 88px'}}/>
        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
          <Rev>
            <div className="mb-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">By the numbers</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                A platform people <span className="text-gradient-bridge">actually use</span>
              </h2>
            </div>
          </Rev>

          {/* Stats grid — responsive, no overlap */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-12">
            <Rev delay={0}><StatCell target={2400} suffix="+" label="Vetted mentors" accent="from-orange-500 to-amber-400"/></Rev>
            <Rev delay={80}><StatCell target={4800} suffix="+" label="Sessions booked" accent="from-amber-500 to-orange-400"/></Rev>
            <Rev delay={160}><StatCell target={4.9} suffix="/5" label="Average rating" accent="from-rose-400 to-orange-500" decimal/></Rev>
            <Rev delay={240}><StatCell target={97} suffix="%" label="Would recommend" accent="from-emerald-400 to-teal-500"/></Rev>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          APP PREVIEW — bento grid
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Rev>
            <div className="mb-14 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">See it in action</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                From goal to session<br/><span className="text-gradient-bridge">in under a minute</span>
              </h2>
            </div>
          </Rev>

          {/* Bento: large preview left, 3 steps right */}
          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
            <Rev delay={50}>
              <div className="h-full">
                <AppPreview/>
              </div>
            </Rev>
            <div className="flex flex-col gap-4">
              {[
                {n:'01',icon:'🔍',title:'Describe your goal',desc:'Plain English. Our AI ranks 2,400+ mentors by relevance to your exact situation in seconds.',accent:'from-orange-500 to-amber-400'},
                {n:'02',icon:'👤',title:'Pick your mentor',desc:'Real bios, honest reviews, exact rates — all visible before you commit. Zero surprises.',accent:'from-amber-400 to-orange-400'},
                {n:'03',icon:'📅',title:'Book and get unstuck',desc:'Real-time availability. Built-in video room. Session live in 30 seconds.',accent:'from-emerald-400 to-teal-500'},
              ].map((s,i)=>(
                <Rev key={i} delay={80+i*80}>
                  <Tilt n={4} className="group flex items-start gap-4 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-lg ring-1 ring-orange-500/14">{s.icon}</div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className={`font-display text-xs font-black text-transparent bg-clip-text bg-gradient-to-r ${s.accent} opacity-60 group-hover:opacity-100 transition-opacity`}>{s.n}</span>
                        <h3 className="text-sm font-bold text-[var(--bridge-text)]">{s.title}</h3>
                      </div>
                      <p className="mt-1 text-[12px] text-[var(--bridge-text-muted)] leading-relaxed">{s.desc}</p>
                    </div>
                  </Tilt>
                </Rev>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MENTOR MARQUEE
      ══════════════════════════════════════════ */}
      <section id="mentors" className="relative overflow-hidden py-24 bg-[var(--bridge-surface-muted)]/20">
        <Rev>
          <div className="mb-12 px-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Our mentors</p>
            <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
              Professionals who've been<br/><span className="text-gradient-bridge">where you want to go</span>
            </h2>
          </div>
        </Rev>
        <div className="b-marq">
          <div className="overflow-hidden b-mask-x">
            <div className="b-ticker flex w-max gap-4 pb-4 pr-4">
              {[...MENTORS_ROW1,...MENTORS_ROW1].map((m,i)=><MCard key={i} m={m}/>)}
            </div>
          </div>
        </div>
        <div className="b-marq mt-4">
          <div className="overflow-hidden b-mask-x">
            <div className="b-ticker-r flex w-max gap-4 pr-4">
              {[...MENTORS_ROW2,...MENTORS_ROW2].map((m,i)=><MCard key={i} m={m}/>)}
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-center px-5">
          <Mag>
            <Link to="/mentors"
              className="btn-sheen group inline-flex items-center gap-2.5 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-8 py-4 text-sm font-bold text-[var(--bridge-text)] shadow-bridge-card transition-all hover:border-orange-500/42 hover:shadow-bridge-glow">
              Browse all 2,400+ mentors
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </Mag>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section id="how" className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
        <div aria-hidden className="b-blob pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-12"
          style={{background:'radial-gradient(circle,var(--bridge-aurora-2) 0%,transparent 65%)'}}/>
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
          <Rev>
            <div className="mb-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">How it works</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Three steps.<br/><span className="text-gradient-bridge">One hour.</span> Real momentum.
              </h2>
            </div>
          </Rev>
          <div className="relative grid gap-6 sm:grid-cols-3">
            <div aria-hidden className="pointer-events-none absolute top-11 left-[calc(16.67%+3rem)] right-[calc(16.67%+3rem)] hidden h-px sm:block"
              style={{background:'linear-gradient(90deg,transparent 0%,var(--bridge-border-strong) 20%,var(--bridge-border-strong) 80%,transparent 100%)'}}/>
            {[
              {num:'01',chip:'"PM at a Series B"',icon:<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" strokeLinecap="round"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>,title:'Tell us your goal',desc:'Plain English. Our AI searches 2,400+ professionals and ranks the exact few most likely to move the needle.',accent:'from-orange-500 to-amber-400'},
              {num:'02',chip:'98% match · $60/session',icon:<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round"/></svg>,title:'Pick your mentor',desc:'Real bios, honest reviews, exact rates — all visible before you commit. No surprises.',accent:'from-amber-400 to-orange-400'},
              {num:'03',chip:'Session confirmed ✓',icon:<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,title:'Book and get unstuck',desc:'Real-time availability. Built-in video room. No Zoom links, no scheduling back-and-forth.',accent:'from-emerald-400 to-teal-500'},
            ].map((step,i)=>(
              <Rev key={i} delay={i*120}>
                <Tilt className="group relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow">
                  <div className={`font-display text-[5.5rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br ${step.accent} opacity-[0.07] transition-opacity group-hover:opacity-[0.16]`}>{step.num}</div>
                  <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/13">{step.icon}</div>
                  <h3 className="mt-4 text-base font-bold text-[var(--bridge-text)]">{step.title}</h3>
                  <p className="mt-2 text-[13px] text-[var(--bridge-text-muted)] leading-relaxed">{step.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-3 py-1 text-[9px] font-bold text-[var(--bridge-text-faint)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400"/>{step.chip}
                  </div>
                </Tilt>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS — dark, full-bleed
      ══════════════════════════════════════════ */}
      <section id="outcomes" className="relative overflow-hidden py-24"
        style={{background:'linear-gradient(180deg,var(--bridge-canvas) 0%,#160a04 8%,#0d0603 100%)'}}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{backgroundImage:'linear-gradient(rgba(234,88,12,.036) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,.036) 1px,transparent 1px)',backgroundSize:'88px 88px'}}/>
        <div aria-hidden className="b-blob pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-14"
          style={{background:'radial-gradient(circle,rgba(234,88,12,.5) 0%,transparent 65%)'}}/>
        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
          <Rev>
            <div className="mb-14 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-400">Real outcomes</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                People who <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">got unstuck</span>
              </h2>
            </div>
          </Rev>
          <div className="grid gap-4 sm:grid-cols-2">
            {OUTCOMES.map((o,i)=>(
              <Rev key={i} delay={i*70}>
                <Tilt onClick={()=>setActiveQ(i)}
                  className={`group flex flex-col gap-5 overflow-hidden rounded-3xl border p-7 shadow-bridge-card transition-all duration-500 cursor-pointer ${activeQ===i?'border-orange-500/42 bg-[var(--bridge-surface)] shadow-bridge-glow scale-[1.012]':'border-[var(--bridge-border)] bg-[var(--bridge-surface)] hover:border-orange-500/25 hover:shadow-bridge-glow'}`}>
                  <div aria-hidden className="pointer-events-none absolute -top-6 -left-2 font-editorial text-[8rem] font-black leading-none text-orange-500/[0.06] select-none">&ldquo;</div>
                  <div className="flex gap-1">{[0,1,2,3,4].map(k=><svg key={k} className="h-3.5 w-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
                  <p className="flex-1 text-sm text-[var(--bridge-text-secondary)] leading-relaxed">&ldquo;{o.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[o.tone]} text-[10px] font-bold text-white`}>
                      {o.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div><p className="text-[12px] font-bold text-[var(--bridge-text)]">{o.name}</p><p className="text-[10px] text-[var(--bridge-text-faint)]">{o.role}</p></div>
                    <div className="ml-auto rounded-full border border-emerald-500/22 bg-emerald-500/10 px-3 py-1 text-[9px] font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{o.result} · {o.metric}</div>
                  </div>
                </Tilt>
              </Rev>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {OUTCOMES.map((_,i)=>(
              <button key={i} onClick={()=>setActiveQ(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i===activeQ?'w-10 bg-orange-400':'w-2 bg-white/14 hover:bg-white/28'}`}/>
            ))}
          </div>
        </div>
      </section>

      <div aria-hidden className="pointer-events-none h-20 w-full" style={{background:'linear-gradient(to bottom,#0d0603,var(--bridge-canvas))'}}/>

      {/* ══════════════════════════════════════════
          PRINCIPLES — editorial list
      ══════════════════════════════════════════ */}
      <section className="relative py-24 bg-[var(--bridge-canvas)]">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Rev>
            <div className="mb-14">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Our principles</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                What we believe<br/><span className="text-gradient-bridge">makes this work</span>
              </h2>
            </div>
          </Rev>
          <div className="divide-y divide-[var(--bridge-border)]">
            {[
              {n:'01',title:"Only people who've done your job",desc:"Every mentor has lived the role you're targeting. No generic advice, no unverified bios."},
              {n:'02',title:'One session at a time',desc:'No packages. No subscriptions. Pay for exactly what you need, nothing more.'},
              {n:'03',title:'All reviews, unfiltered',desc:"Every review is visible — the glowing ones and the ones that save you from a bad fit."},
              {n:'04',title:'Price on every profile',desc:'Exact rate shown before you even click. No "contact us for pricing" opacity.'},
              {n:'05',title:'Sessions with a structure',desc:'Four named formats — Career Advice, Interview Prep, Resume Review, Networking.'},
              {n:'06',title:'Video built in, zero friction',desc:'Custom room auto-generated per session. No Zoom, no scheduling back-and-forth.'},
            ].map((p,i)=>(
              <Rev key={i} delay={i*55}>
                <div className="group flex items-start gap-6 py-6 transition-all hover:bg-orange-500/[0.02] -mx-4 px-4 rounded-2xl">
                  <span className="shrink-0 font-display text-[2.1rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-orange-500/35 to-amber-400/20 transition-all group-hover:from-orange-500 group-hover:to-amber-400"
                    style={{minWidth:'3rem'}}>{p.n}</span>
                  <div className="flex-1">
                    <div className="h-px bg-[var(--bridge-border)] transition-all duration-700 group-hover:bg-orange-500/28"/>
                    <h3 className="mt-3 text-base font-bold text-[var(--bridge-text)]">{p.title}</h3>
                    <p className="mt-1.5 text-sm text-[var(--bridge-text-muted)] leading-relaxed max-w-xl">{p.desc}</p>
                  </div>
                  <svg className="mt-2 h-5 w-5 shrink-0 text-[var(--bridge-border-strong)] transition-all group-hover:text-orange-500 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FEATURES — asymmetric bento
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 bg-[var(--bridge-surface-muted)]/20">
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{background:'radial-gradient(ellipse 55% 35% at 50% 0%,rgba(234,88,12,.05),transparent 68%)'}}/>
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
          <Rev>
            <div className="mb-14 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Why Bridge</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Built for <span className="text-gradient-bridge">real results</span>
              </h2>
            </div>
          </Rev>
          {/* Bento: row 1 is 2-col, row 2 is 3-col */}
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {icon:'🧠',title:'AI-powered matching',desc:'Describe your goal in plain English. Our model ranks 2,400+ mentors by relevance to your exact situation — not by keyword.',accent:'from-orange-500/12 to-amber-500/6',big:true},
                {icon:'📹',title:'Built-in video rooms',desc:'No Zoom links. Your room is auto-generated and ready the moment your session is accepted. Own your call.',accent:'from-sky-500/8 to-blue-500/4'},
              ].map((f,i)=>(
                <Rev key={i} delay={i*60}>
                  <Tilt className="group relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow">
                    <div aria-hidden className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${f.accent} opacity-0 transition-opacity group-hover:opacity-100`}/>
                    <div className="relative">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/9 text-2xl ring-1 ring-orange-500/12 transition-all group-hover:bg-orange-500/14 group-hover:ring-orange-500/25">{f.icon}</div>
                      <h3 className="mt-5 text-lg font-bold text-[var(--bridge-text)]">{f.title}</h3>
                      <p className="mt-2 text-sm text-[var(--bridge-text-muted)] leading-relaxed">{f.desc}</p>
                    </div>
                  </Tilt>
                </Rev>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {icon:'🔒',title:'Vetted professionals only',desc:'Every mentor is reviewed. Real backgrounds, real outcomes.',accent:'from-violet-500/8 to-purple-500/4'},
                {icon:'⚡',title:'One session at a time',desc:'No packages, no lock-ins. Pay for one hour, commit to nothing.',accent:'from-amber-500/12 to-orange-500/6'},
                {icon:'📆',title:'Real-time availability',desc:'Google Calendar sync. Book an actual open slot in 30 seconds.',accent:'from-teal-500/8 to-emerald-500/4'},
              ].map((f,i)=>(
                <Rev key={i} delay={60+i*55}>
                  <Tilt className="group relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/25 hover:shadow-bridge-glow">
                    <div aria-hidden className={`pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br ${f.accent} opacity-0 transition-opacity group-hover:opacity-100`}/>
                    <div className="relative">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/9 text-xl ring-1 ring-orange-500/12 transition-all group-hover:bg-orange-500/14">{f.icon}</div>
                      <h3 className="mt-4 text-base font-bold text-[var(--bridge-text)]">{f.title}</h3>
                      <p className="mt-2 text-[13px] text-[var(--bridge-text-muted)] leading-relaxed">{f.desc}</p>
                    </div>
                  </Tilt>
                </Rev>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMPARISON TABLE
      ══════════════════════════════════════════ */}
      <section className="relative py-24 bg-[var(--bridge-canvas)]">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Rev>
            <div className="mb-14 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Why not just DM on LinkedIn?</p>
              <h2 className="mt-4 font-display text-3xl font-black tracking-tight text-[var(--bridge-text)] sm:text-4xl lg:text-5xl">
                Bridge vs the alternatives
              </h2>
            </div>
          </Rev>
          <Rev delay={100}>
            <div className="overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
              <div className="grid grid-cols-4 border-b border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/30">
                <div className="px-5 py-4"/>
                {['LinkedIn DMs','Life Coaching','Bridge'].map((h,i)=>(
                  <div key={h} className={`border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[10px] font-black uppercase tracking-[0.16em] ${i===2?'text-orange-500':'text-[var(--bridge-text-muted)]'}`}>
                    {i===2?(<span className="inline-flex flex-col items-center gap-1">{h}<span className="rounded-full bg-orange-500/11 px-2 py-0.5 text-[8px] font-black text-orange-500 uppercase tracking-widest">best</span></span>):h}
                  </div>
                ))}
              </div>
              {WHY_ROWS.map((row,i)=>(
                <div key={i} className={`grid grid-cols-4 border-b border-[var(--bridge-border)]/35 last:border-0 ${i%2===0?'':'bg-[var(--bridge-surface-muted)]/14'}`}>
                  <div className="px-5 py-4 text-[12px] font-semibold text-[var(--bridge-text-secondary)]">{row.label}</div>
                  {[row.dm,row.coaching,row.bridge].map((v,j)=>(
                    <div key={j} className={`border-l border-[var(--bridge-border)]/30 px-4 py-4 text-center text-[12px] ${j===2?'font-bold text-orange-500':'text-[var(--bridge-text-muted)]'}`}>
                      {j===2&&v!=='—'?(<span className="inline-flex items-center justify-center gap-1.5"><svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>{v}</span>):v}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* canvas → dark */}
      <div aria-hidden className="pointer-events-none h-48 w-full"
        style={{background:'linear-gradient(to bottom,var(--bridge-canvas) 0%,rgba(145,68,20,.36) 38%,rgba(62,26,8,.83) 62%,#1e0d04 87%,#150803 100%)'}}/>

      {/* ══════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════ */}
      <section id="start" className="relative overflow-hidden py-40" style={{backgroundColor:'var(--bridge-hero-bg)'}}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{backgroundImage:'linear-gradient(rgba(234,88,12,.038) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,.038) 1px,transparent 1px)',backgroundSize:'88px 88px'}}/>
        <div aria-hidden className="b-blob pointer-events-none absolute left-1/2 top-1/2 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{background:'radial-gradient(circle,rgba(234,88,12,.26) 0%,rgba(234,88,12,.04) 42%,transparent 68%)'}}/>
        {/* Portal rings */}
        {[640,440].map((s,i)=>(
          <div key={i} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
            <div style={{width:s,height:s,borderRadius:'50%',border:'1px solid rgba(234,88,12,.12)',animation:`bPortal ${10+i*3}s linear infinite ${i?'reverse':''}`,boxShadow:`0 0 30px rgba(234,88,12,.08)`}}/>
          </div>
        ))}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.022]"/>
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Rev>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-orange-500/18 bg-orange-500/7 px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-55"/><span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400"/></span>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-400/75">Ready to get unstuck?</span>
            </div>
            <h2 className="font-display font-black leading-[0.88] tracking-tight text-white"
              style={{fontSize:'clamp(2.8rem,7vw,6.2rem)'}}>
              One conversation<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500"
                style={{filter:'drop-shadow(0 0 55px rgba(234,88,12,.7))'}}>
                changes everything.
              </span>
            </h2>
            <p className="mx-auto mt-7 max-w-md text-base leading-relaxed" style={{color:'rgba(255,255,255,.34)'}}>
              Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
            </p>
            <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
              <Mag>
                <Link to={user?'/mentors':'/register'}
                  className="btn-sheen b-pulse inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-11 py-5 text-base font-bold text-white shadow-[0_0_88px_rgba(234,88,12,.65)] transition hover:scale-[1.05] hover:shadow-[0_0_120px_rgba(234,88,12,.9)] active:scale-[.97]">
                  Get started for free
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </Mag>
              <Link to="/about" className="text-sm font-semibold underline underline-offset-4 transition"
                style={{color:'rgba(255,255,255,.24)'}}
                onMouseEnter={e=>e.target.style.color='rgba(255,255,255,.55)'}
                onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.24)'}>
                Learn more about Bridge
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px]" style={{color:'rgba(255,255,255,.16)'}}>
              {['No credit card required','First session guaranteed','Cancel any time'].map((t,i)=>(
                <span key={i} className="flex items-center gap-2">{i>0&&<span className="h-1 w-1 rounded-full bg-white/12"/>}{t}</span>
              ))}
            </div>
          </Rev>
        </div>
      </section>
    </div>
  );
}

/* ─── Hero Mentor Glass Card ───────────────────────────────── */
function HeroMentorCard(){
  const r=useRef(null);
  const rXMV=useMotionValue(0),rYMV=useMotionValue(0);
  const glX=useMotionValue(50),glY=useMotionValue(50);
  const cfg={stiffness:130,damping:20,mass:0.55};
  const rx=useSpring(rXMV,cfg),ry=useSpring(rYMV,cfg);
  const lx=useSpring(glX,cfg),ly=useSpring(glY,cfg);
  const bg=useMotionTemplate`radial-gradient(circle 230px at ${lx}% ${ly}%,rgba(234,88,12,.28) 0%,rgba(251,146,60,.1) 38%,transparent 62%)`;
  const mm=useCallback(e=>{
    const rect=r.current?.getBoundingClientRect();if(!rect)return;
    const x=(e.clientX-rect.left)/rect.width,y=(e.clientY-rect.top)/rect.height;
    rXMV.set((y-.5)*-30);rYMV.set((x-.5)*30);glX.set(x*100);glY.set(y*100);
  },[rXMV,rYMV,glX,glY]);
  const ml=useCallback(()=>{rXMV.set(0);rYMV.set(0);glX.set(50);glY.set(50);},[rXMV,rYMV,glX,glY]);
  return(
    <div ref={r} style={{perspective:950}} onMouseMove={mm} onMouseLeave={ml}>
      <motion.div style={{rotateX:rx,rotateY:ry,transformStyle:'preserve-3d'}}
        className="relative overflow-hidden rounded-2xl border border-white/[0.10] bg-white/[0.04] shadow-[0_40px_100px_rgba(0,0,0,.72),0_0_0_1px_rgba(255,255,255,.055)] backdrop-blur-2xl">
        <motion.div className="pointer-events-none absolute inset-0 rounded-2xl" style={{background:bg}}/>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent"/>
        <div className="bridge-shine-overlay pointer-events-none absolute inset-0 rounded-2xl"/>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-base font-bold text-white shadow-[0_6px_24px_rgba(234,88,12,.58)]">
                MC
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[rgba(8,3,1,.9)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse"/>
                </span>
              </div>
              <div><p className="text-[13px] font-bold text-white/92">Maya Chen</p><p className="text-[11px] text-white/38">Director of Product</p></div>
            </div>
            <div className="rounded-full border border-orange-500/28 bg-orange-500/14 px-3 py-1 text-[9px] font-bold text-orange-300">Linear</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {['PM Strategy','Promotion','Roadmapping','OKRs'].map(t=>(
              <span key={t} className="rounded-full border border-white/[0.07] bg-white/[0.045] px-2.5 py-0.5 text-[9px] font-medium text-white/50">{t}</span>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[['4.9 ★','Rating'],['86','Sessions'],['$95/hr','Rate']].map(([v,l])=>(
              <div key={l} className="rounded-xl border border-white/[0.055] bg-white/[0.03] px-3 py-2.5 text-center">
                <p className="text-sm font-bold text-white/88">{v}</p><p className="text-[9px] text-white/26">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-white/32 leading-relaxed">Former PM at Google → Linear. I help PMs at Series A–C nail their strategy and get promoted.</p>
          <button className="mt-5 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-[11px] font-bold text-white shadow-[0_0_36px_rgba(234,88,12,.52)] transition hover:shadow-[0_0_56px_rgba(234,88,12,.78)] hover:scale-[1.02]">
            Book a session · $95
          </button>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-500/36 to-transparent"/>
      </motion.div>
    </div>
  );
}
