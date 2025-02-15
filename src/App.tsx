import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserProfile from './user-profile-page';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Mechanism Sharing App
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                プロフィール
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Mechanism Sharing App
              </h1>
            </div>
          } />
          <Route path="/profile" element={<UserProfile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
