import express from "express";
import { Op } from "sequelize";

import { handleSyncUsuarios } from "../controllers/pushController/UsuariosPushController.js";
import { handleSyncProgreso } from "../controllers/pushController/progresoPushController.js";
import { handleSyncAdmins } from "../controllers/pushController/adminsPushController.js";
import { getUsuariosPull } from "../controllers/pullController/usuariosPullController.js";
import { getAdminsPull } from "../controllers/pullController/adminsPullController.js";
import { getNivelesPull } from "../controllers/pullController/nivelesPullController.js";
import { getProgresoPull } from "../controllers/pullController/progresoPullController.js";
import { getPreguntasPull } from "../controllers/pullController/preguntasPullController.js";
import { getGlifosPull } from "../controllers/pullController/glifosPullController.js";
import { getGlifosObjetivoPull } from "../controllers/pullController/glifosObjetivoPullController.js";
import { getInsigniasPull } from "../controllers/pullController/insigniasPullController.js";
import { getAllUsuarios, updateUsuario, deleteUsuario } from "../controllers/admin/AdminUsuariosController.js";
import { handleSyncUsuarioInsignia } from "../controllers/pushController/usuarioInsigniasPushController.js";
import { getUsuarioInsigniasPull } from "../controllers/pullController/usuarioInsigniasPullController.js";
import { getGruposNivelesPull } from "../controllers/pullController/gruposNivelesPullController.js";
import { handleSyncGruposNiveles } from "../controllers/pushController/gruposNivelesPushController.js";
import { handleSyncGlifos } from "../controllers/pushController/glifosPushController.js";
import { handleSyncNiveles } from "../controllers/pushController/nivelesPushController.js";
import { handleSyncPreguntas } from "../controllers/pushController/preguntasPushController.js";
import { handleSyncOpciones } from "../controllers/pushController/opcionesPushController.js";
import { handleSyncGlifosObjetivo } from "../controllers/pushController/glifosObjetivosPushController.js";
import { handleSyncInsignias } from "../controllers/pushController/insigniasPushController.js";
import { getGruposEscolaresPull, getGrupoEscolarGrupoNivelPull, getUsuarioGrupoNivelPull } from "../controllers/pullController/gruposEscolaresPullController.js";
import { handleSyncGruposEscolares, handleSyncGrupoEscolarGrupoNivel, handleSyncUsuarioGrupoNivel } from "../controllers/pushController/gruposEscolaresPushController.js";

export default function(db, io) {
  const router = express.Router();

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

  // POST /api/sync
  router.post("/", async (req, res) => {
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

      // Mapeo del caso general
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

  // GET /api/sync/pull
  router.get("/pull", async (req, res) => {
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

  return router;
}
