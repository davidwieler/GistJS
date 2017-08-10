const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

// Routing files
const login = require('./login.js');
const mediaUploads = require('./mediauploads.js');
const dashboard = require('./dashboard.js');
const settings = require('./settings.js');
const users = require('./users.js');
const content = require('./content.js');
const themes = require('./themes.js');
const plugins = require('./plugins.js');
const system = require('./system.js');
const api = require('./api.js');

module.exports = (CMS, APP) => {

	let init = {};

	init.init = () => {
		login(CMS, APP).routes()
		dashboard(CMS, APP).routes()
		mediaUploads(CMS, APP).routes()
		settings(CMS, APP).routes()
		users(CMS, APP).routes()
		content(CMS, APP).routes()
		themes(CMS, APP).routes()
		plugins(CMS, APP).routes()
		system(CMS, APP).routes()
		api(CMS, APP).routes()
	};

	return init;
}
