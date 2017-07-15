const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const cron = require('node-cron');

module.exports = (CMS, APP) => {

	var crons = {};

	crons.init = () => {

	};

	crons.createCron = (cronName, time, func, immediateStart, immediateFire) => {
		if (crons.validate(time)) {
			var newCron = cron.schedule(time, func, immediateStart);
			CMS.cronJobs[cronName] = newCron;
			CMS.cronJobs[cronName].schedule = time
			CMS.cronJobs[cronName].func = func
			CMS.cronJobs[cronName].immediateStart = immediateStart
			CMS.cronJobs[cronName].immediateFire = immediateFire
			if (immediateFire) {
				func();
			}

			setTimeout(() => {
				crons.getCron(cronName).func('passing a value to my cron is all, nothing to see here....');
			}, 2000);

			return `${cronName} scheduled`;
		} else {
			return 'invalid cron schedule'
		}


	};

	crons.destroyCron = (cronName) => {
		CMS.cronJobs[cronName].destroy();
	};

	crons.startCron = (cronName) => {
		CMS.cronJobs[cronName].start();
	};

	crons.stopCron = (cronName) => {
		CMS.cronJobs[cronName].stop();
	};

	crons.getCron = (cronName) => {
		return {
			time: CMS.cronJobs[cronName].schedule,
			func: CMS.cronJobs[cronName].func,
			immediateStart: CMS.cronJobs[cronName].immediateStart,
			immediateFire: CMS.cronJobs[cronName].immediateFire
		}
	};

	crons.validate = (time) => {
		return cron.validate(time)
	};

	return crons;

}
