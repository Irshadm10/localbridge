import { getCalendarAuthUrl } from '../api/calendar';

export default function CalendarConnectButton({ mentorProfileId, isConnected }) {
  if (isConnected) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Calendar Connected
      </span>
    );
  }

  async function handleConnect() {
    try {
      const url = await getCalendarAuthUrl(mentorProfileId);
      window.location.href = url;
    } catch (err) {
      console.error('Failed to get calendar auth URL:', err);
    }
  }

  return (
    <button
      type="button"
      onClick={handleConnect}
      className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
    >
      <svg
        className="h-4 w-4 shrink-0 text-stone-500"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" />
      </svg>
      Connect Google Calendar
    </button>
  );
}
