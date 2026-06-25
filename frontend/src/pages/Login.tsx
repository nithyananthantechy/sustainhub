import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../context/AuthContext';
import { UserCheck, ShieldAlert, Sparkles, Building2, User } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form fields
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please fill in all credentials.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', {
        email: loginEmail,
        password: loginPassword,
      });

      const { accessToken, refreshToken, user, company } = res.data;
      login(accessToken, refreshToken, user, company);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid credentials or connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !companyEmail || !adminName || !adminEmail || !registerPassword) {
      setError('Please fill in all registration fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/register', {
        companyName,
        companyEmail,
        adminName,
        adminEmail,
        password: registerPassword,
      });

      const { accessToken, refreshToken, user, company } = res.data;
      login(accessToken, refreshToken, user, company);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-900">
      {/* Left Pane - Branding & Intro */}
      <div className="md:w-1/2 flex flex-col justify-between p-8 md:p-16 bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 text-white relative overflow-hidden">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-teal/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        {/* Logo */}
        <div className="flex items-center space-x-3 z-10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xl">
            🌍
          </div>
          <span className="font-outfit font-extrabold text-xl tracking-tight text-white">
            SustainHub
          </span>
        </div>

        {/* Visual Showcase */}
        <div className="my-auto py-12 md:py-0 max-w-md z-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 text-brand-300 mb-6 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-accent-teal" />
            Beta Version Live
          </span>
          <h1 className="font-outfit font-extrabold text-4xl md:text-5xl tracking-tight text-white mb-6 leading-tight">
            Real-time operations meets CSR transparency.
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
            Monitor sustainability goals, review operational telemetry metrics, and coordinate customer service tickets in a single cohesive workspace.
          </p>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 z-10 flex items-center">
          <span>&copy; {new Date().getFullYear()} SustainHub MVP. All rights reserved.</span>
        </div>
      </div>

      {/* Right Pane - Form Card */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-premium hover:shadow-premium-hover transition-all duration-300">
          {/* Header */}
          <div className="mb-6">
            <h2 className="font-outfit font-extrabold text-2xl text-slate-800 tracking-tight">
              {isRegister ? 'Register Company' : 'Welcome Back'}
            </h2>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              {isRegister 
                ? 'Create a corporate profile and setup company admin credentials.' 
                : 'Enter your credentials to log in to the management dashboard.'}
            </p>
          </div>

          {/* Form Errors */}
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-accent-rose flex items-start space-x-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {isRegister ? (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Company Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp"
                  className="input-premium"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Company Email
                </label>
                <input
                  type="email"
                  placeholder="contact@company.com"
                  className="input-premium"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Admin Credentials
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="input-premium mb-3"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="email"
                  placeholder="admin@company.com"
                  className="input-premium mb-3"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  disabled={loading}
                />
                <input
                  type="password"
                  placeholder="Password (min 6 chars)"
                  className="input-premium"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-brand-700 hover:bg-brand-850 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 mt-2 flex items-center justify-center disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating Company...' : 'Register and Setup'}
              </button>
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="input-premium"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-premium"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-brand-700 hover:bg-brand-850 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-200 mt-2 flex items-center justify-center disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Toggle Button */}
          <div className="text-center mt-6 pt-6 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium mr-1.5">
              {isRegister ? 'Already have an account?' : 'Need a workspace for your company?'}
            </span>
            <button
              onClick={toggleMode}
              className="text-brand-600 font-bold hover:underline"
              disabled={loading}
            >
              {isRegister ? 'Sign In Instead' : 'Register Corporate Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
