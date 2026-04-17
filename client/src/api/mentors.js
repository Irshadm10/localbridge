import supabase from './supabase';

function escapeIlike(value) {
  return value.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

function quotedIlikePattern(rawSearch) {
  const pattern = `%${escapeIlike(rawSearch)}%`;
  return `"${pattern.replace(/"/g, '""')}"`;
}

function normalizeMentor(row) {
  if (!row) return row;
  let expertise = row.expertise;
  if (typeof expertise === 'string') {
    try {
      expertise = JSON.parse(expertise);
    } catch {
      expertise = [];
    }
  }
  if (!Array.isArray(expertise)) expertise = [];

  const { expertise_search: _ignored, ...rest } = row;

  return {
    ...rest,
    expertise,
    rating: row.rating != null ? Number(row.rating) : 0,
    years_experience: row.years_experience != null ? Number(row.years_experience) : 0,
    total_sessions: row.total_sessions != null ? Number(row.total_sessions) : 0,
  };
}

const DEFAULT_PAGE_SIZE = 12;

/**
 * @param {{
 *   industry?: string,
 *   search?: string,
 *   sortBy?: 'rating' | 'experience' | 'sessions',
 *   page?: number,
 *   pageSize?: number
 * }} params
 */
export async function getAllMentors({
  industry,
  search,
  sortBy = 'rating',
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
} = {}) {
  const orderColumn =
    sortBy === 'experience' ? 'years_experience' : sortBy === 'sessions' ? 'total_sessions' : 'rating';

  let query = supabase.from('mentor_profiles').select('*', { count: 'exact' });

  if (industry?.trim()) {
    query = query.eq('industry', industry.trim());
  }

  if (search?.trim()) {
    const p = quotedIlikePattern(search.trim());
    query = query.or(`name.ilike.${p},title.ilike.${p},company.ilike.${p},bio.ilike.${p}`);
  }

  const from = page * pageSize;
  const to = from + pageSize - 1;

  query = query.order(orderColumn, { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) {
    return { data: null, error, totalCount: 0 };
  }

  return {
    data: (data ?? []).map(normalizeMentor),
    error: null,
    totalCount: count ?? 0,
  };
}

export async function getMentorById(id) {
  const { data: mentor, error: mErr } = await supabase
    .from('mentor_profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (mErr) {
    return { data: null, error: mErr };
  }
  if (!mentor) {
    return { data: null, error: null };
  }

  const { data: ratingRows, error: rErr } = await supabase
    .from('reviews')
    .select('rating')
    .eq('mentor_id', id);

  if (rErr) {
    return { data: null, error: rErr };
  }

  const list = ratingRows ?? [];
  const reviewCount = list.length;
  const reviewAverage =
    reviewCount > 0
      ? list.reduce((sum, r) => sum + Number(r.rating), 0) / reviewCount
      : null;

  return {
    data: {
      mentor: normalizeMentor(mentor),
      reviews: {
        count: reviewCount,
        average: reviewAverage,
      },
    },
    error: null,
  };
}

export async function getFeaturedMentors() {
  const { data, error } = await supabase
    .from('mentor_profiles')
    .select('*')
    .order('rating', { ascending: false })
    .limit(3);

  if (error) {
    return { data: null, error };
  }

  return { data: data.map(normalizeMentor), error: null };
}
