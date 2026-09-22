import React, { useState, useEffect } from 'react';
import { User } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Sub Views
import StudentDashboardView from './components/StudentDashboardView';
import AssessmentEngine from './components/AssessmentEngine';
import CareerRecommendations from './components/CareerRecommendations';
import CareerCounselorChat from './components/CareerCounselorChat';
import CareerExplorer from './components/CareerExplorer';
import RoadmapGenerator from './components/RoadmapGenerator';
import ResumeAnalyzerAndBuilder from './components/ResumeAnalyzerAndBuilder';
import MockInterviewEngine from './components/MockInterviewEngine';
import JobUniversityScholarship from './components/JobUniversityScholarship';
import CounselorDashboardView from './components/CounselorDashboardView';
import AdminDashboardView from './components/AdminDashboardView';
import SaasLandingPage from './components/SaasLandingPage';

import { Brain, Sparkles, Key, Mail, Lock, ShieldCheck, Laptop, LogIn, X, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authRole, setAuthRole] = useState<'student' | 'counselor' | 'admin'>('student');
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Responsive sidebar togglers
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Login and registration states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Verification & Forgot password states
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'submit'>('request');
  const [resetOtp, setResetOtp] = useState('');
  const [showRegConfetti, setShowRegConfetti] = useState(false);

  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('careerai_theme') as 'light' | 'dark') || 'light';
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('careerai_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sync state to local storage or verify against session on initial render
  useEffect(() => {
    // Check if we can auto-login from session
    const stored = localStorage.getItem('careerai_session');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        // Set correct default tab based on role
        if (user.role === 'counselor') {
          setActiveTab('counselor_dashboard');
        } else if (user.role === 'admin') {
          setActiveTab('admin_dashboard');
        } else {
          setActiveTab('dashboard');
        }
      } catch (err) {
        localStorage.removeItem('careerai_session');
      }
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    if (isSignUp) {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        setAuthLoading(false);
        return;
      }
      if (password.length < 6 || !/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
        setAuthError('Password must be at least 6 characters and contain both letters and numbers.');
        setAuthLoading(false);
        return;
      }
    }

    const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/login';
    const payload = isSignUp 
      ? { email, password, confirmPassword, name: name || 'Student Candidate', role: authRole }
      : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // Handle unverified logins or general authentication failures
        if (responseData.requiresVerification) {
          setVerificationEmail(responseData.email);
          setSimulatedOtp(responseData.simulatedOtp);
          setRequiresVerification(true);
          setAuthError('Your email has not been verified yet. Please enter the OTP sent to your inbox.');
          return;
        }
        throw new Error(responseData.error || 'Authentication failed');
      }

      if (isSignUp) {
        // Successful signup triggers simulated OTP Verification
        setVerificationEmail(email);
        setSimulatedOtp(responseData.simulatedOtp);
        setRequiresVerification(true);
        setAuthSuccess('Account created successfully! A simulated verification OTP has been sent to your inbox.');
      } else {
        // Direct successful login
        const user: User = responseData.user;
        setCurrentUser(user);
        localStorage.setItem('careerai_session', JSON.stringify(user));
        setShowAuthModal(false);
        
        // Navigate to corresponding tab
        if (user.role === 'counselor') {
          setActiveTab('counselor_dashboard');
        } else if (user.role === 'admin') {
          setActiveTab('admin_dashboard');
        } else {
          setActiveTab('dashboard');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'The server returned an error during credentials verification.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, otpCode: otpCodeInput })
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'OTP verification failed');
      }

      // Automatically log in on successful verification
      const user: User = responseData.user;
      setCurrentUser(user);
      localStorage.setItem('careerai_session', JSON.stringify(user));
      
      // Trigger a confetti animation for new user registrations
      setShowRegConfetti(true);
      setTimeout(() => {
        setShowRegConfetti(false);
      }, 5000);
      
      // Cleanup inputs
      setRequiresVerification(false);
      setOtpCodeInput('');
      setSimulatedOtp('');
      setShowAuthModal(false);

      if (user.role === 'counselor') {
        setActiveTab('counselor_dashboard');
      } else if (user.role === 'admin') {
        setActiveTab('admin_dashboard');
      } else {
        setActiveTab('dashboard');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setAuthError(err.message || 'Invalid verification OTP code. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Password reset request failed');
      }

      setResetOtp(responseData.simulatedOtp);
      setResetStep('submit');
      setAuthSuccess('A simulated password reset OTP code has been sent to your email.');
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setAuthError(err.message || 'No user session matches this email address.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);

    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      setAuthLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otpCode: otpCodeInput, password, confirmPassword })
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error || 'Password reset failed');
      }

      setAuthSuccess('Password reset successfully! You can now authenticate with your new credentials.');
      setForgotPasswordMode(false);
      setResetStep('request');
      setOtpCodeInput('');
      setResetOtp('');
      setIsSignUp(false);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setAuthError(err.message || 'Error occurred while resetting your account password.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('careerai_session');
    setActiveTab('dashboard');
  };

  const handleSwitchUserByEmail = async (switchEmail: string) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: switchEmail, password: 'password123' })
      });

      if (!response.ok) throw new Error('Switch user failed');
      const responseData = await response.json();
      const user: User = responseData.user;
      setCurrentUser(user);
      localStorage.setItem('careerai_session', JSON.stringify(user));
      
      if (user.role === 'counselor') {
        setActiveTab('counselor_dashboard');
      } else if (user.role === 'admin') {
        setActiveTab('admin_dashboard');
      } else {
        setActiveTab('dashboard');
      }
    } catch (err) {
      console.error('Error swapping user profiles:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAssessmentComplete = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('careerai_session', JSON.stringify(updatedUser));
  };

  // Render current active tab view
  const renderActiveTabView = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return <StudentDashboardView currentUser={currentUser} onNavigateToTab={setActiveTab} />;
      case 'assessment':
        return <AssessmentEngine currentUser={currentUser} onAssessmentCompleted={handleAssessmentComplete} />;
      case 'recommendations':
        return <CareerRecommendations currentUser={currentUser} onNavigateToTab={setActiveTab} />;
      case 'counselor':
        return <CareerCounselorChat currentUser={currentUser} />;
      case 'explorer':
        return <CareerExplorer />;
      case 'roadmaps':
        return <RoadmapGenerator currentUser={currentUser} />;
      case 'resume':
        return <ResumeAnalyzerAndBuilder currentUser={currentUser} />;
      case 'interview':
        return <MockInterviewEngine currentUser={currentUser} />;
      case 'listings':
        return <JobUniversityScholarship currentUser={currentUser} />;
      case 'counselor_dashboard':
        return <CounselorDashboardView currentUser={currentUser} />;
      case 'admin_dashboard':
        return <AdminDashboardView currentUser={currentUser} />;
      default:
        return <StudentDashboardView currentUser={currentUser} onNavigateToTab={setActiveTab} />;
    }
  };

  if (!currentUser) {
    return (
      <div className="relative min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300" id="landing-main-shell">
        <SaasLandingPage 
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onLoginClick={(role) => {
            if (role) {
              setAuthRole(role);
            }
            setEmail('');
            setPassword('');
            setIsSignUp(false);
            setAuthError('');
            setShowAuthModal(true);
          }}
          onRegisterClick={() => {
            setIsSignUp(true);
            setAuthError('');
            setShowAuthModal(true);
          }}
        />

        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in" id="auth-modal-overlay">
            <div className="relative w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-7 shadow-2xl text-left transition-all" id="login-panel">
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setRequiresVerification(false);
                  setForgotPasswordMode(false);
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition"
                id="btn-close-auth-modal"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Brand header */}
              <div className="text-center space-y-2" id="brand-auth-header">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">CareerAI Pro</h1>
                  <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase">Made by Sumit & Vivek</p>
                </div>
              </div>

              {/* Alerts */}
              {authError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800 font-medium" id="auth-error-alert">
                  {authError}
                </div>
              )}
              {authSuccess && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 font-medium" id="auth-success-alert">
                  {authSuccess}
                </div>
              )}

              {/* VIEW 1: REQUIRES OTP VERIFICATION */}
              {requiresVerification ? (
                <div className="space-y-4 animate-fade-in" id="otp-verification-section">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">Verify Your Identity</h3>
                    <p className="text-xs text-slate-500">
                      We sent a 6-digit confirmation key to <strong className="text-slate-700">{verificationEmail}</strong>. Please enter it below.
                    </p>
                  </div>

                  {simulatedOtp && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 space-y-1" id="simulated-otp-box">
                      <span className="font-bold flex items-center text-[10px] uppercase tracking-wider text-amber-900">📧 Simulated Email Sandbox</span>
                      <p>OTP Verification Code: <strong className="text-sm text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-200 tracking-wider font-mono">{simulatedOtp}</strong></p>
                      <p className="text-[9px] text-amber-600">This sandbox panel mocks a physical email server to enable immediate registration validation in the preview frame.</p>
                    </div>
                  )}

                  <form onSubmit={handleVerificationSubmit} className="space-y-3" id="otp-verification-form">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">6-Digit Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCodeInput}
                        onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full text-center tracking-widest text-lg font-bold rounded-xl border border-slate-200 py-2 focus:border-slate-400 focus:outline-none bg-slate-50 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-semibold text-xs py-2 shadow-sm transition"
                      id="btn-verify-otp-submit"
                    >
                      {authLoading ? 'Activating Profile...' : 'Complete Registration & Login'}
                    </button>
                  </form>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setRequiresVerification(false);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Return to Authentication Gate
                    </button>
                  </div>
                </div>
              ) : forgotPasswordMode ? (
                /* VIEW 2: FORGOT / RESET PASSWORD MODE */
                <div className="space-y-4 animate-fade-in" id="forgot-password-section">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">
                      {resetStep === 'request' ? 'Forgot Password?' : 'Establish New Password'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {resetStep === 'request' 
                        ? 'Submit your email and we will send you a simulated OTP to authorize a credential reset.'
                        : 'Confirm your identity with the OTP code and enter your new password.'
                      }
                    </p>
                  </div>

                  {resetStep === 'request' ? (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-3" id="forgot-password-request-form">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Your Registered Email</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Mail className="h-4 w-4" />
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-semibold text-xs py-2 shadow-sm transition"
                        id="btn-forgot-request-submit"
                      >
                        {authLoading ? 'Requesting Code...' : 'Request Reset OTP'}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {resetOtp && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-800 space-y-1" id="simulated-reset-otp-box">
                          <span className="font-bold flex items-center text-[10px] uppercase tracking-wider text-amber-900">📧 Simulated Email Sandbox</span>
                          <p>Reset OTP Code: <strong className="text-sm text-amber-950 bg-white px-2 py-0.5 rounded border border-amber-200 tracking-wider font-mono">{resetOtp}</strong></p>
                        </div>
                      )}

                      <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5" id="forgot-password-reset-form">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reset OTP Code</label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={otpCodeInput}
                            onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="6-digit reset code"
                            className="w-full rounded-xl border border-slate-200 py-1.5 text-xs text-center font-bold tracking-widest focus:border-slate-400 focus:outline-none bg-slate-50 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter new strong password"
                              className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-1.5 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter new password to match"
                              className="w-full rounded-xl border border-slate-200 pl-4 pr-10 py-1.5 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-semibold text-xs py-2 shadow-sm transition"
                          id="btn-reset-password-submit"
                        >
                          {authLoading ? 'Updating credentials...' : 'Reset & Verify Account'}
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordMode(false);
                        setResetStep('request');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Return to Authentication Gate
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW 3: STANDARD LOGIN / REGISTER GATE */
                <div className="space-y-4 animate-fade-in" id="standard-credentials-section">
                  
                  {/* Form role tabs */}
                  <div className="space-y-1.5" id="auth-role-tabs">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {isSignUp ? 'Target Career Discipline' : 'Account Discipline Access'}
                    </label>
                    <div className={`grid gap-1 rounded-xl bg-slate-100 p-1 ${isSignUp ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {[
                        { id: 'student', label: 'Student' },
                        { id: 'counselor', label: 'Counselor' },
                        ...(!isSignUp ? [{ id: 'admin', label: 'Admin' }] : [])
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => {
                            setAuthRole(r.id as any);
                            if (isSignUp) {
                              if (r.id === 'student') {
                                setEmail('student@careerai.pro');
                              } else if (r.id === 'counselor') {
                                setEmail('counselor@careerai.pro');
                              } else {
                                setEmail('admin@careerai.pro');
                              }
                            } else {
                              setEmail('');
                              setPassword('');
                            }
                          }}
                          className={`rounded-lg py-1 text-center text-[11px] font-bold transition-all ${
                            authRole === r.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                          }`}
                          id={`btn-select-auth-role-${r.id}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Form layout */}
                  <form onSubmit={handleAuthSubmit} className="space-y-3.5" id="credentials-form">
                    
                    {isSignUp && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <LogIn className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your first and last name"
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-1.5 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Mail className="h-4 w-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-1.5 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-1.5 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {isSignUp && (
                      <div className="space-y-1 animate-fade-in">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <Lock className="h-4 w-4" />
                          </span>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password to match"
                            className="w-full rounded-xl border border-slate-200 pl-10 pr-10 py-1.5 text-xs font-semibold focus:border-slate-400 focus:outline-none bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>

                        {/* Password rules indicator */}
                        <div className="text-[9px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2 mt-1.5 space-y-0.5">
                          <p className="font-bold uppercase tracking-wider text-slate-400">Account Security Rules:</p>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-500 font-medium">
                            <li className={password.length >= 6 ? 'text-emerald-600' : ''}>At least 6 characters in length</li>
                            <li className={/[a-zA-Z]/.test(password) && /[0-9]/.test(password) ? 'text-emerald-600' : ''}>Must contain both letters and digits</li>
                            <li className={confirmPassword && password === confirmPassword ? 'text-emerald-600' : ''}>Passwords match exactly</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {!isSignUp && (
                      <div className="flex justify-end text-[10px] py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setForgotPasswordMode(true);
                            setResetStep('request');
                            setAuthError('');
                            setAuthSuccess('');
                          }}
                          className="font-bold text-slate-500 hover:text-blue-600"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full flex items-center justify-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white font-semibold text-xs py-2 shadow-sm transition"
                      id="btn-auth-submit"
                    >
                      {authLoading ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                          <span>Please wait...</span>
                        </>
                      ) : (
                        <span>{isSignUp ? 'Register My Free Account' : 'Authenticate Session'}</span>
                      )}
                    </button>
                  </form>

                  {/* Toggle login vs signup */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const targetSignUp = !isSignUp;
                        setIsSignUp(targetSignUp);
                        setAuthError('');
                        setAuthSuccess('');
                        setConfirmPassword('');
                        if (!targetSignUp) {
                          setEmail('');
                          setPassword('');
                          setName('');
                          if (authRole === 'admin') setAuthRole('student');
                        }
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                      id="btn-toggle-signup-login"
                    >
                      {isSignUp ? 'Already registered? Authenticate here' : 'Need a student account? Sign up here'}
                    </button>
                  </div>

                  {/* Quick Demo logins banner - only open/shown while user registers */}
                  {isSignUp && (
                    <div className="border-t border-slate-100 pt-3.5 space-y-2 animate-fade-in" id="quick-demo-logins">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">Sandbox Convenience profiles</p>
                      <div className="grid grid-cols-1 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            handleSwitchUserByEmail('student@careerai.pro');
                            setShowAuthModal(false);
                          }}
                          className="w-full rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-600 flex justify-between items-center transition"
                        >
                          <span>Student: Alex Rivera</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 rounded px-1.5 font-bold uppercase">Student</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleSwitchUserByEmail('counselor@careerai.pro');
                            setShowAuthModal(false);
                          }}
                          className="w-full rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-600 flex justify-between items-center transition"
                        >
                          <span>Counselor: Dr. Evelyn Carter</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 rounded px-1.5 font-bold uppercase">Counselor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleSwitchUserByEmail('admin@careerai.pro');
                            setShowAuthModal(false);
                          }}
                          className="w-full rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-left text-[11px] font-semibold text-slate-600 flex justify-between items-center transition"
                        >
                          <span>Administrator Panel</span>
                          <span className="text-[9px] bg-slate-900 text-white rounded px-1.5 font-bold uppercase">Admin</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>
          </div>
        )}
        
        {/* Global Confetti Success Overlay */}
        {showRegConfetti && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999] flex justify-around" id="global-confetti-overlay-guest">
            {Array.from({ length: 45 }).map((_, idx) => {
              const delay = `${(idx * 0.04).toFixed(2)}s`;
              const colors = [
                'bg-pink-500', 'bg-blue-500', 'bg-emerald-400', 
                'bg-amber-400', 'bg-indigo-500', 'bg-rose-500', 
                'bg-violet-500', 'bg-sky-400', 'bg-teal-400'
              ];
              const colorClass = colors[idx % colors.length];
              const size = idx % 2 === 0 ? 'w-3 h-3 rounded-full' : 'w-2.5 h-1.5 rounded-sm';
              const leftPercent = `${(idx / 45) * 100}%`;
              const topPercent = `${(idx % 6) * 14 + 5}%`;
              
              return (
                <div
                  key={idx}
                  className={`absolute animate-confetti ${colorClass} ${size}`}
                  style={{
                    left: leftPercent,
                    top: topPercent,
                    animationDelay: delay,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F1F5F9] dark:bg-slate-950 font-sans text-[#0F172A] dark:text-slate-100 transition-colors duration-300 overflow-hidden" id="app-canvas">
      
      {/* Sidebar block */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
      />

      {/* Main Container block */}
      <div className="flex-1 flex flex-col overflow-hidden" id="main-content-layout">
        
        {/* Navbar */}
        <Navbar
          currentUser={currentUser}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUserByEmail}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onToggleSidebarMobile={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Dynamic Inner views with scroll control */}
        <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950" id="dynamic-content-box">
          {renderActiveTabView()}
        </main>

      </div>

      {/* Global Confetti Success Overlay */}
      {showRegConfetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999] flex justify-around" id="global-confetti-overlay-auth">
          {Array.from({ length: 45 }).map((_, idx) => {
            const delay = `${(idx * 0.04).toFixed(2)}s`;
            const colors = [
              'bg-pink-500', 'bg-blue-500', 'bg-emerald-400', 
              'bg-amber-400', 'bg-indigo-500', 'bg-rose-500', 
              'bg-violet-500', 'bg-sky-400', 'bg-teal-400'
            ];
            const colorClass = colors[idx % colors.length];
            const size = idx % 2 === 0 ? 'w-3 h-3 rounded-full' : 'w-2.5 h-1.5 rounded-sm';
            const leftPercent = `${(idx / 45) * 100}%`;
            const topPercent = `${(idx % 6) * 14 + 5}%`;
            
            return (
              <div
                key={idx}
                className={`absolute animate-confetti ${colorClass} ${size}`}
                style={{
                  left: leftPercent,
                  top: topPercent,
                  animationDelay: delay,
                }}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}
