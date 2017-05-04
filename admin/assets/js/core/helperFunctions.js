let bulkCheckboxValues = function() {
    var checked = $('.checker').children('.checked');
    var checkedBoxes = [];

    checked.each(function(i){
        var value = $(this).find('input[type="checkbox"]').val();

        if (value !== 'on') {
            checkedBoxes.push(value);
        }
    });

    return checkedBoxes;
};

let changeEditorMode = function(type) {

	var fromType = $('.editor-mode.btn-info').data('mode');

    switch(type) {
        case 'visual' :

			if (fromType === 'markdown') {
				var converter = new showdown.Converter();
				var html = converter.makeHtml($('.markdown-editor').val());
			}

			if (fromType === 'html') {
				var html = $('.html-editor').val();
			}
			editor.setValue(html)
			$('.wysihtml5-editor').show();
			$('.html-editor, .markdown-editor').hide();
        break;
        case 'html' :

			var html = editor.getValue(true);

			if (fromType === 'markdown') {
				var converter = new showdown.Converter();
				var html = converter.makeHtml($('.markdown-editor').val());
			}

            var html = tidy_html5(html, {
				'indent': 'auto',
				'indent-spaces': 2,
				'wrap': 80,
				'markup': true,
				'output-xml': false,
				'numeric-entities': true,
				'quote-marks': true,
				'quote-nbsp': false,
				'show-body-only': true,
				'quote-ampersand': false,
				'break-before-br': true,
				'uppercase-tags': false,
				'uppercase-attributes': false,
				'drop-font-tags': true,
				'tidy-mark': false,
				'show-info': false,
				'show-warnings': false,
				'show-errors': 0
			});
			$('.html-editor, .markdown-editor').remove();
			$('.wysihtml5-editor').hide();
			$('.editor-panel #editor').after('<textarea class="wysihtml5-sandbox html-editor">' + html + '</textarea>');
        break;
        case 'markdown' :

			if (fromType === 'visual') {
				var markDown = toMarkdown(editor.getValue(true));
			}

			if (fromType === 'html') {
				var markDown = toMarkdown($('.html-editor').val());
			}

			if (fromType === 'markdown') {
				return;
			}

			$('.html-editor, .markdown-editor').remove();
			$('.wysihtml5-editor').hide();
			$('.editor-panel #editor').after('<textarea class="wysihtml5-sandbox markdown-editor">' + markDown + '</textarea>');
        break;
    }
};

let autoSave = function(form) {
    form = form;
    $.ajax({
        url: postId,
        type: 'POST',
        data: form.serialize(), // serializes the form's elements.
        beforeSend: function(xhr) {
            // Let them know we are saving
            $('.auto-save-status').html('<button type="button" class="btn btn-link">Link</button>');
        },
        success: function(data) {
            $('.auto-save-status').html('<button type="button" class="btn btn-link">Saved ' + app.timeAgo() + '</button>');
        },
    });
}

let categoryToUrl = function(categorySlug, categoryName, toDo, el) {
    let currentUrl = $('input[name="postUrl"');
    let change = '';
    let button = $(el);
    let valArray = currentUrl.val().split('/');

    switch(toDo) {
        case 'add' :
            button.addClass('added').text('Remove from URL');
            let addedLength = $('.category-to-url.added').length;
            valArray.splice(addedLength, 0, categorySlug)
        break;

        case 'remove' :
            button.removeClass('added').text('Add to URL');
            var index = valArray.indexOf(categorySlug);
            if (index !== -1) {
                valArray.splice(index, 1);
            }
        break;
    }

    for (var i = 0; i < valArray.length; i++) {
        if (valArray[i] === '') {
            continue;
        }

        change += '/' + valArray[i];
    }
    currentUrl.val(change);

};

let categoryNew = function(category, addToUrl) {
    let categorySlug = app.sanitizeTitle(category);
    $('.category-list-input').val('');
    let item = '<li data-id="' + categorySlug + '" data-name="' + category + '">'+ category + ' <small class="category-list-options"><a>Options</a></small>\
                    <div class="btn-group hidden category-list-options-buttons" role="group" aria-label="...">\
                        <button type="button" class="btn btn-default btn-xs category-to-url">Add to URL</button>\
                        <input type="hidden" data-id="' + categorySlug +'" name="category[][slug]" value="' + categorySlug +'">\
                        <input type="hidden" data-id="' + categorySlug +'" name="category[][name]" value="' + category +'">\
                        <button type="button" class="btn btn-default btn-xs category-remove">Remove</button>\
                    </div>\
                </li>';
    $('.category-list').append(item);

    if (addToUrl === true) {
        categoryToUrl(categorySlug, category, 'add', $('.category-list').find('li[data-id="' + categorySlug + '"] button.category-to-url'));
    }
};

let showAttachmentDetails = function(data) {
    let attachmentData = $(data).children('.panel').data();
    $('.file-name').html(attachmentData.name);
    $('.upload-date').html(attachmentData.date);
    $('.file-size').html(attachmentData.size);

	if (attachmentData.thumbnails) {

		$('.insert-settings .image-size').empty();
		$('.sidebar-image-preview').html('<img src="' + attachmentData.location + '">');

		$('.insert-settings .image-size').append('<option value="original">Original Image</option>')
		$.each(attachmentData.thumbnails, function(key, val) {
			$('.insert-settings .image-size').append('<option value="' + key + '">' + key + '</option>');
		});
	}
};

