import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '../context/useAuth';
import { useFooterOffset } from '../utils/useFooterOffset';
import CustomCursor from '../components/CustomCursor.jsx';

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
  {result:'+$70k jump',metric:'Negotiated comp',name:'Marcus W.',role:'Staff Engineer',tone:'rose',quote:"My mentor walked me through every comp negotiation lever I didn't know existed. I left $70k on the table at my last job."},
  {result:'YC W24 batch',metric:'Founded startup',name:'Lina O.',role:'Founder & CEO',tone:'teal',quote:"I needed someone who'd actually raised — not a coach. Two calls and I had a deck investors actually opened."},
];
const BRANDS=['Stripe','Linear','Figma','Notion','Vercel','Airbnb','Anthropic','Spotify','Meta','Google','OpenAI','Salesforce'];
const WHY_ROWS=[
  {label:'You get a response',dm:'~10% reply rate',coaching:'Always',bridge:'Always — mentors opt in'},
  {label:"They've done your job",dm:'Maybe',coaching:'Rarely',bridge:"Yes — that's the filter"},
  {label:'Structured session',dm:'No',coaching:'Yes',bridge:'Yes — 4 named formats'},
  {label:'Price shown upfront',dm:'—',coaching:'Often hidden',bridge:'On every profile'},
  {label:'Real unfiltered reviews',dm:'No',coaching:'Curated only',bridge:'All reviews, unfiltered'},
  {label:'Commitment',dm:'None',coaching:'Multi-session pkg',bridge:'One session at a time'},
];

