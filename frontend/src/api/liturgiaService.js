// src/api/liturgiaService.js
// Servico centralizado para obter a Liturgia Diaria com cache em localStorage.

function formatCacheKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + d;
}

function buildUrl(date) {
  const base = 'https://liturgia.up.railway.app/v2/';
  if (!date) return base;
  const dia = date.getDate();
  const mes = date.getMonth() + 1;
  const ano = date.getFullYear();
  return base + '?dia=' + dia + '&mes=' + mes + '&ano=' + ano;
}

function getFromCache(date) {
  const key = 'liturgia_' + formatCacheKey(date);
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    const now = Date.now();
    if (parsed.__timestamp && now - parsed.__timestamp > 86400000) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.data;
  } catch (_) {
    return null;
  }
}

function setCache(date, data) {
  const key = 'liturgia_' + formatCacheKey(date);
  const payload = { data: data, __timestamp: Date.now() };
  localStorage.setItem(key, JSON.stringify(payload));
}

export async function getLiturgia(date) {
  if (!date) date = new Date();
  var cached = getFromCache(date);
  if (cached) return cached;
  var url = buildUrl(date);
  var resp = await fetch(url);
  if (!resp.ok) {
    throw new Error('Falha ao buscar liturgia (status ' + resp.status + ')');
  }
  var json = await resp.json();
  setCache(date, json);
  return json;
}

export function clearLiturgiaCache() {
  Object.keys(localStorage)
    .filter(function(k) { return k.startsWith('liturgia_'); })
    .forEach(function(k) { localStorage.removeItem(k); });
}
