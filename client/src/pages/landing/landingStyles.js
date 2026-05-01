export const LANDING_CSS = `
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
`;
