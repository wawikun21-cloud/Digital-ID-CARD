import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { ToastProvider } from './shared/components/ToastProvider';
import AuthenticatedLayout from './shared/components/AuthenticatedLayout';
import DigitalIdPage from './features/digital-id/pages/DigitalIdPage';
import DigitalIdViewPage from './features/digital-id/pages/DigitalIdViewPage';
import LoginPage from './features/auth/pages/LoginPage';
import AdminDashboard from './features/auth/pages/AdminDashboard';

function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-cream">
        <p className="text-sm text-ink-soft">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DigitalIdPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/verify/:id" element={<DigitalIdViewPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}