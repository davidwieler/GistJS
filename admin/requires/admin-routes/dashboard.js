const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let dashboard = {};

	dashboard.routes = () => {

		CMS.createRoute({
			type: 'get',
			url: ['/' + CMS.adminLocation + '/dashboard', '/' + CMS.adminLocation + '/'],
			auth: true,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('dashboard');
			}
		});
	}

	return dashboard;
}
