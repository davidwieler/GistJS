const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const request = require('request');
const _ = require('lodash');
const adminRoutes = require('./admin-routes/init.js')

module.exports = (CMS, APP) => {
	//console.log('Plugin loading...');

	let initFunctions = {};

	initFunctions.adminStyles = () => {

		CMS._utilities.addAdminStylesheet({name: 'bootstrap', src: 'bootstrap.css', type: 'core'})
		CMS._utilities.addAdminStylesheet({name: 'icomoon', src: 'icons/icomoon/styles.css', type: 'core'})
		CMS._utilities.addAdminStylesheet({name: 'icomoon', src: 'core.css', type: 'core'})
		CMS._utilities.addAdminStylesheet({name: 'icomoon', src: 'components.css', type: 'core'})
		CMS._utilities.addAdminStylesheet({name: 'editor-styles', src: 'editor.css', type: 'core', page: 'edit'})
		CMS._utilities.addAdminStylesheet({name: 'icomoon', src: 'colors.css', type: 'core'})
		CMS._utilities.addAdminStylesheet({name: 'bootstrap-select', src: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/css/bootstrap-select.min.css'})
		CMS._utilities.addAdminStylesheet({name: 'select2', src: 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/css/select2.min.css'})
		CMS._utilities.addAdminStylesheet({name: 'font-awesome', src: 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css'})
		CMS._utilities.addAdminStylesheet({name: 'roboto-font', src: 'https://fonts.googleapis.com/css?family=Roboto:400,300,100,500,700,900'})
		CMS._utilities.addAdminStylesheet({name: 'summernote', src: 'http://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.7/summernote.css'})

	};

	initFunctions.adminScripts = () => {
		CMS._utilities.addAdminScript({name: 'jquery', src: 'core/libraries/jquery.min.js', type: 'core', location: 'header'})
		CMS._utilities.addAdminScript({name: 'wysihtml', src: 'core/libraries/wysihtml.min.js', type: 'core', page: 'edit', location: 'header'})
		CMS._utilities.addAdminScript({name: 'wysihtml-toolbar', src: 'core/libraries/wysihtml-toolbar.min.js', type: 'core', page: 'edit', location: 'header'})
		CMS._utilities.addAdminScript({name: 'wysihtml-parser-rules', src: 'core/libraries/wysihtml-parser-rules.js', type: 'core', page: 'edit', location: 'header'})
		CMS._utilities.addAdminScript({name: 'blockui', src: 'plugins/loaders/blockui.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'nicescroll', src: 'plugins/ui/nicescroll.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'drilldown', src: 'plugins/ui/drilldown.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'pace', src: 'plugins/loaders/pace.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'tidyhtml', src: 'plugins/tidyhtml.js', type: 'core', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'tomarkdown', src: 'plugins/tomarkdown.js', type: 'core', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'app', src: 'core/app.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'handlers', src: 'core/handlers.js', type: 'core', location: 'header'})
		CMS._utilities.addAdminScript({name: 'editor-handlers', src: 'core/editor-handlers.js', type: 'core', location: 'header', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'helperFunctions', src: 'core/helperFunctions.js', type: 'core', location: 'header'})
		CMS._utilities.addAdminScript({name: 'showdown', src: 'https://cdn.rawgit.com/showdownjs/showdown/1.6.3/dist/showdown.min.js', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'bootstrap-select', src: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/js/bootstrap-select.min.js'})
		CMS._utilities.addAdminScript({name: 'select2', src: 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.3/js/select2.min.js', location: 'header'})
		CMS._utilities.addAdminScript({name: 'bootstrap', src: 'core/libraries/bootstrap.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'push-notifications', src: 'core/push.js', type: 'core'})

		// Replacing editor with summernote
		CMS._utilities.addAdminScript({name: 'summernote', src: 'http://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.7/summernote.js', page: 'edit'})
	};

	initFunctions.systemCrons = () => {

		// Check for trashed posts and delete, no immediateFire
		const deleteTrashedCron = CMS._crons.createCron('sendSystemMessages', '*/5 * * * *', () => {
			CMS._utilities.deleteTrashed();
		}, true, false);

		// Send available push notifs to admins, immediateFire
		// Only works if push notifications are enabled
		const systemMessageCron = CMS._crons.createCron('sendSystemMessages', '*/55 * * * *', () => {
			for (var i = 0; i < CMS.systemMessages.length; i++) {
				CMS.systemMessages[i]
				CMS._messaging.sendPush({
					message: CMS.systemMessages[i].message,
					clickTarget: 'http://localhost:7637/spry-admin/',
					title: CMS.systemMessages[i].title
				});
			}
		}, true, true);
	};

	initFunctions.init = () => {
		adminRoutes(CMS, APP).init();
		initFunctions.systemCrons();
		initFunctions.adminStyles();
		initFunctions.adminScripts();

		CMS._exceptions.registerException('failed to connect to server', () => {
			console.error(`\n--- DATABASE CONNECTION ISSUE ---`);
			console.error(`Unable to contact MongoDB server @ ${CMS.dbConn.data.url}. \nPlease check that MongoDB is running, and that you've provided the correct connection information (url/username/password).`);
			console.error(`__________________________________\n`);
		})

		CMS.addHook('displayAllSystemMessages', 'all', 1, (done) => {
			CMS.getPosts({search: {contentType: 'systemMessages'}})
			.then((messages) => {
				const systemMessages = messages.posts;
				for (var i = 0; i < systemMessages.length; i++) {
					CMS._messaging.generateSystemAlert({
						title: systemMessages[i].msgDetails.title,
						message: systemMessages[i].msgDetails.message,
						type: systemMessages[i].msgDetails.type,
						tag: systemMessages[i].msgDetails.tag
					});

					if (systemMessages[i].msgDetails.showOnce) {
						const db = CMS.dbData;
						const collection = CMS.dbConn.data.collection;

						const search = {'msgDetails.tag': systemMessages[i].msgDetails.tag}

						CMS.dbDelete(db, collection, search).
						catch((e) => {
							console.log(e);
						})
					}
				}
				done(true);
			})
		});

		const metaData = {
			heading: 'Test Header',
			content: [
				{
					text: 'A secondary header for posts',
					inputs: [
						{
							name: `Sub Heading`,
							placeholder: 'Enter a secondary header'
						}
					]
				}
			]
		}
		const metaDataPage = {
			heading: 'Test Header for page',
			content: [
				{
					text: `what's this Page?`,
					inputs: [
						{
							name: `Input test`
						},
						{
							name: `Input test #2`
						}
					]
				}
			]
		}
		const metaDataSidebar = {
			heading: 'Ticket Pricing',
			content: [
				{
					text: 'Enter ticket price',
					inputs: [
						{
							name: 'Price',
							type: 'number',
							attr: 'min="5" max="10"',
							placeholder: 'Ticket Price'
						}
					]
				}
			]
		}

		CMS.addMetaBox(metaData, 'main', 'low', 1, 'post')
		CMS.addMetaBox(metaDataPage, 'main', 'low', 1, 'page')
		CMS.addMetaBox(metaDataSidebar, 'sidebar', 'low', 1)

		CMS._utilities.addPostStatus({'test status': 'Test Status', nothanks: 'No Thanks!'});
		CMS._utilities.addPostTypeColumn('post', 'Ticket Price', 'postMeta', (meta) => {
			if (!meta.price) {
				return 'Not set';
			}
			return meta.price;
		});
		CMS._utilities.addPostTypeColumn('post', 'Updated By', 'updatedUser', (user) => {
			if (!user) {
				return '';
			}
			return user;
		});
		CMS._utilities.addPostTypeColumn('post', 'Updated At', 'updatedTimestamp', (timestamp) => {
			if (!timestamp) {
				return '';
			}
			return APP.timeAgo(timestamp, 'ddd, mmm ddS yyyy h:MMtt');
		});
		CMS._utilities.addPostTypeColumn('post', 'Updated Combined', ['updatedUser', 'updatedTimestamp'], (array, postData) => {
			const user = postData[array[0]] || '';
			const timestamp = APP.timeAgo(postData[array[1]], 'ddd, mmm ddS yyyy h:MMtt');

			if (!user) {
				return '';
			}
			return `
				By: ${user} <br />
				${timestamp}
			`;
		});
		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/google`,
			auth: false,
			function: () => {
				CMS.getUsers({}, (err, results) => {
					CMS.sendResponse(CMS.res, 200, results);
					//CMS.renderPluginTemplate(CMS.res, 'syncsage', 'backup');
				});
			}
		});

		const latestPostsWidget = {
			name: 'Latest Posts',
			function: (done) => {
					CMS.getPosts({}).then((posts) => {
						const post = posts.posts;
						let returns = `
							<div class="table-responsive">
								<table class="table table-bordered">
									<thead>
										<tr>
											<th>Posts</th>
											<th>Author</th>
										</tr>
									</thead>
									<tbody>

						`;

						for (var i = 0; i < post.length; i++) {
							const postTitle = post[i].postTitle;
							const author = post[i].updatedUser || post[i].user;
							const url = `/${CMS.adminLocation}/edit/${post[i]._id}`;
							returns += `
								<tr>
									<td><a href="${url}">${postTitle}</a></td>
									<td>${author}</td>
								</tr>
							`;
						}
						returns += `
								</tbody>
							</table>
						</div>
						`;
						done(APP.renderDashboardWidget('Latest Posts', returns));
					});
			}
		}

		const basicDashboardWidgetFunction = {
			name: 'basic test',
			function: (done) => {
				done('Basic test');
			}
		};

		const quickDraftWidget = {
			name: 'Quick Draft',
			function: (done) => {
				const postUrl = `/${CMS.adminLocation}/quick-draft-post`;
				const returns = `
					<form class="panel-body" action="${postUrl}" method="POST">
						<input type="hidden" value="post" name="contentType" />
						<input type="hidden" value="draft" name="status" />
						<div class="form-group has-feedback">
							<input type="text" class="form-control" placeholder="Post Title" name="postTitle" value="test title draft dash">
							<div class="form-control-feedback">
								<i class="icon-pencil7 text-muted"></i>
							</div>
						</div>

						<div class="form-group">
							<textarea class="form-control" cols="3" rows="3" placeholder="Your message" name="postContent">asdasdasd</textarea>
						</div>

						<div class="row">

							<div class="col-xs-12 text-right">
								<button type="submit" class="btn btn-info">Create Draft</button>
							</div>
						</div>
					</form>
				`;
				done(APP.renderDashboardWidget('Quick Draft', returns));
			}
		};

		// Create the post route for the quick draft
		CMS.createRoute({
			type: 'post',
			url: `/${CMS.adminLocation}/quick-draft-post`,
			auth: true,
			function: () => {
				console.log(CMS.req.body);
				CMS.req.body.postUrl = `/${APP.sanitizeTitle(CMS.req.body.postTitle)}`;
				CMS.createContent(CMS.req.body, CMS.req.body.contentType).then(() => {
					CMS.res.redirect(`/${CMS.adminLocation}/dashboard?msg=3`)
				});
			}
		});

		const chatWidget = {
			name: 'Chat',
			function: (done) => {
				const returns = `
					<div class="panel-body">
						<ul class="media-list chat-list content-group">
							<li class="media reversed">
								<div class="media-body">
									<div class="media-content">Satisfactorily strenuously while sleazily</div>
									<span class="media-annotation display-block mt-10">2 hours ago</span>
								</div>

								<div class="media-right">
									<a href="assets/images/demo/images/3.png">
										<img src="http://demo.interface.club/limitless/layout_5/LTR/default/assets/images/demo/users/face1.jpg" class="img-circle img-md" alt="">
									</a>
								</div>
							</li>

							<li class="media">
								<div class="media-left">
									<a href="assets/images/demo/images/3.png">
										<img src="http://demo.interface.club/limitless/layout_5/LTR/default/assets/images/demo/users/face11.jpg" class="img-circle img-md" alt="">
									</a>
								</div>

								<div class="media-body">
									<div class="media-content">Grunted smirked and grew.</div>
									<span class="media-annotation display-block mt-10">13 minutes ago</span>
								</div>
							</li>

							<li class="media reversed">
								<div class="media-body">
									<div class="media-content"><i class="icon-menu display-block"></i></div>
								</div>

								<div class="media-right">
									<a href="assets/images/demo/images/3.png">
										<img src="http://demo.interface.club/limitless/layout_5/LTR/default/assets/images/demo/users/face1.jpg" class="img-circle img-md" alt="">
									</a>
								</div>
							</li>
						</ul>

	                	<textarea name="enter-message" class="form-control content-group" rows="3" cols="1" placeholder="Enter your message..."></textarea>

	                	<div class="row">
	                		<div class="col-xs-6">
	                        	<ul class="icons-list icons-list-extended mt-10">
	                                <li><a href="#" data-popup="tooltip" data-container="body" title="" data-original-title="Send photo"><i class="icon-file-picture"></i></a></li>
	                            	<li><a href="#" data-popup="tooltip" data-container="body" title="" data-original-title="Send video"><i class="icon-file-video"></i></a></li>
	                                <li><a href="#" data-popup="tooltip" data-container="body" title="" data-original-title="Send file"><i class="icon-file-plus"></i></a></li>
	                            </ul>
	                		</div>

	                		<div class="col-xs-6 text-right">
	                            <button type="button" class="btn bg-teal-400 btn-labeled btn-labeled-right"><b><i class="icon-circle-right2"></i></b> Send</button>
	                		</div>
	                	</div>
					</div>
				`;
				done(APP.renderDashboardWidget('Chat', returns));
			}
		};

		CMS._content.addDashboardWidget(latestPostsWidget);
		CMS._content.addDashboardWidget(basicDashboardWidgetFunction);
		CMS._content.addDashboardWidget(quickDraftWidget);
		CMS._content.addDashboardWidget(chatWidget);

		if (CMS.multiSite) {
			CMS._utilities.addAdminSubNavigation({
				slug: 'Network',
	       		url: 'settings/network',
	       		icon: 'fa fa-sitemap',
	       		priviledge: 'addUsers' },
			'settings')
		}

	}

	return initFunctions;

}
