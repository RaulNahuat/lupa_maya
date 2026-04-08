import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import './App.css';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-maya-cream flex flex-col">
        <Navbar isAdminMode={isAdminMode} setIsAdminMode={setIsAdminMode} />
        <main className="grow">
          <Routes>
            <Route path="/login" element={<Login isAdminMode={isAdminMode} />} />
            <Route path="/register" element={<Register isAdminMode={isAdminMode} />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
