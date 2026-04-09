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
// Socket.io initialization
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
    console.log("Base de datos sincronizada: Se han aplicado los modelos a las tablas.");
  })
  .catch((error) => console.error("Error al conectar o sincronizar:", error));


app.get("/", (req, res) => {
  res.send("API de Lupa Maya funcionando");
});


// Endpoint para la sincronización offline
app.post("/api/sync", async (req, res) => {
  const { entidad, accion, datos } = req.body;

  try {
    if (entidad === "usuarios" && accion === "CREAR") {
      // Valida si ya existe por local_id o email para evitar duplicados
      const existente = await db.Usuario.findOne({ 
        where: { local_id: datos.local_id } 
      });

      if (existente) {
        return res.status(200).json({ success: true, message: "Ya existe", data: existente });
      }

      //crea el usuario en MySQL
      const nuevo = await db.Usuario.create({
        nombre: datos.nombre,
        apellido: datos.apellido || "Pendiente",
        email: datos.email || null,
        pin_hash: datos.pin_hash || datos.pin,
        password_hash: datos.password_hash || datos.password,
        rol: datos.rol || "NINO",
        local_id: datos.local_id
      });

      // Emitir evento de cambio por WebSockets
      io.emit("hay_cambios");

      return res.status(201).json({ success: true, data: nuevo });
    }

    res.status(400).json({ success: false, message: "Entidad o acción no soportada" });
  } catch (error) {
    console.error("Error en sincronización:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint de sincronización de bajada (un pull sync)
app.get("/api/sync/pull", async (req, res) => {
  const { lastSync } = req.query;
  const lastSyncDate = lastSync && lastSync !== 'null' ? new Date(parseInt(lastSync)) : new Date(0);

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

    const cambios = cambiosRaw.map(user => {
      const data = user.toJSON();
      if (!data.local_id) {
        data.local_id = `legacy-${data.id}`;
      }
      return data;
    });

    res.json({
      success: true,
      cambios,
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
