/*!
* Ready
*   github.com/premasagar/mishmash/tree/master/ready/
*
*//*
    onDocumentReady abstraction
    
    adapted from jQuery 1.4 by James Padolsey <james.padolsey.com>
        & Premasagar Rose <dharmafly.com>

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*global window */

var ready = (function (window) {
    "use strict";

    var doc = window.document,
        docEl = doc.documentElement,
        addEventListener = doc.addEventListener,
        attachEvent = doc.attachEvent,
        readyFns = [],
        ready,
        bound,
        dcl = "DOMContentLoaded",
        orsc = "onreadystatechange",
        atTopLevel;

    function fireReady() {
        var i = 0,
            l = readyFns.length;
        
        if (ready) {
            return; 
        }
        ready = true;
    
        for (; i < l; i += 1) {
            readyFns[i]();
        }
    }

    function scrollCheck() {
        if (ready) { 
            return; 
        }
    
        try {
            // http://javascript.nwbox.com/IEContentLoaded/
            docEl.doScroll("left");
        } catch (e) {
            window.setTimeout(scrollCheck, 1);
            return;
        }
    
        // DOM ready
        fireReady();
    }

    function DOMContentLoaded() {
        if (addEventListener) {
            doc.removeEventListener(dcl, DOMContentLoaded, false);
            fireReady();
        }
        else {
            if (attachEvent && doc.readyState === "complete") {
                doc.detachEvent(orsc, DOMContentLoaded);
                fireReady();
            }
        }
    }
    
    function onReady(fn) {
        readyFns.push(fn);
    
        if (ready) { 
            return fn(); 
        }
        if (bound) { 
            return; 
        }
    
        bound = true;
    
        if (addEventListener) {
            doc.addEventListener(dcl, DOMContentLoaded, false);
            window.addEventListener("load", fireReady, false); // fallback to window.onload
        }
        
        else if (attachEvent) {
            doc.attachEvent(orsc, DOMContentLoaded);
            window.attachEvent("onload", fireReady); // fallback to window.onload
        
            try {
                atTopLevel = !window.frameElement;
            }
            catch(e){}
        
            if (docEl.doScroll && atTopLevel) {
                scrollCheck();
            }
        }
    }

    return onReady;
}(window));


/*jslint white: false, onevar: true, undef: true, nomen: true, regexp: false, plusplus: true, bitwise: true, newcap: true, maxerr: 50, indent: 4 */
