const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let login = {};

	login.routes = () => {

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/forgot-password`,
			auth: false,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('forgot-password', { message: ''});
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/forgot-password`,
			auth: false,
			function: (req, res, next) => {
				if (req.body.user === '') {
					CMS.renderAdminTemplate('forgot-password', {message: 'Please enter your username or email'});
					return;
				}
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/logout`,
			auth: false,
			function: (req, res, next) => {
				req.session.destroy(function() {
				    res.clearCookie(global.cms.cookieName);
				    res.redirect('/' + CMS.adminLocation + '/login');
				});
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/login`,
			auth: false,
			function: (req, res, next) => {
				res.clearCookie(global.cms.cookieName);
				CMS.renderAdminTemplate('login', { message: ''});
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/login`,
			auth: false,
			function: (req, res, next) => {
				CMS.passport.authenticate('local-login', function(err, user, info) {
					if (err) {
						return next(err);
					}

					if (!user) {
						CMS.renderAdminTemplate('login', {message: info});
						return;
					}

					CMS.req.logIn(user, function(err) {
						if (err) { return next(err); }

					    return CMS.res.redirect('/' + CMS.adminLocation + '/dashboard/');

					});
				})(req, res, next);
			}
		});
	}

	return login;
}
