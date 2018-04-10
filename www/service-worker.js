var version = "v1::";
var cache_files = [
    "index.html",
    "offline.js",
    "service-worker.js",

    "css/bootstrap.min.css",
    "css/roboto.css",
    "css/bootstrap.css",
    "css/main.css.map",
    "css/bootstrap.css.map",
    "css/main.css",
    "css/main.scss",
    "css/font-awesome.min.css",

    "js/l10n.js",
    "js/models.js",
    "js/main.js",
    "js/helpers.js",
    "js/topics.js",

    "js/views/add_story.js",
    "js/views/about.js",
    "js/views/story.js",
    "js/views/home.js",
    "js/views/userinfo.js",
    "js/views/settings.js",
    "js/views/footer.js",

    "js/vendor",
    "js/vendor/backbone.stickit-0.9.2.js",
    "js/vendor/backbone-1.3.3-min.js",
    "js/vendor/bootstrap-3.3.1.min.js",
    "js/vendor/moment-2.14.1.min.js",
    "js/vendor/modernizr-2.8.3-respond-1.4.2.min.js",
    "js/vendor/jquery-1.11.2.min.js",
    "js/vendor/polyglot.min.js",
    "js/vendor/progressbar-1.0.1.min.js",
    "js/vendor/jquery.autogrow-textarea.js",
    "js/vendor/backbone.localStorage.js",
    "js/vendor/underscore-1.8.3-min.js",
    "js/vendor/handlebars-v4.0.5.js",

    "img/code4sa-logo.png",
    "img/openup-logo.svg",
    "img/aip-logo.png",
    "img/c4sa-logo-white.png",
    "img/logo.png",
    "img/logo.psd",
    "img/logo-152.png",
    "img/nqabile-logo.png",

    "fonts/roboto-medium.ttf",
    "fonts/fontawesome-webfont.svg",
    "fonts/FontAwesome.otf",
    "fonts/glyphicons-halflings-regular.woff",
    "fonts/glyphicons-halflings-regular.eot",
    "fonts/roboto-regular.ttf",
    "fonts/glyphicons-halflings-regular.ttf",
    "fonts/fontawesome-webfont.woff2",
    "fonts/fontawesome-webfont.ttf",
    "fonts/fontawesome-webfont.woff",
    "fonts/glyphicons-halflings-regular.svg",
    "fonts/roboto-italic.ttf",
    "fonts/fontawesome-webfont.eot"
]

self.addEventListener("install", function(event) {
    console.log('WORKER: install event in progress.');
    event.waitUntil(
        caches
            .open(version + 'fundamentals')
            .then(function(cache) {
                return cache.addAll(cache_files);
            })
            .then(function() {
                console.log('WORKER: install completed');
            })
    );
});

self.addEventListener("fetch", function(event) {
    console.log('WORKER: fetch event in progress.');

    if (event.request.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }

    event.respondWith(
        caches
            .match(event.request)
            .then(function(cached) {
            /* Even if the response is in our cache, we go to the network as well.
               This pattern is known for producing "eventually fresh" responses,
               where we return cached responses immediately, and meanwhile pull
               a network response and store that in the cache.
               Read more:
               https://ponyfoo.com/articles/progressive-networking-serviceworker
            */
            var networked = fetch(event.request)
                .then(fetchedFromNetwork, unableToResolve)
                .catch(unableToResolve);

            console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
            return cached || networked;

            function fetchedFromNetwork(response) {
                var cacheCopy = response.clone();

                console.log('WORKER: fetch response from network.', event.request.url);

                caches
                    .open(version + 'pages')
                    .then(function add(cache) {
                        cache.put(event.request, cacheCopy);
                    })
                    .then(function() {
                        console.log('WORKER: fetch response stored in cache.', event.request.url);
                    });

                return response;
            }

            function unableToResolve () {
                console.log('WORKER: fetch request failed in both cache and network.');

                return new Response('<h1>Service Unavailable</h1>', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                      'Content-Type': 'text/html'
                    })
                });
            }
        })
  );
});

self.addEventListener("activate", function(event) {
    console.log('WORKER: activate event in progress.');

    event.waitUntil(
        caches
            .keys()
            .then(function (keys) {
                return Promise.all(
                    keys
                    .filter(function (key) {
                        return !key.startsWith(version);
                    })
                    .map(function (key) {
                        return caches.delete(key);
                    })
                );
            })
            .then(function() {
              console.log('WORKER: activate completed.');
            })
    );
});
