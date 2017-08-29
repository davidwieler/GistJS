const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const ejs = require('ejs');
const async = require('async');
const _ = require('lodash');
const Promise = require('bluebird');
module.exports = (CMS, APP) => {

	let render = {};

	render.renderAdminTemplate = (template, templateData) => {

		console.log('_render.js - renderAdminTemplate template: ', template);
		console.log('_render.js - renderAdminTemplate templateData: ', templateData);

		if (!templateData) {
			templateData = {}
		}
		let options = {
        	filename: path.join(CMS.adminDir, 'templates', template + '.ejs')
        };
		let data = fs.readFileSync(options.filename, 'utf-8');
		let rendered;

        let render = {
			navigation: CMS.navigation,
        	cmsInfo: CMS._utilities.sanitizedCmsInfo(),
			currentUser: CMS._users.getCurrentUserInfo(),
        	themeInfo: CMS.activeTheme,
        	themes: CMS.themes,
        	templates: CMS.getTemplates(),
        	adminLocation: CMS.adminLocation,
        	data: templateData.data || {},
        	app: APP,
			page: template,
        	msg: templateData.msg || CMS.req.query.msg,
        	postData: {},
        	postRevisions: 0,
        	plugins: CMS.pluginDetails,
			activePlugins: CMS.activePlugins,
			adminPlugins: CMS.activePlugins.admin,
			userPlugins: CMS.activePlugins.user,
        	passedToRender: CMS.passToRender,
			statusTypes: CMS.statusTypes,
			queryVars: CMS.passToRender.queryVars,
			queryVarString: CMS.passToRender.queryVarString,
			postTypeColumns: CMS.postTypeColumns || [],
			systemMessages: CMS.systemMessages,
			gjHead: CMS._content.gjAdminHead(template),
			gjFoot: CMS._content.gjAdminFooter(template)
        };

		// Update the site details if a network subdomain is active
		if (CMS.req.subdomains) {
			render.cmsInfo = _.merge(render.cmsInfo, CMS.subdomainInfo)
		}

        if (typeof render.msg !== 'undefined') {
        	render.alert = render.msg;
        }

		if (typeof templateData.status === 'undefined') {
			status = 200
		} else {
			status = templateData.status
		}
		/*
		CMS._messaging.sendPush({
			message: 'Click this and go to settings',
			clickTarget: 'http://localhost:7637/spry-admin/settings',
			title: 'Test Message'
		});
		*/

		if (CMS.adminScripts.removeScript) {
			let newScripts = [];
			const scripts = CMS.adminScripts.removeScript;
			for (var i = 0; i < scripts.length; i++) {
				_.remove(CMS.adminScripts, function(currentObject) {
					console.log(currentObject[scripts[i].removeBy]);
					console.log(scripts[i].attribute);
				    return currentObject[scripts[i].removeBy] === scripts[i].attribute;
				});
			}
		}

		CMS.doHook(template).then((results) => {
			render.hookResults = results;

			switch (template) {
				case 'category-tag' :

					if (render.data === 'tags') {
						CMS.getTags().then((cats) => {
							render.categories = cats;
							rendered = ejs.render(data, render, options);
							CMS.sendResponse(CMS.res, status, rendered);
						});
					} else {
						CMS.getCategories().then((cats) => {
							render.categories = cats;
							rendered = ejs.render(data, render, options);
				            CMS.sendResponse(CMS.res, status, rendered);
						});
					}


				break;
	    		case 'edit' :
			        if (typeof templateData.id !== 'undefined') {
				    	const id = templateData.id.toString();

						CMS.Promise.join(CMS.getPostById(id), CMS.getCategories(), CMS.getTags(), CMS.getRevisions(id), (post, cats, tags, revisions) => {
							render.postData = post;
							render.tagList = tags || undefined;
							render.categoryList = cats || undefined;
							render.postRevisions = revisions;
							render.metaBoxes = CMS.renderMetaBox(post, {type: post.contentType});

							let rendered = ejs.render(data, render, options);
							CMS.sendResponse(CMS.res, status, rendered);

						})
		    			.catch((e) => {
							console.log(e);
		    				CMS.errorHandler({type: 'postnotfound', message: 'Post id: ' + id + ' not found', function: 'getPostById'});
		    			});
			        } else {
						CMS.getCategories().then((categories) => {
							render.categoryList = categories || undefined;
							render.metaBoxes = CMS.renderMetaBox({}, render.queryVars);
							rendered = ejs.render(data, render, options);
							CMS.sendResponse(CMS.res, status, rendered);
						});
			        }
	    		break;

	    		case 'post-revision' :
	    			let id = urlParams.id.toString();
	    			let revisionString;
	    			CMS.getRevisionById(id)
	    			.then((revision) => {
	    				revisionString = revision;
	    				return CMS.getPostById(revision.postId);
	    			})
	    			.then((post) => {
						require('colors')
						var jsdiff = require('diff');

						var diff = jsdiff.diffWords(revisionString.postContent, post.postContent, [{newlineIsToken: true}]);

						diff.forEach(function(part){
							// green for additions, red for deletions
							// grey for common parts
							var color = part.added ? 'green' :
							part.removed ? 'red' : 'grey';
							console.log(color);
							console.log(part.value[color]);
						});
						console.log(diff);
	    				render.revision = diff;
	    				render.postData = post;
			        	rendered = ejs.render(data, render, options);
			            CMS.sendResponse(CMS.res, status, rendered);
	    			})
	    			.catch((e) => {
	    				CMS.errorHandler(e, CMS.res);
	    			})

	    		break;

	    		default :

		        	rendered = ejs.render(data, render, options);
		            CMS.sendResponse(CMS.res, status, rendered);
					return;
	    		break;
	    	}
		});

	};

	render.metaBox = (postData, queryVars) => {
		if (!postData) {
			postData = {
				postMeta: {}
			};
		}

		const metaBox = CMS.metaBoxes;

		for (var i = 0; i < metaBox.length; i++) {

			if (metaBox[i].contentType === queryVars.type || typeof metaBox[i].contentType === 'undefined') {
				metaBox[i].rendered = APP.metaBox(metaBox[i].content, postData).replace(/[\n\t\r]/g,"")
			}

		}

		//console.log(metaBox);

		return metaBox;
		for (var i = 0; i < metaBox.length; i++) {

			if ( (metaBox[i] && metaBox[i].contentType) && metaBox[i].contentType === queryVars.type) {
				metaBox[i].rendered = APP.metaBox(metaBox[i].content, postData).replace(/[\n\t\r]/g,"")
			}

			if (metaBox[i] && !metaBox[i].contentType) {
				metaBox[i].rendered = APP.metaBox(metaBox[i].content, postData).replace(/[\n\t\r]/g,"")
			}

		}
		return metaBox;
	}

	render.renderInstallTemplate = () => {
        const options = {
        	filename: path.join(CMS.adminDir, 'templates', 'install.ejs')
        };

        const render = {
        	msg: '',
        	data: {currentLocation: CMS.req.protocol + '://' + CMS.req.get('host')},
        	adminLocation: CMS.adminLocation,
        };

        const data = fs.readFileSync(options.filename, 'utf-8');

    	rendered = ejs.render(data, render, options);
        CMS.sendResponse(CMS.res, 200, rendered);
    };

	render.renderPluginTemplate = (res, plugin, template, urlData, msg) => {
		console.log('renderPluginTemplate');
		const plugins = CMS.activePlugins.admin;
		const pluginRoot = `${CMS.adminDir}/templates/pluginroot.ejs`;

		for (var i = 0; i < plugins.length; i++) {
			if (plugins[i].pluginInfo.path === plugin) {

				let options = {
					filename: path.join(plugins[i].pluginPath, `templates/${template}.ejs`)
				};

				let render = {
					navigation: CMS.navigation,
					headerFile: `${CMS.adminDir}/templates/includes/header.ejs`,
					pageHeaderFile: `${CMS.adminDir}/templates/includes/pageheader.ejs`,
					navigationFile: `${CMS.adminDir}/templates/includes/navigation.ejs`,
					footerFile: `${CMS.adminDir}/templates/includes/footer.ejs`,
					cms: CMS,
					msg: msg,
		        	cmsInfo: CMS._utilities.sanitizedCmsInfo(),
					currentUser: CMS.currentUser,
		        	themeInfo: CMS.activeTheme,
		        	themes: CMS.themes,
		        	templates: CMS.getTemplates(),
		        	adminLocation: CMS.adminLocation,
		        	data: urlData,
		        	app: APP,
		        	postData: {},
		        	postRevisions: 0,
		        	plugins: CMS.pluginDetails,
					activePlugins: CMS.activePlugins,
					adminPlugins: CMS.activePlugins.admin,
					userPlugins: CMS.activePlugins.user,
		        	passedToRender: CMS.passToRender,
					statusTypes: CMS.statusTypes,
					queryVars: CMS.passToRender.queryVars,
					queryVarString: CMS.passToRender.queryVarString,
					systemMessages: CMS.systemMessages,
					gjHead: CMS._content.gjAdminHead(template),
					gjFoot: CMS._content.gjAdminFooter(template)
		        };
				const pluginData = fs.readFileSync(options.filename, 'utf-8');
				const renderedPluginTemplate = ejs.render(pluginData, render, options);

				const pluginRootData = fs.readFileSync(pluginRoot, 'utf-8');
				const renderedPluginRoot = ejs.render(pluginRootData, render, options);

				const rendered = renderedPluginRoot.replace('{{PLUGINHTML}}', renderedPluginTemplate);
				CMS.sendResponse(res, 200, rendered);
				break;
			}
		}
    };

	render._templateFileData = (template) => {
		const themePath = CMS.activeTheme.path;

		if (CMS.activeTheme.root) {
			themePath = path.join(themePath, CMS.activeTheme.root);
		}

		const templateLocation = `${themePath}/${template}`;

        const options = {
        	filename: templateLocation + '.ejs'
        };

    	const templateExists = options.filename;

    	render.app = APP;

		if (!fs.existsSync(templateExists)) {
			CMS.sendResponse(CMS.res, 500, 'Missing ' + template + '.ejs template file');
		    return;
		}

        let data = fs.readFileSync(templateLocation + '.ejs', 'utf-8');

		let temp = data.split('#!');

		let returns = {
			options: options
		};

		// If there is no loop data, just render the template.
        if (temp.length === 1) {
        	returns.data = data;
			returns.noLoop = true;
        } else {
			if (!CMS._utilities.templateJsonValidate(temp[0])) {
				returns.invalidJson = true
				return returns;
			}

			const checkForLoop = JSON.parse(temp[0]);

			if (!checkForLoop.loop) {
				returns.noLoop = true;
				returns.data = temp[1];
			} else {
				returns.loop = temp[0];
				returns.data = temp[1];
			}

		}

		return returns;
	};

	render._mainRender = (requestUrl, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;
		const baseUrl = requestUrl;
		const paginateRegEx = new RegExp('/' + CMS.config.paginateBy + '/([0-9]+)((\/\w+)+|\/?)$');
		let paginateNumber = 0;

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

					if (paginate[i] === CMS.config.paginateBy) {
						continue;
					}

				}

				URLPath.push(paginate[i]);
			}

			const parsed = path.join.apply(null, URLPath);

			if (parsed === '.') {
				requestUrl = '/';
			} else {
				requestUrl = '/' + path.join.apply(null, URLPath);
			}
		} else {
			paginateNumber = CMS.req.query[CMS.config.paginateBy] || 0;
		}

		const search = {postUrl: requestUrl, status: { $ne: 'trash' }};

		CMS.dbFindOne(db, collection, search)
		.then((doc) => {

			if (doc === null) {
				CMS.error(CMS.res, 404, 'Page not found');
				return;
			}

			doc.paginateNumber = paginateNumber;
			doc.requestUrl = requestUrl;
			doc.baseUrl = baseUrl;

			CMS.renderTemplate(doc)
			.then((rendered) => {
				done(null, rendered)
			})
			.catch((e) => {
				done(e)
			})


		})
	};

	render.renderTemplate = (templateData, done) => {

		if (typeof CMS.activeTheme === 'undefined') {
			CMS.error(CMS.res, 500, 'You do not have an active theme. ');
			return;
		}

	    let render = {
	        data: templateData,
	    	plugins: CMS.activePlugins.user,
			theme: CMS.activeTheme,
	    	site: {
	    		url: CMS.config.url,
	    		name: CMS.config.name,
	    		title: CMS.config.title,
	    		tagline: CMS.config.tagline,
	    		currentUser: CMS._users.getCurrentUserInfo(),
	    		adminLocation: CMS.config.adminLocation,
	    		cmsLocation: CMS.config.cmsLocation,
	    	},
			app: APP,
			passedToRender: CMS.passToRender,
			queryVars: CMS.passToRender.queryVars,
			queryVarString: CMS.passToRender.queryVarString
	    }

	    if (typeof templateData === 'undefined') {
			done(`missing template data. Can not render.`)
	        return;
	    }

	    let statusCode = 200;
	    if (typeof templateData.statusCode !== 'undefined') {
			statusCode = templateData.statusCode;
	    }

	    let template = templateData.template;

	    if (template === 'default') {
	    	template = 'index';
	    }

	    if (typeof template === 'undefined') {
	    	console.error('Error: Could not find template for this post. Rendering index.ejs from your theme folder.');
	       	let template = 'index';
	    }

		const templateFileData = CMS._render._templateFileData(template);

		if (templateFileData.invalidJson) {
			done(`${CMS.activeTheme.themeFolder}/${template}.ejs contains invalid json, and can't render.`)
			return;
		}

		if (!fs.existsSync(templateFileData.options.filename)) {
			done(`Missing ${template}.ejs template file`)
		    return;
		}

		// If there is no loop data, just render the template.
	    if (templateFileData.noLoop) {
	    	let rendered = ejs.render(templateFileData.data, render, templateFileData.options);
	    	done(null, rendered)
	    } else {
			let templateLoopData = JSON.parse(templateFileData.loop);
			let configs = [];
			let returns = {};
			const db = CMS.dbData;
		    const collection = CMS.dbConn.data.collection;

			async.forEachOf(templateLoopData.loop, (value, key, callback) => {

				let context = value.return;
				let limit = value.postsPerPage || 0;
				let pageNumber = Number(templateData.paginateNumber);
				let onPageNumber = 1;
				let returnedPosts = [];
				let offset = 0;

		    	let data = (search, readyCallback) => {

		    		let calc = (limit);
		    		let skipPosts = 0

					if (pageNumber >= 2) {
						offset = (pageNumber - 1) * limit;
						calc = limit + offset;
						onPageNumber = pageNumber;
					}

					let loopQuery = {
						limit: limit,
						offset: offset,
						search: CMS.loopQuery(value.find)
					}

					// If the loop contains a query object, use that by default
					if (value.query) {
						loopQuery.search = value.query;
					}

					let loopArrayPromises = [CMS.getPosts(loopQuery)];

					CMS.Promise.all(loopArrayPromises)
					.then((result) => {
						const postResult = result[0];
						const postArray = postResult.posts;

						if (value.getMedia && postArray.length > 0) {
							let postIds = [];
							for (var i = 0; i < postArray.postCount; i++) {
								postIds.push(postArray[i]._id);
							}

							let mediaSearch = { postId: { $in: postIds } };

							if (value.getMedia.featured) {
								mediaSearch = { $and: [ { featured: true}, { postId: { $in: postIds } } ] }
							} else if (typeof value.getMedia === 'object') {
								mediaSearch = value.getMedia;
							}

							CMS.getAttachments(mediaSearch, (err, results) => {
								let attachments = results.attachments;
								let posts = postResult.posts;
								for (var i = 0; i < results.attachmentCount; i++) {
									let count = 0;
									let attachmentPostId = attachments[i].postId.toString();
									for (var pi = 0; pi < posts.length; pi++) {
										let postId = posts[pi]._id.toString();

										if (!posts[pi].attachments) {
											posts[pi].attachments = [];
										}

										if (postId === attachmentPostId) {
											posts[pi].attachments.push(attachments[i]);
											count++;
										}

									}
								}

								postResult.posts = posts;
								readyCallback(postResult)
							});
						} else {
							readyCallback(postResult)
						}

					})
					.catch((e) => {
						callback(e)
					});
		        };

		        data(value, (results) => {
		        	returns[context] = results;
		        	callback();
		        });
			}, (err) => {
			    if (err){
			    	CMS._utilities.catchError(err);
			    }

			    render.loops = returns;
	        	try{
					let rendered = ejs.render(templateFileData.data, render, templateFileData.options);
					done(null, rendered)
				}
				catch(e){
					done(e)
				}

			});

		}



	};

	return render;
}
