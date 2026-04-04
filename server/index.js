import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";

dotenv.config();

const require = createRequire(import.meta.url);
const db = require("./models/index.cjs");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

db.sequelize.authenticate()
  .then(() => console.log("Conexion exitosa a la base de datos"))
  .catch((error) => console.error("Error al conectar:", error));

app.get("/", (req, res) => {
  res.send("API de Lupa Maya funcionando");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
