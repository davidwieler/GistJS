const mongojs = require('mongojs');
const db = require('./db.js');
const path = require('path');
const Utils = require('./utils.js');
const Promise = require('bluebird');
const _ = require('lodash');

(() => {

	CMS = {
		init: (settings) => {
			CMS.cmsDetails = require(__dirname + '/config.json');
			CMS.adminDir = __dirname;

			if (typeof CMS.cmsDetails.dbHost === 'undefined') {
				return;
			}

			if (CMS.cmsDetails.dbUsername && CMS.cmsDetails.dbPassword) {
				dbConnectionUrl = `${CMS.cmsDetails.dbUsername}:${CMS.cmsDetails.dbPassword}@${CMS.cmsDetails.dbHost}:${CMS.cmsDetails.dbPort}/${CMS.cmsDetails.dbName}`;
			} else {
				dbConnectionUrl = `${CMS.cmsDetails.dbHost}:${CMS.cmsDetails.dbPort}/${CMS.cmsDetails.dbName}`;
			}

			CMS.dbConn = {
				data: {
					url: dbConnectionUrl,
					collection: CMS.cmsDetails.dbData
				},
				accounts: {
					url: dbConnectionUrl,
					collection: CMS.cmsDetails.dbAccounts
				},
				sessions: {
					url: dbConnectionUrl,
					collection: CMS.cmsDetails.dbSessions
				},

			};

			// Define the database details.
			CMS.dbData = db(mongojs, CMS.dbConn).dataInit();
			CMS.dbAccounts = db(mongojs, CMS.dbConn).accountInit();

			CMS.adminLocation = CMS.cmsDetails.adminLocation;
			CMS.themeDir = settings.themeDir;
			CMS.pluginDir = settings.pluginDir;
			CMS.uploadDir = settings.uploadDir;
			CMS.hooks = CMS.defineHooks();
			CMS.passToRender = {};
			CMS.themes = [];

			// Requires
			CMS._content = require('./requires/_content.js')(CMS);
			CMS._thumbnails = require('./requires/_thumbnails.js')(CMS);
			CMS._categories = require('./requires/_categories.js')(CMS);
			CMS._revisions = require('./requires/_revisions.js')(CMS);
			CMS._attachments = require('./requires/_attachments.js')(CMS);
			CMS._utilities = require('./requires/_utilities.js')(CMS);
			CMS._users = require('./requires/_users.js')(CMS);
			CMS._render = require('./requires/_render.js')(CMS);
			CMS._themes = require('./requires/_themes.js')(CMS);
			CMS._plugins = require('./requires/_plugins.js')(CMS);
			CMS._roles = require('./requires/_roles.js')(CMS);

			// Promises
			CMS.Promise = Promise;

			// -- Content --
			CMS.createContent = Promise.promisify( CMS._content.createContent );
			CMS.getPostById = Promise.promisify( CMS._content.getPostById );
			CMS.getPosts = Promise.promisify( CMS._content.getPosts );
			CMS.updatePost = Promise.promisify( CMS._content.updatePost );
			CMS.deletePost = Promise.promisify( CMS._content.deletePost );

			// -- Thumbnails --
			CMS.generateThumbnail = Promise.promisify( CMS._thumbnails.generateThumbnail );

			// -- Revisions --
			CMS.createRevision = Promise.promisify( CMS._revisions.createRevision );
			CMS.getRevisions = Promise.promisify( CMS._revisions.getRevisions );
			CMS.getRevisionById = Promise.promisify( CMS._revisions.getRevisionById  );
			CMS.deleteRevision = Promise.promisify( CMS._revisions.deleteRevision );

			// -- Utilities --
			CMS.getConfig = Promise.promisify( CMS._utilities.getConfig );
			CMS.writeConfig = Promise.promisify( CMS._utilities.writeConfig );
			CMS.sendResponse = CMS._utilities.sendResponse;
			CMS.passThroughUrl = CMS._utilities.passThroughUrl;
			CMS.isLoggedIn = CMS._utilities.isLoggedIn;
			CMS.hash = CMS._utilities.hash;
			CMS.testDbConnection = CMS._utilities.testDbConnection;
			CMS.error = CMS._utilities.error;
			CMS.errorHandler = CMS._utilities.errorHandler;
			CMS.getTemplates = CMS._utilities.getTemplates;

			// -- Attachments --
			CMS.getAttachment = Promise.promisify( CMS._attachments.getAttachment );
			CMS.getAttachments = Promise.promisify( CMS._attachments.getAttachments );
			CMS.deleteAttachment = Promise.promisify( CMS._attachments.deleteAttachment );

			// -- Categories --
			CMS.createCategory = Promise.promisify( CMS._categories.createCategory );
			CMS.getCategories = Promise.promisify( CMS._categories.getCategories );

			// -- Users --
			CMS.getUsers = Promise.promisify( CMS._users.getUsers );
			CMS.createUser = Promise.promisify( CMS._users.createUser );

			// -- Rendering --
			CMS.renderTemplate = CMS._render.renderTemplate;
			CMS.renderPluginTemplate = CMS._render.renderPluginTemplate;
			CMS.renderInstallTemplate = CMS._render.renderInstallTemplate;
			CMS.renderAdminTemplate = CMS._render.renderAdminTemplate;

			// -- Themes --
			CMS._themes.initThemes();
			CMS.themeSwitch = Promise.promisify( CMS._themes.themeSwitch );

			// -- Plugins --
			CMS._plugins.initPlugins();

			// -- Roles --
			CMS.rolesAndCaps = Promise.promisifyAll( CMS._roles );

			CMS.rolesAndCaps.initRoles();

		},

		checkForUpdates: () => {

		},

		defineHooks: () => {
			let hooks = {
				dashboard: {}
			};

			return hooks;
		},

		applyHook: (name, func, location) => {
			if (typeof func === 'function') {
				let hooks = CMS.hooks;
				hooks[location][name] = func
			}
		},

		doHook: (location) => {
			let doTheseHooks = CMS.hooks[location];

			for(var h in doTheseHooks){
				if (doTheseHooks.hasOwnProperty(h) && typeof doTheseHooks[h] === 'function'){
					doTheseHooks[h]();
				}
			}
		},

		addAdminNavigation: (navObject, position, navItemName) => {
			let currentNav = CMS.navigation;
			navObject.navItemName = navItemName;

			// remove any plugin
			for (var i = currentNav.length - 1; i >= 0; i--) {
				if (currentNav[i].navItemName === navItemName) {
					currentNav.splice(i, 1);
				}
			}
			currentNav.splice(position, 0, navObject);
		},

		rebuildThumbnails: (images, attachmentId, done) => {

			for (let i = images.length - 1; i >= 0; i--) {
				CMS.generateThumbnail(images[i], (result) => {
					CMS.updateAttachment(attachmentId, result);
				})
			}

		},

	    loopQuery: (data) => {

			for (let i in data) {
				if (data.hasOwnProperty(i)) {

				}
			}

	    	for (let i in data) {

		    	// Category loop query -----

		    	if (i.includes('category')) {
		    		if (_.isArray(data[i])) {
		    			data[i] = { $in: data[i] }
		    		} else {
		    			data[i] = data[i];
		    		}
		    	}

		    	if (i.includes('postMeta')) {
		    		//console.log('test poistMeta');
		    	}

	    	}

	    	return data;
	    },
	}

})();
