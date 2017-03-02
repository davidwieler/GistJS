(function() {   
    
    APP = {

        

        init: function(data){

            APP.api = 'https://msgable.com/';

            APP.account = data;

        },

        getUrl: function(){

            var url = window.location.href;
            var bucket = url.replace(/^.*\/\/[^\/]+/, '').replace('/dashboard', '').replace('#', '')

            return bucket;

        },

        subbucket_creation_template: function(){
            return '<div class="form-group has-feedback has-feedback-left sub-bucket-wrap">\
                        <input type="text" class="form-control sub-bucket-input" placeholder="Sub Bucket Name" name="subbucket[]" value="{{SUBBUCKETNAME}}">\
                        <div class="form-control-feedback">\
                            <i class="icon-more2"></i>\
                        </div>\
                        <i class="icon-cross3 pull-right remove-subbucket" ></i>\
                    </div>';
        },

        bucket_navigation_template: function(){
            return  '<li class="dropdown-submenu bucket-select">\
                        <a href="#" class="bucket-selection" data-id="{{BUCKETNAME}}"><i class="icon-drawer"></i> {{BUCKETNAME}}</a>\
                        <ul class="dropdown-menu width-200">\
                            <li class="dropdown-header highlight">Buckets</li>\
                            {{SUBBUCKETS}}\
                            <li><a href"#" data-toggle="modal" data-target="#modal_full" class="edit-bucket" data-id="{{BUCKETNAME}}"><i class="icon-pencil"></i>Edit</a></li>\
                        </ul>\
                    </li>';
        },

        editor_template: function(msgData, status){

            console.log(status)

            var to = msgData.to,
                subject = msgData.subject,
                conversationId = msgData.conversationId

            return '<div class="panel panel-white conversation-panel">\
                        <div class="panel-body editor-wrap">\
                            <div class="col-lg-12 message-to">\
                                <input type="text" class="form-control" placeholder="Send To:" name="send-to" value="'+to+'">\
                            </div>\
                            <div class="col-lg-12 message-subject">\
                                <input type="text" class="form-control" placeholder="Message Subject:" name="message-subject" value="'+subject+'">\
                            </div>\
                            <ul class="wysihtml5-toolbar" id="toolbar">\
                                <li class="dropdown">\
                                    <a class="btn btn-default dropdown-toggle " data-toggle="dropdown">\
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
                                <li>\
                                <div class="btn-group">\
                                <a class="btn  btn-default" data-wysihtml5-command="bold" title="CTRL+B" tabindex="-1" href="javascript:;" unselectable="on">Bold</a>\
                                <a class="btn  btn-default" data-wysihtml5-command="italic" title="CTRL+I" tabindex="-1" href="javascript:;" unselectable="on">Italic</a>\
                                <a class="btn  btn-default" data-wysihtml5-command="underline" title="CTRL+U" tabindex="-1" href="javascript:;" unselectable="on">Underline</a>\
                                </div>\
                                </li>\
                                <li>\
                                <a class="btn  btn-default" data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="blockquote" data-wysihtml5-display-format-name="false" tabindex="-1" href="javascript:;" unselectable="on">\
                                <span class="icon-quotes-left"></span>\
                                </a>\
                                </li>\
                                <li>\
                                <div class="btn-group">\
                                <a class="btn  btn-default" data-wysihtml5-command="insertUnorderedList" title="Unordered list" tabindex="-1" href="javascript:;" unselectable="on">\
                                <span class="icon-list"></span>\
                                </a>\
                                <a class="btn  btn-default" data-wysihtml5-command="insertOrderedList" title="Ordered list" tabindex="-1" href="javascript:;" unselectable="on">\
                                <span class="icon-list-numbered"></span>\
                                </a>\
                                <a class="btn  btn-default" data-wysihtml5-command="Outdent" title="Outdent" tabindex="-1" href="javascript:;" unselectable="on">\
                                <span class="icon-indent-decrease2"></span>\
                                </a>\
                                <a class="btn  btn-default" data-wysihtml5-command="Indent" title="Indent" tabindex="-1" href="javascript:;" unselectable="on">\
                                <span class="icon-indent-increase2"></span>\
                                </a>\
                                </div>\
                                </li>\
                            </ul>\
                            <!-- element to edit -->\
                            <div id="editor" data-placeholder="Enter your message"></div>\
                        </div>\
                        <div class="panel-footer">\
                            <div class="col-xs-6">\
                                <ul class="icons-list icons-list-extended mt-10">\
                                    <li><a href="#" data-popup="tooltip" title="" data-container="body" data-original-title="Send photo"><i class="icon-file-picture"></i></a></li>\
                                    <li><a href="#" data-popup="tooltip" title="" data-container="body" data-original-title="Send video"><i class="icon-file-video"></i></a></li>\
                                    <li><a href="#" data-popup="tooltip" title="" data-container="body" data-original-title="Send file"><i class="icon-file-plus"></i></a></li>\
                                </ul>\
                            </div>\
                            <div class="col-xs-6 text-right">\
                                <span class="error_msg"></span>\
                                <button type="button" class="btn bg-teal-400 btn-labeled btn-labeled-right submit-message-editor" data-id="'+conversationId+'" data-status="'+status+'"><b><i class="icon-circle-right2"></i></b> Send</button>\
                            </div>\
                        </div>\
                    </div>';

        },

        dataTables: function(table){
            // Table setup
            // ------------------------------

            // Setting datatable defaults
            $.extend( $.fn.dataTable.defaults, {
                autoWidth: false,
                columnDefs: [{ 
                    orderable: false,
                    width: '100px',
                    targets: [ 5 ]
                }],
                dom: '<"datatable-header"fl><"datatable-scroll"t><"datatable-footer"ip>',
                language: {
                    search: '<span>Filter:</span> _INPUT_',
                    lengthMenu: '<span>Show:</span> _MENU_',
                    paginate: { 'first': 'First', 'last': 'Last', 'next': '&rarr;', 'previous': '&larr;' },
                    emptyTable: "There are no messages in this bucket"
                },
                drawCallback: function () {
                    $(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').addClass('dropup');
                },
                preDrawCallback: function() {
                    $(this).find('tbody tr').slice(-3).find('.dropdown, .btn-group').removeClass('dropup');
                },
                'lengthMenu': [ [5, 10, 25, 50, -1], [5, 10, 25, 50, 'All'] ],
                'aaSorting': [[1,'asc']]
            });


            // Basic datatable
            $(table).DataTable();


            // Alternative pagination
            $('.datatable-pagination').DataTable({
                pagingType: "simple",
                language: {
                    paginate: {'next': 'Next &rarr;', 'previous': '&larr; Prev'}
                }
            });


            // Datatable with saving state
            $('.datatable-save-state').DataTable({
                stateSave: true
            });


            // Scrollable datatable
            $('.datatable-scroll-y').DataTable({
                autoWidth: true,
                scrollY: 300
            });



            // External table additions
            // ------------------------------

            // Add placeholder to the datatable filter option
            $('.dataTables_filter input[type=search]').attr('placeholder','Type to filter...');


            // Enable Select2 select for the length option
            $('.dataTables_length select').select2({
                minimumResultsForSearch: Infinity,
                width: 'auto'
            });

        },

        getBucketInfo: function(bucket, callback){

            $('.modal-body, .modal-footer').hide()
            $('.loading-bucket-info').show()

            APP.getData(APP.api + 'getBucketInfo/'+bucket.bucket, function(res){

                var bucketData = JSON.parse(res);
                var subbuckets = bucketData.subbuckets;

                var subBstr = '';

                $('.modal-title').html('<span class="icon-object border-info text-info"><i class="icon-pencil"></i></span> Edit Your Bucket</a>')
                $('.sub-bucket-wrap').remove()
                $('.new-bucket input[name="bucketname"]').val(bucketData.bucketname)
                $('#delete-bucket').show();

                for (var i = 0; i < subbuckets.length; i++) {

                    var template = APP.subbucket_creation_template()

                    subBstr += template.replace('{{SUBBUCKETNAME}}', subbuckets[i])
                }

                $('#add-new-subbucket-field').before(subBstr)
                $('.loading-bucket-info').hide()

                callback(bucketData.id)
            })


        },

    

        getConversation: function(data, callback){

            if(typeof APP.account === 'undefined'){

                console.log('NOPE. not logged in');
                return;
            }

            data.account = APP.account;

            APP.postData(APP.api + 'getConversation', data, function(data){

                var conversation = JSON.parse(data)

                var messages = conversation.docs

                if (messages.length == 0) {
                    APP.showLoading('conversations', false)
                    return;
                }

                var template = APP.getData('/messageTemplate', function(res){

                    var row = res;

                    var string = '';

                    var last = messages.length

                    for (var i = messages.length - 1; i >= 0; i--) {
                        var addto = row
                                    .replace('{{FROM}}', messages[i].msgdata.from || '')
                                    .replace('{{NAME}}', messages[i].msgdata.meta.name)
                                    .replace('{{BUCKET}}', messages[i].msgdata.bucket)
                                    .replace('{{SUBJECT}}', messages[i].msgdata.subject)
                                    .replace('{{TIMEAGO}}', APP.timeAgo(messages[i].ts))
                                    .replace('{{TIME}}', APP.time(messages[i].ts))
                                    .replace('{{STATUS}}', status)
                                    .replace('/{{CONVID}}/g', messages[i].conversationId)
                                    .replace('{{MESSAGE}}', messages[i].msgdata.message)

                        if(i != 0){
                            addto = addto.replace('{{COLLAPSE_CLASS}}', 'panel-collapsed')
                        }
                        else{
                            //Last recorded message
                            addto = addto.replace('{{COLLAPSE_CLASS}}', '')
                            var subject = messages[i].msgdata.meta.subject
                        }

                        string += addto

                    }

                    var returns = {string: string}

                    callback(returns, subject)

                })             

            })

        },

        getMessages: function(data, callback){

            //APP.loadingMessages(true);

            if(typeof APP.account === 'undefined'){

                console.log('NOPE. not logged in');
                return;
            }

            data.account = APP.account;

            APP.postData(APP.api + 'getMessages', data, function(data){

                var messages = JSON.parse(data)

                var docs = messages.docs

                if (docs.length == 0) {
                    APP.showLoading('buckets', false)
                    return;
                }

                var template = APP.getData('/rowTemplate', function(res){

                    var row = res
                        string = '',
                        newcount = 0,
                        repliedcount = 0,
                        closedcount = 0,
                        spamcount = 0,
                        replycount = 0,
                        conversations = {},
                        convArray = {}

                    for (var i = docs.length - 1; i >= 0; i--) {                        

                        var id = docs[i].conversationId

                        conversations[id] = (conversations[id] || 0) + 1 

                        if(!convArray[id]){

                            convArray[id] = []

                        }

                        convArray[id].push(docs[i]);           

                            
                        var status = '';

                        switch(docs[i].msgdata.status){

                            case 'replied' :
                                repliedcount += 1
                            break;

                            case 'closed' :
                                closedcount += 1;
                            break;

                            case 'new' :
                                newcount += 1;
                            break;

                            case 'spam' :
                                spamcount += 1;
                            break;

                            case 'reply-from' :
                                replycount += 1;
                            break;

                            case 'sent' :
                                replycount += 1;
                            break;
                        }

                    }

                    var quickbuttons = '';
                    if(newcount >= 1){

                        quickbuttons += '<button class="label bg-success heading-text getSort" data-id="new">'+newcount+' New</button>'

                    }
                    if(replycount >= 1){

                        quickbuttons += '<button class="label bg-info heading-text getSort" data-id="update">'+replycount+' Updated</button>'
                        
                    }
                    if(repliedcount >= 1){

                        quickbuttons += '<button class="label bg-blue heading-text getSort" data-id="replied">'+repliedcount+' Replied</button>'
                        
                    }
                    if(closedcount >= 1){

                        quickbuttons += '<button class="label bg-slate heading-text getSort" data-id="closed">'+closedcount+' Closed</button>'
                        
                    }
                    if(spamcount >= 1){

                        quickbuttons += '<button class="label bg-danger heading-text getSort" data-id="Spam">'+spamcount+' Spam</button>'
                        
                    }

                    //APP.loadingMessages(string, messages.bucket, quickbuttons);

                    for(var i in convArray){

                        var msg = convArray[i][0]

                        switch(msg.msgdata.status){

                            case 'replied' :

                                status = '<span class="label bg-blue">Replied</span>'

                            break;

                            case 'closed' :

                                status = '<span class="label bg-slate">Closed</span>'

                            break;

                            case 'new' :

                                status = '<span class="label bg-green">New</span>'

                            break;

                            case 'spam' :

                                status = '<span class="label bg-danger">Spam?</span>'

                            break;

                            case 'reply-from' :

                                status = '<span class="label bg-green">Update</span>'

                            break;

                            case 'sent' :

                                status = '<span class="label bg-info">Sent</span>'

                            break;
                        }                          

                        var addto = row
                                    .replace('{{FROM}}', msg.msgdata.from || '')
                                    .replace('{{NAME}}', msg.msgdata.meta.name)
                                    .replace('{{BUCKET}}', msg.msgdata.bucket)
                                    .replace('{{SUBJECT}}', msg.msgdata.meta.subject)
                                    .replace('{{TIMEAGO}}', APP.timeAgo(msg.ts))
                                    .replace('{{TIME}}', APP.time(msg.ts))
                                    .replace('{{STATUS}}', status)
                                    .replace(/{{CONVID}}/g, msg.conversationId)
                                    .replace(/{{MSGID}}/g, msg._id)

                        string += addto                        

                    }
                    var returns = {string: string, quickbuttons:quickbuttons}

                    callback(returns)

                })

            })
        },

        /*
        * Handles all the DOM and History events
        * Requires: APP.getMessages
        */
        loadMessages: function(bucket, historyPush){

            APP.showLoading('buckets')            

            $('#modal_full').modal('hide')

            if(historyPush ===  true){

                history.pushState(null, null, '/dashboard/bucket/'+bucket);

            }

            if($(".nav .dropdown").hasClass('open')){
                $(".bucket-dropdown").dropdown("toggle");
            }

            APP.getMessages({bucket: bucket}, function(res){
                
                setTimeout(function(){
                    APP.showLoading(false)

                    var messagestable = $('#messages_table').DataTable(); 
                    messagestable.destroy();                   

                   
                    $('#messages').empty();   

                    $('#messages').html(res.string)

                    APP.dataTables('#messages_table');

                    var bucketNames = bucket.split('/')

                    var mainBucketName = toTitleCase(bucketNames[0])

                    $('.main-bucket-name').html(mainBucketName)
                    $('.quick-buttons').html(res.quickbuttons)

                    if(typeof bucketNames[1] !== 'undefined'){

                        $('.main-bucket-name').append(' - ')

                        var subBucketName = toTitleCase(bucketNames[1])
                        $('.sub-bucket-name').html(subBucketName)
                    }
                    else{

                        $('.sub-bucket-name').html('')
                    }

                    $('.messages-wrapper').fadeIn(400).promise().done(function() {

                        
                    });                     
                }, 1000)

            });    


        },

        newConversation: function(historyPush){

            APP.showLoading('new')

            if(historyPush !==  false){

                history.pushState(null, null, '/dashboard/conversation/new');

            }

            var msgData = {to:'',subject:'', conversationId: ''}       

            $('.conversation-wrapper .data-wrap').append(APP.editor_template(msgData, 'new'))


            setTimeout(function(){
                $('.conversation-wrapper').fadeIn(400).promise().done(function() {


                    
                });   
            }, 1000)  

            var editor = new wysihtml5.Editor('editor', {
                toolbar: 'toolbar',
                parserRules:  wysihtml5ParserRules
            });

            APP.showLoading('new', 'done', editor)                        

        },         

        loadConversation: function(conversationId, historyPush){

            alert('nOPE')

            APP.showLoading('conversations')

            if(historyPush !==  false){

                history.pushState(null, null, '/dashboard/conversation/'+conversationId);

            }

            APP.getConversation({conversationId: conversationId}, function(res, subject){

                setTimeout(function(){
                    $('.conversation-wrapper').fadeIn(400).promise().done(function() {

                        
                    });   
                }, 1000)

                

                $('.data-wrap').html(res.string)

                $('.panel-collapsed').children('.panel-heading').nextAll().hide();


                // Rotate icon if collapsed by default
                $('.panel-collapsed').find('[data-action=collapse]').addClass('rotate-180');

                $('.conversation-wrapper .data-wrap').append(APP.editor_template(conversationId, subject))

                //tinymce.remove();
                //tinymce.init({                
                    //selector: '#message-editor',
                    //statusbar: false,
                    //toolbar: 'undo redo styleselect bold italic bullist numlist outdent indent code',
                    //menubar: false,
                    //plugins: "autoresize",
                    //autoresize_max_height: 500
                //});
                //tinymce.activeEditor.getBody().setAttribute('contenteditable', false);
                var editor = new wysihtml5.Editor('editor', {
                    toolbar: 'toolbar',
                    parserRules:  wysihtml5ParserRules
                });

                APP.showLoading('conversations', 'done', editor)             

            });               

        },

        showLoading: function(type, bool, editor){

            $('.empty-bucket, .messages-wrapper, .conversation-wrapper').hide()

            if(bool === 'done' ){

                setTimeout(function(){

                    switch(type){

                        case 'buckets' :
                             $('.loading-bucket').addClass('hidden').fadeOut('slow');
                        break;

                        case 'new' :

                            $('.loading-new-conversation').addClass('hidden').fadeOut('slow');
                            editor.focus();
                        break;

                        case 'conversations' :

                            $('.loading-conversation').addClass('hidden').fadeOut('slow');
                            editor.focus();
                        break;
                    }
                }, 1000);

                //reinitialize popup on elements new to the DOM
                $('[data-popup="popover"]').popover();
                $('[data-popup="tooltip"]').tooltip();

                return;

            }               

            if(bool === false ){

                setTimeout(function(){

                switch(type){

                    case 'buckets' :
                         $('.loading-bucket').addClass('hidden').fadeOut('slow');
                    break;

                    case 'new' :
                        $('.loading-new-conversation').addClass('hidden').fadeOut('slow');
                    break;

                    case 'conversations' :
                        $('.loading-conversation').addClass('hidden').fadeOut('slow');
                    break;
                }                    
               
                $('.empty-bucket').removeClass('hidden').fadeIn('slow');
                }, 1000);


                return;

            }

            if(type === false){

                $('.loading-wrap').addClass('hidden').fadeOut('slow');

                return
            }

            switch(type){

                case 'buckets' :
                    $('.messages-wrapper').fadeOut(400).promise().done(function() {
                        $('.loading-bucket').removeClass('hidden').fadeIn('slow');
                    });
                break;

                case 'new' :
                    $('.conversation-wrapper').fadeOut(400).promise().done(function() {
                        $('.loading-new-conversation').removeClass('hidden').fadeIn('slow');
                    });
                break;                

                case 'conversations' :
                    $('.conversation-wrapper').fadeOut(400).promise().done(function() {
                        $('.loading-conversation').removeClass('hidden').fadeIn('slow');
                    });
                break;
            }

        }, 

        sendMessage: function(data, callback){

            data.account = APP.account

            APP.postData(APP.api+'sendMessage', data, function(res){
           
                callback(res)                                 

            })


        },

        time: function(timeStamp){

            // Create a new JavaScript Date object based on the timestamp
            // multiplied by 1000 so that the argument is in milliseconds, not seconds.
            var date = new Date(timeStamp);

            var ampm = 'am';

            if(date.getHours() >=12){

                ampm = 'pm'

            }
            // Hours part from the timestamp
            var hours = ((date.getHours() + 11) % 12 + 1)
            // Minutes part from the timestamp
            var minutes = "0" + date.getMinutes();
            // Seconds part from the timestamp
            var seconds = "0" + date.getSeconds();

            // Will display time in 10:30:23 format
            //var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + amapm;
            var formattedTime = hours + ':' + minutes.substr(-2) + ampm;
            return formattedTime

        },

        timeAgo: function(dateString) {
            var rightNow = new Date();
            var then = new Date(dateString);
     
            var diff = rightNow - then;
     
            var second = 1000,
            minute = second * 60,
            hour = minute * 60,
            day = hour * 24,
            week = day * 7;
     
            if (isNaN(diff) || diff < 0) {
                return ""; // return blank string if unknown
            }
     
            if (diff < second * 2) {
                // within 2 seconds
                return "right now";
            }
     
            if (diff < minute) {
                return Math.floor(diff / second) + " seconds ago";
            }
     
            if (diff < minute * 2) {
                return "about a minute ago";
            }
     
            if (diff < hour) {
                return Math.floor(diff / minute) + " minutes ago";
            }
     
            if (diff < hour * 2) {
                return "about an hour ago";
            }
     
            if (diff < day) {
                return  Math.floor(diff / hour) + " hours ago";
            }
     
            if (diff > day && diff < day * 2) {
                return "yesterday";
            }
     
            if (diff < day * 365) {
                return Math.floor(diff / day) + " days ago";
            }
     
            else {
                return "over a year ago";
            }
        }, // timeAgo()

        getData: function(url, callback){

            $('.xhr-failure').hide();

            var xhr = $.get(url)
                    .done(function(data) { 
                        //console.log(data); // predefined logic if any
                        if(typeof callback == 'function') {
                           callback(data);
                        }
                    }); 
            xhr.fail(function(xhr, textStatus, error) {
               $('.xhr-failure').html('There was an error connecting to the server. Please try again.').show();
            });

        }, 


        /*
         * Usage:
         *   APP.post(APP.api + 'URLROUTES', data, function(res){

                alert(res);

            })
         *
         */
        postData: function(postto, d, callback){

            var xhr = $.post(postto, d )
                    .done(function(data) { 
                        if(typeof callback == 'function') {
                           callback(data);
                        }
                    }); 
            xhr.fail(function(xhr, textStatus, error) {
               $('.xhr-failure').html('There was an error connecting to the server. Please try again.').show();
            });

        },

        renewApiKeys: function(data, callback){

            APP.postData(APP.api+'renewapi', data, function(res){
                callback(JSON.parse(res))
            })

        }

    }

})();

function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

/* ------------------------------------------------------------------------------
*
*  # Template JS core
*
*  Core JS file with default functionality configuration
*
*  Version: 1.2
*  Latest update: Dec 11, 2015
*
* ---------------------------------------------------------------------------- */


// Allow CSS transitions when page is loaded
$(window).on('load', function() {
    $('body').removeClass('no-transitions');
});


$(function() {

    // ========================================
    //
    // Heading elements
    //
    // ========================================


    // Heading elements toggler
    // -------------------------

    // Add control button toggler to page and panel headers if have heading elements
    $('.panel-heading, .page-header-content, .panel-body, .panel-footer').has('> .heading-elements').append('<a class="heading-elements-toggle"><i class="icon-more"></i></a>');


    // Toggle visible state of heading elements
    $('.heading-elements-toggle').on('click', function() {
        $(this).parent().children('.heading-elements').toggleClass('visible');
    });



    // Breadcrumb elements toggler
    // -------------------------

    // Add control button toggler to breadcrumbs if has elements
    $('.breadcrumb-line').has('.breadcrumb-elements').append('<a class="breadcrumb-elements-toggle"><i class="icon-menu-open"></i></a>');


    // Toggle visible state of breadcrumb elements
    $('.breadcrumb-elements-toggle').on('click', function() {
        $(this).parent().children('.breadcrumb-elements').toggleClass('visible');
    });




    // ========================================
    //
    // Navbar
    //
    // ========================================


    // Navbar navigation
    // -------------------------

    // Prevent dropdown from closing on click
    $(document).on('click', '.dropdown-content', function (e) {
        e.stopPropagation();
    });

    // Disabled links
    $('.navbar-nav .disabled a').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
    });

    // Show tabs inside dropdowns
    $('.dropdown-content a[data-toggle="tab"]').on('click', function (e) {
        $(this).tab('show');
    });



    // Drill down menu
    // ------------------------------

    // If menu has child levels, add selector class
    $('.menu-list').find('li').has('ul').parents('.menu-list').addClass('has-children');

    // Attach drill down menu to menu list with child levels
    $('.has-children').dcDrilldown({
        defaultText: 'Back to parent',
        saveState: true
    });


    // ========================================
    //
    // Element controls
    //
    // ========================================


    // Reload elements
    // -------------------------

    // Panels
    $('.panel [data-action=reload]').click(function (e) {
        e.preventDefault();
        var block = $(this).parent().parent().parent().parent().parent();
        $(block).block({ 
            message: '<i class="icon-spinner2 spinner"></i>',
            overlayCSS: {
                backgroundColor: '#fff',
                opacity: 0.8,
                cursor: 'wait',
                'box-shadow': '0 0 0 1px #ddd'
            },
            css: {
                border: 0,
                padding: 0,
                backgroundColor: 'none'
            }
        });

        // For demo purposes
        window.setTimeout(function () {
           $(block).unblock();
        }, 2000); 
    });


    // Sidebar categories
    $('.category-title [data-action=reload]').click(function (e) {
        e.preventDefault();
        var block = $(this).parent().parent().parent().parent();
        $(block).block({ 
            message: '<i class="icon-spinner2 spinner"></i>',
            overlayCSS: {
                backgroundColor: '#000',
                opacity: 0.5,
                cursor: 'wait',
                'box-shadow': '0 0 0 1px #000'
            },
            css: {
                border: 0,
                padding: 0,
                backgroundColor: 'none',
                color: '#fff'
            }
        });

        // For demo purposes
        window.setTimeout(function () {
           $(block).unblock();
        }, 2000); 
    }); 


    // Light sidebar categories
    $('.sidebar-default .category-title [data-action=reload]').click(function (e) {
        e.preventDefault();
        var block = $(this).parent().parent().parent().parent();
        $(block).block({ 
            message: '<i class="icon-spinner2 spinner"></i>',
            overlayCSS: {
                backgroundColor: '#fff',
                opacity: 0.8,
                cursor: 'wait',
                'box-shadow': '0 0 0 1px #ddd'
            },
            css: {
                border: 0,
                padding: 0,
                backgroundColor: 'none'
            }
        });

        // For demo purposes
        window.setTimeout(function () {
           $(block).unblock();
        }, 2000); 
    }); 



    // Collapse elements
    // -------------------------

    //
    // Sidebar categories
    //

    // Hide if collapsed by default
    $('.category-collapsed').children('.category-content').hide();


    // Rotate icon if collapsed by default
    $('.category-collapsed').find('[data-action=collapse]').addClass('rotate-180');


    // Collapse on click
    $('.category-title [data-action=collapse]').click(function (e) {
        e.preventDefault();
        var $categoryCollapse = $(this).parent().parent().parent().nextAll();
        $(this).parents('.category-title').toggleClass('category-collapsed');
        $(this).toggleClass('rotate-180');

        containerHeight(); // adjust page height

        $categoryCollapse.slideToggle(150);
    });


    //
    // Panels
    //

    // Hide if collapsed by default
    $('.panel-collapsed').children('.panel-heading').nextAll().hide();


    // Rotate icon if collapsed by default
    $('.panel-collapsed').find('[data-action=collapse]').addClass('rotate-180');


    // Collapse on click
    $('body').on('click', '.panel [data-action=collapse]', function (e) {
        e.preventDefault();
        var $panelCollapse = $(this).parent().parent().parent().parent().nextAll();
        $(this).parents('.panel').toggleClass('panel-collapsed');
        $(this).toggleClass('rotate-180');

        //containerHeight(); // recalculate page height

        $panelCollapse.slideToggle(150);
    });



    // Remove elements
    // -------------------------

    // Panels
    $('.panel [data-action=close]').click(function (e) {
        e.preventDefault();
        var $panelClose = $(this).parent().parent().parent().parent().parent();

        containerHeight(); // recalculate page height

        $panelClose.slideUp(150, function() {
            $(this).remove();
        });
    });


    // Sidebar categories
    $('.category-title [data-action=close]').click(function (e) {
        e.preventDefault();
        var $categoryClose = $(this).parent().parent().parent().parent();

        containerHeight(); // recalculate page height

        $categoryClose.slideUp(150, function() {
            $(this).remove();
        });
    });




    // ========================================
    //
    // Main navigation
    //
    // ========================================


    // Main navigation
    // -------------------------

    // Add 'active' class to parent list item in all levels
    $('.navigation').find('li.active').parents('li').addClass('active');

    // Hide all nested lists
    $('.navigation').find('li').not('.active, .category-title').has('ul').children('ul').addClass('hidden-ul');

    // Highlight children links
    $('.navigation').find('li').has('ul').children('a').addClass('has-ul');

    // Add active state to all dropdown parent levels
    $('.dropdown-menu:not(.dropdown-content), .dropdown-menu:not(.dropdown-content) .dropdown-submenu').has('li.active').addClass('active').parents('.navbar-nav .dropdown:not(.language-switch), .navbar-nav .dropup:not(.language-switch)').addClass('active');

    

    // Main navigation tooltips positioning
    // -------------------------

    // Left sidebar
    $('.navigation-main > .navigation-header > i').tooltip({
        placement: 'right',
        container: 'body'
    });



    // Collapsible functionality
    // -------------------------

    // Main navigation
    $('.navigation-main').find('li').has('ul').children('a').on('click', function (e) {
        e.preventDefault();

        // Collapsible
        $(this).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).toggleClass('active').children('ul').slideToggle(250);

        // Accordion
        if ($('.navigation-main').hasClass('navigation-accordion')) {
            $(this).parent('li').not('.disabled').not($('.sidebar-xs').not('.sidebar-xs-indicator').find('.navigation-main').children('li')).siblings(':has(.has-ul)').removeClass('active').children('ul').slideUp(250);
        }
    });

        
    // Alternate navigation
    $('.navigation-alt').find('li').has('ul').children('a').on('click', function (e) {
        e.preventDefault();

        // Collapsible
        $(this).parent('li').not('.disabled').toggleClass('active').children('ul').slideToggle(200);

        // Accordion
        if ($('.navigation-alt').hasClass('navigation-accordion')) {
            $(this).parent('li').not('.disabled').siblings(':has(.has-ul)').removeClass('active').children('ul').slideUp(200);
        }
    }); 




    // ========================================
    //
    // Sidebars
    //
    // ========================================


    // Mini sidebar
    // -------------------------

    // Toggle mini sidebar
    $('.sidebar-main-toggle').on('click', function (e) {
        e.preventDefault();

        // Toggle min sidebar class
        $('body').toggleClass('sidebar-xs');
    });



    // Sidebar controls
    // -------------------------

    // Disable click in disabled navigation items
    $(document).on('click', '.navigation .disabled a', function (e) {
        e.preventDefault();
    });


    // Adjust page height on sidebar control button click
    $(document).on('click', '.sidebar-control', function (e) {
        containerHeight();
    });


    // Hide main sidebar in Dual Sidebar
    $(document).on('click', '.sidebar-main-hide', function (e) {
        e.preventDefault();
        $('body').toggleClass('sidebar-main-hidden');
    });


    // Toggle second sidebar in Dual Sidebar
    $(document).on('click', '.sidebar-secondary-hide', function (e) {
        e.preventDefault();
        $('body').toggleClass('sidebar-secondary-hidden');
    });


    // Hide all sidebars
    $(document).on('click', '.sidebar-all-hide', function (e) {
        e.preventDefault();
        $('body').toggleClass('sidebar-all-hidden');
    });



    //
    // Opposite sidebar
    //

    // Collapse main sidebar if opposite sidebar is visible
    $(document).on('click', '.sidebar-opposite-toggle', function (e) {
        e.preventDefault();

        // Opposite sidebar visibility
        $('body').toggleClass('sidebar-opposite-visible');

        // If visible
        if ($('body').hasClass('sidebar-opposite-visible')) {

            // Make main sidebar mini
            $('body').addClass('sidebar-xs');

            // Hide children lists
            $('.navigation-main').children('li').children('ul').css('display', '');
        }
        else {

            // Make main sidebar default
            $('body').removeClass('sidebar-xs');
        }
    });


    // Hide main sidebar if opposite sidebar is shown
    $(document).on('click', '.sidebar-opposite-main-hide', function (e) {
        e.preventDefault();

        // Opposite sidebar visibility
        $('body').toggleClass('sidebar-opposite-visible');
        
        // If visible
        if ($('body').hasClass('sidebar-opposite-visible')) {

            // Hide main sidebar
            $('body').addClass('sidebar-main-hidden');
        }
        else {

            // Show main sidebar
            $('body').removeClass('sidebar-main-hidden');
        }
    });


    // Hide secondary sidebar if opposite sidebar is shown
    $(document).on('click', '.sidebar-opposite-secondary-hide', function (e) {
        e.preventDefault();

        // Opposite sidebar visibility
        $('body').toggleClass('sidebar-opposite-visible');

        // If visible
        if ($('body').hasClass('sidebar-opposite-visible')) {

            // Hide secondary
            $('body').addClass('sidebar-secondary-hidden');

        }
        else {

            // Show secondary
            $('body').removeClass('sidebar-secondary-hidden');
        }
    });


    // Hide all sidebars if opposite sidebar is shown
    $(document).on('click', '.sidebar-opposite-hide', function (e) {
        e.preventDefault();

        // Toggle sidebars visibility
        $('body').toggleClass('sidebar-all-hidden');

        // If hidden
        if ($('body').hasClass('sidebar-all-hidden')) {

            // Show opposite
            $('body').addClass('sidebar-opposite-visible');

            // Hide children lists
            $('.navigation-main').children('li').children('ul').css('display', '');
        }
        else {

            // Hide opposite
            $('body').removeClass('sidebar-opposite-visible');
        }
    });


    // Keep the width of the main sidebar if opposite sidebar is visible
    $(document).on('click', '.sidebar-opposite-fix', function (e) {
        e.preventDefault();

        // Toggle opposite sidebar visibility
        $('body').toggleClass('sidebar-opposite-visible');
    });



    // Mobile sidebar controls
    // -------------------------

    // Toggle main sidebar
    $('.sidebar-mobile-main-toggle').on('click', function (e) {
        e.preventDefault();
        $('body').toggleClass('sidebar-mobile-main').removeClass('sidebar-mobile-secondary sidebar-mobile-opposite');
    });


    // Toggle secondary sidebar
    $('.sidebar-mobile-secondary-toggle').on('click', function (e) {
        e.preventDefault();
        $('body').toggleClass('sidebar-mobile-secondary').removeClass('sidebar-mobile-main sidebar-mobile-opposite');
    });


    // Toggle opposite sidebar
    $('.sidebar-mobile-opposite-toggle').on('click', function (e) {
        e.preventDefault();
        $('body').toggleClass('sidebar-mobile-opposite').removeClass('sidebar-mobile-main sidebar-mobile-secondary');
    });

// Popover

});