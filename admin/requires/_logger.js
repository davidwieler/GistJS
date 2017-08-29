const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const _ = require('lodash');
const winston = require('winston');
module.exports = (CMS, APP) => {

	let logger = {};

	logger.init = () => {
		if (!CMS.logFile) {
			CMS.logFile = 'gistJsLog.log'
		}
	};

	logger.log = () => {
	};

	logger.newLogger = (loggerName) => {
		CMS.log[loggerName] = new (winston.Logger)({
			transports: [
				new (winston.transports.Console)(),
				new (winston.transports.File)({ filename: CMS.logFile })
			]
		});
	};

	return logger
};
