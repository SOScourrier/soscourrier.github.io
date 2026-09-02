// Service worker : met l'outil en cache pour qu'il fonctionne hors connexion
// après le premier chargement. Bump CACHE_NAME à chaque mise à jour du site
// pour forcer le rechargement des fichiers.
var CACHE_NAME = 'hanzi-trainer-v6';
var ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7/dist/hanzi-writer.min.js'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache){ return cache.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.map(function(name){
        if(name !== CACHE_NAME) return caches.delete(name);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Stratégie "cache d'abord" : sert le cache immédiatement si disponible
// (rapide, marche hors connexion), sinon va chercher sur le réseau et
// met en cache pour la prochaine fois.
self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached){
      var fetchPromise = fetch(event.request).then(function(response){
        if(response && response.status === 200){
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, clone); });
        }
        return response;
      }).catch(function(){ return cached; });
      return cached || fetchPromise;
    })
  );
});
