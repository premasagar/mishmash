(function(window){
    'use strict';

    var moduleName = 'jasonpeewee',
        encodeURIComponent = window.encodeURIComponent,
        objectKeys = window.Object.keys,
        document = window.document,

        // globally exposed container for JSONP callbacks that receive data
        masterCallbacks = {},

        // private container for individual callbacks to be passed data
        privateCallbacks = {},

        module, makeJSCompatibleName;

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
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
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

    // Create global master callback and collection of private callbacks
    function createCallbackCollection(callbackName){
        // Create array of private callbacks to the url
        var callbacks = privateCallbacks[callbackName] = [];

        // Create global master callback, which receives data from the remote API
        // and passes that data on to the private callbacks
        masterCallbacks[callbackName] = function(data){
            var callbacksLength = callbacks.length,
                // Are further requests pending?
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
                removeCallbackCollection(callbackName);
            }
        };
        
        return callbacks;
    }

    function removeCallbackCollection(callbackName){
        // Only remove if there are no private callbacks remaining
        if (!privateCallbacks[callbackName].length){
            delete privateCallbacks[callbackName];
            delete masterCallbacks[callbackName];
        }
    }

    // Register a private callback, called when a JSONP response calls a global, master callback
    function registerCallback(callbackName, callback){
        var callbacks = privateCallbacks[callbackName] || createCallbackCollection(callbackName);

        callbacks.push(callback);
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
            var callbacks, callback;

            // JSONP request failed
            if (!success){
                // Remove the callback that led to the failed request
                callbacks = privateCallbacks[callbackName];

                if (callbacks){
                    callback = callbacks.shift();

                    if (callback){
                        // Call the callback with an error object
                        callback(generateErrorObject(options, url));
                    }

                    // Free up memory by deleting container
                    removeCallbackCollection(callbackName);
                }
            }

            /*
                NOTE: older IE's don't support `onerror` events when <script> elements fail to load; hence the callback may never fire with the error object, and the callback may not be removed from the container.
            */
        };
    }

    // Load a script into a <script> element
    // Modified from https://github.com/premasagar/cmd.js/tree/master/lib/getscript.js
    function getscript(src, callback, options){
        var head = document.head || document.getElementsByTagName('head')[0],
            script = document.createElement('script'),
            loaded = false;
            
        function finish(){
            // Clean up circular references to prevent memory leaks in IE
            script.onload = script.onreadystatechange = script.onerror = null;
            
            // Remove script element once loaded
            head.removeChild(script); 

            if (callback){
                callback.call(window, loaded);
            }
        }

        script.type = 'text/javascript';
        script.charset = options && options.charset || 'utf-8';
        script.src = src;
        script.onload = script.onreadystatechange = function(){
            var state = this.readyState;
            
            if (!loaded && (!state || state === 'complete' || state === 'loaded')){
                loaded = true;
                finish();
            }
        };
        // NOTE: IE8 and below don't fire error events
        script.onerror = finish;

        head.appendChild(script);
    }

    // Make a JSONP request and set up the response handlers
    function fetch(url, options, callback){
        var callbackParameter, callbackName, errorHandler;

        // Determine which parameter the remote API requires for the callback name
        // Usually, this is `callback` and sometimes `jsonpcallback`
        // e.g. http://example.com?callback=foo
        if (options && options.callbackParameter){
            callbackParameter = options.callbackParameter;
            // Delete from options object, so that it isn't included in the subsequent options handling
            delete options.callbackParameter;
        }
        else {
            callbackParameter = 'callback';
        }

        // Check if url already contains a query string
        url += url.indexOf('?') === -1 ? '?' : '&';

        // Generate query string from options
        url += options ? encodeURLQueryString(options, true) + '&' : '';

        // Create callbackName from the URL (including options)
        callbackName = makeJSCompatibleName(url);

        // Add jsonp callback parameter
        url += callbackParameter + '=' + module.path + '.callbacks.' + callbackName;

        // TODO: check localStorage or other cache
        // if no cache, make JSONP request
        // Or trigger event, to allow third-party integration of caching

        registerCallback(callbackName, callback);

        // Call getscript() and pass in a handler to determine if call failed
        errorHandler = generateErrorHandler(callbackName, options, url);
        getscript(url, errorHandler, null);

        return url;
    }

    /////

    // Public API for the module
    module = {
        // If module is included within another module, then the `path` property
        // must be updated to the new globally accessible module
        'path': moduleName,
        'callbacks': masterCallbacks,
        'fetch': fetch,
        'encodeURLQueryString': encodeURLQueryString
    };

    // NOTE: A GLOBAL MODULE
    /*
        The module must be globally accessible, in order for remote APIs to call the appropriate JSONP callback. It is possible to move the module to a different path, e.g. to myApp.jasonpeewee. If this is done, then the module's `path` property must be updated, e.g. myApp.jasonpeewee.path = 'myApp.jasonpeewee';
    */
    window[moduleName] = module;

}(this));