const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');
const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;

module.exports = (CMS, APP) => {

	let api = {};

	api.init = () => {
		CMS.apiResponse = api.response;

		// Require all our default API routes
		require('./api/init.js')(CMS, APP).init();
	};

	api.requestRoute = () => {

	};

	api.security = () => {

		const details = {
			isSiteSSL: /https/.test(CMS.req.protocol),
			forcedApiSSL: CMS.forceApiSSL,
			ip: CMS.req.headers['x-forwarded-for'] || CMS.req.connection.remoteAddress,
			whiteList: [],
			blackList: [],
			contentType: CMS.req.get('Content-Type'),
			contentTypeJson: CMS.req.is('application/json')
		}

		return details;
	}

	api.response = (statusCode, message, data) => {
		const response = {
			statusCode: statusCode || {},
			message: message || {},
			data: data || {}
		}

		CMS.sendResponse(CMS.res, statusCode, response);
	}

	api.routes = () => {
		api.init();

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/api`,
			function: (req, res, next) => {
				if (!api.security().isSSL && api.security().forcedSSL) {
					api.response(400, 'no SSL found');
					return;
				}

				api.response(200, 'success', {status: 'Up'});

			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/api`,
			apiAuth: true,
			function: (req, res, next) => {
				console.log('test');
				console.log(api.security());
				if (!api.security().isSSL && api.security().forcedApiSSL) {
					api.response(403, 'no SSL found');
					return;
				}
				/*
				if (typeof api.security().contentType === 'undefined' || !api.security().contentTypeJson) {
					api.response(406, 'invalid content-type, application/json only');
					return;
				}
				*/

				if (!CMS.apiRequestRoutes.post[req.body.type]) {
					CMS.sendResponse(res, 404, 'Resource not found')
				} else {
					CMS.apiRequestRoutes.post[req.body.type](req, res, next)
				}


			}
		});

		CMS.createRoute({
			type: 'put',
			url: `${CMS.adminLocation}/api`,
			auth: false,
			function: (req, res, next) => {
				if (!api.security().isSSL && api.security().forcedSSL) {
					api.response(400, 'no SSL found');
					return;
				}

				if (typeof api.security().contentType === 'undefined' || !api.security().contentTypeJson) {
					api.response(400, 'invalid content-type, application/json only');
					return;
				}

				api.response(200, 'success', {test: 'test'});
			}
		});

		CMS.createRoute({
			type: 'patch',
			url: `${CMS.adminLocation}/api`,
			auth: false,
			function: (req, res, next) => {
				if (!api.security().isSSL && api.security().forcedSSL) {
					api.response(400, 'no SSL found');
					return;
				}

				if (typeof api.security().contentType === 'undefined' || !api.security().contentTypeJson) {
					api.response(400, 'invalid content-type, application/json only');
					return;
				}

				api.response(200, 'success', {test: 'test'});
			}
		});

		CMS.createRoute({
			type: 'delete',
			url: `${CMS.adminLocation}/api`,
			auth: false,
			function: (req, res, next) => {
				if (!api.security().isSSL && api.security().forcedSSL) {
					api.response(400, 'no SSL found');
					return;
				}

				if (typeof api.security().contentType === 'undefined' || !api.security().contentTypeJson) {
					api.response(400, 'invalid content-type, application/json only');
					return;
				}

				api.response(200, 'success', {test: 'test'});
			}
		});

		// This needs to be removed eventually.......
		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/api/updates`,
			auth: true,
			function: (req, res, next) => {
				const coreVersion = 0.5;
				const sentVersion = req.body.version;
				let msg;

				if (!isNaN(parseInt(sentVersion))) {
					if (coreVersion > sentVersion) {
						msg = 'update available';
					} else {
						msg = 'no update available';
					}
				} else {
					msg = 'invalid version sent';
				}

				CMS.sendResponse(res, 200, msg);
				return;
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/api/attachmentsss`,
			auth: true,
			function: (req, res, next) => {
				if (req.body.id) {
					let post = CMS.getAttachment(req.body.id, (err, result) => {
						CMS.sendResponse(res, 200, result);
					});
					return
				}

				let findAttachments = {
					limit: 20
				}

				if (req.body.limit) {
					findAttachments.limit = req.body.limit
				}

				if (req.body.offset) {
					findAttachments.offset = req.body.offset
				}

				if (req.body.search) {
					findAttachments.search = req.body.search;
				}

				CMS.getAttachments(findAttachments, (err, result) => {
					CMS.sendResponse(res, 200, result);
				});
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/api/posts`,
			auth: false,
			function: (req, res, next) => {
				if (req.body.id && ObjectId(req.body.id)) {
					let post = CMS.getPostById(ObjectId(req.body.id), (err, result) => {
						CMS.sendResponse(res, 200, result);
					});
					return
				}

				let findPosts = {
					limit: 20
				}

				let limit = 20;

				if (req.body.limit) {
					findPosts.limit = req.body.limit;
				}

				if (req.body.offset) {
					findPosts.offset = req.body.offset;
				}

				if (req.body.search) {
					findPosts.search = req.body.search;
				}

				if (req.body.multiId) {
					findPosts.multiId = true;
				}

				CMS.getPosts(findPosts, (err, result) => {
					CMS.sendResponse(res, 200, {posts: result, limit: findPosts.limit});
				});
			}
		});
	}

	return api;
}
