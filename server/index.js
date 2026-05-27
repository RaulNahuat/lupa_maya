import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";
import path from "path";

import http from "http";
import { Server } from "socket.io";
import { handleSyncUsuarios } from "./controllers/pushController/UsuariosPushController.js";
import { handleSyncProgreso } from "./controllers/pushController/progresoPushController.js";
import { handleSyncAdmins } from "./controllers/pushController/adminsPushController.js";
import { getUsuariosPull } from "./controllers/pullController/usuariosPullController.js";
import { getAdminsPull } from "./controllers/pullController/adminsPullController.js";
import { getNivelesPull } from "./controllers/pullController/nivelesPullController.js";
import { getProgresoPull } from "./controllers/pullController/progresoPullController.js";
import { getPreguntasPull } from "./controllers/pullController/preguntasPullController.js";
import { getGlifosPull } from "./controllers/pullController/glifosPullController.js";
import { getGlifosObjetivoPull } from "./controllers/pullController/glifosObjetivoPullController.js";
import { getInsigniasPull } from "./controllers/pullController/insigniasPullController.js";
import { getAllUsuarios, updateUsuario, deleteUsuario } from "./controllers/admin/AdminUsuariosController.js";
import { createAiModel, uploadAiModelFiles } from "./controllers/admin/AiModelsController.js";
import { getActiveAiModel } from "./controllers/pullController/aiModelsPullController.js";

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
app.use('/models', express.static(path.join(process.cwd(), 'public', 'models')));


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
      case "usuarios:EDITAR":
        req.params.id = req.body.datos.id;
        return await updateUsuario(req, res, db, io);
      case "usuarios:ELIMINAR":
        req.params.id = req.body.datos.id;
        return await deleteUsuario(req, res, db, io);
      case "progreso_usuarios:UPSERT":
        return await handleSyncProgreso(req, res, db, io);
      case "admins:EDITAR":
        return await handleSyncAdmins(req, res, db, io);
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
    const glifos = await getGlifosPull(db, Op, lastSyncDate);
    const { preguntas, opciones_respuestas } = await getPreguntasPull(db, Op, lastSyncDate);
    const nivel_glifos_objetivos = await getGlifosObjetivoPull(db);
    const progreso_usuarios = await getProgresoPull(db, Op, lastSyncDate, usuario_local_id);
    const insignias = await getInsigniasPull(db);

    res.json({
      success: true,
      cambios: { 
        usuarios,
        admins,
        niveles, 
        glifos,
        preguntas, 
        opciones_respuestas, 
        nivel_glifos_objetivos,
        progreso_usuarios,
        insignias
      },
      serverTime: new Date().getTime()
    });

  } catch (error) {
    console.error("Error en Pull Sync:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI MODELS
app.post("/api/admin/ai-models", uploadAiModelFiles, (req, res) => createAiModel(req, res, db));
app.get("/api/ai-models/active", (req, res) => getActiveAiModel(req, res, db));

// ADMIN ROUTES
app.get("/api/admin/usuarios", (req, res) => getAllUsuarios(req, res, db));
app.put("/api/admin/usuarios/:id", (req, res) => updateUsuario(req, res, db, io));
app.delete("/api/admin/usuarios/:id", (req, res) => deleteUsuario(req, res, db, io));


server.listen(PORT, () => {
  console.log(`Servidor y Sockets corriendo en el puerto ${PORT}`);
});
