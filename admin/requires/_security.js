const _ = require('lodash');
const hat = require('hat');
module.exports = (CMS, APP) => {

	let security = {};

	security.init = () => {

		if (!CMS.securityDetails) {
			CMS.securityDetails = {
				faults: {}
			};
		}
		security.checkDatabaseSecurity();

	};

	security.checkDatabaseSecurity = () => {
		CMS.securityDetails.faults.dbUsername = _.isEmpty(CMS.config.dbUsername);
		CMS.securityDetails.faults.dbPassword = _.isEmpty(CMS.config.dbPassword);

		if (CMS.securityDetails.faults.dbUsername || CMS.securityDetails.faults.dbPassword) {
			let errorProblem = [];
			let returns = '';
			if (CMS.securityDetails.faults.dbUsername) {
				errorProblem.push('username')
			}
			if (CMS.securityDetails.faults.dbPassword) {
				errorProblem.push('password')
			}

			if (errorProblem.length > 1) {
				returns = errorProblem.join(' and ')
			} else {
				returns = errorProblem[0]
			}

			security.setSecurityMessage(
				'Database Security Danger!',
				`Your database is not secure, and is open to attacks. Please adjust your config file to include a <strong>database ${returns}</strong>`,
				'danger',
				'databaseDanger'
			);
		}
	}

	security.setSecurityMessage = (title, message, type, tag) => {
		CMS._messaging.generateSystemAlert({title, message, type, tag, browserLog: true});
	};

	security.forceSSL = (setting) => {
		if (typeof setting === 'undefined') {
			return true;
		} else {
			return setting;
		}
	};

	security.forceApiSSL = (setting) => {
		if (typeof setting === 'undefined') {
			return true;
		} else {
			return setting;
		}
	};

	security.redirectToSecure = (url) => {
		if (!/https/.test(CMS.req.protocol)) {
			console.log(CMS.req.get('host'));
			console.log('redirect');
			return {
				redirect: true,
				redirectTo: `https://${CMS.req.get('host')}${url}`
			}
		}

		return false;
	}

	security.createApiKey = () => {

	}

	return security;
}
