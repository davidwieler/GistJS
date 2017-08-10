module.exports = (CMS, APP) => {

	let post = {};

	post.createRoutes = () => {

		CMS.apiRequestRoutes.post.attachments = (req, res, next) => {
			if (req.body.id) {
				CMS.getAttachment(req.body.id)
				.then((result) => {
					CMS.apiResponse(200, 'success', result);
				})
				.catch((e) => {
					CMS.apiResponse(500, 'error');
				})
			} else {

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

				CMS.getAttachments(findAttachments)
				.then((result) => {

					console.log(result);

					if (result.attachmentCount == 0) {
						CMS.apiResponse(200, 'empty', 'no attachments found');
					} else{
						CMS.apiResponse(200, 'success', result);
					}

				})
				.catch((e) => {
					CMS.apiResponse(500, 'error');
				})
			}

		}

		CMS.apiRequestRoutes.post.posts = (req, res, next) => {
			if (req.body.id) {
				CMS.getPostById(req.body.id)
				.then((result) => {
					CMS.apiResponse(200, 'success', result);
				})
				.catch((e) => {
					CMS.apiResponse(500, 'error');
				})
			} else {

				let findPosts = {
					limit: 20
				}

				if (req.body.limit) {
					findPosts.limit = req.body.limit
				}

				if (req.body.offset) {
					findPosts.offset = req.body.offset
				}

				if (req.body.search) {
					findPosts.search = req.body.search;
				}

				CMS.getPosts(findPosts)
				.then((result) => {

					if (result.postCount == 0) {
						CMS.apiResponse(200, 'empty', 'no posts found');
					} else{
						CMS.apiResponse(200, 'success', result);
					}

				})
				.catch((e) => {
					CMS.apiResponse(500, 'error', e);
				})
			}

		}

		CMS.apiRequestRoutes.post.dismissMessage = (req, res, next) => {

		}

		CMS.apiRequestRoutes.post.setFeatureImage = (req, res, next) => {

		}

		CMS.apiRequestRoutes.post.generateApiKey = (req, res, next) => {

		}
	}

	return post;
}
