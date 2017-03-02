(function(exports){
    exports.timeAgo = function(dateString, format) {
        var rightNow = new Date();
        var then = new Date(dateString);
        var diff = rightNow - then;
        var second = 1000,

        minute = second * 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;

        if (isNaN(diff) || diff < 0) {
            return ''; // return blank string if unknown
        }

        if (diff < second * 2) {
            // within 2 seconds
            return 'right now';
        }

        if (diff < minute) {
            return Math.floor(diff / second) + ' seconds ago';
        }

        if (diff < minute * 2) {
            return 'about a minute ago';
        }

        if (diff < hour) {
            return Math.floor(diff / minute) + ' minutes ago';
        }

        if (diff < hour * 2) {
            return 'about an hour ago';
        }

        if (diff < day) {
            return  Math.floor(diff / hour) + ' hours ago';
        }

        if (diff > day && diff < day * 2) {
            return 'yesterday at ' + exports.formatDate(dateString, 'h:MMtt');
        }

        if (diff < day * 365) {
            //return Math.floor(diff / day) + " days ago";
            return exports.formatDate(dateString, format);
        }

        else {
            return exports.formatDate(dateString, format);
        }
    };

    exports.formatDate = function(date, mask) {

        var utc = false,
            masks = exports.formatDateMasks();

        mask = String(masks[mask] || mask || masks['default']);

        date = date ? new Date(date) : new Date;
        if (isNaN(date)){
            return 'invalid date';
        }

        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

        var dateStrings = {
            dayNames: [
                "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
                "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
            ],
            monthNames: [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ]
        };


        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? 'getUTC' : 'get',
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dateStrings.dayNames[D],
                dddd: dateStrings.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dateStrings.monthNames[m],
                mmmm: dateStrings.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function (f) {
            return f in flags ? flags[f] : f.slice(1, f.length - 1);
        });
    };

    exports.formatDateMasks = function(mask) {
        return {
            default:      'ddd mmm dd yyyy H:MM:ss',
            shortDate:      'm/d/yy',
            mediumDate:     'mmm d, yyyy',
            longDate:       'mmmm d, yyyy',
            fullDate:       'dddd, mmmm d, yyyy',
            shortTime:      'h:MM TT',
            mediumTime:     'h:MM:ss TT',
            longTime:       'h:MM:ss TT Z',
            isoDate:        'yyyy-mm-dd',
            isoTime:        'HH:MM:ss',
            isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        }
    };

    exports.editor = function(post) {
	    var postTitle = post.postTitle || '';
	    var postUrl = post.postUrl || '';

	    if (typeof post.postContent !== 'undefined') {
	        var postContent = exports.unescapeHtml(post.postContent)
	    } else {
	        var postContent = '';
	    }

	    return '<div class="panel panel-white editor-panel">\
	                <div class="panel-body editor-wrap">\
	                    <div class="table-responsive">\
	                        <table class="table">\
	                            <tbody>\
	                                <tr>\
	                                    <td style="width: 60px">Title:</td>\
	                                    <td style="width: 100%" class="no-padding"><input type="text" class="form-control" name="postTitle" placeholder="Enter Title" value="' + postTitle + '"></td>\
	                                </tr>\
	                                <tr>\
	                                    <td>URL:</td>\
	                                    <td class="no-padding"><input type="text" class="form-control" placeholder="URL" name="postUrl" value="' + postUrl + '"></td>\
	                                    <td>&nbsp;</td>\
	                                </tr>\
	                            </tbody>\
	                        </table>\
	                    </div>\
	                    <ul class="wysihtml5-toolbar" id="toolbar">\
	                        <li class="dropdown">\
	                            <a class="btn btn-xs btn-default dropdown-toggle " data-toggle="dropdown">\
	                                <span class="fa fa-font"></span>\
	                                <span class="current-font">Normal text</span>\
	                                <b class="caret"></b>\
	                            </a>\
	                            <ul class="dropdown-menu">\
	                                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="p" tabindex="-1" href="javascript:;" unselectable="on">Normal text</a></li>\
	                                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1" tabindex="-1" href="javascript:;" unselectable="on">Heading 1</a></li>\
	                                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h2" tabindex="-1" href="javascript:;" unselectable="on">Heading 2</a></li>\
	                                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h3" tabindex="-1" href="javascript:;" unselectable="on">Heading 3</a></li>\
	                                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h4" tabindex="-1" href="javascript:;" unselectable="on">Heading 4</a></li>\
	                                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h5" tabindex="-1" href="javascript:;" unselectable="on">Heading 5</a></li>\
	                                <li><a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h6" tabindex="-1" href="javascript:;" unselectable="on">Heading 6</a></li>\
	                            </ul>\
	                        </li>\
	                        <li class="file-uploads" data-toggle="modal" data-target="#file-uploads">\
	                        <a class="btn btn-default btn-xs" href="javascript:;" unselectable="on">\
	                        <span class="icon-file-picture"></span>\
	                        </a>\
	                        </li>\
	                        <li><a class="btn btn-default btn-xs btn-icon insert-link toolbar-item" title="Insert link" tabindex="-1"><i class="icon-link"></i></a></li>\
	                        <li>\
	                        <div class="btn-group btn-group-xs">\
	                        <a class="btn btn-default" data-wysihtml5-command="bold" title="CTRL+B" tabindex="-1" href="javascript:;" unselectable="on">Bold</a>\
	                        <a class="btn btn-default" data-wysihtml5-command="italic" title="CTRL+I" tabindex="-1" href="javascript:;" unselectable="on">Italic</a>\
	                        <a class="btn btn-default" data-wysihtml5-command="underline" title="CTRL+U" tabindex="-1" href="javascript:;" unselectable="on">Underline</a>\
	                        </div>\
	                        </li>\
	                        <li>\
	                        <div class="btn-group btn-group-xs">\
	                        <a class="btn btn-default" data-wysihtml5-command="alignLeftStyle" title="CTRL+B" tabindex="-1" href="javascript:;" unselectable="on"><span class="icon-paragraph-left3"></span></a>\
	                        <a class="btn btn-default" data-wysihtml5-command="alignCenterStyle" title="CTRL+I" tabindex="-1" href="javascript:;" unselectable="on"><span class="icon-paragraph-center3"></span></a>\
	                        <a class="btn btn-default" data-wysihtml5-command="alignRightStyle" title="CTRL+U" tabindex="-1" href="javascript:;" unselectable="on"><span class="icon-paragraph-right3"></span></a>\
	                        </div>\
	                        </li>\
	                        <li>\
	                        <a class="btn btn-default btn-xs" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="blockquote" data-wysihtml5-display-format-name="false" tabindex="-1" href="javascript:;" unselectable="on">\
	                        <span class="icon-quotes-left"></span>\
	                        </a>\
	                        </li>\
	                        <li>\
	                        <div class="btn-group btn-group-xs">\
	                        <a class="btn  btn-default" data-wysihtml5-command="insertUnorderedList" title="Unordered list" tabindex="-1" href="javascript:;" unselectable="on">\
	                        <span class="icon-list"></span>\
	                        </a>\
	                        <a class="btn btn-default btn-xs" data-wysihtml5-command="insertOrderedList" title="Ordered list" tabindex="-1" href="javascript:;" unselectable="on">\
	                        <span class="icon-list-numbered"></span>\
	                        </a>\
	                        <a class="btn btn-default btn-xs" data-wysihtml5-command="Outdent" title="Outdent" tabindex="-1" href="javascript:;" unselectable="on">\
	                        <span class="icon-indent-decrease2"></span>\
	                        </a>\
	                        <a class="btn btn-default btn-xs" data-wysihtml5-command="Indent" title="Indent" tabindex="-1" href="javascript:;" unselectable="on">\
	                        <span class="icon-indent-increase2"></span>\
	                        </a>\
	                        </div>\
	                        </li>\
	                    </ul>\
	                    <!-- element to edit -->\
	                    <div id="editor" data-placeholder="">' + postContent + '</div>\
	                </div>\
	                <div class="panel-footer">\
	                    <div class="col-xs-7">\
	                        <div class="btn-group btn-group-xs pull-left">\
	                            <a class="btn btn-default btn-info editor-mode" data-mode="visual">Visual</a>\
	                            <a class="btn btn-default editor-mode" data-mode="html">HTML</a>\
	                            <a class="btn btn-default editor-mode" data-mode="markdown">Markdown</a>\
	                            <a class="btn btn-default action-preview" data-mode="preview">Preview</a>\
	                            <a class="btn btn-default action-distraction-free">Distraction Free</a>\
	                        </div>\
	                    </div>\
	                    <div class="col-xs-5 text-right">\
	                    </div>\
	                </div>\
	            </div>';
	}

	exports.inlineImageEditBox = function(href, title, target) {
		var href = href || '';
		var title = title || '';
		var target = target || '';
		return '<div class="panel editor-inline-anchor">\
					<div class="panel-body">\
						<label>\
							URL\
							<input type="text" class="form-control" name="title" placeholder="Link URL" value="' + href + '">\
						</label><br />\
						<label>\
							Title\
							<input type="text" class="form-control" name="title" placeholder="Link Title" value="' + title + '">\
						</label><br />\
						<label>\
							Target\
							<input type="text" class="form-control" name="title" placeholder="Link URL" value="' + target + '">\
						</label><br />\
						<button type="button" class="btn btn-primary">Update</button>\
					</div>\
				</div>';

	};

	exports.metaBox = function(data) {

		var heading = '';
		var content = '';

		if (data.heading) {
			var heading = '<div class="panel-heading metabox">\
								<h6 class="panel-title">' + data.heading + '</h6>\
						   <div>';
		}

		var dataContent = data.content;

		for (var i = 0; i < dataContent.length; i++) {
			var text = '';
			if (dataContent[i].text) {
				text = '<p>' + dataContent[i].text + '</p>' || '';
			}

			content += text;

			if ( dataContent[i].inputs) {
				var inputs = dataContent[i].inputs;
				for (var i = 0; i < inputs.length; i++) {
					if (inputs[i].name) {
						var name = '<label>' + inputs[i].name + '</label>';
					} else {
						var name = '';
					}

					var type = inputs[i].type || 'text';
					var placeholder = inputs[i].placeholder || '';
					var name = app.removeSpecialChars(inputs[i].name.trim());

					if (typeof name === 'undefined') {
						console.error('metaBox inputs must have a name');
						return;
					}

					if (postMeta.length > 0) {
						var value = JSON.parse(postMeta)[name];
					} else {
						var value = '';
					}

					var inputContent =	'<div class="form-group">\
											' + name + '\
											<input type="' + app.removeSpecialChars(type) + '" class="form-control" value="' + value +'" name="postMeta[' + name + ']" placeholder="' + app.removeSpecialChars(placeholder) + '">\
										</div>';

					content += inputContent;
				}
			}

		}

		return '<div class="panel panel-white meta-box-panel">\
					' + heading + '\
	                <div class="panel-body meta-box-wrap">\
						' + content + '\
	                </div>\
	           </div>';
	};

	exports.modal = function(post) {
        return '<div class="modal fade" id="fileuploadsmodal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">\
            <div class="modal-dialog modal-full drag-drop" role="document">\
            	<div class="drag-overlay off">\
            		<div class="icon-object border-white text-white"><i class="icon-upload"></i></div>\
            		<h2 class="text-white">Drop your file here to start uploading</h2>\
            	</div>\
                <div class="modal-content">\
                    <div class="modal-header bg-primary">\
                        <button type="button" class="close" data-dismiss="modal">×</button>\
                        <h6 class="modal-title">Images and Files</h6>\
                    </div>\
                    <div class="modal-body">\
                    	<div class="col-md-12">\
                    		<div class="thumbnail-display">\
                    		</div>\
                    		<div class="file-uploads-display">\
                    			<input id="upload-input" type="file" name="uploads[]" multiple="multiple">\
								<div class="row file-details">\
								</div>\
                    		</div>\
                    	</div>\
                    </div>\
                    <div class="modal-footer">\
                    	<div class="thumbnail-display">\
	                    	<div class="col-xs-6 text-left">\
		                    	<button type="button" class="btn btn-primary upload-file-handler">Upload</button>\
								<div class="btn-group dropup">\
									<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
										Get attachments from: <span class="caret"></span>\
									</button>\
									<ul class="dropdown-menu">\
										<li><a href="#">This post</a></li>\
										<li><a href="#">All posts</a></li>\
									</ul>\
								</div>\
							</div>\
							<div class="col-xs-6">\
		                        <button type="button" class="btn btn-link" data-dismiss="modal">Close</button>\
		                        <button type="button" class="btn btn-info">Insert image</button>\
	                        </div>\
	                    </div>\
                		<div class="file-uploads-display">\
							<div class="col-xs-6 text-left">\
								<button type="button" class="btn btn-primary upload-file-handler">Add files</button>\
							</div>\
							<div class="col-xs-6">\
								<button type="button" class="btn btn-info cancel-upload">Done</button>\
							</div>\
                		</div>\
                    </div>\
                </div>\
            </div>\
        </div>';
    }

    exports.fileList = function(file, showProgress){
    	if (showProgress !== false) {
	    	return '<div class="col-xs-3 col-md-2 media-item-wrap">\
		    			<div class="panel" data-name="' + file.name + '">\
							<div class="panel-body">\
								<span class="image-preview"></span>\
								<div class="file-progress">\
									<div class="progress progress-lg">\
										<div class="progress-bar bg-primary progress-bar-striped active" style="width: 0%">\
											<span></span>\
										</div>\
									</div>\
								</div>\
								<div class="is-selected"></div>\
							</div>\
						</div>\
					</div>';
		} else {
	    	return '<div class="col-xs-3 col-md-2 media-item-wrap">\
		    			<div class="panel" data-name="' + file.name + '">\
							<div class="panel-body">\
								<span class="image-preview"></span>\
								<div class="is-selected"></div>\
							</div>\
						</div>\
					</div>';
			}
    };

	exports.sanitizeTitle = function(text) {
	    var newString = text.trim().replace(/[\s+`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\]/gi, '-');
	    return newString.toLowerCase();
	};

	exports.removeSpecialChars = function(text) {
	    return text.replace(/[+`~!@#$%^&*()|+\=?;:'",.<>\{\}\[\]\\]/gi, '').trim().replace(/\s/g, '_');
	};

	exports.sanitizeHtml = function(html) {
	    var entityMap = {
	        '&': '&amp;',
	        '<': '&lt;',
	        '>': '&gt;',
	        '"': '&quot;',
	        "'": '&#39;',
	        '/': '&#x2F;',
	        '`': '&#x60;',
	        '=': '&#x3D;'
	    };

	    return String(html).replace(/[&<>"'`=\/]/g, function (s) {
	        return entityMap[s];
	    });
	};

	exports.unescapeHtml = function(string) {

	    if (typeof string === 'string' && string === 'undefined') {
	        return '';
	    }

	    return string
	         .replace(/&amp;/g, '&')
	         .replace(/&lt;/g, '<')
	         .replace(/&gt;/g, '>')
	         .replace(/&quot;/g, '\"')
	         .replace(/&#x3D;/g, '=')
	         .replace(/&#x2F;/g, '/')
	         .replace(/&#x60;/g, '`')
	         .replace(/&#039;/g, "'");
	};

	exports.createUrl = function(url) {

		let a = document.createElement('a');
		a.href = url.url;
		a.setAttribute('title', url.title);
		a.innerHTML = url.title;

		if (url.nofollow) {
			a.rel = 'nofollow';
		}
		if (url.blank) {
			a.target = '_blank';
		}
		return a.outerHTML;
	};

	exports.fileSizeConvert = function(bytes, si) {
	    var thresh = si ? 1000 : 1024;
	    if (Math.abs(bytes) < thresh) {
	        return bytes + ' B';
	    }
	    var units = si
	        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
	        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
	    var u = -1;
	    do {
	        bytes /= thresh;
	        ++u;
	    }
	    while (Math.abs(bytes) >= thresh && u < units.length - 1);
	    return bytes.toFixed(1)+' '+units[u];
	};

}(typeof exports === 'undefined' ? this.app = {} : exports));