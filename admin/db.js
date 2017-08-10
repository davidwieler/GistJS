const _ = require('lodash');

let self = module.exports = (mongojs, settings) => {

	let db = {};

	db.dataInit = () => {
		return mongojs(settings.data.url, [settings.data.collection]);
	};

	db.accountInit = () => {
		return mongojs(settings.accounts.url, [settings.accounts.collection]);
	};

	db.sortResults = (array, sort, done) => {
		console.log(sort);

		// TODO: Changes this to use an anon function, for case insensitive sorting
		const doSort = _.sortBy(array, sort.by);

		if (sort.order === 'desc') {
			doSort.reverse();
		}

		return doSort

	};

	db.update = (db, collection, search, data, done) => {
		db[collection].update(
			search,
			{$set: data},
			(err, response) => {

				if (err) {
					done(err);
				}

				done(null, response);

			}
		)
	};

	db.upsert = (db, collection, search, data, done) => {
		db[collection].update(
			search,
			{$set: data},
			{upsert: true},
			(err, response) => {

				if (err) {
					done(err);
				}

				done(null, response);

			}
		)
	};

	db.save = (db, collection, data, done) => {
		db[collection].save(data, function(err) {
			if (err){
				done(err);
			}

			done(null, data);
		});
	};

	db.find = (db, collection, search, done) => {
		console.log('test search log [db.js]', search);

		let doSort = false;
		let sort = false;

		if (search.sort) {
			doSort = true;
			sort = search.sort;
			delete search.sort;
		}

		db[collection].find(search, (err, results) => {
			if (err) {
				done(err);
			}

			if (!doSort) {
				done(null, results);
			} else {
				done(null, CMS.dbSort(results, sort));
			}

		});
	};

	db.findOne = (db, collection, search, done) => {
		db[collection].findOne(search, function(err, results){
			if (err) {
				done(err);
			}

			done(null, results);
		});
	};

	db.insert = (db, collection, data, done) => {
		db[collection].insert(data, function(err) {
			if (err){
				done(err);
			}

			done(null, data);
		});
	};

	db.delete = (db, collection, search, done) => {
		if (err) {
			done(err);
		}

		done(null, result);
	};

	return db;
};
