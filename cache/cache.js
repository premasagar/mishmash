/*!
* Cache
*   github.com/premasagar/mishmash/tree/master/cache/
*
*//*
    localStorage caching
*//*

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php

    **

    creates global object
        Cache

    **

    v0.1.0

*//*global window */

var Cache = (function(window){
    "use strict";

    var JSON = window.JSON,
        localStorage;
            
    /////
    
    
    // Is localStorage available? If always known to exist, then this block may be removed, and the line above changed to: localStorage = window.localStorage;
    try {
        localStorage = window.localStorage;
    }
    catch(e){}
    
    if (!localStorage){
        (function(){
            var Mock = function(){},
                p = Mock.prototype;
                
            p.set = p.remove = function(){ return this; };
            p.get = p.wrapper = p.time = function(){};
            return Mock;
        }());
    }
    
    
    /////
    
        
    function Cache(namespace){
        this.prefix = namespace ? namespace + "." : "";
    }
    Cache.prototype = {
        localStorage: true,
        
        set: function(key, value){
            localStorage[this.prefix + key] = JSON.stringify({
                v: value,
                t: (new Date()).getTime()
            });
            return this;
        },
        wrapper: function(key){
            return localStorage[this.prefix + key];
        },
        get: function(key){
            var wrapper = this.wrapper(key);
            return wrapper ? JSON.parse(wrapper).v : wrapper;
        },
        time: function(key){
            var wrapper = this.wrapper(key);
            return wrapper ? JSON.parse(wrapper).t : wrapper;
        },
        remove: function(key){
            localStorage.removeItem(this.prefix + key);
            return this;
        }
    };
    
    return Cache;
}(window));
