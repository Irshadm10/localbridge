export const SESSION_TYPES = [
  {
    key: 'career_advice',
    icon: '🧭',
    name: 'Career Advice',
    tagline: 'Direction, pivots, and long-term planning with someone who’s done it.',
    description:
      'Get guidance on career direction, industry transitions, and long-term planning. Your mentor will help you map out your next steps based on their own experience in the field.',
    duration: '30 min',
    popular: false,
    accent: {
      border: 'border-l-amber-400',
      iconBg: 'bg-amber-50',
      tag: 'text-amber-800 bg-amber-50 border-amber-200',
      selectedRing: 'ring-amber-500/90',
      selectedBg: 'from-amber-50/80 to-orange-50/40',
      iconTint: 'text-amber-700',
    },
  },
  {
    key: 'interview_prep',
    icon: '🎯',
    name: 'Interview Prep',
    tagline: 'Practice answers, feedback, and strategies from the interviewer’s side.',
    description:
      'Practice real interview questions with someone who has been on the other side of the table. Get feedback on your answers, body language tips, and strategies for behavioral and technical rounds.',
    duration: '30 min',
    popular: true,
    accent: {
      border: 'border-l-emerald-400',
      iconBg: 'bg-emerald-50',
      tag: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      selectedRing: 'ring-emerald-500/90',
      selectedBg: 'from-emerald-50/80 to-teal-50/40',
      iconTint: 'text-emerald-700',
    },
  },
  {
    key: 'resume_review',
    icon: '📄',
    name: 'Resume Review',
    tagline: 'Line-by-line feedback so hiring managers actually see your impact.',
    description:
      'Get line-by-line feedback on your resume from a professional in your target industry. Learn what hiring managers actually look for and how to make your experience stand out.',
    duration: '45 min',
    popular: false,
    accent: {
      border: 'border-l-sky-400',
      iconBg: 'bg-sky-50',
      tag: 'text-sky-800 bg-sky-50 border-sky-200',
      selectedRing: 'ring-sky-500/90',
      selectedBg: 'from-sky-50/80 to-indigo-50/30',
      iconTint: 'text-sky-700',
    },
  },
  {
    key: 'networking',
    icon: '🤝',
    name: 'Networking',
    tagline: 'Warm intros, communities to join, and a stronger professional presence.',
    description:
      'Build a genuine professional relationship. Your mentor can introduce you to people in their network, recommend communities to join, and help you develop your professional presence.',
    duration: '30 min',
    popular: false,
    accent: {
      border: 'border-l-violet-400',
      iconBg: 'bg-violet-50',
      tag: 'text-violet-800 bg-violet-50 border-violet-200',
      selectedRing: 'ring-violet-500/90',
      selectedBg: 'from-violet-50/80 to-fuchsia-50/30',
      iconTint: 'text-violet-700',
    },
  },
];

/**
 * @param {{ type: object, selected?: boolean, onClick?: () => void, variant?: 'marketing' | 'picker' }} props
 */
export default function SessionTypeCard({ type, selected = false, onClick, variant = 'marketing' }) {
  const { icon, name, description, tagline, duration, popular, accent } = type;
  const bodyText = variant === 'picker' ? tagline ?? description : description;

  const isInteractive = typeof onClick === 'function';
  const isPicker = variant === 'picker';

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={[
        'relative flex flex-col rounded-2xl border transition-all duration-200 outline-none border-l-4',
        accent.border,
        isPicker
          ? 'gap-3 border-stone-200/90 bg-white/95 p-4 text-left sm:gap-3 sm:p-5'
          : 'gap-4 border-stone-100 bg-white p-6',
        'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-900/5',
        selected
          ? `z-[1] shadow-lg ring-2 ring-offset-2 ring-offset-white ${accent.selectedRing} ${isPicker ? `bg-gradient-to-br ${accent.selectedBg}` : 'shadow-md'}`
          : 'shadow-sm hover:border-stone-300/80',
        isInteractive ? 'cursor-pointer' : '',
        isInteractive && 'focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {popular && (
        <span
          className={`absolute ${isPicker ? 'top-3 right-3' : 'top-4 right-4'} text-[10px] sm:text-xs font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-emerald-500 text-white shadow-sm`}
        >
          Popular
        </span>
      )}

      <div className={`flex ${isPicker ? 'flex-row items-start gap-4' : 'flex-col gap-4'}`}>
        <div
          className={`flex shrink-0 items-center justify-center rounded-xl ${accent.iconBg} ${isPicker ? 'h-12 w-12 text-2xl shadow-inner' : 'h-10 w-10 text-xl'}`}
        >
          {icon}
        </div>

        <div className={`flex min-w-0 flex-col ${isPicker ? 'flex-1 gap-1.5 pt-0.5' : 'gap-1.5'}`}>
          <div className={`flex items-start justify-between gap-2 ${isPicker ? 'pr-10' : ''}`}>
            <h3 className={`font-semibold text-stone-900 ${isPicker ? 'text-base' : 'text-base'} ${selected ? 'text-stone-950' : ''}`}>
              {name}
            </h3>
            {selected && isInteractive && isPicker && (
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm text-white shadow-md"
                aria-hidden="true"
              >
                ✓
              </span>
            )}
          </div>
          <p
            className={`text-stone-600 leading-snug ${isPicker ? 'text-sm line-clamp-2 sm:line-clamp-3' : 'text-sm leading-relaxed'}`}
          >
            {bodyText}
          </p>
        </div>
      </div>

      <div
        className={`mt-auto flex items-center gap-2 ${isPicker ? 'pt-1' : 'pt-3 border-t border-stone-100'}`}
      >
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${accent.tag}`}>{duration}</span>
        {isPicker && selected && (
          <span className="text-xs font-medium text-stone-500 ml-auto">Selected</span>
        )}
      </div>
    </div>
  );
}