/* ─── Hooks ─────────────────────────────────────────────────── */
function useCountUp(target,duration=1200){
  const ref=useRef(null);const[val,setVal]=useState(0);const[go,setGo]=useState(false);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting){setGo(true);obs.disconnect();}},{threshold:0.2,rootMargin:'50px'});
    obs.observe(el);return()=>obs.disconnect();
  },[]);
  useEffect(()=>{
    if(!go)return;let s=null;let frame=0;
    const tick=(now)=>{
      if(!s)s=now;const t=Math.min((now-s)/duration,1);const e=1-Math.pow(1-t,3);
      setVal(Math.round(target*e));
      if(t<1){frame=requestAnimationFrame(tick);}
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[go,target,duration]);
  return[ref,val];
}

/* ─── Scroll progress hook ──────────────────────────────────── */
function useScrollProgress(){
  const[p,setP]=useState(0);
  useEffect(()=>{
    const fn=()=>{const h=document.documentElement.scrollHeight-window.innerHeight;setP(h>0?Math.min(window.scrollY/h,1):0);};
    window.addEventListener('scroll',fn,{passive:true});fn();
    return()=>window.removeEventListener('scroll',fn);
  },[]);
  return p;
}

/* ─── Intro Loader — cinematic brand reveal (CSS-driven) ─────── */
function IntroLoader(){
  const[done,setDone]=useState(false);
  const[mounted,setMounted]=useState(false);

  useEffect(()=>{
    setMounted(true);
    try{
      const seen=sessionStorage.getItem('bridge_intro_seen');
      if(seen==='1'){
        setDone(true);
        return;
      }
    }catch(e){
      setDone(true);
      return;
    }
  },[]);

  useEffect(()=>{
    if(!mounted||done)return;
    const prevBody=document.body.style.overflow;
    const prevHtml=document.documentElement.style.overflow;
    document.body.style.overflow='hidden';
    document.documentElement.style.overflow='hidden';
    const finish=()=>{
      try{
        sessionStorage.setItem('bridge_intro_seen','1');
      }catch(e){}
      setDone(true);
    };
    const timer=setTimeout(finish,3800);
    const skip=()=>{clearTimeout(timer);finish();};
    window.addEventListener('keydown',skip,{once:true});
    return()=>{
      clearTimeout(timer);
      window.removeEventListener('keydown',skip);
      document.body.style.overflow=prevBody;
      document.documentElement.style.overflow=prevHtml;
    };
  },[mounted,done]);

  if(done)return null;

  const dismiss=()=>{
    try{
      sessionStorage.setItem('bridge_intro_seen','1');
    }catch(e){}
    setDone(true);
  };
  const BRIDGE=['B','R','I','D','G','E'];
  const STAGGER=[0,0.06,0.12,0.18,0.24,0.30];
  const CHROME='linear-gradient(160deg,#ffffff 0%,#fef3c7 18%,#fcd34d 35%,#fb923c 55%,#ea580c 75%,#9a3412 100%)';
  
  // Particle system
  const PARTICLES=Array.from({length:60},(_,i)=>{
    const angle=(i/60)*Math.PI*2;
    const radius=80+Math.random()*120;
    return{
      angle,
      radius,
      speed:0.5+Math.random()*0.8,
      size:2+Math.random()*3,
      delay:Math.random()*0.8,
    };
  });

  return createPortal(
    <div onClick={dismiss}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center cursor-pointer select-none overflow-hidden"
      style={{
        background:'radial-gradient(ellipse 120% 80% at 50% 50%,#1a0d08 0%,#0d0704 40%,#000 100%)',
        animation:'introOut 0.8s cubic-bezier(.55,0,.2,1) 3.2s forwards',
      }}>
      <style>{`
        @keyframes introOut{0%{opacity:1;transform:scale(1);filter:blur(0);}50%{opacity:0.6;transform:scale(1.05);filter:blur(4px);}100%{opacity:0;transform:scale(1.12);filter:blur(12px);visibility:hidden;}}
        @keyframes introStageOut{0%{opacity:1;transform:scale(1) perspective(1000px) rotateX(0deg);filter:blur(0);}100%{opacity:0;transform:scale(1.3) perspective(1000px) rotateX(15deg);filter:blur(16px);}}
        @keyframes introExitFlash{0%{opacity:0;}30%{opacity:0.6;}100%{opacity:0;}}
        @keyframes introOrbIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0) rotate(0deg);}100%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(360deg);}}
        @keyframes introOrbDrift{0%{transform:translate(-50%,-50%) translate(0,0) rotate(0deg);}25%{transform:translate(-50%,-50%) translate(4vmin,-3vmin) rotate(90deg);}50%{transform:translate(-50%,-50%) translate(-2vmin,2vmin) rotate(180deg);}75%{transform:translate(-50%,-50%) translate(3vmin,-1vmin) rotate(270deg);}100%{transform:translate(-50%,-50%) translate(0,0) rotate(360deg);}}
        @keyframes introHeroIn{0%{opacity:0;transform:scale(0.1) rotateX(90deg) rotateY(45deg) rotateZ(-30deg) translateZ(-200px);filter:blur(40px);}40%{opacity:1;transform:scale(1.2) rotateX(-10deg) rotateY(-15deg) rotateZ(10deg) translateZ(50px);filter:blur(0);}60%{transform:scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px);}100%{opacity:1;transform:scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px);filter:blur(0);}}
        @keyframes introHeroMorph{0%{opacity:1;transform:scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg);filter:blur(0);}30%{opacity:1;transform:scale(1.8) rotateX(20deg) rotateY(-20deg) rotateZ(10deg);filter:blur(2px);}60%{opacity:0.8;transform:scale(2.5) rotateX(45deg) rotateY(-45deg) rotateZ(30deg);filter:blur(8px);}100%{opacity:0;transform:scale(4) rotateX(90deg) rotateY(-90deg) rotateZ(60deg);filter:blur(24px);}}
        @keyframes introLetter3D{0%{opacity:0;transform:translate3d(var(--sx),var(--sy),-1600px) rotateX(var(--rx)) rotateY(var(--ry)) rotateZ(var(--rz)) scale(0.04);filter:blur(50px) brightness(10);}10%{opacity:1;filter:blur(18px) brightness(5);}20%{filter:blur(2px) brightness(2);}40%{transform:translate3d(calc(var(--sx)*-0.13),calc(var(--sy)*-0.10),0px) rotateX(calc(var(--rx)*0.09)) rotateY(calc(var(--ry)*0.09)) rotateZ(calc(var(--rz)*0.06)) scale(1.24);filter:blur(0) brightness(1.8);}55%{transform:translate3d(calc(var(--sx)*0.04),calc(var(--sy)*0.03),0px) rotateX(calc(var(--rx)*-0.02)) rotateY(calc(var(--ry)*-0.02)) rotateZ(0deg) scale(0.94);filter:brightness(1.05);}68%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1.06);}80%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(0.98);}91%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1.01);}100%{opacity:1;transform:translate3d(0,0,0) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1);filter:blur(0) brightness(1);}}
        @keyframes introParticle{0%{opacity:0;transform:translate(-50%,-50%) rotate(0deg) scale(0);}20%{opacity:1;transform:translate(calc(var(--px)),calc(var(--py))) rotate(180deg) scale(1);}50%{opacity:0.8;transform:translate(calc(var(--px)*1.5),calc(var(--py)*1.5)) rotate(360deg) scale(0.8);}100%{opacity:0;transform:translate(calc(var(--px)*2.5),calc(var(--py)*2.5)) rotate(720deg) scale(0);}}
        @keyframes introShockwave{0%{opacity:0;transform:scale(0.1) rotate(0deg);border-width:8px;}20%{opacity:1;transform:scale(0.5) rotate(45deg);border-width:4px;}100%{opacity:0;transform:scale(3) rotate(180deg);border-width:0px;}}
        @keyframes introFlash{0%,100%{opacity:0;}10%{opacity:0.5;}30%{opacity:0.2;}50%{opacity:0;}}
        @keyframes introScale{0%{opacity:0;transform:scaleX(0) rotateY(90deg);}100%{opacity:1;transform:scaleX(1) rotateY(0deg);}}
        @keyframes introTaglineIn{0%{opacity:0;transform:scale(0.9) translateY(30px) rotateX(-20deg);filter:blur(8px);}50%{opacity:1;filter:blur(0);}70%{transform:scale(1.02) translateY(-5px) rotateX(5deg);}100%{opacity:1;transform:scale(1) translateY(0) rotateX(0deg);filter:blur(0);}}
        @keyframes introGlitch{0%{filter:drop-shadow(-5px 0 0 rgba(255,40,40,.9)) drop-shadow(5px 0 0 rgba(0,220,255,.9)) drop-shadow(0 0 50px rgba(251,191,36,.7));}20%{filter:drop-shadow(-3px 0 0 rgba(255,40,40,.6)) drop-shadow(3px 0 0 rgba(0,220,255,.6)) drop-shadow(0 0 80px rgba(234,88,12,1));}45%{filter:drop-shadow(0 0 60px rgba(251,191,36,1)) drop-shadow(0 0 120px rgba(234,88,12,.7)) drop-shadow(0 3px 0 rgba(255,255,255,.3));}75%{filter:drop-shadow(0 0 35px rgba(251,146,60,.7)) drop-shadow(0 0 70px rgba(234,88,12,.4));}100%{filter:drop-shadow(0 0 20px rgba(234,88,12,.5)) drop-shadow(0 2px 0 rgba(255,255,255,.15));}}
        @keyframes introChromatic{0%,100%{filter:drop-shadow(0 0 0 transparent);}25%{filter:drop-shadow(-2px 0 0 rgba(255,0,0,0.5)) drop-shadow(2px 0 0 rgba(0,255,255,0.5));}50%{filter:drop-shadow(0 0 0 transparent);}75%{filter:drop-shadow(-1px 0 0 rgba(255,0,0,0.3)) drop-shadow(1px 0 0 rgba(0,255,255,0.3));}}
        @media (prefers-reduced-motion: reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important;}}
      `}</style>

      {/* Deep space background with nebula */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{
          background:'radial-gradient(ellipse 150% 100% at 30% 50%,rgba(234,88,12,0.08) 0%,transparent 50%),radial-gradient(ellipse 120% 80% at 70% 50%,rgba(251,146,60,0.06) 0%,transparent 50%)',
        }}/>

      {/* Animated gradient orbs with rotation */}
      {[
        {x:'25%',y:'30%',c:'rgba(234,88,12,.28)',s:'52vmin',d:'18s',delay:0},
        {x:'75%',y:'70%',c:'rgba(251,146,60,.22)',s:'58vmin',d:'22s',delay:0.1},
        {x:'50%',y:'50%',c:'rgba(251,191,36,.18)',s:'68vmin',d:'26s',delay:0.2},
      ].map((o,i)=>(
        <div key={i} aria-hidden className="absolute rounded-full pointer-events-none"
          style={{
            left:o.x,top:o.y,width:o.s,height:o.s,
            background:`radial-gradient(circle,${o.c} 0%,transparent 70%)`,
            filter:'blur(60px)',
            opacity:0,
            animation:`introOrbIn 1s cubic-bezier(.22,1,.36,1) ${0.08+o.delay}s forwards, introOrbDrift ${o.d} ease-in-out ${1+o.delay}s infinite`,
          }}/>
      ))}

      {/* Particle system */}
      {PARTICLES.map((p,i)=>(
        <div key={i} aria-hidden className="absolute rounded-full pointer-events-none"
          style={{
            left:'50%',top:'50%',
            width:`${p.size}px`,height:`${p.size}px`,
            background:i%3===0?'#fbbf24':i%3===1?'#fb923c':'#f97316',
            boxShadow:`0 0 ${p.size*2}px ${i%3===0?'rgba(251,191,36,.8)':i%3===1?'rgba(251,146,60,.8)':'rgba(249,115,22,.8)'}`,
            opacity:0,
            '--px':`${Math.cos(p.angle)*p.radius}px`,'--py':`${Math.sin(p.angle)*p.radius}px`,
            animation:`introParticle ${1.2+p.speed}s cubic-bezier(.22,1,.36,1) ${0.3+p.delay}s forwards`,
          }}/>
      ))}

      {/* Holographic conic gradient */}
      <div aria-hidden className="absolute inset-[-20%] pointer-events-none"
        style={{
          background:'conic-gradient(from 45deg at 50% 50%,transparent 0deg,rgba(234,88,12,.08) 60deg,transparent 120deg,rgba(251,191,36,.06) 180deg,transparent 240deg,rgba(251,146,60,.05) 300deg,transparent 360deg)',
          opacity:0,
          mixBlendMode:'screen',
          animation:'introOrbIn 1.4s ease 0.4s forwards',
        }}/>

      {/* Vignette */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{
          background:'radial-gradient(ellipse 100% 80% at 50% 50%,transparent 40%,rgba(0,0,0,.9) 100%)',
        }}/>

      {/* Transformation flash */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{
          background:'radial-gradient(circle 40vmin at 50% 50%,rgba(255,247,237,.5) 0%,rgba(251,191,36,.25) 30%,transparent 60%)',
          opacity:0,
          animation:`introFlash 0.6s cubic-bezier(.22,1,.36,1) 1.2s forwards`,
        }}/>

      {/* Exit flash */}
      <div aria-hidden className="absolute inset-0 pointer-events-none"
        style={{
          background:'radial-gradient(circle 55vmin at 50% 50%,rgba(255,247,237,.5) 0%,rgba(251,191,36,.25) 30%,transparent 65%)',
          opacity:0,
          animation:'introExitFlash 0.8s cubic-bezier(.55,0,.2,1) 3.2s forwards',
        }}/>

      {/* Center stage with 3D perspective */}
      <div className="relative z-10 flex flex-col items-center"
        style={{animation:'introStageOut 0.8s cubic-bezier(.55,0,.2,1) 3.2s forwards',willChange:'transform,opacity,filter',perspective:'1200px'}}>
        <div className="relative flex items-center justify-center" style={{width:'clamp(300px,44vw,540px)',height:'clamp(220px,30vw,340px)'}}>

          {/* Shockwave rings */}
          {[0,0.08,0.16].map((delay,i)=>(
            <div key={i} aria-hidden className="absolute rounded-full pointer-events-none"
              style={{
                width:'32%',height:'32%',
                border:`${3-i}px solid ${i===0?'rgba(251,191,36,.9)':i===1?'rgba(234,88,12,.7)':'rgba(251,146,60,.5)'}`,
                boxShadow:`0 0 ${40-i*8}px rgba(234,88,12,.5), inset 0 0 ${30-i*6}px rgba(251,191,36,.2)`,
                opacity:0,
                animation:`introShockwave ${1.1+i*0.15}s cubic-bezier(.22,1,.36,1) ${1.2+delay}s forwards`,
              }}/>
          ))}

          {/* Hero B with 3D rotation */}
          <span aria-hidden className="absolute font-display font-black leading-none pointer-events-none"
            style={{
              fontSize:'clamp(7rem,17vw,13rem)',
              background:CHROME,
              WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',
              filter:'drop-shadow(0 0 60px rgba(234,88,12,.8)) drop-shadow(0 3px 0 rgba(255,255,255,.2))',
              opacity:0,
              animation:`introHeroIn 0.95s cubic-bezier(.22,1,.36,1) 0.2s forwards, introHeroMorph 0.65s cubic-bezier(.6,0,.4,1) 1.2s forwards, introChromatic 0.3s ease 1.15s forwards`,
              willChange:'transform,opacity,filter',
            }}>B</span>

          {/* BRIDGE letters with 3D explosion — each letter unique vector */}
          <div className="absolute font-display font-black leading-none flex items-baseline"
            style={{fontSize:'clamp(3rem,7.5vw,6.2rem)',perspective:'1400px',perspectiveOrigin:'50% 50%'}}>
            {BRIDGE.map((ch,i)=>{
              // Unique 3D origin per letter — no symmetric formula
              const VECS=[
                {sx:'-400px',sy:'-260px',rx:'300deg', ry:'-180deg',rz:'150deg'},  // B
                {sx:'360px', sy:'-180px',rx:'-270deg',ry:'360deg', rz:'-90deg'},  // R
                {sx:'-60px', sy:'340px', rx:'450deg', ry:'-90deg', rz:'200deg'},  // I
                {sx:'300px', sy:'220px', rx:'-360deg',ry:'-240deg',rz:'80deg'},   // D
                {sx:'-420px',sy:'120px', rx:'180deg', ry:'300deg', rz:'-240deg'}, // G
                {sx:'280px', sy:'-300px',rx:'-420deg',ry:'-120deg',rz:'280deg'},  // E
              ];
              const v=VECS[i];
              return(
                <span key={i} style={{
                  background:CHROME,
                  WebkitBackgroundClip:'text',backgroundClip:'text',color:'transparent',
                  display:'inline-block',
                  opacity:0,
                  '--sx':v.sx,'--sy':v.sy,'--rx':v.rx,'--ry':v.ry,'--rz':v.rz,
                  animation:`introLetter3D 1.1s cubic-bezier(.22,1,.36,1) ${1.5+STAGGER[i]}s forwards, introGlitch 0.6s ease ${1.8+STAGGER[i]}s forwards`,
                  willChange:'transform,opacity,filter',
                }}>{ch}</span>
              );
            })}
          </div>
        </div>

        {/* Tagline pill */}
        <div className="mt-8 px-6 py-2.5 rounded-full"
          style={{
            background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.1)',
            backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)',
            opacity:0,
            animation:'introTaglineIn 0.7s cubic-bezier(.22,1,.36,1) 2.4s forwards',
          }}>
          <p className="text-center font-display font-semibold uppercase text-white/80"
            style={{fontSize:'clamp(0.58rem,1.1vw,0.76rem)',letterSpacing:'0.38em'}}>
            Mentorship. Networking. Outcomes.
          </p>
        </div>

        {/* Accent line */}
        <div className="mt-6 overflow-hidden" style={{height:'1.5px',width:'clamp(150px,22vw,240px)',background:'rgba(255,255,255,0.06)'}}>
          <div style={{
            height:'100%',
            background:'linear-gradient(90deg,transparent,rgba(234,88,12,.9) 30%,rgba(251,191,36,1) 50%,rgba(234,88,12,.9) 70%,transparent)',
            transformOrigin:'left',
            opacity:0,
            animation:'introScale 0.8s cubic-bezier(.22,1,.36,1) 2.55s forwards',
          }}/>
        </div>
      </div>
    </div>,
    document.body
  );
}


