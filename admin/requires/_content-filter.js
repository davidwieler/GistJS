module.exports = (options, req, res, next) => {

	options = options || {};

	const checkNames = options.checkNames || true;
	const typeList = options.typeList || ['object', 'function', 'string'];
	const urlBlackList = options.urlBlackList || ['$','{'];
	const bodyBlackList = options.bodyBlackList || ['$'];
	const methodList = options.methodList || ['GET', 'POST', 'PUT', 'DELETE'];
	const urlMessage = options.urlMessage || 'A forbidden expression has been found in URL: ';
	const bodyMessage = options.bodyMessage || 'A forbidden expression has been found in form data: ';
	const appendFound = options.appendFound || false;
	const caseSensitive = (options.caseSensitive === false) ? false : true;
	const useAsMiddleware = (options.useAsMiddleware === true) ? true : false;

	const dispatchToErrorHandler = () => {
		let dispatchTypeCheck = typeof options.dispatchToErrorHandler;
		let dispatchType;

		if (dispatchTypeCheck === 'function') {
			dispatchType = 'func';
		}

		if (dispatchTypeCheck === 'boolean') {
			dispatchType = 'bool';
		}

		if (dispatchTypeCheck === 'string' || dispatchTypeCheck === 'object') {
			dispatchType = 'na';
		}
		return {handler: options.dispatchToErrorHandler, type: dispatchType};
	}

	// Determine type of dispatch
	const dispatchDetails = dispatchToErrorHandler();

	const doFilter = (req, res, next) => {
		let found = null;
		let returns;

		if (useAsMiddleware) {
			returns = next;
		} else {
			returns = dispatchToErrorHandler.handler;
		}

		if (methodList.indexOf(req.method) === -1) {
			return next();
		}
		console.log('test');
	};

	const doNext = (next) => {
		next();
	}

	if (useAsMiddleware) {
		return function filter(req, res, next) {
			doFilter(req, res, next);
		};
	} else {
		doFilter(req, res, next);
	}

}
