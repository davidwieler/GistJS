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
			type: 'get',
			url: `${CMS.adminLocation}/plugin/:plugin/:page`,
			auth: true,
			function: (req, res, next) => {
				CMS.renderPluginTemplate(res, req.params.plugin, req.params.page);
			}
		});
	}

	return plugins;
}
