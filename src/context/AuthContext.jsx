import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../data/db";
import { procesarColaSincronizacion } from "../services/syncService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initSession = async () => {
            const storedUserStr = localStorage.getItem("lupa_session");
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                
                // Verificar si el usuario aún existe en la base de datos local
                const userExists = await db.usuarios.where('local_id').equals(storedUser.local_id).first();
                
                if (userExists) {
                    setCurrentUser(userExists);
                    
                    // Al restaurar sesión exitosamente, jalar cambios 
                    // e impulsar cola pendiente
                    if (navigator.onLine) {
                        procesarColaSincronizacion(userExists.local_id);
                    }
                } else {
                    // Si fue eliminado de la DB, limpiar la sesión
                    localStorage.removeItem('lupa_session');
                    setCurrentUser(null);
                }
            }
            setLoading(false);
        };

        initSession();
    }, []);

    // Listener para restauración de red acoplado a la sesión actual
    useEffect(() => {
        if (!currentUser) return;

        const handleOnline = () => {
            console.log("Conexion restaurada. Sincronizando para el usuario actual...");
            procesarColaSincronizacion(currentUser.local_id);
        };

        window.addEventListener('online', handleOnline);

        return () => window.removeEventListener('online', handleOnline);
    }, [currentUser]);

    const loginUser = (user) => {
        const userWithId = {...user, local_id: user.local_id || Date.now() };
        setCurrentUser(userWithId);
        localStorage.setItem('lupa_session', JSON.stringify(userWithId));
    };

    const logoutUser = () => {
        setCurrentUser(null);
        localStorage.removeItem('lupa_session');
    };

    return (
        <AuthContext.Provider value={{ currentUser, loginUser, logoutUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);