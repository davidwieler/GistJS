const fs = require('fs');
const path = require('path');
const Events = require('./events.js');
const request = require('request');
const _ = require('lodash');
const hat = require('hat');
module.exports = (CMS, router, passport, settings) => {

	router.get(`${CMS.adminLocation}/install`, (req, res) => {
		if (settings.install) {
			CMS.renderAdminTemplate('install', { message: req.flash('installMessage')});
		} else {
			CMS.renderAdminTemplate('login', {message: 'Install has already been complete. Please login to administer your site.'});
		}
	});

	router.post(`/install`, (req, res, next) => {
		if (!settings.install) {
			CMS.sendResponse(res, 401, 'only available during install');
			return;
		}
		const type = req.body.type;

		switch (type) {
			case 'testdb' :
				const testUrl = req.body.url;
				const testCollection = req.body.collection;

				CMS.testDbConnection(testUrl, testCollection, (err, result) => {
					if (err) {
						CMS.sendResponse(res, 200, err);
						return;
					}

					CMS.sendResponse(res, 200, 'connected');

				});
			break;

			case 'configs' :

				const config = {
					name: req.body.data.siteName.value,
					url: req.body.data.siteUrl.value,
					adminEmail: req.body.data.email.value,
					adminLocation: req.body.data.adminLocation.value,
					cmsLocation: req.body.data.siteLocation.value,
					dbHost: req.body.data.dbHost.value,
					dbUsername: req.body.data.dbUsername.value,
					dbPassword: req.body.data.dbPassword.value,
					dbName: req.body.data.dbName.value,
					dbPort: req.body.data.dbPort.value,
					dbData: req.body.data.dbCollectionData.value,
					dbAccounts: req.body.data.dbCollectionAccounts.value,
					dbSessions: req.body.data.dbCollectionSessions.value,
					sessionCookieSecret: hat(),
					sessionCookieName: 'testit',
				}

				CMS.writeConfig(config, (err, result) => {
					if (err) {
						CMS.sendResponse(res, 200, err.message);
					} else {
						CMS.sendResponse(res, 200, 'success');
					}
				});
			break;

			case 'user' :

				// Config files written, so init the CMS with settings to
				// open a database connection

				CMS.init(settings);

				req.body.username = req.body.data.username.value;
				req.body.password = req.body.data.password.value;
				req.body.email = req.body.data.email.value;

				require('./passport.js')(passport, CMS);
				passport.authenticate('local-install', function(err, install, info) {
					if (err) {
						CMS.sendResponse(res, 200, err.message);
						return;
					}

					if (!install) {
						CMS.sendResponse(res, 200, info);
						return;
					}

					// Reinitialize the CMS with all the new data
					CMS.init(settings);
					CMS.sendResponse(res, 200, 'success');

					setTimeout(() => {
						var events = Events();
						events.restartServer();
					}, 1500);

				})(req, res, next);
			break;
		}
	});

	CMS.addedRoutes.forEach(function(route) {

		let middleware = [];

		if (route.auth) {
			middleware.push(CMS.isLoggedIn)
		}

		if (route.apiAuth) {
			middleware.push(CMS._utilities.authApi)
		}

		router[route.type](route.url, middleware, (req, res, next) => {
			if (typeof route.function === 'function') {
				if (route.type === 'post') {}
				route.function(req, res, next);
			}
		})

		const subdomains = CMS.config.subdomains;

		for (var i = 0; i < subdomains.length; i++) {

			if (route.networkAdmin) {
				continue;
			}

			let subLocation;

			for (var sub in subdomains[i]) {
				if (subdomains[i].hasOwnProperty(sub)) {
					subLocation = sub
				}
			}

			const routeUrl = route.url;
			const defaultAdminLocation = CMS.adminLocation;
			const subdomainAdminLocation = subLocation

			let newRouteUrl;

			if (typeof routeUrl === 'object') {
				newRouteUrl = routeUrl.map((i) => {
					return String(i).replace(defaultAdminLocation, subdomainAdminLocation)
				})
			} else {
				newRouteUrl = String(routeUrl).replace(defaultAdminLocation, subdomainAdminLocation)
			}

			router[route.type](newRouteUrl, middleware, (req, res, next) => {
				if (typeof route.function === 'function') {
					if (route.type === 'post') {}
					route.function(req, res, next);
				}
			})
		}
	});

	// If not routes are found at all, send the user to the Error 404 template.
	// (templates/error.ejs)
	router.get(`/${CMS.adminLocation}/*`, CMS._utilities.isLoggedIn, (req, res) => {
		let msg = req.query.msg;
		CMS.errorHandler({type: 'pagenotfound'}, res);
	});

	return router;
}
