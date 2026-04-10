import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";

import http from "http";
import { Server } from "socket.io";
import { handleSyncUsuarios } from "./controllers/usuariosController.js";
import { handleSyncProgreso } from "./controllers/progresoController.js";

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

    // Usuarios 
    if (entidad === "usuarios" && accion === "CREAR") {
      return await handleSyncUsuarios(req, res, db, io);
    }

    // Progreso de usuarios
    if (entidad === "progreso_usuarios" && accion === "UPSERT") {
      return await handleSyncProgreso(req, res, db);
    }

    res.status(400).json({ success: false, message: "Entidad o acción no soportada" });

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

    const cambiosRaw = await db.Usuario.findAll({
      where: {
        [Op.or]: [
          { updated_at: { [Op.gt]: lastSyncDate } },
          { deleted_at: { [Op.gt]: lastSyncDate } }
        ]
      },
      paranoid: false
    });

    const usuarios = cambiosRaw.map(user => {
      const data = user.toJSON();

      if (!data.local_id) {
        data.local_id = `legacy-${data.id}`;
      }
      return data;
    });

    const nivelesRaw = await db.Nivel.findAll({
      where: { updated_at: { [Op.gt]: lastSyncDate } }
    });

    const niveles = nivelesRaw.map(n => n.toJSON());

    // Progreso filtrado por usuario para no exponer datos de otros jugadores.
    // Si no se envía usuario_local_id, devolver array vacío por seguridad.
    let progreso_usuarios = [];

    if (usuario_local_id) {
      const progresosRaw = await db.ProgresoUsuario.findAll({
        where: {
          usuario_local_id,
          updated_at: { [Op.gt]: lastSyncDate }
        }
      });
      progreso_usuarios = progresosRaw.map(p => p.toJSON());
    }

    res.json({
      success: true,
      cambios: { usuarios, niveles, progreso_usuarios },
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
