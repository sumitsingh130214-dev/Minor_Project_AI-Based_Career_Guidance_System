import React, { useState } from 'react';
import { User, ResumeAnalysisResult } from '../types';
import { FileText, ClipboardCheck, Award, AlertCircle, FileSpreadsheet, Plus, Trash2, Printer, Sparkles, Code } from 'lucide-react';

interface ResumeAnalyzerAndBuilderProps {
  currentUser: User | null;
}

interface ExperienceItem {
  company: string;
  role: string;
  duration: string;
  desc: string;
}

interface EducationItem {
  school: string;
  degree: string;
  year: string;
}

export default function ResumeAnalyzerAndBuilder({ currentUser }: ResumeAnalyzerAndBuilderProps) {
  const [activeSubTab, setActiveSubTab] = useState<'analyzer' | 'builder'>('analyzer');
  const [targetCareer, setTargetCareer] = useState('Software Engineer');
  
  // Analyzer State
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);

  // Builder State
  const [builderTemplate, setBuilderTemplate] = useState<'classic' | 'modern' | 'minimal'>('modern');
  const [personalInfo, setPersonalInfo] = useState({ name: currentUser?.name || 'Alex Rivera', email: currentUser?.email || 'student@careerai.pro', phone: '+1 (555) 019-2834', linkedin: 'linkedin.com/in/alexrivera' });
  const [summaryText, setSummaryText] = useState('Diligent junior engineer specializing in robust frontend design patterns, backend schema integrity, and automated pipeline integration.');
  const [skillsCsv, setSkillsCsv] = useState('TypeScript, React.js, Node.js, SQL, Python, Git');
  
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    { company: 'Vertex Software Inc.', role: 'Associate Web Engineer', duration: '2024 - Present', desc: 'Developed high-performance React.js dashboards with responsive Tailwind layout elements. Streamlined REST API calls, boosting overall query latency by 18%.' }
  ]);
  
  const [educations, setEducations] = useState<EducationItem[]>([
    { school: 'California State University', degree: 'B.S. in Computer Science (GPA: 3.8)', year: '2022 - 2026' }
  ]);

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, targetCareer })
      });
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error('Error analyzing resume:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddExperience = () => {
    setExperiences([...experiences, { company: '', role: '', duration: '', desc: '' }]);
  };

  const handleRemoveExperience = (idx: number) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
  };

  const handleUpdateExperience = (idx: number, field: keyof ExperienceItem, value: string) => {
    const next = [...experiences];
    next[idx] = { ...next[idx], [field]: value };
    setExperiences(next);
  };

  const handleAddEducation = () => {
    setEducations([...educations, { school: '', degree: '', year: '' }]);
  };

  const handleRemoveEducation = (idx: number) => {
    setEducations(educations.filter((_, i) => i !== idx));
  };

  const handleUpdateEducation = (idx: number, field: keyof EducationItem, value: string) => {
    const next = [...educations];
    next[idx] = { ...next[idx], [field]: value };
    setEducations(next);
  };

  const handlePrintResume = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-6xl p-6" id="resume-suite-container">
      
      {/* Header with selector tabs */}
      <div className="mb-6 flex flex-col justify-between space-y-4 border-b border-slate-200 pb-4 text-left sm:flex-row sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <FileText className="mr-2 h-5 w-5 text-slate-800" />
            AI Resume Suite
          </h1>
          <p className="text-xs text-slate-500 mt-1">Audit any pasted resume for ATS metrics, or build modern print-ready CV templates instantly.</p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            onClick={() => setActiveSubTab('analyzer')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              activeSubTab === 'analyzer' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
            id="btn-subtab-analyzer"
          >
            ATS Resume Scanner
          </button>
          <button
            onClick={() => setActiveSubTab('builder')}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
              activeSubTab === 'builder' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
            id="btn-subtab-builder"
          >
            AI Resume Builder
          </button>
        </div>
      </div>

      {/* RENDER MODULARS */}
      {activeSubTab === 'analyzer' ? (
        
        /* ATS SCANNER MODE */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 text-left" id="analyzer-grid">
          
          {/* Left panel: input forms */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-5 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Scan Resume Details</h2>
              <p className="text-xs text-slate-500">Correlate skills structure, formatting layouts, and target careers.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Career Role</label>
              <select
                value={targetCareer}
                onChange={(e) => setTargetCareer(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 bg-white"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="UX/UI Designer">UX/UI Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Chartered Accountant">Chartered Accountant</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resume Copy-Paste Content</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste the plain-text content of your resume here to analyze ATS keywords..."
                className="w-full h-64 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-none bg-slate-50/20"
                id="textarea-resume-plain-text"
              ></textarea>
            </div>

            <button
              onClick={handleAnalyzeResume}
              disabled={analyzing || !resumeText.trim()}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-150 disabled:text-slate-400 font-semibold text-xs py-2.5 shadow-sm transition"
              id="btn-analyze-resume-submit"
            >
              {analyzing ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                  <span>Running ATS Scans...</span>
                </>
              ) : (
                <>
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Analyze ATS Scores</span>
                </>
              )}
            </button>
          </div>

          {/* Right panel: analysis results */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-6 shadow-sm flex flex-col justify-between" id="analyzer-results-pane">
            {analysisResult ? (
              <div className="space-y-6" id="resume-analysis-completed-block">
                
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">ATS Assessment Feedback</h3>
                    <p className="text-xs text-slate-500">Compliance ratios computed by AI Analyst</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={`text-2xl font-extrabold ${
                      analysisResult.atsScore >= 80 ? 'text-emerald-600' : analysisResult.atsScore >= 60 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {analysisResult.atsScore}%
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">ATS Score</span>
                  </div>
                </div>

                {/* Analysis detail items */}
                <div className="space-y-4">
                  
                  {/* Skill gaps */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center">
                      <Code className="mr-1 h-3.5 w-3.5" /> Missing Skills / Gaps
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.skillGap.map((s) => (
                        <span key={s} className="rounded bg-rose-50 border border-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700 whitespace-nowrap">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Missing keywords */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center">
                      <Award className="mr-1 h-3.5 w-3.5" /> Missing Core Keywords
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.missingKeywords.map((s) => (
                        <span key={s} className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 whitespace-nowrap">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Formatting suggestions list */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center">
                      <AlertCircle className="mr-1 h-3.5 w-3.5" /> Layout & Formatting issues
                    </p>
                    <ul className="list-inside list-disc text-xs text-slate-500 space-y-1">
                      {analysisResult.formattingIssues.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggestions block */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Expert Alignment Feedback</p>
                    <p className="text-xs leading-relaxed text-slate-600 font-medium">
                      {analysisResult.careerAlignment}
                    </p>
                    <ul className="list-inside list-decimal text-xs text-slate-500 mt-2 space-y-0.5">
                      {analysisResult.suggestions.slice(0, 2).map((s, idx) => (
                        <li key={idx} className="leading-normal">{s}</li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center flex-1" id="analyzer-blank-state">
                <FileSpreadsheet className="h-10 w-10 text-slate-300" />
                <p className="text-xs font-bold text-slate-400 uppercase mt-4 tracking-wider">Analysis Queue Idle</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs">Paste resume text and choose target roles to compile interactive ATS scans.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        
        /* RESUME BUILDER MODE */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 text-left" id="builder-grid">
          
          {/* Left panel: builder editing inputs */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-6 shadow-sm max-h-[calc(100vh-18rem)] overflow-y-auto" id="builder-editor-pane">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Personalize Template</h2>
              <p className="text-xs text-slate-500">Adjust CV schemas, contact details, experiences, and educations.</p>
            </div>

            {/* Template Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Template Style</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: 'classic', label: 'Classic Corporate' },
                  { id: 'modern', label: 'Modern Accent' },
                  { id: 'minimal', label: 'Minimalist Clean' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBuilderTemplate(t.id as any)}
                    className={`rounded-lg border px-3 py-2 text-center text-xs font-semibold transition-all ${
                      builderTemplate === t.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Personal info form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-400 outline-none bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Email</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-400 outline-none bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-400 outline-none bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">LinkedIn URL</label>
                <input
                  type="text"
                  value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-400 outline-none bg-white"
                />
              </div>
            </div>

            {/* Profile summary */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Profile Statement</label>
              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                className="w-full h-18 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-none"
              ></textarea>
            </div>

            {/* Technical skills */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills (Comma Separated)</label>
              <input
                type="text"
                value={skillsCsv}
                onChange={(e) => setSkillsCsv(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-slate-400 outline-none bg-white"
              />
            </div>

            {/* WORK EXPERIENCE LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Experience</label>
                <button
                  onClick={handleAddExperience}
                  className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Experience
                </button>
              </div>

              <div className="space-y-3">
                {experiences.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2 relative">
                    <button
                      onClick={() => handleRemoveExperience(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Duration (e.g., 2024 - Present)"
                        value={exp.duration}
                        onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-white"
                      />
                    </div>
                    <textarea
                      placeholder="Achievements, technical stacks, or key metrics..."
                      value={exp.desc}
                      onChange={(e) => handleUpdateExperience(idx, 'desc', e.target.value)}
                      className="w-full h-14 rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
                    ></textarea>
                  </div>
                ))}
              </div>
            </div>

            {/* EDUCATIONS LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic History</label>
                <button
                  onClick={handleAddEducation}
                  className="text-xs font-bold text-slate-900 hover:text-slate-700 flex items-center"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> Add Education
                </button>
              </div>

              <div className="space-y-3">
                {educations.map((edu, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 space-y-2 relative">
                    <button
                      onClick={() => handleRemoveEducation(idx)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="School/University"
                        value={edu.school}
                        onChange={(e) => handleUpdateEducation(idx, 'school', e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Degree/Major"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-white"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Graduation Year (e.g., 2026)"
                      value={edu.year}
                      onChange={(e) => handleUpdateEducation(idx, 'year', e.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 bg-white w-full"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right panel: Print preview framework */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between shadow-sm" id="builder-preview-pane">
            
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 flex items-center">
                <Sparkles className="mr-1.5 h-4 w-4 text-slate-900" /> Print-Ready CV Layout
              </h3>
              <button
                onClick={handlePrintResume}
                className="rounded-lg bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 flex items-center shadow-sm"
                id="btn-print-resume"
              >
                <Printer className="mr-1 h-3.5 w-3.5" /> Print / Export PDF
              </button>
            </div>

            {/* Template Card Document */}
            <div className="flex-1 bg-white p-6 shadow-md border border-slate-100 rounded-xl max-h-[calc(100vh-23rem)] overflow-y-auto text-left space-y-4" id="cv-canvas-sheet">
              
              {/* Template Styles */}
              {/* MODERN TEMPLATE ACCENT */}
              {builderTemplate === 'modern' && (
                <div className="space-y-4">
                  <div className="border-b-2 border-slate-900 pb-3">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">{personalInfo.name || 'Anonymous candidate'}</h1>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-2 leading-none">
                      <span>{personalInfo.email}</span>
                      <span>•</span>
                      <span>{personalInfo.phone}</span>
                      <span>•</span>
                      <span>{personalInfo.linkedin}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-0.5">Professional Summary</h2>
                    <p className="text-[11px] leading-relaxed text-slate-600">{summaryText}</p>
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-0.5">Skills Matrix</h2>
                    <p className="text-[11px] leading-relaxed text-slate-600 font-semibold">{skillsCsv}</p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-0.5">Work History</h2>
                    <div className="space-y-3">
                      {experiences.map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline leading-none">
                            <span className="text-[11px] font-extrabold text-slate-800">{exp.role} — <span className="font-semibold text-slate-600">{exp.company}</span></span>
                            <span className="text-[10px] font-bold text-slate-400">{exp.duration}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500 mt-1">{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-0.5">Academic Background</h2>
                    <div className="space-y-2">
                      {educations.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline leading-none">
                          <span className="text-[11px] font-extrabold text-slate-800">{edu.degree} <span className="font-medium text-slate-600">at {edu.school}</span></span>
                          <span className="text-[10px] font-bold text-slate-400">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CLASSIC TEMPLATE */}
              {builderTemplate === 'classic' && (
                <div className="space-y-4 font-serif">
                  <div className="text-center space-y-1.5 border-b border-slate-200 pb-3">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">{personalInfo.name.toUpperCase()}</h1>
                    <p className="text-[10px] text-slate-500 font-semibold tracking-wide leading-none mt-1">
                      {personalInfo.email} | {personalInfo.phone} | {personalInfo.linkedin}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-[10px] font-bold tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">OBJECTIVE</h2>
                    <p className="text-[11px] leading-relaxed text-slate-600">{summaryText}</p>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-[10px] font-bold tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">TECHNICAL CREDENTIALS</h2>
                    <p className="text-[11px] leading-relaxed text-slate-600">{skillsCsv}</p>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">EXPERIENCE HISTORY</h2>
                    <div className="space-y-2">
                      {experiences.map((exp, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between font-bold text-[11px] leading-none text-slate-800">
                            <span>{exp.company} — {exp.role}</span>
                            <span className="font-normal text-slate-500">{exp.duration}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500">{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-[10px] font-bold tracking-wider text-slate-800 border-b border-slate-300 pb-0.5">EDUCATION</h2>
                    {educations.map((edu, i) => (
                      <div key={i} className="flex justify-between font-bold text-[11px] leading-none text-slate-800">
                        <span>{edu.school} — {edu.degree}</span>
                        <span className="font-normal text-slate-500">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MINIMAL TEMPLATE */}
              {builderTemplate === 'minimal' && (
                <div className="space-y-5 text-slate-800">
                  <div className="space-y-1">
                    <h1 className="text-lg font-bold tracking-tight">{personalInfo.name}</h1>
                    <div className="flex space-x-3 text-[10px] text-slate-400 font-semibold">
                      <span>{personalInfo.email}</span>
                      <span>/</span>
                      <span>{personalInfo.phone}</span>
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-500">{summaryText}</p>

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Expertise</h3>
                    <p className="text-[11px] leading-relaxed text-slate-600">{skillsCsv}</p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Track record</h3>
                    <div className="space-y-3">
                      {experiences.map((exp, i) => (
                        <div key={i} className="space-y-0.5">
                          <div className="flex justify-between text-[11px] font-bold text-slate-700">
                            <span>{exp.role} / {exp.company}</span>
                            <span className="font-normal text-slate-400 text-[10px]">{exp.duration}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-500">{exp.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Schooling</h3>
                    {educations.map((edu, i) => (
                      <div key={i} className="flex justify-between text-[11px] font-semibold text-slate-700 leading-none">
                        <span>{edu.degree} — {edu.school}</span>
                        <span className="font-normal text-slate-400 text-[10px]">{edu.year}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
