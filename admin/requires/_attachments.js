const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;
module.exports = (CMS) => {

	var attachments = {};

	attachments.getAttachments = (findAttachments, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;
		let returnedAttachments = [];
		let count = 0;
		let returnedLimits = {};
		let limit = findAttachments.limit;
		let search = {};

		if (typeof findAttachments.search !== 'undefined') {
			search = findAttachments.search;
		}

		search.contentType = 'attachment';

		if (findAttachments.multiId) {
			// Working here
			// loop through ids, adding ObjectID string to searches
			const ids = findAttachments.multiId;
			var obj_ids = ids.map(function (item){ return ObjectId(item)});

			search._id = {$in: obj_ids};
		}

		returnedLimits.limit = Number(limit) || 0;
		returnedLimits.offset = Number(findAttachments.offset) || 0;

		let calc = (limit - 1);

		db[collection].find(search).sort({timestamp: -1}, (err, attachments) => {

			if (err) {
				done(err);
			}

			for (var i = 0; i < attachments.length; i++) {

				if (returnedLimits.limit === 0) {
					returnedAttachments.push(attachments[i]);
					continue;
				}

				if (returnedLimits.offset >= 1) {
					calc = (limit - 1 + returnedLimits.offset);
					if (i < (returnedLimits.offset)) {
						continue;
					}
				}

				if (i <= calc) {
					returnedAttachments.push(attachments[i]);
				} else {
					break;
				}

			}

			done(null, {attachmentCount: attachments.length, attachments: returnedAttachments, limits: returnedLimits});
		});
	};

	attachments.getAttachment = (attachmentId, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		db[collection].findOne({'_id':ObjectId(attachmentId), contentType: 'attachment'}, (err, post) => {
			if (err) {
				done(err);
			}

			done(null, post);
		});
	};

	attachments.deleteAttachment = (attachmentIds, done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		if (Object.prototype.toString.call(attachmentIds) !== '[object Array]') {
			attachmentIds = [attachmentIds];
		}

		let unlink = [];

		async.forEachOf(attachmentIds, (value, key, callback) => {

			let search = {'_id':ObjectId(value)};

			let getAttachmentData = (search, readyCallback) => {

				db[collection].find(search).toArray((err, docs) => {
					readyCallback(docs)
				});
			};

			getAttachmentData(search, (results) => {
				unlink.push(results[0].name)

				for(let t in results[0].thumbnails){
					unlink.push(results[0].thumbnails[t]);
				};

				db[collection].remove({'_id':ObjectId(results[0]._id)});
				callback();
			});
		}, (err) => {
			if (err){
				console.error(err.message);
			}

			for (let i = unlink.length - 1; i >= 0; i--) {
				if (fs.existsSync(path.join(CMS.uploadDir, unlink[i]))) {

					fs.unlinkSync(path.join(CMS.uploadDir, unlink[i]));
				} else {
					continue;
				}
			}

			done(null, 'done');

		});
	};

	return attachments;

}
