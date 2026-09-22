import React, { useState, useEffect } from 'react';
import { User, JobRecommendation, UniversityRecommendation, ScholarshipRecommendation } from '../types';
import { GraduationCap, Briefcase, Award, Search, Building2, MapPin, DollarSign, Calendar, ExternalLink } from 'lucide-react';

interface JobUniversityScholarshipProps {
  currentUser: User | null;
}

export default function JobUniversityScholarship({ currentUser }: JobUniversityScholarshipProps) {
  const [activeSegment, setActiveSegment] = useState<'jobs' | 'universities' | 'scholarships'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data lists
  const [jobs, setJobs] = useState<JobRecommendation[]>([]);
  const [universities, setUniversities] = useState<UniversityRecommendation[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const endpoints = {
      jobs: '/api/jobs',
      universities: '/api/universities',
      scholarships: '/api/scholarships'
    };

    fetch(endpoints[activeSegment])
      .then(res => res.json())
      .then(data => {
        if (activeSegment === 'jobs') setJobs(data);
        if (activeSegment === 'universities') setUniversities(data);
        if (activeSegment === 'scholarships') setScholarships(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching segment data:', err);
        setLoading(false);
      });
  }, [activeSegment]);

  return (
    <div className="mx-auto max-w-6xl p-6" id="academy-listings-container">
      
      {/* Header and selector segment */}
      <div className="mb-6 flex flex-col justify-between space-y-4 border-b border-slate-200 pb-4 text-left sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
            Academy & Career Match Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">Connect your active profile to open vacancies, global universities, and merit-based scholarship packages.</p>
        </div>

        {/* Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1" id="academy-segment-switcher">
          <button
            onClick={() => { setActiveSegment('jobs'); setSearchTerm(''); }}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeSegment === 'jobs' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Jobs Board</span>
          </button>
          <button
            onClick={() => { setActiveSegment('universities'); setSearchTerm(''); }}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeSegment === 'universities' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Universities</span>
          </button>
          <button
            onClick={() => { setActiveSegment('scholarships'); setSearchTerm(''); }}
            className={`flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeSegment === 'scholarships' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="h-3.5 w-3.5" />
            <span>Scholarships</span>
          </button>
        </div>
      </div>

      {/* Search Input bar */}
      <div className="relative mb-6 text-left" id="hub-search-box">
        <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${activeSegment} by title, company, courses, or criteria keywords...`}
          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white shadow-sm"
        />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white" id="segment-loading">
          <div className="flex flex-col items-center space-y-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-250 border-t-blue-600"></div>
            <p className="text-xs font-medium text-slate-500">Loading catalog items...</p>
          </div>
        </div>
      ) : (
        <div className="text-left" id="segment-catalog-box">
          
          {/* JOBS BOARD VIEW */}
          {activeSegment === 'jobs' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" id="jobs-grid">
              {jobs
                .filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.company.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((j) => (
                  <div key={j.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-slate-900">{j.title}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                          Full-Time
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-500 mt-1">{j.company}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400 font-bold leading-none">
                        <span className="flex items-center"><MapPin className="mr-1 h-3 w-3" /> {j.location}</span>
                        <span className="flex items-center"><DollarSign className="mr-1 h-3 w-3" /> {j.salaryRange}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
                      <div className="flex flex-wrap gap-1">
                        {j.skillsRequired.slice(0, 3).map((s) => (
                          <span key={s} className="rounded bg-blue-50/50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700 whitespace-nowrap">
                            {s}
                          </span>
                        ))}
                      </div>
                      <a
                        href={j.applyLink}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] px-3 py-1.5 text-center flex items-center justify-center self-start"
                      >
                        <span>Apply</span>
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* UNIVERSITIES LIST VIEW */}
          {activeSegment === 'universities' && (
            <div className="space-y-4" id="universities-list">
              {universities
                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.courses.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
                .map((u) => (
                  <div key={u.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:border-slate-300 transition">
                    
                    <div className="flex flex-col justify-between sm:flex-row sm:items-center border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 leading-none">{u.name}</h3>
                        <p className="text-[10px] text-slate-400 font-bold tracking-wide mt-1.5 flex items-center">
                          <MapPin className="mr-1 h-3.5 w-3.5" /> {u.location} • Typical Tuition: <strong className="ml-1 text-slate-700">{u.fees}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                      
                      {/* Courses */}
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Target Specialist Courses</span>
                        <ul className="list-inside list-disc text-slate-600 font-medium space-y-1 mt-1.5">
                          {u.courses.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Placement stats */}
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Career Placement Statistics</span>
                        <p className="text-slate-600 font-semibold leading-relaxed">
                          {u.placementStatistics}
                        </p>
                      </div>

                    </div>

                    {/* Eligibility details */}
                    <div className="border-t border-slate-150 pt-3 text-[11px] text-slate-500 flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
                      <span>Admission Eligibility: <strong className="text-slate-700">{u.eligibility}</strong></span>
                      <div className="flex space-x-1.5">
                        {u.scholarships.slice(0, 1).map((s) => (
                          <span key={s} className="rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            🏆 {s} Available
                          </span>
                        ))}
                      </div>
                    </div>

                  </div>
                ))}
            </div>
          )}

          {/* SCHOLARSHIPS VIEW */}
          {activeSegment === 'scholarships' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" id="scholarships-grid">
              {scholarships
                .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.criteria.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between space-y-3">
                    
                    <div>
                      <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-900">{s.name}</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 uppercase tracking-wide">
                          {s.amount} Grant
                        </span>
                      </div>
                      
                      <p className="text-[11px] leading-relaxed text-slate-500 mt-2">
                        <strong>Focus Criteria:</strong> {s.criteria}
                      </p>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Coverage:</span>
                        <span className="font-bold text-slate-800">{s.coverage}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Eligibility Scope:</span>
                        <span className="font-bold text-slate-800">{s.eligibility}</span>
                      </div>
                      <div className="flex justify-between text-[11px] items-center text-rose-600 mt-2">
                        <span className="text-slate-400 font-medium flex items-center"><Calendar className="mr-1 h-3 w-3" /> Application Deadline:</span>
                        <span className="font-bold">{s.deadline}</span>
                      </div>
                    </div>

                  </div>
                ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
