let showAttachmentDetails = function(data) {
    let attachmentData = $(data).children('.panel').data();
    $('.file-name').html(attachmentData.name);
    $('.upload-date').html(attachmentData.date);
    $('.file-size').html(attachmentData.size);
    console.log(attachmentData);
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

let insertSelectedImages = function() {

};

let insertIntoEditor = function(string) {
    editor.composer.commands.exec('insertHTML', string);

};

let getPosts = function(callback, limit, postId, offset, search) {

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

    if (empty === true) {
        insertInto.empty();
    }
    let attachments = JSON.parse(res);
    let a = attachments.attachments.attachments;

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
                'location': a[i].realPath
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
            //let img = file.type.match('image.*') ? "<img src='" + event.target.result + "' /> " : "";
            //$fileList.prepend( $("<li>").append( img + '<p class="file-details">' + file.name + '</p>' ) );
        }, this, file, $("#file-upload-list"));
        reader.readAsDataURL(file);
        formData.append(postId, file, file.name);
        fileUploads(formData, file.name);
    });

    //$('.progress-bar span').text('0%');
    //$('.progress-bar').addClass('active progress-bar-striped bg-primary').removeClass('bg-success').width('0%');

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