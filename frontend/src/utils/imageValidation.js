// src/utils/imageValidation.js

/**
 * Verifica se a URL da imagem é válida sintaticamente
 * @param {string} url
 * @returns {boolean}
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith("/") || trimmed.startsWith("./")) return true;
  return /^https?:\/\//i.test(trimmed);
}

/**
 * Tenta pré-carregar uma imagem no navegador para validar se ela realmente carrega
 * @param {string} url
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
export function preloadImageUrl(url, timeoutMs = 3000) {
  return new Promise((resolve) => {
    if (!isValidImageUrl(url)) {
      return resolve(false);
    }

    if (typeof window === "undefined" || typeof Image === "undefined") {
      return resolve(true);
    }

    const img = new Image();
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        img.src = "";
        resolve(false);
      }
    }, timeoutMs);

    img.onload = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        resolve(false);
      }
    };

    img.src = url;
  });
}
