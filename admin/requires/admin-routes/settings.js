const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let settings = {};

	settings.routes = () => {

		if (CMS.multiSite) {
			CMS.createRoute({
				type: 'get',
				url: `${CMS.adminLocation}/settings/network`,
				auth: true,
				networkAdmin: true,
				function: (req, res, next) => {
					CMS.renderAdminTemplate('settings', req.params);
				}
			});
		}

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/settings`,
			auth: true,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('settings', req.params);
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/settings`,
			auth: true,
			function: (req, res, next) => {
				let settings = {};

				if (!req.body.maintenance) {
					settings.maintenance = false;
				} else {
					settings.maintenance = true;
				}

				if (!req.body.postRevisions) {
					settings.postRevisions = false;
				} else {
					settings.postRevisions = true;
				}

				if (!req.body.imageRevisions) {
					settings.imageRevisions = false;
				} else {
					settings.imageRevisions = true;
				}

				if (!req.body.prettyPagination) {
					settings.prettyPagination = false;
				} else {
					settings.prettyPagination = true;
				}

				if (!req.body.custom404) {
					settings.custom404 = false;
				} else {
					settings.custom404 = true;
				}

				if (!req.body.custom500) {
					settings.custom500 = false;
				} else {
					settings.custom500 = true;
				}

				if (!req.body.anyoneRegister) {
					settings.anyoneRegister = false;
				} else {
					settings.anyoneRegister = true;
				}

				const settingsJson = _.merge(req.body, settings);
				CMS.writeConfig(settingsJson).then((result) => {
					res.redirect('/' + CMS.adminLocation + '/settings?msg=1');
				})
			}
		});
	}

	return settings;
}
