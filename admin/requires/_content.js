const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;
const APP = require('../assets/js/core/app.js');
const _ = require('lodash');
module.exports = (CMS) => {

	var content = {};

	content.createContent = (data, type, done) => {

		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		data.timestamp = +new Date();
		data.contentType = type;
		data.user = CMS._users.getCurrentUserInfo().name;
		data.userId = CMS._users.getCurrentUserInfo().id;

		if (data.postUrl) {
			const postUrl = data.postUrl;
			if (postUrl.charAt(0) !== '/') {
				data.postUrl = `/${postUrl}`;
			}
		}

		if (data.category) {
			CMS.createCategory(data.category[0]);
			data.category = data.category[0];
		}

		CMS.dbInsert(db, collection, data)
		.then((result) => {
			done(null, result._id);
		})
		.catch((e) => {
			done(e);
		})
	}

	content.deletePost = (postId, done) => {

		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		const search = {'_id': ObjectId(postId)}

		CMS.dbDelete(db, collection, search)
		.then((result) => {
			done(null, result);
		})
		.catch((e) => {
			done(e);
		});

	}

	content.updatePost = (data, postId, done) => {

		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		if (data.category) {
			CMS.createCategory(data.category[0]);
			data.category = data.category[0];
		} else {
			data.category = {};
		}

		data.updatedUser = CMS._users.getCurrentUserInfo().name;
		data.updatedUserId = CMS._users.getCurrentUserInfo()._id;
		//data.updatedTimestamp = +new Date();
		delete data.user;
		delete data.userId;

		if (CMS.config.postRevisions === true) {

			CMS.getPostById(postId, (err, res) => {

				// Create a new const to check equality,
				// remove some of the known constant data points.
				const equalityCheck = res;
				delete equalityCheck._id;
				delete equalityCheck.timestamp;
				delete equalityCheck.updatedTimestamp;
				delete equalityCheck.contentType;

				if (_.isEqual(equalityCheck, data)) {
					// No changes found
					done(null, {noChange: true});
				} else {
					// Changes were found
					// create a revision and update the post
					res.postId = data.postId;
					res.updatedUser = data.updatedUser;
					res.updatedUserId = data.updatedUserId;
					res.updatedTimestamp = +new Date();
					delete res._id;

					CMS.createRevision(res);

					data.updatedTimestamp = +new Date();

					const search = {'_id':ObjectId(postId)};

					CMS.dbUpdate(db, collection, search, data, (err, result) => {
						if (err) {
							done(err);
						}

						done(err, result);
					});
				}
			});

		} else {
			data.updatedTimestamp = +new Date();

			// TODO: May want to change this up to a then>catch type promise...

			CMS.dbUpdate(db, collection, search, data, (err, result) => {
				if (err) {
					done(err);
				}

				done(err, result);
			})
		}
	}

	content.getPostById = (postId, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;
		const search = {'_id':ObjectId(postId)};


		CMS.dbFindOne(db, collection, search)
		.then((post) => {
			if (post === null) {
				done({type: 'postnotfound', message: `Post id: ${postId} not found`, function: 'getPostById'});
				return;
			}

			done(null, post);
		})
		.catch((e) => {
			return done(e);
		});

	}

	content.getPost = (search, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		CMS.dbFindOne(db, collection, search)
		.then((post) => {
			if (post === null) {
				done({type: 'postnotfound', message: 'Post not found using your search criteria', function: 'getPost'});
				return;
			}

			done(null, post);
		})
		.catch((e) => {
			return done(e);
		});
	};

	content.getPosts = (findPosts, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;
		let returnedPosts = [];
		let count = 0;
		let returnedLimits = {};
		let limit = findPosts.limit || 20;
		let search = {contentType: 'post', status: 'published'};

		if (!_.isEmpty(findPosts.search)) {
			search = findPosts.search;

			if (search === '*') {
				search = {}
			}
		}

		if (findPosts.multiId) {
			// Working here
			// loop through ids, adding ObjectID string to searches
			const multi = [];
				for (var i = findPosts.postId.length - 1; i >= 0; i--) {
				multi.push(ObjectID(postId[i]))
			}

			search._id = {$in: multi};
		}

		returnedLimits.limit = limit;
		returnedLimits.offset = Number(findPosts.offset) || 0;

		let calc = (limit - 1);

		CMS.dbFind(db, collection, search)
		.then((posts) => {
			for (var i = 0; i < posts.length; i++) {

				if (returnedLimits.limit === 0) {
					returnedPosts.push(posts[i]);
					continue;
				}

				if (returnedLimits.offset >= 1) {
					calc = (limit - 1 + returnedLimits.offset);
					if (i < (returnedLimits.offset)) {
						continue;
					}
				}

				if (i <= calc) {
					returnedPosts.push(posts[i]);
				} else {
					break;
				}

			}

			done(null, {postCount: posts.length, posts: returnedPosts, limits: returnedLimits});
		})
		.catch((e) => {
			done(e)
		})

		return;

		db[collection].find(search).sort({timestamp: -1}, (err, posts) => {

			if (err) {
				done(err);
			}

			for (var i = 0; i < posts.length; i++) {

				if (returnedLimits.limit === 0) {
					returnedPosts.push(posts[i]);
					continue;
				}

				if (returnedLimits.offset >= 1) {
					calc = (limit - 1 + returnedLimits.offset);
					if (i < (returnedLimits.offset)) {
						continue;
					}
				}

				if (i <= calc) {
					returnedPosts.push(posts[i]);
				} else {
					break;
				}

			}

			done(null, {postCount: posts.length, posts: returnedPosts, limits: returnedLimits});
		});

	}

	content.addMetaBox = (metaData, location, priority, position, contentType) => {
		const metaBoxData = {content: metaData, location, priority, position, contentType}
		CMS.metaBoxes.push(metaBoxData);
	};

	content.addPostType = (postTypeData, position, name) => {
		CMS.addAdminNavigation(postTypeData, position, name);

		let newPostTypeDetails = {};
		newPostTypeDetails[postTypeData.contentType] = postTypeData;
		_.extend(CMS.postTypes, newPostTypeDetails);

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/${postTypeData.url}`,
			auth: true,
			function: (req, res) => {

				// Do search stuff here for post types????
				// Who knows, good starting point tho.....

				let findPosts = {
					limit: 20
				}

				let limit = req.query.limit;
				let offset = req.query.offset;
				let msg = req.query.msg;
				let status = req.query.status;
				let sortBy = req.query.sortBy;
				let sortOrder = req.query.sortOrder;

				if (typeof limit !== 'undefined') {
					findPosts.limit = limit
				}

				if (typeof offset !== 'undefined') {
					findPosts.offset = offset
				}

				findPosts.search = {};

				if (typeof status !== 'undefined') {
					findPosts.search.status = status
				}

				if (status === 'mine') {
					delete findPosts.search.status
					findPosts.search.userId = `${CMS.currentUser._id}`
				}

				findPosts.search.contentType = postTypeData.contentType;

				findPosts.search.sort = {
					by: 'timestamp',
					order: 'desc'
				}

				if (typeof sortBy !== 'undefined') {
					findPosts.search.sort.by = sortBy
				}

				if (typeof sortOrder !== 'undefined') {
					findPosts.search.sort.order = sortOrder
				}

				CMS.getPosts(findPosts, (err, result) => {
					CMS.renderAdminTemplate('post-type-list', {posts: result, limit: findPosts.limit, msg: msg, postTypeData: postTypeData});
				});

			}
		});
	};

	content.addDashboardWidget = (widgetObject) => {
		const position = widgetObject.position || 1;
		CMS.addHook(widgetObject.name, 'dashboard', position, widgetObject.function);
	};

	content.addWidget = () => {

	};

	content.gjAdminHead = (page) => {
		let adminHeader = '';
		const headerScripts = CMS.adminScripts.header;

		for (var i = 0; i < headerScripts.length; i++) {
			if (!headerScripts[i].scriptPage) {
				adminHeader += `<script type="text/javascript" src="${headerScripts[i].scriptSrc}"></script>\n`;
			} else if (page === headerScripts[i].scriptPage) {
				adminHeader += `<script type="text/javascript" src="${headerScripts[i].scriptSrc}"></script>\n`;
			}
		}

		return adminHeader;
	};

	content.gjAdminFooter = (page) => {
		let adminFooter = '';
		const footerScripts = CMS.adminScripts.footer;

		for (var i = 0; i < footerScripts.length; i++) {
			if (!footerScripts[i].scriptPage) {
				adminFooter += `<script type="text/javascript" src="${footerScripts[i].scriptSrc}"></script>\n`;
			} else if (page === footerScripts[i].scriptPage) {
				adminFooter += `<script type="text/javascript" src="${footerScripts[i].scriptSrc}"></script>\n`;
			}
		}

		return adminFooter;
	};

	content.gjHead = () => {

	};

	content.gjFooter = () => {

	};

	return content;

}
