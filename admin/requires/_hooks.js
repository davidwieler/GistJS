const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const async = require('async');

module.exports = (CMS, APP) => {

	var hooks = {};

	hooks.init = () => {

		// Set up some default hook types
		// object key is the name of the template being rendered

		let hooks = {
			dashboard: {},
			mediaUpload: {},
			'category-tag': {},
			users: {},
			tools: {},
			'post-revision': {},
			all: {}
		};

		return hooks;
	};

	hooks.addHookType = (hookType) => {
		if (typeof CMS.hooks[hookType] === 'undefined') {
			CMS.hooks[hookType] = {};
		}
	}

	hooks.addHook = (name, location, position, func) => {
		// TODO: add position insertion for hooks
		CMS.addHookType(location);
		CMS.hooks[location][name] = func;
	}

	hooks.doHook = (location, done) => {
		const doTheseHooks = CMS.hooks[location];
		const doAllHooks = CMS.hooks['all'];
		let returns = {};
		let promises = [];

		for(var h in doTheseHooks){
			if (doTheseHooks.hasOwnProperty(h)){
				promises.push({slug: APP.textToSlug(h), func: doTheseHooks[h]});
			}
		}

		for(var h in doAllHooks){
			if (doAllHooks.hasOwnProperty(h)){
				promises.push({slug: APP.textToSlug(h), func: doAllHooks[h]});
			}
		}

		async.forEachOf(promises, (value, key, callback) => {

			if (typeof value.func === 'string') {
				returns[value.slug] = value.func;
				callback();
			}

			if (typeof value.func === 'function') {
				value.func((results) => {
					returns[value.slug] = results;
					callback();
				});
			}
		}, (err) => {
			if (err) {
				done(err);
			}
			done(null, returns);
		});
	}


	return hooks;

}
