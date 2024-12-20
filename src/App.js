// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import StatsPage from './pages/StatsPage';
import WorkoutPage from './pages/WorkoutPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/workout" element={<WorkoutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
