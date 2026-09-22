import React, { useState } from 'react';
import { User, LearningRoadmap } from '../types';
import { Map, Clock, ArrowRight, BookOpen, CheckSquare, Award, Sparkles, FolderGit } from 'lucide-react';

interface RoadmapGeneratorProps {
  currentUser: User | null;
}

export default function RoadmapGenerator({ currentUser }: RoadmapGeneratorProps) {
  const [careerName, setCareerName] = useState('AI Engineer');
  const [durationType, setDurationType] = useState<'30day' | '90day' | '6month' | '1year'>('30day');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);

  const CAREER_OPTIONS = [
    'AI Engineer', 'Data Scientist', 'Software Engineer', 'Full Stack Developer', 'Cloud Engineer',
    'Cyber Security Analyst', 'DevOps Engineer', 'Business Analyst', 'Product Manager', 'Digital Marketer',
    'UX/UI Designer', 'Chartered Accountant', 'Teacher', 'Healthcare Professional'
  ];

  const handleGenerateRoadmap = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      const response = await fetch('/api/roadmaps/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, careerName, durationType })
      });
      const data = await response.json();
      setRoadmap(data);
    } catch (err) {
      console.error('Error generating roadmap:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6" id="roadmaps-container">
      
      {/* Header */}
      <div className="mb-6 text-left">
        <h1 className="text-xl font-bold text-slate-900 flex items-center">
          <Map className="mr-2 h-5 w-5 text-slate-800" />
          Learning Roadmap Timetable Generator
        </h1>
        <p className="text-xs text-slate-500 mt-1">Select a career target and timeline schedule to generate step-by-step milestones, projects, and certifications.</p>
      </div>

      {/* Control parameters Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-left" id="roadmap-controls-card">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Career</label>
            <select
              value={careerName}
              onChange={(e) => setCareerName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 bg-white"
            >
              {CAREER_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Timeline Duration</label>
            <div className="grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
              {[
                { type: '30day', label: '30D' },
                { type: '90day', label: '90D' },
                { type: '6month', label: '6M' },
                { type: '1year', label: '1Y' }
              ].map((d) => (
                <button
                  key={d.type}
                  onClick={() => setDurationType(d.type as any)}
                  className={`rounded-lg py-1.5 text-center text-[10px] font-bold transition-all ${
                    durationType === d.type ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  id={`btn-select-duration-${d.type}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 shadow-sm transition-all"
              id="btn-trigger-roadmap-generation"
            >
              {loading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Generating Roadmaps...</span>
                </>
              ) : (
                <>
                  <span>Compile Custom Timeline</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Loading Block */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center" id="roadmap-loading-pane">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
            <Clock className="h-6 w-6 animate-spin text-slate-600" />
          </div>
          <p className="mt-4 text-xs font-bold text-slate-700">Synthesizing milestones using Cognitive Core...</p>
          <p className="text-[11px] text-slate-400 mt-1">Cross-referencing syllabus standards with your skills background.</p>
        </div>
      )}

      {/* Main Roadmap Display */}
      {!loading && roadmap && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 text-left" id="roadmap-results-pane">
          
          {/* Timeline Milestones (Left/Middle Column) */}
          <div className="lg:col-span-2 space-y-6" id="roadmap-timeline-col">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chronological Milestones</p>
            
            <div className="relative border-l-2 border-slate-150 pl-6 ml-3 space-y-6">
              {roadmap.steps.map((step, index) => (
                <div key={step.id} className="relative" id={`roadmap-step-block-${step.id}`}>
                  
                  {/* Circle Pin indicator */}
                  <div className="absolute -left-10 top-0.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-slate-950 text-white font-bold text-[10px] ring-4 ring-white shadow">
                    {index + 1}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                    <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                      <div>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600 leading-none">
                          {step.duration}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 mt-1.5">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">{step.description}</p>

                    {/* Resources & Projects Grid */}
                    <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                      
                      {/* Learning links */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                          <BookOpen className="mr-1 h-3 w-3" /> External Learning Resources
                        </span>
                        <ul className="space-y-1 text-xs">
                          {step.resources.map((r, i) => (
                            <li key={i}>
                              <a
                                href={r.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold text-slate-800 hover:text-slate-950 underline flex items-center truncate"
                              >
                                {r.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Projects to build */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                          <FolderGit className="mr-1 h-3 w-3" /> Target Portfolio Project
                        </span>
                        <ul className="list-inside list-disc text-xs text-slate-500 space-y-0.5">
                          {step.projects.map((p, i) => (
                            <li key={i} className="truncate">{p}</li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* Credentials & Skill tags */}
                    <div className="border-t border-slate-100 pt-3 flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0 text-xs">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase mr-1">Skills:</span>
                        {step.skillMilestones.map((s) => (
                          <span key={s} className="rounded bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            {s}
                          </span>
                        ))}
                      </div>
                      
                      {step.certifications.length > 0 && (
                        <div className="flex items-center space-x-1 font-bold text-[10px] text-slate-400 uppercase tracking-wide">
                          <Award className="h-3.5 w-3.5 text-slate-500" />
                          <span>{step.certifications[0]}</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Guidance Side Card (Right Column) */}
          <div className="lg:col-span-1 space-y-6" id="roadmap-guidance-col">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Counseling Advisor</p>
            
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-slate-800" />
                <h4 className="text-xs font-bold text-slate-900">Custom Guidance Strategy</h4>
              </div>
              <p className="text-xs leading-relaxed text-slate-500">
                {roadmap.aiGuidance}
              </p>
              <div className="rounded-xl bg-slate-50 border border-slate-150 p-3.5 text-[10px] text-slate-600 space-y-1">
                <p className="font-bold uppercase tracking-wider text-slate-400 text-[9px]">Syllabus standards applied:</p>
                <p className="leading-relaxed">This roadmap is formatted sequentially, enabling clean portfolio setups before escalating to complex microservices or fiscal audits.</p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Empty default prompt */}
      {!loading && !roadmap && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center" id="roadmap-empty-prompt">
          <p className="text-xs font-semibold text-slate-500">Select a target career and schedule duration above to generate an actionable timeline.</p>
        </div>
      )}

    </div>
  );
}
