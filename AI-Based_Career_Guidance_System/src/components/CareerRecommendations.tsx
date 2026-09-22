import React, { useState, useEffect } from 'react';
import { CareerRecommendation, User } from '../types';
import { Award, Compass, TrendingUp, Sparkles, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface CareerRecommendationsProps {
  currentUser: User | null;
  onNavigateToTab: (tab: string) => void;
}

export default function CareerRecommendations({ currentUser, onNavigateToTab }: CareerRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCareerIndex, setActiveCareerIndex] = useState(0);

  const fetchRecommendations = () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');
    
    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to generate predictions');
        return res.json();
      })
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error generating recommendations:', err);
        setError('The server experienced a temporary calculation glitch. Try recalculating below.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRecommendations();
  }, [currentUser]);

  if (!currentUser) return null;

  if (!currentUser.profileCompleted) {
    return (
      <div className="mx-auto max-w-2xl p-6 text-center" id="rec-uncompleted-prompt">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900">Assessments Needed</h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">
            To view personalized career matches, you must complete the psychological, skills, and aptitude assessments first.
          </p>
          <button
            onClick={() => onNavigateToTab('assessment')}
            className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow"
            id="btn-goto-assessment-from-recs"
          >
            Start Assessment Setup
          </button>
        </div>
      </div>
    );
  }

  const activeRec = recommendations[activeCareerIndex];

  return (
    <div className="mx-auto max-w-6xl p-6" id="recommendations-container">
      
      {/* Header section */}
      <div className="mb-6 flex flex-col justify-between space-y-4 text-left sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <Award className="mr-2 h-5 w-5 text-slate-800" />
            AI-Engine Career Recommendations
          </h1>
          <p className="text-xs text-slate-500">Calculated by correlating profile traits against global enterprise recruitment vacancies.</p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="flex items-center justify-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 text-slate-700"
          id="btn-recalculate-recs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Recommendations</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50/50 p-4 text-left text-xs text-rose-800 flex items-start space-x-3" id="rec-error-alert">
          <AlertCircle className="h-4 w-4 mt-0.5 text-rose-500" />
          <div>
            <p className="font-semibold">{error}</p>
            <p className="text-rose-600 mt-0.5">We will fall back to static high-fidelity recommendations for your profile.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3" id="rec-loading-skeleton">
          <div className="md:col-span-1 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100"></div>
            ))}
          </div>
          <div className="md:col-span-2 h-96 animate-pulse rounded-2xl bg-slate-50"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center" id="rec-empty-placeholder">
          <p className="text-xs font-semibold text-slate-500">Calculating your optimal pathways...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3" id="recommendations-layout">
          
          {/* Left Menu Selection (Matched Careers list) */}
          <div className="space-y-3 text-left md:col-span-1" id="rec-sidebar-menu">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Top Matched Career Paths</p>
            {recommendations.map((rec, idx) => {
              const isActive = activeCareerIndex === idx;
              return (
                <button
                  key={rec.careerId}
                  onClick={() => setActiveCareerIndex(idx)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-slate-900 bg-slate-900 text-white shadow'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                  id={`btn-select-rec-item-${rec.careerId}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold truncate pr-2">{rec.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {rec.overallScore}% Match
                    </span>
                  </div>
                  <p className={`mt-1 line-clamp-1 text-[11px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {rec.description}
                  </p>
                </button>
              );
            })}

            {/* Quick Action links */}
            <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 mt-6 text-left">
              <h3 className="text-xs font-bold text-slate-800">Need specific actions?</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Connect your top recommendation to structured roadmap modules or real-time recruitment positions.
              </p>
              <div className="mt-3.5 flex flex-col space-y-2">
                <button
                  onClick={() => onNavigateToTab('roadmaps')}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 text-center"
                >
                  Generate Roadmap Tracker
                </button>
                <button
                  onClick={() => onNavigateToTab('listings')}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-700 text-center"
                >
                  Check Open Positions & Academy
                </button>
              </div>
            </div>
          </div>

          {/* Right Career Overview Details Card */}
          {activeRec && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left md:col-span-2 space-y-6" id="rec-detail-card">
              
              {/* Detailed Header */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 flex items-center">
                    <Compass className="mr-2 h-4.5 w-4.5 text-slate-700" />
                    {activeRec.name}
                  </h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                    Calculated Overall Match Score: {activeRec.overallScore}%
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-500 mt-2">{activeRec.description}</p>
              </div>

              {/* Scoring Indices Grid */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">AI Metric Indexes</p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: 'Match Ratio', score: activeRec.matchScore, color: 'bg-indigo-500' },
                    { label: 'Market Demand', score: activeRec.demandScore, color: 'bg-emerald-500' },
                    { label: 'Salary Index', score: activeRec.salaryScore, color: 'bg-amber-500' },
                    { label: 'Sector Growth', score: activeRec.growthScore, color: 'bg-rose-500' }
                  ].map((idx) => (
                    <div key={idx.label} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 flex flex-col justify-between">
                      <span className="text-[10px] font-semibold text-slate-400">{idx.label}</span>
                      <div className="mt-2.5 flex items-baseline justify-between">
                        <span className="text-base font-bold text-slate-800">{idx.score}%</span>
                        <div className="h-1.5 w-12 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full ${idx.color}`} style={{ width: `${idx.score}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Skills list */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Core Skills Required</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeRec.requiredSkills.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 whitespace-nowrap"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Path & Financial indicators */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                
                <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="h-4 w-4 text-slate-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Financial Prospects</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none">Salary Target Scope</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">{activeRec.salaryRange}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none">Growth Trends</p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">{activeRec.growthTrends}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 p-4 space-y-3">
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="h-4 w-4 text-slate-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic & Future Scope</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none">Typical Education Path</p>
                    <ul className="mt-1 list-inside list-disc text-[11px] text-slate-500 space-y-0.5">
                      {activeRec.educationPath.slice(0, 2).map((p, i) => (
                        <li key={i} className="truncate">{p}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none">Future Outlook</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-normal">{activeRec.futureScope}</p>
                  </div>
                </div>

              </div>

              {/* Related Careers list */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Alternative Paths:</span>
                <div className="flex space-x-2">
                  {activeRec.relatedCareers.map((r) => (
                    <span
                      key={r}
                      className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-600 whitespace-nowrap"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
