const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const spawn = require('child_process').spawn;
const cmsConfig = require('./cms.js');

module.exports = Events;

function Events(CMS){
	if (! (this instanceof Events)) return new Events();
}

Events.prototype.restartServer = () => {

	process.exit()
	// Restart process ...
	spawn(process.argv[0], process.argv.slice(1), {
		env: { process_restarting: 1 },
		stdio: 'ignore'
	}).unref();
};

Events.prototype.maintenanceMode = (CMS, bool, done) => {
	CMS.writeConfig({maintenance: bool}, (err, result) => {
		if (err) {
			done(err)
		} else {
			done(null, 'success');
		}
	});
};