/* ─── Scroll Progress Bar ───────────────────────────────────── */
function ScrollProgressBar(){
  const p=useScrollProgress();
  return(
    <div aria-hidden className="fixed left-0 right-0 top-0 z-[9998] h-[2px] bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-[0_0_18px_rgba(234,88,12,.65)]"
        style={{width:`${p*100}%`,transition:'width 90ms linear'}}/>
    </div>
  );
}

/* ─── Brand Logo Strip ──────────────────────────────────────── */
function BrandStrip(){
  return(
    <div className="b-marq relative">
      <div className="overflow-hidden b-mask-x">
        <div className="b-ticker flex w-max gap-12 pr-12 items-center">
          {[...BRANDS,...BRANDS].map((b,i)=>(
            <span key={i} className="font-display text-2xl font-black uppercase tracking-tight text-[var(--bridge-text-muted)] hover:text-orange-400 transition-colors whitespace-nowrap">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Outcomes — dense bento grid ───────────────────────────── */
function OutcomesScroller(){
  return(
    <section id="outcomes" className="relative overflow-hidden py-24 bg-gradient-to-b from-[var(--bridge-canvas)] to-[var(--bridge-canvas)]">
      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <Rev>
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-accent)]">Real outcomes</p>
              <h2 className="mt-2 font-display font-black tracking-[-0.02em] text-[var(--bridge-text)]" style={{fontSize:'clamp(1.8rem,4vw,3rem)'}}>
                People who got <span className="text-gradient-bridge">unstuck</span>.
              </h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-[11px] font-bold text-[var(--bridge-text-muted)]">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-65"/><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"/></span>
              <span>97% would recommend</span>
            </div>
          </div>
        </Rev>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOMES.map((o,i)=>(
            <Rev key={i} delay={i*60}>
              <div className="group relative flex flex-col h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">{[0,1,2,3,4].map(k=><svg key={k} className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
                  <span className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-1 text-[9px] font-bold text-[var(--bridge-text-muted)] whitespace-nowrap">{o.result}</span>
                </div>
                <p className="flex-1 text-[13px] text-[var(--bridge-text-muted)] leading-relaxed">&ldquo;{o.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[var(--bridge-border)]">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[o.tone]} text-[10px] font-bold text-white`}>{o.name.split(' ').map(n=>n[0]).join('')}</div>
                  <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-[var(--bridge-text)]">{o.name}</p><p className="truncate text-[10px] text-[var(--bridge-text-faint)]">{o.role}</p></div>
                  <span className="text-[10px] font-semibold text-[var(--bridge-accent)] whitespace-nowrap">{o.metric}</span>
                </div>
              </div>
            </Rev>
          ))}
        </div>
      </div>
    </section>
  );
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
  useEffect(()=>{
    const fn=()=>{setOn(window.scrollY>window.innerHeight*0.85);};
    window.addEventListener('scroll',fn,{passive:true});fn();
    return()=>window.removeEventListener('scroll',fn);
  },[]);
  const go=id=>{if(id==='top'){window.scrollTo({top:0,behavior:'smooth'});return;}
    document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});};
  const items=[{l:'Home',id:'top'},{l:'How It Works',id:'how'},{l:'Mentors',id:'mentors'},{l:'Outcomes',id:'outcomes'},{l:'Get Started',id:'start',p:true}];
  return createPortal(
    <div ref={bRef} className="pointer-events-none fixed left-1/2 z-[9999]"
      style={{bottom:24,transform:`translateX(-50%) translateY(${on?'0':'5rem'})`,opacity:on?1:0,transition:'transform 500ms cubic-bezier(0.16,1,0.3,1),opacity 380ms ease'}}>
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.07] bg-[#0c0906]/95 px-2 py-2 shadow-[0_24px_80px_rgba(0,0,0,0.85),0_0_100px_rgba(234,88,12,0.12)] backdrop-blur-2xl">
        {items.map((item,i)=>(
          <button key={i} onClick={()=>go(item.id)} data-cursor="hover"
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
  const[r,v]=useCountUp(raw,1200);
  const disp=decimal?(v/10).toFixed(1):v.toLocaleString();
  return(
    <div ref={r} className="flex flex-col gap-2">
      <p className={`font-display font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r ${accent}`}
        style={{fontSize:'clamp(2.2rem,4vw,4rem)',lineHeight:1}}>
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
    <div ref={r} onMouseMove={mm} onMouseLeave={ml} data-cursor="View"
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

/* ═══════════════════════════════════════════════════════════
   LANDING
═══════════════════════════════════════════════════════════ */
export default function Landing(){
  const{user}=useAuth();
  const[ready,setReady]=useState(false);
  const heroRef=useRef(null);
  const headRef=useRef(null);
  const[isDark,setIsDark]=useState(()=>typeof window!=='undefined'&&document.documentElement.classList.contains('theme-dark'));

  useEffect(()=>{
    const check=()=>setIsDark(document.documentElement.classList.contains('theme-dark'));
    check();
    const mo=new MutationObserver(check);
    mo.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
    return()=>mo.disconnect();
  },[]);

  useEffect(()=>{const t=setTimeout(()=>setReady(true),60);return()=>clearTimeout(t);},[]);

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
        [data-w]{display:block;perspective:600px}
        @keyframes bShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes bPulseFlow{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
        .b-pulse-flow{animation:bPulseFlow 3.5s cubic-bezier(.45,.05,.55,.95) infinite}
        .shimmer-text{background:linear-gradient(90deg,rgba(234,88,12,.5) 0%,rgba(255,255,255,.95) 25%,rgba(251,191,36,.95) 50%,rgba(255,255,255,.95) 75%,rgba(234,88,12,.5) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:bShimmer 4.5s linear infinite}
        @media (prefers-reduced-motion: reduce){.b-ticker,.b-ticker-r,.b-float,.b-float-b,.b-blob,.b-pulse,.b-scan,.shimmer-text{animation:none!important}}
      `}</style>

      <CustomCursor/>
      <IntroLoader/>
      <ScrollProgressBar/>
      <FloatingDock/>

      {/* ══════════════════════════════════════════
          BRAND TRUST STRIP — above hero
      ══════════════════════════════════════════ */}
      <section className="relative border-b border-[var(--bridge-border)] bg-[var(--bridge-canvas)] py-4">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="mb-3 text-center text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-text-muted)]">
            Mentors from the world's best companies
          </p>
          <BrandStrip/>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HERO — Animated mesh gradient background
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative flex flex-col overflow-hidden min-h-[90vh]">
        {/* Animated mesh gradient background */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {/* Base warm gradient */}
          <div className={`absolute inset-0 ${isDark?'bg-gradient-to-br from-[#0c0906] via-[#111009] to-[#070604]':'bg-gradient-to-br from-stone-50 via-orange-50/60 to-amber-50/40'}`}/>
          
          {/* Static gradient orbs - performance optimized */}
          <div className={`absolute top-[10%] left-[10%] w-[400px] h-[400px] rounded-full blur-[60px] opacity-60 ${isDark?'bg-gradient-to-br from-orange-500/12 to-amber-500/8':'bg-gradient-to-br from-orange-400/20 to-amber-300/15'}`}/>
          <div className={`absolute top-[30%] right-[5%] w-[300px] h-[300px] rounded-full blur-[50px] opacity-50 ${isDark?'bg-gradient-to-br from-amber-500/10 to-orange-500/6':'bg-gradient-to-br from-amber-400/15 to-orange-300/10'}`}/>
          
          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`}}/>        </div>
        
        {/* Gradient fade at bottom */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--bridge-canvas)] to-transparent z-[1]"/>

        {/* Top utility bar: live badge + 5-star rating */}
        <div className="relative z-10 mx-auto max-w-7xl px-5 pt-4 sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className={`inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5 backdrop-blur-xl transition-all duration-700 ${isDark?'border-white/[0.08] bg-white/[0.03]':'border-[var(--bridge-border)] bg-[var(--bridge-surface)]'} ${ready?'opacity-100 translate-y-0':'opacity-0 -translate-y-4'}`}>
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65"/><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.9)]"/></span>
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark?'text-white/45':'text-[var(--bridge-text-muted)]'}`}>Live · 2,400+ vetted</span>
            </div>
            <div className={`hidden md:flex items-center gap-3 transition-all duration-700 delay-200 ${ready?'opacity-100 translate-y-0':'opacity-0 -translate-y-4'}`}>
              <div className="flex items-center gap-1.5">{[0,1,2,3,4].map(i=><svg key={i} className="h-3 w-3 text-amber-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
              <span className={`text-[11px] font-semibold ${isDark?'text-white/55':'text-[var(--bridge-text-secondary)]'}`}><span className={`font-bold ${isDark?'text-white/85':'text-[var(--bridge-text)]'}`}>4.9</span> · 4,800+ sessions</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex max-w-6xl flex-1 flex-col justify-start px-5 pt-8 pb-8 sm:px-8 lg:pb-12">
          {/* Headline — bold, statement-sized */}
          <div ref={headRef} style={{perspective:'1000px',overflow:'hidden'}}>
            <h1 className={`font-display font-black leading-[0.92] tracking-[-0.03em] text-center ${isDark?'text-white/75':'text-[var(--bridge-text)]'}`}
              style={{fontSize:'clamp(3rem, min(8vw, 8rem), 8rem)'}}>
              <span data-w>Your next</span>
              <span data-w className={isDark?'shimmer-text':'text-gradient-bridge'}
                style={isDark?{filter:'drop-shadow(0 0 80px rgba(234,88,12,.6))'}:{}}>
                career move
              </span>
              <span data-w>starts with</span>
              <span data-w className={`font-editorial italic ${isDark?'text-white/22':'text-[var(--bridge-text-faint)]'}`} style={{fontSize:'0.78em'}}>one conversation.</span>
            </h1>
          </div>

          {/* Description + CTAs — centered below headline */}
          <div className={`mt-6 flex flex-col items-center text-center transition-all duration-1000 delay-500 sm:mt-8 lg:mt-10 ${ready?'opacity-100 translate-y-0':'opacity-0 translate-y-6'}`}>
              <p className="max-w-xl text-[0.95rem] leading-relaxed text-[var(--bridge-text-muted)] sm:text-[1.05rem]">
              Real mentors. Real sessions. Real outcomes. Skip the cold messages — book a 1-on-1 with someone who's already walked your path.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
              <Mag>
                <Link to={user?'/mentors':'/register'} data-cursor="Start"
                  className="b-pulse btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-[0.9rem] font-bold text-white shadow-[0_0_40px_rgba(234,88,12,.45)] transition-all hover:scale-[1.05] hover:shadow-[0_0_70px_rgba(234,88,12,.7)] active:scale-[0.97] sm:gap-3 sm:px-9 sm:py-4 sm:text-[0.95rem]">
                  Find your mentor
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </Mag>
              <Mag>
                <Link to="/mentors" data-cursor="Browse"
                  className={`inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[0.9rem] font-semibold transition-all sm:px-8 sm:py-4 sm:text-[0.95rem] ${isDark?'border-white/[0.10] bg-white/[0.04] hover:border-white/[0.18] hover:bg-white/[0.07]':'border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] hover:border-orange-500/40 hover:shadow-bridge-card'}`}
                  style={{color:isDark?'rgba(255,255,255,.55)':'var(--bridge-text)'}}>
                  Browse mentors →
                </Link>
              </Mag>
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-1">
              {['No credit card required','First session guaranteed','Cancel anytime'].map((t,i)=>(
                <span key={i} className="flex items-center gap-2 text-[10px] text-[var(--bridge-text-faint)]">
                  {i>0&&<span className="h-1 w-1 rounded-full bg-[var(--bridge-border-strong)]"/>}{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS — cinematic bento with hero stat
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-28 bg-gradient-to-b from-[var(--bridge-canvas)] via-orange-50/10 to-[var(--bridge-canvas)]">
        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
          <Rev>
            <div className="mb-12 flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[var(--bridge-accent)]">By the numbers</p>
                <h2 className="mt-2 font-display text-2xl font-black tracking-tight text-[var(--bridge-text)] sm:text-3xl md:text-4xl lg:text-5xl">
                  A platform people <span className="text-gradient-bridge">actually use</span>
                </h2>
              </div>
              <p className="max-w-xs text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">No vanity metrics. Just signal: people show up, book again, and recommend.</p>
            </div>
          </Rev>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:auto-rows-[176px]">
            <Rev delay={0} className="col-span-2 lg:row-span-2">
              <Tilt n={4} className="group relative h-full overflow-hidden rounded-3xl border border-orange-500/22 bg-[var(--bridge-surface)] p-7 sm:p-9 shadow-bridge-glow">
                <div aria-hidden className="pointer-events-none absolute inset-0" style={{background:'radial-gradient(ellipse 60% 80% at 100% 100%,rgba(234,88,12,.08),transparent 70%)'}}/>
                <div className="relative flex h-full flex-col justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-55"/><span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400"/></span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--bridge-accent)]">Mentor network</p>
                  </div>
                  <StatCell target={2400} suffix="+" label="Vetted mentors across 60+ industries" accent="from-orange-500 to-amber-400"/>
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">{['MC','JR','EV','MK'].map((i,k)=>(<div key={i} className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--bridge-surface)] bg-gradient-to-br ${['from-amber-400 to-orange-500','from-orange-400 to-rose-500','from-rose-400 to-pink-500','from-emerald-400 to-teal-500'][k]} text-[9px] font-bold text-white`}>{i}</div>))}</div>
                    <p className="text-[11px] text-[var(--bridge-text-muted)]"><span className="font-bold text-[var(--bridge-text)]">12 new</span> joined this week</p>
                  </div>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={120}>
              <Tilt n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
                <div className="relative flex h-full flex-col justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-muted)]">Total bookings</p>
                  <StatCell target={4800} suffix="+" label="Sessions booked" accent="from-orange-500 to-amber-400"/>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={200}>
              <Tilt n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center gap-1">{[0,1,2,3,4].map(i=><svg key={i} className="h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}</div>
                  <StatCell target={4.9} suffix="/5" label="Average rating" accent="from-orange-500 to-amber-400" decimal/>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={280}>
              <Tilt n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
                <div className="relative flex h-full flex-col justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-muted)]">Recommend</p>
                  <StatCell target={97} suffix="%" label="Would recommend" accent="from-orange-500 to-amber-400"/>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={360}>
              <Tilt n={3} className="relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow">
                <div className="relative flex h-full flex-col justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-muted)]">Response time</p>
                  <StatCell target={11} suffix=" min" label="Avg time to first reply" accent="from-orange-500 to-amber-400"/>
                </div>
              </Tilt>
            </Rev>
          </div>

          <Rev delay={420}>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-5 py-5 sm:grid-cols-4 sm:gap-6 sm:px-8">
              {[{k:'$2.1M+',v:'in offer increases unlocked'},{k:'47',v:'industries covered'},{k:'92%',v:'rebook within 30 days'},{k:'24/7',v:'global mentor coverage'}].map((s,i)=>(
                <div key={i} className="flex flex-col gap-1 border-b border-[var(--bridge-border)] pb-3 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-3 last:border-0">
                  <p className="font-display text-2xl font-black tabular-nums text-[var(--bridge-text)] sm:text-3xl">{s.k}</p>
                  <p className="text-[11px] text-[var(--bridge-text-muted)] leading-tight">{s.v}</p>
                </div>
              ))}
            </div>
          </Rev>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MENTOR MARQUEE
      ══════════════════════════════════════════ */}
      <section id="mentors" className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
        <Rev>
          <div className="mb-12 px-5 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Our mentors</p>
            <h2 className="mt-4 font-display text-2xl font-black tracking-tight text-[var(--bridge-text)] sm:text-3xl md:text-4xl lg:text-5xl">
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
            <Link to="/mentors" data-cursor="Browse"
              className="btn-sheen group inline-flex items-center gap-2.5 rounded-full border border-[var(--bridge-border-strong)] bg-[var(--bridge-surface)] px-8 py-4 text-sm font-bold text-[var(--bridge-text)] shadow-bridge-card transition-all hover:border-orange-500/42 hover:shadow-bridge-glow">
              Browse all 2,400+ mentors
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
          </Mag>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS — cinematic timeline
      ══════════════════════════════════════════ */}
      <section id="how" className="relative overflow-hidden py-28 bg-[var(--bridge-canvas)]">
        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
          <Rev>
            <div className="mb-16 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">How it works</p>
                <h2 className="mt-3 font-display font-black leading-[0.96] tracking-[-0.025em] text-[var(--bridge-text)]" style={{fontSize:'clamp(2rem, min(5vw, 4.5rem), 4.5rem)'}}>
                  Three steps.<br/><span className="text-gradient-bridge">One hour.</span> Real momentum.
                </h2>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-300">
                <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65"/><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"/></span>
                Avg. time-to-session: <span className="font-black">53 sec</span>
              </div>
            </div>
          </Rev>

          <div className="relative grid gap-5 sm:grid-cols-3">
            {/* Animated flow line connecting all steps */}
            <div aria-hidden className="pointer-events-none absolute top-[110px] left-[16%] right-[16%] hidden h-[2px] sm:block overflow-hidden rounded-full">
              <div className="absolute inset-0" style={{background:'linear-gradient(90deg,transparent 0%,rgba(234,88,12,.18) 18%,rgba(234,88,12,.18) 82%,transparent 100%)'}}/>
              <div className="absolute inset-y-0 w-1/3 b-pulse-flow" style={{background:'linear-gradient(90deg,transparent 0%,rgba(234,88,12,.85) 50%,transparent 100%)'}}/>
            </div>
            {[
              {num:'01',chip:'"PM at a Series B"',time:'10 sec',icon:<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" strokeLinecap="round"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/></svg>,title:'Tell us your goal',desc:'Plain English. Our AI searches 2,400+ professionals and ranks the exact few most likely to move the needle.',accent:'from-orange-500 to-amber-400',ring:'ring-orange-500/22'},
              {num:'02',chip:'98% match · $60/session',time:'30 sec',icon:<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round"/></svg>,title:'Pick your mentor',desc:'Real bios, honest reviews, exact rates — all visible before you commit. No surprises.',accent:'from-amber-400 to-orange-400',ring:'ring-amber-500/22'},
              {num:'03',chip:'Session confirmed ✓',time:'13 sec',icon:<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round"/><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/></svg>,title:'Book and get unstuck',desc:'Real-time availability. Built-in video room. No Zoom links, no scheduling back-and-forth.',accent:'from-emerald-400 to-teal-500',ring:'ring-emerald-500/22'},
            ].map((step,i)=>(
              <Rev key={i} delay={i*140}>
                <Tilt n={5} className="group relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-7 shadow-bridge-card hover:border-orange-500/30 hover:shadow-bridge-glow transition-all">
                  <div aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" style={{background:`radial-gradient(ellipse 70% 50% at 50% 0%,rgba(234,88,12,.06),transparent 70%)`}}/>
                  <div className={`pointer-events-none absolute -top-2 -right-2 font-display text-[8.5rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br ${step.accent} opacity-[0.07] transition-all duration-700 group-hover:opacity-[0.18] group-hover:scale-110`}>{step.num}</div>
                  <div className="relative">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${step.accent} text-white shadow-[0_8px_28px_rgba(234,88,12,.32)] ring-2 ${step.ring}`}>{step.icon}</div>
                    <div className="mt-5 flex items-baseline gap-2">
                      <span className={`font-display text-xs font-black text-transparent bg-clip-text bg-gradient-to-r ${step.accent}`}>{step.num}</span>
                      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--bridge-text-faint)]">• {step.time}</span>
                    </div>
                    <h3 className="mt-2 text-lg font-bold tracking-tight text-[var(--bridge-text)]">{step.title}</h3>
                    <p className="mt-2 text-[13px] text-[var(--bridge-text-muted)] leading-relaxed">{step.desc}</p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/60 px-3 py-1.5 text-[10px] font-bold text-[var(--bridge-text-secondary)]">
                      <span className={`h-1.5 w-1.5 rounded-full bg-gradient-to-br ${step.accent}`}/>{step.chip}
                    </div>
                  </div>
                </Tilt>
              </Rev>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS — horizontal cinematic scroller
      ══════════════════════════════════════════ */}
      <OutcomesScroller/>

      {/* ══════════════════════════════════════════
          MANIFESTO — dense bento (replaces principles + features)
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
        <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
          <Rev>
            <div className="mb-12 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Why Bridge works</p>
                <h2 className="mt-3 font-display font-black leading-[1.02] tracking-tight text-[var(--bridge-text)]" style={{fontSize:'clamp(1.75rem, min(4.5vw, 3.5rem), 3.5rem)'}}>
                  Six promises.<br/><span className="text-gradient-bridge">Zero exceptions.</span>
                </h2>
              </div>
              <p className="max-w-xs text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">Built around the things career platforms keep getting wrong — because we lived through them too.</p>
            </div>
          </Rev>

          {/* Featured promise — full width */}
          <Rev delay={0}>
            <Tilt n={3} className="group relative overflow-hidden rounded-3xl border border-orange-500/22 bg-[var(--bridge-surface)] p-7 sm:p-9 shadow-bridge-glow mb-4">
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{background:'radial-gradient(ellipse 50% 70% at 100% 0%,rgba(234,88,12,.08),transparent 70%)'}}/>
              <div className="relative grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/22 bg-orange-500/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[var(--bridge-accent)] mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400"/> The filter
                  </div>
                  <h3 className="font-display text-2xl font-black leading-tight text-[var(--bridge-text)] sm:text-3xl">
                    Only people who've <span className="text-gradient-bridge">done your job</span>.
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--bridge-text-muted)]">Every mentor has lived the exact role you're targeting. We filter on outcome, not credentials. No generic coaches, no unverified bios.</p>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:max-w-[220px]">
                  {['PMs at Series B+','EMs at hyperscalers','RNs → UX','VPs of Sales','Founders post-YC','Top studios'].map(t=>(
                    <span key={t} className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--bridge-text-muted)]">{t}</span>
                  ))}
                </div>
              </div>
            </Tilt>
          </Rev>

          {/* 5 supporting cards — clean uniform grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Rev delay={80}>
              <Tilt n={3} className="group relative h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">⚡</div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--bridge-text)]">One session at a time</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">No packages, no lock-ins. Pay for exactly what you need.</p>
                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-[var(--bridge-text-faint)]">
                      <span className="line-through opacity-50">3-month pkg</span>
                      <svg className="h-3 w-3 text-[var(--bridge-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      <span className="text-[var(--bridge-accent)]">1 hour</span>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={140}>
              <Tilt n={3} className="group relative h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">💵</div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--bridge-text)]">Price on every profile</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">No "contact us for pricing" opacity. Rates are front and center.</p>
                  </div>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={200}>
              <Tilt n={3} className="group relative h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">💬</div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--bridge-text)]">Unfiltered reviews</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">All reviews published — good and critical. No curation.</p>
                  </div>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={260}>
              <Tilt n={3} className="group relative h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">🎥</div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--bridge-text)]">Built-in video, zero friction</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">Custom room auto-generated per session. No Zoom links needed.</p>
                  </div>
                </div>
              </Tilt>
            </Rev>
            <Rev delay={320} className="sm:col-span-1 lg:col-span-2">
              <Tilt n={3} className="group relative h-full overflow-hidden rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-bridge-card hover:border-orange-500/28 hover:shadow-bridge-glow transition-all">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bridge-surface-muted)] text-xl ring-1 ring-[var(--bridge-border)]">🎯</div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--bridge-text)]">Sessions with a structure</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">Four named formats so you walk in knowing what you'll walk out with.</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {['Career Advice','Interview Prep','Resume Review','Networking'].map(t=>(
                        <span key={t} className="rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)] px-2.5 py-0.5 text-[10px] font-semibold text-[var(--bridge-text-muted)]">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </Tilt>
            </Rev>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COMPARISON — Bridge column dominance
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden py-24 bg-[var(--bridge-canvas)]">
        <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
          <Rev>
            <div className="mb-12 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-orange-500">Why not just DM on LinkedIn?</p>
                <h2 className="mt-3 font-display font-black leading-[1] tracking-[-0.025em] text-[var(--bridge-text)]" style={{fontSize:'clamp(1.85rem, min(4.8vw, 3.8rem), 3.8rem)'}}>
                  Bridge vs<br/><span className="text-gradient-bridge">the alternatives</span>
                </h2>
              </div>
              <p className="max-w-xs text-[12px] leading-relaxed text-[var(--bridge-text-muted)]">Side-by-side, decided in a minute. The same six questions you'd ask any platform — just answered honestly.</p>
            </div>
          </Rev>
          <Rev delay={120}>
            <div className="relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] shadow-bridge-card">
              {/* Bridge column subtle glow background */}
              <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-1/4 hidden sm:block" style={{background:'linear-gradient(180deg,rgba(234,88,12,.05),rgba(234,88,12,.02) 50%,rgba(234,88,12,.06))'}}/>
              {/* Header */}
              <div className="relative grid grid-cols-4 border-b-2 border-[var(--bridge-border)] bg-[var(--bridge-surface-muted)]/40">
                <div className="px-5 py-5"><p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--bridge-text-faint)]">Compare on</p></div>
                {[{l:'LinkedIn DMs',sub:'Cold outreach'},{l:'Life Coaching',sub:'Generic advice'},{l:'Bridge',sub:'Done-it mentors',best:true}].map((h,i)=>(
                  <div key={h.l} className={`border-l border-[var(--bridge-border)] px-4 py-5 text-center ${h.best?'bg-orange-500/[0.04]':''}`}>
                    {h.best?(
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-black text-orange-500 tracking-tight">{h.l}</span>
                          <span className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2 py-0.5 text-[8px] font-black text-white uppercase tracking-widest shadow-[0_0_18px_rgba(234,88,12,.45)]">Best</span>
                        </div>
                        <span className="text-[10px] font-semibold text-orange-400/80">{h.sub}</span>
                      </div>
                    ):(
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[12px] font-bold text-[var(--bridge-text-muted)] tracking-tight">{h.l}</span>
                        <span className="text-[9px] text-[var(--bridge-text-faint)]">{h.sub}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {WHY_ROWS.map((row,i)=>(
                <div key={i} className={`relative grid grid-cols-4 border-b border-[var(--bridge-border)]/35 last:border-0 transition-colors hover:bg-[var(--bridge-surface-muted)]/20 ${i%2===0?'':'bg-[var(--bridge-surface-muted)]/14'}`}>
                  <div className="px-5 py-5 text-[13px] font-bold text-[var(--bridge-text)] flex items-center">{row.label}</div>
                  {[{v:row.dm,k:'dm'},{v:row.coaching,k:'co'},{v:row.bridge,k:'br',best:true}].map((cell,j)=>(
                    <div key={cell.k} className={`relative border-l border-[var(--bridge-border)]/30 px-4 py-5 text-center text-[12.5px] transition-all ${cell.best?'font-bold text-orange-600 dark:text-orange-400':'text-[var(--bridge-text-muted)]'}`}>
                      {cell.best&&cell.v!=='—'?(
                        <span className="inline-flex items-center justify-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
                            <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          </span>
                          {cell.v}
                        </span>
                      ):(
                        <span className="flex items-center justify-center gap-2">
                          {cell.v!=='—'&&cell.v!=='No'&&cell.v!=='None'&&!cell.v.startsWith('~')?(
                            <span className="h-1 w-1 rounded-full bg-[var(--bridge-text-faint)]"/>
                          ):(<svg className="h-3 w-3 text-red-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>)}
                          {cell.v}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              {/* Footer summary */}
              <div className="relative grid grid-cols-4 border-t-2 border-[var(--bridge-border)] bg-orange-500/[0.04]">
                <div className="px-5 py-4 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--bridge-text-faint)]">Summary</div>
                <div className="border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[11px] font-semibold text-red-400/80">High effort · low signal</div>
                <div className="border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[11px] font-semibold text-amber-500/80">Generic · expensive</div>
                <div className="border-l border-[var(--bridge-border)] px-4 py-4 text-center text-[11px] font-black text-orange-500">Targeted · transparent</div>
              </div>
            </div>
          </Rev>
        </div>
      </section>

      {/* canvas → dark */}
      <div aria-hidden className="pointer-events-none h-32 w-full bg-gradient-to-b from-[var(--bridge-canvas)] to-[var(--bridge-hero-bg)]"/>

      {/* ══════════════════════════════════════════
          FINAL CTA — cinematic kinetic finale
      ══════════════════════════════════════════ */}
      <section id="start" className="relative overflow-hidden py-24 sm:py-32 lg:py-40" style={{backgroundColor:'var(--bridge-hero-bg)'}}>
        <div aria-hidden className="pointer-events-none absolute inset-0"
          style={{backgroundImage:'linear-gradient(rgba(234,88,12,.038) 1px,transparent 1px),linear-gradient(90deg,rgba(234,88,12,.038) 1px,transparent 1px)',backgroundSize:'88px 88px'}}/>
        <div aria-hidden className="b-blob pointer-events-none absolute left-1/2 top-1/2 h-[960px] w-[960px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{background:'radial-gradient(circle,rgba(234,88,12,.3) 0%,rgba(234,88,12,.05) 42%,transparent 68%)'}}/>
        {/* Concentric portal rings — cinematic depth */}
        {[820,640,460,300].map((s,i)=>(
          <div key={i} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:block">
            <div style={{width:s,height:s,borderRadius:'50%',border:`1px solid rgba(234,88,12,${0.16-i*0.025})`,animation:`bPortal ${12+i*3}s linear infinite ${i%2?'reverse':''}`,boxShadow:`0 0 ${30+i*8}px rgba(234,88,12,${0.1-i*0.018})`}}/>
          </div>
        ))}
        {/* Floating ember dots */}
        {[[12,18,1],[78,32,2],[24,72,1.5],[88,68,1.2],[52,12,1.8],[66,84,1.3]].map(([x,y,d],i)=>(
          <span key={i} aria-hidden className="b-float pointer-events-none absolute hidden lg:block" style={{left:`${x}%`,top:`${y}%`,animationDelay:`-${d}s`}}>
            <span className="flex h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_18px_rgba(234,88,12,.85)]"/>
          </span>
        ))}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-bridge-noise opacity-[0.022]"/>
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Rev>
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-orange-500/22 bg-orange-500/8 px-5 py-2 backdrop-blur-sm">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-55"/><span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400"/></span>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-400/85">Ready to get unstuck?</span>
            </div>
            <h2 className="font-display font-black leading-[0.86] tracking-[-0.035em] text-white"
              style={{fontSize:'clamp(2.2rem, min(6.5vw, 5.5rem), 5.5rem)'}}>
              One conversation<br/>
              <span className="shimmer-text" style={{filter:'drop-shadow(0 0 55px rgba(234,88,12,.7))'}}>
                changes everything.
              </span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed sm:mt-7 sm:text-base" style={{color:'rgba(255,255,255,.42)'}}>
              Stop spinning. Book a session with someone who's walked the exact path you're on — and made it through.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-11 sm:gap-4">
              <Mag>
                <Link to={user?'/mentors':'/register'} data-cursor="Start"
                  className="btn-sheen b-pulse inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-bold text-white shadow-[0_0_88px_rgba(234,88,12,.65)] transition hover:scale-[1.05] hover:shadow-[0_0_120px_rgba(234,88,12,.9)] active:scale-[.97] sm:gap-3 sm:px-11 sm:py-5 sm:text-base">
                  Get started for free
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </Mag>
              <Mag>
                <Link to="/about" data-cursor="hover"
                  className="inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.04] px-6 py-4 text-sm font-semibold backdrop-blur-sm transition-all hover:border-white/[0.22] hover:bg-white/[0.08] sm:px-7 sm:py-5"
                  style={{color:'rgba(255,255,255,.65)'}}>
                  Learn more
                  <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
              </Mag>
            </div>
            {/* Glassy guarantee badges */}
            <div className="mt-12 grid gap-2.5 sm:grid-cols-3">
              {[{i:'💳',l:'No credit card',s:'Sign up free · pay per session'},{i:'🛡️',l:'First session guaranteed',s:'Full refund if it isn\'t a fit'},{i:'🔓',l:'Cancel any time',s:'No subscriptions, ever'}].map((b,i)=>(
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 backdrop-blur-xl text-left">
                  <span className="text-base">{b.i}</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white/80 leading-tight">{b.l}</p>
                    <p className="text-[10px] text-white/35 leading-tight mt-0.5">{b.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </Rev>
        </div>
      </section>
    </div>
  );
}

