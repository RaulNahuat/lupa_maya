import { Routes, Route, Navigate } from "react-router-dom"
import LevelMap from "./pages/player/LevelMap"
import LevelPlay from "./pages/player/LevelPlay"
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <Routes> 
      <Route path="/" element={<Navigate to="/map" replace/>} />
      <Route path="/map" element={<LevelMap />} />
      <Route path="/level/:id" element={<LevelPlay />} />
    </Routes>
  )
    <Router>
      <div className="min-h-screen bg-maya-cream flex flex-col">
        <Navbar isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} />
        <main className="grow">
          <Routes>
            <Route path="/login" element={<Login isAdminMode={isAdminMode} />} />
            <Route path="/register" element={<Register isAdminMode={isAdminMode} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
