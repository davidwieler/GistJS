module.exports = (CMS, router, app) => {

	router.get('/' + CMS.adminLocation + '/install', (req, res) => {
		if (fs.existsSync(__dirname + '/admin/.install')) {
			CMS.renderAdminTemplate(res, 'install', { message: req.flash('installMessage')});
		} else {
			CMS.renderAdminTemplate(res, 'login', {message: 'Install has already been complete. Please login to administer your site.'});
		}
	});

	router.get('/' + CMS.adminLocation + '/login', (req, res) => {
		if (fs.existsSync(__dirname + '/admin/.install')) {
			res.redirect('/' + CMS.adminLocation + '/install');
		} else {
			CMS.renderAdminTemplate(res, 'login', { message: req.flash('installMessage')});
		}

	});

	router.post('/' + CMS.adminLocation + '/install', (req, res, next) => {
        passport.authenticate('local-install', function(err, install, info) {
			if (err) {
				return next(err);
			}

			if (!install) {
				CMS.renderAdminTemplate(res, 'install', {message: info});
				return;
			}
			req.logIn(install, function(err) {
				if (err) {
					return res.redirect('/' + CMS.adminLocation + '/login');
				}

				res.redirect('/' + CMS.adminLocation + '/dashboard');

			});
        })(req, res, next);
    });

	router.post('/' + CMS.adminLocation + '/login', (req, res, next) => {
		passport.authenticate('local-login', function(err, user, info) {
			if (err) {
				return next(err);
			}

			if (!user) {
				CMS.renderAdminTemplate(res, 'login', {message: info});
				return;
			}
			req.logIn(user, function(err) {
				if (err) { return next(err); }

			    return res.redirect('/' + CMS.adminLocation + '/dashboard/');

			});
		})(req, res, next);
	});

	router.get('/' + CMS.adminLocation + '/logout', function(req, res){
	    req.logout();
	    res.redirect('/' + CMS.adminLocation + '/login');
	});

	router.get(['/' + CMS.adminLocation + '/dashboard', '/' + CMS.adminLocation + '/'], CMS.isLoggedIn, (req, res) => {
		CMS.doHook('dashboard');
		CMS.renderAdminTemplate(res, 'dashboard');
	});

	router.get('/' + CMS.adminLocation + '/posts', CMS.isLoggedIn, (req, res) => {

		let findPosts = {
			limit: 20
		}

		let limit = req.query.limit;
		let offset = req.query.offset;
		let msg = req.query.msg;

		if (typeof limit !== 'undefined') {
			findPosts.limit = limit
		}

		if (typeof offset !== 'undefined') {
			findPosts.offset = offset
		}
		CMS.getPosts(findPosts, (result) => {
			CMS.renderAdminTemplate(res, 'posts', {posts: result, limit: findPosts.limit, msg: msg});
		});

	});

	router.get('/' + CMS.adminLocation + '/media', CMS.isLoggedIn, (req, res) => {
		let findAttachments = {
			limit: 20
		}

		let limit = req.query.limit;
		let offset = req.query.offset;
		let msg = req.query.msg;

		if (typeof limit !== 'undefined') {
			findAttachments.limit = limit
		}

		if (typeof offset !== 'undefined') {
			findAttachments.offset = offset
		}

		if (req.query.delete) {
			CMS.deleteAttachment(req.query.delete, (result) => {
				res.redirect('/' + CMS.adminLocation + '/media');
			});
			return;
		}

		CMS.getAttachments(findAttachments, (result) => {
			CMS.renderAdminTemplate(res, 'media', {attachments: result, limit: findAttachments.limit, msg: msg});
		});
	});

	router.get('/' + CMS.adminLocation + '/edit', CMS.isLoggedIn, (req, res) => {
		CMS.renderAdminTemplate(res, 'edit');
	});

	router.get('/' + CMS.adminLocation + '/pages', CMS.isLoggedIn, (req, res) => {
		CMS.renderAdminTemplate(res, 'pages');
	});

	router.post('/' + CMS.adminLocation + '/edit', CMS.isLoggedIn, (req, res) => {
		CMS.createContent(req.body, 'post', (result) => {
			res.redirect('/' + CMS.adminLocation + '/edit/' + result + '?msg=1');
		});
	});

	router.get('/' + CMS.adminLocation + '/edit/:id', CMS.isLoggedIn, (req, res) => {
		let msg = req.query.msg;
		if (typeof msg !== 'undefined') {
			CMS.renderAdminTemplate(res, 'edit', req.params, msg);
		} else {
			CMS.renderAdminTemplate(res, 'edit', req.params);
		}
	});

	router.post('/' + CMS.adminLocation + '/edit/:id', CMS.isLoggedIn, (req, res) => {
		const postId = req.params.id;
		let autoSave = false;
		req.body.postId = postId;

		if (req.body.autoSave) {
			autoSave = true;
			delete req.body.autoSave;
		}
		CMS.updatePost(req.body, req.body.postId, (result) => {

			if (result.ok === 1) {
				if (autoSave === true) {
					CMS.sendResponse(res, 200, result);
					return;
				}
				if (req.body.status === 'trash') {
					res.redirect('/' + CMS.adminLocation + '/posts?msg=3');
					return;
				} else {
					res.redirect('/' + CMS.adminLocation + '/edit/' + postId + '?msg=2');
				}
			}
		});
	});

	// Settings routes
	router.get('/' + CMS.adminLocation + '/settings', CMS.isLoggedIn, (req, res) => {
		CMS.renderAdminTemplate(res, 'settings', req.params);
	});

	router.post('/' + CMS.adminLocation + '/settings', CMS.isLoggedIn, (req, res) => {
		console.log(req.body.thumbnails);
		res.redirect('/' + CMS.adminLocation + '/settings?msg=1');
	});

	// Theme routes
	router.get('/' + CMS.adminLocation + '/themes', CMS.isLoggedIn, (req, res) => {
		let msg = req.query.msg;
		CMS.renderAdminTemplate(res, 'themes', req.params, msg);
	});

	router.post('/' + CMS.adminLocation + '/themes', CMS.isLoggedIn, (req, res) => {
		CMS.themeSwitch(req.body.themeId, (newTheme) => {
			res.redirect('/' + CMS.adminLocation + '/themes?msg=1');
		});
	});

	//File uploads

	router.post('/' + CMS.adminLocation + '/upload', (req, res) => {
		let formidable = require('formidable');

		// create an incoming form object
		let form = new formidable.IncomingForm();

		// specify that we want to allow the user to upload multiple files in a single request
		form.multiples = true;

		// store all uploads in the /uploads directory
		form.uploadDir = CMS.uploadDir;

		// every time a file has been uploaded successfully,
		// rename it to it's orignal name
		form.on('file', function(field, file) {

			let fullFilePath = file.path;
			let filePath = fullFilePath.replace(__dirname, '');

			let data = {
				name: file.name,
				originalName: file.name,
				size: file.size,
				realPath: '/uploads/' + file.name,
				fileType: file.type,
				postId: field || ''
			}

			let fileName = file.name;
			let fileExt = fileName.split('.').pop();
			let named = fileName.substr(0, fileName.lastIndexOf('.'))

			CMS.getAttachments({search:{originalName: data.originalName}}, (result) => {
				if (result.attachmentCount >= 1) {
					//data.name = named + '_' + result.length + '.' + fileExt;
					named = named + '_' + result.attachmentCount;
				}

				data.name = named + '.' + fileExt;

				fs.rename(file.path, path.join(form.uploadDir, data.name), () => {
					let image = {
						path: path.join(form.uploadDir, data.name),
						fileName: named,
						ext: '.' + fileExt
					};

					if (!data.name.match(/.(jpg|jpeg|png|gif)$/i)){
							CMS.createContent(data, 'attachment', () => {
								CMS.sendResponse(res, 200, data);
							});
					} else {
						CMS.generateThumbnail(image, (err, result) => {
							data.thumbnails = result

							CMS.createContent(data, 'attachment', (id) => {
								data._id = id;
								CMS.sendResponse(res, 200, data);
							});
						});
					}

				});
			})
		});

		// log any errors that occur
		form.on('error', function(err) {
			console.log('An error has occured: \n' + err);
		});

		// once all the files have been uploaded, send a response to the client
		form.on('end', function() {
			//res.end('success');
		});

		// parse the incoming request containing the form data
		form.parse(req);
	});

	//API routes

	router.post('/' + CMS.adminLocation + '/api/posts', (req, res) => {

		if (req.body.id) {
			let post = CMS.getPost(req.body.id, (result) => {
				CMS.sendResponse(res, 200, result);
			});
			return
		}

		let findPosts = {
			limit: 20
		}

		let limit = 20;

		if (req.body.limit) {
			findPosts.limit = req.body.limit;
		}

		if (req.body.offset) {
			findPosts.offset = req.body.offset;
		}

		if (req.body.search) {
			findPosts.search = req.body.search;
		}

		CMS.getPosts(findPosts, (result) => {
			CMS.sendResponse(res, 200, {posts: result, limit: findPosts.limit});
		});

	});

	router.post('/' + CMS.adminLocation + '/api/attachments', (req, res) => {

		if (req.body.id) {
			let post = CMS.getAttachment(req.body.id, (result) => {
				CMS.sendResponse(res, 200, result);
			});
			return
		}

		let findAttachments = {
			limit: 20
		}

		if (req.body.limit) {
			findAttachments.limit = req.body.limit
		}

		if (req.body.offset) {
			findAttachments.offset = req.body.offset
		}

		if (req.body.search) {
			findAttachments.search = req.body.search;
		}

		CMS.getAttachments(findAttachments, (result) => {
			CMS.sendResponse(res, 200, {attachments: result});
		});

	});

	return router;
}