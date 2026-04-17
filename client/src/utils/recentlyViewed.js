const STORAGE_KEY = 'bridge_recent_mentors_v1';
const MAX = 5;

/**
 * @param {{ id: string, name: string, title?: string, company?: string }} mentor
 */
export function addRecentlyViewedMentor(mentor) {
  if (!mentor?.id) return;
  let list = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];
  } catch {
    list = [];
  }
  const entry = {
    id: mentor.id,
    name: mentor.name ?? '',
    title: mentor.title ?? '',
    company: mentor.company ?? '',
  };
  list = list.filter((m) => m.id !== entry.id);
  list.unshift(entry);
  if (list.length > MAX) list = list.slice(0, MAX);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

export function getRecentlyViewedMentors() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
