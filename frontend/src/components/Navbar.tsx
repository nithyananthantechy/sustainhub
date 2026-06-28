import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LayoutDashboard, BarChart3, Ticket, Settings, LogOut, Menu, X, ShieldAlert, Activity, Recycle, TrendingUp, Flame, Building, Briefcase, FileText } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, company, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/metrics', label: 'CSR Metrics', icon: BarChart3 },
    { to: '/compliance', label: 'Compliance', icon: ShieldAlert },
    { to: '/risk-engine', label: 'Risk Engine', icon: Activity },
    { to: '/waste-heat', label: 'Waste Heat', icon: Flame },
    { to: '/municipal', label: 'Municipal View', icon: Building },
    { to: '/investor', label: 'Investor ESG', icon: Briefcase },
    { to: '/reports', label: 'AI Reports', icon: FileText },
    { to: '/circular-economy', label: 'Circular Economy', icon: Recycle },
    { to: '/economic-impact', label: 'Economic Impact', icon: TrendingUp },
    { to: '/tickets', label: 'Tickets', icon: Ticket },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Company info */}
          <div className="flex items-center flex-1 min-w-0 pr-4">
            <Link to="/" className="flex items-center space-x-3 group shrink-0">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
              ) : (
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-800 text-white font-bold text-lg shadow-md group-hover:scale-105 transition-transform duration-200">
                  🌍
                </div>
              )}
              <div className="flex flex-col">
                <span className="font-outfit font-bold text-slate-800 tracking-tight text-md leading-tight">
                  {company?.name || 'SustainHub'}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase leading-none">
                  Operations Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex ml-10 space-x-1 overflow-x-auto no-scrollbar flex-1 items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <style>{`
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-slate-100 text-brand-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <link.icon className="w-4 h-4 mr-2" />
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* User actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* WebSocket connection status indicator */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1.5 rounded-full border border-slate-100">
              <span className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-accent-emerald animate-pulse' : 'bg-accent-rose'}`}></span>
              <span className="text-[10px] text-slate-500 font-medium">{isConnected ? 'Live' : 'Offline'}</span>
            </div>

            {/* User Profile Info */}
            {user && (
              <div className="flex items-center space-x-3 border-l border-slate-100 pl-4">
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-700">{user.name}</div>
                  <span className={`inline-block px-2 py-0.5 mt-0.5 text-[10px] font-bold uppercase rounded-md border tracking-wider ${getRoleBadge(user.role)}`}>
                    {user.role}
                  </span>
                </div>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-accent-rose hover:bg-rose-50 rounded-xl transition-all duration-200"
                  title="Logout Session"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-2 px-4 shadow-lg animate-slideDown">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                    isActive ? 'bg-slate-100 text-brand-900' : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <link.icon className="w-5 h-5 mr-3" />
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Session Meta */}
          {user && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center px-4 py-2 bg-rose-50 text-accent-rose border border-rose-100 rounded-xl text-sm font-semibold hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
