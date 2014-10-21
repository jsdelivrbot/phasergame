fn = {
	//cant use _.extend because it makes a shallow extend
	combindOver: function(obj,obj2){
		for (var val in obj2){
			if(typeof obj2[val] !== 'object'){
				if(typeof obj[val] == "function"){
					obj[val](obj2[val])
				}
				else{
					obj[val] = obj2[val]
				}
			}
			else{
				if(typeof obj[val] == 'object'){
					obj[val] = fn.combindOver(obj[val],obj2[val])
				}
				else{
					obj[val] = fn.combindOver({},obj2[val])
				}
			}
		}

		return obj;
	},
	//cant use _.extend because it makes a shallow extend
	combindIn: function(obj,obj2){
		for (var val in obj){
			if(val in obj2){
				if(typeof obj[val] !== 'object'){
					obj[val] = obj2[val]
				}
				else if(typeof obj[val] == 'object'){
					obj[val] = fn.combindIn(obj[val],obj2[val])
				}
			}
		}

		return obj;
	},
	//cant use _.clone because it makes a shallow copy
	duplicate: function(obj2,count){
		if(typeof obj2 == 'object' && obj2 !== null){
			count = count || 4
			if(count > 0){
				// see if its an array
				if(obj2.hasOwnProperty('length')){
					var obj = []
					for (var i = 0; i < obj2.length; i++) {
						if(typeof obj2[i] !== 'object'){
							obj[i] = obj2[i]
						}
						else{
							obj[i] = fn.duplicate(obj2[i],count-1)
						}
					};
				}
				else{
					var obj = {}
					for (var i in obj2){
						if(typeof obj2[i] !== 'object'){
							obj[i] = obj2[i]
						}
						else{
							obj[i] = fn.duplicate(obj2[i],count-1)
						}
					}
				}
			}
			return obj;
		}
		else{
			return obj2
		}
	},
	diff: function (prev, now) {
	    var changes = {};
	    var prop = {};
	    var c = {};
	    // prev = prev || {}
	    //-----

	    for (prop in now) { //ignore jslint
	        if (prop.indexOf("_KO") > -1) {
	            continue; //ignore jslint
	        }

	        if (!prev || prev[prop] !== now[prop]) {
	            if (_.isArray(now[prop])) {
	                changes[prop] = now[prop];
	            }
	            else if (_.isObject(now[prop])) {
	                // Recursion alert
	                if(prev[prop]){
	                	c = fn.diff(prev[prop], now[prop]);
		                if (!_.isEmpty(c)) {
		                    changes[prop] = c;
		                }
	                }
	                else{
	                	c = fn.duplicate(now[prop]);
	                    changes[prop] = c;
	                }
	            } else {
	                changes[prop] = now[prop];
	            }
	        }
	    }

	    return changes;
	},
	parseURL: function(url) {
	    var parser = document.createElement('a'),
	        searchObject = {},
	        queries, split, i;
	    // Let the browser do the work
	    parser.href = url;
	    // Convert query string to object
	    queries = parser.search.replace(/^\?/, '').split('&');
	    for( i = 0; i < queries.length; i++ ) {
	        split = queries[i].split('=');
	        searchObject[split[0]] = split[1];
	    }
	    return {
	        protocol: parser.protocol,
	        host: parser.host,
	        hostname: parser.hostname,
	        port: parser.port,
	        pathname: parser.pathname,
	        search: parser.search,
	        searchObject: searchObject,
	        hash: parser.hash
	    };
	}
}