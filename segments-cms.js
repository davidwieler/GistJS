module.exports = (settings, app) => {

	// Setting up the CMS.
	const express = require('express');
	const router = express.Router();
	const bodyParser = require('body-parser');
	const routerAdditions = [];
	const passport = require('passport');
	const helmet = require('helmet');
	const cookieParser = require('cookie-parser');
	const session = require('express-session');
	const MongoStore = require('connect-mongo')(session)
	const flash = require('connect-flash');
	const fs = require('fs');
	const path = require('path');
	const mongojs = require('mongojs');
	const cmsConfig = require('./admin/cms.js');

	app.use('/assets',  express.static( path.join(__dirname, 'admin/assets') ));
	app.use('/uploads', express.static( settings.uploadDir ));
	app.use('/plugins', express.static( settings.pluginDir ));
	app.use('/themes',  express.static( settings.themeDir ));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));

	CMS.init(settings);

	// Initialize PassportJS for login
	require('./admin/passport')(passport, CMS);

	// Initialize session store via MongoStore
    const dbSessionsConf = {
        db: {
            url: 'mongodb://' + CMS.dbConn.sessions.url,
            stringify: false
        },
        secret: 'storethesegmentsessions',
        sameSite: true,
        cookieName: 'chooseacookiename',
        cookieLength: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)) // NEED TO ADD A WAY TO SET THE LOGIN COOKIE LENGTH
    };

	const sessionOpts = {
	    saveUninitialized: false,
	    resave: false,
	    store: new MongoStore(dbSessionsConf.db),
	    secret: dbSessionsConf.secret,
	    name: dbSessionsConf.cookieName,
	    cookie : {  httpOnly: true, secure : false, sameSite: dbSessionsConf.sameSite, maxAge : dbSessionsConf.cookieLength} //Cookie for one month
	};

	// read cookies and set up sessions (needed for auth)
	app.use(cookieParser(dbSessionsConf.secret));
	app.use(session(sessionOpts));
	app.use(passport.initialize());
	app.use(passport.session());

	router.use( (req, res, next) => {
		let requestUrl = req.url;

		if (requestUrl === '/segment-cms/api/install') {
			next();
			return;
		}

		if (requestUrl === '/install') {
			if (fs.existsSync(__dirname + '/admin/.install')) {
				CMS.renderInstallTemplate(res, 'install');
			} else {
				CMS.renderAdminTemplate(res, 'login', {message: 'Install has already been complete. Please login to administer your site.'});
			}
		} else {

			// Use Helmet by default to make the CMS more secure.
			// Disable by setting: helmet: false in the settings.
			if (settings.helmet !== false) {
				app.use(helmet({
					noSniff: false
				}));
			}

			const baseUrl = req.url;
		    const db = CMS.dbData;
		    const collection = CMS.dbConn.data.collection;
		    let paginateNumber = 0;

		    // check if .install file exists. If so, stop everything and route there.
			if (fs.existsSync(__dirname + '/admin/.install') && requestUrl !== '/' + CMS.adminLocation + '/install') {
				res.redirect('/' + CMS.adminLocation + '/install');
				return;
			}

			// May remove this later --!!!!!!!!!!!!!!!!!
			if (requestUrl === '/favicon.ico') {
				return;
			}

			// Check if the requested URL is coming from the admin panel
			if (CMS.passThroughUrl(requestUrl) === true) {

				//CMS.deleteTrashed();

				// clear plugin navigation additions
				CMS.navigation = require('./admin/navigation.js');

				let adminPlugins = CMS.activePlugins.admin;

				// run active admin panel plugins
				for (var i = adminPlugins.length - 1; i >= 0; i--) {

					let requirePath = path.join(adminPlugins[i].pluginPath, adminPlugins[i].pluginInfo.require);
					let thisPlugin = require(requirePath);
					thisPlugin(CMS, router).init();

				}

				let pluginRoutes = CMS.activePluginRoutes;

	            for (let i = pluginRoutes.length - 1; i >= 0; i--) {
	            	let routes = pluginRoutes[i].routes;

	            	for (let i = routes.length - 1; i >= 0; i--) {
		            	if (requestUrl.indexOf(routes[i].route) >= 0) {
		            		let routeInfo = pluginRoutes[i].routes[i];
		            		CMS.renderPluginTemplate(res, pluginRoutes[i], routeInfo);
		            		return;
		            	}
	            	}

	            }

				next();
				return;
			}

			// Check if maintenance mode is on
			// Enable by setting: maintenance: true in the settings.
			// The system may set this automatically some times, like during updates or heavy processes.

			if (CMS.cmsDetails.maintenance === true) {
		    	if (typeof CMS.activeTheme === 'undefined') {
		    		CMS.renderAdminTemplate(res, 'maintenance');
		    		return;
		    	}

		    	let maintenanceDoc = {
		    		template: 'maintenance',
		    		statusCode: 503
		    	}
				CMS.renderTemplate(res, maintenanceDoc);
				return;
			}

			var paginateRegEx = new RegExp('/' + CMS.cmsDetails.paginateBy + '/([0-9]+)((\/\w+)+|\/?)$');

			if (paginateRegEx.test(requestUrl)) {

				let paginate = requestUrl.split('/');
				paginate = paginate.reverse();
				let URLPath = [];

				for (var i = paginate.length - 1; i >= 0; i--) {

					if (paginate[i] !== '') {

						if (!isNaN(paginate[i])) {
							paginateNumber = paginate[i];
							continue;
						}

						if (paginate[i] === CMS.cmsDetails.paginateBy) {
							continue;
						}

					}

					URLPath.push(paginate[i]);
				}

				requestUrl = '/' + path.join.apply(null, URLPath);
			} else {
				requestUrl = req._parsedUrl.pathname;
				paginateNumber = req.query[CMS.cmsDetails.paginateBy] || 0;
			}

			// If not an admin panel request, look for valid url in db.
			db[collection].findOne({postUrl: requestUrl, status: { $ne: 'trash' }}, (err, doc) => {
				if (err) {
					if (CMS.cmsDetails.custom500 === true) {
						// Use cms based error 500 page
						CMS.error(res, 500);
						CMS.sendResponse(res, 500, 'Server Error');
						return;
					} else {
						next();
						return;
					}
				}

				if (doc === null) {

					if (CMS.cmsDetails.custom404 === true) {
						// Use cms based error 404 page
						CMS.error(res, 404, 'Page not found');
						return;
					} else {
						console.log('asdasd');
						next();
						return;
					}

				}

				doc.paginateNumber = paginateNumber;
				doc.requestUrl = requestUrl;
				doc.baseUrl = baseUrl;

				CMS.renderTemplate(res, doc);
				return;
			});
		}

	});

	/*
		----------------------------------------------
		DO NOT CHANGE OR REMOVE THE FOLLOW REQUIRE BELOW!
		These routes are what power the admin panel and the API.
		----------------------------------------------
	 */
	require('./admin/routes.js')(CMS, router, passport, settings);
	return router;

}