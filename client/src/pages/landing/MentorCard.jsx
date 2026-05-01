import { useRef } from 'react';
import { AVATAR_GRAD } from './landingData';

export default function MentorCard({ m }) {
  const r = useRef(null);

  const handleMouseMove = e => {
    const el = r.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    el.style.setProperty('--tx', `${((e.clientY - b.top) / b.height - 0.5) * -6}deg`);
    el.style.setProperty('--ty', `${((e.clientX - b.left) / b.width - 0.5) * 6}deg`);
    el.style.setProperty('--mx', `${((e.clientX - b.left) / b.width) * 100}%`);
    el.style.setProperty('--my', `${((e.clientY - b.top) / b.height) * 100}%`);
  };

  const handleMouseLeave = () => {
    const el = r.current;
    if (!el) return;
    el.style.setProperty('--tx', '0deg');
    el.style.setProperty('--ty', '0deg');
  };

  return (
    <div
      ref={r}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      data-cursor="View"
      className="tilt-card cursor-glow inline-flex shrink-0 w-60 flex-col gap-3 rounded-2xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-4 shadow-bridge-card transition-all hover:border-orange-500/35 hover:shadow-bridge-glow"
    >
      <div className="flex items-center gap-2.5">
        <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRAD[m.tone]} text-[11px] font-bold text-white`}>
          {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          {m.online && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[var(--bridge-surface)]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-200" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-[12px] font-semibold text-[var(--bridge-text)]">{m.name}</p>
          <p className="truncate text-[10px] text-[var(--bridge-text-faint)]">{m.co}</p>
        </div>
      </div>
      <p className="text-[11px] text-[var(--bridge-text-muted)]">{m.title}</p>
      <div className="flex flex-wrap gap-1">
        {m.tags.slice(0, 2).map(t => (
          <span key={t} className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-semibold text-orange-600 dark:text-orange-300">{t}</span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-[var(--bridge-border)] pt-2.5">
        <span className="text-[10px] text-[var(--bridge-text-muted)]">★ {m.rating} · {m.sessions} sessions</span>
        <span className="text-[11px] font-bold text-orange-500">${m.rate}/hr</span>
      </div>
    </div>
  );
}
