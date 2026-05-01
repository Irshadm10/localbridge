import { useCountUp } from './landingHooks';

export default function StatCell({ target, suffix, label, accent, decimal }) {
  const raw = decimal ? Math.round(target * 10) : target;
  const [ref, val] = useCountUp(raw, 1200);
  const display = decimal ? (val / 10).toFixed(1) : val.toLocaleString();

  return (
    <div ref={ref} className="flex flex-col gap-2">
      <p
        className={`font-display font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r ${accent}`}
        style={{ fontSize: 'clamp(2.2rem,4vw,4rem)', lineHeight: 1 }}
      >
        {display}{suffix}
      </p>
      <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[var(--bridge-text-faint)]">{label}</p>
    </div>
  );
}
