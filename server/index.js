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
import { handleSyncUsuarioInsignia } from "./controllers/pushController/usuarioInsigniasPushController.js";
import { getUsuarioInsigniasPull } from "./controllers/pullController/usuarioInsigniasPullController.js";
import { createAiModel, uploadAiModelFiles } from "./controllers/admin/AiModelsController.js";
import { getActiveAiModel } from "./controllers/pullController/aiModelsPullController.js";
import { getGruposNivelesPull } from "./controllers/pullController/gruposNivelesPullController.js";
import { handleSyncGruposNiveles } from "./controllers/pushController/gruposNivelesPushController.js";
import { handleSyncGlifos } from "./controllers/pushController/glifosPushController.js";
import { handleSyncNiveles } from "./controllers/pushController/nivelesPushController.js";
import { handleSyncPreguntas } from "./controllers/pushController/preguntasPushController.js";
import { handleSyncOpciones } from "./controllers/pushController/opcionesPushController.js";
import { handleSyncGlifosObjetivo } from "./controllers/pushController/glifosObjetivosPushController.js";
import { handleSyncInsignias } from "./controllers/pushController/insigniasPushController.js";
import { getGruposEscolaresPull, getGrupoEscolarGrupoNivelPull, getUsuarioGrupoNivelPull } from "./controllers/pullController/gruposEscolaresPullController.js";
import { handleSyncGruposEscolares, handleSyncGrupoEscolarGrupoNivel, handleSyncUsuarioGrupoNivel } from "./controllers/pushController/gruposEscolaresPushController.js";
import multer from "multer";
import fs from "fs/promises";

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
app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets')));


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


//CONFIGURACIÓN DE MANEJADORES DE SINCRONIZACIÓN
const syncHandlers = {
  progreso_usuarios: {
    actions: ["UPSERT"],
    handler: handleSyncProgreso
  },
  admins: {
    actions: ["EDITAR"],
    handler: handleSyncAdmins
  },
  grupos_niveles: {
    actions: ["CREAR", "EDITAR", "ELIMINAR"],
    handler: handleSyncGruposNiveles
  },
  glifos: {
    actions: ["CREAR", "EDITAR", "ELIMINAR"],
    handler: handleSyncGlifos
  },
  niveles: {
    actions: ["CREAR", "EDITAR", "ELIMINAR"],
    handler: handleSyncNiveles
  },
  preguntas: {
    actions: ["CREAR", "EDITAR", "ELIMINAR"],
    handler: handleSyncPreguntas
  },
  opciones_respuestas: {
    actions: ["CREAR", "EDITAR", "ELIMINAR"],
    handler: handleSyncOpciones
  },
  nivel_glifos_objetivos: {
    actions: ["CREAR", "ELIMINAR"],
    handler: handleSyncGlifosObjetivo
  },
  usuario_insignias: {
    actions: ["UPSERT"],
    handler: handleSyncUsuarioInsignia
  },
  insignias: {
    actions: ["CREAR", "EDITAR", "ELIMINAR"],
    handler: handleSyncInsignias
  },
  grupos_escolares: {
    actions: ["CREAR", "EDITAR", "ELIMINAR"],
    handler: handleSyncGruposEscolares
  },
  grupo_escolar_grupo_nivel: {
    actions: ["CREAR", "EDITAR", "ELIMINAR", "UPSERT"],
    handler: handleSyncGrupoEscolarGrupoNivel
  },
  usuario_grupo_nivel: {
    actions: ["CREAR", "EDITAR", "ELIMINAR", "UPSERT"],
    handler: handleSyncUsuarioGrupoNivel
  }
};

