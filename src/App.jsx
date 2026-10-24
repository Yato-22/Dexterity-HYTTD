import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import ArenaScreen from './pages/ArenaScreen';
import CodingScreen from './pages/CodingScreen';

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <Routes>
          <Route path="/" element={<ArenaScreen />} />
          <Route path="/problem/:id" element={<CodingScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GameProvider>
    </BrowserRouter>
  );
}
