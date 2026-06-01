import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DocenteRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const esDocente = currentUser && Number(currentUser.rol_id) === 3;

  if (!esDocente) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
