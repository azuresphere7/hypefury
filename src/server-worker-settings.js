function initServerWorker(prod, app) {
  if ('serviceWorker' in navigator) {
    let serviceWorker = prod ? '/service-worker.js' : '/service-worker.js';
    navigator.serviceWorker.register(serviceWorker).then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                if (prod) {
                  app.$notify({
                    type: 'info',
                    message: 'A new version of Hypefury is available!<br>' +
                      '<a href="javascript:location.reload()">Click here to refresh the page.</a>',
                  });
                }
              }
              break;
          }
        };
      };
      console.log("Service worker registered!");
    });
  }
}

export default initServerWorker;
