// Abraham Lincoln FC: necesario para que la página se pueda instalar como app.
// No guarda copias de la página: siempre carga la versión más reciente.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
