import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import RealTimeUpdates from './components/RealTimeUpdates';

// Lazy load pages for modular bundling
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Settings from './pages/Settings';
import Metrics from './pages/Metrics';
import Widget from './pages/Widget';
import ComplianceDashboard from './pages/ComplianceDashboard';

// Route protection wrapper
const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="relative w-12 h-12">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// Layout wrapper including top navbar
const DashboardLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
        <Outlet />
      </main>
      <RealTimeUpdates />
    </div>
  );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Embeddable Iframe Widget (No Navbar, Anonymous accessibility) */}
            <Route path="/widget" element={<Widget />} />

            {/* Protected Management Dashboard Area */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/metrics" element={<Metrics />} />
                <Route path="/compliance" element={<ComplianceDashboard />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/tickets/:id" element={<TicketDetail />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
