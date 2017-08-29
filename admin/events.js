const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const spawn = require('child_process').spawn;

module.exports = Events;

function Events(CMS){
	if (! (this instanceof Events)) return new Events();
}

Events.prototype.restartServer = (interval) => {
	setTimeout(() => {
		process.exit()
		// Restart process ...
		spawn(process.argv[0], process.argv.slice(1), {
			env: { process_restarting: 1 },
			stdio: 'ignore'
		}).unref();
	}, interval || 500);
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

Events.prototype.updateCore = (CMS, bool, done) => {

};

Events.prototype.updatePlugin = (CMS, bool, done) => {

};

Events.prototype.updateTheme = (CMS, bool, done) => {

};

Events.prototype.installPluginModules = (CMS, bool, done) => {

};

Events.prototype.UninstallPluginModules = (CMS, bool, done) => {

};
