import fs from "fs/promises";
import path from "path";
import multer from "multer";
import crypto from "crypto";

const upload = multer({ storage: multer.memoryStorage() });

export const uploadAiModelFiles = upload.any();

function getUploadedFileMap(files = []) {
  return files.reduce((accumulator, file) => {
    const key = path.basename(file.originalname).toLowerCase();
    accumulator[key] = file;
    return accumulator;
  }, {});
}

function buildPublicUrls(version) {
  const safeVersion = encodeURIComponent(version);
  return {
    modelUrl: `/models/${safeVersion}/model.json`,
    metadataUrl: `/models/${safeVersion}/metadata.json`
  };
}

function generateVersion() {
  const now = new Date();
  const datePart = now.toISOString().replace(/[-:]/g, "").replace(/\..+$/, "").replace("T", "_");
  const randomPart = crypto.randomBytes(3).toString("hex");
  return `v${datePart}_${randomPart}`;
}

async function removeVersionDirectory(version) {
  const targetDirectory = path.join(process.cwd(), "public", "models", version);
  await fs.rm(targetDirectory, { recursive: true, force: true });
}

export async function createAiModel(req, res, db) {
  const isActive = req.body?.is_active === true || req.body?.is_active === "true" || req.body?.is_active === "1";
  const uploadedFiles = getUploadedFileMap(req.files || []);
  const version = generateVersion();

  const modelFile = uploadedFiles["model.json"];
  const weightsFile = uploadedFiles["weights.bin"];
  const metadataFile = uploadedFiles["metadata.json"];

  if (!modelFile || !weightsFile || !metadataFile) {
    return res.status(400).json({
      success: false,
      message: "Debes subir model.json, weights.bin y metadata.json en una sola petición"
    });
  }

  if ((req.files || []).length !== 3) {
    return res.status(400).json({
      success: false,
      message: "La subida debe contener exactamente 3 archivos"
    });
  }

  const targetDirectory = path.join(process.cwd(), "public", "models", version);
  let filesWritten = false;
  let directoryCreated = false;

  try {
    const existing = await db.AiModel.findOne({ where: { version } });
    if (existing) {
      return res.status(409).json({ success: false, message: "Ya existe un modelo con esa version" });
    }

    await fs.mkdir(path.dirname(targetDirectory), { recursive: true });
    await fs.mkdir(targetDirectory, { recursive: false });
    directoryCreated = true;

    await Promise.all([
      fs.writeFile(path.join(targetDirectory, "model.json"), modelFile.buffer),
      fs.writeFile(path.join(targetDirectory, "weights.bin"), weightsFile.buffer),
      fs.writeFile(path.join(targetDirectory, "metadata.json"), metadataFile.buffer)
    ]);
    filesWritten = true;

    const { Op } = db.Sequelize;
    const { modelUrl, metadataUrl } = buildPublicUrls(version);

    const createdModel = await db.sequelize.transaction(async (transaction) => {
      if (isActive) {
        await db.AiModel.update(
          { is_active: false },
          {
            where: { is_active: true },
            transaction
          }
        );
      }

      return db.AiModel.create(
        {
          version,
          model_url: modelUrl,
          metadata_url: metadataUrl,
          is_active: isActive
        },
        { transaction }
      );
    });

    return res.status(201).json({
      success: true,
      message: "Modelo cargado correctamente",
      data: createdModel
    });
  } catch (error) {
    if (error.code === "EEXIST") {
      return res.status(409).json({ success: false, message: "Ya existe una carpeta para esa version" });
    }

    if (filesWritten || directoryCreated) {
      await removeVersionDirectory(version);
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ success: false, message: "La version ya existe" });
    }

    console.error("Error al subir el modelo AI:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}