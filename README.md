# Lupa Maya 🔍🗿 (React + Vite PWA)

¡Bienvenido al proyecto Lupa Maya! Una aplicación progresiva (PWA) diseñada para descubrir la belleza de la cultura Maya, con soporte offline y sincronización automática.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **Node.js** (v18 o superior recomendado)
- **pnpm** (Opcional, pero recomendado. Instálalo con `npm install -g pnpm`)
- **MySQL** corriendo localmente.

## Instalación y Configuración

Sigue estos pasos para configurar el proyecto en tu máquina:

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```

2. **Configurar el entorno**:
   - Copia el archivo `.env.example` y cámbialo a `.env`.
   - Edita el archivo `.env` con tus credenciales de MySQL (host, usuario, contraseña, etc.).
   ```bash
   cp .env.example .env
   ```

3. **Configurar la Base de Datos**:
   - Asegúrate de que la base de datos definida en tu `.env` (ej. `lupa_maya_db`) exista en tu servidor MySQL.
   - Ejecuta las migraciones para crear las tablas:
     ```bash
     npx sequelize-cli db:migrate
     ```
   - (Opcional) Carga los datos iniciales (seeds):
     ```bash
     npx sequelize-cli db:seed:all
     ```

## Cómo Correr el Proyecto

Para trabajar en el proyecto, necesitas correr tanto el **Servidor (Backend)** como el **Cliente (Frontend)**.

### 1. Iniciar el Backend (API)
En una terminal aparte:
```bash
npx nodemon server/index.js
```

### 2. Iniciar el Frontend (Cliente)
En otra terminal aparte:
```bash
pnpm run dev
```

---

## Pruebas de PWA y Modo Offline

La aplicación está configurada como una **PWA (Progressive Web App)**. Sin embargo, el modo **Offline real** solo puede probarse en la versión de producción (ya que el modo desarrollo depende del servidor de Vite activo).

### Pasos para probar Offline:

1. **Generar el build**:
   ```bash
   pnpm run build
   ```
2. **Servir la vista previa**:
   ```bash
   pnpm run preview
   ```
3. **Instalar la App**: Abre la URL en el navegador e instala la aplicación como una App de escritorio/móvil.
4. **Test de desconexión**: Apaga el terminal de `pnpm run preview` y abre la App instalada. Verás que carga correctamente sin servidor.

## Otros Comandos Útiles

- **Ver estado de migraciones**: `npx sequelize-cli db:migrate:status`
- **Deshacer última migración**: `npx sequelize-cli db:migrate:undo`
- **Linting**: `pnpm run lint`
