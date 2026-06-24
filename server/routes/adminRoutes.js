import express from "express";
import { getAllUsuarios, updateUsuario, deleteUsuario } from "../controllers/admin/AdminUsuariosController.js";
import { createAiModel, uploadAiModelFiles } from "../controllers/admin/AiModelsController.js";
import { getActiveAiModel } from "../controllers/pullController/aiModelsPullController.js";

export default function(db, io) {
  const router = express.Router();

  router.get("/admin/usuarios", (req, res) => getAllUsuarios(req, res, db));
  router.put("/admin/usuarios/:id", (req, res) => updateUsuario(req, res, db, io));
  router.delete("/admin/usuarios/:id", (req, res) => deleteUsuario(req, res, db, io));

  router.post("/admin/ai-models", uploadAiModelFiles, (req, res) => createAiModel(req, res, db));
  router.get("/ai-models/active", (req, res) => getActiveAiModel(req, res, db));

  return router;
}
