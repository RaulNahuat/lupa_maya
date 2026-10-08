import { io } from "socket.io-client";
import { descargarCambios } from "./syncService";
import { API_BASE_URL } from "../config/api";

const SOCKET_URL = API_BASE_URL;

let socket = null;

export const initSocket = () => {
    if (socket) return;

    socket = io(SOCKET_URL, {
        transports: ["websocket"],
    });

    socket.on("connect_error", (error) => {
        console.error("Error de conexión Socket.io:", error.message);
    });

    socket.on("hay_cambios", async () => {
        await descargarCambios(null, true);
        window.dispatchEvent(new CustomEvent("sync-completed"));
    });

    return socket;
};

export const getSocket = () => socket;
