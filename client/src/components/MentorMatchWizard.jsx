import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SESSION_TYPES } from '../constants/sessionTypes';
import { focusRing } from '../ui';

const TOTAL_STEPS = 5;

const YEARS_OPTIONS = [
  { label: 'Student', value: 'student' },
  { label: 'Less than 1 year', value: 'less_than_1' },
  { label: '1–3 years', value: '1_3' },
  { label: '3–5 years', value: '3_5' },
  { label: '5+ years', value: '5_plus' },
];

const INDUSTRY_OPTIONS = [
  { label: 'Technology', value: 'technology' },
  { label: 'Finance', value: 'finance' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Data Science', value: 'data science' },
  { label: 'Education', value: 'education' },
  { label: 'Law', value: 'law' },
];

const GOAL_OPTIONS = [
  'Land my first job',
  'Switch industries',
  'Get promoted',
  'Prepare for interviews',
  'Improve my resume',
  'Build my network',
  'Navigate a career pivot',
  'Get into graduate school',
  'Negotiate salary',
  'Build leadership skills',
];

const AVAILABILITY_OPTIONS = [
  { label: 'Weekdays', value: 'weekdays' },
  { label: 'Evenings', value: 'evenings' },
  { label: 'Weekends', value: 'weekends' },
  { label: 'Flexible', value: 'flexible' },
];

const stepVariants = {
  enter: (dir) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

function SelectChip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        selected
          ? 'border-transparent bg-gradient-to-r from-stone-900 to-stone-800 text-amber-50 shadow-sm'
          : 'border-stone-200 bg-white text-stone-700 hover:border-orange-300/70'
      } ${focusRing}`}
    >
      {label}
    </button>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-600">{msg}</p>;
}

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-sm font-semibold text-stone-800">{children}</label>
  );
}

export default function MentorMatchWizard({ onComplete, onClose, prefill }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [errors, setErrors] = useState({});

  const [currentPosition, setCurrentPosition] = useState(prefill?.current_position ?? '');
  const [yearsExperience, setYearsExperience] = useState(prefill?.years_experience ?? '');
  const [targetRole, setTargetRole] = useState(prefill?.target_role ?? '');
  const [targetIndustry, setTargetIndustry] = useState(prefill?.target_industry ?? '');
  const [topGoals, setTopGoals] = useState(prefill?.top_goals ?? []);
  const [sessionTypesNeeded, setSessionTypesNeeded] = useState(prefill?.session_types_needed ?? []);
  const [availability, setAvailability] = useState(prefill?.availability ?? '');
  const [bioSummary, setBioSummary] = useState(prefill?.bio_summary ?? '');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeBase64, setResumeBase64] = useState(null);

  const hasPrefill = Boolean(prefill);

  function toggleArrayItem(arr, setArr, value) {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  function handleResumeChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setResumeBase64(ev.target.result.split(',')[1] ?? null);
    reader.readAsDataURL(file);
  }

  function removeResume() {
    setResumeFile(null);
    setResumeBase64(null);
  }

  function validate(currentStep) {
    const errs = {};
    if (currentStep === 1) {
      if (!currentPosition.trim()) errs.currentPosition = 'Please enter your current role.';
      if (!yearsExperience) errs.yearsExperience = 'Please select your experience level.';
    }
    if (currentStep === 2) {
      if (!targetRole.trim()) errs.targetRole = 'Please enter your target role.';
      if (!targetIndustry) errs.targetIndustry = 'Please select a target industry.';
    }
    if (currentStep === 3) {
      if (topGoals.length === 0) errs.topGoals = 'Select at least one goal.';
    }
    if (currentStep === 4) {
      if (sessionTypesNeeded.length === 0) errs.sessionTypesNeeded = 'Select at least one session type.';
      if (!availability) errs.availability = 'Please select your availability.';
    }
    if (currentStep === 5) {
      if (bioSummary.trim().length < 50) errs.bioSummary = 'Please write at least 50 characters.';
    }
    return errs;
  }

  function goNext() {
    const errs = validate(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    if (step < TOTAL_STEPS) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      onComplete({
        currentPosition: currentPosition.trim(),
        targetRole: targetRole.trim(),
        targetIndustry,
        yearsExperience,
        topGoals,
        sessionTypesNeeded,
        availability,
        bioSummary: bioSummary.trim(),
        resumeBase64: resumeBase64 ?? null,
      });
    }
  }

  function goBack() {
    if (step > 1) {
      setErrors({});
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }

  const STEP_TITLES = [
    'Where are you now?',
    'Where do you want to go?',
    'What are your top goals?',
    'What kind of help do you need?',
    'Tell us about yourself',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white shadow-2xl">

        {/* Header */}
        <div className="border-b border-stone-100 px-7 pb-5 pt-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">
                Step {step} of {TOTAL_STEPS}
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-stone-900">
                {STEP_TITLES[step - 1]}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className={`mt-0.5 shrink-0 rounded-full p-2 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 ${focusRing}`}
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Prefill notice */}
        {hasPrefill && (
          <div className="mx-7 mt-5 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-sm text-amber-900">
            We&apos;ve loaded your previous answers — update anything that&apos;s changed.
          </div>
        )}

        {/* Step content */}
        <div className="overflow-hidden px-7 py-6" style={{ minHeight: 280 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >

              {/* ── Step 1 ── */}
              {step === 1 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <Label>Current role</Label>
                    <input
                      type="text"
                      placeholder="e.g. Recent CS Graduate, Marketing Coordinator"
                      value={currentPosition}
                      onChange={(e) => setCurrentPosition(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25"
                    />
                    <FieldError msg={errors.currentPosition} />
                  </div>
                  <div>
                    <Label>Years of experience</Label>
                    <div className="flex flex-wrap gap-2">
                      {YEARS_OPTIONS.map(({ label, value }) => (
                        <SelectChip
                          key={value}
                          label={label}
                          selected={yearsExperience === value}
                          onClick={() => setYearsExperience(value)}
                        />
                      ))}
                    </div>
                    <FieldError msg={errors.yearsExperience} />
                  </div>
                </div>
              )}

              {/* ── Step 2 ── */}
              {step === 2 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <Label>Target role</Label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer, Product Manager, Data Analyst"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25"
                    />
                    <FieldError msg={errors.targetRole} />
                  </div>
                  <div>
                    <Label>Target industry</Label>
                    <div className="flex flex-wrap gap-2">
                      {INDUSTRY_OPTIONS.map(({ label, value }) => (
                        <SelectChip
                          key={value}
                          label={label}
                          selected={targetIndustry === value}
                          onClick={() => setTargetIndustry(value)}
                        />
                      ))}
                    </div>
                    <FieldError msg={errors.targetIndustry} />
                  </div>
                </div>
              )}

              {/* ── Step 3 ── */}
              {step === 3 && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-stone-500">Pick everything that applies — you can select multiple.</p>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((goal) => (
                      <SelectChip
                        key={goal}
                        label={goal}
                        selected={topGoals.includes(goal)}
                        onClick={() => toggleArrayItem(topGoals, setTopGoals, goal)}
                      />
                    ))}
                  </div>
                  <FieldError msg={errors.topGoals} />
                </div>
              )}

              {/* ── Step 4 ── */}
              {step === 4 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <Label>Session types you need</Label>
                    <p className="mb-2.5 text-xs text-stone-500">Select all that apply.</p>
                    <div className="flex flex-wrap gap-2">
                      {SESSION_TYPES.map((type) => (
                        <SelectChip
                          key={type.key}
                          label={`${type.icon} ${type.name}`}
                          selected={sessionTypesNeeded.includes(type.key)}
                          onClick={() => toggleArrayItem(sessionTypesNeeded, setSessionTypesNeeded, type.key)}
                        />
                      ))}
                    </div>
                    <FieldError msg={errors.sessionTypesNeeded} />
                  </div>
                  <div>
                    <Label>Availability preference</Label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABILITY_OPTIONS.map(({ label, value }) => (
                        <SelectChip
                          key={value}
                          label={label}
                          selected={availability === value}
                          onClick={() => setAvailability(value)}
                        />
                      ))}
                    </div>
                    <FieldError msg={errors.availability} />
                  </div>
                </div>
              )}

              {/* ── Step 5 ── */}
              {step === 5 && (
                <div className="flex flex-col gap-5">
                  <div>
                    <Label>About you</Label>
                    <textarea
                      rows={4}
                      placeholder="Briefly describe your situation, what you're working toward, and anything that would help us find the right mentor for you."
                      value={bioSummary}
                      onChange={(e) => setBioSummary(e.target.value)}
                      className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 shadow-sm placeholder:text-stone-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/25"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <FieldError msg={errors.bioSummary} />
                      <span className={`ml-auto text-xs ${bioSummary.length < 50 ? 'text-stone-400' : 'text-emerald-600'}`}>
                        {bioSummary.length} / 50 min
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-4">
                    <p className="mb-2 text-sm font-semibold text-stone-800">
                      Upload your resume for better matches{' '}
                      <span className="font-normal text-stone-500">(optional)</span>
                    </p>
                    <p className="mb-3 text-xs text-stone-500">
                      Your resume helps our AI understand your background more deeply.
                    </p>
                    {resumeFile ? (
                      <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <svg className="h-4 w-4 shrink-0 text-sky-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
                          </svg>
                          <span className="truncate text-xs font-medium text-stone-700">{resumeFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeResume}
                          className={`ml-2 shrink-0 rounded-full p-1 text-stone-400 transition hover:bg-red-50 hover:text-red-500 ${focusRing}`}
                          aria-label="Remove resume"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-700 shadow-sm transition hover:border-orange-300/70 ${focusRing}`}>
                        <svg className="h-4 w-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload PDF
                        <input
                          type="file"
                          accept=".pdf"
                          className="sr-only"
                          onChange={handleResumeChange}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        <div className="flex items-center justify-between border-t border-stone-100 px-7 py-5">
          <button
            type="button"
            onClick={goBack}
            disabled={step === 1}
            className={`rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:pointer-events-none disabled:opacity-40 ${focusRing}`}
          >
            Back
          </button>
          <button
            type="button"
            onClick={goNext}
            className={`rounded-full border border-transparent bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/25 transition hover:from-orange-500 hover:to-amber-400 ${focusRing}`}
          >
            {step === TOTAL_STEPS ? 'Find My Mentors' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
