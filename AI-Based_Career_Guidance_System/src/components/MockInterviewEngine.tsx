import React, { useState } from 'react';
import { User, MockInterviewQuestion, MockInterviewFeedback } from '../types';
import { UserCheck, Sparkles, AlertCircle, ArrowRight, CheckCircle2, MessageSquare, Play, RefreshCw } from 'lucide-react';

interface MockInterviewEngineProps {
  currentUser: User | null;
}

export default function MockInterviewEngine({ currentUser }: MockInterviewEngineProps) {
  const [targetCareer, setTargetCareer] = useState('Software Engineer');
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  
  // Evaluation States
  const [evaluating, setEvaluating] = useState(false);
  const [feedbacks, setFeedbacks] = useState<MockInterviewFeedback[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<MockInterviewFeedback | null>(null);
  
  // Phase controllers
  const [interviewPhase, setInterviewPhase] = useState<'idle' | 'interviewing' | 'completed'>('idle');

  const handleStartInterview = async () => {
    setLoadingQuestions(true);
    setFeedbacks([]);
    setAnswers({});
    setCurrentIndex(0);
    setInterviewPhase('idle');

    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetCareer })
      });
      const data = await response.json();
      setQuestions(data);
      setInterviewPhase('interviewing');
    } catch (err) {
      console.error('Error starting interview:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleNextOrSubmit = async () => {
    const currentQ = questions[currentIndex];
    const userAns = answers[currentQ.id] || '';

    if (!userAns.trim()) return;
    setEvaluating(true);

    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCareer,
          questionText: currentQ.question,
          userAnswer: userAns,
          category: currentQ.category
        })
      });
      const feedbackData: MockInterviewFeedback = await response.json();
      feedbackData.questionId = currentQ.id;
      feedbackData.questionText = currentQ.question;
      feedbackData.userAnswer = userAns;

      setFeedbacks(prev => [...prev, feedbackData]);
      setCurrentFeedback(feedbackData);

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setInterviewPhase('completed');
      }
    } catch (err) {
      console.error('Error evaluating interview answer:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const calculateOverallScore = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.score, 0);
    return Math.round(sum / feedbacks.length);
  };

  return (
    <div className="mx-auto max-w-5xl p-6" id="interview-container">
      
      {/* Header section */}
      <div className="mb-6 text-left">
        <h1 className="text-xl font-bold text-slate-900 flex items-center">
          <UserCheck className="mr-2 h-5 w-5 text-blue-600" />
          AI Mock Interview & Evaluation Simulator
        </h1>
        <p className="text-xs text-slate-500 mt-1">Practice realistic behavioral or technical interviews, grading key concept integration and scoring outcomes instantly.</p>
      </div>

      {interviewPhase === 'idle' ? (
        
        /* SETUP PORTLET */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm max-w-xl mx-auto space-y-5" id="setup-interview-card">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Play className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Configure Mock Workspace</h2>
              <p className="text-xs text-slate-500">Pick standard roles to retrieve custom technical prompts.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Career Role</label>
            <select
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400 bg-white"
            >
              <option value="AI Engineer">AI Engineer</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="UX/UI Designer">UX/UI Designer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Chartered Accountant">Chartered Accountant</option>
            </select>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loadingQuestions}
            className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-semibold text-xs py-2.5 shadow-sm transition"
            id="btn-trigger-start-interview"
          >
            {loadingQuestions ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                <span>Compiling mock syllabus...</span>
              </>
            ) : (
              <>
                <span>Launch Mock Interview</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

      ) : interviewPhase === 'interviewing' ? (
        
        /* ACTIVE INTERVIEW PANEL */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 text-left" id="active-interview-grid">
          
          {/* Question & Answer Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-5" id="interview-question-box">
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wide">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                Type: <strong className="capitalize text-slate-600">{questions[currentIndex]?.category}</strong>
              </span>
            </div>

            {/* Question Text */}
            <div className="rounded-xl bg-slate-50/50 border border-slate-100 p-4">
              <p className="text-xs font-bold text-slate-800 leading-normal">
                {questions[currentIndex]?.question}
              </p>
            </div>

            {/* Expected core topics warning */}
            <div className="text-[10px] text-slate-400 flex items-center space-x-1">
              <AlertCircle className="h-3.5 w-3.5 text-blue-500" />
              <span>Tip: Try incorporating core concepts like: <strong>{questions[currentIndex]?.expectedConcepts.join(', ')}</strong></span>
            </div>

            {/* Answer Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Technical Response</label>
              <textarea
                value={answers[questions[currentIndex]?.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [questions[currentIndex].id]: e.target.value })}
                placeholder="Formulate your structured response here. Write clearly, including operational metrics, algorithms, or behavioral actions where appropriate..."
                className="w-full h-40 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-none bg-slate-50/20"
                id="textarea-interview-answer-field"
                disabled={evaluating}
              ></textarea>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-end pt-3">
              <button
                onClick={handleNextOrSubmit}
                disabled={evaluating || !(answers[questions[currentIndex]?.id] || '').trim()}
                className="flex items-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-xs px-4 py-2 shadow-sm transition"
                id="btn-submit-interview-answer"
              >
                {evaluating ? (
                  <>
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    <span>Evaluating metrics...</span>
                  </>
                ) : (
                  <>
                    <span>{currentIndex === questions.length - 1 ? 'Finish & Finalize' : 'Submit & Next Question'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Quick-Audit Side Info Panel */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm lg:col-span-1 space-y-4" id="interview-help-side-bar">
            <h3 className="text-xs font-bold text-slate-900 flex items-center">
              <Sparkles className="mr-1.5 h-4 w-4 text-blue-600" /> Live HR Evaluator
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Your inputs are routed directly to the AI Engine. It evaluates your structure, syntax alignment, and use of relevant keywords.
            </p>
            <div className="rounded-xl border border-slate-150 bg-white p-3.5 text-[10px] text-slate-600 leading-normal">
              <p className="font-bold">Evaluation Standards:</p>
              <p className="mt-1">Candidates are scored out of 100 based on core topic coverage and professional articulation.</p>
            </div>
          </div>

        </div>

      ) : (
        
        /* COMPLETED PHASE VIEWS */
        <div className="space-y-6 text-left" id="interview-completed-pane">
          
          {/* Overall performance header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between items-start sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-slate-900 flex items-center">
                <CheckCircle2 className="mr-1.5 h-5 w-5 text-emerald-500" /> Interview Complete
              </h2>
              <p className="text-xs text-slate-500">AI Evaluator compiled audit metrics successfully.</p>
            </div>

            <div className="mt-4 flex items-center space-x-6 sm:mt-0 border-t pt-4 sm:border-t-0 sm:pt-0">
              <div className="text-center">
                <p className="text-2xl font-black text-blue-600 leading-none">{calculateOverallScore()}%</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mt-1">Average Rating</p>
              </div>
              <button
                onClick={handleStartInterview}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 shadow-sm transition flex items-center space-x-1.5"
                id="btn-restart-interview"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Launch New Interview</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Cards list */}
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Chronological Question Audit</p>
          <div className="space-y-6" id="interview-feedback-list-cards">
            {feedbacks.map((f, i) => (
              <div key={f.questionId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                
                <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-slate-800">Question {i + 1}: {f.questionText}</span>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded ${f.score >= 80 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    Score: {f.score}%
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                  
                  {/* Your Answer */}
                  <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Your Submitted Answer</span>
                    <p className="text-slate-600 leading-relaxed font-semibold italic">"{f.userAnswer}"</p>
                  </div>

                  {/* Sample answer */}
                  <div className="space-y-1 bg-blue-50/30 p-3 rounded-xl border border-blue-100/50">
                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wide">Model Expert Response</span>
                    <p className="text-slate-600 leading-relaxed font-semibold">"{f.sampleAnswer}"</p>
                  </div>

                </div>

                {/* Critiques */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide">Core Strengths</span>
                    <p className="text-slate-600 mt-1 leading-normal font-medium">{f.strength}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wide">Suggested Improvements</span>
                    <p className="text-slate-600 mt-1 leading-normal font-medium">{f.improvement}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

      )}

    </div>
  );
}
