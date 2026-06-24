import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/authRoutes.js";
import syncRoutes from "./routes/syncRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const require = createRequire(import.meta.url);
const db = require("./models/index.cjs");

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

app.use("/api/auth", authRoutes(db, io));
app.use("/api/sync", syncRoutes(db, io));
app.use("/api/admin", uploadRoutes);
app.use("/api", adminRoutes(db, io));

server.listen(PORT, () => {
  console.log(`Servidor y Sockets corriendo en el puerto ${PORT}`);
});