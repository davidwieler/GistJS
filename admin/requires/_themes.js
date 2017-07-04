const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const APP = require('../assets/js/core/app.js');
module.exports = (CMS) => {

	var themes = {};

	themes.initThemes = () => {
		let themes = fs.readdirSync(CMS.themeDir);

		for (let i = themes.length - 1; i >= 0; i--) {
			if (themes[i] === '.DS_Store') {
				continue;
			}
			let themeFolder = themes[i];
			let themePath = path.join(CMS.themeDir, themeFolder);
			let themeJson = themePath + '/theme.json';
	        let themeInfo = JSON.parse(fs.readFileSync(themeJson, 'utf-8'));
	        themeInfo.id = i;
	        themeInfo.localPath = path.join(themeFolder);
			themeInfo.themeFolder = path.join('/themes/', themeFolder);
	        themeInfo.path = themePath;
	        CMS.themes.push(themeInfo);

	        if (themeInfo.active === true) {
	        	CMS.activeTheme = themeInfo;
	        	CMS.activeTheme.path = themePath;
	        }
		}
	};

	themes.themeSwitch = (newThemeId, res, done) => {
		const themes = CMS.themes;
		let updateThemes = [];
		for (var i = 0; i < themes.length; i++) {

			let themeConfigFile = themes[i].path + '/theme.json';
			let themeFileInfo = require(themeConfigFile);

			if (themes[i].id === Number(newThemeId)) {
				CMS.activeTheme = themes[i];
				CMS.activeTheme.path = path.join(CMS.themeDir, themes[i].localPath);
				themes[i].active = themeFileInfo.active = true;

				if (themeFileInfo.onInstall) {
					const install = require(path.join(CMS.activeTheme.path, themeFileInfo.onInstall));
					install(CMS, themes[i], res).init();
				}
			} else {
				themes[i].active = themeFileInfo.active = false;
			}

			let string = JSON.stringify(themeFileInfo, null, '\t');

            fs.writeFile(themeConfigFile, string, (err) => {
				if (err) {
					return done(err);
				}
            });

			updateThemes.push(themes[i]);
		}

		CMS.themes = updateThemes;
		if (typeof done === 'function') {
			done(CMS.activeTheme);
		}
	};

	return themes;

}
