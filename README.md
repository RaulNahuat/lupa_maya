# Lupa Maya (React + Vite)

## Instalación y Configuración

Sigue estos pasos para correr el proyecto localmente:

1. **Instalar dependencias**: El proyecto utiliza `pnpm`. Si no lo tienes, puedes instalarlo globalmente con `npm install -g pnpm`.
   Luego, en la raíz del proyecto, ejecuta:
   ```bash
   pnpm install
   ```
2. **Configurar el entorno**:
   - Crea un archivo `.env` para las variables de entorno.
3. **Correr el servidor de desarrollo**:
   ```bash
   pnpm run dev
   ```

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
