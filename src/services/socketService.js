import { io } from "socket.io-client";
import { descargarCambios } from "./syncService";
import { API_BASE_URL } from "../config/api";

const SOCKET_URL = API_BASE_URL;

let socket = null;

export const initSocket = () => {
    if (socket) return;

    console.log("Inicializando WebSockets...");
    socket = io(SOCKET_URL, {
        transports: ["websocket"],
    });

    socket.on("connect", () => {
        console.log("Conectado al servidor de WebSockets:", socket.id);
    });

    socket.on("disconnect", (reason) => {
        console.log("Desconectado del servidor de WebSockets:", reason);
    });

    socket.on("connect_error", (error) => {
        console.error("Error de conexión Socket.io:", error.message);
    });

    socket.on("hay_cambios", async () => {
        console.log("El servidor notificó cambios. Descargando cambios del servidor (full pull)...");
        await descargarCambios(null, true);
        window.dispatchEvent(new CustomEvent("sync-completed"));
    });

    return socket;
};

export const getSocket = () => socket;
