const CACHE_NAME = "budget-tracker-v1";

const FILES_TO_CACHE = ["/", "/index.html", "/js/index.js", "/css/styles.css"];

// install service worker
self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installing cache : " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// activate service worker
self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
          if (key !== CACHE_NAME) {
              console.log('Removing old cache data:', key);
              return caches.delete(key);
          }
      }));
    })
  );
});
