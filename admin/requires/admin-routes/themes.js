const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let themes = {};

	themes.routes = () => {
		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/themes`,
			auth: true,
			function: (req, res, next) => {
				let msg = req.query.msg;
				CMS.renderAdminTemplate('themes', req.params, msg);
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/themes`,
			auth: true,
			function: (req, res, next) => {
				CMS.themeSwitch(req.body.themeId, res, (newTheme) => {
					res.redirect('/' + CMS.adminLocation + '/themes?msg=1');
				});
			}
		});
	}

	return themes;
}
