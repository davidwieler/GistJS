let self = module.exports = (mongojs, settings) => {

	let db = {};

	db.dataInit = () => {
		return mongojs(settings.data.url, [settings.data.collection]);
	};

	db.accountInit = () => {
		return mongojs(settings.accounts.url, [settings.accounts.collection]);
	};

	return db;
};