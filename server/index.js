import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";

import http from "http";
import { Server } from "socket.io";

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
  const { entidad, accion, datos } = req.body;

  try {

    // Usuarios 
    if (entidad === "usuarios" && accion === "CREAR") {

      const existente = await db.Usuario.findOne({
        where: { local_id: datos.local_id }
      });

      // Si ya existe, devolver el registro con su ID real para que el cliente
      // pueda propagar el usuario_id a los registros de progreso pendientes.
      if (existente) {
        return res.status(200).json({
          success: true,
          message: "Ya existe",
          data: existente.toJSON()
        });
      }

      const nuevo = await db.Usuario.create({
        nombre: datos.nombre,
        apellido: datos.apellido || "Pendiente",
        email: datos.email || null,
        pin_hash: datos.pin_hash || datos.pin || null,
        password_hash: datos.password_hash || datos.password || null,
        rol: datos.rol || "NINO",
        local_id: datos.local_id
      });

      io.emit("hay_cambios");

      return res.status(201).json({ success: true, data: nuevo });
    }

    // Progreso de usuarios
    if (entidad === "progreso_usuarios" && accion === "UPSERT") {

      // Buscar por local_id primero para manejar casos donde el cliente aún no tiene un usuario_id asignado por el servidor.
      let existente = null;

      if (datos.local_id) {
        existente = await db.ProgresoUsuario.findOne({
          where: { local_id: datos.local_id }
        });
      }

      if (!existente && datos.usuario_id) {
        existente = await db.ProgresoUsuario.findOne({
          where: {
            usuario_id: datos.usuario_id,
            nivel_id: datos.nivel_id
          }
        });
      }

      if (existente) {
        await existente.update({
          completado: datos.completado,
          estrellas: datos.estrellas,
          intentos: datos.intentos,
          ultimo_intento: datos.ultimo_intento,
          updated_at: new Date()
        });

        return res.json({ success: true, data: existente.toJSON() });
      }

      const nuevo = await db.ProgresoUsuario.create({
        local_id: datos.local_id,
        usuario_id: datos.usuario_id || null,
        usuario_local_id: datos.usuario_local_id || null,
        nivel_id: datos.nivel_id,
        completado: datos.completado,
        estrellas: datos.estrellas,
        intentos: datos.intentos,
        ultimo_intento: datos.ultimo_intento
      });

      return res.json({ success: true, data: nuevo.toJSON() });
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
