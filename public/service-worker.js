/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["404.html","0a27a4163254fc8fce870c8cc3a3f94f"],["css/app.48b76c2d.css","818b4ea78e77a591716adaea66ede0f8"],["css/chunk-3e5b7b3c.3e82f876.css","2af9d7c59955efbdd42c676cb907ed1a"],["css/chunk-92e65f16.b88ccf19.css","f487a65b731aee600a870ed96572b8cf"],["css/chunk-vendors.971ed4f2.css","6fd752444d2af25d58b92de2b82cc41f"],["favicon.ico","5e7efd5e1a6f9ca457c5863ec7190ee2"],["fonts/nucleo-icons.2569aaea.woff","2569aaea6eaaf8cd210db7f2fa016743"],["fonts/nucleo-icons.42643978.woff2","426439788ec5ba772cdf94057f6f4659"],["fonts/nucleo-icons.c1733565.eot","c1733565b32b585676302d4233c39da8"],["fonts/nucleo-icons.f82ec6ba.ttf","f82ec6ba2dc4181db2af35c499462840"],["hypefury-logo.png","5e7efd5e1a6f9ca457c5863ec7190ee2"],["hypefury-name.png","cde2f0129e504f564d6ef4cbb889d230"],["img/brand/favicon.png","5bcf46d00bb2f8cc17d2257003803d93"],["img/brand/green.png","a158e68b2ab402fc3f58861935f523ac"],["img/brand/white.png","776e8317ed66d1e2ec7ef1853377375b"],["img/icons/cards/bitcoin.png","591384966db885138098a51e80faa636"],["img/icons/cards/mastercard.png","cd698e043800746241f312478190df5d"],["img/icons/cards/paypal.png","3706c122e13b8bfdeba1c6b302eab7a2"],["img/icons/cards/visa.png","9970054e8e402cded4742171f1a450c3"],["img/icons/common/github.svg","4ffd4fe7945af123788bf5888296c696"],["img/icons/common/google.svg","87be59a1f7061fc6021876aad6fee028"],["img/icons/common/twitter.svg","a7a925c7c07f163f3274df0c1ab2c321"],["img/icons/flags/DE.png","64ababf7de758dcee0358c2c4d93a371"],["img/icons/flags/GB.png","b0d54b4089ce5e24c82574109f346289"],["img/icons/flags/US.png","2f88ea36fc94779a8f2e65c2ee8ccc76"],["img/nucleo-icons.0b8a30b1.svg","0b8a30b10cbe7708d5f3a4b007c1d665"],["img/theme/angular.jpg","1f533d2fdc40493ee834dd8e4288220c"],["img/theme/bootstrap.jpg","d136a071cf09ba5ab8dc2ada1ab04015"],["img/theme/img-1-1000x600.jpg","c993e3af563e68abaf9eaee2551ad321"],["img/theme/img-1-1000x900.jpg","636969987217f57f75b1c0957a97012f"],["img/theme/landing-1.png","9092bbb13f98100f884a8c14cc1e85b9"],["img/theme/landing-2.png","9757d88edecdaab6e32ccb6c5e03f962"],["img/theme/landing-3.png","64f0dfdc1cc6dccb7d994ffc1ad7163e"],["img/theme/profile-cover.jpg","cee60cfd101f9b3d2aae0e819ec8b267"],["img/theme/react.jpg","50dd5fdc839dfc16739b15370650485c"],["img/theme/sketch.jpg","3b8c576082e5ca27bae21a839f1290f6"],["img/theme/team-1.jpg","edc7106b21ec12e57022b2ebd534cd2d"],["img/theme/team-2.jpg","be997d5226b992ffad34816870c6b7aa"],["img/theme/team-3.jpg","54e3f3c414bd8e7234bae3ee3be950e5"],["img/theme/team-4.jpg","66618a418175ddf2ac8c47a241d327a8"],["img/theme/team-5.jpg","edc7106b21ec12e57022b2ebd534cd2d"],["img/theme/vue.jpg","c532f6f0176968caa6265864ee1abb35"],["index.html","4714ad2fb27f4bcd0b411a83b69f2e6a"],["js/app.c39e6917.js","d3f65c29cdff03a419983bebdc077840"],["js/app.c39e6917.js.map","4b5c71d77c5fce0cd1c4d9f1d61ab690"],["js/chunk-3e5b7b3c.f95db698.js","a776a8ce85f0e88ec3a59622d1ebf703"],["js/chunk-3e5b7b3c.f95db698.js.map","61de6bee1f8d80b68ba56f6dafb2c49c"],["js/chunk-47c34c0a.8141855b.js","b85c40bab323276df211377a597fe3ff"],["js/chunk-47c34c0a.8141855b.js.map","b36fe870864f9cdc551393d23a69525a"],["js/chunk-5f9c16bd.4c75da87.js","ae235964e2e5d69a37c6e82bf8e521eb"],["js/chunk-5f9c16bd.4c75da87.js.map","fb20e54a818059696fe4e7e38068778a"],["js/chunk-852a4262.6bde014d.js","66eb3f2836530ccc071a8c84f5981164"],["js/chunk-852a4262.6bde014d.js.map","ac85dc19501d4af015dee65dcdd62c70"],["js/chunk-92e65f16.4e1f6671.js","7b7089cb518fb471c3eb09465313799e"],["js/chunk-92e65f16.4e1f6671.js.map","489070012c83e6e5a95c963254b4a1e8"],["js/chunk-vendors.7a5f3ee5.js","e3bf81a0225b9c5910e00655fe430ac5"],["manifest.json","f59b28bbad7a1384d8a4ed4cb8977dc1"],["pwa/sw-config.js","fc4133557c205fb09ac8fe90db83dacb"]];
var cacheName = 'sw-precache-v3-hypefury-' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function(originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function(originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







