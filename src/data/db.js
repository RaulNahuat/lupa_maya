import { initUsuariosStore } from './store/usuarios.store';
import { initColaSincronizacionStore } from './store/colaSincronizacion.store';
import { initConfiguracionStore } from './store/configuracion.store';
import { initNivelesStore } from './store/niveles.store';
import { initProgresoStore } from './store/progreso.store';
import { initGlifosStore } from './store/glifos.store';
import { initGruposNivelesStore } from './store/gruposNiveles.store';
import { initInsigniasStore } from './store/insignias.store';
import { initNivelGlifoObjetivoStore } from './store/nivelGlifoObjetivo.store';
import { initPreguntasStore } from './store/preguntas.store';
import { initOpcionesRespuestasStore } from './store/opcionesRespuestas.store';
import { initRegistrosEscaneoStore } from './store/registrosEscaneo.store';
import { initUsuarioInsigniasStore } from './store/usuarioInsignias.store';

const DB_NAME = "lupa_maya_db";
const DB_VERSION = 1;

export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            // Inicialización modular de todos los ObjectStores (los 13 modelos de la base de datos)
            initUsuariosStore(db);
            initColaSincronizacionStore(db);
            initConfiguracionStore(db);
            initNivelesStore(db);
            initProgresoStore(db);
            initGlifosStore(db);
            initGruposNivelesStore(db);
            initInsigniasStore(db);
            initNivelGlifoObjetivoStore(db);
            initPreguntasStore(db);
            initOpcionesRespuestasStore(db);
            initRegistrosEscaneoStore(db);
            initUsuarioInsigniasStore(db);
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};