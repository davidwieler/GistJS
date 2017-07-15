const fs = require('fs');
const path = require('path');
const Events = require('../events.js');
const Promise = require('bluebird');
module.exports = (CMS) => {

	var thumbnails = {};

	thumbnails.generateThumbnail = (data, done) => {
		let sharp = require('sharp');
		const thumbSettings = CMS.config.thumbnails;
		let thumbnailDetails = {};

		let uploadFolder = CMS.uploadDir;

		Promise.map(thumbSettings, function(thumb) {
			let thumbnailFileName = data.fileName + thumb.suffix + data.ext;
			thumbnailDetails[thumb.suffix] = thumbnailFileName;
			if (thumb.suffix === '-preview') {
				return sharp( data.path )
					.jpeg({quality: Number(CMS.config.jpgQuality)})
					.png({quality: Number(CMS.config.pngQuality)})
					.resize( Number(thumb.size.width), Number(thumb.size.height), {
						kernel: sharp.kernel.cubic,
						interpolator: sharp.interpolator.nohalo
					})
					.toFile( path.join(CMS.uploadDir,thumbnailFileName ) );
			} else {
				return sharp( data.path )
					.jpeg({quality: Number(CMS.config.jpgQuality)})
					.png({quality: Number(CMS.config.pngQuality)})
					.resize( Number(thumb.size.width), Number(thumb.size.width), {
						kernel: sharp.kernel.cubic,
						interpolator: sharp.interpolator.nohalo
					})
					.max()
					.toFile( path.join(CMS.uploadDir, thumbnailFileName ) );
			}
		}).then(function(){
			done(null, thumbnailDetails)
		});
	};

	return thumbnails;

}
