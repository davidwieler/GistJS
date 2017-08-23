const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const Utils = require('../utils.js');
module.exports = (CMS, APP) => {

	var tags = {};

	tags.shapeTags = (data) => {
		if (!data.slug) {
			data.slug = '';
		}

		if (typeof data.name === 'object') {
			data.slug = []
			for (var i = 0; i < data.name.length; i++) {
				data.name[i] = APP.sanitizeHtml(data.name[i])
				data.slug.push(APP.sanitizeTitle(data.name[i]))
			}
		} else {
			data.slug = [APP.sanitizeHtml(APP.sanitizeTitle(data.slug || data.name))]
			data.name = [APP.sanitizeHtml(data.name)]
		}

		return data;

	}

	tags.createTag = (data, done) => {
		CMS.getTags((err, result) => {
			const db = CMS.dbData;
			const collection = CMS.dbConn.data.collection;
			const query = {contentType: 'tagList'};

			data = CMS._tags.shapeTags(data)

			if (result === 0) {
				if (typeof data.name === 'object') {
					tagList = {
						slug: Utils().arrayUnique(data.slug),
						name: Utils().arrayUnique(data.name)
					};
				} else {
					tagList = {
						slug: [APP.sanitizeTitle(data.name)],
						name: [APP.sanitizeHtml(data.name)]
					};
				}
			} else {
				const slugs = result.slug;
				const names = result.name;
				const newSlugs = data.slug;
				const newNames = data.name

				const sulgsConcat = Utils().arrayUnique(slugs.concat(newSlugs));
				const namesConcat = Utils().arrayUnique(names.concat(newNames));

				tagList = {
					slug: sulgsConcat,
					name: namesConcat
				}
			}

			const updateData = {
				tags: tagList,
				contentType: 'tagList'
			}

			CMS.dbUpsert(db, collection, query, updateData, (err, result) => {

				if (typeof done === 'function') {
					if (err) {
						done(err);
					}

					done(err, result);
				}
			});
		});
	}

	tags.getTags = (done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		let query = {contentType: 'tagList'};

		CMS.dbFind(db, collection, query)
		.then((result) => {
			if (result.length === 0) {
				done(null, 0);
			} else {
				done(null, result[0].tags);
			}
		})
		.catch((e) => {
			done(e);
		});
	}

	tags.deleteTags = (options, done) => {
		CMS.getTags((err, result) => {
			const tagSlugs = result.slug

			for (var i = 0; i < tagSlugs.length; i++) {
				if (tagSlugs[i] === options.slug) {
					result.slug.splice(i, 1);
					result.name.splice(i, 1);
				}
			}

			const tagList = {}

			const updateData = {
				tags: result,
				contentType: 'tagList'
			}

			const db = CMS.dbData;
			const collection = CMS.dbConn.data.collection;
			const query = {contentType: 'tagList'};

			CMS.dbUpsert(db, collection, query, updateData, (err, result) => {

				if (typeof done === 'function') {
					if (err) {
						done(err);
					}

					done(err, result);
				}
			});

			if (options.removeFromPosts) {
				CMS._tags.deleteTagFromPosts(options.slug)
			}
		});
	}

	tags.deleteTagFromPosts = (tag, done) => {

		const search = {}

		//CMS.getPosts({search: {'category.'}})

		console.log('deleteTagFromPosts', tag);

	}

	return tags;

}
