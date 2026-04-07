import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 transition-colors duration-200">
              <Navbar />
              <main>
                <Routes>
                  <Route 
                    path="/"
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                  }
                  />
                  <Route path="/games/:id" element={<GamePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminPage />
                      </AdminRoute>
                    }
                  />
                  <Route path="*" element={
                    <div className="max-w-5xl mx-auto px-4 py-24 text-center">
                      <h1 className="text-7xl font-display text-zinc-300 dark:text-zinc-700 mb-4">404</h1>
                      <p className="text-zinc-500">Page not found</p>
                      <a href="/" className="btn-primary mt-6 inline-block">Go Home</a>
                    </div>
                  } />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
