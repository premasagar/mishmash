var sloop = (function(){
    "use strict";
    
    var api;
    
    
    
    /////
    
    api = {
        $body: jQuery("body"),
        
        init: function(elem){
            this.cache = [];
            this.container = jQuery(elem);
            this.cacheDimensions();
            return this.trigger("init");
        },
        
        trigger: function(){
            var target = this.container;
            
            target.trigger.apply(target, arguments);
            return this;
        },

        on: function(){
            var target = this.container;
            target.on.apply(target, arguments);
            return this;
        },
        
        size: function(elem, newSize){
            elem = elem || this.container;
            
            if (newSize === true){
                return this.cacheSize(elem);
            }
            
            else if (newSize){
                if (newSize.width){
                    elem.width(newSize.width);
                }
                if (newSize.height){
                    elem.height(newSize.height);
                }
                return this.cacheSize(elem, newSize);
            }
            
            return {
                width: elem.data("width"),
                height: elem.data("height")
            };
        },
        
        cacheSize: function(elem, newSize){
            elem || (elem = this.container);
            newSize || (newSize = {
                width: elem.width(),
                height: elem.height()
            };
            elem.data(newSize);
            return newSize;
        },
        
        cacheItem: function(item){
            var url = item.url || item.src || item.href;
            this.cache.push(url, item);
            return this;
        },
        
        loaditem: function(item, toBeCached){
            var sloop = this;
            
            function onload(){
                item.trigger("load", item);
                sloop.trigger("load", item, sloop);
                item.exec();
                
            }
            
            if (toBeCached){
                this.cacheItem(item);
            }
            if (item.complete){
                onload();
            }
            else {
                item.one("load", onload);
            }
            
            return this.trigger("load", item, this);
        },
        
        createLayer: (function(){
            function Layer(items, options){
                this.items = items || [];
                this._options = (options || options = {});
                
                if (options.zIndex){
                    this.zIndex = options.zIndex;
                }
            }
            
            Layer.prototype = {
                zIndex: 0,
            };
            
            //
            
            return function(items, options){
                return new Layer(items, options);
            };
        }()),
        
        fullscreen: function(){
            // Request fullscreen; if granted, set width / height to window dimensions
        },
        
        fillBody: function(){
            // Cache body size and return results
            var bodySize = this.size(this.$body, true);
            
            // Set size of container to that of body
            return this.size(this.container, bodySize);
        }
    };
    
    return api;
}());

////

var imagePlayer = sloop.plugin(funcion(){
    
});