import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserRoute({ children }) {
  const { currentUser, loading } = useAuth();

  // Mientras lee de localStorage, no mandamos a rutas vacías
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // Si no hay usuario, mandarlo al login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario es un administrador, no debería entrar a las rutas de niño
  const esAdmin = currentUser && (currentUser.rol === 'ADMIN' || currentUser.email);
  if (esAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Si hay usuario, renderizar el componente protegido
  return children;
}
