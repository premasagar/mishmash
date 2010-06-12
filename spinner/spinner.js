/*!
* Spinner
*   github.com/premasagar/mishmash/tree/master/spinner/
*
*//*
    create a spinner icon from an alpha-transparent PNG

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    creates methods
        spinner([autostart]); // autostart defaults to true
        
    returns object
        {
            elem // the DOM element to add to the host document
            stop // call this method to stop the spinner (don't just hide or remove the element)
            start // call this method to start the spinner againe
        }
        
     notes
        The spinner image here is derived from the "loading" throbber used in Mozilla Firefox 3.6.3 for Linux Ubuntu. Replace the settings in the first block of the code, to use your own spinner image.
*/

"use strict";

var spinner = (function(){
    // **

    // SETTINGS
    
    var spinnerDataUri = "data:image/png;base64,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",
    
        width = 16,
        height = 16,
        frames = 32,
        interval = 30;
    
    // end SETTINGS
    
    // **
    
    function spinner(autostart){ // default: autostart === true
        var elem = document.createElement('span'), // we could use an <img> element, but spans tend to have less, if any, generic styles already set in a host page
            spinnerBackgroundCss = "transparent url(" + spinnerDataUri + ") 0 0 no-repeat",
            posX = 0,
            intervalRef,
            spinning,
            start = function(){
                if (!spinning){
                    intervalRef = window.setInterval(function(){
                        posX = posX >= ((frames * width) - width) ? 0 : posX + width;
                        elem.style.backgroundPosition = '-' + posX + 'px 0';
                    }, interval);
                    spinning = true;
                }
            },
            stop = function(){
                if (spinning){
                    window.clearInterval(intervalRef);
                    intervalRef = null;
                    spinning = false;
                }
            };
    
        // TODO: would adding a style element with these rules be more efficient, e.g. in the case of multiple spinners on a page?        
        elem.style.background = spinnerBackgroundCss;
        elem.style.width = width + 'px';
        elem.style.height = width + 'px';
        elem.style.display = 'inline-block';
        
        if (autostart !== false){
            start();
        }
        
        return {
            elem: elem,
            start: start,
            stop: stop
        };
    }
    return spinner;
}());
