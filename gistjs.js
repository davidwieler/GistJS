module.exports = (settings, app) => {

	// Setting up the CMS.
	// NPM dependancies
	const express = require('express');
	const router = express.Router();
	const bodyParser = require('body-parser');
	const passport = require('passport');
	const helmet = require('helmet');
	const cookieParser = require('cookie-parser');
	const session = require('express-session');
	const MongoStore = require('connect-mongo')(session)
	const flash = require('connect-flash');
	const fs = require('fs');
	const path = require('path');
	const mongojs = require('mongojs');
	const _ = require('lodash');
	const filter = require('content-filter');

	// file includes
	const cmsConfig = require('./admin/cms.js');
	const EventEmitter = require('events').EventEmitter;
	const Events = require('./admin/events.js');
	const APP = require('./admin/assets/js/core/app.js');
	//const filter = require('./admin/requires/_content-filter.js'); TODO: finish up this module
	app.use('/',  express.static( path.join(__dirname, 'admin/assets/js/core/') ));
	app.use('/gistjs-assets',  express.static( path.join(__dirname, 'admin/assets') ));
	app.use('/uploads', express.static( settings.uploadDir ));
	app.use('/plugins', express.static( settings.pluginDir ));
	app.use('/themes',  express.static( settings.themeDir ));

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));

	const blackList = ['$','{','&&','||']
	const filterMsg = 'URL contains filter errors';
	const filterOptions = {
	    urlBlackList: blackList,
	    bodyBlackList: blackList,
		urlMessage: filterMsg,
		bodyMessage: filterMsg
	}

	app.use(filter(filterOptions));

	// Use Helmet by default to make the CMS more secure.
	// Disable by setting helmet: false in the settings.
	if (settings.helmet !== false) {

		let helmetSettings = {
			noSniff: false // This is __REQUIRED__ to render the ejs files.
		};

		_.extend(helmetSettings, settings.helmet)

		// TODO: add more settings to this, to give the user more control.....
		app.use(helmet(helmetSettings));
	}

	CMS.init(settings, router);

	if (CMS.cmsDetails.anyoneRegister) {
		CMS.enableUserRegistration();
	}

	CMS._utilities.themeFunctionFile();

	// Initialize PassportJS for login
	require('./admin/passport')(passport, CMS);

	//var events = Events();
	//events.maintenanceMode(CMS, false, (err, result) => {
		//console.log();
	//});

	if (typeof CMS.cmsDetails.dbHost !== 'undefined') {
		// Initialize session store via MongoStore
	    const dbSessionsConf = {
	        db: {
	            url: 'mongodb://' + CMS.dbConn.sessions.url,
	            stringify: false
	        },
	        secret: CMS.cmsDetails.sessionCookieSecret,
	        sameSite: true,
	        cookieName: CMS.cmsDetails.sessionCookieName,
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

		global.cms = dbSessionsConf;
	}

	router.use( (req, res, next) => {
		let requestUrl = req.url;

		CMS.setQueryVars(req.query);
		CMS.req = req;
		CMS.res = res;

		//filter(filterOptions, req, res, next)

		if (!CMS._utilities.installRouting(requestUrl) && req.method === 'POST') {
			next();
			return;
		}

		// May remove this later --!!!!!!!!!!!!!!!!!
		if (requestUrl === '/favicon.ico') {
			CMS.sendResponse(res, 204);
			return;
		}

	    let paginateNumber = 0;

		// Check if the requested URL is coming from the admin panel
		if (CMS.passThroughUrl(requestUrl, req, res)) {

			// Run the "delete trashed" function if a
			// logged in user loaders any admin pages
			if (requestUrl.indexOf(CMS.cmsDetails.adminLocation) >= 0) {
				CMS._utilities.deleteTrashed();
			}

			if (CMS.cmsDetails.localEditing === false) {
				CMS.error(res, 404, 'Page not found');
				return;
			}

			next();
			return;
		}

		// Check if maintenance mode is on
		// Enable by setting: maintenance: true in the settings.
		// The system may set this automatically some times, like during updates or heavy processes.
		if (CMS.cmsDetails.maintenance === true) {
	    	if (typeof CMS.activeTheme === 'undefined') {
	    		CMS.renderAdminTemplate('maintenance');
	    		return;
	    	}

	    	let maintenanceDoc = {
	    		template: 'maintenance',
	    		statusCode: 503
	    	}
			CMS.renderTemplate(maintenanceDoc);
			return;
		}

		console.log(`Requested URL: ${requestUrl}`);

		if (requestUrl === '/service-worker.js') {
			console.log('test');
		} else {
			// If not an admin panel request, look for valid url in db.
			CMS._render._mainRender(requestUrl);
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
