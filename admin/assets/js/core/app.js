(function(exports){

	exports.alert = function(msg, type) {

		// TODO: add a method to adjust these alerts, and their messages
		let className;
		let text;

		if (type === 'system') {
			let title = msg.title;
			let content = msg.message;
			let tag = msg.tag;
			let browserLog = msg.browserLog;
			let logType;
			let msgType;

			switch (msg.type) {
				case '' :

				break;
				case 'warning' :
				 	msgType = 'bg-warning'
					logType = 'warn';
				break;
				case 'danger' :
				 	msgType = 'bg-danger'
					logType = 'error';
				break;
				case 'info' :
				 	msgType = 'bg-info'
					logType = 'info';
				break;
				case 'success' :
				 	msgType = 'bg-success'
					logType = 'log';
				break;
				case 'custom' :
				 	msgType = msg.class
					logType = 'log';
				break;
				default:
				 	msgType = 'bg-primary'
					logType = 'log';
				break;
			}

			if (browserLog) {
				//console[logType](`${msg.type}: ${title}, ${content}`);
			}

			return `<div class="alert ${msgType} alert-styled-left">
						<button type="button" class="close" data-tag="${tag}" data-dismiss="alert"><span>×</span><span class="sr-only">Close</span></button>
						<h6>${title}</h6>
						${content}
				    </div>`;
		}

		switch(msg){
			case '1' :
				className = 'alert-info';
				text = '<strong>Post created</strong>';
			break;
			case '2' :
				className = 'alert-info';
				text = '<strong>Post updated</strong>';
			break;
			case '3' :
				className = 'alert-danger';
				text = '<strong>Post not updated. Problem writing to the database.</strong>';
			break;
			case '4' :
				className = 'alert-info';
				text = '<strong>Post has been trashed.</strong>';
			break;
			case '5' :
				className = 'alert-info';
				text = '<strong>No changes were made.</strong>';
			break;
			case '6' :
				className = 'alert-warning';
				text = '<strong>Post not found</strong>';
			break;
			case 'invalid-login' :
				className = 'alert-warning';
				text = '<strong>Username or Password is incorrect</strong>';
			break;
			case 'reset-password' :
				className = 'alert-warning';
				text = '<strong>Please Reset your Password</strong>';
			break;
			case 'notauthorizedapi' :
				className = 'alert-warning';
				text = '<strong>API Request not authorized. Please log in and confirm your API key</strong>';
			break;
			case 'Missing credentials' :
				className = 'alert-warning';
				text = '<strong>Missing Credentials</strong>';
			break;
			case '93' :
				className = 'alert-info';
				text = '<strong>User updated</strong>';
			break;
			case '94' :
				className = 'alert-warning';
				text = '<strong>Problem updating user, please try again.</strong>';
			break;
			case '95' :
				className = 'alert-warning';
				text = '<strong>Username, email and password are required to create a new user</strong>';
			break;
			case '96' :
				className = 'alert-danger';
				text = '<strong>A user with that username already exists</strong>';
			break;
			case '97' :
				className = 'alert-danger';
				text = '<strong>Problem creating user</strong>';
			break;
			case '98' :
				className = 'alert-info';
				text = '<strong>User created</strong>';
			break;
			case '99' :
				className = 'alert-danger';
				text = '<strong>Post not found. Starting over.</strong>';
			break;
			default :
				className = 'alert-info';
				text = '<strong>Uhhmm... Whatcha do\'n there?</strong>';
			break;
		}

		return '<div class="alert ' + className + '">' + text + '</div>';
	};

    exports.timeAgo = function(dateString, format) {
        var rightNow = new Date();

        if (!dateString) {
        	dateString = rightNow;
        }

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

	exports.countWords = function(string) {
		if (string === '') {
			return 0;
		}
		string = string.replace(/(^\s*)|(\s*$)/gi, '');
	    string = string.replace(/\s\s+/g, ' ');
	    string = string.replace(/,/g, ' ');
	    string = string.replace(/;/g, ' ');
	    string = string.replace(/\//g, ' ');
	    string = string.replace(/\\/g, ' ');
	    string = string.replace(/{/g, ' ');
	    string = string.replace(/}/g, ' ');
	    string = string.replace(/\n/g, ' ');
	    string = string.replace(/[\{\}]/g, ' ');
	    string = string.replace(/[\(\)]/g, ' ');
	    string = string.replace(/[[\]]/g, ' ');
	    string = string.replace(/[ ]{2,}/gi, ' ');
	    var countWordsBySpaces = string.split(' ').length;
	    return countWordsBySpaces;
	};

	exports.readTime = function(string, wpm, secondsOnly) {
		var words = exports.countWords(string);
	    var estimatedRaw = words / wpm;
		var wordsPerSecond = wpm / 60;
	    var minutes = Math.round(estimatedRaw);
		var seconds = Math.floor(words / wordsPerSecond);

		if (secondsOnly) {
			return seconds;
		}

		if (seconds <= 59) {
			return seconds;
		} else {
			minutes = Math.floor(seconds/60);
            seconds = seconds%60;

            return [minutes, seconds];
		}
	};

	exports.countParagraphs = function(string) {
		var returns = string.match(/<p\b[^>]*>/ig);

		if (returns === null) {
			return 0;
		}
		return returns.length;
	};

	exports.countCharacters = function(string) {
		return string.replace(/\s/g, '').length;
	};

	exports.countSentences = function(string) {
		var returns = string.match(/[^\r\n.!?]+(\r\n|\r|\n|[.!?])\s*/gi);
		if (returns === null) {
			return 0;
		}
		return returns.length;
	};

	exports.uniqueWords = function(string) {
		if (string === '') {
			return 0;
		}
		var cleanString = string.replace(/[\.,-\/#!?$%\^&\*;:{}=\-_`~()]/g, '').split(' ');
		var newWords = [];

	    for (var i = 0; i < cleanString.length; i++) {
	    	newWords.push(cleanString[i].replace(/\s/g, ''));
	    }
		var uniqueCount = [...new Set(newWords)]

		return uniqueCount.length;
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

	exports.defaultEditor = function(editorId, postContent, options) {
		return `
		<div id="${editorId}">${postContent}</div>
		`;
	}

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
	                            <a class="btn btn-xxs btn-default dropdown-toggle " data-toggle="dropdown">\
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
	                        <a class="btn btn-default btn-xxs" href="javascript:;" unselectable="on">\
	                        <span class="icon-file-picture"></span>\
	                        </a>\
	                        </li>\
	                        <li><a class="btn btn-default btn-xxs btn-icon insert-link toolbar-item" title="Insert link" tabindex="-1"><i class="icon-link"></i></a></li>\
	                        <li>\
	                        <div class="btn-group btn-group-xxs">\
	                        <a class="btn btn-default" data-wysihtml5-command="bold" title="CTRL+B" tabindex="-1" href="javascript:;" unselectable="on">Bold</a>\
	                        <a class="btn btn-default" data-wysihtml5-command="italic" title="CTRL+I" tabindex="-1" href="javascript:;" unselectable="on">Italic</a>\
	                        <a class="btn btn-default" data-wysihtml5-command="underline" title="CTRL+U" tabindex="-1" href="javascript:;" unselectable="on">Underline</a>\
	                        </div>\
	                        </li>\
	                        <li>\
	                        <div class="btn-group btn-group-xxs">\
	                        <a class="btn btn-default" data-wysihtml5-command="alignLeftStyle" title="CTRL+B" tabindex="-1" href="javascript:;" unselectable="on"><span class="icon-paragraph-left3"></span></a>\
	                        <a class="btn btn-default" data-wysihtml5-command="alignCenterStyle" title="CTRL+I" tabindex="-1" href="javascript:;" unselectable="on"><span class="icon-paragraph-center3"></span></a>\
	                        <a class="btn btn-default" data-wysihtml5-command="alignRightStyle" title="CTRL+U" tabindex="-1" href="javascript:;" unselectable="on"><span class="icon-paragraph-right3"></span></a>\
	                        </div>\
	                        </li>\
	                        <li>\
	                        <a class="btn btn-default btn-xxs" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="blockquote" data-wysihtml5-display-format-name="false" tabindex="-1" href="javascript:;" unselectable="on">\
	                        <span class="icon-quotes-left"></span>\
	                        </a>\
	                        </li>\
	                        <li>\
	                        <div class="btn-group btn-group-xxs">\
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
	                    <div class="col-md-12">\
	                        <div class="btn-group btn-group-xs pull-left">\
	                            <a class="btn btn-default btn-info editor-mode" data-mode="visual">Visual</a>\
	                            <a class="btn btn-default editor-mode" data-mode="html">HTML</a>\
	                            <a class="btn btn-default editor-mode" data-mode="markdown">Markdown</a>\
	                            <a class="btn btn-default action-preview" data-mode="preview">Preview</a>\
	                            <a class="btn btn-default action-distraction-free">Distraction Free</a>\
	                        </div>\
	                        <div class="auto-save-status pull-right"></div>\
	                    </div>\
	                </div>\
	            </div>';
	}

	exports.editableImage = function() {
		return `
			<div class="editable-image-buttons">
				<button class="btn"><i class="fa fa-align-left" aria-hidden="true"></i></button>
				<button class="btn"><i class="fa fa-align-center" aria-hidden="true"></i></button>
				<button class="btn"><i class="fa fa-align-right" aria-hidden="true"></i></button>
				<button class="btn"><i class="fa fa-align-justify" aria-hidden="true"></i></button>
				<button class="btn"><i class="fa fa-pencil" aria-hidden="true"></i></button>
			</div>
		`;
	};

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

	exports.renderDashboardWidget = function(widgetName, widgetContent, noheader) {
		var returns = `
			<div class="col-md-6">
				<div class="panel panel-white ">
					<div class="panel-heading">
						<h6 class="panel-title">${widgetName}<a class="heading-elements-toggle"><i class="icon-more"></i></a></h6>
						<div class="heading-elements">
							<ul class="icons-list">
								<li><a data-action="collapse"></a></li>
								<li><a data-action="move" class="ui-sortable-handle"></a></li>
							</ul>
						</div>
					</div>
					${widgetContent}
				</div>
			</div>
			`;
		return returns;
	};

	exports.metaBox = function(data, postData) {
		var postMeta = postData.postMeta;
		var heading = '';
		var content = '';
		var value = '';

		if (data.heading) {
			var heading = `
				<div class="panel-heading metabox">
					<h6 class="panel-title">${data.heading}</h6>
				</div>
			`;
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
						var name = `<label>${inputs[i].name}</label>`;
					} else {
						var name = '';
					}

					var type = inputs[i].type || 'text';
					var placeholder = inputs[i].placeholder || '';
					var attributes = inputs[i].attr || '';
					var name = exports.sanitizeTitle(inputs[i].name.trim(), ' ');

					if (typeof name === 'undefined') {
						console.error('metaBox inputs must have a name');
						return;
					}

					if (typeof postMeta !== 'undefined') {
						if (postMeta[exports.removeSpecialChars(name)]) {
							var value = postMeta[exports.removeSpecialChars(name)];
						} else {
							var value = '';
						}
					}


					var inputContent = `
						<div class="form-group">
							${name}
							<input type="${exports.removeSpecialChars(type)}" class="form-control" value="${value}" name="postMeta[${exports.removeSpecialChars(name)}]" placeholder="${exports.removeSpecialChars(placeholder, ' ')}" ${attributes}>
						</div>
					`;

					content += inputContent;
				}
			}

		}

		return `
			<div class="panel panel-white meta-box-panel">
				${heading}
				<div class="panel-body meta-box-wrap">
					${content}
				</div>
			</div>
		`;
	};

	exports.confirmationModal = function() {
		return `
			<div class="modal fade delete-category-tag-modal" id="confirmationModal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
		        <div class="modal-dialog" role="document">
		            <div class="modal-content">
		                <div class="modal-header bg-primary">
		                    <button type="button" class="close" data-dismiss="modal">×</button>
		                    <h6 class="modal-title"></h6>
		                </div>
		                <div class="modal-body">
						</div>
						<div class="modal-footer">
							<button type="button" class="btn btn-link" data-dismiss="modal">No thanks</button>
							<button type="button" class="btn btn-danger confirm-modal">Delete</button>
						</div>
					</div>
				</div>
			</div>
		`;
	};

	exports.fileUploadModal = function(post) {
        return `
		<div class="modal fade uploads-modal" id="fileuploadsmodal" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel">
	        <div class="modal-dialog modal-full drag-drop" role="document">
	            <div class="modal-content">
	                <div class="modal-header bg-primary">
	                    <button type="button" class="close" data-dismiss="modal">×</button>
	                    <h6 class="modal-title">Images and Files</h6>
	                </div>
	                <div class="modal-body">
	                	<div class="image-edit"></div>
			        	<div class="drag-overlay off">
			        		<div class="icon-object border-white text-white"><i class="icon-upload"></i></div>
			        		<h2 class="text-white">Drop your file here to start uploading</h2>
			        	</div>
	                	<div class="col-md-9 uploads-content image-display">
	                		<div class="thumbnail-display">
	                			<input id="upload-input" type="file" name="uploads[]" multiple="multiple" accept="image/*">
								<div class="row file-details">
								</div>
	                		</div>
	                	</div>
	                	<div class="col-md-3 uploads-sidebar image-display">
							<div class="col-md-12">
								<h5>Attachment Details</h5>
								<strong class="file-name"></strong>
							</div>
							<div class="col-xs-12 sidebar-image-preview">
							</div>
							<div class="col-xs-12">
								<div class="text-light upload-date"></div>
								<div class="text-light file-size"></div>
								<button class="btn btn-primary btn-sm edit-image-toggle">Edit Image</button>
								<a href="" class="media-heading text-danger-400 delete-attachment">Delete permanently</a>
							</div>
							<div class="clearfix"></div>

							<div class="image-meta">
								<div class="col-xs-3 text-right">
									<label>Title</label>
								</div>
								<div class="col-xs-9">
									<input type="text" class="form-control" name="title" placeholder="Enter Title" value="">
								</div>
								<div class="col-xs-3 text-right">
									<label>Alt text</label>
								</div>
								<div class="col-xs-9">
									<input type="text" class="form-control" name="title" placeholder="Enter Title" value="">
								</div>
								<div class="col-xs-3 text-right">
									<label>Caption</label>
								</div>
								<div class="col-xs-9">
									<textarea name="" class="form-control" placeholer="Message" rows="7"></textarea>
								</div>
							</div>
							<div class="col-xs-9">
								<div class="checkbox">
									<label>
										<div class="checker"><span class=""><input type="checkbox" name="blank" class="styled"></span></div>
										Set as feature image
									</label>
								</div>
							</div>
							<div class="col-md-12">
								<h5>Insert Settings</h5>
								<div class="form-group insert-settings">
									<label>Image Size</label>
									<select class="form-control image-size" name="status">
										<option value="">Select an image</option>
									</select>
								</div>
								<div class="form-group link-settings">
									<label>Link to</label>
									<select class="form-control attachment-link" name="status">
										<option value="none">None</option>
										<option value="attachment" class="insert-attachment-url">Attachment URL</option>
										<option value="<%- postData.postUrl;%>">Post URL</option>
									</select>
								</div>
							</div>
	                	</div>
	                </div>
	                <div class="modal-footer">
	                	<div class="thumbnail-display">
	                		<div class="col-xs-12 selected-thumbnails text-left">
	                			<h6>Selected images <small><a class="clear-selected-images">clear</a></small></h6>
	                			<div class="selected-thumbnail-images">

	                			</div>
	                		</div>
	                    	<div class="col-xs-6 text-left">
		                    	<button type="button" class="btn btn-primary upload-file-handler">Upload</button>
								<div class="btn-group dropup">
									<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
										Get attachments from: <span class="caret"></span>
									</button>
									<ul class="dropdown-menu">
										<li class="get-attachments this-post"><a href="#">This post</a></li>
										<li class="get-attachments all-posts"><a href="#">All posts</a></li>
									</ul>
								</div>
							</div>
							<div class="col-xs-6">
		                        <button type="button" class="btn btn-link" data-dismiss="modal">Close</button>
		                        <button type="button" class="btn btn-info insert-selected-images">Insert image</button>
	                        </div>
	                    </div>
	                </div>
	            </div>
	        </div>
	    </div>
		`;
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

	exports.sanitizeTitle = function(text, replaceChar) {
		replaceChar = replaceChar || '-';
		if (text[text.length - 1] === '.'){
			text = text.slice(0,-1);
		}
	    var newString = text.trim().replace(/[\s+`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\]/gi, replaceChar);
		newString = newString.replace(/-+/g,'-').toLowerCase();

	    return newString
	};

	exports.removeSpecialChars = function(text, replace) {
		const replaceWith = replace || '_'
	    return text.replace(/[+`~!@#$%^&*()|+\=?;:'",.<>\{\}\[\]\\]/gi, '').trim().replace(/\s/g, replaceWith);
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

	exports.textToSlug = function(text) {
		const slug = exports.sanitizeTitle(text).replace(/-/g, '_');
		return slug
	};

	exports.sanitizeUrl = function(url, route) {
		let regex;
		if (!route) {
			regex = /[\s+`~!@#$%^&*()_|+=?;:'",<>\{\}\[\]\\]/gi
		} else {
			regex = /[\s+`~!@#$%^&*()_|+=?;'",<>\{\}\[\]\\]/gi
		}
		if (typeof url === 'object') {

			let newUrlArray = [];

			for (var i = 0; i < url.length; i++) {
				const startsWithSlash = /^\//;
				if (!startsWithSlash.test(url[i])) {
					url[i] = `/${url[i]}`
				}

				newUrlArray.push(url[i].trim().replace(regex, ''));
			}

			return newUrlArray;

		} else {
			const startsWithSlash = /^\//;
			if (!startsWithSlash.test(url)) {
				url = `/${url}`
			}

			return url.trim().replace(regex, '');
		}

	}

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

	exports.capitalizeFirstLetter = function(string) {
		if (typeof string === 'undefined' || string === '' || string === null) {
			return;
		}

		return string.charAt(0).toUpperCase() + string.slice(1);
	};

}(typeof exports === 'undefined' ? this.app = {} : exports));
