const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let users = {};

	users.routes = () => {

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/update-user`,
			auth: true,
			function: (req, res, next) => {
				const data = {
					roles: CMS.rolesAndCaps.getRoleTypes(),
					formData: req.body
				};

				switch (req.body.formType) {
					case 'new':

						if (req.body.username === '' || req.body.email === '' || req.body.password === '') {
							res.redirect('/' + CMS.adminLocation + '/users/add?msg=95');
							return;
						}

						CMS.createUser(req.body)
						.then((user) => {
							res.redirect('/' + CMS.adminLocation + '/user/edit/' + user._id + '?msg=98');
						})
						.catch((e) => {
							delete req.body.formType;
							delete req.body.password;
							if (e.message === 'user exists') {
								res.redirect('/' + CMS.adminLocation + '/users/add?msg=96&' + CMS._utilities.serialize(req.body));
							} else {
								res.redirect('/' + CMS.adminLocation + '/users/add?msg=97');
							}
						});
					break;
					case 'update':

						const userId = data.formData.userId;
						delete data.formData.userId;
						delete data.formData.formType;

						data.formData.accounttype = data.formData.accounttype.toLowerCase();

						if (data.formData.password) {
							data.formData.pass = CMS._utilities.hash(data.formData.password);
						}

						delete data.formData.password;

						CMS.updateUser(userId, data.formData)
						.then((user) => {
							res.redirect('/' + CMS.adminLocation + '/user/edit/' + userId + '?msg=98');
						})
						.catch((e) => {
							res.redirect('/' + CMS.adminLocation + '/user/edit/' + userId + '?msg=94');
						});
					break;

				}
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/users/add`,
			auth: true,
			function: (req, res, next) => {
				let msg = req.query.msg;
				const results = {
					roles: CMS.rolesAndCaps.getRoleTypes()
				};
				CMS.renderAdminTemplate('user-new', results, msg);
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/users`,
			auth: true,
			function: (req, res, next) => {
				let msg = req.query.msg;

				CMS.getUsers({}, (err, results) => {
					CMS.renderAdminTemplate('users', results, msg);
				});
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/user/edit/:id`,
			auth: true,
			function: (req, res, next) => {
				let msg = req.query.msg;

				const searchThisUser = {
					search: {
						_id: req.params.id
					}
				}

				const searchGetEditors = {
					search: {
						accounttype: 'editor'
					}
				}

				CMS.Promise.join(CMS.getUsers(searchThisUser), CMS.getUsers(searchGetEditors), (results, editors) => {
					results.roles = CMS.rolesAndCaps.getRoleTypes();
					results.userId = req.params.id;
					results.editors = editors
					CMS.renderAdminTemplate('user-edit', results, msg);

				});
			}
		});
	}

	return users;
}
