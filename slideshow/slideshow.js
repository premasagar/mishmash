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

var slideshow = (function(window, jQuery){
    "use strict";

    var defaults = { // DEFAULT SETTINGS
        displayDuration: 6.18,
        transitionDuration: 1.62,
        easing: "ease-in",
        random: false
    };
        
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
            easing: options.easing || defaults.easing,
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
                var prop = "transition:opacity " + this.transitionDuration + "s " + this.easing + ";";

                jQuery("head")
                    .append("<style>" +
                        "." + this.namespace + " img{" + 
                            "position:absolute;top:0;left:0;opacity:1;" +
                            prop +
                            "-webkit-" + prop +
                            "-moz-" + prop +
                            "-o-" + prop +
                            "-ms-" + prop +
                            "-khtml-" + prop +
                        "}" +
                        "." + this.namespace + " img.transition{opacity:0;}" +
                    "</style>");
                
                return this;
            },
            
            randomize: function(){
                this.items.sort(randomOrder);
                return this;
            },
            
            resize: function(width, height){
                this.container.width(width);
                this.container.height(height);
                return this.cacheContainerSize();
            },
            
            cacheContainerSize: function(){
                this.containerWidth = this.container.width();
                this.containerHeight = this.container.height();
                return this;
            },
            
            init: function(){
                var slideshow = this;
                this.showing = 0;
                
                this.container
                    .addClass(this.namespace)
                    .css({
                        position:"relative",
                        overflow:"hidden"
                    });
                    
                this.container.add(window).on("resize", this.throttle(function(){
                    slideshow.cacheContainerSize();
                }, 250, true));
                    
                this.cacheContainerSize();
                
                // Randomise images?
                if (this.random){
                    this.randomize();
                }
                
                return this
                    .clear()
                    .addStyles()
                    .trigger("init")
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
                // TODO: cache container dimensions, but refresh cache on resize
                var containerWidth = this.containerWidth,
                    containerHeight = this.containerWidth,
                    imgNode = img[0],
                    imgWidth = imgNode.width,
                    imgHeight = imgNode.height,
                    diffWidth = containerWidth - imgWidth,
                    diffHeight = containerHeight - imgHeight,
                    factor, modified;
                
                // If either the image width or height is smaller than the container
                if (diffWidth > 0 || diffHeight > 0){
                    // Boost the image width
                    if (diffWidth > diffHeight){
                        factor = containerWidth / imgWidth;
                        imgWidth = containerWidth;
                        
                        // Change the image height to keep the same aspect ratio
                        imgHeight *= factor;
                    }
                    // Boost the image height
                    else {
                        factor = containerHeight / imgHeight;
                        imgHeight = containerHeight;
                        
                        // Change the image width to keep the same aspect ratio
                        imgWidth *= factor;
                    }
                    modified = true;
                }
                
                // If both the image width and height are bigger than the container
                else if (diffWidth < 0 && diffHeight < 0){
                    // Shrink the image width
                    if (diffWidth > diffHeight){
                        imgHeight = (imgHeight / imgWidth) * containerWidth;
                        imgWidth = containerWidth;
                    }
                    // Shrink the image height
                    else {
                        imgWidth = (imgWidth / imgHeight) * containerHeight;
                        imgHeight = containerHeight;
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
                
                img.css({
                    left:(containerWidth - imgWidth) / 2,
                    top: (containerHeight - imgHeight) / 2
                });
                
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
            
            toggle: function(){
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
}(window, jQuery));
