const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const _ = require('lodash');
const winston = require('winston');
module.exports = (CMS, APP) => {

	let exceptions = {};

	exceptions.init = () => {
		if (!CMS.exceptionRules) {
			CMS.exceptionRules = []
		}
	}


	exceptions.log = (error) => {

		// TODO: Log this with winston
		for (var i = 0; i < CMS.exceptionRules.length; i++) {
			let errorMessage = error.message
			let rule = CMS.exceptionRules[i].rule

			if (errorMessage.indexOf(rule) >= 0) {
				if (typeof CMS.exceptionRules[i].task === 'function') {
					CMS.exceptionRules[i].task()
				} else {
					console.error(CMS.exceptionRules[i].task)
				}
			}
		}
	};

	exceptions.registerException = (exceptionRule, task) => {
		CMS.exceptionRules.push({
			rule: exceptionRule,
			task: task
		})
	}

	return exceptions
};
