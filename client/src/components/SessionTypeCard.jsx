export const SESSION_TYPES = [
  {
    key: 'career_advice',
    icon: '🧭',
    name: 'Career Advice',
    description:
      'Get guidance on career direction, industry transitions, and long-term planning. Your mentor will help you map out your next steps based on their own experience in the field.',
    duration: '30 min',
    popular: false,
    accent: {
      border: 'border-l-amber-400',
      iconBg: 'bg-amber-50',
      tag: 'text-amber-700 bg-amber-50 border-amber-200',
    },
  },
  {
    key: 'interview_prep',
    icon: '🎯',
    name: 'Interview Prep',
    description:
      'Practice real interview questions with someone who has been on the other side of the table. Get feedback on your answers, body language tips, and strategies for behavioral and technical rounds.',
    duration: '30 min',
    popular: true,
    accent: {
      border: 'border-l-emerald-400',
      iconBg: 'bg-emerald-50',
      tag: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  },
  {
    key: 'resume_review',
    icon: '📄',
    name: 'Resume Review',
    description:
      'Get line-by-line feedback on your resume from a professional in your target industry. Learn what hiring managers actually look for and how to make your experience stand out.',
    duration: '45 min',
    popular: false,
    accent: {
      border: 'border-l-sky-400',
      iconBg: 'bg-sky-50',
      tag: 'text-sky-700 bg-sky-50 border-sky-200',
    },
  },
  {
    key: 'networking',
    icon: '🤝',
    name: 'Networking',
    description:
      'Build a genuine professional relationship. Your mentor can introduce you to people in their network, recommend communities to join, and help you develop your professional presence.',
    duration: '30 min',
    popular: false,
    accent: {
      border: 'border-l-violet-400',
      iconBg: 'bg-violet-50',
      tag: 'text-violet-700 bg-violet-50 border-violet-200',
    },
  },
];

/**
 * SessionTypeCard
 *
 * Props:
 *   type      — one object from SESSION_TYPES
 *   selected  — boolean (optional) — highlights the card as selected
 *   onClick   — function (optional) — makes the card interactive/selectable
 */
export default function SessionTypeCard({ type, selected = false, onClick }) {
  const { icon, name, description, duration, popular, accent } = type;

  const isInteractive = typeof onClick === 'function';

  return (
    <div
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={[
        'relative bg-white rounded-2xl border border-stone-100 border-l-4 p-6 flex flex-col gap-4',
        'hover:-translate-y-1 hover:shadow-md transition-all duration-200',
        accent.border,
        selected ? 'ring-2 ring-offset-2 ring-stone-900 shadow-md' : 'shadow-sm',
        isInteractive ? 'cursor-pointer' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Popular badge */}
      {popular && (
        <span className="absolute top-4 right-4 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Most Popular
        </span>
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${accent.iconBg}`}>
        {icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-semibold text-stone-900 text-base">{name}</h3>
        <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-3 border-t border-stone-100 flex items-center gap-2">
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${accent.tag}`}>
          {duration}
        </span>
      </div>
    </div>
  );
}
