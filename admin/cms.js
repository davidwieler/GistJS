const mongojs = require('mongojs');
const db = require('./db.js');
const path = require('path');
const Utils = require('./utils.js');
const Promise = require('bluebird');
const _ = require('lodash');
const APP = require('./assets/js/core/app.js');
const async = require('async');
(() => {

	CMS = {
		init: (settings, router, passport) => {
			CMS.adminDir = __dirname;

			if (settings.multiSite) {
				CMS.multiSite = true;
			}

			try{
				if (!settings.configLocation) {
					CMS.configLocation = `${CMS.adminDir}/config.json`;
				} else {
					CMS.configLocation = settings.configLocation;
				}
				CMS.config = require(CMS.configLocation);
			}
			catch(e){
				console.log(e.message);
				CMS.config = {};
			}

			CMS._utilities = require('./requires/_utilities.js')(CMS, APP);
			CMS._security = require('./requires/_security.js')(CMS, APP);
			CMS._render = require('./requires/_render.js')(CMS, APP);

			CMS.navigation = require('./navigation.js');
			CMS.passport = passport;
			CMS.addedRoutes = [];
			CMS.deletedRoutes = [];
			CMS.pushServicesStarted = false;
			CMS.passToRender = {};
			CMS.themes = [];
			CMS.metaBoxes = [];
			CMS.dashboardWidgets = [];
			CMS.systemMessages = [];
			CMS.pushSubscribers = [];
			CMS.cronJobs = {};
			CMS.apiRequestRoutes = {};
			CMS.adminScripts = {
				header: [],
				footer: []
			};
			CMS.adminTemplateVars = {
				header: [],
				footer: []
			};
			CMS.adminStylesheets = {
				header: [],
				footer: []
			};
			CMS.forceSSL = CMS._security.forceSSL(settings.forceSSL);
			CMS.forceApiSSL = CMS._security.forceApiSSL(settings.forceApiSSL);
			CMS.apiAuthType = 'apikey';
			CMS.testDbConnection = CMS._utilities.testDbConnection;
			CMS.setQueryVars = CMS._utilities.setQueryVars;
			CMS.renderInstallTemplate = CMS._render.renderInstallTemplate;
			CMS.sendResponse = CMS._utilities.sendResponse;
			CMS.getConfig = Promise.promisify( CMS._utilities.getConfig );
			CMS.writeConfig = Promise.promisify( CMS._utilities.writeConfig );
			CMS.passThroughUrl = CMS._utilities.passThroughUrl;
			CMS.error = CMS._utilities.error;
			CMS.mainRender = Promise.promisify( CMS._render._mainRender );


			if (typeof CMS.config.dbHost === 'undefined') {
				return;
			}
			if (CMS.config.dbUsername && CMS.config.dbPassword) {
				dbConnectionUrl = `${CMS.config.dbUsername}:${CMS.config.dbPassword}@${CMS.config.dbHost}:${CMS.config.dbPort}/${CMS.config.dbName}`;
			} else {
				dbConnectionUrl = `${CMS.config.dbHost}:${CMS.config.dbPort}/${CMS.config.dbName}`;
			}

			CMS.dbConn = {
				data: {
					url: dbConnectionUrl,
					collection: CMS.config.dbData
				},
				accounts: {
					url: dbConnectionUrl,
					collection: CMS.config.dbAccounts
				},
				sessions: {
					url: dbConnectionUrl,
					collection: CMS.config.dbSessions
				},

			};

			CMS.statusTypes = {
				published: 'Published',
				draft: 'Draft',
				trash: 'Trash',
				private: 'Private'
			}

			CMS.postTypes = {
				attachment: {
					slug: 'Posts',
					url: 'posts',
					icon: 'icon-stack',
					priviledge: 'read',
					contentType: 'post',
					navItemName: 'posts'
				}
			}

			// Define the database details.
			CMS.dbData = db(mongojs, CMS.dbConn).dataInit();
			CMS.dbAccounts = db(mongojs, CMS.dbConn).accountInit();
			CMS.dbUpdate = Promise.promisify( db(mongojs, CMS.dbConn).update );
			CMS.dbUpsert = Promise.promisify( db(mongojs, CMS.dbConn).upsert );
			CMS.dbSave = Promise.promisify( db(mongojs, CMS.dbConn).save );
			CMS.dbInsert = Promise.promisify( db(mongojs, CMS.dbConn).insert );
			CMS.dbFind = Promise.promisify( db(mongojs, CMS.dbConn).find );
			CMS.dbFindOne = Promise.promisify( db(mongojs, CMS.dbConn).findOne );
			CMS.dbDelete = Promise.promisify( db(mongojs, CMS.dbConn).delete );
			CMS.dbSort = db().sortResults

			CMS.adminLocation = CMS.config.adminLocation;
			CMS.themeDir = settings.themeDir;
			CMS.pluginDir = settings.pluginDir;
			CMS.uploadDir = settings.uploadDir;
			CMS.hooks = CMS.defineHooks();


			// Requires
			CMS._content = require('./requires/_content.js')(CMS, APP);
			CMS._thumbnails = require('./requires/_thumbnails.js')(CMS, APP);
			CMS._categories = require('./requires/_categories.js')(CMS, APP);
			CMS._tags = require('./requires/_tags.js')(CMS, APP);
			CMS._revisions = require('./requires/_revisions.js')(CMS, APP);
			CMS._attachments = require('./requires/_attachments.js')(CMS, APP);
			CMS._users = require('./requires/_users.js')(CMS, APP);

			CMS._themes = require('./requires/_themes.js')(CMS, APP);
			CMS._plugins = require('./requires/_plugins.js')(CMS, APP);
			CMS._roles = require('./requires/_roles.js')(CMS, APP);
			CMS._messaging = require('./requires/_messaging.js')(CMS, APP);
			CMS._logger = require('./requires/_logger.js')(CMS, APP);
			CMS._crons = require('./requires/_crons.js')(CMS, APP);
			CMS._initialFunctions = require('./requires/_init-functions.js')(CMS, APP);

			// Promises
			CMS.Promise = Promise;

			// -- Content --
			CMS.createContent = Promise.promisify( CMS._content.createContent );
			CMS.getPostById = Promise.promisify( CMS._content.getPostById );
			CMS.getPost = Promise.promisify( CMS._content.getPost );
			CMS.getPosts = Promise.promisify( CMS._content.getPosts );
			CMS.updatePost = Promise.promisify( CMS._content.updatePost );
			CMS.deletePost = Promise.promisify( CMS._content.deletePost );
			CMS.doHook = Promise.promisify( CMS.doHook );
			CMS.addMetaBox = CMS._content.addMetaBox;

			// -- Thumbnails --
			CMS.generateThumbnail = Promise.promisify( CMS._thumbnails.generateThumbnail );

			// -- Revisions --
			CMS.createRevision = Promise.promisify( CMS._revisions.createRevision );
			CMS.getRevisions = Promise.promisify( CMS._revisions.getRevisions );
			CMS.getRevisionById = Promise.promisify( CMS._revisions.getRevisionById  );
			CMS.deleteRevision = Promise.promisify( CMS._revisions.deleteRevision );

			// -- Utilities --

			CMS.request = Promise.promisify( CMS._utilities.request );


			CMS.isLoggedIn = CMS._utilities.isLoggedIn;
			CMS.hash = CMS._utilities.hash;
			CMS.testDbConnection = CMS._utilities.testDbConnection;
			CMS.errorHandler = CMS._utilities.errorHandler;
			CMS.getTemplates = CMS._utilities.getTemplates;
			CMS.addAdminNavigation = CMS._utilities.addAdminNavigation;
			CMS.setQueryVars = CMS._utilities.setQueryVars;
			CMS.createRoute = CMS._utilities.createRoute;
			CMS.deleteRoute = CMS._utilities.deleteRoute;

			// -- Attachments --
			CMS.getAttachmentById = Promise.promisify( CMS._attachments.getAttachmentById );
			CMS.getAttachments = Promise.promisify( CMS._attachments.getAttachments );
			CMS.deleteAttachment = Promise.promisify( CMS._attachments.deleteAttachment );

			// -- Categories --
			CMS.createCategory = Promise.promisify( CMS._categories.createCategory );
			CMS.getCategories = Promise.promisify( CMS._categories.getCategories );
			CMS.deleteCategories = Promise.promisify( CMS._categories.deleteCategories );

			// -- Tags --
			CMS.createTag = Promise.promisify( CMS._tags.createTag );
			CMS.getTags = Promise.promisify( CMS._tags.getTags );
			CMS.deleteTags = Promise.promisify( CMS._tags.deleteTags );

			// -- Users --
			CMS.getUsers = Promise.promisify( CMS._users.getUsers );
			CMS.getUser = Promise.promisify( CMS._users.getUser );
			CMS.createUser = Promise.promisify( CMS._users.createUser );
			CMS.updateUser = Promise.promisify( CMS._users.updateUser );

			// -- Rendering --
			CMS.renderTemplate = Promise.promisify( CMS._render.renderTemplate);
			CMS.renderPluginTemplate = CMS._render.renderPluginTemplate;

			CMS.renderAdminTemplate = CMS._render.renderAdminTemplate;
			CMS.renderMetaBox = CMS._render.metaBox;

			// -- Themes --
			CMS._themes.initThemes();
			CMS.themeSwitch = Promise.promisify( CMS._themes.themeSwitch );

			// -- Plugins --
			CMS._plugins.initPlugins();
			CMS.addPluginRoute = Promise.promisify( CMS._plugins.addPluginRoute );
			const adminPlugins = CMS.activePlugins.admin;

			// -- Roles --
			CMS.rolesAndCaps = Promise.promisifyAll( CMS._roles );

			// -- Messaging --
			CMS._messaging.init();

			// -- Security --
			CMS.security = CMS._security.init();

			// -- Logging --
			// CMS.log = CMS._logger;
			// CMS.log.init();

			// Initialize the included functions and content
			CMS._initialFunctions.init();

			////// TESTING FUNCTIONS/////

			//CMS._categories.createCategory({name: 'D@*AS AS '})
			////////////////////////////

			CMS.rolesAndCaps.initRoles();
			CMS.enableUserRegistration = () => {
				CMS.createRoute({
					type: 'get',
					url: 'register',
					auth: false,
					function: () => {
						CMS.renderAdminTemplate('registration', { message: ''});
					}
				});
			};

			// run active admin panel plugins
			for (var i = adminPlugins.length - 1; i >= 0; i--) {

				let requirePath = path.join(adminPlugins[i].pluginPath, adminPlugins[i].pluginInfo.require);
				let thisPlugin = require(requirePath);
				thisPlugin(CMS, APP).init();

			}

			// Create initial postTypes
			const posts = {
				slug: 'Posts',
				url: 'posts',
				icon: 'icon-stack',
				priviledge: 'read',
				contentType: 'post'
			}
			const pages = {
				slug: 'Pages',
				url: 'pages',
				icon: 'icon-stack',
				priviledge: 'read',
				contentType: 'page'
			}
			CMS._content.addPostType(posts, 2, 'posts');
			CMS._content.addPostType(pages, 3, 'pages');



		},

		checkForUpdates: () => {

		},

		defineHooks: () => {
			let hooks = {
				dashboard: {},
				edit: {}
			};

			return hooks;
		},

		addHook: (name, location, position, func) => {
			let hooks = CMS.hooks;

			if (typeof hooks[location] === 'undefined') {
				hooks[location] = {};
			}
			hooks[location][name] = func
		},

		doHook: (location, done) => {
			const doTheseHooks = CMS.hooks[location];
			const doAllHooks = CMS.hooks['all'];
			let returns = {};
			let promises = [];

			for(var h in doTheseHooks){
				if (doTheseHooks.hasOwnProperty(h)){
					promises.push({slug: APP.textToSlug(h), func: doTheseHooks[h]});
				}
			}

			for(var h in doAllHooks){
				if (doAllHooks.hasOwnProperty(h)){
					promises.push({slug: APP.textToSlug(h), func: doAllHooks[h]});
				}
			}

			async.forEachOf(promises, (value, key, callback) => {

				if (typeof value.func === 'string') {
					returns[value.slug] = value.func;
					callback();
				}

				if (typeof value.func === 'function') {
					value.func((results) => {
						returns[value.slug] = results;
						callback();
					});
				}
			}, (err) => {
				if (err) {
					done(err);
				}
				done(null, returns);
			});
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
