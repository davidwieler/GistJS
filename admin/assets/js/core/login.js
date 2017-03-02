$(document).ready(function(){
	var type = window.location.hash.substr(1);

	switch(type){

		case 'register' :
			$('a#register-form').click();
		break;
	}



})