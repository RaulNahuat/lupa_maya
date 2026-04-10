import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import LevelMap from "./pages/player/LevelMap";
import LevelPlay from "./pages/player/LevelPlay";
import AdminGlyphsPage from './pages/admin/AdminGlyphsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import './App.css';

function App() {

  return (
    <div className="min-h-screen bg-maya-cream flex flex-col">
      <main className="grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* PLAYER */}
          <Route path="/map" element={<LevelMap />} />
          <Route path="/level/:id" element={<LevelPlay />} />
          <Route path="/admin/glyphs" element={<AdminGlyphsPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
