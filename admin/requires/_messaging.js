const webpush = require('web-push');

module.exports = (CMS, APP) => {

	let msg = {};

	msg.init = () => {
		CMS.pushSubscribers = [];
		webpush.setVapidDetails(
		    `mailto:${CMS.cmsDetails.adminEmail}`,
		    'BAjuFtdVAl-GlZZsuR3ZB1ajRJfSPnTwJ22seL0Mg2UxbucE1b3fYzHOt_DSMC2lxFMWe_pZ-ugoVNb6s2o6Nd4',
		    'a5IDMxQROXxaxbJpwvb8NRzMtCLZeYtQJGvDegixdw8'
		);
		CMS.pushSettings = {
			pushAuth: 'JGvDMxQRUaxbJpwvb8NRzMOXx22seL0MxQegixdwa5IDMg25IDROXxaxtCLZeYtQ8'
		}
		CMS._messaging.generateRoutes()
	};

	msg.generateVapid = () => {

	//	Public Key:
	//	BAjuFtdVAl-GlZZsuR3ZB1ajRJfSPnTwJ22seL0Mg2UxbucE1b3fYzHOt_DSMC2lxFMWe_pZ-ugoVNb6s2o6Nd4

	//  Private Key:
	//	a5IDMxQROXxaxbJpwvb8NRzMtCLZeYtQJGvDegixdw8
	};

	msg.setVapidKeys = () => {

	};

	msg.generateRoutes = () => {

		// Create the enable/disable route
		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/push-setup/toggle`,
			auth: true,
			function: () => {
				const pushStatus = CMS.req.body.pushEnabled;
				let setTo;

				if (pushStatus === 'false') {
					setTo = true;
				} else {
					setTo = false;
				}
				CMS.writeConfig({pushEnabled: setTo}).then((result) => {
					CMS.sendResponse(CMS.res, 200, `${setTo}`);
				})
			}
		});

		// Create the subscribe route
		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/push-setup/subscribe`,
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
			url: `${CMS.adminLocation}/push-setup/unsubscribe`,
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

	}

	msg.sendPush = (pushDetails) => {
		const message = pushDetails.message;
		const clickTarget = pushDetails.clickTarget;
		const title = pushDetails.title;

		CMS.pushSubscribers.forEach(pushSubscription => {
			//Can be anything you want. No specific structure necessary.
			let payload = JSON.stringify({message : message, clickTarget: clickTarget, title: title});
			console.log(pushSubscription);

			const options = {
			  vapidDetails: {
					subject: `mailto:${CMS.cmsDetails.adminEmail}`,
					publicKey: 'BAjuFtdVAl-GlZZsuR3ZB1ajRJfSPnTwJ22seL0Mg2UxbucE1b3fYzHOt_DSMC2lxFMWe_pZ-ugoVNb6s2o6Nd4',
					privateKey: 'a5IDMxQROXxaxbJpwvb8NRzMtCLZeYtQJGvDegixdw8'
			  },
			  TTL: 10,
			}

			webpush.sendNotification(pushSubscription, payload, options).then((response) =>{
				console.log(response);
				console.log('push notif sent');
			}).catch((error) =>{
				console.log('push notif failed');
				console.log("Status : "+error.statusCode);
				console.log("Headers : "+JSON.stringify(error.headers));
				console.log("Body : "+JSON.stringify(error.body));
			});
		});
	}

	return msg;
}
