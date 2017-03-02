function collectFormData(formIdent){
	
	var form = formIdent;
	
	inputArray = {};
		inArray = {} //Creating a list of inputs with the same name. just add "[]" to the end on each similar input. IE. inputName[]
	
	radioArray = {};
	
	selectArray = {};

	textareaArray = {};

	checkedObject = {};

	checkedArray = {};
	
	validInput = true;
	
	validRadio = true;
	
	validSelect = true;

	validChecked = true;

	validTextarea = true;
	
	var button = $(form+' .submit-form-button');

	var buttonText = button.text();
	var buttonWidth = button.outerWidth();
	
	//button.css({background:'#FFFFFF', width:buttonWidth}).html('<img src="https://syncsage.com/images/ssloading.gif" class="tiny-rotator">');

	$('.form-group div.alert').addClass('hidden').hide();

	//$(button).prop('disabled', true);
	
	//Radios
	
	radioArrayNames = [];
	
	$(form+' input:radio').each(function(){
		
		var radio = $(this); // This is the jquery object of the input, do what you will
		
		radioArrayNames.push(radio.attr('name'));
		
			$(this).parent().parent().removeClass('has-error');
			$(this).parent().parent().children('.radio-feedback').addClass('hidden');		
		
		
	});
	
	var uniqueRadioNames = [];
	
	$.each(radioArrayNames, function(i, el){
		if($.inArray(el, uniqueRadioNames) === -1) uniqueRadioNames.push(el);
	});	
	
	$.each(uniqueRadioNames, function(i, el){
		
		validRadio = false;
		
		var radio = 'input[name="'+el+'"]';
		
		$(radio).each(function(){
			
			var value = $(this).val();
			
			if($(this).attr('aria-required') == 'true' && $(this).is(':checked')){
				if($(this).hasClass('hidden')){return true;}
				validRadio = true;
				
				radioArray[el] = $(this).val();
				
				return false;
			}

		});
		
		if(validRadio === false){
			$(radio).parent().parent().addClass('has-error');
			$(radio).parent().parent().children('.radio-feedback').removeClass('hidden').show();
		}
		
	});
	
	
	//Inputs
	$(formIdent+' input:text, '+formIdent+' input[type="email"], '+formIdent+' input:password, '+formIdent+' input:hidden, '+formIdent+' input[type="number"]').each(function(){
		var input = $(this); // This is the jquery object of the input, do what you will

		var value = input.val();
		var name = input.attr('name');
		var type = input.attr('type');		

		if(name.indexOf('[]') > -1){

			var newName = name.replace('[]', '')

			if(!inArray[newName]){
				inArray[newName] = []
			}

		}		

		if(type === 'email'){

			var emailReg = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
			var test = emailReg.test(value);

		}		
		
		if($(this).attr('aria-required') == 'true' && (value == '' || value == typeof undefined) || test === false){
			if($(this).hasClass('hidden')){return true;}
			validInput = false;
			$(this).parent().addClass('has-error');
			$(this).next('.glyphicon').removeClass('hidden').show();
			$(this).nextAll('.alert-box').addClass('alert-danger').removeClass('hidden').show()
			$(formIdent+' button').prop('disabled', false);
		}
		else{
			$(this).parent().removeClass('has-error');
			$(this).next('.glyphicon').addClass('hidden').hide();			
		}

		if (typeof inArray[newName] != 'undefined'){

			inArray[newName].push(value)

		}
		else{
			inputArray[name] = value;
		}

		

	});
	
	//Selects
	$(formIdent+' select').each(function(){
		var input = $(this); // This is the jquery object of the input, do what you will
		var value = input.val();
		var name = input.attr('name');		
		
		if($(this).attr('aria-required') == 'true' && (value == '' || value == typeof undefined || value == null)){
			if($(this).hasClass('hidden')){return true;}
			validSelect = false;
			$(this).parent().addClass('has-error');
			$(this).next('.glyphicon').removeClass('hidden');
			$(formIdent+' button').prop('disabled', false);

		}
		else{
			$(this).parent().removeClass('has-error');
			$(this).next('.glyphicon').addClass('hidden');

		}
		selectArray[name] = value;

	});	

	//Textareas
	$(formIdent+' textarea').each(function(){
		var input = $(this); // This is the jquery object of the input, do what you will
		var value = input.val();
		var name = input.attr('name');		
		
		if($(this).attr('aria-required') == 'true' && (value == '' || value == typeof undefined || value == null)){
			if($(this).hasClass('hidden')){return true;}
			validSelect = false;
			$(this).parent().addClass('has-error');
			$(this).next('.glyphicon').removeClass('hidden');
			$(formIdent+' button').prop('disabled', false);

		}
		else{
			$(this).parent().removeClass('has-error');
			$(this).next('.glyphicon').addClass('hidden');

		}
		textareaArray[name] = value;

	});		

	//Checkboxes
	$(formIdent+' input[type="checkbox"]').each(function(){
		var input = $(this); // This is the jquery object of the input, do what you will
		var value = input.val();
		var name = input.attr('name');
		var data = {}

		if($(this).hasClass('hidden')){return true;}

		if(this.checked === true){
			checkedObject[name] = true;
			var data = $('#'+name).data()

            if(!checkedArray[name]){

                checkedArray[name] = []

            }

            checkedArray[name].push({data:data, value:value})
		}

	});		

	if(validInput === true && validRadio === true && validSelect === true && validTextarea === true){
		
		var inputs = {'formIdent':formIdent};
		
		inputs.inputs = inputArray;
		inputs.inputArray = inArray;
		inputs.radios = radioArray;
		inputs.selects = selectArray;
		inputs.checks = checkedObject;
		inputs.checksArray = checkedArray;
		inputs.textareaArray = textareaArray;

		return inputs;			
		
	}
	else{
		console.log('Oops, something is missed. collector returned false')

		button.removeAttr('style').html(buttonText).prop('disabled', false);
		return false;	
	}

}