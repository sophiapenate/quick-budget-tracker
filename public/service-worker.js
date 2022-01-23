const CACHE_NAME = "budget-tracker-v1";
const DATA_CACHE_NAME = "budget-tracker-data-v1";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./js/index.js",
  "./js/idb.js",
  "./css/styles.css",
  "./icons/icon-72x72.png",
  "./icons/icon-96x96.png",
  "./icons/icon-128x128.png",
  "./icons/icon-144x144.png",
  "./icons/icon-152x152.png",
  "./icons/icon-192x192.png",
  "./icons/icon-384x384.png",
  "./icons/icon-512x512.png",
];

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
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log("Removing old cache data:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// intercept fetch requests
self.addEventListener("fetch", (e) => {
  // if api request...
  if (e.request.url.includes("/api/")) {
    e.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          // send fetch request...
          return (
            fetch(e.request)
              // intercept fetch response...
              .then((response) => {
                // check if response comes back good...
                if (e.request.method !== "POST" && response.status === 200) {
                  // add request/response to cache
                  cache.put(e.request, response.clone());
                }
                return response;
              })
              // if fetch request failed...
              .catch((err) => {
                // try getting requested data from cache
                return cache.match(e.request);
              })
          );
        })
        .catch((err) => console.log(err))
    );
    // for all other fetch requests...
  } else {
    e.respondWith(
      // intercept if fetch request failed...
      fetch(e.request).catch(function () {
        // if fetch request stored in cache, return stored response
        return caches.match(e.request).then(function (response) {
          if (response) {
            return response;
            // otherwise, return cached homepage
          } else if (e.request.headers.get("accept").includes("text/html")) {
            return caches.match("/");
          }
        });
      })
    );
  }
});
