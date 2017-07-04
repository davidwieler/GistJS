let self = module.exports = (mongojs, settings) => {

	let db = {};

	db.dataInit = () => {
		return mongojs(settings.data.url, [settings.data.collection]);
	};

	db.accountInit = () => {
		return mongojs(settings.accounts.url, [settings.accounts.collection]);
	};

	db.update = (db, collection, search, data, done) => {
		db[collection].update(
			search,
			{ $set: data},
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
		console.log('test search log', search);
		db[collection].find(search, (err, results) => {
			if (err) {
				done(err);
			}

			done(null, results);
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

	db.insert = () => {};

	db.delete = () => {};

	return db;
};
