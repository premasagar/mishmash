/*!
* Slideshow
*   Hardware-accelerated image slideshow, with CSS3 transitions
*
*   Premasagar Rose
*
*//*
        
    dependencies:
        jQuery

    creates global object:
        slideshow
        
*/
/*global window, jQuery */

/*
    TODO:
    * Use onload/onerror events, in case of long latency for image load
*/

var slideshow = (function(window, document, jQuery){
    "use strict";

    var defaults = { // DEFAULT SETTINGS
            displayDuration: 10,
            transitionDuration: 3.82,
            resizeDuration: 0.16,
            transitionEasing: "ease-in",
            resizeEasing: "ease-in",
            random: false
        },
        $window = jQuery(window),
        $document = jQuery(document);
        
        
    function randomOrder(){
        return Math.round(Math.random()) -0.5;
    }
    
    function checkSupportsTransitions(){
        var imgStyle = jQuery("<img/>")[0].style,
            prop = "transition";
            
        return prop in imgStyle ||
            ("-webkit-" + prop) in imgStyle ||
            ("-moz-" + prop) in imgStyle ||
            ("-o-" + prop) in imgStyle ||
            ("-ms-" + prop) in imgStyle ||
            ("-khtml-" + prop) in imgStyle;
    }
    
    function requestFullScreen(elem){
        if (elem.requestFullScreen) {  
          elem.requestFullScreen();  
        }
        else if (elem.mozRequestFullScreen) {  
          elem.mozRequestFullScreen();  
        }
        else if (elem.webkitRequestFullScreen) {  
          elem.webkitRequestFullScreen();  
        }
        else if (elem.oRequestFullScreen) {  
          elem.oRequestFullScreen();  
        }
        else if (elem.msRequestFullScreen) {  
          elem.msRequestFullScreen();  
        }
        else if (elem.khtmlRequestFullScreen) {  
          elem.khtmlRequestFullScreens();  
        }
        else {
            return false;
        }
        return true;
    }
    
    function cancelFullScreen(elem){
        if (document.cancelFullScreen) {  
          document.cancelFullScreen();  
        }
        else if (document.mozCancelFullScreen) {  
          document.mozCancelFullScreen();  
        }
        else if (document.webkitCancelFullScreen) {  
          document.webkitCancelFullScreen();  
        }
        else if (document.oCancelFullScreen) {  
          document.oCancelFullScreen();  
        }
        else if (document.msCancelFullScreen) {  
          document.msCancelFullScreen();  
        }
        else if (document.khtmlCancelFullScreen) {  
          document.khtmlCancelFullScreen();  
        }
        else {
            return false;
        }
        return true;
    }
    
    /////
    
    function slideshow(items, target, options){
        var api;
        
        options || (options = {});
        api = {
            _$slideshow: jQuery(this),
            showing: 0,
            waiting: false,
            items: items,
            container: jQuery(target),
            options: options,
            displayDuration: options.displayDuration || defaults.displayDuration,
            transitionDuration: options.transitionDuration || defaults.transitionDuration,
            resizeDuration: options.resizeDuration || defaults.resizeDuration,
            transitionEasing: options.transitionEasing || defaults.transitionEasing,
            resizeEasing: options.transitionEasing || defaults.transitionEasing,
            random: options.random || defaults.random,
            namespace: "slideshow-" + Math.round(Math.random() * 1000),
            supportsTransitions: checkSupportsTransitions(),
            
            bind: function(){
                this._$slideshow.bind.apply(this._$slideshow, arguments);
                return this;
            },
            
            trigger: function(){
                this._$slideshow.trigger.apply(this._$slideshow, arguments);
                return this;
            },
            
            // http://github.com/premasagar/mishmash/tree/master/throttle/
            throttle: function(handler, interval, defer){
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
            },
            
            addStyles: function(){
                // TODO: include width and height in transition
                var containerSelector = "." + this.namespace,
                    imgSelector = containerSelector + " > img";
                
                function cssExtensions(property){
                    return property +
                        "-webkit-" + property +
                        "-moz-" + property +
                        "-o-" + property +
                        "-ms-" + property +
                        "-khtml-" + property;
                }
                
                jQuery("head")
                    .append("<style>" +
                        containerSelector + "{" +
                            "position:relative;left:0;top:0;overflow:hidden;" +
                            cssExtensions("transition-property:width,height;") +
                            cssExtensions("transition-duration:" + this.transitionDuration + "s," + this.resizeDuration + "s," + this.resizeDuration + "s;") +
                            cssExtensions("transition-timing-function:" + this.transitionEasing + "," + this.resizeEasing + "," + this.resizeEasing + ";") +
                        "}" +
                        
                        imgSelector + "{" +
                            "position:absolute;left:0;top:0;opacity:1;" +
                            cssExtensions("transition-property:opacity,width,height,left,top;") +
                            cssExtensions("transition-duration:" + this.transitionDuration + "s," + this.resizeDuration + "s," + this.resizeDuration + "s," + this.resizeDuration + "s," + this.resizeDuration + "s;") +
                            cssExtensions("transition-timing-function:" + this.transitionEasing + "," + this.resizeEasing + "," + this.resizeEasing + ";") +
                        "}" +
                        
                        imgSelector + ".transition" + "{" +
                            "opacity:0; " +
                        "}" +
                    "</style>");
                
                return this;
            },
            
            randomize: function(){
                this.items.sort(randomOrder);
                return this;
            },
            
            _isFullscreen: false,
            
            isFullscreen: function(){
                return this._isFullscreen;
            },
            
            fullscreen: function(start){
                var slideshow = this,
                    container = this.container;
                start === false  || (start = true);

                // Go fullscreen
                if (start){
                    this._isFullscreen = true;
                    this.cacheSizes();
                    
                    this.originalWidth = this.width;
                    this.originalHeight = this.height;
                
                    container.css({
                        position: "absolute"
                    });
                    
                    this.resize(this.screenWidth, this.screenHeight);
                    
                    if (requestFullScreen(container[0])){
                        window.setTimeout(function(){
                            slideshow.cacheSizes();
                            slideshow.resize(slideshow.screenWidth, slideshow.screenHeight);
                        }, 500);
                    }
                }
                
                // Revert
                else {
                    this._isFullscreen = false;
                    this.container.css({
                        position: "relative"
                    });
                    this.resize(this.originalWidth, this.originalHeight);
                    cancelFullScreen();
                }
                return this;
            },
            
            toggleFullscreen: function(){
                return this.fullscreen(!this.isFullscreen());
            },
            
            resize: function(width, height){
                this.container
                    .width(width)
                    .height(height);
                    
                return this.cacheSizes(width, height)
                    .resetImageSizes();
            },
            
            resetImageSizes: function(){
                var slideshow = this,
                    isFullScreen = this.isFullscreen();
                
                jQuery(this.newImage).add(this.oldImage)
                    .each(function(i, img){
                        slideshow.positionImage(jQuery(img));
                    });
                    
                return this;
            },
            
            cacheSizes: function(width, height){
                this.width = typeof width !== "undefined" ? width : this.container.width();
                this.height = typeof height !== "undefined" ? height : this.container.height();
                this.screenWidth = $window.width();
                this.screenHeight = $window.height();
                return this;
            },
            
            init: function(){
                var slideshow = this;
                
                this.showing = 0;
                this.container
                    .addClass(this.namespace)
                    .add(window).on("resize", this.throttle(function(){
                        slideshow
                            .cacheSizes()
                            .resetImageSizes();
                    }, 250, true));
                
                // Randomise images?
                if (this.random){
                    this.randomize();
                }
                
                return this
                    .clear()
                    .addStyles()
                    .cacheSizes()
                    .trigger("ready")
                    .start();
            },
            
            image: function(src){
                return jQuery("<img/>").attr("src", src);
            },
            
            loadNext: function(){
                var src, img;
                
                this.showing ++;
                if (this.showing >= this.items.length){
                    this.showing = 0;
                }
                
                this.oldImage = this.newImage;
                
                // add the new image
                src = this.items[this.showing];
                img = this.newImage = this.image(src);
                
                return this.trigger("loading", img);
            },
            
            loop: function(){    
                var slideshow = this;
                
                if (!this.newImage){
                    this.loadNext();
                }

                // when the new image has loaded, then fade out the old one
                if (this.newImage[0].complete){
                    this.add(this.newImage);
                }
                else {
                    this.newImage
                        .on("load", function(){
                            slideshow.add(this.newImage);
                        })
                        // Couldn't load image, try the next one
                        // TODO: or retry in case of broken connection?
                        .on("error", function(){
                            this.trigger("error", this.newImage);
                            slideshow.loadNext().loop();
                        });
                }
                
                return this.trigger("loop");
            },
            
            fadeOut: function(img){
                var delay = this.transitionDuration * 1000;
            
                // start fading out, to reveal the image underneath
                // CSS3 transitions
                if (this.supportsTransitions){
                    img.addClass("transition");
                }
                // JavaScript animation
                else {
                    img.fadeOut(delay);
                }
                
                // once faded out, remove the image
                window.setTimeout(function(){
                    img.remove();
                }, delay);
                
                this.trigger("fadeOut", img);
                
                // load the next image
                if (this.active){
                    this.loop();
                }
                
                return this;
            },
            
            // called once the new image has loaded
            add: function(img){
                var slideshow = this;
                img = img || this.newImage;
                
                // Add the DOM
                img.prependTo(this.container);
                
                this.positionImage(img)
                    .loadNext();
                
                // wait, and then start to fade out
                window.setTimeout(function(){
                    // when the new image has loaded, then fade out the old one
                    if (slideshow.newImage[0].complete){
                        slideshow.fadeOut(img);
                    }
                    else {
                        slideshow.newImage.on("load", function(){
                            slideshow.fadeOut(img);
                        });
                    }
                }, this.displayDuration * 1000);
                
                return this.trigger("add", img);
            },
            
            positionImage: function(img){
                var width = this.width,
                    height = this.height,
                    imgNode = img[0],
                    imgWidth = imgNode.width,
                    imgHeight = imgNode.height,
                    diffWidth = width - imgWidth,
                    diffHeight = height - imgHeight,
                    factor, modified, imgLeft, imgTop;
                    
                // Store original dimensions
                if (!img.data("originalWidth")){
                    img.data({originalWidth: imgWidth, originalHeight: imgHeight});
                }
                
                // If either the image width or height is smaller than the container
                if (diffWidth > 0 || diffHeight > 0){
                    // Boost the image width
                    if (diffWidth > diffHeight){
                        factor = width / imgWidth;
                        imgWidth = width;
                        
                        // Change the image height to keep the same aspect ratio
                        imgHeight *= factor;
                    }
                    // Boost the image height
                    else {
                        factor = height / imgHeight;
                        imgHeight = height;
                        
                        // Change the image width to keep the same aspect ratio
                        imgWidth *= factor;
                    }
                    modified = true;
                }
                
                // If both the image width and height are bigger than the container
                else if (diffWidth < 0 && diffHeight < 0){
                    // Shrink the image width
                    if (diffWidth > diffHeight){
                        imgHeight = (imgHeight / imgWidth) * width;
                        imgWidth = width;
                    }
                    // Shrink the image height
                    else {
                        imgWidth = (imgWidth / imgHeight) * height;
                        imgHeight = height;
                    }
                    modified = true;
                }
                
                if (modified){
                    imgWidth = Math.ceil(imgWidth);
                    imgHeight = Math.ceil(imgHeight);
                    
                    img.css({
                        width: imgWidth,
                        height: imgHeight
                    });
                }
                
                imgLeft = (width - imgWidth) / 2;
                imgTop = (height - imgHeight) / 2;
                
                img.css({
                    left:imgLeft,
                    top:imgTop
                });
                
                //O("positionImage", imgWidth, imgHeight, imgLeft, imgTop, img, img[0].src);
                
                return this;
            },
            
            start: function start(){
                if (!this.active){
                    this.active = true;
                    this.loop();
                }
                return this.trigger("start");
            },
            
            stop: function stop(){
                this.active = false;
                return this.trigger("stop");
            },
            
            togglePlay: function(){
                return this.active ?
                    this.stop() : this.start();
            },
            
            clear: function clear(){
                this.container.empty();
                return this.trigger("clear");
            }
        };
        
        return api.init();
    }
    
    return slideshow;
}(window, document, jQuery));
