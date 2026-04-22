import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getAIResumeReview } from '../api/aiResumeReview';
import { uploadResumeToBucket, saveResumeReview, getResumeReview, deleteResumeReview } from '../api/resumeReview';
import PageGutterAtmosphere from '../components/PageGutterAtmosphere';
import { focusRing } from '../ui';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const LOADING_MESSAGES = [
  'Reading your resume…',
  'Evaluating your experience section…',
  'Checking formatting and structure…',
  'Calculating your score…',
  'Writing improvement suggestions…',
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', sub: '0–2 yrs', desc: 'Recent grads, career changers, and those just getting started.' },
  { value: 'mid', label: 'Mid Level', sub: '3–7 yrs', desc: 'Building expertise, taking on more ownership and scope.' },
  { value: 'senior', label: 'Senior Level', sub: '8+ yrs', desc: 'Deep expertise, leadership, and staff-to-executive roles.' },
];

const SECTION_LABELS = {
  contact_info: 'Contact Info',
  summary: 'Summary / Objective',
  experience: 'Work Experience',
  skills: 'Skills',
  education: 'Education',
  formatting: 'Formatting & Structure',
};

const SECTION_ORDER = ['contact_info', 'summary', 'experience', 'skills', 'education', 'formatting'];

function scoreColors(score) {
  if (score >= 90) return { text: 'text-emerald-600', bar: 'bg-emerald-500', ring: '#10b981', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (score >= 80) return { text: 'text-teal-600', bar: 'bg-teal-500', ring: '#14b8a6', badge: 'bg-teal-50 text-teal-800 border-teal-200' };
  if (score >= 70) return { text: 'text-amber-600', bar: 'bg-amber-500', ring: '#f59e0b', badge: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (score >= 60) return { text: 'text-orange-600', bar: 'bg-orange-500', ring: '#f97316', badge: 'bg-orange-50 text-orange-800 border-orange-200' };
  return { text: 'text-red-600', bar: 'bg-red-500', ring: '#ef4444', badge: 'bg-red-50 text-red-800 border-red-200' };
}

function ScoreRing({ score }) {
  const RADIUS = 52;
  const STROKE = 8;
  const SIZE = (RADIUS + STROKE) * 2;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const colors = scoreColors(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={STROKE}
        />
        <circle
          cx={RADIUS + STROKE}
          cy={RADIUS + STROKE}
          r={RADIUS}
          fill="none"
          stroke={colors.ring}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-display text-4xl font-bold tabular-nums ${colors.text}`}>{score}</span>
        <span className="text-xs font-semibold text-stone-400">/ 100</span>
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const colors = scoreColors(score);
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar}`}
        style={{ width: `${score}%` }}
      />
    </div>
  );
}

function SectionCard({ sectionKey, section }) {
  const [expanded, setExpanded] = useState(false);
  const colors = scoreColors(section.score);
  const hasRewrites = Array.isArray(section.rewrites) && section.rewrites.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-sm">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-stone-800">{SECTION_LABELS[sectionKey]}</h3>
          <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.badge}`}>
            {section.score}/100
          </span>
        </div>
        <div className="mt-2.5">
          <ScoreBar score={section.score} />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">{section.feedback}</p>

        {hasRewrites && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className={`mt-3 flex items-center gap-1.5 text-xs font-semibold text-violet-700 transition hover:text-violet-900 ${focusRing}`}
          >
            <motion.svg
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="h-3.5 w-3.5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </motion.svg>
            {expanded ? 'Hide' : 'Show'} rewrite suggestions
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasRewrites && (
          <motion.div
            key="rewrites"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-stone-100 bg-violet-50/40 px-5 pb-4 pt-3">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-600">
                Rewrite Suggestions
              </p>
              <div className="space-y-2.5">
                {section.rewrites.map((rw, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.18 }}
                    className="rounded-xl border border-violet-100/80 bg-white px-4 py-3 text-sm leading-relaxed text-stone-700 shadow-sm"
                  >
                    {rw}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function LoadingView({ msgIdx }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative mb-8 flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-stone-100 border-t-violet-500" />
        <svg className="h-8 w-8 text-violet-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>
      <div className="h-7 overflow-hidden">
        {LOADING_MESSAGES.map((msg, i) => (
          <p
            key={msg}
            className="text-center font-display text-lg font-semibold text-stone-900 transition-all duration-300"
            style={{
              opacity: i === msgIdx ? 1 : 0,
              transform: `translateY(${(i - msgIdx) * 100}%)`,
              position: i === msgIdx ? 'static' : 'absolute',
              pointerEvents: 'none',
            }}
          >
            {msg}
          </p>
        ))}
      </div>
      <p className="mt-3 text-sm text-stone-500">This takes about 15–30 seconds</p>
    </div>
  );
}

export default function ResumeReview() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState('upload'); // 'upload' | 'loading' | 'results'
  const [experienceLevel, setExperienceLevel] = useState('');
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [review, setReview] = useState(null);
  const [savedDate, setSavedDate] = useState(null);
  const [apiError, setApiError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);
  const didLoadRef = useRef(false);

  // Auth gate
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/resume' } });
    }
  }, [user, authLoading, navigate]);

  // Load existing review on mount
  useEffect(() => {
    if (!user || didLoadRef.current) return;
    didLoadRef.current = true;
    void (async () => {
      const { data } = await getResumeReview(user.id);
      if (data) {
        setReview(data);
        setSavedDate(data.created_at);
        setPageState('results');
      }
    })();
  }, [user]);

  // Rotate loading messages
  useEffect(() => {
    if (pageState !== 'loading') return;
    setLoadingMsgIdx(0);
    const id = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(id);
  }, [pageState]);

  function validateFile(f) {
    if (!f) return 'Please select a file.';
    if (f.type !== 'application/pdf') return 'Only PDF files are accepted.';
    if (f.size > MAX_FILE_BYTES) return `File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max is 5 MB.`;
    return '';
  }

  function handleFileSelect(f) {
    if (!f) return;
    const err = validateFile(f);
    setFileError(err);
    if (!err) setFile(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    handleFileSelect(f);
  }

  async function analyzeResume() {
    if (!file || !experienceLevel) return;
    setApiError('');
    setSaveError('');
    setPageState('loading');

    let base64;
    try {
      base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch {
      setApiError('Could not read the file. Please try again.');
      setPageState('upload');
      return;
    }

    try {
      const reviewData = await getAIResumeReview({ resumeBase64: base64, experienceLevel });

      let fileUrl = null;
      try {
        fileUrl = await uploadResumeToBucket(user.id, file);
      } catch {
        setSaveError('Resume could not be saved to storage, but your review is ready.');
      }

      try {
        await saveResumeReview(user.id, {
          experience_level: experienceLevel,
          numeric_score: reviewData.numeric_score,
          letter_grade: reviewData.letter_grade,
          sections: reviewData.sections,
          overall_feedback: reviewData.overall_feedback,
          resume_file_url: fileUrl,
        });
        setSavedDate(new Date().toISOString());
      } catch {
        setSaveError((prev) => prev || 'Review could not be saved to your account, but is shown below.');
      }

      setReview({ ...reviewData, experience_level: experienceLevel });
      setPageState('results');
    } catch (e) {
      setApiError(e.message || 'Something went wrong analyzing your resume.');
      setPageState('upload');
    }
  }

  async function handleUploadNew() {
    setDeleting(true);
    await deleteResumeReview(user.id);
    setDeleting(false);
    setReview(null);
    setSavedDate(null);
    setFile(null);
    setFileError('');
    setApiError('');
    setSaveError('');
    setExperienceLevel('');
    setPageState('upload');
  }

  const canAnalyze = Boolean(file && experienceLevel && !fileError);

  if (authLoading || (!user && !authLoading)) {
    return null;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[var(--bridge-canvas)]">
      <PageGutterAtmosphere />

      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-stone-500">
            <li>
              <Link to="/" className={`rounded-md font-medium text-stone-600 transition hover:text-orange-800 ${focusRing}`}>
                Home
              </Link>
            </li>
            <li aria-hidden className="text-stone-300">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </li>
            <li className="font-medium text-stone-800">Resume Review</li>
          </ol>
        </nav>

        {/* ── STATE: LOADING ── */}
        {pageState === 'loading' && (
          <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/95 shadow-bridge-card">
            <LoadingView msgIdx={loadingMsgIdx} />
          </div>
        )}

        {/* ── STATE: UPLOAD ── */}
        {pageState === 'upload' && (
          <>
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet-200/60 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                </svg>
                AI-Powered
              </div>
              <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight text-stone-900 sm:text-[2.25rem]">
                AI Resume Review
              </h1>
              <p className="mt-2 text-base leading-relaxed text-stone-600">
                Get an honest, detailed grade on your resume from our AI career coach — with specific rewrite suggestions to help you stand out.
              </p>
            </div>

            {/* API error */}
            {apiError && (
              <div className="mb-6 rounded-2xl border border-red-200/80 bg-red-50/90 px-5 py-4">
                <p className="text-sm font-semibold text-red-900">{apiError}</p>
                <p className="mt-1 text-xs text-red-700/80">Your file is still selected — click "Analyze My Resume" to try again.</p>
              </div>
            )}

            {/* Step 1: Experience level */}
            <div className="mb-6 rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card">
              <h2 className="mb-1 text-sm font-bold uppercase tracking-[0.16em] text-stone-500">
                Step 1 — Experience Level
              </h2>
              <p className="mb-4 text-sm text-stone-600">This lets our AI grade you against the right benchmark.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {EXPERIENCE_LEVELS.map(({ value, label, sub, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setExperienceLevel(value)}
                    className={`flex flex-col rounded-2xl border p-4 text-left transition ${
                      experienceLevel === value
                        ? 'border-violet-400/70 bg-violet-50/70 ring-2 ring-violet-400/60 ring-offset-2'
                        : 'border-stone-200/80 bg-white hover:border-stone-300/80'
                    } ${focusRing}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-stone-900">{label}</span>
                      <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-500">
                        {sub}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-snug text-stone-500">{desc}</p>
                    {experienceLevel === value && (
                      <div className="mt-2.5 flex items-center gap-1 text-[11px] font-semibold text-violet-700">
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Upload */}
            <div className="mb-6 rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card">
              <h2 className="mb-1 text-sm font-bold uppercase tracking-[0.16em] text-stone-500">
                Step 2 — Upload Your Resume
              </h2>
              <p className="mb-4 text-sm text-stone-600">PDF only · max 5 MB · text-based (not a scanned image)</p>

              {file ? (
                <div className="flex items-center justify-between rounded-2xl border border-emerald-200/80 bg-emerald-50/60 px-4 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <svg className="h-5 w-5 text-emerald-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-800">{file.name}</p>
                      <p className="text-xs text-stone-500">{(file.size / 1024).toFixed(0)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); setFileError(''); }}
                    className={`ml-3 shrink-0 rounded-full p-1.5 text-stone-400 transition hover:bg-red-50 hover:text-red-500 ${focusRing}`}
                    aria-label="Remove file"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
                    dragOver
                      ? 'border-violet-400/80 bg-violet-50/50'
                      : 'border-stone-200 bg-stone-50/50 hover:border-violet-300/70 hover:bg-violet-50/30'
                  }`}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <svg className="h-7 w-7 text-stone-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-stone-700">
                    Drop your PDF here, or{' '}
                    <span className="text-violet-600 underline decoration-violet-300/60 underline-offset-2">
                      click to browse
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-stone-400">PDF only · max 5 MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  />
                </div>
              )}

              {fileError && (
                <p className="mt-2 text-xs font-medium text-red-600">{fileError}</p>
              )}
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={analyzeResume}
              disabled={!canAnalyze}
              className={`w-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-400 disabled:pointer-events-none disabled:opacity-40 ${focusRing}`}
            >
              Analyze My Resume
            </button>
            <p className="mt-3 text-center text-xs text-stone-400">
              Your resume is stored privately and only used to generate your review.
            </p>
          </>
        )}

        {/* ── STATE: RESULTS ── */}
        {pageState === 'results' && review && (
          <>
            {saveError && (
              <div className="mb-5 rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
                {saveError}
              </div>
            )}

            {/* Score hero card */}
            <div className="mb-6 overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card sm:p-8">
              <div className="absolute left-0 right-0 top-0 hidden h-0.5 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                <div className="shrink-0">
                  <ScoreRing score={review.numeric_score} />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <span className={`font-display text-5xl font-bold ${scoreColors(review.numeric_score).text}`}>
                      {review.letter_grade}
                    </span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${scoreColors(review.numeric_score).badge}`}>
                      {review.numeric_score}/100
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Graded as:{' '}
                    <span className="text-stone-600">
                      {review.experience_level === 'entry' ? 'Entry Level (0–2 yrs)'
                        : review.experience_level === 'mid' ? 'Mid Level (3–7 yrs)'
                        : 'Senior Level (8+ yrs)'}
                    </span>
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-stone-600 sm:text-base">
                    {review.overall_feedback}
                  </p>
                </div>
              </div>
            </div>

            {/* Section breakdown */}
            <div className="mb-6">
              <h2 className="mb-4 font-display text-lg font-semibold text-stone-900">
                Section Breakdown
              </h2>
              <div className="space-y-3">
                {SECTION_ORDER.map((key) => {
                  const section = review.sections?.[key];
                  if (!section) return null;
                  return <SectionCard key={key} sectionKey={key} section={section} />;
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-[1.75rem] border border-stone-200/80 bg-white/95 p-6 shadow-bridge-card">
              <h2 className="mb-1 font-display text-base font-semibold text-stone-900">
                Ready to improve your score?
              </h2>
              <p className="mb-5 text-sm text-stone-500">
                Work with a mentor who can give you hands-on feedback — or upload a revised resume to see your progress.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/mentors"
                  state={{ openAIMatch: true }}
                  className={`flex-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-md shadow-violet-500/25 transition hover:from-violet-500 hover:to-indigo-400 ${focusRing}`}
                >
                  Find a Mentor to Help Improve This
                </Link>
                <button
                  type="button"
                  onClick={handleUploadNew}
                  disabled={deleting}
                  className={`flex-1 rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:opacity-50 ${focusRing}`}
                >
                  {deleting ? 'Clearing…' : 'Upload a New Resume'}
                </button>
              </div>
              {savedDate && (
                <p className="mt-4 text-center text-xs text-stone-400">
                  Last analyzed:{' '}
                  {new Date(savedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
