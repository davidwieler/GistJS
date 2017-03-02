
        window.addEventListener("popstate", function(e) {

            var url = APP.getUrl(),
                type = url.split('/')[1],
                id = url.split('/')[2]

                alert(id)
            if(id == 'new'){

                APP.newConversation();

                return
            }

            switch(type){

                case 'conversation' :
                    APP.loadConversation(id, false)
                break;

                case 'bucket' :
                    APP.loadMessages(id || 'all', false);
                break;

                default :
                    APP.loadMessages('all', false);
                break;
            }
	    })

        $(document).ready(function(){

            //tinymce.init({ selector: '#message-editor',plugins: "autoresize"});

            $('body').on('click', 'button.getSort', function(){

                var type = $(this).attr('data-id')

                $('.dataTables_filter input').val(type).keyup();
            })

            $('.new-bucket').on('submit', function(e){

                e.preventDefault()
                $('.bucket-name-wrap').removeClass('has-error').children('.help').show().html('')
                var data = collectFormData('.new-bucket');
                data.accountid = APP.account;

                APP.postData(APP.api + 'createBucket', data, function(res){

                	var bucketData = JSON.parse(res);

                    switch(bucketData.status){

                        case 'added' :

                            var bucket = APP.getUrl(); 
                            
                            if(bucket === '/welcome'){
                                window.location.href= '/dashboard#firstbucket'    
                                return;                            
                            }
                            else{                         
                            	$('.new-bucket-li').before(bucketData.newnav)
                                $('.new-bucket').hide();
                                $('.modal-on-success').removeClass('hidden').show();
                                $('.visit-bucket a').attr('href','/bucket/'+data.inputs.bucketname)
                                $('.visit-bucket a').attr('data-id', data.inputs.bucketname)                   
                            }
                        break;

                        case 'exists' :
                        	$('.bucket-name-wrap').addClass('has-error').children('.help').show().html('You already have a bucket with this name.')
                        break;
                    }
                })
                return false
            })

            $('body').on('click', '#delete-bucket', function(e){
            	e.preventDefault();
            	$('#delete-bucket-confirmation').show();
            	$('.modal-body, .modal-footer').hide()
            })

            $('body').on('click', '#cancel-bucket-delete', function(e){
            	e.preventDefault();
            	$('#delete-bucket-confirmation').hide();
            	$('.modal-body, .modal-footer').show()
			})

			$('body').on('click', '#confirm-bucket-delete', function(e){
				e.preventDefault();

				var id = $(this).attr('data-id')

				APP.postData(APP.api + 'deleteBucket', {bucketId: id}, function(res){

                    switch(res){

                        case 'removed' :

                            window.location.href= '/dashboard'

                        break;

                        case 'failed' :
                        	alert('nope')
                        break;
                    }
                })
			})

            $('body').on('click', '.remove-subbucket', function(){

                $(this).parents().eq(0).remove()

                var values = [];
                $('.sub-bucket-input').each(function(){
                    values.push($(this).val());
                });

                count = values.length;

                if(count == 0){
                    $('#add-new-subbucket-field').html('Add a Sub Bucket')
                }

            })

            $('body').on('click', '.edit-bucket', function(e){

                e.preventDefault()

                var bucketname = $(this).attr('data-id')

                $("#modal_full").modal()
                $(".bucket-dropdown").dropdown("toggle")
                $('.submit-form-button').html('Save')
                $('#delete-bucket-confirmation').hide();
                $('.new-bucket').show();

                APP.getBucketInfo({bucket: bucketname}, function(res){

                	$('#confirm-bucket-delete').attr('data-id', res)
                	
                    $('.modal-body, .modal-footer').fadeIn()

                    //do whatever with the response, the callback is yours


                });             

                return false;
            })

            $('body').on('click', '.create-new-bucket', function(e){

                $('.new-bucket input').val('')
                $('#delete-bucket, #delete-bucket-confirmation').hide();
            	$('.modal-body, .modal-footer').show()                
                $('.submit-form-button').html('Create')
                $('.modal-title').html('<span class="icon-object border-success text-success"><i class="icon-plus3"></i></span> Create a New Message Bucket</a>')
                $('.sub-bucket-wrap').remove()
                var template = APP.subbucket_creation_template()
                $('#add-new-subbucket-field').before(template.replace('{{SUBBUCKETNAME}}', ''))
                
				$('.modal-on-success').addClass('hidden').hide();
				$('.bucket-name-wrap').removeClass('has-error').children('.help').show().html('')
				$('.new-bucket').show();

            })

            $('body').on('click', '#add-new-subbucket-field', function(e){

                e.preventDefault();

                    var template = APP.subbucket_creation_template()

                    $(this).before(template.replace('{{SUBBUCKETNAME}}', ''))

                    $('#add-new-subbucket-field').html('<i class="icon-plus3"></i> Add Another Sub Bucket')

                return false;
            })          

            $('.button-test, .bucket-select a.bucket-selection').on('click', function(e){

                e.stopImmediatePropagation();

                var bucket = $(this).attr('data-id')

                APP.loadMessages(bucket, true);

                return false;

            })

            $('body').on('click', 'a.message-select', function(e){

                e.preventDefault();

                APP.loadConversation($(this).attr('data-id'));
                return false;

            })

            $('body').on('click', '.create-new-message', function(e){
                e.preventDefault();

                APP.newConversation();

                return false;
            })

            $('body').on('click', '.submit-message-editor', function(){
                var data = {
                    conversationId: $(this).attr('data-id'),
                    content: $('#editor').html(),
                    subject: $('input[name="message-subject"]').val(),
                    to: $('input[name="send-to"]').val(),
                    status: $(this).attr('data-status')
                }

                var el = $('.submit-message-editor')

                el.removeClass('bg-teal-400').addClass('bg-black-400').html('<b><i class="icon-spinner10 spinner"></i></b> Sending').prop('disabled', true)

                APP.sendMessage(data, function(res){

                    var response = JSON.parse(res)

                    switch(response.code){
                        case 200 :
                            setTimeout(function(){

                                var str = '';

                                el.removeClass('bg-black-400 btn-labeled btn-labeled-right').addClass('bg-success-400').html('Message Sent!')
                                var template = APP.getData('/messageTemplate', function(res){

                                    console.log(response)

                                    str += res
                                        .replace('{{FROM}}', response.message.msgdata.from )
                                        .replace('{{NAME}}', response.message.msgdata.meta.name)
                                        .replace('{{BUCKET}}', response.message.msgdata.bucket)
                                        .replace('{{SUBJECT}}', response.message.msgdata.subject)
                                        .replace('{{TIMEAGO}}', APP.timeAgo(response.message.ts))
                                        .replace('{{TIME}}', APP.time(response.message.ts))
                                        .replace('{{STATUS}}', status)
                                        .replace('/{{CONVID}}/g', response.message.conversationId)
                                        .replace('{{MESSAGE}}', response.message.msgdata.message)
                                    console.log(str)
                                })                                
                            }, 2000)
                            
                            setTimeout(function(){
                                el.addClass('bg-teal-400 btn-labeled btn-labeled-right').removeClass('bg-success-400').html('<b><i class="icon-circle-right2"></i></b> Send').prop('disabled', false)
                            }, 4000)


                        break;

                        default :
                            setTimeout(function(){
                                $('.error_msg').show().html(response.msg)

                                setTimeout(function(){
                                    $('.error_msg').fadeOut()
                                }, 2000)
                                el.removeClass('btn-labeled btn-labeled-right').addClass('bg-danger-400').html('Error Sending Message')
                            }, 2000)
                            
                            setTimeout(function(){
                                el.addClass('bg-teal-400 btn-labeled btn-labeled-right').removeClass('bg-danger-400').html('<b><i class="icon-circle-right2"></i></b> Send').prop('disabled', false)
                            }, 4000)
                        break;
                    }
                })

            })

            $('.renew-private-api-key').on('click', function(e){

                var data = {accountid: APP.account}

                $('.renew-private-api-key').prop('disabled', true)

                e.preventDefault();

                APP.renewApiKeys(data, function(res){

                    if(res.status == 'ok'){

                        var pub = $('input[name="pub_api_key"]')
                        var priv = $('input[name="priv_api_key"]')

                        pub.fadeTo(200, 0.1, function() { $(this).val(res.pub).fadeTo(200, 1); });
                        priv.fadeTo(200, 0.1, function() { $(this).val(res.priv).fadeTo(200, 1); });

                        $('.renew-private-api-key').html('API keys have been changed')
                        setTimeout(function(){
                            $('.renew-private-api-key').html('Revoke and Renew')
                            $('.renew-private-api-key').prop('disabled', false)
                        }, 2000)                        
                    }

                })

                return false;

            })

            $('.test-send').on('click', function(e){

                e.preventDefault();

                var data = {}

                APP.postData(APP.api+'sendMessage', data, function(data){
                    console.log(data)
                })
            })

        })
