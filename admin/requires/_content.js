const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;
const _ = require('lodash');
module.exports = (CMS) => {

	var content = {};

	content.createContent = (data, type, done) => {

		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		data.timestamp = +new Date();
		data.contentType = type;

		if (data.category) {
			CMS.createCategory(data.category[0]);
			data.category = data.category[0];
		}

		db[collection].insert(data, (err, result) => {
			if (err) {
				done(err);
			}

			if (typeof done === 'function') {
				done(null, result._id);
			}
		});
	}

	content.deletePost = (postId, done) => {

		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		db[collection].remove({'_id': ObjectId(postId)}, (err, result) => {
			if (err) {
				done(err);
			}

			if (typeof done === 'function') {
				done(null, result);
			}
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

		data.updatedUser = data.user;
		data.updatedUserId = data.userId;
		//data.updatedTimestamp = +new Date();
		delete data.user;
		delete data.userId;

		if (CMS.cmsDetails.postRevisions === true) {

			CMS.getPostById(postId, (err, res) => {

				// Create a new const to check equality,
				// remove some of the known constant data points.
				const equalityCheck = res;
				delete equalityCheck._id;
				delete equalityCheck.user;
				delete equalityCheck.userId;
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
					delete res._id;

					CMS.createRevision(res);

					data.updatedTimestamp = +new Date();

					db[collection].update(
						{'_id':ObjectId(postId)},
						{ $set: data},
						(err, response) => {

							if (err) {
								done(err);
							}

							done(null, response);

						}
					)
				}
			});

		} else {
			data.updatedTimestamp = +new Date();
			db[collection].update(
				{'_id':ObjectId(postId)},
				{ $set: data},
				(err, response) => {
					if (err) {
						done(err);
					}
					if (typeof done === 'function') {
						done(null, response);
					}

				}
			)
		}

	}

	content.getPostById = (postId, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		db[collection].findOne({'_id':ObjectId(postId)}, (err, post) => {
			if (err) {
				done(err);
			}
			if (post === null) {
				done({type: 'postnotfound', message: 'Post id: ' + postId + ' not found', function: 'getPostById'});
				return;
			}

			done(null, post);
		});

	}

	content.getPost = (search, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		db[collection].findOne(search, (err, post) => {
			if (err) {
				done(err);
			}
			if (post === null) {
				done('Post id: ' + postId + ' not found');
				return;
			}
			done(null, post);
		});
	};

	content.getPosts = (findPosts, done) => {

		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;
		let returnedPosts = [];
		let count = 0;
		let returnedLimits = {};
		let limit = findPosts.limit || 20;
		let search = {contentType: 'post'};

		if (typeof findPosts.search !== 'undefined') {
			search = findPosts.search;
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
		//db[CMS.dbConn.collection].find(search).limit(Number(limit)).sort({timestamp: -1}, (err, posts) => {
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

	return content;

}
