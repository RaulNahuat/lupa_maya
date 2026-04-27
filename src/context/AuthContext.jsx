import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../data/db";
import { procesarColaSincronizacion } from "../services/syncService";
import { useGameStore } from "../store/game/useGameStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const initLevels = useGameStore(s => s.initLevels);

    useEffect(() => {
        const initSession = async () => {
            const storedUserStr = localStorage.getItem("lupa_session");
            if (storedUserStr) {
                const storedUser = JSON.parse(storedUserStr);
                
                let userExists = await db.usuarios.where('local_id').equals(storedUser.local_id).first();
                
                if (!userExists) {
                    userExists = await db.admins.where('local_id').equals(storedUser.local_id).first();
                }
                
                if (userExists) {
                    setCurrentUser(userExists);

                    if (navigator.onLine) {
                        await procesarColaSincronizacion(userExists.local_id);
                        initLevels(userExists);
                    } else {
                        initLevels(userExists);
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
    }, [initLevels]);

    useEffect(() => {
        if (!currentUser) return;

        const handleOnline = async () => {
            console.log("Conexion restaurada. Sincronizando para el usuario actual...");
            await procesarColaSincronizacion(currentUser.local_id);
            initLevels(currentUser);
        };

        window.addEventListener('online', handleOnline);

        return () => window.removeEventListener('online', handleOnline);
    }, [currentUser, initLevels]);

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
