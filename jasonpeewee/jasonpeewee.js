(function(window){
	'use strict';

	var // SETTINGS
		moduleName = 'jasonpeewee',
		callbacksProperty = 'callbacks',

		/////

		// GLOBALS
		encodeURIComponent = window.encodeURIComponent,
		objectKeys = window.Object.keys,

		// container for global JSONP callbacks
		jsonpcallbacks = {},

		// cache the callback string using in URL query parameters
		callbackQueryPrefix = 'callback=' + moduleName+ '.' +callbacksProperty+ '.',

		// other vars
		makeJSCompatibleName;

	/////

	// Convert any string so that can be used as the name for a JavaScript variable
	makeJSCompatibleName = (function(){
		var nonAlphaRegex = /[^\w\$]+/ig;

		return function(string){
			return string ? string.replace(nonAlphaRegex, '_') : '_';
		};
	}());

	// Object.keys polyfill - returns an array of keys from an object
	if (!objectKeys){
	    objectKeys = function(obj){
	        var keys = [],
	            key;
	        
	        for (key in obj){
	            if (obj.hasOwnProperty(key)){
	                keys.push(key);
	            }
	        }
	        return keys;
	    };
	}

	// Returns an alphanumerically sorted array of keys from an object
	function sortedObjectKeys(obj){
		return objectKeys(obj).sort();
	}

	// Accepts an options object and a specified key from the object
	// Returns a URI-encoded query parameter, to be used within a query string
	function encodeParameter(options, key){
		var value = options[key];
		return encodeURIComponent(key, value) + '=' + encodeURIComponent(value);
	}

	// Accepts an options object and a boolean flag for whether the options should
	// be alphanumerically sorted. Returns a URI-encoded query string
	// Does not include a '?' prefix, to allow concatenation of multiple strings
	function encodeURLQueryString(options, sort){
		var queryString = '',
			keys, key, i, len;

		if (sort === true){
			keys = sortedObjectKeys(options);
			for (i=0, len=keys.length; i<len; i++){
				key = keys[i];

				if (i){
					queryString += '&';
				}
				queryString += encodeParameter(options, key);
			}
		}

		else {
			for (key in options){
				if (options.hasOwnProperty(key)){
					queryString += encodeParameter(options, key);
				}
			}
		}

		return queryString;
	}

	function removeMasterCallbackIfEmpty(callbackName){
		var masterCallback = jsonpcallbacks[callbackName];

		if (masterCallback && !masterCallback._callbacks.length){
			delete jsonpcallbacks[callbackName];
		}
	}

	// Create the callback that each JSONP response will call
	// This 'master callback' will then call each registered internal callback
	function createMasterCallback(callbackName){
		var masterCallback = jsonpcallbacks[callbackName] = function(data){
			var callbacks = masterCallback._callbacks,
				callbacksLength = callbacks.length,
				// Flag indicating further requests pending
				hasPendingRequests = callbacksLength > 1,
				i;

			// Call all callbacks with the data
			for (i=0; i<callbacksLength; i++){
				// Remove the first callback in the array, and call it
				callbacks.shift()(data);
			}

			// Free up memory by deleting the container for the request
			// We check there are no further requests pending and that no callbacks
			// were created since the start of the `for` loop
			if (!hasPendingRequests){
				removeMasterCallbackIfEmpty(callbackName);
			}
		};

		masterCallback._callbacks = [];
		return masterCallback;
	}

	// Register an internal callback, to be called after a JSONP response calls a master callback
	function registerCallback(callbackName, callback){
		var masterCallback = jsonpcallbacks[callbackName] || createMasterCallback(callbackName);

		masterCallback._callbacks.push(callback);
		return callback;
	}

	function generateErrorObject(options, url){
		return {
			generator: moduleName,
			error: 'JSONP request failed',
			options: options,
			url: url
		};
	}

	function generateErrorHandler(callbackName, options, url){
		return function(success){
			var container, callbacks, callback;

			if (!success){
				// Remove the callback that led to the failed request
				container = jsonpcallbacks[callbackName];

				if (container){
					callbacks = container._callbacks;
					callback = callbacks.shift();

					if (callback){
						// Call the callback with an error object
						callback(generateErrorObject(options, url));
					}

					// Free up memory by deleting container
					removeMasterCallbackIfEmpty(callbackName);
				}
			}

			/*
				NOTE: older IE's don't support `onerror` events when <script> elements fail to load; hence the callback may never fire with the error object, and the callback may not be removed from the container.
				It would be worth adding a timeout, to ensure error handlers fire when the script simply takes too long to return.
			*/
		};
	}

	// Make a JSONP request and set up the response handlers
	function fetch(url, options, callback){
		var queryString, callbackName, errorHandler;

		queryString = options ?
			encodeURLQueryString(options, true) + '&' : '';

		url += '?' + queryString;
		callbackName = makeJSCompatibleName(url);
		url += callbackQueryPrefix + callbackName;

		// TODO: check localStorage or other cache
		// if no cache, make JSONP request
		// Or trigger event, to allow third-party integration of caching

		registerCallback(callbackName, callback);

		// Call getscript() and pass in a handler to determine if call failed
		errorHandler = generateErrorHandler(callbackName, options, url);
		getscript(url, errorHandler);

		return url;
	}


	/////


	// Set up the global API for the module
	window[moduleName] = {
		fetch: fetch,
		encodeURLQueryString: encodeURLQueryString
	};
	// Attach the container for JSONP callbacks
	window[moduleName][callbacksProperty] = jsonpcallbacks;

}(window));