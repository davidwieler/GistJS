const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const bcrypt   = require('bcrypt-nodejs');
const _ = require('lodash');
module.exports = (CMS) => {

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

				const deleteAfterCalc = (timestamp + CMS.cmsDetails.deleteAfter);
				const deleteInt = (+new Date() - deleteAfterCalc) / 1000;

				if (deleteInt > CMS.cmsDetails.deleteAfter && postStatus === 'trashed') {
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

	utilities.getConfig = (type, done) => {
		let config;
		switch(type) {
			case 'main' :
				config = require(__dirname + '/config.json');
			break;

			case 'active-theme' :
				config = require(path.join(CMS.activeTheme.path, 'theme.json'));
			break;
		}

		done(null, config);
	};

	utilities.writeConfig = (toWrite, done) => {
		let configFile = __dirname + '/config.json';
		let config = require(configFile);
		Object.assign(config, toWrite);

		let string = JSON.stringify(config, null, '\t');

		fs.writeFile(configFile, string, (err) => {
			if (err) {
				return done(err);
			}

			done(null, 'complete');
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
		let okay = [
			'/' + CMS.adminLocation,
			'/assets'
		];

		for (let i = okay.length - 1; i >= 0; i--) {
			if (url.indexOf(okay[i]) >= 0) {
				return true;
			}
		}

		return false;
	};

	utilities.sendResponse = (res, status, response, done) => {

		if(typeof response === 'object'){
			response = JSON.stringify(response);
		}

		res.status(status);
		res.write(response);
		res.end();

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
			CMS.renderTemplate(res, templateData);
			return;
		} else {
			CMS.sendResponse(res, statusCode, msg || 'error');
		}

	};

	utilities.errorHandler = (error, res) => {
		switch (error.type) {
			case 'postnotfound':
				CMS.renderAdminTemplate(res, 'error', {type: 'postnotfound'});
				return;
			break;

			case 'pagenotfound':
				CMS.renderAdminTemplate(res, 'error', {type: 'pagenotfound'}, undefined, 404);
				return;
			break;

			case 'invalidtemplatejson' :
				CMS.renderAdminTemplate(res, 'error', {type: 'invalidtemplatejson'}, undefined, 404);
				return;
			break;
		};
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

	utilities.templateJsonValidate = (json) => {
		try {
	        JSON.parse(json);
	        return true;
	    } catch (e) {
	        return false;
	    }
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

	return utilities;
}
