import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import SkipToContent from './components/SkipToContent';
import ThemeSettingsSync from './components/ThemeSettingsSync';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const SoloChat = lazy(() => import('./pages/SoloChat'));
const GroupChat = lazy(() => import('./pages/GroupChat'));
const Profile = lazy(() => import('./pages/Profile'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Settings = lazy(() => import('./pages/Settings'));
const ExportChat = lazy(() => import('./pages/ExportChat'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const MemoryCenter = lazy(() => import('./pages/MemoryCenter'));
const Projects = lazy(() => import('./pages/Projects'));
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const Rooms = lazy(() => import('./pages/Rooms'));

function AppShellLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center animate-pulse-glow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
          </svg>
        </div>
        <p className="text-sm text-gray-400 animate-pulse">Loading ChatSphere…</p>
      </div>
    </div>
  );
}

/**
 * Wraps a page element in an ErrorBoundary so a single page crash
 * doesn't take down the entire application. Each route gets its own
 * boundary — if Dashboard crashes, SoloChat still works.
 */
function RouteBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
      <ThemeProvider>
        <Router>
          <ThemeSettingsSync />
          <SkipToContent />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1A1D2E',
                color: '#e2e8f0',
                border: '1px solid #2E3354',
                borderRadius: '12px',
              },
              success: {
                iconTheme: { primary: '#A855F7', secondary: '#1A1D2E' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#1A1D2E' },
              },
            }}
          />

          <Suspense fallback={<AppShellLoader />}>
            <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/google/callback" element={<GoogleCallback />} />

            {/* Protected routes — each wrapped in RouteBoundary for fault isolation */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><RouteBoundary><Dashboard /></RouteBoundary></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><RouteBoundary><SoloChat /></RouteBoundary></ProtectedRoute>} />
            <Route path="/rooms" element={<ProtectedRoute><RouteBoundary><Rooms /></RouteBoundary></ProtectedRoute>} />
            <Route path="/group/:roomId" element={<ProtectedRoute><RouteBoundary><GroupChat /></RouteBoundary></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><RouteBoundary><Projects /></RouteBoundary></ProtectedRoute>} />
            <Route path="/memory" element={<ProtectedRoute><RouteBoundary><MemoryCenter /></RouteBoundary></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><RouteBoundary><Profile /></RouteBoundary></ProtectedRoute>} />
            <Route path="/search" element={<ProtectedRoute><RouteBoundary><SearchPage /></RouteBoundary></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><RouteBoundary><Settings /></RouteBoundary></ProtectedRoute>} />
            <Route path="/export" element={<ProtectedRoute><RouteBoundary><ExportChat /></RouteBoundary></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireAdmin><RouteBoundary><AdminDashboard /></RouteBoundary></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
