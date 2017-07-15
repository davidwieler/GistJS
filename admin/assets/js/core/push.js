var pushSettings = {
	basePostUrl: adminLocation,
	applicationServerPublicKey: pushServicePublicKey || '',
	serviceWorkerName: '/service-worker.js',
	isSubscribed: subscriptionStatus || '', // Rendered in user-edit.ejs
	isEnabled: pushEnabled || 'false', // Rendered in user-edit.ejs
	swRegistration: null,
	status: {
		https: (location.protocol == 'https:'),
		serviceWorker: null,
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
	for (var i in pushSettings.status) {
		var name = i;
		var status = pushSettings.status[i];
		var statusAreaClass = pushSettings.statusArea[i];
		var falseStatusClass = 'text-danger';
		var trueStatusClass = 'text-success';
		var warningStatusClass = 'text-warning';

		$(`.${statusAreaClass}`).removeClass('text-danger text-success text-warning');

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

				switch (status) {
					case 'installed':
						var text = app.capitalizeFirstLetter(status);
						var addClass = trueStatusClass;
					break;
					case 'activating':
						var text = app.capitalizeFirstLetter(status);
						var addClass = trueStatusClass;
					break;
					case 'activated':
						var text = app.capitalizeFirstLetter(status);
						var addClass = trueStatusClass;
					break;
					case 'redundant':
						var text = 'Removed';
						var addClass = '';
					break;
					default:
						var text = 'Not started'
						var addClass = '';
					break;

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
			if (permission.state === 'prompt') {
				makeButtonSubscribable();
			}

			if (permission.state === 'granted' && pushEnabled === 'true') {
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
            unsubscribe(userId);
        } else{
            subscribe(userId);
        }
    });

	statusUpdate();

	$('#enablePushNotifications').on('click', function (event) {
		event.preventDefault();
		var el = $(this);
		var pushEnabled = el.data('status');
		if (pushEnabled === false) {
			el.prop('disabled', true).html('<i class="icon-cog5 position-left spinner"></i> Enabling Push...');
		} else {
			el.prop('disabled', true).html('<i class="icon-cog5 position-left spinner"></i> Disabling Push...');
		}
		$.post('/' + adminLocation + '/push-setup/toggle', {pushEnabled}, function (response) {
			switch (response) {
				case 'true' :
					pushAsk()
					el.removeClass('btn-primary').addClass('btn-danger').prop('disabled', false).text('Disable Push Messaging').data('status', 'true');
				break;
				case 'false' :
					pushSettings.swRegistration.unregister();
					pushSettings.status.serviceWorker = 'redundant';
					statusUpdate();
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
	pushSettings.swRegistration = reg;
	serviceWorkerStatus(pushSettings.swRegistration)
    initialiseState(pushSettings.swRegistration);
}


function serviceWorkerStatus(reg) {
	if (reg.active !== null) {
		pushSettings.status.serviceWorker = reg.active.state;
		statusUpdate();
	}
	reg.onupdatefound = function() {
		var installingWorker = reg.installing;

		installingWorker.onstatechange = function() {
			pushSettings.status.serviceWorker = installingWorker.state;
			statusUpdate();
		};
	};



}

// Once the service worker is registered set the initial state
function initialiseState(reg) {
    // Are Notifications supported in the service worker?
    if (!(reg.showNotification)) {
        disableAndSetBtnMessage('Notifications unsupported');
        return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
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
