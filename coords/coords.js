'use strict';

/*!
* Coords
*   github.com/premasagar/mishmash/tree/master/coords/
*
*//*
    get coordinates for a) the mouse, or b) any element in the document, and determine when elements and/or the mouse are overlapping (jQuery plugin)

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    creates
        jQuery.coords
        jQuery(elem).coords
        
    
    requires
        jQuery 1.4x, due to use of jQuery.isPlainObject()

*/


(function($){
    var mouse, elem;

    // track the mouse's position
    mouse = (function(){
        var document = window.document,
            x = null,
            y = null,
            tracking = false;
        
        function captureCoords(ev){
            x = ev.pageX;
            y = ev.pageY;
        }
        
        function startTracking(){
            $(document).mousemove(captureCoords);
        }
        
        function stopTracking(){
            $(document).unbind('mousemove', captureCoords);
        }
        
        return $.extend(
            function(arg1, includeMargin){
                if (typeof arg1 !== 'undefined' && typeof arg1 !== 'boolean'){
                    return elem(mouse(), arg1, includeMargin);
                }
                else if (arg1 === true && !tracking){
                    startTracking();
                    mouse.tracking = tracking = true;
                }
                else if (arg1 === false && tracking){
                    stopTracking();
                    mouse.tracking = tracking = false;
                }
                return [x,y];
            },
            {
                tracking: tracking
            }
        );
    }());


    // check if coordinates are within a target element
    elem = (function(){
        function toBounds(arg, includeMargin){
            var elem, offset, top, left, w, h;
            
            if ($.isArray(arg)){
                // point array: [n, n]
                if (arg.length === 2){
                    arg.push(arg[0]);
                    arg.unshift(arg[1]);
                }
                
                else if (arg.length !== 4){
                    return false;
                }
            }
            
            // element or selector
            else {
                elem = $(arg);
                offset = elem.offset();
                top = offset.top;
                left = offset.left;
                w = elem.outerWidth(includeMargin);
                h = elem.outerHeight(includeMargin);
                
                arg = [top, left + w, top + h, left];
            }
            return arg;
        }
        
        function overlaps(bounds1, bounds2){
                // bounds1
            var t1 = bounds1[0], // top
                r1 = bounds1[1], // right
                b1 = bounds1[2], // bottom
                l1 = bounds1[3], // left
                
                // bounds2
                t2 = bounds2[0], // top
                r2 = bounds2[1], // right
                b2 = bounds2[2], // bottom
                l2 = bounds2[3]; // left
        
            return (
                (t1 >= t2 && t1 <= b2 && l1 >= l2 && l1 <= r2) ||
                (r1 >= l2 && r1 <= r2 && b1 >= t2 && b1 <= b2)
            );
        }
        
        return function(bounds1, bounds2){ // optional last arg: includeMargin
            var includeMargin = $.makeArray(arguments).slice(-1)[0];            
            includeMargin = includeMargin === true ? true : false;
            
            // if no bounds or elements are passed, then the default is the top-level <html> element
            if (!bounds1 || bounds1 === true){
                bounds1 = 'html';
            }
            bounds1 = toBounds(bounds1, includeMargin);
            
            // looking for bounds of element in arg1?
            if (typeof bounds2 === 'undefined' || typeof bounds2 === 'boolean'){
                return bounds1;
            }
            bounds2 = toBounds(bounds2, includeMargin);
            
            return overlaps(bounds1, bounds2);
        };
    }());
    
    // **
    
    // Public api
    $.coords = {
        mouse: mouse,
        elem: elem
    };
    
    $.fn.coords = function(arg1, arg2){
        return elem(this, arg1, arg2);
    };
}(jQuery));
