const CACHE_NAME = "budget-tracker-v1";
const DATA_CACHE_NAME = "budget-tracker-data-v1";

const FILES_TO_CACHE = ["./", "./index.html", "./js/index.js", "./css/styles.css"];

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
          return fetch(e.request)
            // intercept fetch response...
            .then((response) => {
              // check if response comes back good...
              if (e.request.method === "GET" && response.status === 200) {
                // add request/response to cache
                cache.put(e.request, response.clone());
              }
              return response;
            })
            // if fetch request failed...
            .catch((err) => {
              // try getting requested data from cache
              return cache.match(e.request);
            });
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
