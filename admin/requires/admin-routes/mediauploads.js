const fs = require('fs');
const path = require('path');
const Events = require('../../events.js');
const request = require('request');
const _ = require('lodash');

module.exports = (CMS, APP) => {

	let mediaUploads = {};

	mediaUploads.routes = () => {

		CMS.createRoute({
			type: 'get',
			url: `${CMS.adminLocation}/media`,
			auth: true,
			function: (req, res, next) => {
				let findAttachments = {
					limit: 20
				}

				let limit = req.query.limit;
				let offset = req.query.offset;
				let msg = req.query.msg;

				if (typeof limit !== 'undefined') {
					findAttachments.limit = limit
				}

				if (typeof offset !== 'undefined') {
					findAttachments.offset = offset
				}

				if (req.query.delete) {
					CMS.deleteAttachment(req.query.delete, (result) => {
						res.redirect('/' + CMS.adminLocation + '/media');
					});
					return;
				}

				CMS.getAttachments(findAttachments, (err, result) => {
					const templateData = {
						data : {
							attachments: result, limit: findAttachments.limit
						},
						msg: msg
					}
					CMS.renderAdminTemplate('media', templateData);
				});
			}
		});

		CMS.createRoute({
			type: 'post',
			url: `${CMS.adminLocation}/upload`,
			auth: true,
			function: (req, res, next) => {
				/*
					TODO:
					- Add support for Adobe file formats (PSD, AI, EPS, etc..)
					- Set file size limit somehow
					- Set file type white/blacklist
				*/
				let formidable = require('formidable');

				// create an incoming form object
				let form = new formidable.IncomingForm();

				// specify that we want to allow the user to upload multiple files in a single request
				form.multiples = true;

				// store all uploads in the /uploads directory
				form.uploadDir = CMS.uploadDir;

				// every time a file has been uploaded successfully,
				// rename it to it's orignal name
				form.on('file', function(field, file) {

					let fullFilePath = file.path;
					let filePath = fullFilePath.replace(__dirname, '');

					let data = {
						name: file.name,
						originalName: file.name,
						size: file.size,
						fileType: file.type,
						postId: field || ''
					}

					let fileName = file.name;
					let fileExt = fileName.split('.').pop();
					let named = fileName.substr(0, fileName.lastIndexOf('.'))

					CMS.getAttachments({search:{originalName: data.originalName}}, (err, result) => {
						if (result.attachmentCount >= 1) {
							//data.name = named + '_' + result.length + '.' + fileExt;
							named = named + '_' + result.attachmentCount;
						}

						data.name = named + '.' + fileExt;
						data.realPath = '/uploads/' + data.name

						fs.rename(file.path, path.join(form.uploadDir, data.name), () => {
							let image = {
								path: path.join(form.uploadDir, data.name),
								fileName: named,
								ext: '.' + fileExt
							};

							const createContent = (data) => {
								CMS.createContent(data, 'attachment', (err, id) => {
									data._id = id;
									CMS.sendResponse(res, 200, data);
								});
							}

							if (!data.name.match(/.(jpg|jpeg|png|gif)$/i)){
								createContent(data)
							} else {
								CMS.generateThumbnail(image, (err, result) => {
									data.thumbnails = result;

									createContent(data)
								});
							}

						});
					})
				});

				// log any errors that occur
				form.on('error', function(err) {
					console.log('An error has occured: \n' + err);
				});

				// once all the files have been uploaded, send a response to the client
				form.on('end', function() {
					//res.end('success');
				});

				// parse the incoming request containing the form data
				form.parse(req);
			}
		});
	}

	return mediaUploads;
}
