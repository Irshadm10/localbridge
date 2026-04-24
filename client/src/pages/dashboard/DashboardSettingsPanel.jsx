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
      <div className="py-20 text-center text-sm text-stone-500">Loading preferences…</div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="font-display text-3xl font-bold text-[var(--bridge-text)]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--bridge-text-muted)]">Quick preferences — full settings live on the Settings page.</p>
      </div>

      {tableMissing && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm leading-relaxed">
            <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">public.user_settings</code> is not set up in your
            Supabase project. Theme still applies on this device. Run <code className="rounded bg-amber-100/80 px-1.5 py-0.5 text-xs">supabase/BRIDGE_PUBLISH.sql</code> to enable cloud sync.
          </p>
        </div>
      )}

      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl p-4 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Appearance */}
      <section className="rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-[var(--bridge-text)]">
          <Sun className="h-5 w-5 text-orange-500" />
          Appearance
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, label, Icon }) => {
            const active = prefs.appearance.theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => update('appearance', 'theme', value)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold transition ${
                  active
                    ? 'border-orange-500 bg-orange-500/12 text-orange-800 shadow-sm dark:text-orange-100'
                    : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:border-[var(--bridge-border-strong)]'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-orange-500' : 'text-stone-400'}`} />
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-[var(--bridge-text)]">
          <Bell className="h-5 w-5 text-orange-500" />
          Notifications
        </h2>
        <div className="space-y-3">
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

      {/* Privacy */}
      <section className="rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-[var(--bridge-text)]">
          <Eye className="h-5 w-5 text-orange-500" />
          Privacy
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--bridge-text)]">Profile visibility</label>
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
                    className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? 'border-orange-500 bg-orange-500/12 text-orange-800 dark:text-orange-100'
                        : 'border-[var(--bridge-border)] bg-[var(--bridge-surface)] text-[var(--bridge-text-secondary)] hover:border-[var(--bridge-border-strong)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
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

      {/* Calendar — mentor only */}
      {isMentor && (
        <section className="rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-[var(--bridge-text)]">
            <CalendarDays className="h-5 w-5 text-orange-500" />
            Calendar
          </h2>
          <p className="mb-4 text-sm text-[var(--bridge-text-muted)]">
            Connect Google Calendar so mentees can see your availability and sessions are added automatically.
          </p>
          <CalendarConnectButton mentorProfileId={mentorProfileId} isConnected={calendarConnected} />
          {calendarConnected && (
            <p className="mt-3 text-xs text-emerald-700 dark:text-emerald-400">
              Your availability is visible on your public profile.
            </p>
          )}
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 rounded-3xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-sm font-semibold text-[var(--bridge-text-secondary)] hover:bg-[color-mix(in_srgb,var(--bridge-surface-muted)_85%,transparent)]"
          >
            <UserRound className="h-4 w-4" />
            Edit profile
          </Link>
          {isMentor && mentorProfileId && (
            <Link
              to={`/mentors/${mentorProfileId}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-sm font-semibold text-[var(--bridge-text-secondary)] hover:bg-[color-mix(in_srgb,var(--bridge-surface-muted)_85%,transparent)]"
            >
              <ExternalLink className="h-4 w-4" />
              View public profile
            </Link>
          )}
          <Link
            to="/settings"
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--bridge-border)] bg-[var(--bridge-surface)] px-4 py-2 text-sm font-semibold text-[var(--bridge-text-secondary)] hover:bg-[color-mix(in_srgb,var(--bridge-surface-muted)_85%,transparent)]"
          >
            <SettingsIcon className="h-4 w-4" />
            Full settings
          </Link>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2 text-sm font-bold text-white shadow-md shadow-orange-600/30 transition hover:from-orange-500 hover:to-amber-400 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, help, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-transparent px-1 py-2 transition hover:border-[var(--bridge-border)] hover:bg-[color-mix(in_srgb,var(--bridge-surface-muted)_60%,transparent)]">
      <div>
        <p className="text-sm font-semibold text-[var(--bridge-text)]">{label}</p>
        {help && <p className="mt-0.5 text-xs text-[var(--bridge-text-muted)]">{help}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? 'bg-orange-500' : 'bg-stone-300'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  );
}
