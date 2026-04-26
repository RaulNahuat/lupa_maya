import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";

import http from "http";
import { Server } from "socket.io";
import { handleSyncUsuarios } from "./controllers/pushController/UsuariosPushController.js";
import { handleSyncProgreso } from "./controllers/pushController/progresoPushController.js";
import { getUsuariosPull } from "./controllers/pullController/usuariosPullController.js";
import { getAdminsPull } from "./controllers/pullController/adminsPullController.js";
import { getNivelesPull } from "./controllers/pullController/nivelesPullController.js";
import { getProgresoPull } from "./controllers/pullController/progresoPullController.js";
import { getPreguntasPull } from "./controllers/pullController/preguntasPullController.js";
import { getGlifosObjetivoPull } from "./controllers/pullController/glifosObjetivoPullController.js";

dotenv.config();

const require = createRequire(import.meta.url);
const db = require("./models/index.cjs");
const { Op } = require("sequelize");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


db.sequelize.authenticate()
  .then(() => {
    console.log("Conexion exitosa a la base de datos");
    return db.sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log("Base de datos sincronizada.");
  })
  .catch((error) => console.error("Error al conectar o sincronizar:", error));


app.get("/", (req, res) => {
  res.send("API de Lupa Maya funcionando");
});


// PUSH SYNC
app.post("/api/sync", async (req, res) => {
  const { entidad, accion } = req.body;

  try {
    switch (`${entidad}:${accion}`) {
      case "usuarios:CREAR":
        return await handleSyncUsuarios(req, res, db, io);
      case "progreso_usuarios:UPSERT":
        return await handleSyncProgreso(req, res, db, io);
      default:
        return res.status(400).json({ success: false, message: "Entidad o acción no soportada" });
    }

  } catch (error) {
    console.error("Error en sincronización:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PULL SYNC
// Devuelve los cambios del servidor desde la última sincronización del cliente.
// Requiere usuario_local_id para filtrar el progreso solo del usuario que pide.
app.get("/api/sync/pull", async (req, res) => {
  const { lastSync, usuario_local_id } = req.query;
  const lastSyncDate = lastSync && lastSync !== 'null'
    ? new Date(parseInt(lastSync))
    : new Date(0);

  try {

    const usuarios = await getUsuariosPull(db, Op, lastSyncDate);
    const admins = await getAdminsPull(db, Op, lastSyncDate);
    const niveles = await getNivelesPull(db, Op, lastSyncDate);
    const { preguntas, opciones_respuestas } = await getPreguntasPull(db, Op, lastSyncDate);
    const nivel_glifos_objetivos = await getGlifosObjetivoPull(db);
    const progreso_usuarios = await getProgresoPull(db, Op, lastSyncDate, usuario_local_id);

    res.json({
      success: true,
      cambios: { 
        usuarios,
        admins,
        niveles, 
        preguntas, 
        opciones_respuestas, 
        nivel_glifos_objetivos, 
        progreso_usuarios 
      },
      serverTime: new Date().getTime()
    });

  } catch (error) {
    console.error("Error en Pull Sync:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Servidor y Sockets corriendo en el puerto ${PORT}`);
});
