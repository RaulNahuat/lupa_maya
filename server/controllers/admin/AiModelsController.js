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

function buildPublicUrls() {
  return {
    modelUrl: `/models/model.json`,
    metadataUrl: `/models/metadata.json`
  };
}

export async function createAiModel(req, res, db) {
  const isActive = true;
  const uploadedFiles = getUploadedFileMap(req.files || []);

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

  const targetDirectory = path.join(process.cwd(), "public", "models");

  try {
    //Asegura que la carpeta public/models exista, sino la crea
    await fs.mkdir(targetDirectory, { recursive: true });

    //Escribe los nuevos archivos directamente en public/models/ (sobreescribiendo los anteriores)
    await Promise.all([
      fs.writeFile(path.join(targetDirectory, "model.json"), modelFile.buffer),
      fs.writeFile(path.join(targetDirectory, "weights.bin"), weightsFile.buffer),
      fs.writeFile(path.join(targetDirectory, "metadata.json"), metadataFile.buffer)
    ]);

    const { modelUrl, metadataUrl } = buildPublicUrls();
    //Genera la fecha actual para mostrar en el panel
    const readableVersion = new Date().toLocaleString("es-MX");

    //Elimina los registros de la base de datos de modelos anteriores e inserta el nuevo dentro de una transacción
    const createdModel = await db.sequelize.transaction(async (transaction) => {
      await db.AiModel.destroy({
        where: {},
        transaction
      });

      return db.AiModel.create(
        {
          version: readableVersion,
          model_url: modelUrl,
          metadata_url: metadataUrl,
          is_active: isActive
        },
        { transaction }
      );
    });

    return res.status(201).json({
      success: true,
      message: "Modelo cargado y sustituido correctamente en public/models/",
      data: createdModel
    });
  } catch (error) {
    console.error("Error al subir el modelo AI:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}