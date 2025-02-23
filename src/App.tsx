import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import UserProfile from './user-profile-page';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import CreateMechanismPage from './pages/CreateMechanismPage';
import { useAuth } from './contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Mechanism Sharing App
              </Link>
              <div className="flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                      プロフィール
                    </Link>
                    <button
                      onClick={logout}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      ログアウト
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    ログイン
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-mechanism"
            element={
              <ProtectedRoute>
                <CreateMechanismPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
