const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let plugins = {};

	plugins.routes = () => {

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/plugins`,
			auth: true,
			function: (req, res, next) => {
				let msg = req.query.msg;
				CMS.renderAdminTemplate('plugins', req.params, msg);
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/plugins`,
			auth: true,
			function: (req, res, next) => {
				// TODO: enable/ disable plugins
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/plugin/action`,
			auth: true,
			function: (req, res, next) => {
				CMS._plugins.pluginAction(req.body, (err, response) => {
					if (response === 'disabled' || response === 'enabled') {
						CMS.sendResponse(res, 200, response);
						CMS._messaging.generateSystemAlert({
							title: 'Plugin activated',
							message: `${req.body.plugin} plugin has been ${response}`,
							type: 'info',
							persistent: true,
							showOnce: true,
							adminPush: true
						});
						var events = Events();
						events.restartServer(500);
					} else {
						CMS.sendResponse(res, 200, 'failed')
					}
				})
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/plugin/:plugin/:page`,
			auth: true,
			function: (req, res, next) => {
				console.log('asd');
				CMS.renderPluginTemplate(res, req.params.plugin, req.params.page);
			}
		});
	}

	return plugins;
}
