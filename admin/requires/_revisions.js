const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
module.exports = (CMS) => {

	var revisions = {};

	revisions.getRevisionById = (revId, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		db.postrevisions.findOne({'_id':ObjectId(revId)}, (err, post) => {
			if (err) {
				done(err);
			}
			if (post === null) {
				done('Revision id: ' + postId + ' not found');
				return;
			}

			done(null, post);
		});
	};
	revisions.getRevisions = (originalPostId, done) => {
		const db = CMS.dbData;
		db.postrevisions.find({postId: originalPostId}, (err, posts) => {
			if (err) {
				done(err);
			}
			done(null, posts);
		});
	};

	revisions.createRevision = (data) => {
		const db = CMS.dbData;
		db.postrevisions.save(data);
	};

	revisions.deleteRevision = (postId, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		db.postrevisions.remove({postId: postId}, (err, result) => {
			if (err) {
				done(err);
			}

			if (typeof done === 'function') {
				done(null, result);
			}
		})
	};

	return revisions;

}
