const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const Utils = require('../utils.js');
module.exports = (CMS, APP) => {

	var categories = {};

	categories.shapeCategories = (data) => {
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

	categories.createCategory = (data, done) => {

		CMS.getCategories((err, result) => {

			const db = CMS.dbData;
			const collection = CMS.dbConn.data.collection;
			const query = {contentType: 'categoryList'};

			let categoryList;

			data = CMS._categories.shapeCategories(data)

			if (result === 0) {
				if (typeof data.name === 'object') {
					categoryList = {
						slug: Utils().arrayUnique(data.slug),
						name: Utils().arrayUnique(data.name)
					};
				} else {
					categoryList = {
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

				categoryList = {
					slug: sulgsConcat,
					name: namesConcat
				}
			}

			const updateData = {
				categories: categoryList,
				contentType: 'categoryList'
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

	categories.getCategories = (done) => {
		const db = CMS.dbData;
		const collection = CMS.dbConn.data.collection;

		let query = {contentType: 'categoryList'};

		CMS.dbFind(db, collection, query)
		.then((result) => {
			if (result.length === 0) {
				done(null, 0);
			} else {
				done(null, result[0].categories);
			}
		})
		.catch((e) => {
			done(e);
		});
	}

	categories.deleteCategories = (options, done) => {
		CMS.getCategories((err, result) => {
			const categorySlugs = result.slug

			for (var i = 0; i < categorySlugs.length; i++) {
				if (categorySlugs[i] === options.slug) {
					result.slug.splice(i, 1);
				    result.name.splice(i, 1);
				}
			}

			const categoryList = {}

			const updateData = {
				categories: result,
				contentType: 'categoryList'
			}


			const db = CMS.dbData;
			const collection = CMS.dbConn.data.collection;
			const query = {contentType: 'categoryList'};

			CMS.dbUpsert(db, collection, query, updateData, (err, result) => {

				if (typeof done === 'function') {
					if (err) {
						done(err);
					}

					done(err, result);
				}
			});

			if (options.removeFromPosts) {
				CMS._categories.deleteCategoryFromPosts(options.slug)
			}
		});
	}

	categories.deleteCategoryFromPosts = (category, done) => {

		const search = {}

		//CMS.getPosts({search: {'category.'}})

		console.log('deleteCategoryFromPosts', category);

	}

	return categories;

}
