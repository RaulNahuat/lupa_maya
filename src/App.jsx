import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import LevelMap from "./pages/player/LevelMap";
import LevelPlay from "./pages/player/LevelPlay";
import Rewards from "./pages/player/Rewards";
import AdminGlyphsPage from './pages/admin/AdminGlyphsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import UserRoute from './routes/UserRoute';
import AdminRoute from './routes/AdminRoute';
import './App.css';

function App() {

  return (
    <div className="min-h-screen bg-maya-cream flex flex-col">
      <main className="grow">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ADMIN */}
          <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />
          <Route path="/admin/glyphs" element={<AdminRoute><AdminGlyphsPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />

          {/* PLAYER */}
          <Route path="/map" element={<UserRoute><LevelMap /></UserRoute>} />
          <Route path="/level/:id" element={<UserRoute><LevelPlay /></UserRoute>} />
          <Route path="/rewards" element={<UserRoute><Rewards /></UserRoute>} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
