const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const APP = require('../assets/js/core/app.js');
module.exports = (CMS) => {

	var plugins = {};

	plugins.initPlugins = (findUsers, done) => {
		let plugins = fs.readdirSync(CMS.pluginDir);
		CMS.activePlugins = {
			admin: [],
			user: []
		};
		CMS.pluginDetails = [];
		CMS.activePluginRoutes = [];

		if (plugins.length !== 0) {
			CMS.plugins = {};
			for (let i = plugins.length - 1; i >= 0; i--) {
				if (plugins[i] === '.DS_Store') {
					continue;
				}
				let pluginFolder = plugins[i];
				let pluginPath = path.join(CMS.pluginDir, pluginFolder);
				let pluginJson = pluginPath + '/plugin.json';
				let pluginInfo = JSON.parse(fs.readFileSync(pluginJson, 'utf-8'));
				let pluginRoutes = pluginInfo.routes;

				let details = {
					pluginName: pluginInfo.name,
					pluginPath: pluginPath,
					pluginFile: path.join(pluginPath, pluginInfo.init),
					pluginInfo: pluginInfo
				}

				CMS.pluginDetails.push(details);

				if (pluginInfo.active === true) {

					if (pluginInfo.require) {
						CMS.plugins[pluginInfo.name] = require(path.join(pluginPath, pluginInfo.require))(CMS, APP);
					}

					pluginInfo.path = path.join(pluginFolder);

					if (Object.prototype.toString.call(pluginRoutes) === '[object Array]') {
						for (let i = pluginRoutes.length - 1; i >= 0; i--) {
							CMS.activePluginRoutes.push(pluginInfo)
						}
					}

					switch (pluginInfo.type) {
						case 'admin' :
							CMS.activePlugins.admin.push(details);
						break;

						default :
						case 'user' :
							CMS.activePlugins.user.push(details);
						break;
					}
				}
			}
		}
	};

	plugins.enablePlugin = (plugin) => {

	};

	plugins.disablePlugin = (plugin) => {

	};

	return plugins;

}
