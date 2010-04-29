'use strict';

/*!
* Sandbox
*   github.com/premasagar/mishmash/tree/master/sandbox/
*
*//*
    sandbox JavaScript variables, by injecting scripts into a throwaway iframe element

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*/

var Sandbox = (function(){
    var
        window = this,
        document = window.document;

    function isArray(obj){
		return toString.call(obj) === "[object Array]" || obj.constructor === Array || obj instanceof Array;
	}

    function hostBody(){
        return document.getElementsByTagName('body')[0];
    }

    function Sandbox(){
        this.init.apply(this, arguments);
    }
    
    Sandbox.prototype = {
        init: function(script, props, callback){
            var
                self = this,
                iframe = this.iframe = document.createElement('iframe'),
                body = hostBody(),
                outerCallback;

            if (!body){
                return false;
            }

            if (typeof script === 'string'){
                script = [script];
            }
            
            iframe.style.display = 'none';
            body.appendChild(iframe);
            this.clean();

            outerCallback = function(){
                var
                    window = self.window(),
                    ret = {},
                    i, len;
                
                if (callback){
                    if (props){
                        if (typeof props === 'string'){
                            ret = window[props];
                        }
                        if (isArray(props)){
                            len = props.length;
                            for (i=0; i<len; i++){
                                ret[props[i]] = window[props[i]];
                            }
                        }
                    }
                    self.remove();
                    callback(ret);
                }
            };

            
            if (isArray(script)){
                this.getScripts(script, outerCallback);
            }
        },

        doctype: function(){
            return '<!doctype html>';
        },
    
        window: function(){
            return this.iframe.contentWindow;
        },
    
        document: function(){
            return this.window().document;
        },

        clean: function(){
            var doc = this.document();
            doc.open();
            doc.write(
                this.doctype() + '\n' +
                '<head></head><body></body>'                    
            );
            doc.close();
            return this;
        },

        remove: function(){
            hostBody().removeChild(this.iframe);
        },
    
        /**
         * Load array of scripts into script elements.  
         *
         * Note, there is only one callback function here, called after each is loaded
         *
         * @param {Array} srcs array of source files to load
         * @param {Function} callback 
         * @param {Boolean} inOrder - if true, load scripts in given order
         */
 
        getScripts: function(srcs, callback, inOrder){
			var
                self = this,
			    length = srcs.length,
				loaded = 0,
				checkIfComplete;

	        callback = callback || function(){};
			
			if (inOrder) {
				// Recursive, each callback re-calls getScripts
				// with a shifted array.
				this.getScript(srcs.shift(), function(){
					if (length === 1){
						callback.call(self);
					}
					else {
					    // preserve inOrder when recursing
						this.getScripts(srcs, callback, true);
					}
				});
			}
			else {
				// Plain old loop
                checkIfComplete = function(){
					if (++loaded === length){
						callback.call(self);
					}
				};
				
				// Doesn't call callback until all scripts have loaded.
				for (var i = 0; i < length; ++i){
					this.getScript(srcs[i], checkIfComplete);
				}
			}			
		},
		
        /**
         * Load a script into a <script> element
         * @param {String} src The source url for the script to load
         * @param {Function} callback Called when the script has loaded
         * TODO: 
         * 1) Look in DOM for script element with that src already, and don't load it 
         *    again if found (allows multiple Sqwidget scripts not to keep loading jQuery, etc)
         * 2) {url: src, callback: fn} objects to allow specific callbacks for particular scripts; 
         * 3) {lookForScriptSrcInDOM:false} options object; 
         * 4) callback function when all scripts loaded
         */
        getScript: function(src, callback){
            var
                self = this,
                document = this.document(),
                head = document.getElementsByTagName('head')[0],
                script = document.createElement('script'),
                loaded;
            
            callback = callback || function(){};
            script.src = src;
            script.onload = script.onreadystatechange = function(){
                var state = this.readyState;
                if (!loaded && (!state || state === 'complete' || state === 'loaded')){
                    // Handle memory leak in IE
                    script.onload = script.onreadystatechange = null;
                    // head.removeChild(script); // Worth removing script element once loaded?
                    
                    loaded = true;
                    callback.call(self);
                }
            };
            head.appendChild(script);
        }
    };

    return Sandbox;
}());
