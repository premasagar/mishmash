'use strict';

/*!
* Throttle
*   github.com/premasagar/mishmash/tree/master/throttle/
*
*//*
    limit calls to a function or event handler (jQuery plugin)
        github.com/premasagar/throttle

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

(function($){
    function throttle(handler, interval, defer){
        var context = this;
        interval = interval || 250; // milliseconds
        // defer is false by default
        
        return function(){
            if (!handler.throttling){
                handler.throttling = true;
                
                window.setTimeout(function(){
                    if (defer){
                        handler.call(context);
                    }                            
                    handler.throttling = false;
                }, interval);
                
                if (!defer){
                    handler.call(context);
                }
            }
            return context;
        };
    }

    // jQuery.throttle
    $.throttle = throttle;
    
    // jQuery(elem).throttle
    $.fn.throttle = function(eventType, handler, interval, defer){
        return $(this).bind(eventType, throttle(handler, interval, defer));
    };
}(jQuery));

/*jslint browser: true, devel: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
