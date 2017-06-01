const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const APP = require('../assets/js/core/app.js');
const ejs = require('ejs');
const async = require('async');
module.exports = (CMS, adminDir) => {

	let render = {};

	render.renderAdminTemplate = (res, type, urlParams, msg, status) => {
		let options = {
        	filename: path.join(CMS.adminDir, 'templates', type + '.ejs')
        };
        let user = res.req.user;
        if (user) {
        	delete user.pass
        }

        let render = {
        	cms: CMS,
        	cmsInfo: CMS.cmsDetails,
			currentUser: CMS.currentUser,
        	themeInfo: CMS.activeTheme,
        	themes: CMS.themes,
        	templates: CMS.getTemplates(),
        	adminLocation: CMS.adminLocation,
        	data: urlParams,
        	app: APP,
        	msg: msg,
        	postData: {},
        	user: user,
        	postRevisions: 0,
        	plugins: CMS.pluginDetails,
			activePlugins: CMS.activePlugins,
			adminPlugins: CMS.activePlugins.admin,
			userPlugins: CMS.activePlugins.user,
        	passedToRender: CMS.passToRender
        };

		console.log(CMS.passToRender);

        if (typeof msg !== 'undefined') {
        	render.alert = msg;
        }

    	let data = fs.readFileSync(options.filename, 'utf-8');

    	let rendered;

		if (typeof status === 'undefined') {
			status = 200
		}
    	switch (type) {
    		case 'edit' :
		        if (typeof urlParams !== 'undefined') {

			    	let id = urlParams.id.toString();

					CMS.Promise.join(CMS.getPostById(id), CMS.getCategories(), CMS.getRevisions(id), (post, cats, revisions) => {
						render.postData = post;
						render.categoryList = cats || undefined;
						render.postRevisions = revisions
						let rendered = ejs.render(data, render, options);
						CMS.sendResponse(res, status, rendered);
					})
	    			.catch((e) => {
	    				CMS.errorHandler(e, res);
	    			});



		        } else {
		        	rendered = ejs.render(data, render, options);
		            CMS.sendResponse(res, status, rendered);
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
		            CMS.sendResponse(res, status, rendered);
    			})
    			.catch((e) => {
    				CMS.errorHandler(e, res);
    			})

    		break;

    		default :
	        	rendered = ejs.render(data, render, options);
	            CMS.sendResponse(res, status, rendered);
				return;
    		break;
    	}
	};

	render.renderInstallTemplate = (res) => {
        const options = {
        	filename: path.join(CMS.adminDir, 'templates', 'install.ejs')
        };

        const render = {
        	msg: '',
        	data: {currentLocation: res.req.protocol + '://' + res.req.get('host')},
        	cms: CMS
        };

        const data = fs.readFileSync(options.filename, 'utf-8');

    	rendered = ejs.render(data, render, options);
        CMS.sendResponse(res, 200, rendered);
    };

	render.renderPluginTemplate = (res, pluginInfo, routeInfo) => {
		console.log(res.req.url);
		let options = {
			filename: path.join(pluginInfo.path, routeInfo.template + '.ejs')
		};
		let render = {
			cms: CMS,
			cmsInfo: CMS.cmsDetails,
			themeInfo: CMS.activeTheme,
			templates: CMS.getTemplates(),
			adminLocation: CMS.adminLocation,
			app: APP,
			plugins: CMS.activePlugins.admin
		};
		console.log(options);
		let data = fs.readFileSync(options.filename, 'utf-8');
		let rendered = ejs.render(data, render, options);
		CMS.sendResponse(res, 200, rendered);
    };

	render.renderTemplate = (res, templateData) => {

    	if (typeof CMS.activeTheme === 'undefined') {
    		CMS.error(res, 500, 'You do not have an active theme. ');
    		return;
    	}

        let render = {
            data: templateData,
        	plugins: CMS.activePlugins.user,
        	site: {
        		url: CMS.cmsDetails.url,
        		name: CMS.cmsDetails.name,
        		title: CMS.cmsDetails.title,
        		tagline: CMS.cmsDetails.tagline,
        		currentUser: CMS.cmsDetails.currentUser,
        		adminLocation: CMS.cmsDetails.adminLocation,
        		cmsLocation: CMS.cmsDetails.cmsLocation,
        	}
        }

        if (typeof templateData === 'undefined') {
        	CMS.error(res, 502, 'missing template data. Can not render.');
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

        let themePath = CMS.activeTheme.path;

		if (CMS.activeTheme.root) {
			themePath = path.join(themePath, CMS.activeTheme.root);
		}
		let templateLocation = `${themePath}/${template}`;

        let options = {
        	filename: templateLocation + '.ejs'
        };

    	let templateExists = options.filename;

    	render.app = APP;

		//console.log(render);

		if (!fs.existsSync(templateExists)) {
			CMS.sendResponse(res, 500, 'Missing ' + template + '.ejs template file');
		    return;
		}

        let data = fs.readFileSync(templateLocation + '.ejs', 'utf-8');
		let temp = data.split('#!');

		// If there is no loop data, just render the template.
        if (temp.length === 1) {
        	let rendered = ejs.render(data, render, options);
        	CMS.sendResponse(res, statusCode, rendered);
            return;
        }


		if (!CMS._utilities.templateJsonValidate(temp[0].trim())) {
			CMS.sendResponse(res, 500, `${CMS.activeTheme.localPath}/${template}.ejs contains invalid json, and can't render`);
			return;
		}

        let templateLoopData = JSON.parse(temp[0].trim());
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

					if (value.getMedia && postResult.posts.length > 0) {
						let postIds = [];
						for (var i = 0; i < postResult.postCount; i++) {

							const postDetails = postResult.posts[i];
							const postId = postDetails._id.toString();
							postIds.push(postId);
						}

						let mediaSearch = { postId: { $in: postIds } };

						if (value.getMedia === 'featured') {
							mediaSearch = { $and: [ { featured: true}, { postId: { $in: postIds } } ] }
						}

						if (typeof value.getMedia === 'object') {
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
					CMS.errorHandler(e, res);
				});
	        };

	        data(value, (results) => {
	        	returns[context] = results;
	        	callback();
	        });
		}, (err) => {
		    if (err){
		    	console.error(err.message);
		    }
		    render.loops = returns;

        	let rendered = ejs.render(temp[1], render, options);
            CMS.sendResponse(res, statusCode, rendered);

		});
	};


	return render;
}
