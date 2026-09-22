import React, { useState } from 'react';
import { User } from '../types';
import { Users, Calendar, ClipboardList, Plus, Trash2, Check, Sparkles } from 'lucide-react';

interface CounselorDashboardViewProps {
  currentUser: User | null;
}

interface StudentReviewItem {
  id: string;
  name: string;
  email: string;
  targetCareer: string;
  progress: number;
  assessmentStatus: string;
}

interface AppointmentItem {
  id: string;
  studentName: string;
  date: string;
  time: string;
  type: string;
}

export default function CounselorDashboardView({ currentUser }: CounselorDashboardViewProps) {
  const [students, setStudents] = useState<StudentReviewItem[]>([
    { id: '1', name: 'James Wilson', email: 'james.wilson@stanford.edu', targetCareer: 'AI Engineer', progress: 92, assessmentStatus: 'Completed' },
    { id: '2', name: 'Maya Lin', email: 'maya.lin@mit.edu', targetCareer: 'UX/UI Designer', progress: 78, assessmentStatus: 'Completed' },
    { id: '3', name: 'Raj Patel', email: 'raj.patel@berkeley.edu', targetCareer: 'Full Stack Developer', progress: 45, assessmentStatus: 'In Progress' }
  ]);

  const [appointments, setAppointments] = useState<AppointmentItem[]>([
    { id: 'a1', studentName: 'James Wilson', date: 'Aug 21, 2026', time: '10:00 AM', type: 'Technical Mock Interview' },
    { id: 'a2', studentName: 'Maya Lin', date: 'Aug 22, 2026', time: '02:30 PM', type: 'Resume Portfolio Review' }
  ]);

  const [newFeedbackNote, setNewFeedbackNote] = useState('');
  const [activeStudentId, setActiveStudentId] = useState('1');
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [newAppt, setNewAppt] = useState({ studentName: 'James Wilson', date: '', time: '', type: 'Technical Mock Interview' });

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.date || !newAppt.time) return;

    const item: AppointmentItem = {
      id: `appt-${Date.now()}`,
      studentName: newAppt.studentName,
      date: newAppt.date,
      time: newAppt.time,
      type: newAppt.type
    };

    setAppointments([...appointments, item]);
    setShowAppointmentForm(false);
    setNewAppt({ studentName: 'James Wilson', date: '', time: '', type: 'Technical Mock Interview' });
  };

  const handleRemoveAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  return (
    <div className="mx-auto max-w-7xl p-6 space-y-6 text-left" id="counselor-portal">
      
      {/* Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between items-start sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center">
            <Users className="mr-2 h-5 w-5 text-blue-600" />
            Counselor Desk Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review active student assessments, schedule live mock interviews, and add feedback notes.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
          Role: Certified Career Counselor
        </span>
      </div>

      {/* Grid splits */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left: Registered Student list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 lg:col-span-1" id="counselor-students-col">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Students ({students.length})</p>
          <div className="space-y-2">
            {students.map((s) => {
              const isActive = s.id === activeStudentId;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveStudentId(s.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all flex flex-col justify-between ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                  id={`btn-counselor-select-student-${s.id}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className="text-xs font-bold text-slate-900">{s.name}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide rounded px-1.5 py-0.5 ${
                      s.assessmentStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {s.assessmentStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{s.targetCareer}</p>
                  
                  {/* Progress meter */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-600 h-full" style={{ width: `${s.progress}%` }}></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Middle/Right: Student review file & appointments schedule */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selected student file */}
          {activeStudent && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5" id="counselor-student-file">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Student Case Review</h3>
                  <h2 className="text-base font-bold text-slate-900 mt-2">{activeStudent.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeStudent.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Current target</p>
                  <p className="text-sm font-extrabold text-blue-600 mt-1.5">{activeStudent.targetCareer}</p>
                </div>
              </div>

              {/* Assessment analysis notes */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <ClipboardList className="mr-1 h-3.5 w-3.5" /> Career Assessment Outcomes
                  </p>
                  <ul className="list-inside list-disc text-slate-500 font-medium space-y-1">
                    <li>Personality archetype: <strong>INTJ (Architect)</strong></li>
                    <li>Technical skill index: <strong>92/100</strong></li>
                    <li>Mental aptitude ratio: <strong>88% (Quantitative)</strong></li>
                  </ul>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center">
                    <Sparkles className="mr-1 h-3.5 w-3.5" /> Automated Advisor Suggestions
                  </p>
                  <p className="text-[11px] leading-relaxed text-slate-500 font-medium">
                    Strong analytical skills detected. Recommend pushing for microservice containerization and robust cloud system architectures.
                  </p>
                </div>

              </div>

              {/* Counselor Feedback Notes input area */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Counselor Case Progress Notes</label>
                <textarea
                  value={newFeedbackNote}
                  onChange={(e) => setNewFeedbackNote(e.target.value)}
                  placeholder="Record counseling summaries, homework milestones, or career directions to share with the student..."
                  className="w-full h-20 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-slate-400 focus:outline-none bg-slate-50/10"
                  id="textarea-counselor-feedback-field"
                ></textarea>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      if (!newFeedbackNote.trim()) return;
                      // Display simulated success
                      setNewFeedbackNote('');
                    }}
                    className="flex items-center space-x-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] px-3.5 py-1.5 shadow"
                    id="btn-counselor-save-feedback"
                  >
                    <Check className="h-3 w-3" />
                    <span>Save Note</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Schedule appointments list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4" id="counselor-appointments">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center space-x-1.5">
                <Calendar className="h-4.5 w-4.5 text-blue-600" />
                <h3 className="font-bold text-slate-950 text-xs">Scheduled Counsel Slots</h3>
              </div>
              <button
                onClick={() => setShowAppointmentForm(!showAppointmentForm)}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center"
                id="btn-toggle-appointment-form"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Schedule Slot
              </button>
            </div>

            {/* FORM TO ADD SLOT */}
            {showAppointmentForm && (
              <form onSubmit={handleAddAppointment} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Student</label>
                    <select
                      value={newAppt.studentName}
                      onChange={(e) => setNewAppt({ ...newAppt, studentName: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
                    >
                      {students.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Date</label>
                    <input
                      type="text"
                      placeholder="Aug 21, 2026"
                      value={newAppt.date}
                      onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Time</label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={newAppt.time}
                      onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Discussion Type</label>
                    <select
                      value={newAppt.type}
                      onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold"
                    >
                      <option value="Technical Mock Interview">Technical Mock Interview</option>
                      <option value="Resume Portfolio Review">Resume Portfolio Review</option>
                      <option value="Scholarship Application Counsel">Scholarship Application Counsel</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-1.5 shadow"
                      id="btn-save-simulated-appt"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* APPOINTMENTS LIST */}
            <div className="space-y-2">
              {appointments.map((appt) => (
                <div key={appt.id} className="rounded-xl border border-slate-100 bg-white p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-extrabold text-slate-800">{appt.studentName}</span>
                    <span className="text-slate-400 font-medium mx-1.5">•</span>
                    <span className="text-slate-600 font-medium">{appt.type}</span>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wide">
                      {appt.date} at {appt.time}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveAppointment(appt.id)}
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
