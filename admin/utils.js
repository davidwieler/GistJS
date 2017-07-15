let self = module.exports = () => {

	let utils = {};

	utils.arrayUnique = (array) => {
	    var a = array.concat();
	    for(var i=0; i<a.length; ++i) {
	        for(var j=i+1; j<a.length; ++j) {
	            if(a[i] === a[j])
	                a.splice(j--, 1);
	        }
	    }

	    return a;
	}

	utils.arrayContainsByProp = function(array, propName, value, returnIndex){
		for (var i = array.length - 1; i > -1; i--) {
			var propObj = array[i];
			if(propObj[propName] === value) {
				if (returnIndex) {
					return i;
				} else {
					return true;
				}
			}
		}
		return false;
	}

	return utils;
}
