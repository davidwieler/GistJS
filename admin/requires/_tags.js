const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const Utils = require('../utils.js');
module.exports = (CMS) => {

	var tags = {};

	tags.createTag = (data, done) => {
		CMS.getTags((err, result) => {
			const db = CMS.dbData;
			const collection = CMS.dbConn.data.collection;
			const query = {contentType: 'tagList'};

			let tagList;

			if (result === 0) {
				categoryList = {
					slug: [data.slug],
					name: [data.name]
				};
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
				categories: tagList,
				contentType: 'tagList'
			}

			CMS.dbUpdate(db, collection, query, updateData, (err, result) => {
				if (err) {
					done(err);
				}

				done(err, result);
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
				console.log(result[0].tags);
				done(null, result[0].tags);
			}
		})
		.catch((e) => {
			done(e);
		});
	}

	return tags;

}
