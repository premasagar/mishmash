/*global window */

var deferredTimer = (function(jQuery, window){
    "use strict";
    
    function pause(){
        // TODO
    }
    
    function resume(){
        // TODO
    }
    
    /////
    
    return function(time, doneCallbacks, failCallbacks){
        var deferred, promise;

        /////

        // deferred & promise
        deferred = jQuery.Deferred()
            .then(doneCallbacks, failCallbacks);
            
        promise = deferred.promise();

        /////

        // extend
        promise.pause = pause;
        promise.resume = resume;

        /////

        // By default, this Deferred will resolve in 1 second's time
        window.setTimeout(function(){
            deferred.resolveWith(promise);
        }, time || 1000);

        /////
        return promise;
    };

}(window.jQuery, window));

/*jslint white: true */