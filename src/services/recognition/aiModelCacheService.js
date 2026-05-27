import { API_BASE_URL } from '../../config/api';

const AI_MODEL_CACHE_NAME = 'lupa-maya-ai-models-v1';
const ACTIVE_MODEL_STORAGE_KEY = 'lupa_maya.active_ai_model';

function getStoredActiveModel() {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(ACTIVE_MODEL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('No se pudo leer el modelo activo guardado en el navegador:', error);
    return null;
  }
}

function storeActiveModel(model) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(ACTIVE_MODEL_STORAGE_KEY, JSON.stringify(model));
  } catch (error) {
    console.warn('No se pudo guardar el modelo activo en el navegador:', error);
  }
}

function resolveAssetUrl(assetPath) {
  return new URL(assetPath, API_BASE_URL).toString();
}

function getWeightsUrl(modelUrl) {
  const resolved = new URL(modelUrl, API_BASE_URL);
  resolved.pathname = resolved.pathname.replace(/model\.json$/i, 'weights.bin');
  return resolved.toString();
}

async function cacheRemoteAsset(cache, assetUrl) {
  const request = new Request(assetUrl, { credentials: 'same-origin' });
  const response = await fetch(request);

  if (!response.ok) {
    throw new Error(`No se pudo descargar ${assetUrl} (${response.status})`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html')) {
    throw new Error(`Se recibió HTML en lugar de un recurso del modelo AI para ${assetUrl}. Asegúrate de que el servidor esté sirviendo los archivos correctamente.`);
  }

  await cache.put(request, response.clone());
  return response;
}

export async function ensureActiveAiModelCached() {
  if (typeof window === 'undefined' || typeof caches === 'undefined') {
    return null;
  }

  const cache = await caches.open(AI_MODEL_CACHE_NAME);
  let activeModel = getStoredActiveModel();

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai-models/active`);

    if (response.ok) {
      const payload = await response.json();
      activeModel = payload.data || null;

      if (activeModel) {
        storeActiveModel(activeModel);
      }
    } else if (response.status === 404) {
      activeModel = null;
    }
  } catch (error) {
    console.warn('No se pudo consultar el modelo activo remoto, se intentará usar el guardado localmente:', error);
  }

  if (!activeModel) {
    return null;
  }

  const modelUrl = resolveAssetUrl(activeModel.model_url);
  const weightsUrl = getWeightsUrl(activeModel.model_url);
  const metadataUrl = resolveAssetUrl(activeModel.metadata_url);

  const assetUrls = [modelUrl, weightsUrl, metadataUrl];

  for (const assetUrl of assetUrls) {
    const cached = await cache.match(assetUrl);
    if (cached) continue;

    if (!navigator.onLine) {
      console.warn('El navegador está sin conexión y falta un asset del modelo en caché:', assetUrl);
      continue;
    }

    try {
      await cacheRemoteAsset(cache, assetUrl);
    } catch (error) {
      console.warn('No se pudo cachear el asset del modelo AI:', assetUrl, error);
    }
  }

  return {
    ...activeModel,
    assets: {
      modelUrl,
      weightsUrl,
      metadataUrl
    }
  };
}

export async function getCachedActiveAiModel() {
  if (typeof window === 'undefined' || typeof caches === 'undefined') {
    return null;
  }

  const activeModel = getStoredActiveModel();
  if (!activeModel) return null;

  const cache = await caches.open(AI_MODEL_CACHE_NAME);
  const modelUrl = resolveAssetUrl(activeModel.model_url);
  const weightsUrl = getWeightsUrl(activeModel.model_url);
  const metadataUrl = resolveAssetUrl(activeModel.metadata_url);

  return {
    ...activeModel,
    assets: {
      model: await cache.match(modelUrl),
      weights: await cache.match(weightsUrl),
      metadata: await cache.match(metadataUrl)
    }
  };
}
