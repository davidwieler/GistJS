const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const Utils = require('../utils.js');
module.exports = (CMS) => {

	var categories = {};

	categories.createCategory = (data, done) => {
		CMS.getCategories((result) => {

			const db = CMS.dbData;
			const collection = CMS.dbConn.data.collection;
			const query = {contentType: 'categoryList'};

			let categoryList;

			if (result === null) {
				categoryList = data;
			} else {
				const slugs = result.slug;
				const names = result.name;
				const newSlugs = data.slug;
				const newNames = data.name

				const sulgsConcat = Utils().arrayUnique(slugs.concat(newSlugs));
				const namesConcat = Utils().arrayUnique(names.concat(newNames));

				categoryList = {
					slug: sulgsConcat,
					name: namesConcat
				}
			}

			const updateData = {
				categories: categoryList,
				contentType: 'categoryList'
			}

			db[collection].update(query, updateData, {upsert: true}, (err, result) => {
				if (err) {
					done(err);
				}
				if (typeof done === 'function') {
					done(null, result);
				}
			});
		});
	}

	categories.getCategories = (done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		let query = {contentType: 'categoryList'};

		db[collection].find(query, (err, result) => {
			if (err) {
				done(err);
			}

			if (result.length === 0) {
				done(null, 0);
			} else {
				done(null, result[0].categories);
			}

		});
	}

	return categories;

}
