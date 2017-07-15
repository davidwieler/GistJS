const webpush = require('web-push');
const Utils = require('../utils.js');
const _ = require('lodash');
module.exports = (CMS, APP) => {

	let msg = {};

	msg.init = () => {
		if (CMS.config.pushEnabled) {
			msg.startPushServices();
		}

		CMS._messaging.generateRoutes();
	};

	msg.pushServicesRoutes = () => {
		return {
			subscribe: `${CMS.adminLocation}/push-setup/subscribe`,
			unsubscribe: `${CMS.adminLocation}/push-setup/unsubscribe`
		}
	};

	msg.startPushServices = () => {
		const findPushUsers = {
			search: {'pushSubscription': {$exists: true}}
		}

		if (CMS.config.vapidPublicKey && CMS.config.vapidPrivateKey) {
			CMS.getUsers(findPushUsers).then((pushUsers) => {
				for (var i = 0; i < pushUsers.users.length; i++) {
					CMS.pushSubscribers.push(pushUsers.users[i].pushSubscription);
				}
				CMS.pushServicesStarted = true;

			});
			webpush.setVapidDetails(
				`mailto:${CMS.config.adminEmail}`,
				CMS.config.vapidPublicKey,
				CMS.config.vapidPrivateKey
			);

			msg.generateSystemAlert({
				title: 'Push Services Enabled',
				message: 'Push services have been enabled. Users can now subscribe on their profile page.',
				type: 'success'
			});
		} else {
			msg.generateSystemAlert({
				title: 'Push Services Not Started!',
				message: 'Could not find Vapid Keys in your config file. Please generate those before enabling push notifications.',
				type: 'warning',
			});
			msg.stopPushServices();
		}
	};

	msg.stopPushServices = () => {
		CMS.pushServicesStarted = false;
	};

	msg.generateVapid = (done) => {
		// This should only be ran ONCE!
		// Rerunning this will replace you vapid keys,
		// and all subscribers will have to resubscribe again.
		const vapidKeys = webpush.generateVAPIDKeys();
		const toConfig = {
			vapidPublicKey: vapidKeys.publicKey,
			vapidPrivateKey: vapidKeys.privateKey
		}
		CMS.writeConfig(toConfig).then((result) => {

			// If a function is available, send back the vapidKeys
			if (typeof done === 'function') {
				done(vapidKeys);
			}
		})
	};

	msg.setVapidKeys = () => {

	};

	msg.generateRoutes = () => {
		// Create the subscribe route
		CMS.createRoute({
			type: 'post',
			url: msg.pushServicesRoutes().subscribe,
			auth: true,
			function: () => {
				const endpoint = CMS.req.body['notificationEndPoint'];
				const publicKey = CMS.req.body['publicKey'];
				const auth = CMS.req.body['auth'];
				const userId = CMS.req.body['userId'];

				let pushSubscription = {
					endpoint: endpoint,
					keys: {
						p256dh: publicKey,
						auth: auth
					}
				};
				CMS.updateUser(userId, {pushSubscription}).then(() => {
					CMS.pushSubscribers.push(pushSubscription);
					CMS.sendResponse(CMS.res, 200, 'Subscription accepted!');
				})
			}
		});

		// Create the unsubscribe route
		CMS.createRoute({
			type: 'post',
			url: msg.pushServicesRoutes().unsubscribe,
			auth: true,
			function: () => {
				let pushSubscription = {};
				const userId = CMS.req.body['userId'];
				CMS.updateUser(userId, {pushSubscription}).then(() => {
					let endpoint = CMS.req.body['notificationEndPoint'];
					subscribers = CMS.pushSubscribers.filter(subscriber => { endpoint == subscriber.endpoint });
					CMS.sendResponse(CMS.res, 200, 'Subscription removed!');
				})
			}
		});

		// Create the enable/disable route
		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/push-setup/toggle`,
			auth: true,
			function: () => {
				const pushStatus = CMS.req.body.pushEnabled;
				let setTo;

				if (/false/.test(pushStatus)) {
					setTo = true;
				} else {
					setTo = false;
				}
				CMS.writeConfig({pushEnabled: setTo}).then((result) => {
					CMS.sendResponse(CMS.res, 200, `${setTo}`);
				})
			}
		});

	}

	msg.sendPush = (pushDetails, user) => {
		const message = pushDetails.message;
		const clickTarget = pushDetails.clickTarget;
		const title = pushDetails.title;

		CMS.pushSubscribers.forEach(pushSubscription => {
			//Can be anything you want. No specific structure necessary.
			let payload = JSON.stringify({message : message, clickTarget: clickTarget, title: title});

			webpush.sendNotification(pushSubscription, payload).then((response) => {

			}).catch((error) =>{
				console.log('push notif failed');
				console.log("Status : "+error.statusCode);
				console.log("Headers : "+JSON.stringify(error.headers));
				console.log("Body : "+JSON.stringify(error.body));
			});
		});
	}

	msg.createMessage = (message, push, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		let newMessage = {
			pass : CMS.hash(userData.password),
			email : userData.email,
			username: userData.username,
			displayname: userData.displayname,
			displaytype: userData.displaytype,
			accounttype: userData.role
		};

		CMS.dbSave(db, collection, newMessage, (err, result) => {
			if (err) {
				done('Error creating new user');
			}

			done(err, result);
		});
	};

	msg.sendMessage = (msgDetails, done) => {
		const messageSchema = {
			userId: '',
			msgTitle: '',
			userId: '',
			userId: '',
			userId: '',
			userId: '',
			immediatePush: false,
		}

		CMS._messaging.createMessage(messageSchema, push, (err, result) => {});
	};

	msg.getMessage = (msgId, done) => {

	}

	msg.getUserMessages = (userId, done) => {

	}

	msg.updateMessage = (msgId, data, done) => {

	}

	msg.generateSystemAlert = (msgDetails, done) => {

		const timestamp = +new Date();

		msgDetails.timestamp = timestamp

		if (!msgDetails.tag) {
			msgDetails.tag = timestamp
		}

		if (CMS.systemMessages.length > 0) {
			const msgExists = Utils().arrayContainsByProp(CMS.systemMessages, 'tag', msgDetails.tag, true);
			if (msgExists) {
				CMS.systemMessages[msgExists] = msgDetails
			} else {

				CMS.systemMessages.push(msgDetails);
			}
		} else {
			CMS.systemMessages.push(msgDetails);
		}

		if (typeof done === 'function') {
			done('saved');
		}

	};

	msg.getSystemMessages = (msgDetails, done) => {

	};

	return msg;
}
