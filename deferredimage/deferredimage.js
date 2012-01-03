function deferredImage(srcOrImg, doneCallbacks, failCallbacks){
    "use strict";
    
    var deferred = jQuery.Deferred(doneCallbacks, failCallbacks),
        img, src;
        
    if (typeof srcOrImg === "string"){
        src = srcOrImg;
        img = jQuery("<img/>", {src:src});
    }
    else {
        img = jQuery(img);
        src = img.attr("src");
    }
    
    deferred.image = {
        elem: img,
        src: src
    };
    
    // setTimeout to allow thread to continue manipulating the Deferred object
    window.setTimeout(function(){
        if (img[0].complete){
            deferred.resolve(img, src);
        }
        else {
            img.on("load", function onload(){
                    // Remove all handlers
                    img.unbind("load", onload);
                    
                    // Resolve Deferred
                    deferred.resolve(img, src);
                })
                .on("error", function(){
                    // Remove all handlers
                    img.unbind("load", onload);

                    // Reject Deferred
                    deferred.reject(img, src);
                })
        }
    }, 4);
    
    return deferred;
}