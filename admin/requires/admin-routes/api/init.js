module.exports = (CMS, APP) => {

	let route = {};

	route.init = () => {

		if (!CMS.apiRequestRoutes.post) {
			CMS.apiRequestRoutes.post = {};
		}

		require('./post.js')(CMS, APP).createRoutes();

		if (!CMS.apiRequestRoutes.get) {
			CMS.apiRequestRoutes.get = {};
		}

		if (!CMS.apiRequestRoutes.put) {
			CMS.apiRequestRoutes.put = {};
		}

		if (!CMS.apiRequestRoutes.delete) {
			CMS.apiRequestRoutes.delete = {};
		}

		route.post = {}
	}

	return route;
}
