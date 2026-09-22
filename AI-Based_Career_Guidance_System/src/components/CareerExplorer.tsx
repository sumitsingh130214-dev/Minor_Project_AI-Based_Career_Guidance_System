import React, { useState } from 'react';
import { Compass, Search, Filter, BookOpen, DollarSign, BarChart3, Star, Sparkles } from 'lucide-react';

interface CareerField {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  educationPath: string[];
  salaryRange: string;
  futureScope: string;
  growthTrends: string;
  demandScore: number;
  relatedCareers: string[];
}

export default function CareerExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minDemand, setMinDemand] = useState(0);
  const [activeCareerId, setActiveCareerId] = useState('ai-engineer');

  const CAREERS_DB: CareerField[] = [
    {
      id: 'ai-engineer',
      name: 'AI Engineer',
      description: 'Design, develop, and deploy cutting-edge neural architectures, machine learning models, and complex generative AI flows to automate cognitive operations.',
      requiredSkills: ['Python', 'PyTorch/TensorFlow', 'LLMs', 'Prompt Engineering', 'API Design', 'SQL'],
      educationPath: ['B.S. in Computer Science, Math, or equivalent', 'Advanced certifications in Machine Learning / Generative AI', 'Build portfolio of active API models'],
      salaryRange: '$115,000 - $190,000',
      futureScope: 'Extreme, exponential expansion. Generative systems are automating core sector workflows, driving a historical hiring demand.',
      growthTrends: 'Compound annual growth rate (CAGR) of 36% projected globally.',
      demandScore: 98,
      relatedCareers: ['Data Scientist', 'ML Infrastructure Engineer', 'Software Engineer']
    },
    {
      id: 'data-scientist',
      name: 'Data Scientist',
      description: 'Analyze massive datasets to extract actionable product patterns, train machine learning algorithms, and build visual metrics tables.',
      requiredSkills: ['Python', 'R', 'SQL', 'Pandas & NumPy', 'A/B Testing', 'Tableau'],
      educationPath: ['B.S. in Statistics, Data Science, or Economics', 'Specialize in regression, classification, or predictive models', 'Complete real-world analytical capstone project'],
      salaryRange: '$105,000 - $165,000',
      futureScope: 'Extremely valuable. Businesses require data-driven decisions rather than speculative planning, keeping analytics hiring highly consistent.',
      growthTrends: 'Estimated 25% sector volume increase until 2030.',
      demandScore: 94,
      relatedCareers: ['AI Engineer', 'Business Analyst', 'Financial Quantitative Analyst']
    },
    {
      id: 'software-engineer',
      name: 'Software Engineer',
      description: 'Program robust, high-performance web and system architectures, optimizing computational efficiency and security constraints.',
      requiredSkills: ['Java/C++', 'Python', 'Go/Rust', 'Data Structures & Algorithms', 'Linux', 'Git & CI/CD'],
      educationPath: ['B.S. in Computer Science or Software Engineering', 'Master core memory management and software design patterns', 'Contribute to open-source or algorithmic sandboxes'],
      salaryRange: '$95,000 - $155,000',
      futureScope: 'Core foundational demand. Software serves as the base layer of modern industry, keeping back-end engineering highly stable.',
      growthTrends: 'Steady global software market expansion at ~14% CAGR.',
      demandScore: 90,
      relatedCareers: ['Full Stack Developer', 'DevOps Engineer', 'Cloud Engineer']
    },
    {
      id: 'full-stack-developer',
      name: 'Full Stack Developer',
      description: 'Create end-to-end web systems by coding interactive user interfaces on the frontend while designing scalable schemas on the backend.',
      requiredSkills: ['JavaScript/TypeScript', 'React.js', 'Node.js/Express', 'Tailwind CSS', 'PostgreSQL', 'REST API Routing'],
      educationPath: ['Tech Bootcamp or B.S. in Web Technologies', 'Create and deploy 3 fully working multi-page SaaS applications', 'Master database normalization and query performance'],
      salaryRange: '$90,000 - $145,000',
      futureScope: 'Highly dynamic. SaaS startups, e-commerce, and bespoke corporate platforms maintain a massive, ongoing demand for full-stack developers.',
      growthTrends: 'Healthy 20% annual vacancy increase across global tech hubs.',
      demandScore: 92,
      relatedCareers: ['Software Engineer', 'UX/UI Designer', 'Cloud Engineer']
    },
    {
      id: 'cloud-engineer',
      name: 'Cloud Engineer',
      description: 'Architect, implement, and maintain scalable cloud infrastructure, managing resource virtualization and network storage configurations.',
      requiredSkills: ['AWS/GCP/Azure', 'Terraform (IaC)', 'Linux Systems', 'Docker & Kubernetes', 'Networking & Firewalls', 'Python'],
      educationPath: ['B.S. in Information Systems or equivalent', 'Obtain AWS Solutions Architect / Cloud Solutions Certificate', 'Practice deploying clustered system microservices'],
      salaryRange: '$100,000 - $160,000',
      futureScope: 'Sustained peak. Organizations are migrating legacy physical servers to hybrid cloud platforms, making cost and resource engineering a necessity.',
      growthTrends: 'Rapid growth at ~22% CAGR.',
      demandScore: 88,
      relatedCareers: ['DevOps Engineer', 'Cyber Security Analyst', 'Software Engineer']
    },
    {
      id: 'cyber-security-analyst',
      name: 'Cyber Security Analyst',
      description: 'Safeguard organization networks and digital records by monitoring traffic patterns, implementing firewalls, and investigating vulnerability exploits.',
      requiredSkills: ['Network Security', 'Linux', 'Ethical Hacking (Pentesting)', 'SIEM Tools', 'Cryptography', 'Python'],
      educationPath: ['B.S. in Cyber Security or Computer Science', 'Obtain CompTIA Security+ or Certified Ethical Hacker (CEH) certification', 'Participate in Capture The Flag (CTF) security events'],
      salaryRange: '$98,000 - $150,000',
      futureScope: 'Mandatory sector. High-profile cyber threats and strict compliance frameworks make security engineers highly valued and well-paid.',
      growthTrends: 'Urgent demand, vacancies growing by 32% year-over-year.',
      demandScore: 95,
      relatedCareers: ['Cloud Engineer', 'DevOps Engineer', 'Systems Admin']
    },
    {
      id: 'devops-engineer',
      name: 'DevOps Engineer',
      description: 'Bridge software writing and system deployment by automating development pipelines, monitoring server logs, and tracking system health.',
      requiredSkills: ['CI/CD (Jenkins/GitHub Actions)', 'Docker & Kubernetes', 'Terraform', 'Shell Scripting', 'Prometheus & Grafana', 'Git'],
      educationPath: ['B.S. in Software Engineering or equivalent', 'Obtain Kubernetes Administrator (CKA) or DevOps AWS certificate', 'Automate multi-stage code building pipelines'],
      salaryRange: '$110,000 - $170,000',
      futureScope: 'Elite technical niche. Managing rapid, secure software delivery without breaking systems is highly specialized, keeping pay premiums top-tier.',
      growthTrends: 'Strong growth, ~24% increase in specialized job postings.',
      demandScore: 89,
      relatedCareers: ['Cloud Engineer', 'Software Engineer', 'Systems Admin']
    },
    {
      id: 'business-analyst',
      name: 'Business Analyst',
      description: 'Bridge business strategies and engineering teams by analyzing workflows, drafting software requirements, and reviewing system integrations.',
      requiredSkills: ['Agile Methodologies', 'SQL', 'Requirement Gathering', 'Process Mapping', 'Jira/Confluence', 'Data Visualization'],
      educationPath: ['B.S. in Business Administration, Finance, or CIS', 'Obtain CBAP (Certified Business Analysis Professional) certificate', 'Gain experience compiling functional software requirements'],
      salaryRange: '$80,000 - $120,000',
      futureScope: 'Highly stable. Enterprise operations require objective business analysts to guide software engineers, preventing costly scope drift.',
      growthTrends: 'Consistent, stable growth at ~11% compound annual rate.',
      demandScore: 81,
      relatedCareers: ['Product Manager', 'Digital Marketer', 'Data Scientist']
    },
    {
      id: 'product-manager',
      name: 'Product Manager',
      description: 'Drive the feature roadmap of digital products by aligning engineering, user experience, marketing, and business KPIs.',
      requiredSkills: ['Agile Methodologies', 'User Experience (UX)', 'Market Analytics', 'Roadmap Schedulers', 'A/B Testing', 'Stakeholder Communication'],
      educationPath: ['B.S. in Business or Tech Field', 'Certified Scrum Product Owner (CSPO) or Product Alliance certificates', 'Experience launching side projects'],
      salaryRange: '$95,000 - $160,000',
      futureScope: 'Growing premium. Organizations prioritize product-market fit and design fidelity, requiring elite translators between code and commerce.',
      growthTrends: 'Robust demand with 15% increase in executive PM vacancies globally.',
      demandScore: 85,
      relatedCareers: ['Business Analyst', 'UX/UI Designer', 'Digital Marketer']
    },
    {
      id: 'digital-marketer',
      name: 'Digital Marketer',
      description: 'Orchestrate search rankings, paid ads, and brand operations on digital media to drive business traffic and acquisition metrics.',
      requiredSkills: ['SEO (Search Optimization)', 'Web Analytics', 'A/B Ad Testing', 'Copywriting', 'E-mail Automation', 'CRM Management'],
      educationPath: ['B.A. in Marketing, Communications, or Business', 'Obtain Ad Campaigns or HubSpot Inbound Marketing certifications', 'Manage personal blog or client marketing campaigns'],
      salaryRange: '$65,000 - $110,000',
      futureScope: 'Evolving field. Online customer acquisition is highly competitive, making data-oriented performance marketing a high-demand skill.',
      growthTrends: '12% sector expansion, with emphasis on generative AI marketing tools.',
      demandScore: 82,
      relatedCareers: ['UX/UI Designer', 'Business Analyst', 'Product Manager']
    },
    {
      id: 'ux-ui-designer',
      name: 'UX/UI Designer',
      description: 'Model interactive digital prototypes, user wireframes, and design components to deliver visually stunning and accessible applications.',
      requiredSkills: ['Figma', 'User Research', 'Wireframing & Prototyping', 'Visual Hierarchy', 'Design Systems', 'HTML/CSS Basics'],
      educationPath: ['B.S. in Interaction Design, HCI, or Graphic Design', 'Develop comprehensive, case-study-driven technical portfolio', 'Run real-world usability testing on physical mockups'],
      salaryRange: '$75,000 - $125,000',
      futureScope: 'Core focus. Exceptional interface usability defines product success in overcrowded markets, making creative UX experts indispensable.',
      growthTrends: 'Strong demand, ~16% annual growth in design-centered startups.',
      demandScore: 86,
      relatedCareers: ['Full Stack Developer', 'Digital Marketer', 'Product Manager']
    },
    {
      id: 'chartered-accountant',
      name: 'Chartered Accountant',
      description: 'Manage institutional tax compliance, financial audit schedules, and corporate ledger books, ensuring strict adherence to regulations.',
      requiredSkills: ['Corporate Tax Law', 'Financial Auditing', 'GAAP / IFRS Systems', 'Excel Modeling', 'Risk Assessment', 'SAP / ERP Systems'],
      educationPath: ['B.S. in Accounting or Finance', 'Pass rigorous state or national CA/CPA credentialing exams', 'Complete mandated multi-year auditing internship'],
      salaryRange: '$80,000 - $140,000',
      futureScope: 'Irreplaceable foundation. Regulatory requirements and fiscal complexities make certified financial auditors a permanently safe, high-earning profession.',
      growthTrends: 'Highly stable demand, 8% growth tied to macroeconomic expansions.',
      demandScore: 78,
      relatedCareers: ['Financial Quantitative Analyst', 'Business Analyst', 'Data Scientist']
    },
    {
      id: 'teacher',
      name: 'Teacher / Academic Educator',
      description: 'Instruct, guide, and mentor students across standardized curriculum tracks, drafting lesson modules and fostering cognitive development.',
      requiredSkills: ['Curriculum Planning', 'Classroom Leadership', 'Educational Psychology', 'Public Speaking', 'Student Assessment', 'E-learning Platforms'],
      educationPath: ['B.A. in Education or specific subject field', 'Obtain state-mandated teaching licenses or certifications', 'Complete student teaching classroom sessions'],
      salaryRange: '$50,000 - $85,000',
      futureScope: 'Societally crucial. Online training tools expand access, but human-led mentorship and pediatric emotional development remain permanently unreplaceable.',
      growthTrends: 'Steady demand, 6% annual increases, with high bonuses in specialized STEM/Special Ed sectors.',
      demandScore: 74,
      relatedCareers: ['Product Trainer', 'Corporate Recruiter', 'Business Analyst']
    },
    {
      id: 'healthcare-professional',
      name: 'Healthcare Professional (Nurse / Doctor)',
      description: 'Diagnose illnesses, administer medical remedies, and coordinate emergency or therapeutic clinical operations for patient welfare.',
      requiredSkills: ['Clinical Diagnostics', 'Patient Care Operations', 'Emergency Response', 'Medical Terminology', 'Anatomy & Physiology', 'EHR Management'],
      educationPath: ['B.S. in Nursing (BSN) or Doctor of Medicine (M.D.)', 'Pass state clinical licensing boards (NCLEX / USMLE)', 'Complete structured residency or hospital clinical rotations'],
      salaryRange: '$85,000 - $220,000',
      futureScope: 'Exceptional, recession-proof demand. Global demographic aging and persistent medical complexities require highly trained clinical personnel.',
      growthTrends: 'Fastest-growing job category globally, estimated at 40% growth by 2030.',
      demandScore: 96,
      relatedCareers: ['Medical Analyst', 'Health Tech Consultant', 'Academic Educator']
    }
  ];

  const filteredCareers = CAREERS_DB.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.requiredSkills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDemand = c.demandScore >= minDemand;
    return matchesSearch && matchesDemand;
  });

  const activeCareer = CAREERS_DB.find(c => c.id === activeCareerId) || CAREERS_DB[0];

  return (
    <div className="mx-auto max-w-7xl p-6" id="explorer-container">
      
      {/* Header section */}
      <div className="mb-6 text-left">
        <h1 className="text-xl font-bold text-slate-900 flex items-center">
          <Compass className="mr-2 h-5 w-5 text-slate-800" />
          Comprehensive Career Database Explorer
        </h1>
        <p className="text-xs text-slate-500 mt-1">Explore required skills, typical education paths, salary averages, and market demand stats across 14 elite pathways.</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3" id="explorer-filters">
        <div className="relative col-span-2">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search careers by name or skill keywords (e.g. Python, Figma, Accounting)..."
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white shadow-sm"
          />
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-xl border border-slate-200 px-3 py-1 shadow-sm">
          <Filter className="h-4 w-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Min Demand:</span>
          <select
            value={minDemand}
            onChange={(e) => setMinDemand(Number(e.target.value))}
            className="bg-transparent text-xs font-bold text-slate-700 outline-none cursor-pointer"
          >
            <option value={0}>All Levels</option>
            <option value={80}>High Demand (80%+)</option>
            <option value={90}>Peak Growth (90%+)</option>
          </select>
        </div>
      </div>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" id="explorer-main-grid">
        
        {/* Left list block */}
        <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-20rem)] overflow-y-auto pr-1 text-left" id="explorer-list-box">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">Available Career Tracks ({filteredCareers.length})</p>
          {filteredCareers.map((c) => {
            const isActive = c.id === activeCareerId;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCareerId(c.id)}
                className={`w-full rounded-xl border p-3 text-left transition-all ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
                id={`btn-explorer-item-${c.id}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold truncate pr-1">{c.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.demandScore}% Demand
                  </span>
                </div>
                <p className={`mt-1 text-[11px] line-clamp-1 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                  {c.description}
                </p>
              </button>
            );
          })}
          {filteredCareers.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No matching careers found.</p>
          )}
        </div>

        {/* Right Details Panel block */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-left space-y-6" id="explorer-detail-pane">
          
          {/* Header */}
          <div className="flex flex-col justify-between space-y-3 sm:flex-row sm:items-center sm:space-y-0">
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded-full bg-slate-100 p-1.5 text-slate-800">
                  <Compass className="h-5 w-5" />
                </span>
                <h2 className="text-base font-bold text-slate-900">{activeCareer.name}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{activeCareer.description}</p>
            </div>
            
            <div className="flex items-center space-x-1 rounded-xl bg-slate-50 border border-slate-200/60 p-3 self-start">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <div className="text-left leading-none ml-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Demand Level</p>
                <p className="text-sm font-extrabold text-slate-800 mt-0.5">{activeCareer.demandScore}%</p>
              </div>
            </div>
          </div>

          {/* Details list block */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3" id="explorer-indicators-trio">
            
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center space-x-1.5">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Salary Range</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1.5">{activeCareer.salaryRange}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center space-x-1.5">
                <BarChart3 className="h-4 w-4 text-indigo-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sector Growth</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1.5">{activeCareer.growthTrends}</p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center space-x-1.5">
                <BookOpen className="h-4 w-4 text-rose-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills Needed</span>
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1.5">{activeCareer.requiredSkills.length} Core Areas</p>
            </div>

          </div>

          {/* Skills Grid */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Core Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {activeCareer.requiredSkills.map((s) => (
                <span
                  key={s}
                  className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 whitespace-nowrap"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Educational Roadmap Steps */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Academic Preparation Path</p>
            <div className="space-y-2">
              {activeCareer.educationPath.map((step, index) => (
                <div key={index} className="flex items-center space-x-3 rounded-lg border border-slate-100 bg-white p-3 text-xs font-medium">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-150 text-[10px] font-bold text-slate-700">
                    {index + 1}
                  </span>
                  <span className="text-slate-600 truncate">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outlook Scope */}
          <div className="rounded-xl border border-slate-150 bg-slate-50/40 p-4 space-y-1">
            <h4 className="text-xs font-bold text-slate-800 flex items-center">
              <Sparkles className="mr-1.5 h-3.5 w-3.5 text-slate-700" />
              Outlook & Future Scope
            </h4>
            <p className="text-xs leading-relaxed text-slate-500">{activeCareer.futureScope}</p>
          </div>

          {/* Related Paths */}
          <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-4">
            <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Alternative Paths:</span>
            <div className="flex space-x-2">
              {activeCareer.relatedCareers.map((r) => (
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

      </div>

    </div>
  );
}
