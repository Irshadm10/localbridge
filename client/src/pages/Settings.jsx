import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import {
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Eye,
  EyeOff,
  Save,
  Monitor,
  Moon,
  Sun,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  applyAppearance,
  applyThemePreference,
  getStoredAppearanceOverlay,
} from '../utils/appearance';

const DEFAULT_SETTINGS = {
  account: {
    email: '',
    full_name: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  },
  notifications: {
    email_notifications: true,
    session_reminders: true,
    mentor_updates: true,
    marketing_emails: false,
    push_notifications: true,
    sms_notifications: false
  },
  appearance: {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    font_size: 'medium',
    high_contrast: false
  },
  privacy: {
    profile_visibility: 'public',
    show_email: false,
    show_phone: false,
    allow_mentor_contact: true,
    data_sharing: false
  },
  billing: {
    plan: 'free',
    auto_renew: false,
    payment_method: null
  }
};

export default function Settings() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const asMentor = user ? isMentorAccount(user) : false;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [settings, setSettings] = useState(() => {
    const stored = getStoredAppearanceOverlay();
    return {
      ...DEFAULT_SETTINGS,
      appearance: { ...DEFAULT_SETTINGS.appearance, ...(stored || {}) },
    };
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, authLoading]);

  // After server load: sync DOM + localStorage. Skip while loading so defaults never overwrite a stored theme.
  useEffect(() => {
    if (loading) return;
    applyAppearance(settings.appearance);
  }, [settings.appearance, loading]);

  // If theme is "system", respond to OS-level changes live (global listener also runs in main.jsx)
  useEffect(() => {
    if (settings.appearance.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyThemePreference('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [settings.appearance.theme]);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
      } else if (data?.settings) {
        // Merge with defaults so newly-added fields don't break old saved rows
        const merged = {
          ...DEFAULT_SETTINGS,
          ...data.settings,
          account: { ...DEFAULT_SETTINGS.account, ...(data.settings.account || {}) },
          notifications: { ...DEFAULT_SETTINGS.notifications, ...(data.settings.notifications || {}) },
          appearance: { ...DEFAULT_SETTINGS.appearance, ...(data.settings.appearance || {}) },
          privacy: { ...DEFAULT_SETTINGS.privacy, ...(data.settings.privacy || {}) },
          billing: { ...DEFAULT_SETTINGS.billing, ...(data.settings.billing || {}) },
        };
        merged.account.email = user.email || merged.account.email;
        merged.account.full_name = user.user_metadata?.full_name || merged.account.full_name;
        const localTheme = getStoredAppearanceOverlay();
        if (localTheme) {
          merged.appearance = { ...merged.appearance, ...localTheme };
        }
        setSettings(merged);
      } else {
        const localTheme = getStoredAppearanceOverlay();
        setSettings((prev) => ({
          ...prev,
          account: {
            ...prev.account,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || ''
          },
          appearance: localTheme ? { ...prev.appearance, ...localTheme } : prev.appearance,
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            settings: settings,
            updated_at: new Date().toISOString()
          });

      if (error) throw error;
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Error saving settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = async () => {
    const { current_password, new_password, confirm_password } = settings.account;

    if (!current_password || !new_password || !confirm_password) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (new_password !== confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (new_password.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters long' });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: new_password });
      if (error) throw error;

      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setSettings((prev) => ({
        ...prev,
        account: {
          ...prev.account,
          current_password: '',
          new_password: '',
          confirm_password: ''
        }
      }));
    } catch (err) {
      console.error('Error updating password:', err);
      setMessage({ type: 'error', text: 'Error updating password. Please check your current password.' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await supabase.from('user_profiles').delete().eq('user_id', user.id);
      await supabase.from('user_settings').delete().eq('user_id', user.id);

      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;

      await logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setMessage({ type: 'error', text: 'Error deleting account. Please contact support.' });
    }
  };

  const exportData = async () => {
    try {
      const [profileData, settingsData] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single()
      ]);

      const payload = {
        profile: profileData.data,
        settings: settingsData.data,
        export_date: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bridge-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (err) {
      console.error('Error exporting data:', err);
      setMessage({ type: 'error', text: 'Error exporting data.' });
    }
  };

  if (authLoading) {
    return <LoadingSpinner label="Checking your session…" className="min-h-screen" />;
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
      <div className="min-h-screen bg-bridge-page">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Settings</h1>
            <p className="text-stone-600">Manage your account preferences and privacy</p>
          </div>

          {message.text && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                  message.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                ) : (
                    <AlertTriangle className="h-5 w-5" />
                )}
                {message.text}
              </div>
          )}

          <div className="mb-8 border-b border-stone-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {[
                { id: 'account', label: 'Account', icon: User },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'appearance', label: 'Appearance', icon: Palette },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'billing', label: 'Billing', icon: CreditCard }
              ].map((section) => (
                  <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                          activeSection === section.id
                              ? 'border-orange-500 text-orange-600'
                              : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                      }`}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.label}
                  </button>
              ))}
            </nav>
          </div>

          <div className="bg-white rounded-2xl shadow-bridge-card p-8">
            {activeSection === 'account' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <User className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-stone-900">Account Settings</h2>
                  </div>

                  {asMentor ? (
                      <div className="mb-6 rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/60 px-4 py-3.5 text-sm">
                        <p className="font-semibold text-amber-950">Mentor account</p>
                        <p className="mt-1 leading-relaxed text-amber-950/85">
                          You&apos;re set up to receive requests and run sessions. Booking other mentors isn&apos;t available on this account—create a separate member profile if you also want to learn from someone.
                        </p>
                        <Link
                            to="/dashboard"
                            className="mt-2 inline-flex font-semibold text-orange-900 underline decoration-orange-300/70 underline-offset-2 hover:text-orange-950"
                        >
                          Open mentor dashboard
                        </Link>
                      </div>
                  ) : (
                      <div className="mb-6 rounded-xl border border-stone-200/90 bg-stone-50/80 px-4 py-3.5 text-sm text-stone-700">
                        <p className="font-semibold text-stone-900">Member account</p>
                        <p className="mt-1 leading-relaxed text-stone-600">
                          Use the mentor directory to shortlist people, book sessions, and track everything from your dashboard.
                        </p>
                      </div>
                  )}

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={settings.account.email}
                            onChange={(e) => updateSettings('account', 'email', e.target.value)}
                            className="w-full px-4 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500"
                            disabled
                        />
                        <p className="text-xs text-stone-500 mt-1">Contact support to change email</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={settings.account.full_name}
                            onChange={(e) => updateSettings('account', 'full_name', e.target.value)}
                            className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                            placeholder="John Doe"
                        />
                      </div>
                    </div>

                    <div className="border-t border-stone-200 pt-6">
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Change Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={settings.account.current_password}
                                onChange={(e) => updateSettings('account', 'current_password', e.target.value)}
                                className="w-full px-4 py-2 pr-10 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">New Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={settings.account.new_password}
                                onChange={(e) => updateSettings('account', 'new_password', e.target.value)}
                                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                                placeholder="Enter new password"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-stone-700 mb-2">Confirm New Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={settings.account.confirm_password}
                                onChange={(e) => updateSettings('account', 'confirm_password', e.target.value)}
                                className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                                placeholder="Confirm new password"
                            />
                          </div>
                        </div>

                        <button
                            onClick={handlePasswordChange}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-stone-200 pt-6">
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Data Management</h3>
                      <div className="flex gap-4">
                        <button
                            onClick={exportData}
                            className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          Export My Data
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {activeSection === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Bell className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-stone-900">Notification Preferences</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'email_notifications', label: 'General email notifications', description: 'Receive important updates about your account' },
                          { key: 'session_reminders', label: 'Session reminders', description: 'Get reminded about upcoming mentor sessions' },
                          { key: 'mentor_updates', label: 'Mentor updates', description: 'Updates from mentors you follow' },
                          { key: 'marketing_emails', label: 'Marketing emails', description: 'Promotional content and feature announcements' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3">
                              <div>
                                <label className="font-medium text-stone-900">{item.label}</label>
                                <p className="text-sm text-stone-500">{item.description}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[item.key]}
                                    onChange={(e) => updateSettings('notifications', item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              </label>
                            </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Push Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'push_notifications', label: 'Push notifications', description: 'Receive notifications in your browser' },
                          { key: 'sms_notifications', label: 'SMS notifications', description: 'Receive text messages for important updates' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3">
                              <div>
                                <label className="font-medium text-stone-900">{item.label}</label>
                                <p className="text-sm text-stone-500">{item.description}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[item.key]}
                                    onChange={(e) => updateSettings('notifications', item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              </label>
                            </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {/* ─────────────── APPEARANCE (live, applies to the whole site) ─────────────── */}
            {activeSection === 'appearance' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Palette className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-stone-900">Appearance</h2>
                  </div>
                  <p className="text-sm text-stone-500 -mt-3">
                    Changes here apply live across the whole site.
                  </p>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { value: 'light', label: 'Light', icon: Sun },
                          { value: 'dark', label: 'Dark', icon: Moon },
                          { value: 'system', label: 'System', icon: Monitor }
                        ].map((theme) => (
                            <button
                                key={theme.value}
                                type="button"
                                onClick={() => updateSettings('appearance', 'theme', theme.value)}
                                className={`rounded-xl border-2 p-4 text-center transition-all ${
                                    settings.appearance.theme === theme.value
                                        ? 'border-orange-500 bg-orange-50 shadow-sm ring-2 ring-orange-500/15'
                                        : 'border-stone-200 bg-white/90 hover:border-orange-200/80 hover:bg-orange-50/30'
                                }`}
                            >
                              <theme.icon
                                  className={`mx-auto mb-2 h-6 w-6 ${
                                      settings.appearance.theme === theme.value
                                          ? 'text-orange-700'
                                          : 'text-stone-500'
                                  }`}
                                  aria-hidden
                              />
                              <div className="text-sm font-semibold text-stone-900">{theme.label}</div>
                            </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Language & Region</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Language</label>
                          <select
                              value={settings.appearance.language}
                              onChange={(e) => updateSettings('appearance', 'language', e.target.value)}
                              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="zh">Chinese</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Timezone</label>
                          <select
                              value={settings.appearance.timezone}
                              onChange={(e) => updateSettings('appearance', 'timezone', e.target.value)}
                              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                            <option value="America/Chicago">Central Time</option>
                            <option value="America/Denver">Mountain Time</option>
                            <option value="America/Los_Angeles">Pacific Time</option>
                            <option value="Europe/London">London</option>
                            <option value="Europe/Paris">Paris</option>
                            <option value="Asia/Tokyo">Tokyo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Display</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Font Size</label>
                          <select
                              value={settings.appearance.font_size}
                              onChange={(e) => updateSettings('appearance', 'font_size', e.target.value)}
                              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          >
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                            <option value="extra-large">Extra Large</option>
                          </select>
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div>
                            <label className="font-medium text-stone-900">High Contrast Mode</label>
                            <p className="text-sm text-stone-500">Increase contrast for better visibility</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.appearance.high_contrast}
                                onChange={(e) => updateSettings('appearance', 'high_contrast', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {activeSection === 'privacy' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-stone-900">Privacy & Security</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">Who can see your profile</label>
                          <select
                              value={settings.privacy.profile_visibility}
                              onChange={(e) => updateSettings('privacy', 'profile_visibility', e.target.value)}
                              className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          >
                            <option value="public">Everyone</option>
                            <option value="mentors">Only Mentors</option>
                            <option value="private">Only Me</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'show_email', label: 'Show email address', description: 'Display email on your public profile' },
                          { key: 'show_phone', label: 'Show phone number', description: 'Display phone on your public profile' },
                          { key: 'allow_mentor_contact', label: 'Allow mentor contact', description: 'Mentors can contact you directly' }
                        ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3">
                              <div>
                                <label className="font-medium text-stone-900">{item.label}</label>
                                <p className="text-sm text-stone-500">{item.description}</p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy[item.key]}
                                    onChange={(e) => updateSettings('privacy', item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                              </label>
                            </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Data Sharing</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <label className="font-medium text-stone-900">Share anonymized data</label>
                            <p className="text-sm text-stone-500">Help improve Bridge by sharing usage data</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.privacy.data_sharing}
                                onChange={(e) => updateSettings('privacy', 'data_sharing', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}

            {activeSection === 'billing' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="h-5 w-5 text-orange-500" />
                    <h2 className="text-xl font-semibold text-stone-900">Billing & Subscription</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg p-6 text-white">
                      <h3 className="text-lg font-semibold mb-2">Current Plan: {settings.billing.plan.charAt(0).toUpperCase() + settings.billing.plan.slice(1)}</h3>
                      <p className="mb-4 opacity-90">
                        {settings.billing.plan === 'free'
                            ? 'Access basic features with limited mentor sessions'
                            : 'Unlimited access to all mentors and premium features'
                        }
                      </p>
                      <button className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                        {settings.billing.plan === 'free' ? 'Upgrade to Premium' : 'Manage Subscription'}
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Payment Method</h3>
                      {settings.billing.payment_method ? (
                          <div className="border border-stone-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <CreditCard className="h-5 w-5 text-stone-400" />
                                <div>
                                  <p className="font-medium text-stone-900">Visa ending in 4242</p>
                                  <p className="text-sm text-stone-500">Expires 12/24</p>
                                </div>
                              </div>
                              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm">
                                Update
                              </button>
                            </div>
                          </div>
                      ) : (
                          <div className="border border-dashed border-stone-300 rounded-lg p-6 text-center">
                            <CreditCard className="h-8 w-8 mx-auto mb-3 text-stone-400" />
                            <p className="text-stone-600 mb-3">No payment method on file</p>
                            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                              Add Payment Method
                            </button>
                          </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-stone-900 mb-4">Auto-Renewal</h3>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <label className="font-medium text-stone-900">Auto-renew subscription</label>
                          <p className="text-sm text-stone-500">Automatically renew your subscription before it expires</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                              type="checkbox"
                              checked={settings.billing.auto_renew}
                              onChange={(e) => updateSettings('billing', 'auto_renew', e.target.checked)}
                              className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-400 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h3 className="text-lg font-semibold text-stone-900">Delete Account</h3>
                </div>

                <p className="text-stone-600 mb-6">
                  This action cannot be undone. All your data including profile information, session history, and settings will be permanently deleted.
                </p>

                <div className="flex gap-3 justify-end">
                  <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                      onClick={handleDeleteAccount}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}
