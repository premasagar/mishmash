/*!
* Throttle
*   github.com/premasagar/mishmash/tree/master/throttle/
*
*//*
    limit calls to a function or event handler (jQuery plugin)

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    creates methods
        jQuery.throttle(handler, [interval], [defer])
        jQuery(elem).throttle(eventType, handler, [interval], [defer])

*//*global: window, jQuery */

(function(window, jQuery){
    "use strict";

    function throttle(handler, interval, defer){
        var context = this,
            limitOn; // falsey
            
        interval = interval || 250; // milliseconds
        // defer is falsey by default
        
        return function(){
            var args = arguments;
        
            if (!limitOn){
                limitOn = true;
                
                window.setTimeout(function(){
                    if (defer){
                        handler.apply(context, args);
                    }                            
                    limitOn = false;
                }, interval);
                
                if (!defer){
                    return handler.apply(context, args);
                }
            }
        };
    }

    // window.throttle
    window.throttle = throttle;
    
    // jQuery(elem).throttle
    jQuery.fn.throttle = function(eventType, handler, interval, defer){
        return jQuery(this).bind(eventType, throttle(handler, interval, defer));
    };
}(window, jQuery));

/*jslint browser: true, devel: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
