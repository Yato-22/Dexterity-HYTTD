import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import ArenaScreen from './pages/ArenaScreen';
import CodingScreen from './pages/CodingScreen';
import LoginScreen from './pages/LoginScreen';
import AdminScreen from './pages/AdminScreen';
import DisplayScreen from './pages/DisplayScreen';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useGame();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ArenaScreen />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="/display" element={<DisplayScreen />} />
          <Route
            path="/problem/:id"
            element={
              <ProtectedRoute>
                <CodingScreen />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
}
