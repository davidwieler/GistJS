var pushSettings = {
	basePostUrl: adminLocation,
	applicationServerPublicKey: 'BAjuFtdVAl-GlZZsuR3ZB1ajRJfSPnTwJ22seL0Mg2UxbucE1b3fYzHOt_DSMC2lxFMWe_pZ-ugoVNb6s2o6Nd4',
	serviceWorkerName: '/service-worker.js',
	isSubscribed: subscriptionStatus || '', // Rendered in user-edit.ejs
	swRegistration: null,
	status: {
		https: (location.protocol == 'https:'),
		serviceWorker: serviceWorkerStatus(),
		permission: null,
		pushSupported: isPushApiSupported(),
		serviceWorkerSupported: areServiceWorkersSupported(),
	},
	buttons: {
		enableButton: 'enablePushNotifications',
		subscribeButton: 'btnPushNotifications'

	},
	statusArea: {
		https: 'push-notifs-https',
		serviceWorker: 'push-notifs-sw',
		permission: 'push-notifs-permission',
		pushSupported: 'push-notifs-push-api',
		serviceWorkerSupported: 'push-notifs-sw-support'
	}
}

function isPushApiSupported() {
	return 'PushManager' in window;
}

function areServiceWorkersSupported() {
	return 'serviceWorker' in navigator;
}

function serviceWorkerStatus() {
	if (areServiceWorkersSupported()) {
		if (navigator.serviceWorker.controller === null) {
			return false;
		} else {
			return true;
		}
	}

	return false;
}

function pushAsk() {
	Notification.requestPermission().then(function (status) {
		if (status === 'denied') {
			disableAndSetBtnMessage('permission denied');
		} else if (status === 'granted') {
			initialiseServiceWorker()
		}
	});
}

function statusUpdate() {
	console.log(pushSettings);
	for (var i in pushSettings.status) {
		var name = i;
		var status = pushSettings.status[i];
		var statusAreaClass = pushSettings.statusArea[i];
		var falseStatusClass = 'text-danger';
		var trueStatusClass = 'text-success';
		var warningStatusClass = 'text-warning';

		switch (name) {
			case 'https' :
				if (status === true) {
					var text = 'Secure domain';
					var addClass = trueStatusClass;
				} else {
					var text = 'Not secure!';
					var addClass = falseStatusClass;
				}

				$(`.${statusAreaClass}`).text(text).addClass(addClass);
			break;

			case 'permission' :
				if (status === 'denied') {
					var text = 'Denied';
					var addClass = falseStatusClass;
				} else if (status === null) {
					var text = 'Pending (never asked)';
					var addClass = warningStatusClass;
				} else if (status === 'granted') {
					var text = 'Granted';
					var addClass = trueStatusClass;
				}

				$(`.${statusAreaClass}`).text(text).addClass(addClass);
			break;

			case 'pushSupported' :
			if (status === true) {
				var text = 'Yes';
				var addClass = trueStatusClass;
			} else {
				var text = 'No';
				var addClass = falseStatusClass;
			}

				$(`.${statusAreaClass}`).text(text).addClass(addClass);
			break;

			case 'serviceWorker' :
				if (status === true) {
					var text = 'Running';
					var addClass = trueStatusClass;
				} else {
					var text = 'Not enabled';
					var addClass = falseStatusClass;
				}

				$(`.${statusAreaClass}`).text(text).addClass(addClass);
			break;

			case 'serviceWorkerSupported' :
				if (status === true) {
					var text = 'Yes';
					var addClass = trueStatusClass;
				} else {
					var text = 'No';
					var addClass = falseStatusClass;
				}

				$(`.${statusAreaClass}`).text(text).addClass(addClass);
			break;
		}
	}
}

$(document).ready(function () {
	if (!pushSettings.status.pushSupported || !pushSettings.status.serviceWorkerSupported) {
		disableAndSetBtnMessage('not supported');
	}

	if (pushSettings.status.pushSupported && pushSettings.status.serviceWorkerSupported) {
		navigator.permissions.query({name: 'notifications'}).then(function(permission) {
			console.log(permission.state);

			if (permission.state === 'prompt') {
				makeButtonSubscribable();
			}

			if (permission.state === 'granted') {
				pushAsk();
			}

			if (permission.state === 'denied') {
				disableAndSetBtnMessage('permission denied');
			}
		});
	}

    $('#userPushNotifications').on('click', function (event) {
		event.preventDefault();
		var userId = $(this).data('userid');
		if (!pushSettings.isSubscribed && !pushSettings.swRegistration) {
			pushAsk();
		} else if (pushSettings.isSubscribed && $(this).hasClass('unsubscribe-action')){
            console.log("Unsubscribing...");
            unsubscribe(userId);
        } else{
			console.log("subbing...");
            subscribe(userId);
        }
    });

	statusUpdate();

	$('#enablePushNotifications').on('click', function (event) {
		event.preventDefault();
		var el = $(this);
		var pushEnabled = el.data('status');
		if (pushEnabled === false) {
			el.prop('disabled', true).text('<i class="icon-cog5 position-left spinner"></i> Enabling Push...');
		} else {
			el.prop('disabled', true).text('<i class="icon-cog5 position-left spinner"></i> disabling Push...');
		}
		$.post('/' + adminLocation + '/push-setup/toggle', {pushEnabled}, function (response) {
			switch (response) {
				case 'true' :
					el.removeClass('btn-primary').addClass('btn-danger').prop('disabled', false).text('Disable Push Messaging').data('status', 'true');
				break;
				case 'false' :
					el.removeClass('btn-danger').addClass('btn-primary').prop('disabled', false).text('Enable Push Messaging').data('status', 'false');
				break;
				default :

				break;
			}
		});
    });
});


function initialiseServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(pushSettings.serviceWorkerName).then(handleSWRegistration);
    } else {
        console.log('Service workers aren\'t supported in this browser.');
        disableAndSetBtnMessage('Service workers unsupported');
    }
};

function handleSWRegistration(reg) {
    if (reg.installing) {
        console.log('Service worker installing');
    } else if (reg.waiting) {
        console.log('Service worker installed');
    } else if (reg.active) {
        console.log('Service worker active');
    }
	pushSettings.swRegistration = reg;
    initialiseState(reg);
}

// Once the service worker is registered set the initial state
function initialiseState(reg) {
    // Are Notifications supported in the service worker?
    if (!(reg.showNotification)) {
        console.log('Notifications aren\'t supported on service workers.');
        disableAndSetBtnMessage('Notifications unsupported');
        return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
        console.log('Push messaging isn\'t supported.');
        disableAndSetBtnMessage('Push messaging unsupported');
        return;
    }

    // We need the service worker registration to check for a subscription
    navigator.serviceWorker.ready.then(function (reg) {
        // Do we already have a push message subscription?
        reg.pushManager.getSubscription()
            .then(function (subscription) {

				$('.push-notifs-enabled').text('Yes').addClass('text-success');
                if (!subscription) {
                    console.log('Not yet subscribed to Push');

                    pushSettings.isSubscribed = false;
                    makeButtonSubscribable();
                } else {
                    // initialize status, which includes setting UI elements for subscribed status
                    // and updating Subscribers list via push
                    pushSettings.isSubscribed = true;
                    makeButtonUnsubscribable();
                }
            })
            .catch(function (err) {
                console.log('Error during getSubscription()', err);
            });
    });
}

function subscribe(userId) {
    navigator.serviceWorker.ready.then(function (reg) {
        var subscribeParams = {userVisibleOnly: true};

        //Setting the public key of our VAPID key pair.
        var applicationServerKey = urlB64ToUint8Array(pushSettings.applicationServerPublicKey);
        subscribeParams.applicationServerKey = applicationServerKey;

        reg.pushManager.subscribe(subscribeParams)
            .then(function (subscription) {

                // Update status to subscribe current user on server, and to let
                // other users know this user has subscribed
                var endpoint = subscription.endpoint;
                var key = subscription.getKey('p256dh');
                var auth = subscription.getKey('auth');
                sendSubscriptionToServer(endpoint, key, auth, userId);
                pushSettings.isSubscribed = true;
                makeButtonUnsubscribable();
            })
            .catch(function (e) {
                // A problem occurred with the subscription.
                console.log('Unable to subscribe to push.', e);
            });
    });
}

function unsubscribe(userId) {
    var endpoint = null;
    pushSettings.swRegistration.pushManager.getSubscription()
        .then(function(subscription) {
            if (subscription) {
                endpoint = subscription.endpoint;
                return subscription.unsubscribe();
            }
        })
        .catch(function(error) {
            console.log('Error unsubscribing', error);
        })
        .then(function() {
            removeSubscriptionFromServer(endpoint, userId);

            console.log('User is unsubscribed.');
            pushSettings.isSubscribed = false;

            makeButtonSubscribable(endpoint);
        });
}

function sendSubscriptionToServer(endpoint, key, auth, userId) {
    var encodedKey = btoa(String.fromCharCode.apply(null, new Uint8Array(key)));
    var encodedAuth = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)));

    $.ajax({
        type: 'POST',
        url: `/${pushSettings.basePostUrl}/push-setup/subscribe`,
        data: {publicKey: encodedKey, auth: encodedAuth, notificationEndPoint: endpoint, userId: userId},
        success: function (response) {
            console.log('Subscribed successfully! ' + JSON.stringify(response));
        },
        dataType: 'json'
    });
}

function removeSubscriptionFromServer(endpoint, userId) {
    $.ajax({
        type: 'POST',
        url: `/${pushSettings.basePostUrl}/push-setup/unsubscribe`,
        data: {notificationEndPoint: endpoint, userId: userId},
        success: function (response) {
            console.log('Unsubscribed successfully! ' + JSON.stringify(response));
        },
        dataType: 'json'
    });
}

function disableAndSetBtnMessage(message) {

	switch (message) {
		case 'not supported' :
			$(`#${pushSettings.buttons.enableButton}`).text('Push not supported').prop('disabled', true)
		break;
	}

    setBtnMessage(message);
    $('#userPushNotifications').attr('disabled','disabled');
}

function enableAndSetBtnMessage(message) {
    setBtnMessage(message);
    $('#userPushNotifications').removeAttr('disabled');
}

function makeButtonSubscribable() {
    enableAndSetBtnMessage('Subscribe to push notifications');
    $('#userPushNotifications').addClass('btn-primary subscribe-action').removeClass('btn-danger unsubscribe-action');
}

function makeButtonUnsubscribable() {
    enableAndSetBtnMessage('Unsubscribe from push notifications');
    $('#userPushNotifications').addClass('btn-danger unsubscribe-action').removeClass('btn-primary subscribe-action');
}

function setBtnMessage(message) {
    $('#userPushNotifications').text(message);
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
