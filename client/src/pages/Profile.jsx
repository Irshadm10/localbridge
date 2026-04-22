import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { isMentorAccount } from '../utils/accountRole';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Save,
  Eye,
  Edit,
  Plus,
  X,
  Download,
  Star,
  FileText,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import supabase from '../api/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadResumeFile, removeResumeFile, getResumeSignedUrl } from '../api/resumeStorage';
import { toJsonbSafe } from '../utils/jsonbSafe';

function ResumeDownloadButton({ meta }) {
  const [url, setUrl] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    if (!meta?.path) return;
    let cancelled = false;
    getResumeSignedUrl(meta.path)
      .then((u) => {
        if (!cancelled) setUrl(u);
      })
      .catch(() => {
        if (!cancelled) setErr(true);
      });
    return () => {
      cancelled = true;
    };
  }, [meta?.path]);
  if (!meta?.path) return null;
  if (err) return <span className="text-xs text-red-600">Link unavailable</span>;
  if (!url) return <span className="text-xs text-stone-500">Preparing link…</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="px-3 py-2 text-sm font-medium text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-50"
    >
      Download
    </a>
  );
}

// ─── Inline skill input ───────────────────────────────────────────────────────
function SkillInput({ onAdd }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
        className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
        placeholder="Type a skill and press Enter or Add…"
      />
      <button
        type="button"
        onClick={submit}
        className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Add
      </button>
    </div>
  );
}

