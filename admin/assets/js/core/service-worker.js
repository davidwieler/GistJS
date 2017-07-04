self.addEventListener('push', function(event) {
    var data = {};
    if (event.data) {
        data = event.data.json();
    }
	console.log(data);
    var title = data.title;
    var message = data.message;
    var icon = 'https://lh3.ggpht.com/uA_9YvBqat-4ftl9Kn40fGuf_6GmDUKuba_Vjn2fo9CnojlOGandrcj2pLp67Q5Wb6I=w300';

    self.clickTarget = data.clickTarget;

    event.waitUntil(self.registration.showNotification(title, {
        body: message,
        icon: icon,
        badge: icon
    }));
});

self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] Notification click Received.');

    event.notification.close();

    if(clients.openWindow){
        event.waitUntil(clients.openWindow(self.clickTarget));
    }
});

self.addEventListener('activate', function(e) {
  // This event will be fired once when this version of the script is first registered for
  // a given URL scope.
  // It's an opportunity to clean up any stale data that might be left behind in self.caches
  // by an older version of this script.
  // e.waitUntil(promise) is also available here to delay activation until work has been performed,
  // but note that waiting within the activate event will delay handling of any
  // fetch or message events that are fired in the interim. When possible, do work during the install phase.
  // It will NOT be fired each time the service worker is revived after being terminated.
  // To perform an action when the service worker is revived, include that logic in the
  // `onfetch` or `onmessage` event listeners.

  console.log('Activate event:', e);
});
