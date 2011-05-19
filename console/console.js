/*!
* Console
*   github.com/premasagar/mishmash/tree/master/console/
*
*//*
    cross-browser JavaScript debug console logging

    by Premasagar Rose
        dharmafly.com

    license:
        opensource.org/licenses/mit-license.php
        
    v1.2

*//*

    usage
    _('any', 'arbitrary', Number, 'of', arguments);
    
    The function can easily be assigned to a different var, instead of '_'

*//*global window */

var _ = (function(window){
    "use strict";

    var console = window.console,
        air = window.air && window.air.Introspector,
        debug = console && console.debug,
        log = console && console.log,
        method;
    
    if (debug){
        try {
            debug();
            return debug;
        }
        catch(e){
            method = function(){
                debug.apply(console, arguments);
            };
        }
    }
    
    else if (log){
        if (typeof log.apply === "function"){
            method = function(){
                log.apply(console, arguments);
            };
        }
        else { // IE8
            method = function(){
                var args = arguments,
                    len = arguments.length,
                    indent = "",
                    i;
                    
                for (i=0; i < len; i++){
                    log(indent + args[i]);
                    indent = "---- ";
                }
            };
        }
    }
        
    else if (air && air.Console && air.Console.log){
        method = air.Console.log;
    }
    
    if (method){
        return method;
    }
    return function(){};
}(window));

/*jslint white: false, onevar: true, undef: true, nomen: true, regexp: false, plusplus: true, bitwise: true, newcap: true, maxerr: 50, indent: 4 */
