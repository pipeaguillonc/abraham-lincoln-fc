// Abraham Lincoln FC: necesario para que la página se pueda instalar como app.
// La página siempre carga la versión más reciente (no se guarda copia del index.html).
// Las FOTOS de Supabase sí se guardan en el celular la primera vez que se ven y después se
// abren desde ahí, sin volver a descargarlas. Así se gastan muchas menos descargas del plan gratis.
const FOTOS = 'als-fotos-v1';
const MAX_FOTOS = 400;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith('als-fotos-') && k !== FOTOS).map((k) => caches.delete(k)));
  await self.clients.claim();
})()));

function esFoto(req) {
  if (req.method !== 'GET' || req.headers.has('range')) return false;
  const u = new URL(req.url);
  return u.hostname.endsWith('.supabase.co') && u.pathname.startsWith('/storage/v1/object/public/');
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (!esFoto(req)) return; // todo lo demás va directo a internet, como siempre
  // Una imagen pedida para dibujar (modo cors) y una normal (no-cors) se guardan por separado.
  const key = req.url + (req.url.includes('?') ? '&' : '?') + '__m=' + req.mode;
  e.respondWith((async () => {
    const cache = await caches.open(FOTOS);
    const hit = await cache.match(key);
    if (hit) return hit;
    const res = await fetch(req);
    if (res && (res.ok || res.type === 'opaque')) {
      e.waitUntil((async () => {
        await cache.put(key, res.clone());
        const ks = await cache.keys();
        for (let i = 0; i < ks.length - MAX_FOTOS; i++) await cache.delete(ks[i]);
      })());
    }
    return res;
  })());
});
