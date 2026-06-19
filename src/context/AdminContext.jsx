import { createContext, useContext, useState } from 'react';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [loginMode, setLoginMode] = useState('alumno'); // 'alumno', 'docente', 'admin'

  const isAdminMode = loginMode === 'admin';
  const setIsAdminMode = (isAdmin) => setLoginMode(isAdmin ? 'admin' : 'alumno');

  return (
    <AdminContext.Provider value={{ loginMode, setLoginMode, isAdminMode, setIsAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe usarse dentro de un AdminProvider');
  }
  return context;
};