// ─── Expertise tag input (same pattern, used for mentor profile) ──────────────
function ExpertiseInput({ onAdd }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  const submit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex gap-2 mt-4">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), submit())}
        className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
        placeholder="e.g. Product Strategy, Career Growth…"
      />
      <button
        type="button"
        onClick={submit}
        className="flex items-center gap-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
      >
        <Plus className="h-4 w-4" />
        Add
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMentor = user ? isMentorAccount(user) : false;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [profileData, setProfileData] = useState({
    personal: {
      full_name: '',
      title: '',
      bio: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      resume: null,
    },
    experience: [],
    education: [],
    skills: [],
    achievements: [],
  });

  // Mentor-only: their public mentor_profiles row
  const [mentorProfile, setMentorProfile] = useState({
    name: '',
    title: '',
    company: '',
    industry: '',
    bio: '',
    years_experience: '',
    expertise: [],
    available: true,
    image_url: '',
    linkedin_url: '',
    github_url: '',
    website_url: '',
    tier: 'rising',
    session_rate: 0,
  });
  const [mentorProfileId, setMentorProfileId] = useState(null);
  const [savingMentor, setSavingMentor] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  const sections = isMentor
    ? ['personal', 'resume', 'experience', 'education', 'skills', 'achievements', 'mentor']
    : ['personal', 'resume', 'experience', 'education', 'skills', 'achievements'];

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfileData();
  }, [user, navigate, authLoading]);

  const loadProfileData = async () => {
    try {
      const [profileRes, mentorRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        isMentor
          ? supabase
              .from('mentor_profiles')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (profileRes.error && profileRes.error.code !== 'PGRST116') {
        console.error('Error loading profile:', profileRes.error);
      } else if (profileRes.data) {
        const pi = profileRes.data.personal_info || {};
        setProfileData({
          personal: {
            full_name: '',
            title: '',
            bio: '',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: '',
            github: '',
            resume: null,
            ...pi,
          },
          experience: profileRes.data.experience || [],
          education: profileRes.data.education || [],
          skills: profileRes.data.skills || [],
          achievements: profileRes.data.achievements || [],
        });
      } else {
        setProfileData((prev) => ({
          ...prev,
          personal: {
            ...prev.personal,
            full_name: user.user_metadata?.full_name || '',
            email: user.email || '',
            resume: prev.personal.resume ?? null,
          },
        }));
      }

      if (mentorRes.data) {
        setMentorProfileId(mentorRes.data.id);
        setMentorProfile({
          name: mentorRes.data.name || '',
          title: mentorRes.data.title || '',
          company: mentorRes.data.company || '',
          industry: mentorRes.data.industry || '',
          bio: mentorRes.data.bio || '',
          years_experience: mentorRes.data.years_experience ?? '',
          expertise: mentorRes.data.expertise || [],
          available: mentorRes.data.available ?? true,
          image_url: mentorRes.data.image_url || '',
          linkedin_url: mentorRes.data.linkedin_url || '',
          github_url: mentorRes.data.github_url || '',
          website_url: mentorRes.data.website_url || '',
          tier: mentorRes.data.tier || 'rising',
          session_rate: mentorRes.data.session_rate ?? 0,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  const saveProfileData = async () => {
    setSaving(true);
    try {
      const row = {
        user_id: user.id,
        personal_info: toJsonbSafe(profileData.personal),
        experience: toJsonbSafe(profileData.experience),
        education: toJsonbSafe(profileData.education),
        skills: toJsonbSafe(profileData.skills),
        achievements: toJsonbSafe(profileData.achievements),
        updated_at: new Date().toISOString(),
      };
      let { error } = await supabase.from('user_profiles').upsert(row, { onConflict: 'user_id' });
      if (error) {
        const { data: existing } = await supabase.from('user_profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (existing?.id) {
          ({ error } = await supabase.from('user_profiles').update(row).eq('user_id', user.id));
        } else {
          ({ error } = await supabase.from('user_profiles').insert(row));
        }
      }
      if (error) throw error;
      showMsg('success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      const hint = error.code === '42P01' || error.message?.includes('user_profiles')
        ? ' Run supabase/BRIDGE_PUBLISH.sql in the Supabase SQL editor.'
        : '';
      showMsg('error', `${error.message || 'Could not save profile.'}${hint}`);
    } finally {
      setSaving(false);
    }
  };

  const saveMentorProfile = async () => {
    setSavingMentor(true);
    try {
      const insertPayload = {
        user_id: user.id,
        name: mentorProfile.name || user.user_metadata?.full_name || '',
        title: mentorProfile.title || null,
        company: mentorProfile.company || null,
        industry: mentorProfile.industry || 'technology',
        bio: mentorProfile.bio || null,
        years_experience: mentorProfile.years_experience ? Number(mentorProfile.years_experience) : null,
        expertise: toJsonbSafe(mentorProfile.expertise || []),
        available: mentorProfile.available,
        image_url: mentorProfile.image_url || null,
        linkedin_url: mentorProfile.linkedin_url || null,
        github_url: mentorProfile.github_url || null,
        website_url: mentorProfile.website_url || null,
        tier: mentorProfile.tier || 'rising',
        session_rate: Number(mentorProfile.session_rate) || 0,
      };

      let error;
      if (mentorProfileId) {
        const { user_id: _uid, ...updatePayload } = insertPayload;
        ({ error } = await supabase.from('mentor_profiles').update(updatePayload).eq('id', mentorProfileId));
      } else {
        const res = await supabase.from('mentor_profiles').insert(insertPayload).select('id').single();
        error = res.error;
        if (!error && res.data?.id) setMentorProfileId(res.data.id);
      }
      if (error) throw error;
      showMsg('success', 'Mentor profile saved!');
    } catch (error) {
      console.error('Error saving mentor profile:', error);
      showMsg('error', error.message || 'Could not save mentor profile.');
    } finally {
      setSavingMentor(false);
    }
  };

  // ─── Personal info helpers ────────────────────────────────────────────────
  const updatePersonalInfo = (field, value) =>
    setProfileData((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }));

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const ok =
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (!ok) {
      showMsg('error', 'Please upload a PDF or Word document.');
      return;
    }
    setResumeUploading(true);
    try {
      const prevPath = profileData.personal?.resume?.path;
      const meta = await uploadResumeFile(user.id, file);
      if (prevPath && prevPath !== meta.path) {
        try {
          await removeResumeFile(prevPath);
        } catch {
          /* ignore stale file */
        }
      }
      const nextPersonal = toJsonbSafe({ ...profileData.personal, resume: meta });
      setProfileData((prev) => ({ ...prev, personal: nextPersonal }));
      const saveRow = {
        user_id: user.id,
        personal_info: nextPersonal,
        experience: toJsonbSafe(profileData.experience),
        education: toJsonbSafe(profileData.education),
        skills: toJsonbSafe(profileData.skills),
        achievements: toJsonbSafe(profileData.achievements),
        updated_at: new Date().toISOString(),
      };
      let { error } = await supabase.from('user_profiles').upsert(saveRow, { onConflict: 'user_id' });
      if (error) {
        const { data: existing } = await supabase.from('user_profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (existing?.id) ({ error } = await supabase.from('user_profiles').update(saveRow).eq('user_id', user.id));
        else ({ error } = await supabase.from('user_profiles').insert(saveRow));
      }
      if (error) throw error;
      showMsg('success', 'Résumé uploaded and saved.');
    } catch (err) {
      console.error(err);
      showMsg('error', err.message || 'Upload failed. Run supabase/BRIDGE_PUBLISH.sql if the DB is not set up.');
    } finally {
      setResumeUploading(false);
    }
  };

  const handleResumeRemove = async () => {
    const path = profileData.personal?.resume?.path;
    if (!path) return;
    setResumeUploading(true);
    try {
      await removeResumeFile(path);
      const nextPersonal = toJsonbSafe({ ...profileData.personal, resume: null });
      setProfileData((prev) => ({ ...prev, personal: nextPersonal }));
      const saveRow = {
        user_id: user.id,
        personal_info: nextPersonal,
        experience: toJsonbSafe(profileData.experience),
        education: toJsonbSafe(profileData.education),
        skills: toJsonbSafe(profileData.skills),
        achievements: toJsonbSafe(profileData.achievements),
        updated_at: new Date().toISOString(),
      };
      let { error } = await supabase.from('user_profiles').upsert(saveRow, { onConflict: 'user_id' });
      if (error) {
        const { data: existing } = await supabase.from('user_profiles').select('id').eq('user_id', user.id).maybeSingle();
        if (existing?.id) ({ error } = await supabase.from('user_profiles').update(saveRow).eq('user_id', user.id));
        else ({ error } = await supabase.from('user_profiles').insert(saveRow));
      }
      if (error) throw error;
      showMsg('success', 'Résumé removed.');
    } catch (err) {
      console.error(err);
      showMsg('error', err.message || 'Could not remove file.');
    } finally {
      setResumeUploading(false);
    }
  };

  // ─── Experience helpers ───────────────────────────────────────────────────
  const addExperience = () =>
    setProfileData((prev) => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), company: '', position: '', start_date: '', end_date: '', current: false, description: '' }],
    }));

  const updateExperience = (id, field, value) =>
    setProfileData((prev) => ({ ...prev, experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));

  const removeExperience = (id) =>
    setProfileData((prev) => ({ ...prev, experience: prev.experience.filter((e) => e.id !== id) }));

  // ─── Education helpers ────────────────────────────────────────────────────
  const addEducation = () =>
    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), school: '', degree: '', field: '', start_date: '', end_date: '', current: false, gpa: '' }],
    }));

  const updateEducation = (id, field, value) =>
    setProfileData((prev) => ({ ...prev, education: prev.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)) }));

  const removeEducation = (id) =>
    setProfileData((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));

  // ─── Skills helpers ───────────────────────────────────────────────────────
  const addSkill = (skill) =>
    setProfileData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));

  const removeSkill = (index) =>
    setProfileData((prev) => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));

  // ─── Achievements helpers ─────────────────────────────────────────────────
  const addAchievement = () =>
    setProfileData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { id: Date.now(), title: '', description: '', date: '', type: 'award' }],
    }));

  const updateAchievement = (id, field, value) =>
    setProfileData((prev) => ({ ...prev, achievements: prev.achievements.map((a) => (a.id === id ? { ...a, [field]: value } : a)) }));

  const removeAchievement = (id) =>
    setProfileData((prev) => ({ ...prev, achievements: prev.achievements.filter((a) => a.id !== id) }));

  // ─── Mentor profile helpers ───────────────────────────────────────────────
  const updateMentorField = (field, value) =>
    setMentorProfile((prev) => ({ ...prev, [field]: value }));

  const addExpertise = (tag) =>
    setMentorProfile((prev) => ({ ...prev, expertise: [...prev.expertise, tag] }));

  const removeExpertise = (index) =>
    setMentorProfile((prev) => ({ ...prev, expertise: prev.expertise.filter((_, i) => i !== index) }));

  if (authLoading) return <LoadingSpinner label="Checking your session…" className="min-h-screen" />;
  if (loading) return <LoadingSpinner />;
  if (showPreview) return <ProfilePreview profileData={profileData} onBack={() => setShowPreview(false)} />;

  const isMentorTab = activeSection === 'mentor';
  const handleSave = isMentorTab ? saveMentorProfile : saveProfileData;
  const isSaving = isMentorTab ? savingMentor : saving;

  // ─── Hero metadata ──────────────────────────────────────────────────────
  // Display name + avatar come from auth metadata → mentor row → personal_info.
  const displayName =
    mentorProfile.name ||
    profileData.personal.full_name ||
    user.user_metadata?.full_name ||
    user.email ||
    'Your Profile';
  const displayTitle =
    mentorProfile.title ||
    profileData.personal.title ||
    (isMentor ? 'Mentor' : 'Member');
  const displaySubtitle = mentorProfile.company || profileData.personal.location || user.email;
  const avatarInitials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'B';
  const avatarUrl = mentorProfile.image_url || user.user_metadata?.avatar_url || '';

  // Simple completeness score for motivation (not stored). Skips account fields.
  const completionChecks = [
    !!profileData.personal.full_name,
    !!profileData.personal.title,
    !!profileData.personal.bio,
    !!profileData.personal.location,
    profileData.experience.length > 0,
    profileData.education.length > 0,
    profileData.skills.length > 0,
    !!profileData.personal.resume?.path,
  ];
  if (isMentor) {
    completionChecks.push(!!mentorProfile.bio, mentorProfile.expertise.length > 0);
  }
  const completionPct = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
  );

  const sectionMeta = {
    personal: { label: 'Personal', icon: User },
    resume: { label: 'Résumé', icon: FileText },
    experience: { label: 'Experience', icon: Briefcase },
    education: { label: 'Education', icon: GraduationCap },
    skills: { label: 'Skills', icon: Award },
    achievements: { label: 'Achievements', icon: Star },
    mentor: { label: 'Mentor Profile', icon: Star },
  };

  return (
    <div className="min-h-screen bg-bridge-page">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <div className="mb-8 overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-bridge-card">
          <div className="relative h-32 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.8),transparent_45%)]" />
          </div>
          <div className="px-6 pb-6 -mt-12 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                  />
                ) : (
                  <div className="h-24 w-24 shrink-0 rounded-2xl ring-4 ring-white shadow-lg bg-gradient-to-br from-stone-800 to-stone-900 text-white flex items-center justify-center text-2xl font-display font-bold">
                    {avatarInitials}
                  </div>
                )}
                <div className="min-w-0 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold font-display text-stone-900 truncate">{displayName}</h1>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isMentor ? 'bg-orange-100 text-orange-700' : 'bg-stone-100 text-stone-600'}`}>
                      {isMentor ? <Star className="h-3 w-3" /> : <User className="h-3 w-3" />}
                      {isMentor ? 'Mentor' : 'Member'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-600 truncate">{displayTitle}</p>
                  {displaySubtitle && displaySubtitle !== displayTitle && (
                    <p className="text-xs text-stone-500 truncate mt-0.5">{displaySubtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isMentorTab && (
                  <button
                    onClick={() => setShowPreview(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors shadow-sm"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl text-sm font-bold text-white hover:from-orange-500 hover:to-amber-400 transition-colors disabled:opacity-50 shadow-md shadow-orange-600/30"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </div>

            {/* Completion bar */}
            <div className="mt-6 rounded-2xl bg-stone-50 border border-stone-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Profile completion</p>
                <p className="text-sm font-bold text-stone-900 tabular-nums">{completionPct}%</p>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
              {completionPct < 100 && (
                <p className="mt-2 text-xs text-stone-500">
                  {isMentor
                    ? 'Complete your mentor profile so mentees can find and book you.'
                    : 'A complete profile helps mentors understand what you need.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertTriangle className="h-5 w-5 shrink-0" />}
            {message.text}
          </div>
        )}

        {/* ── Pill tabs ──────────────────────────────────────────────────── */}
        <div className="mb-6 overflow-x-auto">
          <nav className="inline-flex min-w-full gap-1 rounded-2xl bg-white border border-stone-200 p-1.5 shadow-sm sm:min-w-0">
            {sections.map((section) => {
              const Icon = sectionMeta[section]?.icon ?? User;
              const active = activeSection === section;
              return (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/30'
                      : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {sectionMeta[section]?.label ?? section}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-white rounded-3xl shadow-bridge-card border border-stone-100 p-6 sm:p-8">

          {/* ── Personal Information ── */}
          {activeSection === 'personal' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-stone-900">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'Full Name', field: 'full_name', type: 'text', placeholder: 'John Doe' },
                  { label: 'Professional Title', field: 'title', type: 'text', placeholder: 'Software Engineer' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
                    <input
                      type={type}
                      value={profileData.personal[field] || ''}
                      onChange={(e) => updatePersonalInfo(field, e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Bio</label>
                  <textarea
                    value={profileData.personal.bio || ''}
                    onChange={(e) => updatePersonalInfo('bio', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself…"
                  />
                </div>
                {[
                  { label: 'Email', field: 'email', type: 'email', placeholder: 'john@example.com' },
                  { label: 'Phone', field: 'phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
                  { label: 'Location', field: 'location', type: 'text', placeholder: 'San Francisco, CA' },
                  { label: 'Website', field: 'website', type: 'url', placeholder: 'https://johndoe.com' },
                  { label: 'LinkedIn', field: 'linkedin', type: 'url', placeholder: 'https://linkedin.com/in/johndoe' },
                  { label: 'GitHub', field: 'github', type: 'url', placeholder: 'https://github.com/johndoe' },
                ].map(({ label, field, type, placeholder }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-stone-700 mb-2">{label}</label>
                    <input
                      type={type}
                      value={profileData.personal[field] || ''}
                      onChange={(e) => updatePersonalInfo(field, e.target.value)}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'resume' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-stone-900">Résumé / CV</h2>
              </div>
              <p className="text-sm text-stone-500">
                Upload a PDF or Word file. It is stored privately; share the preview or download link when you apply or book sessions.
              </p>
              {profileData.personal.resume?.path ? (
                <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-stone-900">{profileData.personal.resume.filename || 'Résumé'}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      Uploaded {profileData.personal.resume.uploaded_at ? new Date(profileData.personal.resume.uploaded_at).toLocaleString() : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <ResumeDownloadButton meta={profileData.personal.resume} />
                    <button
                      type="button"
                      disabled={resumeUploading}
                      onClick={handleResumeRemove}
                      className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-600">No file uploaded yet.</p>
              )}
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer text-sm font-medium disabled:opacity-50">
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" disabled={resumeUploading} onChange={handleResumeUpload} />
                {resumeUploading ? 'Uploading…' : profileData.personal.resume ? 'Replace file' : 'Upload PDF or Word'}
              </label>
            </div>
          )}

          {/* ── Work Experience ── */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-stone-900">Work Experience</h2>
                </div>
                <button onClick={addExperience} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Experience
                </button>
              </div>
              <div className="space-y-4">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-stone-900">{exp.company || exp.position || 'New Entry'}</h3>
                      <button onClick={() => removeExperience(exp.id)} className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'Company', field: 'company', placeholder: 'Company Name' },
                        { label: 'Position', field: 'position', placeholder: 'Job Title' },
                      ].map(({ label, field, placeholder }) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
                          <input
                            type="text"
                            value={exp[field]}
                            onChange={(e) => updateExperience(exp.id, field, e.target.value)}
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Start Date</label>
                        <input type="month" value={exp.start_date} onChange={(e) => updateExperience(exp.id, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
                        <input type="month" value={exp.end_date} onChange={(e) => updateExperience(exp.id, 'end_date', e.target.value)}
                          disabled={exp.current}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors disabled:bg-stone-50" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1 cursor-pointer">
                          <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            className="rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
                          Currently working here
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} rows={3}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                          placeholder="Describe your responsibilities and achievements…" />
                      </div>
                    </div>
                  </div>
                ))}
                {profileData.experience.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p>No work experience added yet</p>
                    <button onClick={addExperience} className="mt-3 text-orange-500 hover:text-orange-600 font-medium">Add your first experience</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Education ── */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-stone-900">Education</h2>
                </div>
                <button onClick={addEducation} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Education
                </button>
              </div>
              <div className="space-y-4">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-stone-900">{edu.school || 'New Entry'}</h3>
                      <button onClick={() => removeEducation(edu.id)} className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: 'School', field: 'school', placeholder: 'University Name' },
                        { label: 'Degree', field: 'degree', placeholder: "Bachelor's, Master's, etc." },
                        { label: 'Field of Study', field: 'field', placeholder: 'Computer Science' },
                        { label: 'GPA', field: 'gpa', placeholder: '3.8' },
                      ].map(({ label, field, placeholder }) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
                          <input type="text" value={edu[field]} onChange={(e) => updateEducation(edu.id, field, e.target.value)}
                            className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                            placeholder={placeholder} />
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Start Date</label>
                        <input type="month" value={edu.start_date} onChange={(e) => updateEducation(edu.id, 'start_date', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
                        <input type="month" value={edu.end_date} onChange={(e) => updateEducation(edu.id, 'end_date', e.target.value)}
                          disabled={edu.current}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors disabled:bg-stone-50" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-stone-700 mb-1 cursor-pointer">
                          <input type="checkbox" checked={edu.current} onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                            className="rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
                          Currently studying here
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                {profileData.education.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p>No education added yet</p>
                    <button onClick={addEducation} className="mt-3 text-orange-500 hover:text-orange-600 font-medium">Add your education</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Skills ── */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-stone-900">Skills</h2>
              </div>
              {profileData.skills.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  <Award className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                  <p>No skills added yet — type below to add your first one</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {skill}
                      <button onClick={() => removeSkill(index)} className="text-orange-500 hover:text-orange-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <SkillInput onAdd={addSkill} />
            </div>
          )}

          {/* ── Achievements ── */}
          {activeSection === 'achievements' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-orange-500" />
                  <h2 className="text-xl font-semibold text-stone-900">Achievements</h2>
                </div>
                <button onClick={addAchievement} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Achievement
                </button>
              </div>
              <div className="space-y-4">
                {profileData.achievements.map((achievement) => (
                  <div key={achievement.id} className="border border-stone-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-stone-900">{achievement.title || 'New Achievement'}</h3>
                      <button onClick={() => removeAchievement(achievement.id)} className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
                        <input type="text" value={achievement.title} onChange={(e) => updateAchievement(achievement.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                          placeholder="Achievement Title" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                        <input type="month" value={achievement.date} onChange={(e) => updateAchievement(achievement.id, 'date', e.target.value)}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                        <textarea value={achievement.description} onChange={(e) => updateAchievement(achievement.id, 'description', e.target.value)} rows={3}
                          className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                          placeholder="Describe your achievement…" />
                      </div>
                    </div>
                  </div>
                ))}
                {profileData.achievements.length === 0 && (
                  <div className="text-center py-8 text-stone-500">
                    <Award className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                    <p>No achievements added yet</p>
                    <button onClick={addAchievement} className="mt-3 text-orange-500 hover:text-orange-600 font-medium">Add your first achievement</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Mentor Profile ── */}
          {activeSection === 'mentor' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="h-5 w-5 text-orange-500" />
                <h2 className="text-xl font-semibold text-stone-900">Mentor Profile</h2>
              </div>
              <p className="text-sm text-stone-500 -mt-2">This information appears on your public mentor listing that mentees browse.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Display Name</label>
                  <input type="text" value={mentorProfile.name} onChange={(e) => updateMentorField('name', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="Jane Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Job Title</label>
                  <input type="text" value={mentorProfile.title} onChange={(e) => updateMentorField('title', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="Senior Product Manager" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Company</label>
                  <input type="text" value={mentorProfile.company} onChange={(e) => updateMentorField('company', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="Google" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Industry</label>
                  <input type="text" value={mentorProfile.industry} onChange={(e) => updateMentorField('industry', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="Technology" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Years of Experience</label>
                  <input type="number" min="0" max="50" value={mentorProfile.years_experience} onChange={(e) => updateMentorField('years_experience', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Session Rate (USD/hr, 0 = free)</label>
                  <input type="number" min="0" value={mentorProfile.session_rate} onChange={(e) => updateMentorField('session_rate', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="0" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-2">Bio / About</label>
                  <textarea value={mentorProfile.bio} onChange={(e) => updateMentorField('bio', e.target.value)} rows={4}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors resize-none"
                    placeholder="Describe your experience and what you can help mentees with…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Profile Image URL</label>
                  <input type="url" value={mentorProfile.image_url} onChange={(e) => updateMentorField('image_url', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="https://…" />
                  {mentorProfile.image_url && (
                    <img src={mentorProfile.image_url} alt="Preview" className="mt-2 h-16 w-16 rounded-xl object-cover border border-stone-200" onError={(e) => (e.target.style.display = 'none')} />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Tier</label>
                  <select value={mentorProfile.tier} onChange={(e) => updateMentorField('tier', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors">
                    <option value="rising">Rising</option>
                    <option value="established">Established</option>
                    <option value="expert">Expert</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">LinkedIn</label>
                  <input type="url" value={mentorProfile.linkedin_url} onChange={(e) => updateMentorField('linkedin_url', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="https://linkedin.com/in/…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">GitHub</label>
                  <input type="url" value={mentorProfile.github_url} onChange={(e) => updateMentorField('github_url', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="https://github.com/…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Website</label>
                  <input type="url" value={mentorProfile.website_url} onChange={(e) => updateMentorField('website_url', e.target.value)}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                    placeholder="https://…" />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-stone-700 cursor-pointer">
                    <input type="checkbox" checked={mentorProfile.available} onChange={(e) => updateMentorField('available', e.target.checked)}
                      className="rounded border-stone-300 text-orange-500 focus:ring-orange-500" />
                    Available for new sessions
                  </label>
                </div>
              </div>

              {/* Expertise tags */}
              <div className="border-t border-stone-100 pt-6">
                <label className="block text-sm font-medium text-stone-700 mb-3">Areas of Expertise</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {mentorProfile.expertise.map((tag, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {tag}
                      <button onClick={() => removeExpertise(index)} className="text-orange-500 hover:text-orange-700">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {mentorProfile.expertise.length === 0 && (
                    <p className="text-sm text-stone-400 italic">No expertise areas added yet</p>
                  )}
                </div>
                <ExpertiseInput onAdd={addExpertise} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Profile Preview / Resume ─────────────────────────────────────────────────
function ProfilePreview({ profileData, onBack }) {
  const { personal, experience, education, skills, achievements } = profileData;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-bridge-page">
      {/* Hide action bar on print */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 print:hidden">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Resume Preview</h1>
            <p className="text-stone-600">This is how mentors will see your profile</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-700 hover:bg-stone-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Save as PDF
            </button>
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-lg hover:from-orange-500 hover:to-amber-400 transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* Resume content — printable */}
      <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8 print:px-0 print:pb-0 print:max-w-none">
        <div className="bg-white rounded-2xl shadow-bridge-card overflow-hidden print:shadow-none print:rounded-none">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">{personal.full_name || 'Your Name'}</h2>
            <p className="text-lg opacity-90 mb-4">{personal.title || 'Professional Title'}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {personal.email && <span className="flex items-center gap-2"><Mail className="h-4 w-4" />{personal.email}</span>}
              {personal.phone && <span className="flex items-center gap-2"><Phone className="h-4 w-4" />{personal.phone}</span>}
              {personal.location && <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{personal.location}</span>}
            </div>
          </div>

          <div className="p-8">
            {personal.bio && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-3 border-b border-stone-100 pb-2">About</h3>
                <p className="text-stone-600 leading-relaxed">{personal.bio}</p>
              </div>
            )}

            {personal.resume?.path && (
              <div className="mb-8 rounded-xl border border-stone-200 bg-stone-50/80 p-4">
                <h3 className="text-lg font-semibold text-stone-900 mb-3 border-b border-stone-100 pb-2">Résumé</h3>
                <p className="text-sm text-stone-600 mb-2">{personal.resume.filename || 'Attached CV'}</p>
                <ResumeDownloadButton meta={personal.resume} />
              </div>
            )}

            {experience.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4 border-b border-stone-100 pb-2">Work Experience</h3>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="border-l-2 border-orange-200 pl-4">
                      <h4 className="font-semibold text-stone-900">{exp.position}</h4>
                      <p className="text-stone-600">{exp.company}</p>
                      <p className="text-sm text-stone-500 mb-1">
                        {exp.start_date && new Date(exp.start_date + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        {' – '}
                        {exp.current ? 'Present' : exp.end_date && new Date(exp.end_date + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                      {exp.description && <p className="text-stone-600 text-sm whitespace-pre-line">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {education.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4 border-b border-stone-100 pb-2">Education</h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id} className="border-l-2 border-orange-200 pl-4">
                      <h4 className="font-semibold text-stone-900">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h4>
                      <p className="text-stone-600">{edu.school}</p>
                      <p className="text-sm text-stone-500">
                        {edu.start_date && new Date(edu.start_date + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        {' – '}
                        {edu.current ? 'Present' : edu.end_date && new Date(edu.end_date + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        {edu.gpa ? ` · GPA: ${edu.gpa}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4 border-b border-stone-100 pb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {achievements.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-stone-900 mb-4 border-b border-stone-100 pb-2">Achievements</h3>
                <div className="space-y-3">
                  {achievements.map((a) => (
                    <div key={a.id} className="border-l-2 border-orange-200 pl-4">
                      <h4 className="font-semibold text-stone-900">{a.title}</h4>
                      {a.date && <p className="text-sm text-stone-500 mb-1">{new Date(a.date + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</p>}
                      {a.description && <p className="text-stone-600 text-sm">{a.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(personal.website || personal.linkedin || personal.github) && (
              <div>
                <h3 className="text-lg font-semibold text-stone-900 mb-4 border-b border-stone-100 pb-2">Links</h3>
                <div className="flex flex-wrap gap-4">
                  {personal.website && <a href={personal.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:text-orange-700"><Globe className="h-4 w-4" />Website</a>}
                  {personal.linkedin && <a href={personal.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:text-orange-700"><Linkedin className="h-4 w-4" />LinkedIn</a>}
                  {personal.github && <a href={personal.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-600 hover:text-orange-700"><Github className="h-4 w-4" />GitHub</a>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:shadow-none, .print\\:shadow-none * { visibility: visible; }
          .print\\:shadow-none { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
