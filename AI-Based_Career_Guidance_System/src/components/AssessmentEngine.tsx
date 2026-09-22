import React, { useState, useEffect } from 'react';
import { AssessmentQuestion, User } from '../types';
import { ClipboardCheck, ArrowRight, ArrowLeft, Check, Award, Brain, Target, Sparkles } from 'lucide-react';

interface AssessmentEngineProps {
  currentUser: User | null;
  onAssessmentCompleted: (updatedUser: User) => void;
}

export default function AssessmentEngine({ currentUser, onAssessmentCompleted }: AssessmentEngineProps) {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState(1); // 1: Interests, 2: Personality, 3: Aptitude, 4: Skills, 5: Review
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Selections State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [mbtiAnswers, setMbtiAnswers] = useState<Record<string, string>>({});
  const [bigFiveAnswers, setBigFiveAnswers] = useState<Record<string, number>>({});
  const [aptitudeAnswers, setAptitudeAnswers] = useState<Record<string, string>>({});
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  // Static options for Interests
  const INTEREST_OPTIONS = [
    'Artificial Intelligence', 'Software Development', 'Web & App Design', 'Cyber Security',
    'Financial Analysis', 'Marketing Strategy', 'Teaching & Mentorship', 'Healthcare & Patient Care',
    'Graphic Design & Art', 'Data Visualization', 'Cloud Systems & Infrastructure', 'Product Analytics',
    'Creative Writing', 'Corporate Tax & Accounting'
  ];

  // Static options for Skills
  const SKILL_OPTIONS = [
    'Python', 'JavaScript', 'SQL', 'React.js', 'Node.js', 'TypeScript', 'Docker', 'AWS',
    'Java', 'C++', 'Data Structures', 'Web Analytics', 'Figma', 'System Design', 'Financial Accounting'
  ];

  useEffect(() => {
    // Load assessment questions from Express API
    setLoading(true);
    fetch('/api/assessments/questions')
      .then(res => res.json())
      .then(data => {
        setQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching questions:', err);
        setLoading(false);
      });
  }, []);

  // Prepopulate if user has already completed assessments
  useEffect(() => {
    if (currentUser && currentUser.profileCompleted) {
      if (currentUser.skills) setSelectedSkills(currentUser.skills);
      if (currentUser.interests) setSelectedInterests(currentUser.interests);
    }
  }, [currentUser]);

  const handleToggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSelectMBTI = (questionId: string, val: string) => {
    setMbtiAnswers({ ...mbtiAnswers, [questionId]: val });
  };

  const handleSelectBigFive = (questionId: string, val: number) => {
    setBigFiveAnswers({ ...bigFiveAnswers, [questionId]: val });
  };

  const handleSelectAptitude = (questionId: string, val: string) => {
    setAptitudeAnswers({ ...aptitudeAnswers, [questionId]: val });
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSubmitting(true);

    const submission = {
      mbtiAnswers,
      bigFiveAnswers,
      aptitudeAnswers,
      skillsSelected: selectedSkills,
      interestsSelected: selectedInterests
    };

    try {
      const response = await fetch('/api/assessments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, submission })
      });
      const data = await response.json();
      if (data.success && data.user) {
        onAssessmentCompleted(data.user);
      }
    } catch (err) {
      console.error('Error submitting assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const mbtiQuestions = questions.filter(q => q.type === 'mbti');
  const bigFiveQuestions = questions.filter(q => q.type === 'bigfive');
  const aptitudeQuestions = questions.filter(q => q.type === 'aptitude');

  return (
    <div className="mx-auto max-w-4xl p-6" id="assessment-container">
      
      {/* Header card with progress indicator */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
            <ClipboardCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Interactive Career Assessment</h1>
            <p className="text-xs text-slate-500">Combine psycho-metrics, skills, interests, and logic for AI Recommendations.</p>
          </div>
        </div>

        {/* Steps track */}
        <div className="mt-6 flex items-center justify-between">
          {[
            { step: 1, label: 'Interests' },
            { step: 2, label: 'Personality' },
            { step: 3, label: 'Aptitude Test' },
            { step: 4, label: 'Technical Skills' },
            { step: 5, label: 'Submit Review' }
          ].map((s) => (
            <div key={s.step} className="flex flex-1 items-center last:flex-none">
              <button
                onClick={() => currentStep > s.step && setCurrentStep(s.step)}
                disabled={currentStep < s.step}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  currentStep === s.step
                    ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                    : currentStep > s.step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
                id={`btn-assessment-step-indicator-${s.step}`}
              >
                {currentStep > s.step ? <Check className="h-4 w-4" /> : s.step}
              </button>
              <span className={`ml-2 hidden text-xs font-semibold md:inline-block ${
                currentStep === s.step ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
              <div className="mx-4 hidden h-px flex-1 bg-slate-200 md:block last:hidden"></div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white" id="assessment-loading">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800"></div>
            <p className="text-xs font-medium text-slate-500">Loading AI assessment engine questions...</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left" id="assessment-canvas-form">
          
          {/* STEP 1: INTERESTS */}
          {currentStep === 1 && (
            <div className="space-y-6" id="assessment-step-interests">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Target className="mr-2 h-4 w-4 text-slate-500" />
                  What core industries or domains intrigue you?
                </h2>
                <p className="text-xs text-slate-500 mt-1">Select all fields of career interest to match market trends.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      onClick={() => handleToggleInterest(interest)}
                      className={`flex items-center justify-between rounded-xl border p-4 text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50/50 text-slate-900 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                      id={`btn-toggle-interest-${interest.replace(/\s+/g, '-').toLowerCase()}`}
                    >
                      <span>{interest}</span>
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                        isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PERSONALITY (MBTI + BIG FIVE) */}
          {currentStep === 2 && (
            <div className="space-y-8" id="assessment-step-personality">
              
              {/* MBTI Questions */}
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Brain className="mr-2 h-4 w-4 text-slate-500" />
                  MBTI Choice Evaluation
                </h2>
                <p className="text-xs text-slate-500 mt-1">Forces choices between cognitive traits for alignment matches.</p>
                
                <div className="mt-4 space-y-4">
                  {mbtiQuestions.map((q, idx) => (
                    <div key={q.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                      <p className="text-xs font-semibold text-slate-700">Question {idx + 1}: {q.questionText}</p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {q.options.map(opt => {
                          const isSelected = mbtiAnswers[q.id] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              onClick={() => handleSelectMBTI(q.id, opt.value)}
                              className={`rounded-lg border px-4 py-2.5 text-left text-xs font-medium transition-all ${
                                isSelected
                                  ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                              }`}
                              id={`btn-mbti-${q.id}-${opt.value}`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Big Five Personality Rating */}
              <div className="border-t border-slate-100 pt-6">
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Sparkles className="mr-2 h-4 w-4 text-slate-500" />
                  Big Five Character Statements
                </h2>
                <p className="text-xs text-slate-500 mt-1">Rate how strongly you agree with each psychological description.</p>

                <div className="mt-4 space-y-4">
                  {bigFiveQuestions.map((q) => (
                    <div key={q.id} className="rounded-xl border border-slate-200 p-4 bg-white">
                      <p className="text-xs font-semibold text-slate-800">{q.questionText}</p>
                      
                      <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase text-slate-400">
                        <span>Strongly Disagree</span>
                        <span>Strongly Agree</span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = bigFiveAnswers[q.id] === val;
                          return (
                            <button
                              key={val}
                              onClick={() => handleSelectBigFive(q.id, val)}
                              className={`flex flex-col items-center justify-center rounded-lg border py-2.5 text-xs font-bold transition-all ${
                                isSelected
                                  ? 'border-slate-900 bg-slate-900 text-white shadow'
                                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white text-slate-600'
                              }`}
                              id={`btn-b5-${q.id}-${val}`}
                            >
                              <span>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* STEP 3: APTITUDE QUESTIONS */}
          {currentStep === 3 && (
            <div className="space-y-6" id="assessment-step-aptitude">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Award className="mr-2 h-4 w-4 text-slate-500" />
                  Problem Solving & Logical Aptitude
                </h2>
                <p className="text-xs text-slate-500 mt-1">Measures analytic ability, math skills, and cognitive reasoning limits.</p>
              </div>

              <div className="space-y-5">
                {aptitudeQuestions.map((q, idx) => (
                  <div key={q.id} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs font-bold text-slate-800">
                      Question {idx + 1}: <span className="font-normal text-slate-600">{q.questionText}</span>
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-2">
                      {q.options.map((opt) => {
                        const isSelected = aptitudeAnswers[q.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => handleSelectAptitude(q.id, opt.value)}
                            className={`flex items-center space-x-3 rounded-lg border px-4 py-2 text-left text-xs font-semibold transition-all ${
                              isSelected
                                ? 'border-slate-950 bg-slate-950 text-white shadow-sm'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                            }`}
                            id={`btn-aptitude-${q.id}-${opt.value}`}
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                              {opt.value}
                            </span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: CORE TECHNICAL SKILLS */}
          {currentStep === 4 && (
            <div className="space-y-6" id="assessment-step-skills">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Brain className="mr-2 h-4 w-4 text-slate-500" />
                  Select your active technical & soft skills
                </h2>
                <p className="text-xs text-slate-500 mt-1">Select skills that you are currently confident using or implementing.</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {SKILL_OPTIONS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => handleToggleSkill(skill)}
                      className={`flex items-center space-x-2.5 rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-slate-900 bg-slate-50/50 text-slate-900 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                      }`}
                      id={`btn-toggle-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
                        isSelected ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="truncate">{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW AND SUBMIT */}
          {currentStep === 5 && (
            <div className="space-y-6" id="assessment-step-review">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <ClipboardCheck className="mr-2 h-4 w-4 text-slate-500" />
                  Validate Profile Completion
                </h2>
                <p className="text-xs text-slate-500 mt-1">Confirm your answers below to calculate your matching career scope.</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Interests Tracked</h3>
                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedInterests.length > 0 ? selectedInterests.join(', ') : 'None selected.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Skills Listed</h3>
                    <p className="mt-1 font-semibold text-slate-700">
                      {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'None selected.'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">MBTI Answer Ratio</h3>
                    <p className="mt-1 font-semibold text-slate-700">
                      {Object.keys(mbtiAnswers).length} / {mbtiQuestions.length} statements evaluated
                    </p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-400 uppercase tracking-wide text-[10px]">Aptitude Progress</h3>
                    <p className="mt-1 font-semibold text-slate-700">
                      {Object.keys(aptitudeAnswers).length} / {aptitudeQuestions.length} test items completed
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4 text-xs text-amber-800">
                <p className="font-semibold">⚠️ Information Persistence Notice</p>
                <p className="mt-0.5 leading-relaxed text-amber-700/90">
                  Submitting this assessment immediately modifies your student dashboard profile data, triggering updated AI recommendations.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="mt-8 flex justify-between border-t border-slate-100 pt-5" id="assessment-nav-controls">
            <button
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
              className={`flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-slate-50 text-slate-600 ${
                currentStep === 1 ? 'opacity-40 cursor-not-allowed' : ''
              }`}
              id="btn-assessment-prev"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            {currentStep < 5 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                className="flex items-center space-x-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                id="btn-assessment-next"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
                id="btn-assessment-submit"
              >
                {submitting ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit and Analyze</span>
                    <Sparkles className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
