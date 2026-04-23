const PALETTE = [
  'bg-violet-600',
  'bg-emerald-600',
  'bg-sky-700',
  'bg-rose-600',
  'bg-indigo-700',
  'bg-teal-600',
  'bg-orange-600',
  'bg-pink-600',
  'bg-amber-700',
  'bg-cyan-700',
  'bg-green-700',
  'bg-purple-600',
];

const SIZES = {
  xs: 'h-10 w-10 text-xs',
  sm: 'h-12 w-12 text-[11px]',
  md: 'h-14 w-14 text-sm',
  lg: 'h-20 w-20 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

function nameToColor(name) {
  let hash = 0;
  const s = name || '';
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function getInitials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export default function MentorAvatar({ name = '', size = 'md', className = '' }) {
  const bg = nameToColor(name);
  const sizeClasses = SIZES[size] ?? SIZES.md;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${bg} ${sizeClasses}${className ? ` ${className}` : ''}`}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
