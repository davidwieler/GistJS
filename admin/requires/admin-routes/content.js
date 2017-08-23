const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let content = {};

	content.routes = () => {
		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/edit`,
			auth: true,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('edit');
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/edit/:id`,
			auth: true,
			function: (req, res, next) => {
				let msg = req.query.msg;
				if (typeof msg !== 'undefined') {
					CMS.renderAdminTemplate('edit', {data: req.params.id, msg});
				} else {
					CMS.renderAdminTemplate('edit', {id: req.params.id, msg});
				}
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/post-revision/:id`,
			auth: true,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('post-revision', req.params);
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/edit/:id`,
			auth: true,
			function: (req, res, next) => {
				const postId = req.params.id;
				let autoSave = false;
				req.body.postId = postId;

				if (req.body.autoSave) {
					autoSave = true;
					delete req.body.autoSave;
				}
				CMS.updatePost(req.body, req.body.postId, (err, result) => {

					if (result.noChange === true) {
						res.redirect('/' + CMS.adminLocation + '/edit/' + postId + '?msg=5');
						return;
					}

					if (result.ok === 1) {
						if (autoSave === true) {
							CMS.sendResponse(res, 200, result);
							return;
						}
						if (req.body.status === 'trash') {
							res.redirect('/' + CMS.adminLocation + '/posts?msg=4');
							return;
						} else {
							res.redirect('/' + CMS.adminLocation + '/edit/' + postId + '?msg=2');
						}
					} else {
						res.redirect('/' + CMS.adminLocation + '/edit/' + postId + '?msg=3');
					}
				});
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/edit`,
			auth: true,
			function: (req, res, next) => {
				CMS.createContent(req.body, req.body.contentType, (err, result) => {
					res.redirect('/' + CMS.adminLocation + '/edit/' + result + '?msg=1');
				});
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/categories`,
			auth: true,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('category-tag', {data: 'categories'});
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/categories`,
			auth: true,
			function: (req, res, next) => {
				CMS.createCategory(req.body.category[0]).then((result) => {
					res.redirect('/' + CMS.adminLocation + '/categories');
				})
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/categories/delete`,
			auth: true,
			function: (req, res, next) => {
				CMS.deleteCategories(req.body).then((result) => {
					CMS.sendResponse(res, 200, 'done')
				})
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/tags`,
			auth: true,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('category-tag', {data: 'tags'});
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/tags/delete`,
			auth: true,
			function: (req, res, next) => {
				console.log(req.body);
				CMS.deleteTags(req.body).then((result) => {
					CMS.sendResponse(res, 200, 'done')
				})
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/tags`,
			auth: true,
			function: (req, res, next) => {
				CMS.createTag(req.body.tag[0]).then((result) => {
					res.redirect('/' + CMS.adminLocation + '/tags');
				});
			}
		});

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/menus`,
			auth: true,
			function: (req, res, next) => {
				CMS.renderAdminTemplate('menus');
			}
		});
	}

	return content;
}
