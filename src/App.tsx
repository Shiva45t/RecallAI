import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';

// Import Pages
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Decks } from './pages/Decks';
import { DeckDetail } from './pages/DeckDetail';
import { Generate } from './pages/Generate';
import { Study } from './pages/Study';
import { SessionSummary } from './pages/SessionSummary';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Marketing */}
        <Route path="/" element={<Landing />} />
        
        {/* Public Authentication Panel */}
        <Route path="/auth" element={<Auth />} />

        {/* Secured Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppShell>
                <Dashboard />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <AppShell>
                <Decks />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/decks/:id"
          element={
            <ProtectedRoute>
              <AppShell>
                <DeckDetail />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={
            <ProtectedRoute>
              <AppShell>
                <Generate />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/:deckId"
          element={
            <ProtectedRoute>
              <AppShell>
                <Study />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study/:deckId/summary"
          element={
            <ProtectedRoute>
              <AppShell>
                <SessionSummary />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AppShell>
                <Analytics />
              </AppShell>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <AppShell>
                <Settings />
              </AppShell>
            </ProtectedRoute>
          }
        />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