// PUSH SYNC
app.post("/api/sync", async (req, res) => {
  const { entidad, accion } = req.body;

  try {
    // Caso especial para usuarios
    if (entidad === "usuarios") {
      if (accion === "CREAR") {
        return await handleSyncUsuarios(req, res, db, io);
      }
      if (accion === "EDITAR") {
        req.params.id = req.body.datos?.id;
        return await updateUsuario(req, res, db, io);
      }
      if (accion === "ELIMINAR") {
        req.params.id = req.body.datos?.id;
        return await deleteUsuario(req, res, db, io);
      }
      return res.status(400).json({ success: false, message: "Acción no soportada para usuarios" });
    }

    //Mapeo del caso general
    const config = syncHandlers[entidad];
    if (config && config.actions.includes(accion)) {
      return await config.handler(req, res, db, io);
    }

    return res.status(400).json({ success: false, message: "Entidad o acción no soportada" });
  } catch (error) {
    console.error("Error en sincronización:", error);
    const msg = error.errors ? error.errors.map(e => e.message).join(", ") : error.message;
    res.status(500).json({ success: false, error: msg });
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
    const grupos_niveles = await getGruposNivelesPull(db, Op, lastSyncDate);
    const usuario_insignias = await getUsuarioInsigniasPull(db, Op, lastSyncDate, usuario_local_id);

    const grupos_escolares = await getGruposEscolaresPull(db, Op, lastSyncDate);
    const grupo_escolar_grupo_nivel = await getGrupoEscolarGrupoNivelPull(db, Op, lastSyncDate);
    const usuario_grupo_nivel = await getUsuarioGrupoNivelPull(db, Op, lastSyncDate);

    res.json({
      success: true,
      cambios: { 
        usuarios,
        admins,
        niveles,
        grupos_niveles, 
        glifos,
        preguntas, 
        opciones_respuestas, 
        nivel_glifos_objetivos,
        progreso_usuarios,
        insignias,
        usuario_insignias,
        grupos_escolares,
        grupo_escolar_grupo_nivel,
        usuario_grupo_nivel
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

//Subida de archivos para los glifos
const glyphStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    let subfolder = "images/glyphs";
    if (file.mimetype.startsWith("audio/")) {
      subfolder = "audio/glyphs";
    } else if (file.mimetype.startsWith("video/")) {
      subfolder = "video/glyphs";
    }
    const dir = path.join(process.cwd(), "public", "assets", subfolder);
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    let prefix = "glyph-";
    if (file.mimetype.startsWith("audio/")) {
      prefix = "audio-";
    } else if (file.mimetype.startsWith("video/")) {
      prefix = "video-";
    }
    cb(null, prefix + uniqueSuffix + ext);
  }
});
const uploadGlyph = multer({ storage: glyphStorage });

app.post("/api/admin/glyphs/upload", uploadGlyph.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se subió ningún archivo." });
  }
  let subfolder = "images/glyphs";
  if (req.file.mimetype.startsWith("audio/")) {
    subfolder = "audio/glyphs";
  } else if (req.file.mimetype.startsWith("video/")) {
    subfolder = "video/glyphs";
  }
  const relativePath = `/assets/${subfolder}/${req.file.filename}`;
  res.json({ success: true, url: relativePath });
});

//Almacenamiento y subida de insignias
const badgeStorage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const dir = path.join(process.cwd(), "public", "assets", "images", "badges");
    await fs.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "badge-" + uniqueSuffix + ext);
  }
});
const uploadBadge = multer({ storage: badgeStorage });

app.post("/api/admin/badges/upload", uploadBadge.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No se subió ningún archivo." });
  }
  const relativePath = `/assets/images/badges/${req.file.filename}`;
  res.json({ success: true, url: relativePath });
});

// ADMIN ROUTES
app.get("/api/admin/usuarios", (req, res) => getAllUsuarios(req, res, db));
app.put("/api/admin/usuarios/:id", (req, res) => updateUsuario(req, res, db, io));
app.delete("/api/admin/usuarios/:id", (req, res) => deleteUsuario(req, res, db, io));


server.listen(PORT, () => {
  console.log(`Servidor y Sockets corriendo en el puerto ${PORT}`);
});