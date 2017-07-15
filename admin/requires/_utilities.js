const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const bcrypt   = require('bcrypt-nodejs');
const _ = require('lodash');
const request = require('request');
module.exports = (CMS, APP) => {


	let utilities = {};

	utilities.deleteTrashed = () => {

		const findPosts = {
			status: 'trash',
			limit: 100
		}

		CMS.Promise.join(CMS.getPosts(findPosts), (posts) => {
			return {posts: posts};
		})
		.then((posts) => {
			const postsLoop = posts.posts.posts;
			let timestamp;

			for (var i = postsLoop.length - 1; i >= 0; i--) {
				const postStatus = postsLoop[i].status;
				const postTimestamp = postsLoop[i].timestamp;
				const postUpdatedTimestamp = postsLoop[i].updatedTimestamp;

				if (postUpdatedTimestamp) {
					timestamp = postUpdatedTimestamp;
				} else {
					timestamp = postTimestamp;
				}

				const deleteAfterCalc = (timestamp + CMS.config.deleteAfter);
				const deleteInt = (+new Date() - deleteAfterCalc) / 1000;

				if (deleteInt > CMS.config.deleteAfter && postStatus === 'trashed') {
					CMS.deletePost(postsLoop[i]._id);
					CMS.deleteRevision(postsLoop[i]._id);
				}
			}
		})
		.catch((e) => {
			console.log('test');
			console.log('error: ' + e);
		});
	}

	utilities.setQueryVars = (vars) => {
		if (_.isEmpty(vars)) {
			CMS.passToRender.queryVarString = '';
			CMS.passToRender.queryVars = {};
			return;
		}

		let query = [];

		for (var v in vars) {
			if (vars.hasOwnProperty(v)) {

				query.push(`${encodeURIComponent(v)}=${encodeURIComponent(vars[v])}`);
			}
		}

		const string = query.join("&");

		CMS.passToRender.queryVarString = `${string}`;
		CMS.passToRender.queryVars = vars;
	};

	utilities.getConfig = (type, done) => {
		let config;
		switch(type) {
			case 'main' :
				config = require(CMS.configLocation);
			break;

			case 'active-theme' :
				config = require(path.join(CMS.activeTheme.path, 'theme.json'));
			break;
		}

		done(null, config);
	};

	utilities.writeConfig = (toWrite, done) => {
		CMS.getConfig('main').then((configData) => {
			Object.assign(configData, toWrite);
			let string = JSON.stringify(configData, null, '\t');
			fs.writeFile(CMS.configLocation, string, (err) => {
				if (err) {
					return done(err);
				}

				done(null, 'complete');
			});
		});
	};

	utilities.testDbConnection = (testUrl, testCollection, done) => {
		const db = mongojs(testUrl, [testCollection]);

		db.on('error', function(err) {});

		db[testCollection].findOne({}, (err, post) => {
			if (err) {
				done(err.message);
				return;
			}
			done(null, 'tets');
		});
	};

	utilities.hash = (string) => {

		let hash = bcrypt.hashSync(string);

		return hash;

	};

	utilities.isLoggedIn = (req, res, next) => {

		if (req.isAuthenticated()){
			CMS.currentUser = req.user;
			CMS.Promise.join(CMS.rolesAndCaps.currentUserCaps(CMS.currentUser.accounttype), (caps) => {
				_.extend(CMS.currentUser, {caps: caps});
				next();
			})
			.catch((e) => {
				CMS.errorHandler(e, res);
			});

		}
		else{
			res.redirect('/' + CMS.adminLocation + '/login')
		}
	};

	utilities.passThroughUrl = (url, req, res) => {
		const okay = [
			'/' + CMS.adminLocation,
			'/gistjs-assets'
		];

		if (!CMS.config.anyoneRegister) {
			okay.push('/register');
		}

		const deny = [];

		for (let i = deny.length - 1; i >= 0; i--) {
			if (url.indexOf(deny[i]) >= 0) {
				return false;
			}
		}

		for (let i = okay.length - 1; i >= 0; i--) {
			if (url.indexOf(okay[i]) >= 0) {
				return true;
			}
		}

		return false;
	};

	utilities.installRouting = (requestUrl) => {
		if (fs.existsSync(`${CMS.adminDir}/.install`)) {
			if (CMS.req.method === 'GET') {
				if (requestUrl !== '/install') {
					CMS.res.redirect('/install');
					return;
				}

				if (requestUrl === '/install') {
					CMS.renderInstallTemplate();
					return;
				}
			}

			if (requestUrl === `/${CMS.adminLocation}/api/install` && req.method === 'POST') {
				return false;
			}

		} else {
			return false;
		}


	}

	utilities.sendResponse = (res, status, response, done) => {

		if(typeof response === 'object'){
			response = JSON.stringify(response);
		}

		res.status(status);
		res.write(response);
		res.end();

		return;

		if (typeof done === 'function') {
			done();
		}
		return;

	};

	utilities.error = (res, statusCode, msg) => {

		if (typeof CMS.activeTheme === 'undefined') {
			CMS.sendResponse(res, statusCode, msg || 'error');
			return;
		}

		let themePath = CMS.activeTheme.path;
		let renderPath = themePath + '/' + statusCode + '.ejs';

		if (fs.existsSync(renderPath)) {
			let templateData = {
				template: statusCode,
				statusCode: 404
			}
			CMS.renderTemplate( templateData);
			return;
		} else {
			CMS.sendResponse(CMS.res, statusCode, msg || 'error');
		}

	};

	utilities.errorHandler = (error, res) => {
		switch (error.type) {
			case 'postnotfound':
				CMS.renderAdminTemplate('error', {type: 'postnotfound'});
				return;
			break;

			case 'pagenotfound':
				CMS.renderAdminTemplate('error', {type: 'pagenotfound'}, undefined, 404);
				return;
			break;

			case 'invalidtemplatejson' :
				CMS.renderAdminTemplate('error', {type: 'invalidtemplatejson'}, undefined, 404);
				return;
			break;
		};
	};

	utilities.themeFunctionFile = () => {
		const functionsFile = path.join(CMS.activeTheme.path, 'functions.js')

		if (fs.existsSync(functionsFile)) {
			let functions = require(functionsFile);
			functions(CMS, APP).init();
		}
	};

	utilities.addPostStatus = (newStatus) => {
		CMS.statusTypes = _.merge(CMS.statusTypes, newStatus);
	};

	utilities.addAdminNavigation = (navObject, position, navItemName) => {
		let currentNav = CMS.navigation;
		navObject.navItemName = navItemName;

		// remove any plugin
		for (var i = currentNav.length - 1; i >= 0; i--) {
			if (currentNav[i].navItemName === navItemName) {
				currentNav.splice(i, 1);
			}
		}
		currentNav.splice(position, 0, navObject);
	};

	utilities.getTemplates = () => {
		let themes = fs.readdirSync(CMS.themeDir);
		let templateNames = [];

		for (let i = themes.length - 1; i >= 0; i--) {
			if (themes[i] === '.DS_Store') {
				continue;
			}
			let themeFolder = themes[i];
			let themePath = path.join(CMS.themeDir, themeFolder);
			let themeJson = themePath + '/theme.json';
			let themeInfo = JSON.parse(fs.readFileSync(themeJson, 'utf-8'));

			if (themeInfo.active === true) {
				let templates = fs.readdirSync(themePath);
				for (let i = templates.length - 1; i >= 0; i--) {

					let templateLocation = `${themePath}/${templates[i]}`;

					let templateInfo = {location:templateLocation, filename: templates[i]};

					if (templates[i].indexOf('.ejs') >= 0) {
						let data = fs.readFileSync(templateLocation, 'utf-8');
						let temp = data.split('#!');
						let templateJson = temp[0].trim();

						if (utilities.templateJsonValidate(templateJson)) {

							if (temp.length >= 2) {
								let templateData = JSON.parse(temp[0].trim());
								if (typeof templateData.template !== 'undefined') {
									templateInfo.name = templateData.template;
								}
							} else {
								templateInfo.name = templates[i].replace('.ejs', '');
							}

							templateNames.push(templateInfo);
						} else {
							if (!CMS.passToRender.invalidTemplateJson) {
								CMS.passToRender.invalidTemplateJson = [];
							}
							console.log(templateLocation);
							CMS.passToRender.invalidTemplateJson[i] = templateLocation;
						}

					}

				}

			}
		}
		return templateNames;
	};

	utilities.createRoute = (routerData) => {
		routerData.url = APP.sanitizeUrl(routerData.url);
		CMS.addedRoutes.push(routerData);
	}

	utilities.deleteRoute = (routerUrl) => {
		routerUrl = APP.sanitizeUrl(routerUrl);
		CMS.deletedRoutes.push(routerUrl);
	}

	utilities.addPostTypeColumn = (postType, columnName, postAttribute, callback) => {
		if (!CMS.postTypeColumns) {
			CMS.postTypeColumns = [];
		}
		CMS.postTypeColumns.push({postAttribute, postType, columnName, callback});
	}

	utilities.templateJsonValidate = (json) => {
		try {
	        JSON.parse(json);
	        return true;
	    } catch (e) {
	        return false;
	    }
	};

	utilities.request = (url, type, done) => {
		// So we can leave out the type,
		// and have it default to 'get'
		if (typeof type === 'function') {
			done = type;
			type = 'get';
		}

		request[type](url, function (error, response, body) {
		  	if (error) {
				done(error);
			}

			done(null, {response, body})
		});
	};

	utilities.serialize = (obj, prefix) => {
		let str = [], p;
		for (p in obj) {
			if (obj.hasOwnProperty(p)) {
				let k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
				str.push((v !== null && typeof v === "object") ?
				serialize(v, k) :
				encodeURIComponent(k) + "=" + encodeURIComponent(v));
			}
		}
		return str.join("&");
	};

	utilities.addAdminScript = (scriptObj) => {

		// TODO: Add array positioning from scriptObj.position

		// Usage:
		/*
		CMS._utilities.addAdminScript({name: 'bootstrap', src: 'core/libraries/bootstrap.min.js', type: 'core', page: 'edit', position: 4})
		*/

		if (!utilities.isUrlAbsolute(scriptObj.src)) {
			let path = '';
			if (scriptObj.type === 'theme') {
				path = '/themes'
			}

			if (scriptObj.type === 'plugin') {
				path = '/plugins'
			}

			if (scriptObj.type === 'core') {
				path = '/gistjs-assets/js'
			}

			scriptObj.src = `${path}${APP.sanitizeUrl(scriptObj.src)}`
		}

		let script = {
			scriptName: scriptObj.name,
			scriptSrc: scriptObj.src,
			scriptPage: scriptObj.page || false
		}

		CMS.adminScripts.push(script);

	};

	utilities.removeAdminScript = (scriptObj) => {
		// Usage:
		/*
		by name:
		CMS._utilities.removeAdminScript({name: 'bootstrap', page: 'edit',})

		or

		by src:
		when using src, the value must be the entire src string,
		CMS._utilities.removeAdminScript({src: 'core/libraries/bootstrap.min.js', page: 'edit',})
		*/
		let remove;
		let value;
		if (scriptObj.name) {
			remove = 'scriptName'
			value = scriptObj.name
		} else if (scriptObj.src) {
			remove = 'scriptSrc'
			value = scriptObj.src
		} else {
			console.error('no script name or src provided');
			return;
		}

		if (!CMS.adminScripts.removeScript) {
			CMS.adminScripts.removeScript = [];
		}

		let removeScript = {
			removeBy: remove,
			attribute: value
		};

		if (scriptObj.page) {
			removeScript.page = scriptObj.page
		}

		CMS.adminScripts.removeScript.push(removeScript)
	};

	utilities.addFrontScript = (name, src, deps, ver, footer) => {

	};

	utilities.isUrlAbsolute = (url) => {
		return url.indexOf('://') > 0 || url.indexOf('//') === 0;
	};

	utilities.sanitizedCmsInfo = () => {
		const toSanitize = ['dbHost', 'dbUsername', 'dbPassword', 'dbPort', 'dbName', 'dbData', 'dbAccounts', 'dbSessions', 'dbSessions', 'sessionCookieSecret', 'vapidPrivateKey'];
		let sanitized = _.omit(CMS.config, toSanitize);

		return sanitized;
	};

	return utilities;
}