let showSelectedImages = function() {
    let selected = $('.media-item-wrap.selected');
    if (selected.length >= 1) {
        $('.selected-thumbnails').show();
        $('.selected-thumbnail-images').empty();
        selected.each(function(i, el) {
            let image = $(el).find('img').clone();
            $('.selected-thumbnails').find('.selected-thumbnail-images').append(image)
        });
    } else {
        $('.selected-thumbnails').hide();
    }
};

let checkUpdates = function() {
	$.post('/spry-admin/api/updates', {version: coreVersion}, function (response) {
		$('.check-updates-toggle').find('.icon-sync').removeClass('spinner');
		callback(response);
	});
};

let insertSelectedImages = function() {

};

let insertIntoEditor = function(string) {
	editor.focus();
    editor.composer.commands.exec('insertHTML', string);
};

let getPosts = function(callback, limit, postId, offset, search, multiId) {

    let data = {};
    if (offset) {
        data.limit = limit;
        data.offset = offset;
    } else {
        data.limit = limit;
    }
    if (postId) {
        data.id = postId;
    }
    if (multiId) {
        data.multiId = true;
    }
    $.post('/' + adminLocation + '/api/posts', data, function (response) {
        callback(response);
    });
}

let getAttachments = function(callback, limit, postId, offset, search) {
    let data = {};
    if (offset) {
        data.limit = limit;
        data.offset = offset;
    } else {
        data.limit = limit;
    }
    if (postId) {
        data.search = {postId: postId}
    }
    $.post('/' + adminLocation + '/api/attachments', data, function (response) {
        callback(response);
    });
}

let appendAttachments = function(res, empty) {

    let insertInto = $('.thumbnail-display .file-details');
    const attachments = JSON.parse(res);
    const a = attachments.attachments;

    if (empty === true) {
        insertInto.empty();
    }

    for (let i = 0; i < a.length; i++) {
        insertInto.prepend(app.fileList(a[i], false));
        if (a[i].thumbnails) {
            $('[data-name="' + a[i].name + '"]').find('.image-preview').html('<img class="img-responsive" src="/uploads/' + a[i].thumbnails['-preview'] + '">');
        } else {
            $('[data-name="' + a[i].name + '"]').find('.image-preview').remove();
        }

        $('[data-name="' + a[i].name + '"]')
            .data({
                'id': a[i]._id,
                'size': app.fileSizeConvert(a[i].size, true),
                'date': app.timeAgo(a[i].timestamp, 'ddd, mmm ddS yyyy h:MMtt'),
                'location': a[i].realPath,
                'type': a[i].fileType,
                'timestamp': a[i].timestamp,
				'thumbnails': a[i].thumbnails
            });
    }
};

let getFileList = function(files){

    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        // add the files to formData object for the data payload
        buildFileList(file);
    }

    $.each(files, function(i, file) {
        let formData = new FormData();
        let reader = new FileReader();
        reader.onload = $.proxy(function(file, $fileList, event) {

        }, this, file, $("#file-upload-list"));
        reader.readAsDataURL(file);
        formData.append(postId, file, file.name);
        fileUploads(formData, file.name);
    });

};

let buildFileList = function(file) {
    $('.thumbnail-display .file-details').prepend(app.fileList(file));
};

let fileUploads = function(formData, fileName) {
    $.ajax({
        url: '/' + adminLocation + '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data){
            let imageDetails = JSON.parse(data);

            console.log(imageDetails);
            if (imageDetails.thumbnails) {
                $('[data-name="' + fileName + '"]').find('.image-preview').html('<img class="img-responsive" src="/uploads/' + imageDetails.thumbnails['-preview'] + '">')
            } else {
                $('[data-name="' + fileName + '"]').find('.image-preview').remove();
            }

            $('[data-name="' + fileName + '"]')
                .data({
                    'id': imageDetails._id,
                    'size': app.fileSizeConvert(imageDetails.size, true),
                    'date': app.timeAgo(imageDetails.timestamp, 'ddd, mmm ddS yyyy h:MMtt'),
                    'location': imageDetails.realPath
                });
        },
        xhr: function() {
            // create an XMLHttpRequest
            let xhr = new XMLHttpRequest();

            // listen to the 'progress' event
            xhr.upload.addEventListener('progress', function(evt) {

                if (evt.lengthComputable) {
                    // calculate the percentage of upload completed
                    let percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete * 100);

                    // update the Bootstrap progress bar with the new percentage
                    $('[data-name="' + fileName + '"]').find('.progress-bar span').text(percentComplete + '%');
                    $('[data-name="' + fileName + '"]').find('.progress-bar').width(percentComplete + '%');

                    // once the upload reaches 100%, set the progress bar text to done
                    if (percentComplete === 100) {
                        $('[data-name="' + fileName + '"]').find('.progress-bar span').text('Done');
                        $('[data-name="' + fileName + '"]').find('.progress-bar').removeClass('active progress-bar-striped bg-primary').addClass('bg-success');
                        $('[data-name="' + fileName + '"]').find('.file-progress').delay(4000).fadeOut(300);
                    }

                }

            }, false);

            return xhr;
        }
    });
};

let onDragEnter = function(event) {
    event.preventDefault();
    $('.drag-overlay').removeClass('off');
},
onDragOver = function(event) {
    event.preventDefault();
    if(!$('.drag-overlay').hasClass('off'))
        $('.drag-overlay').removeClass('off');
},
onDragLeave = function(event) {
    event.preventDefault();
    $('.drag-overlay').addClass('off');
},
onDrop = function(event) {
    event.preventDefault();
    $('.drag-overlay').addClass('off');
    getFileList(event.originalEvent.dataTransfer.files);
};
