
import React, { useState, useEffect } from 'react';
import { HashRouter, MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateSlam from './pages/CreateSlam';
import AnswerSlam from './pages/AnswerSlam';
import ViewAnswers from './pages/ViewAnswers';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';

// Environments served from blob: URLs (like some sandbox previews) 
// often block window.location.assign, which HashRouter uses.
const isBlobEnvironment = window.location.protocol === 'blob:';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-pink-50">
        <div className="text-2xl handwritten text-pink-500 animate-bounce">Opening the Slam Book...</div>
      </div>
    );
  }

  // Determine initial entry for MemoryRouter based on hash if present
  const getInitialEntries = () => {
    const hash = window.location.hash;
    if (hash) {
      // Remove leading '#'
      return [hash.substring(1) || '/'];
    }
    return ['/'];
  };

  const RouterComponent = isBlobEnvironment ? MemoryRouter : HashRouter;
  const routerProps = isBlobEnvironment ? { initialEntries: getInitialEntries() } : {};

  return (
    <RouterComponent {...routerProps}>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/create" element={user ? <CreateSlam user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/answers/:userId" element={user ? <ViewAnswers user={user} /> : <Navigate to="/login" replace />} />
        <Route path="/fill/:userId" element={<AnswerSlam />} />
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </RouterComponent>
  );
};

export default App;
