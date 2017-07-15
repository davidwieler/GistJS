const _ = require('lodash');
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
		CMS._messaging.generateSystemAlert({title, message, type, tag});
	};

	return security;
}
