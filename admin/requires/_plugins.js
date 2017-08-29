const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const APP = require('../assets/js/core/app.js');
const _ = require('lodash');
module.exports = (CMS) => {

	var plugins = {};

	plugins.initPlugins = (findUsers, done) => {
		if (typeof CMS.pluginDir === 'undefined') {
			return
		}
		let plugins = fs.readdirSync(CMS.pluginDir);
		CMS.activePlugins = {
			admin: [],
			user: []
		};
		CMS.pluginDetails = [];

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
				pluginInfo.path = pluginFolder
				let pluginRoutes = pluginInfo.routes;

				let details = {
					pluginName: pluginInfo.name,
					pluginPath: pluginPath,
					pluginInfo: pluginInfo
				}

				if (pluginInfo.init) {
					details.pluginFile = path.join(pluginPath, pluginInfo.init);
				}

				CMS.pluginDetails.push(details);

				if (pluginInfo.active === true) {

					if (pluginInfo.require) {
						CMS.plugins[pluginInfo.name] = require(path.join(pluginPath, pluginInfo.require))(CMS, APP);
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

	plugins.getPluginInfo = (pluginName, done) => {

		const info = _.find(CMS.pluginDetails, function(o) {
		    return o.pluginInfo.name === pluginName;
		})

		let result = '';

		if (typeof done === 'function') {
			if (info === 'undefined') {
				done('not found');
			} else {
				done(null, info);
			}

			return;
		}

		if (typeof info === 'undefined') {
			result = 'not found'
		} else {
			result = info
		}

		return result;

	};

	plugins.getPluginConfig = (pluginLocation, done) => {
		let config;
		let location;

		try{
			location = path.join(CMS.pluginDir, pluginLocation, 'plugin.json');
			config = require(location);
		}
		catch(e){
			config = {};
		}

		done(null, config, location);
	};

	plugins.enablePlugin = (path, done) => {
		CMS._plugins.getPluginConfig(path, (err, config, location) => {

			Object.assign(config, {active: true});

			let string = JSON.stringify(config, null, '\t');

			fs.writeFile(location, string, (err) => {
				if (err) {
					return done(err);
				}

				setTimeout(() => {
					var events = Events();
					events.restartServer();
				}, 1500);

				done(null, true);
			});
		});
	};

	plugins.disablePlugin = (path, done) => {
		CMS._plugins.getPluginConfig(path, (err, config, location) => {

			Object.assign(config, {active: false});

			let string = JSON.stringify(config, null, '\t');

			fs.writeFile(location, string, (err) => {
				if (err) {
					return done(err);
				}

				done(null, true);
			});
		});
	};

	plugins.pluginAction = (plugin, done) => {

		const pluginInfo = CMS._plugins.getPluginInfo(plugin.plugin);

		switch (plugin.action) {

			case 'enable-plugin':
				if (pluginInfo === 'not found') {
					done(null, 'Plugin not found');
				} else {
					CMS._plugins.enablePlugin(pluginInfo.pluginInfo.path, (result) => {
						done(null, 'enabled')
					})
				}
			break;

			case 'disable-plugin':
				if (pluginInfo === 'not found') {
					done(null, 'Plugin not found');
				} else {
					CMS._plugins.disablePlugin(pluginInfo.pluginInfo.path, (result) => {
						done(null, 'disabled')
					})
				}
			break;

			case 'delete-plugin':
				done(null, 'deleted');
			break;

			default:
				done(null, 'No action found');
			break;

		}
	};

	plugins.addPluginRoute = (route) => {
		const startRoute = `/${CMS.adminLocation}/${route}`;
		//console.log(startRoute);
	};

	return plugins;

}
