'use strict';

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

*/

(function(jQuery){
    function throttle(handler, interval, defer){
        var context = this,
            limitOn; // falsey
            
        interval = interval || 250; // milliseconds
        // defer is falsey by default
        
        return function(){
            if (!limitOn){
                limitOn = true;
                
                window.setTimeout(function(){
                    if (defer){
                        handler.call(context);
                    }                            
                    limitOn = false;
                }, interval);
                
                if (!defer){
                    handler.call(context);
                    return true;
                }
            }
            return !limitOn;
        };
    }

    // jQuery.throttle
    jQuery.throttle = throttle;
    
    // jQuery(elem).throttle
    jQuery.fn.throttle = function(eventType, handler, interval, defer){
        return jQuery(this).bind(eventType, throttle(handler, interval, defer));
    };
}(jQuery));

/*jslint browser: true, devel: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
