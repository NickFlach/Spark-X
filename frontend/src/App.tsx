import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Privacy from './pages/Privacy';
import Landing from './pages/Landing';
import UserManagement from './pages/UserManagement';
import AdvancedAnalytics from './pages/AdvancedAnalytics';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gradient">Spark-X</h1>
          <p className="text-muted-foreground">Loading your secure analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Dashboard routes */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <DashboardLayout>
              <Privacy />
            </DashboardLayout>
          }
        />
        <Route
          path="/users"
          element={
            <DashboardLayout>
              <UserManagement />
            </DashboardLayout>
          }
        />
        <Route
          path="/analytics"
          element={
            <DashboardLayout>
              <AdvancedAnalytics />
            </DashboardLayout>
          }
        />
        <Route
          path="/billing"
          element={
            <DashboardLayout>
              <div className="p-4">Billing Page (Coming Soon)</div>
            </DashboardLayout>
          }
        />
        <Route
          path="/settings"
          element={
            <DashboardLayout>
              <div className="p-4">Settings Page (Coming Soon)</div>
            </DashboardLayout>
          }
        />
        <Route
          path="/help"
          element={
            <DashboardLayout>
              <div className="p-4">Help Page (Coming Soon)</div>
            </DashboardLayout>
          }
        />

        {/* Auth routes */}
        <Route path="/login" element={<div className="p-4">Login Page (Coming Soon)</div>} />
        <Route path="/signup" element={<div className="p-4">Signup Page (Coming Soon)</div>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
