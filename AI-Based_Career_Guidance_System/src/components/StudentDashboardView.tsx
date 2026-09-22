import React, { useState, useEffect } from 'react';
import { User, CareerRecommendation, LearningRoadmap } from '../types';
import { Award, Compass, Map, UserCheck, Sparkles, ArrowRight, Zap, CheckCircle2, TrendingUp, FileText, Check, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentDashboardViewProps {
  currentUser: User | null;
  onNavigateToTab: (tab: string) => void;
}

export default function StudentDashboardView({ currentUser, onNavigateToTab }: StudentDashboardViewProps) {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'activity' | 'achievements'>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [activities, setActivities] = useState<any[]>(() => {
    const stored = localStorage.getItem('careerai_student_activities');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback to defaults
      }
    }
    return [
      {
        id: 1,
        category: 'assessment',
        title: 'Psychometric Assessment Completed',
        description: 'Successfully completed all 4 core stages of cognitive talent and vocational affinity diagnostics. Captured a 94.8% alignment quotient for High-Growth Engineering and Machine Learning pathways.',
        timestamp: 'Aug 19, 2026 - 10:45 AM',
        iconType: 'assessment',
        score: 94.8
      },
      {
        id: 2,
        category: 'roadmap',
        title: 'Interactive Learning Syllabus Generated',
        description: 'Created a detailed 3-milestone technical timeline covering Core Neural Networks, Foundations of Multi-tier Mathematics, and Deep Learning Orchestrator modules.',
        timestamp: 'Aug 18, 2026 - 03:12 PM',
        iconType: 'roadmap'
      },
      {
        id: 3,
        category: 'explorer',
        title: 'Career Pathway Inspected: AI Research Scientist',
        description: 'Analyzed career metrics, yearly demand multipliers (+18% YoY growth), regional hubs, and required skillset stacks for deep cognitive modeling tracks.',
        timestamp: 'Aug 18, 2026 - 11:30 AM',
        iconType: 'explorer'
      },
      {
        id: 4,
        category: 'explorer',
        title: 'Academic Repository Explored',
        description: 'Searched listing registers and reviewed eligibility criteria, grant thresholds, and application requirements for elite Masters in Computer Science specializations.',
        timestamp: 'Aug 17, 2026 - 04:20 PM',
        iconType: 'explorer'
      }
    ];
  });

  // Save activities to local storage
  useEffect(() => {
    localStorage.setItem('careerai_student_activities', JSON.stringify(activities));
  }, [activities]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newAct = {
      id: Date.now(),
      category: 'custom',
      title: newTitle,
      description: newDesc,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      iconType: 'custom'
    };

    setActivities((prev) => [newAct, ...prev]);
    setNewTitle('');
    setNewDesc('');
    setShowAddLogModal(false);
  };

  const filteredActivities = filterCategory === 'all' 
    ? activities 
    : activities.filter(a => a.category === filterCategory);

  const getIcon = (type: string) => {
    switch (type) {
      case 'assessment': return Award;
      case 'roadmap': return Map;
      case 'explorer': return Compass;
      default: return CheckCircle2;
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const userName = currentUser.name;
    
    // Title & Brand Header Accent Band
    doc.setFillColor(37, 99, 235); // #2563EB Brand Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CareerAI Pro', 15, 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('AI-Based Career Guidance & Placement Report', 15, 25);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US')}`, 15, 32);

    // Student Profile Summary Card
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, 50, 180, 25, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(15, 50, 180, 25, 'D');

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('STUDENT PROFILE OVERVIEW', 20, 56);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Name: ${userName}`, 20, 63);
    doc.text(`Role: Student Candidate`, 20, 68);
    doc.text(`Status: ${currentUser.profileCompleted ? 'Profile Active' : 'Setup Incomplete'}`, 110, 63);
    doc.text(`Progress Points: ${activities.length * 15} PTS`, 110, 68);

    let y = 88;

    // Career Recommendations
    doc.setTextColor(37, 99, 235); // Blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('I. AI Career Diagnostics & Predictions', 15, y);
    y += 8;

    if (currentUser.profileCompleted && topRec) {
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Recommended Track: ${topRec.name}`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Match Index: ${topRec.overallScore}%`, 130, y);
      y += 5;
      
      doc.text(`Est. Avg Salary: ${topRec.salaryRange}`, 15, y);
      doc.text(`Growth Rate: +${topRec.growthScore}% YoY`, 130, y);
      y += 12;
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text('No active career prediction. Complete your psychometric assessments to generate insights.', 15, y);
      y += 12;
    }

    // Active Roadmaps
    doc.setTextColor(37, 99, 235); // Blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('II. Active Syllabus Roadmap Milestones', 15, y);
    y += 8;

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('[Completed]', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Foundational Mathematics & Scripting Basics', 45, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('[Active Target]', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Core Neural Architecture & Deep Learning loops', 45, y);
    y += 5;

    doc.setFont('helvetica', 'bold');
    doc.text('[Locked Future]', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text('Advanced NLP Synthesizers & Fine-tuning models', 45, y);
    y += 14;

    // Activity Log
    doc.setTextColor(37, 99, 235); // Blue
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('III. Chronological Workspace Activity Log', 15, y);
    y += 8;

    doc.setFontSize(8);
    activities.forEach((act) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setTextColor(71, 85, 105); // slate-600
      doc.setFont('helvetica', 'bold');
      doc.text(act.timestamp, 15, y);
      
      doc.setTextColor(15, 23, 42); // slate-900
      doc.setFont('helvetica', 'bold');
      doc.text(`[${act.category.toUpperCase()}] ${act.title}`, 60, y);
      y += 4;
      
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont('helvetica', 'normal');
      // Wrap description lines to fit PDF page width
      const splitDesc = doc.splitTextToSize(act.description, 135);
      doc.text(splitDesc, 60, y);
      y += (splitDesc.length * 4) + 4;
    });

    // Footer Signature
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    y = Math.max(y + 5, 282);
    doc.setDrawColor(226, 232, 240);
    doc.line(15, y - 5, 195, y - 5);
    
    doc.setTextColor(148, 163, 184); // slate-400
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('CareerAI Pro is an enterprise AI-grade academic advising platform. Confidential Report.', 15, y);
    doc.text('Page 1', 185, y);

    doc.save(`CareerAI_Report_${userName.replace(/\s+/g, '_')}.pdf`);
  };

  const [searchQuery, setSearchQuery] = useState('');

  // Collect and search across resources
  const getSearchMatches = () => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];

    const matches: any[] = [];

    // 1. Search Career Recommendations
    recommendations.forEach((rec, idx) => {
      if (rec.name.toLowerCase().includes(query) || rec.salaryRange.toLowerCase().includes(query)) {
        matches.push({
          uniqueId: `career-${idx}`,
          type: 'career',
          typeLabel: 'Career Recommendation',
          title: rec.name,
          desc: `Average pay of ${rec.salaryRange} with +${rec.growthScore}% yearly growth rate. Matched matching coefficients at ${rec.overallScore}%.`,
          icon: Compass,
          onAction: () => {
            onNavigateToTab('explorer');
            setSearchQuery('');
          }
        });
      }
    });

    // 2. Search Roadmap Milestones
    const milestones = [
      { title: 'Foundational Mathematics & Scripting Basics', desc: 'Completed basic calculus, matrices, python logic models and algorithmic scripts.' },
      { title: 'Core Neural Architecture & Deep Learning loops', desc: 'Active target covering standard neural loops, backprop, and parameters.' },
      { title: 'Advanced NLP Synthesizers & Fine-tuning models', desc: 'Locked milestones on Transformers, synthetic generators, and fine-tuning.' }
    ];
    milestones.forEach((mile, idx) => {
      if (mile.title.toLowerCase().includes(query) || mile.desc.toLowerCase().includes(query)) {
        matches.push({
          uniqueId: `roadmap-${idx}`,
          type: 'roadmap',
          typeLabel: 'Roadmap Milestone',
          title: mile.title,
          desc: mile.desc,
          icon: Map,
          onAction: () => {
            onNavigateToTab('roadmaps');
            setSearchQuery('');
          }
        });
      }
    });

    // 3. Search Activity Logs
    activities.forEach((act) => {
      if (act.title.toLowerCase().includes(query) || act.description.toLowerCase().includes(query) || act.category.toLowerCase().includes(query)) {
        matches.push({
          uniqueId: `activity-${act.id}`,
          type: 'activity',
          typeLabel: `Past Activity (${act.category.toUpperCase()})`,
          title: act.title,
          desc: act.description,
          icon: act.category === 'assessment' ? Award : CheckCircle2,
          onAction: () => {
            setActiveSubTab('activity');
            setFilterCategory(act.category);
            setSearchQuery('');
          }
        });
      }
    });

    return matches;
  };

  const searchMatches = getSearchMatches();

  // Computed achievements
  const getAchievements = () => {
    const customCount = activities.filter(a => a.category === 'custom').length;
    const hasRoadmap = activities.some(a => a.category === 'roadmap');
    const hasExplorer = activities.some(a => a.category === 'explorer');
    const hasAssessment = currentUser.profileCompleted || activities.some(a => a.category === 'assessment');
    const totalPoints = activities.length * 15;

    return [
      {
        id: 'cognitive-pioneer',
        name: 'Cognitive Pioneer',
        description: 'Complete all 4-phase psychometric talent alignment diagnostics.',
        unlocked: hasAssessment,
        icon: Award,
        color: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900',
        progress: hasAssessment ? 1 : 0,
        maxProgress: 1,
        reward: '+15 PTS'
      },
      {
        id: 'pathfinder-architect',
        name: 'Pathfinder Architect',
        description: 'Configure and generate a personalized learning roadmap syllabus.',
        unlocked: hasRoadmap,
        icon: Map,
        color: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900',
        progress: hasRoadmap ? 1 : 0,
        maxProgress: 1,
        reward: '+15 PTS'
      },
      {
        id: 'data-cartographer',
        name: 'Data Cartographer',
        description: 'Inspect detailed salary indexes and growth rates in the Career Explorer.',
        unlocked: hasExplorer,
        icon: Compass,
        color: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
        progress: hasExplorer ? 1 : 0,
        maxProgress: 1,
        reward: '+15 PTS'
      },
      {
        id: 'resilience-master',
        name: 'Resilience Master',
        description: 'Log 2 or more custom academic milestones to your timeline tracker.',
        unlocked: customCount >= 2,
        icon: CheckCircle2,
        color: 'text-purple-600 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:border-purple-900',
        progress: customCount,
        maxProgress: 2,
        reward: '+30 PTS'
      },
      {
        id: 'apex-candidate',
        name: 'Apex Candidate',
        description: 'Reach a milestone total of 75 progress points in your workspace analytics.',
        unlocked: totalPoints >= 75,
        icon: TrendingUp,
        color: 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900',
        progress: totalPoints,
        maxProgress: 75,
        reward: '+50 PTS'
      }
    ];
  };

  const achievements = getAchievements();
  const unlockedBadgesCount = achievements.filter(b => b.unlocked).length;

  const [dailyPulseInput, setDailyPulseInput] = useState('');
  const [showGoalConfetti, setShowGoalConfetti] = useState(false);
  const [animatingCheckmark, setAnimatingCheckmark] = useState(false);
  
  const [loggedPulse, setLoggedPulse] = useState<{ goal: string; completed: boolean } | null>(() => {
    const stored = localStorage.getItem('careerai_daily_pulse');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });

  const handleLogPulse = (goalText: string) => {
    const finalGoal = goalText.trim();
    if (!finalGoal) return;

    const pulseObj = { goal: finalGoal, completed: false };
    setLoggedPulse(pulseObj);
    localStorage.setItem('careerai_daily_pulse', JSON.stringify(pulseObj));

    // Log to Activity Log!
    const newAct = {
      id: Date.now(),
      category: 'custom',
      title: 'Daily Career Pulse Logged',
      description: `Committed to today's learning/career goal: "${finalGoal}". Keep pushing!`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      iconType: 'custom'
    };

    setActivities((prev) => [newAct, ...prev]);
    setDailyPulseInput('');
  };

  const handleCompletePulse = () => {
    if (!loggedPulse) return;
    const updated = { ...loggedPulse, completed: true };
    setLoggedPulse(updated);
    localStorage.setItem('careerai_daily_pulse', JSON.stringify(updated));

    // Trigger celebratory animations
    setShowGoalConfetti(true);
    setAnimatingCheckmark(true);
    setTimeout(() => {
      setShowGoalConfetti(false);
    }, 2000);
    setTimeout(() => {
      setAnimatingCheckmark(false);
    }, 1000);

    // Log to Activity Log!
    const newAct = {
      id: Date.now() + 1,
      category: 'custom',
      title: 'Daily Goal Completed!',
      description: `Successfully accomplished today's focus milestone: "${loggedPulse.goal}". Excellent drive!`,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      }),
      iconType: 'custom'
    };

    setActivities((prev) => [newAct, ...prev]);
  };

  const handleResetPulse = () => {
    setLoggedPulse(null);
    localStorage.removeItem('careerai_daily_pulse');
  };

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    // Fetch matching predictions
    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading recommendations on dashboard mount:', err);
        setLoading(false);
      });
  }, [currentUser]);

  if (!currentUser) return null;

  const topRec = recommendations[0];

  // Dynamically calculate progress metrics for chart visualization
  const getAssessmentCompletion = () => {
    if (currentUser.profileCompleted) return 100;
    let score = 0;
    if (currentUser.interests && currentUser.interests.length > 0) score += 25;
    if (currentUser.skills && currentUser.skills.length > 0) score += 25;
    if (currentUser.mbti) score += 25;
    if (currentUser.aptitudeScore !== undefined) score += 25;
    return score || 20;
  };

  const getRoadmapCompletion = () => {
    const hasGeneratedRoadmap = activities.some(a => a.category === 'roadmap');
    const customCount = activities.filter(a => a.category === 'custom').length;
    let score = 33; // Starts with default completed milestone
    if (hasGeneratedRoadmap) score += 33;
    if (customCount > 0) score += Math.min(customCount * 17, 34);
    return Math.min(score, 100);
  };

  const assessmentRate = getAssessmentCompletion();
  const roadmapRate = getRoadmapCompletion();

  const progressChartData = [
    {
      stage: 'Phase 1',
      name: 'Interests & Profile',
      Assessment: currentUser.interests && currentUser.interests.length > 0 ? 100 : 40,
      Roadmap: 10,
    },
    {
      stage: 'Phase 2',
      name: 'Personality Evaluation',
      Assessment: currentUser.mbti ? 100 : 30,
      Roadmap: 25,
    },
    {
      stage: 'Phase 3',
      name: 'Aptitude Test Diagnostics',
      Assessment: currentUser.aptitudeScore !== undefined ? 100 : 20,
      Roadmap: 45,
    },
    {
      stage: 'Phase 4',
      name: 'Syllabus Milestones',
      Assessment: currentUser.profileCompleted ? 100 : 15,
      Roadmap: roadmapRate >= 66 ? 100 : 66,
    },
    {
      stage: 'Phase 5',
      name: 'Practical Projects',
      Assessment: currentUser.profileCompleted ? 80 : 10,
      Roadmap: roadmapRate >= 80 ? 90 : 50,
    },
    {
      stage: 'Phase 6',
      name: 'Placement Readiness',
      Assessment: currentUser.profileCompleted ? 100 : 5,
      Roadmap: roadmapRate === 100 ? 100 : 35,
    }
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6 text-left" id="student-overview-root">
      
      {/* Top Welcome banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between items-start sm:flex-row sm:items-center" id="student-welcome-card">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-blue-600" />
            Welcome back, {currentUser.name}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">Your AI Career Counseling platform is active and processing workspace data logs.</p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 sm:mt-0">
          <button
            onClick={handleExportPDF}
            className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 shadow-sm transition flex items-center bg-white"
            id="btn-export-dashboard-pdf"
            title="Download Career guidance report"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
            Export Report to PDF
          </button>
          
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status:</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
              currentUser.profileCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}>
              {currentUser.profileCompleted ? 'Profile Active' : 'Setup Incomplete'}
            </span>
          </div>
        </div>
      </div>

      {/* Omni-search bar */}
      <div className="relative" id="omni-search-container">
        <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-center px-4 py-3" id="search-bar-wrapper">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search matching pathways, roadmap milestones, assessments, or activities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-semibold text-slate-700 dark:text-slate-250 placeholder-slate-400 bg-transparent border-none outline-none focus:ring-0"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>

        {/* Floating Live Search Results Panel */}
        {searchQuery.trim() !== '' && (
          <div className="absolute left-0 right-0 mt-2 z-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 text-left max-h-[400px] overflow-y-auto space-y-4" id="search-dropdown-overlay">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search Matches</span>
              <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                {searchMatches.length} Matches Found
              </span>
            </div>

            {searchMatches.length === 0 ? (
              <div className="text-center py-6">
                <Compass className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No matching workspace resources found</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">Try searching for keywords like "math", "AI", "assessment", or "scientist".</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {searchMatches.map((match) => {
                  return (
                    <div
                      key={match.uniqueId}
                      onClick={match.onAction}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 cursor-pointer rounded-xl px-2 transition group"
                    >
                      <div className="flex items-start space-x-3 text-left">
                        <div className={`mt-0.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-850 group-hover:scale-105 transition ${
                          match.type === 'career' ? 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950' :
                          match.type === 'roadmap' ? 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950' :
                          'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950'
                        }`}>
                          <match.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{match.typeLabel}</span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none mt-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">{match.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">{match.desc}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center space-x-2">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300">Inspect</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition translate-x-0 group-hover:translate-x-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horizontal Tabs inside Student Dashboard */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`border-b-2 py-3 px-1 text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-600'
            }`}
          >
            Dashboard Overview
          </button>
          <button
            onClick={() => setActiveSubTab('activity')}
            className={`border-b-2 py-3 px-1 text-xs font-bold uppercase tracking-wider transition-all ${
              activeSubTab === 'activity'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-600'
            }`}
          >
            Activity Log
          </button>
          <button
            onClick={() => setActiveSubTab('achievements')}
            className={`border-b-2 py-3 px-1 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
              activeSubTab === 'achievements'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:border-slate-300 hover:text-slate-600'
            }`}
          >
            <span>Badges & Accolades</span>
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-[9px] font-black px-1.5 py-0.5 rounded-full">
              {unlockedBadgesCount}/5
            </span>
          </button>
        </nav>
      </div>

      {activeSubTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12" id="student-dashboard-grid">
        
        {/* Left Column (Main widgets) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Daily Career Pulse Widget */}
          <div className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 text-left" id="daily-career-pulse-card">
            
            {/* Confetti Particle Overlay */}
            {showGoalConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl z-20" id="confetti-overlay-container">
                {Array.from({ length: 30 }).map((_, idx) => {
                  const delay = `${(idx % 5) * 0.08}s`;
                  const colors = ['bg-pink-500', 'bg-blue-500', 'bg-emerald-400', 'bg-amber-400', 'bg-indigo-500', 'bg-rose-500'];
                  const colorClass = colors[idx % colors.length];
                  const size = idx % 2 === 0 ? 'w-2 h-2 rounded-full' : 'w-2 h-1.5 rounded-sm';
                  // Elegant radial trajectory
                  const angle = (idx / 30) * 2 * Math.PI;
                  const distance = 40 + (idx % 3) * 35;
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance - 20; // Slight upward offset
                  return (
                    <div
                      key={idx}
                      className={`absolute animate-confetti ${colorClass} ${size}`}
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: `${x}px`,
                        marginTop: `${y}px`,
                        animationDelay: delay,
                      }}
                    />
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-xs flex items-center">
                <Sparkles className="mr-1.5 h-4 w-4 text-blue-600 animate-pulse" />
                Daily Career Pulse Check-in
              </h3>
              <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                Morning Boost
              </span>
            </div>

            {!loggedPulse ? (
              <div className="space-y-3.5">
                <p className="text-[11px] text-slate-500 leading-normal">
                  Commit to one deliberate focus goal today. Consistent logging increases your placement success factors.
                </p>

                {/* Preset suggestions list */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    'Practice Interview',
                    'Learn ML Basics',
                    'Revise Resume',
                    'Study Algorithms'
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleLogPulse(preset)}
                      className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 rounded-lg px-2.5 py-1 transition"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>

                {/* Text entry field */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Or type a custom goal..."
                    value={dailyPulseInput}
                    onChange={(e) => setDailyPulseInput(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                  />
                  <button
                    onClick={() => handleLogPulse(dailyPulseInput)}
                    disabled={!dailyPulseInput.trim()}
                    className="rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 shadow-sm transition"
                  >
                    Commit
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-left space-y-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-blue-600">Active Daily Focus</span>
                  <p className={`text-xs font-bold ${loggedPulse.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    "{loggedPulse.goal}"
                  </p>
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto relative">
                  {!loggedPulse.completed ? (
                    <button
                      onClick={handleCompletePulse}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 shadow-sm transition-all duration-300 transform active:scale-95"
                    >
                      <Check className="h-3 w-3" />
                      <span>Complete Goal</span>
                    </button>
                  ) : (
                    <span className={`text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg flex items-center shadow-sm border border-emerald-100 ${animatingCheckmark ? 'animate-pop' : ''}`}>
                      <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Achieved!
                    </span>
                  )}
                  
                  <button
                    onClick={handleResetPulse}
                    className="rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-bold text-[10px] uppercase tracking-wider px-2 py-1.5 transition"
                    title="Reset pulse goal"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Top matched career pathway card */}
          {currentUser.profileCompleted && topRec ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden" id="dashboard-hero-recommendation">
              <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold flex items-center">
                    <Compass className="mr-1.5 h-4 w-4" />
                    Recommended Career: {topRec.name}
                  </h2>
                  <p className="text-blue-100 opacity-90 text-[11px] mt-1">Matched matching coefficients based on your active assessment.</p>
                </div>
                <div className="text-right leading-none">
                  <div className="text-2xl font-black">{topRec.overallScore}%</div>
                  <div className="text-[9px] uppercase tracking-wider opacity-75 mt-1">Match Index</div>
                </div>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-100">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Demand</p>
                  <p className="font-extrabold text-sm text-emerald-600 mt-2">High ★★★</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Avg. Salary</p>
                  <p className="font-extrabold text-sm text-slate-800 mt-2">{topRec.salaryRange}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Growth index</p>
                  <p className="font-extrabold text-sm text-blue-600 mt-2">+{topRec.growthScore}% YoY</p>
                </div>
              </div>

              <div className="p-5 flex items-center justify-between text-xs bg-slate-50/30">
                <span className="text-slate-500 font-medium">Want to inspect detailed skills matrices?</span>
                <button
                  onClick={() => onNavigateToTab('explorer')}
                  className="rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-1.5 text-[10px]"
                >
                  Explore Details
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-250 bg-white p-8 text-center space-y-4" id="dashboard-setup-prompt">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Psychometric assessments Pending</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                  To view personalized career matching ratings, please complete our 4-phase mental aptitude and career alignment assessment model first.
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('assessment')}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 shadow-md transition"
                id="btn-dashboard-start-assessment"
              >
                Launch Setup Assessment
              </button>
            </div>
          )}

          {/* Learning Progress Analytics Chart Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" id="dashboard-learning-progress-chart">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-xs flex items-center">
                  <TrendingUp className="mr-1.5 h-4 w-4 text-blue-600" />
                  Learning & Assessment Progress Analytics
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Real-time completion trajectory of diagnostic phases and learning roadmaps.</p>
              </div>
              <div className="flex gap-4 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                  <span className="text-slate-600">Assessment: {assessmentRate}%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Roadmap: {roadmapRate}%</span>
                </div>
              </div>
            </div>

            {/* Recharts responsive container */}
            <div className="h-64 w-full" id="recharts-progress-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={progressChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorAssessment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01}/>
                    </linearGradient>
                    <linearGradient id="colorRoadmap" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.01}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fill: '#64748b', fontSize: 9, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-left space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              {payload[0].payload.stage} - {payload[0].payload.name}
                            </p>
                            <div className="space-y-0.5">
                              {payload.map((item: any) => (
                                <p key={item.name} className="text-xs font-bold flex justify-between items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <span className={`h-1.5 w-1.5 rounded-full ${item.name === 'Assessment' ? 'bg-blue-600' : 'bg-emerald-500'}`}></span>
                                    {item.name}:
                                  </span>
                                  <span className="text-slate-800">{item.value}%</span>
                                </p>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Assessment"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAssessment)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Roadmap"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRoadmap)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Educational Roadmap milestones */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" id="dashboard-roadmap-tracker">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-slate-900 text-xs flex items-center">
                <Map className="mr-1.5 h-4 w-4 text-blue-600" />
                Active Roadmap Milestones
              </h3>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                Tracked
              </span>
            </div>

            <div className="relative pl-6 border-l border-slate-150 ml-2 space-y-5">
              <div className="relative">
                <div className="absolute -left-8 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white border-2 border-white ring-1 ring-emerald-500 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-none">Foundational Mathematics & Scripting Basics</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-none">Completed milestone</p>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -left-8 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white border-2 border-white ring-1 ring-blue-600 z-10 animate-pulse"></div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-none">Core Neural Architecture & Deep Learning loops</p>
                  <p className="text-[10px] text-blue-500 font-bold mt-1 leading-none">Current Target milestone</p>
                </div>
              </div>
              <div className="relative opacity-40">
                <div className="absolute -left-8 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-white border-2 border-white ring-1 ring-slate-200 z-10"></div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-none">Advanced NLP Synthesizers & Fine-tuning models</p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-none">Locked</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
              <span className="text-[10px] text-slate-400 font-medium">Looking for customized timetables?</span>
              <button
                onClick={() => onNavigateToTab('roadmaps')}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center"
              >
                <span>Syllabus Timetable Generator</span>
                <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (Side info blocks) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Skill Analysis breakdown card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" id="dashboard-skills-breakdown">
            <h3 className="font-bold text-slate-900 text-xs flex items-center">
              <Award className="mr-1.5 h-4 w-4 text-blue-600" />
              AI Skill Analytics
            </h3>
            
            <div className="space-y-3.5">
              {[
                { label: 'Technical programming', value: 92, color: 'bg-emerald-500' },
                { label: 'Machine learning', value: 78, color: 'bg-blue-600' },
                { label: 'Data orchestration', value: 45, color: 'bg-amber-500' }
              ].map((skill) => (
                <div key={skill.label} className="space-y-1">
                  <div className="flex justify-between text-[11px] leading-none">
                    <span className="text-slate-600 font-semibold">{skill.label}</span>
                    <span className="font-bold text-slate-800">{skill.value}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${skill.color}`} style={{ width: `${skill.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab('resume')}
              className="w-full mt-4 py-2 border border-dashed border-slate-200 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 hover:text-slate-600 transition"
            >
              Check Resume Keywords Alignment
            </button>
          </div>

          {/* Mini Badges earned Accolades card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3" id="dashboard-mini-achievements">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-xs flex items-center">
                <Award className="mr-1.5 h-4 w-4 text-blue-600" />
                Badge Accolades
              </h3>
              <button
                onClick={() => setActiveSubTab('achievements')}
                className="text-[9px] font-bold text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
            
            <div className="flex -space-x-2 overflow-hidden">
              {achievements.map((badge) => {
                const IconComponent = badge.icon;
                return (
                  <div
                    key={badge.id}
                    title={`${badge.name}: ${badge.unlocked ? 'Unlocked' : 'Locked'}`}
                    className={`inline-block h-8 w-8 rounded-full border-2 border-white bg-white flex items-center justify-center shadow-sm ${
                      badge.unlocked ? badge.color.split(' ')[0] + ' bg-slate-50 text-blue-600' : 'text-slate-300 bg-slate-50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 leading-none mt-1">You have unlocked {unlockedBadgesCount} of 5 achievements.</p>
          </div>

          {/* AI Advisor Chat assistant block */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white shadow-xl space-y-4" id="dashboard-chat-shortcut">
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-blue-500 p-1">
                <Sparkles className="h-4 w-4 text-white" />
              </span>
              <h3 className="font-bold text-xs text-white">CareerAI Assistant</h3>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              "Based on your current progress, I suggest focusing on TensorFlow libraries this weekend. Your ATS score for recent job postings in Palo Alto increased by 12%!"
            </p>

            <button
              onClick={() => onNavigateToTab('chat')}
              className="w-full flex items-center justify-center space-x-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 shadow transition"
              id="btn-goto-advisor-chat"
            >
              <span>Consult Dr. Evelyn</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </div>
    )}

      {activeSubTab === 'activity' && (
        <div className="space-y-6" id="activity-log-container">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200 rounded-2xl p-5 shadow-sm gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="mr-2 h-5 w-5 text-blue-600" />
                Personalized Workspace Activity Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Track your progress history, completed assessments, and milestone timeline.</p>
            </div>
            
            {/* Quick manual logging button */}
            <button
              onClick={() => setShowAddLogModal(true)}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 shadow-sm transition flex items-center"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Log Custom Milestone
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            
            {/* Left: Interactive Filter Panels */}
            <div className="lg:col-span-3 space-y-3.5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Activity Filters</h3>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Activities', count: activities.length },
                    { id: 'assessment', label: 'Assessments', count: activities.filter(a => a.category === 'assessment').length },
                    { id: 'roadmap', label: 'Roadmaps', count: activities.filter(a => a.category === 'roadmap').length },
                    { id: 'explorer', label: 'Career Explorer', count: activities.filter(a => a.category === 'explorer').length },
                    { id: 'custom', label: 'Custom Milestones', count: activities.filter(a => a.category === 'custom').length }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setFilterCategory(filter.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                        filterCategory === filter.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        filterCategory === filter.id ? 'bg-blue-200/50 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>{filter.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Statistics Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Analytics Summary</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Progress Points</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{activities.length * 15} PTS</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recent Activity Rate</span>
                    <p className="text-xs font-bold text-emerald-600 mt-1 flex items-center">
                      <TrendingUp className="mr-1 h-3.5 w-3.5" />
                      Active (Perfect Streak)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Vertical Timeline */}
            <div className="lg:col-span-9 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                
                {filteredActivities.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Compass className="mx-auto h-12 w-12 text-slate-300" />
                    <p className="text-sm font-bold text-slate-800">No activities found in this filter group</p>
                    <p className="text-xs text-slate-500">Your logged items will show up here as soon as they occur.</p>
                  </div>
                ) : (
                  <div className="relative pl-6 border-l border-slate-150 ml-3 space-y-6">
                    {filteredActivities.map((act) => {
                      const IconComponent = getIcon(act.iconType);
                      return (
                        <div key={act.id} className="relative group text-left">
                          
                          {/* Timeline bullet */}
                          <div className={`absolute -left-9.5 top-0.5 flex h-7 w-7 items-center justify-center rounded-full border bg-white shadow-sm ring-4 ring-white z-10 transition group-hover:scale-110 ${
                            act.category === 'assessment' ? 'text-blue-600 border-blue-200' :
                            act.category === 'roadmap' ? 'text-emerald-600 border-emerald-200' :
                            act.category === 'explorer' ? 'text-amber-600 border-amber-200' :
                            'text-purple-600 border-purple-200'
                          }`}>
                            <IconComponent className="h-3.5 w-3.5" />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="text-xs font-extrabold text-slate-900 leading-none">{act.title}</h4>
                              <span className="text-[10px] font-medium text-slate-400">{act.timestamp}</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{act.description}</p>
                            
                            {/* Tags or interactive buttons inside activity logs */}
                            <div className="flex items-center space-x-2 pt-0.5">
                              <span className={`text-[9px] font-extrabold rounded-full px-2 py-0.5 uppercase tracking-wide ${
                                act.category === 'assessment' ? 'bg-blue-50 text-blue-700' :
                                act.category === 'roadmap' ? 'bg-emerald-50 text-emerald-700' :
                                act.category === 'explorer' ? 'bg-amber-50 text-amber-700' :
                                'bg-purple-50 text-purple-700'
                              }`}>
                                {act.category}
                              </span>
                              {act.score && (
                                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                                  Match Index: {act.score}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </div>

          </div>

          {/* Add custom log modal popup */}
          {showAddLogModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl text-left space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center">
                  <Sparkles className="mr-1.5 h-4 w-4 text-blue-600" />
                  Log Custom Career Milestone
                </h3>
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Milestone Heading</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Completed Stanford symbolic systems module"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Narrative Description</label>
                    <textarea
                      required
                      placeholder="Give a brief description of the learnings, certificates, or milestones reached."
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                    />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddLogModal(false);
                        setNewTitle('');
                        setNewDesc('');
                      }}
                      className="flex-1 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs py-2 shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 shadow-sm"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {activeSubTab === 'achievements' && (
        <div className="space-y-6" id="achievements-tab-container">
          
          {/* Header Banner */}
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-xl flex flex-col justify-between items-start md:flex-row md:items-center gap-4">
            <div className="space-y-1 text-left">
              <h2 className="text-base font-bold text-white flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-blue-400 animate-pulse" />
                Gamified Accolades & Badge Center
              </h2>
              <p className="text-xs text-slate-300">Boost your placement probability indices by unlocking skill milestones and vocational badges.</p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Progress Score</span>
              <span className="text-2xl font-black text-blue-400 block mt-0.5">{activities.length * 15} PTS</span>
            </div>
          </div>

          {/* Core Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="badges-grid-layout">
            {achievements.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`rounded-2xl border p-5 shadow-sm text-left flex flex-col justify-between space-y-4 transition hover:shadow-md ${
                    badge.unlocked
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50/50 border-slate-200/60 opacity-75 border-dashed'
                  }`}
                >
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-2xl border flex items-center justify-center ${
                        badge.unlocked ? badge.color : 'bg-slate-100 text-slate-300 border-slate-200'
                      }`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        badge.unlocked ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {badge.unlocked ? 'Unlocked' : 'Locked'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{badge.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed min-h-[32px]">{badge.description}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 border-t border-slate-100 pt-3 text-left">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">
                      <span>Progress</span>
                      <span>{badge.progress} / {badge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${badge.unlocked ? 'bg-blue-600' : 'bg-slate-300'}`}
                        style={{ width: `${Math.min(100, (badge.progress / badge.maxProgress) * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 pt-1">
                      <span>Reward Accolade:</span>
                      <span className={badge.unlocked ? 'text-blue-600 font-semibold' : 'text-slate-400'}>{badge.reward}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
