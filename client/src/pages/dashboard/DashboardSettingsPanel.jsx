/**
 * DashboardSettingsPanel — in-dashboard quick settings for both mentor and mentee.
 *
 * Persists to the same `public.user_settings` row used by the full `pages/Settings.jsx`
 * (see supabase/BRIDGE_PUBLISH.sql). Appearance preference is also applied live via
 * `utils/appearance.js` and mirrored to localStorage so it survives refresh.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Monitor,
  Moon,
  Sun,
  Bell,
  Eye,
  EyeOff,
  ExternalLink,
  Save,
  UserRound,
  Settings as SettingsIcon,
  LogOut,
  CheckCircle,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';
import CalendarConnectButton from '../../components/CalendarConnectButton';
import supabase from '../../api/supabase';
import {
  applyAppearance,
  getStoredAppearanceOverlay,
} from '../../utils/appearance';
import { toJsonbSafe } from '../../utils/jsonbSafe';
import { Tilt3D, Magnetic } from './dashboardCinematic.jsx';

const DEFAULTS = {
  appearance: { theme: 'light', font_size: 'medium', high_contrast: false, language: 'en', timezone: 'UTC' },
  notifications: {
    email_notifications: true,
    session_reminders: true,
    mentor_updates: true,
    marketing_emails: false,
    push_notifications: true,
    sms_notifications: false,
  },
  privacy: {
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    allow_mentor_contact: true,
    data_sharing: false,
  },
};

function isUserSettingsMissing(err) {
  if (!err) return false;
  if (err.code === 'PGRST205') return true;
  const m = String(err.message || '');
  return m.includes('Could not find the table') && m.includes('user_settings');
}

export default function DashboardSettingsPanel({ user, logout, isMentor, mentorProfileId, calendarConnected = false }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableMissing, setTableMissing] = useState(false);
  const [message, setMessage] = useState(null);
  const [prefs, setPrefs] = useState(() => {
    const stored = getStoredAppearanceOverlay();
    return {
      appearance: { ...DEFAULTS.appearance, ...(stored || {}) },
      notifications: { ...DEFAULTS.notifications },
      privacy: { ...DEFAULTS.privacy },
    };
  });

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          if (isUserSettingsMissing(error)) setTableMissing(true);
          else console.error('Load settings error:', error);
        } else if (data?.settings) {
          const s = data.settings;
          const overlay = getStoredAppearanceOverlay() || {};
          const mergedAppearance = { ...DEFAULTS.appearance, ...(s.appearance || {}), ...overlay };
          setPrefs((prev) => ({
            appearance: mergedAppearance,
            notifications: { ...DEFAULTS.notifications, ...(s.notifications || {}) },
            privacy: { ...DEFAULTS.privacy, ...(s.privacy || {}) },
            _raw: s,
          }));
          applyAppearance(mergedAppearance);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const update = (section, field, value) => {
    setPrefs((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  };

  // Live-apply appearance as the user toggles.
  useEffect(() => {
    if (loading) return;
    applyAppearance(prefs.appearance);
  }, [prefs.appearance, loading]);

  const flash = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  };

  const save = async () => {
    setSaving(true);
    try {
      const existing = prefs._raw ?? {};
      const payload = toJsonbSafe({
        ...existing,
        appearance: prefs.appearance,
        notifications: prefs.notifications,
        privacy: prefs.privacy,
      });
      let { error } = await supabase
        .from('user_settings')
        .upsert(
          { user_id: user.id, settings: payload, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        );
      if (error && !isUserSettingsMissing(error)) {
        const { data: row } = await supabase.from('user_settings').select('id').eq('user_id', user.id).maybeSingle();
        if (row?.id)
          ({ error } = await supabase
            .from('user_settings')
            .update({ settings: payload, updated_at: new Date().toISOString() })
            .eq('user_id', user.id));
        else
          ({ error } = await supabase
            .from('user_settings')
            .insert({ user_id: user.id, settings: payload, updated_at: new Date().toISOString() }));
      }
      if (error) {
        if (isUserSettingsMissing(error)) {
          setTableMissing(true);
          flash('success', 'Preferences saved to this device. Cloud sync unavailable.');
          return;
        }
        throw error;
      }
      setPrefs((p) => ({
        ...p,
        _raw: { ...(p._raw ?? {}), appearance: prefs.appearance, notifications: prefs.notifications, privacy: prefs.privacy },
      }));
      flash('success', 'Preferences saved.');
    } catch (err) {
      console.error('Save settings error:', err);
      flash('error', err.message || 'Could not save preferences.');
    } finally {
      setSaving(false);
    }
  };

  const themeOptions = [
    { value: 'light', label: 'Light', Icon: Sun },
    { value: 'dark', label: 'Dark', Icon: Moon },
    { value: 'system', label: 'System', Icon: Monitor },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center text-sm font-bold text-stone-500">Loading preferences…</div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-orange-500">Quick preferences</p>
        <h1 className="mt-2 font-display font-black tracking-[-0.025em] text-[var(--bridge-text)]" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: '1.02' }}>
          <span className="text-gradient-bridge italic">Settings</span> at a glance
        </h1>
        <p className="mt-1.5 text-sm text-[var(--bridge-text-secondary)]">Tune appearance, notifications, and privacy. Full settings live on the Settings page.</p>
      </div>

      {tableMissing && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-400/25 dark:bg-amber-500/10 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm leading-relaxed">
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">public.user_settings</code> is not set up in your
            Supabase project. Theme still applies on this device. Run <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">supabase/BRIDGE_PUBLISH.sql</code> to enable cloud sync.
          </p>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-400/25'
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-400/25'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
          <p className="text-sm font-semibold">{message.text}</p>
        </div>
      )}

      {/* Bento: Appearance + Notifications */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">

        {/* Appearance */}
        <Tilt3D max={2.5} className="rounded-3xl">
          <section className="bd-card-edge relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
            <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange-400/15 blur-3xl" />
            <div className="relative">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Appearance</p>
              <h2 className="mt-1 flex items-center gap-2 font-display text-xl font-black tracking-tight text-[var(--bridge-text)]">
                <Sun className="h-5 w-5 text-orange-500" />
                Theme
              </h2>
            </div>
            <div className="relative mt-5 grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, Icon }) => {
                const active = prefs.appearance.theme === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => update('appearance', 'theme', value)}
                    data-cursor={label}
                    className={`group/theme relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border p-4 text-sm font-bold transition-all duration-300 ${
                      active
                        ? 'border-orange-500 bg-gradient-to-br from-orange-500/15 to-amber-500/8 text-orange-700 shadow-[0_8px_24px_-6px_rgba(234,88,12,0.4)] ring-1 ring-orange-400/40 dark:text-orange-100'
                        : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:-translate-y-0.5 hover:border-[var(--bridge-border-strong)] hover:shadow-md'
                    }`}
                  >
                    {active && <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-orange-400/20 blur-2xl" />}
                    <Icon className={`relative h-5 w-5 transition-transform duration-300 group-hover/theme:scale-110 ${active ? 'text-orange-500' : 'text-stone-400'}`} />
                    <span className="relative">{label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </Tilt3D>

        {/* Notifications */}
        <Tilt3D max={2.5} className="rounded-3xl">
        <section className="bd-card-edge relative h-full overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
          <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-amber-400/15 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Notifications</p>
            <h2 className="mt-1 flex items-center gap-2 font-display text-xl font-black tracking-tight text-[var(--bridge-text)]">
              <Bell className="h-5 w-5 text-orange-500" />
              What we ping you about
            </h2>
          </div>
          <div className="relative mt-5 space-y-2">
            {[
              { k: 'email_notifications', label: 'Email notifications', help: 'Booking confirmations and receipts' },
              { k: 'session_reminders', label: 'Session reminders', help: 'Reminders before your upcoming sessions' },
              { k: 'mentor_updates', label: isMentor ? 'Mentee updates' : 'Mentor updates', help: 'When the other side makes a change' },
              { k: 'push_notifications', label: 'Push notifications', help: 'Browser push (when supported)' },
              { k: 'marketing_emails', label: 'Product updates', help: 'Occasional product news — no spam' },
            ].map(({ k, label, help }) => (
              <ToggleRow
                key={k}
                label={label}
                help={help}
                checked={!!prefs.notifications[k]}
                onChange={(v) => update('notifications', k, v)}
              />
            ))}
          </div>
        </section>
        </Tilt3D>
      </div>

      {/* Privacy */}
      <Tilt3D max={2.5} className="rounded-3xl">
      <section className="bd-card-edge relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
        <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-10 h-36 w-36 rounded-full bg-violet-400/12 blur-3xl" />
        <div className="relative">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Privacy</p>
          <h2 className="mt-1 flex items-center gap-2 font-display text-xl font-black tracking-tight text-[var(--bridge-text)]">
            <Eye className="h-5 w-5 text-orange-500" />
            Who sees what
          </h2>
        </div>
        <div className="relative mt-5 space-y-4">
          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--bridge-text-muted)]">Profile visibility</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { v: 'public', l: 'Public', Icon: Eye },
                { v: 'members', l: 'Members only', Icon: UserRound },
                { v: 'private', l: 'Private', Icon: EyeOff },
              ].map(({ v, l, Icon }) => {
                const active = prefs.privacy.profile_visibility === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => update('privacy', 'profile_visibility', v)}
                    data-cursor={l}
                    className={`group/vis flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-all duration-300 ${
                      active
                        ? 'border-orange-500 bg-gradient-to-br from-orange-500/12 to-amber-500/6 text-orange-700 shadow-[0_4px_18px_-4px_rgba(234,88,12,0.35)] ring-1 ring-orange-400/35 dark:text-orange-100'
                        : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:-translate-y-0.5 hover:border-[var(--bridge-border-strong)]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 transition-transform duration-300 group-hover/vis:scale-110 ${active ? 'text-orange-500' : ''}`} />
                    {l}
                  </button>
                );
              })}
            </div>
          </div>
          <ToggleRow
            label="Show email on profile"
            checked={!!prefs.privacy.show_email}
            onChange={(v) => update('privacy', 'show_email', v)}
          />
          {!isMentor && (
            <ToggleRow
              label="Let mentors contact me"
              checked={!!prefs.privacy.allow_mentor_contact}
              onChange={(v) => update('privacy', 'allow_mentor_contact', v)}
            />
          )}
        </div>
      </section>
      </Tilt3D>

      {/* Calendar — mentor only */}
      {isMentor && (
        <Tilt3D max={2.5} className="rounded-3xl">
        <section className="bd-card-edge relative overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="relative">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">Calendar</p>
            <h2 className="mt-1 flex items-center gap-2 font-display text-xl font-black tracking-tight text-[var(--bridge-text)]">
              <CalendarDays className="h-5 w-5 text-orange-500" />
              Sync the source of truth
            </h2>
            <p className="mt-2 text-sm text-[var(--bridge-text-muted)]">
              Connect Google Calendar so mentees see your real availability and sessions are added automatically.
            </p>
          </div>
          <div className="relative mt-4">
            <CalendarConnectButton mentorProfileId={mentorProfileId} isConnected={calendarConnected} />
            {calendarConnected && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-3 w-3" /> Visible on your public profile
              </p>
            )}
          </div>
        </section>
        </Tilt3D>
      )}

      {/* Actions — magnetic save + glassy secondary buttons */}
      <div className="bd-card-edge relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div aria-hidden className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-orange-400/12 blur-3xl" />
        <div className="relative flex flex-wrap gap-2">
          <Magnetic strength={0.14}>
            <Link
              to="/profile"
              data-cursor="Profile"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2.5 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:-translate-y-0.5 hover:border-orange-400/50 hover:text-[var(--bridge-text)]"
            >
              <UserRound className="h-4 w-4" />
              Edit profile
            </Link>
          </Magnetic>
          {isMentor && mentorProfileId && (
            <Magnetic strength={0.14}>
              <Link
                to={`/mentors/${mentorProfileId}`}
                data-cursor="Public"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2.5 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:-translate-y-0.5 hover:border-orange-400/50 hover:text-[var(--bridge-text)]"
              >
                <ExternalLink className="h-4 w-4" />
                Public profile
              </Link>
            </Magnetic>
          )}
          <Magnetic strength={0.14}>
            <Link
              to="/settings"
              data-cursor="More"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2.5 text-sm font-bold text-[var(--bridge-text-secondary)] transition hover:-translate-y-0.5 hover:border-orange-400/50 hover:text-[var(--bridge-text)]"
            >
              <SettingsIcon className="h-4 w-4" />
              Full settings
            </Link>
          </Magnetic>
        </div>
        <div className="relative flex gap-2">
          <button
            type="button"
            onClick={logout}
            data-cursor="Sign out"
            className="inline-flex items-center gap-2 rounded-full border border-red-300/60 bg-red-50/40 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-50 dark:border-red-400/30 dark:bg-red-500/8 dark:text-red-300 dark:hover:bg-red-500/15"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <Magnetic strength={0.18}>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              data-cursor="Save"
              className="btn-sheen inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-2.5 text-sm font-black text-white shadow-[0_8px_24px_-6px_rgba(234,88,12,0.65)] ring-1 ring-white/15 transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-6px_rgba(234,88,12,0.85)] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, help, checked, onChange }) {
  return (
    <label className="group/row flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-transparent px-3 py-2.5 transition-all duration-300 hover:border-[var(--bridge-border)] hover:bg-[color-mix(in_srgb,var(--bridge-surface-muted)_70%,transparent)]">
      <div>
        <p className="text-sm font-bold text-[var(--bridge-text)]">{label}</p>
        {help && <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{help}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        data-cursor="hover"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-all duration-300 ${
          checked ? 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_14px_rgba(234,88,12,0.45)]' : 'bg-stone-300 dark:bg-stone-600'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}
