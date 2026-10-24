import api from '@/services/api';

const CACHE_KEY = 'stoofi_frontend_cms_cache_v1';

export function getCachedCms() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

export function setCachedCms(doc) {
  if (typeof window === 'undefined' || !doc) return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(doc));
  } catch (_) {}
}

export async function fetchAllCms() {
  try {
    const res = await fetch('/api/frontend-cms', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
    if (res?.success && res.data) {
      setCachedCms(res.data);
      return res.data;
    }
    const apiRes = await api.get('/frontend-cms').catch(() => null);
    if (apiRes?.success && apiRes.data) {
      setCachedCms(apiRes.data);
      return apiRes.data;
    }
  } catch (_) {}
  return getCachedCms();
}

export async function fetchCmsSection(section, fallback = []) {
  try {
    const res = await fetch(`/api/frontend-cms?section=${encodeURIComponent(section)}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
    if (res?.success && res.data !== undefined) {
      return res.data;
    }
    const apiRes = await api.get(`/frontend-cms?section=${encodeURIComponent(section)}`).catch(() => null);
    if (apiRes?.success && apiRes.data !== undefined) {
      return apiRes.data;
    }
  } catch (_) {}
  const cached = getCachedCms();
  if (cached && cached[section] !== undefined) return cached[section];
  return fallback;
}

export async function mutateCmsSection(section, action, payload = {}) {
  const body = { section, action, ...payload };
  let result = await fetch('/api/frontend-cms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(r => r.ok ? r.json() : null)
    .catch(() => null);

  if (!result?.success) {
    result = await api.post('/frontend-cms', body).catch(() => null);
  }

  if (result?.success && typeof window !== 'undefined') {
    const cached = getCachedCms() || {};
    cached[section] = result.data;
    setCachedCms(cached);
    window.dispatchEvent(new CustomEvent('stoofi_cms_updated', { detail: { section, data: result.data } }));
  }

  return result;
}

export function compressCmsImage(file, maxDim = 960, quality = 0.8) {
  return new Promise((resolve) => {
    if (!file) return resolve('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(ev.target.result || '');
      img.src = ev.target.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export async function fileToCmsAsset(file) {
  if (!file) return { fileUrl: '', fileName: '', fileSize: '', mimeType: '' };
  const fileName = file.name;
  const fileSize = file.size > 1024 * 1024
    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    : `${Math.max(1, Math.round(file.size / 1024))} KB`;
  const mimeType = file.type || 'application/octet-stream';

  if (mimeType.startsWith('image/')) {
    const dataUri = await compressCmsImage(file, 1000, 0.82);
    return { fileUrl: dataUri, fileName, fileSize, mimeType };
  }

  if (file.size <= 1.5 * 1024 * 1024) {
    const dataUri = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
    return { fileUrl: dataUri, fileName, fileSize, mimeType };
  }

  return { fileUrl: '', fileName, fileSize, mimeType };
}

export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function getVideoThumbnail(videoUrl, customThumbnail) {
  if (customThumbnail && typeof customThumbnail === 'string' && customThumbnail.trim()) {
    return customThumbnail;
  }
  const ytId = extractYouTubeId(videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  }
  return '';
}
