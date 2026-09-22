import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, Sparkles, Compass, Map, FileText, UserCheck, GraduationCap, 
  ArrowRight, ShieldCheck, Star, HelpCircle, Check, Users, MessageSquare, 
  Send, Mail, Phone, MapPin, Globe, Moon, Sun, Lock, Play, Menu, X
} from 'lucide-react';

interface SaasLandingPageProps {
  onLoginClick: (role?: 'student' | 'counselor' | 'admin') => void;
  onRegisterClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function SaasLandingPage({ onLoginClick, onRegisterClick, theme, onToggleTheme }: SaasLandingPageProps) {
  const isDarkMode = theme === 'dark';
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const [demoInput, setDemoInput] = useState('Full Stack Developer');
  const [demoOutput, setDemoOutput] = useState<any>(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle Dark Theme
  const toggleTheme = onToggleTheme;

  // Sample Interactive Demo Career Prediction
  const handleDemoPredict = () => {
    setDemoLoading(true);
    setTimeout(() => {
      setDemoOutput({
        career: demoInput,
        matchScore: 94.8,
        demand: 'High Demand (Peak Growth)',
        salary: '$110,000 - $165,000',
        skills: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Architecture'],
        roadmapWeeks: 12
      });
      setDemoLoading(false);
    }, 1200);
  };

  // Partners & Trusted Companies
  const PARTNERS = [
    { name: 'Stanford University', logo: '🌲 Stanford' },
    { name: 'MIT Labs', logo: '🏛️ MIT Labs' },
    { name: 'Horizon Cloud Corp', logo: '☁️ Horizon Cloud' },
    { name: 'Stripe Global', logo: '💳 Stripe' },
    { name: 'Y Combinator', logo: '🧡 Y Combinator' }
  ];

  // Features list
  const FEATURES = [
    { 
      icon: Brain, 
      title: 'AI Career Assessment', 
      desc: 'Analyze multi-dimensional interests, big-five traits, and quantitative aptitude indices in minutes.' 
    },
    { 
      icon: Star, 
      title: 'Career Recommendations', 
      desc: 'Correlate traits against real-time global recruiter databases to identify optimal pathways.' 
    },
    { 
      icon: MessageSquare, 
      title: 'AI Counselor Bot', 
      desc: 'Converse with Dr. Evelyn Carter in multilingual English or Hindi with instant speech synthesis playback.' 
    },
    { 
      icon: FileText, 
      title: 'Resume ATS Suite', 
      desc: 'Check keyword compliance, ATS compliance, and build print-ready executive CV layouts.' 
    },
    { 
      icon: Map, 
      title: 'Learning Roadmaps', 
      desc: 'Compile week-by-week chronological learning roadmaps complete with external links and projects.' 
    },
    { 
      icon: GraduationCap, 
      title: 'Job & Academy Match', 
      desc: 'Identify eligibility matches for global universities, scholarships, and active vacancies.' 
    }
  ];

  // How it works steps
  const STEPS = [
    { num: '01', title: 'Register Account', desc: 'Securely create your personalized student, counselor, or administrator dashboard.' },
    { num: '02', title: 'Aptitude Assessment', desc: 'Answer cognitive, personality, and skills questions managed by our core AI engine.' },
    { num: '03', title: 'Cognitive Deep Analysis', desc: 'Our backend parses your answers to calculate performance indexes and traits.' },
    { num: '04', title: 'Get Match Cards', desc: 'Review match scores, salary targets, and global job vacancy alignment metrics.' },
    { num: '05', title: 'Track Roadmaps', desc: 'Follow weekly milestone guides to secure certifications and place into companies.' }
  ];

  // Career Tracks
  const CATEGORIES = [
    { name: 'AI Engineer', demand: '98%', salary: '$142,000', color: 'border-blue-500 bg-blue-50/10' },
    { name: 'Data Scientist', demand: '94%', salary: '$120,000', color: 'border-emerald-500 bg-emerald-50/10' },
    { name: 'Software Developer', demand: '90%', salary: '$110,000', color: 'border-indigo-500 bg-indigo-50/10' },
    { name: 'Cloud Engineer', demand: '88%', salary: '$125,000', color: 'border-purple-500 bg-purple-50/10' },
    { name: 'Cyber Security', demand: '95%', salary: '$118,000', color: 'border-rose-500 bg-rose-50/10' },
    { name: 'UX/UI Designer', demand: '86%', salary: '$95,000', color: 'border-pink-500 bg-pink-50/10' }
  ];

  // FAQ array
  const FAQS = [
    { q: 'How does CareerAI Pro calculate my recommended careers?', a: 'We compile your psychometric responses (interests, Big Five traits, and numerical aptitude scores) and run them against real-world job criteria using specialized prompt heuristics on our Advanced Intelligence core.' },
    { q: 'Is the voice counselor Dr. Evelyn Carter bilingual?', a: 'Yes! You can toggle between English and Hindi, and check the Voice AI checkbox to listen to high-fidelity audio feedback streams decoded locally in your browser.' },
    { q: 'Can I export the resumes I build with the AI Resume Builder?', a: 'Absolutely! Our print layout uses clean standard stylesheets allowing you to click "Print / Export PDF" to save or print a perfectly styled professional CV.' },
    { q: 'What is included in the Institution pricing tier?', a: 'The Institution plan features central administrator panels, multiple counselor seats, database capacity extensions, and private LLM credential settings for university campuses.' }
  ];

  // Testimonials
  const TESTIMONIALS = [
    { name: 'James Wilson', role: 'AI Engineer at Stripe', text: 'CareerAI Pro matched me with cognitive AI tracks and mapped a 90-day linear roadmap that changed my career path completely.', score: 98 },
    { name: 'Maya Lin', role: 'UX Designer at Adobe', text: 'The ATS resume feedback pinpointed 4 missing design-system keywords in my portfolio. I landed my interview in weeks!', score: 95 }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`} id="saas-landing-root">
      
      {/* 1. Sticky Navigation Bar */}
      <nav className={`sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-950/90 text-white' : 'border-slate-200 bg-white/90 text-slate-900'
      }`} id="landing-navbar">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo and brand name */}
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
                <Brain className="h-5 w-5" />
              </div>
              <span className="text-base font-extrabold tracking-tight">CareerAI Pro</span>
            </div>

            {/* Nav items (Desktop only) */}
            <div className="hidden md:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider">
              <a href="#features" className="hover:text-blue-600 transition">Features</a>
              <a href="#categories" className="hover:text-blue-600 transition">Categories</a>
              <a href="#demo" className="hover:text-blue-600 transition">Interactive Demo</a>
              <a href="#pricing" className="hover:text-blue-600 transition">Pricing</a>
              <a href="#faq" className="hover:text-blue-600 transition">FAQ</a>
              <a href="#contact" className="hover:text-blue-600 transition">Contact</a>
            </div>

            {/* Access Buttons */}
            <div className="flex items-center space-x-3">
              
              {/* Dark / Light Toggle */}
              <button 
                onClick={toggleTheme}
                className={`rounded-lg p-2 transition ${isDarkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-slate-500'}`}
                title="Toggle Mode"
                id="btn-toggle-landing-theme"
              >
                {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
              </button>

              <button
                onClick={() => onLoginClick('student')}
                className={`hidden sm:block text-xs font-bold uppercase px-3 py-1.5 rounded-lg transition ${
                  isDarkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-150 text-slate-700'
                }`}
                id="btn-navbar-login"
              >
                Login
              </button>
              
              <button
                onClick={onRegisterClick}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white uppercase tracking-wide transition shadow"
                id="btn-navbar-register"
              >
                Register
              </button>

              {/* Mobile Menu trigger */}
              <button 
                className="md:hidden rounded p-1 hover:bg-slate-100" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t px-4 py-4 space-y-3 flex flex-col text-xs font-bold uppercase tracking-wider text-left ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`} id="mobile-nav-drawer">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="py-1">Features</a>
            <a href="#categories" onClick={() => setMobileMenuOpen(false)} className="py-1">Categories</a>
            <a href="#demo" onClick={() => setMobileMenuOpen(false)} className="py-1">Interactive Demo</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-1">Pricing</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-1">Contact</a>
            <div className="border-t pt-2 flex space-x-2">
              <button onClick={() => { onLoginClick('student'); setMobileMenuOpen(false); }} className="w-full text-center bg-slate-100 py-1.5 rounded text-slate-700">Login</button>
              <button onClick={() => { onRegisterClick(); setMobileMenuOpen(false); }} className="w-full text-center bg-blue-600 py-1.5 rounded text-white">Register</button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 text-center sm:px-6 lg:px-8" id="landing-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none"></div>
        <div className="mx-auto max-w-5xl space-y-8 relative">
          
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] font-bold text-blue-800 uppercase tracking-wide">
            <Sparkles className="h-3 w-3 animate-spin" />
            <span>Empowered by Cognitive Core Engine</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl text-slate-900 dark:text-white leading-none max-w-4xl mx-auto">
            Professional AI Career <span className="text-blue-600">Guidance & Placement</span> Hub
          </h1>
          
          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-slate-500 leading-relaxed">
            The complete enterprise career dashboard. Answer cognitive psychometric tests, converse with live AI voice advisors, build ATS-optimized resumes, and locate global scholarship grants.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={onRegisterClick}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-xs font-extrabold text-white uppercase tracking-wider shadow-lg hover:shadow-xl transition"
              id="btn-hero-get-started"
            >
              Get Started Free
            </button>
            <a
              href="#demo"
              className={`rounded-xl border px-6 py-3 text-xs font-extrabold uppercase tracking-wider transition ${
                isDarkMode ? 'border-slate-800 hover:bg-slate-800 text-white' : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              Interactive Demo
            </a>
          </div>

          {/* Core statistics cards */}
          <div className="grid grid-cols-2 gap-4 pt-12 sm:grid-cols-4 max-w-4xl mx-auto" id="hero-quick-stats">
            {[
              { label: 'Overall Match Ratio', value: '98.4%', desc: 'Peak confidence indices' },
              { label: 'Weekly Syllabus Timelines', value: '30-Day', desc: 'Accelerated roadmaps' },
              { label: 'Voice counselorbot', value: 'Bilingual', desc: 'EN / HI support' },
              { label: 'Global placements', value: 'Partners', desc: 'Secure vacancies' }
            ].map((stat) => (
              <div key={stat.label} className={`rounded-2xl border p-4 text-left transition ${
                isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
              }`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <p className="text-lg font-black text-blue-600 mt-1">{stat.value}</p>
                <p className="text-[9px] text-slate-500 mt-0.5 leading-none">{stat.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. Trusted By / Partners Section */}
      <section className={`py-8 border-y transition-colors ${isDarkMode ? 'border-slate-800 bg-slate-950/60' : 'border-slate-150 bg-slate-100/30'}`} id="landing-partners">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-6">Pioneering Careers at Major Institutions</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 items-center">
            {PARTNERS.map((p) => (
              <span key={p.name} className="text-xs font-extrabold text-slate-400 select-none">
                {p.logo}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto" id="features">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Enterprise Core Modules</span>
          <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Robust AI Engines Tailored for Modern Jobs</h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">No generic templates or mock views. Everything is calculated live against structured enterprise metrics.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" id="features-cards-grid">
          {FEATURES.map((feat) => {
            const IconComponent = feat.icon;
            return (
              <div 
                key={feat.title} 
                className={`rounded-2xl border p-6 text-left hover:border-blue-500 transition-all shadow-sm ${
                  isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-4">
                  <IconComponent className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{feat.title}</h3>
                <p className="text-[11px] leading-relaxed text-slate-500 mt-2.5">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section className={`py-20 px-4 border-y transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-900/20' : 'border-slate-200 bg-slate-100/50'
      }`} id="how-it-works">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Sequential Process</span>
            <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Seamless Verification Pathway</h2>
            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">How CareerAI Pro matches traits and places candidates systematically.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 lg:grid-cols-5 text-left" id="steps-row">
            {STEPS.map((st) => (
              <div key={st.num} className="space-y-3 relative">
                <span className="text-2xl font-black text-blue-100 select-none block leading-none">{st.num}</span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">{st.title}</h3>
                <p className="text-[11px] leading-relaxed text-slate-500">{st.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Career Categories Section */}
      <section className="py-20 px-4 max-w-7xl mx-auto" id="categories">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-mono">14 Specialized Tracks</span>
          <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Explore High-Growth Technical Disciplines</h2>
          <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">Search through required skills, average salaries, and market trends.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" id="categories-boxes">
          {CATEGORIES.map((c) => (
            <div key={c.name} className={`rounded-2xl border p-5 text-left flex flex-col justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-250 bg-white'
            }`}>
              <div>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 uppercase tracking-wider leading-none">
                  {c.demand} demand
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5">{c.name}</h3>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-2">Target Salary: <strong className="text-emerald-600">{c.salary}</strong></p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Interactive AI Demo Section */}
      <section className={`py-20 px-4 border-y transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
      }`} id="demo">
        <div className="max-w-4xl mx-auto text-left space-y-6">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Interactive Playground</span>
            <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Simulate Live Match Operations</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">Select a high-growth career below to inspect mock predictive variables and milestones calculated live.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            
            {/* Input Selection card */}
            <div className={`rounded-2xl border p-5 space-y-4 shadow-sm sm:col-span-1 ${
              isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Input parameters</span>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Discipline Target</label>
                <select
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2 py-1.5 text-xs font-bold bg-white"
                >
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Cloud Engineer">Cloud Engineer</option>
                </select>
              </div>

              <button
                onClick={handleDemoPredict}
                disabled={demoLoading}
                className="w-full flex items-center justify-center space-x-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 shadow transition"
              >
                {demoLoading ? 'Running algorithm...' : 'Simulate Prediction'}
              </button>
            </div>

            {/* Match output card */}
            <div className={`rounded-2xl border p-5 sm:col-span-2 flex flex-col justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white'
            }`}>
              {demoOutput ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{demoOutput.career}</span>
                    <span className="text-xs font-bold text-emerald-600">Overall Match Score: {demoOutput.matchScore}%</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-none">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[9px] font-bold text-slate-450 uppercase">Market Index</span>
                      <p className="font-bold text-slate-800 mt-1.5">{demoOutput.demand}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <span className="text-[9px] font-bold text-slate-450 uppercase">Target Salary Range</span>
                      <p className="font-bold text-slate-800 mt-1.5">{demoOutput.salary}</p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Required technical core skills</span>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {demoOutput.skills.map((s: string) => (
                        <span key={s} className="rounded bg-blue-50/50 border px-2 py-0.5 text-[9px] font-bold text-blue-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Compass className="h-8 w-8 text-slate-300" />
                  <p className="text-xs font-semibold uppercase tracking-wider mt-3">Simulation Console Empty</p>
                  <p className="text-[10px] text-slate-400 mt-1">Select a career track and click Simulate to preview live matches.</p>
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 8. Success Stories & Testimonials */}
      <section className="py-20 px-4 max-w-5xl mx-auto text-left" id="testimonials">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Syllabus Outcomes</span>
          <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Placed Placements Global Stories</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className={`rounded-2xl border p-6 space-y-4 shadow-sm ${
              isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-center space-x-1.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                ))}
                <span className="text-[10px] font-bold text-emerald-600 ml-2">{t.score}% match</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-500 font-medium italic">"{t.text}"</p>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{t.name}</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-none">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Statistics Section */}
      <section className={`py-16 px-4 border-y transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-150 bg-slate-100/40'
      }`} id="stats">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            { value: '1,420+', label: 'Students Guided' },
            { value: '25,000+', label: 'Assessment Hours' },
            { value: '14 Tracks', label: 'Careers Cataloged' },
            { value: '98.4%', label: 'Match Precision' }
          ].map((stat) => (
            <div key={stat.label} className="text-center space-y-1">
              <p className="text-2xl font-black text-blue-600 sm:text-3xl">{stat.value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. University & Scholarship Highlights */}
      <section className="py-20 px-4 max-w-5xl mx-auto text-left space-y-6" id="highlights">
        <div className="text-center space-y-3 mb-16">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Global Placements</span>
          <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Partner Universities & Merit Grants</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={`rounded-2xl border p-5 space-y-3 shadow-sm ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
          }`}>
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 dark:text-white flex items-center">
              <GraduationCap className="mr-2 h-4.5 w-4.5 text-blue-600" /> Top Academy Partners
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We sync curriculum syllabus standards directly from universities including Stanford, MIT Labs, and Berkeley.
            </p>
          </div>

          <div className={`rounded-2xl border p-5 space-y-3 shadow-sm ${
            isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
          }`}>
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-slate-900 dark:text-white flex items-center">
              <Star className="mr-2 h-4.5 w-4.5 text-amber-500 fill-amber-500" /> Merit Scholarship Alignment
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Analyze eligible criteria parameters and matching indices for global scholarships worth up to $45,000 in tuition coverage.
            </p>
          </div>
        </div>
      </section>

      {/* 11. Pricing Plans */}
      <section className={`py-20 px-4 border-y transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-950/40' : 'border-slate-200 bg-slate-50'
      }`} id="pricing">
        <div className="max-w-5xl mx-auto space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Pricing Matrix</span>
            <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Transparent Plans for Individuals & Groups</h2>
            <p className="text-xs text-slate-500 max-w-lg mx-auto">Access assessments, matching visualizations, and voice consultations with zero hidden parameters.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
            
            {/* Free */}
            <div className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm bg-white ${
              isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Explorer</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Free Tier</h3>
                </div>
                <p className="text-2xl font-black text-slate-950 dark:text-white">$0 <span className="text-xs font-normal text-slate-400">/ forever</span></p>
                <ul className="text-xs space-y-2 text-slate-500 font-medium">
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> 1-Phase Career Assessment</li>
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Explore 14 Career tracks</li>
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> ATS Resume Scanner (3/mo)</li>
                </ul>
              </div>
              <button onClick={() => onLoginClick('student')} className="w-full rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 mt-6">Get Started</button>
            </div>

            {/* Premium */}
            <div className="rounded-2xl border-2 border-blue-600 p-6 flex flex-col justify-between shadow-md bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded bg-blue-600 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">Recommended</div>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Candidate Pro</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-1">Premium Plan</h3>
                </div>
                <p className="text-2xl font-black text-slate-950">$19 <span className="text-xs font-normal text-slate-400">/ single seat</span></p>
                <ul className="text-xs space-y-2 text-slate-500 font-medium">
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Complete 4-Phase Assessment</li>
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Bilingual AI counselor Dr. Evelyn</li>
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Unlimited Roadmap Timetables</li>
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Technical Mock Interviews</li>
                </ul>
              </div>
              <button onClick={onRegisterClick} className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 mt-6">Subscribe Now</button>
            </div>

            {/* Institution */}
            <div className={`rounded-2xl border p-6 flex flex-col justify-between shadow-sm bg-white ${
              isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
            }`}>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Corporate</span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">Institution</h3>
                </div>
                <p className="text-2xl font-black text-slate-950 dark:text-white">$149 <span className="text-xs font-normal text-slate-400">/ monthly billing</span></p>
                <ul className="text-xs space-y-2 text-slate-500 font-medium">
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Multiple Counselor logins</li>
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Private Admin log Terminal</li>
                  <li className="flex items-center"><Check className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Private credentials configuration</li>
                </ul>
              </div>
              <button onClick={() => onLoginClick('admin')} className="w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 mt-6">Deploy Campus</button>
            </div>

          </div>

        </div>
      </section>

      {/* 12. FAQ Section */}
      <section className="py-20 px-4 max-w-3xl mx-auto text-left space-y-6" id="faq">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Clearing Ambiguity</span>
          <h2 className="text-xl font-bold sm:text-2xl text-slate-900 dark:text-white">Frequently Audited Queries</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div 
                key={f.q} 
                className={`rounded-xl border transition-all ${
                  isDarkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-xs font-bold uppercase text-slate-900 dark:text-white"
                >
                  <span>{f.q}</span>
                  <HelpCircle className="h-4.5 w-4.5 text-slate-400 flex-shrink-0 ml-3" />
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-xs leading-relaxed text-slate-500 border-t border-slate-100 pt-3">
                    {f.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 13. Contact Section */}
      <section className={`py-20 px-4 border-y transition-colors ${
        isDarkMode ? 'border-slate-800 bg-slate-900/10' : 'border-slate-200 bg-slate-100/50'
      }`} id="contact">
        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 text-left">
          
          <div className="space-y-4">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Connect With Us</span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Get in Touch</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Have inquiries about deploying CareerAI Pro on your university campus? Reach out to our technical coordinators for an alignment trial.
            </p>
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <p className="flex items-center"><Mail className="mr-2 h-4.5 w-4.5 text-blue-600" /> coordination@careerai.pro</p>
              <p className="flex items-center"><Phone className="mr-2 h-4.5 w-4.5 text-blue-600" /> +1 (555) 019-3824</p>
              <p className="flex items-center"><MapPin className="mr-2 h-4.5 w-4.5 text-blue-600" /> Stanford Silicon Valley Node, CA</p>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); }} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Email Address</label>
              <input type="email" placeholder="name@example.com" className="w-full rounded-lg border border-slate-200 px-3 py-1.5" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Brief Message</label>
              <textarea placeholder="Describe your request..." className="w-full h-20 rounded-lg border border-slate-200 px-3 py-1.5 focus:outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-slate-950 hover:bg-slate-850 text-white font-semibold py-2 rounded-lg">Send Query</button>
          </form>

        </div>
      </section>

      {/* 14. Newsletter Subscription */}
      <section className="py-20 px-4 max-w-2xl mx-auto text-center space-y-4" id="newsletter">
        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Career Insight Mailings</h3>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Stay In the Loop</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">Get early alerts for new scholarship allocations, vacancies, and AI interview model audits.</p>
        
        {newsletterSubscribed ? (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-800">
            ✓ Successfully subscribed to placement updates!
          </div>
        ) : (
          <form 
            onSubmit={(e) => { e.preventDefault(); if (newsletterEmail) setNewsletterSubscribed(true); }}
            className="flex space-x-2 max-w-sm mx-auto"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold focus:outline-none"
            />
            <button type="submit" className="rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white flex items-center space-x-1">
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </section>

      {/* 15. Professional Footer */}
      <footer className={`py-12 border-t transition-colors ${
        isDarkMode ? 'border-slate-850 bg-slate-950 text-slate-400' : 'border-slate-200 bg-white text-slate-500'
      }`} id="landing-footer">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 gap-8 sm:grid-cols-4 text-xs text-left sm:px-6 lg:px-8">
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-600 text-white">
                <Brain className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block leading-none">CareerAI Pro</span>
                <span className="text-[10px] text-slate-450 font-semibold block mt-1">Made by Sumit & Vivek</span>
              </div>
            </div>
            <p className="leading-relaxed">Advanced cognitive guidance systems placing candidates in high-growth roles.</p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-450 text-[10px]">Ecosystem</h4>
            <ul className="space-y-1.5 font-medium">
              <li><a href="#features" className="hover:text-blue-600">AI Assessments</a></li>
              <li><a href="#categories" className="hover:text-blue-600">Career Database</a></li>
              <li><a href="#demo" className="hover:text-blue-600">Interactive Demo</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-450 text-[10px]">Company</h4>
            <ul className="space-y-1.5 font-medium">
              <li><a href="#highlights" className="hover:text-blue-600">Partnerships</a></li>
              <li><a href="#pricing" className="hover:text-blue-600">Licensing Plans</a></li>
              <li><a href="#faq" className="hover:text-blue-600 font-mono">FAQ</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold uppercase tracking-wider text-slate-450 text-[10px]">Legal</h4>
            <p className="leading-relaxed">All mock computations are modeled for sandbox environments. Handled securely according to GA-V2 specs.</p>
            <p className="text-[10px] text-slate-400">© 2026 CareerAI Pro. All rights reserved.</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
