module.exports = (CMS, APP) => {
	//console.log('Plugin loading...');

	let initFunctions = {};

	initFunctions.init = () => {

		CMS._utilities.addAdminScript({
			name: 'jquery',
			src: 'core/libraries/jquery.min.js',
			type: 'core'
		})
		CMS._utilities.addAdminScript({name: 'bootstrap', src: 'core/libraries/bootstrap.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'wysihtml', src: 'core/libraries/wysihtml.min.js', type: 'core', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'wysihtml-toolbar', src: 'core/libraries/wysihtml-toolbar.min.js', type: 'core', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'wysihtml-parser-rules', src: 'core/libraries/wysihtml-parser-rules.js', type: 'core', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'blockui', src: 'plugins/loaders/blockui.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'nicescroll', src: 'plugins/ui/nicescroll.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'drilldown', src: 'plugins/ui/drilldown.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'pace', src: 'plugins/loaders/pace.min.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'tidyhtml', src: 'plugins/tidyhtml.js', type: 'core', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'tomarkdown', src: 'plugins/tomarkdown.js', type: 'core', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'app', src: 'core/app.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'handlers', src: 'core/handlers.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'helperFunctions', src: 'core/helperFunctions.js', type: 'core'})
		CMS._utilities.addAdminScript({name: 'showdown', src: 'https://cdn.rawgit.com/showdownjs/showdown/1.6.3/dist/showdown.min.js', page: 'edit'})
		CMS._utilities.addAdminScript({name: 'bootstrap-select', src: 'https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.12.2/js/bootstrap-select.min.js'})

		const metaData = {
			heading: 'Test Header',
			content: [
				{
					text: `what's this?`,
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
		const metaDataPage = {
			heading: 'Test Header',
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
										</tr>
									</thead>
									<tbody>

						`;

						for (var i = 0; i < post.length; i++) {
							const postTitle = post[i].postTitle;
							const url = `/${CMS.adminLocation}/edit/${post[i]._id}`;
							returns += `
								<tr>
									<td><a href="${url}">${postTitle}</a></td>
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


	}

	return initFunctions;

}
