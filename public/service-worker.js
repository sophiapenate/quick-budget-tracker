const CACHE_NAME = 'budget-tracker-v1';

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/js/index.js",
    "/css/styles.css"
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});