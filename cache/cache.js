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
        localStorage,
        undef;
            
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
        var cache = function(key, value, keep){
            if (value === undef){
                return cache.get(key);
            }
            if (keep !== false){
                return cache.set(key, value);
            }
            return cache.remove(key);
        };
        
        cache._prefix = namespace ? namespace + "." : "";
        cache.localStorage = true;
        
        cache.set = function(key, value){
            localStorage[this._prefix + key] = JSON.stringify({
                v: value,
                t: (new Date()).getTime()
            });
            return this;
        };
        
        cache.wrapper = function(key){
            return localStorage[this._prefix + key];
        };
        
        cache.get = function(key){
            var wrapper = this.wrapper(key);
            return wrapper ? JSON.parse(wrapper).v : wrapper;
        };
        
        cache.time = function(key){
            var wrapper = this.wrapper(key);
            return wrapper ? JSON.parse(wrapper).t : wrapper;
        };
        
        cache.remove = function(key){
            localStorage.removeItem(this._prefix + key);
            return this;
        };
                
        return cache;
    }
    
    return Cache;
}(window));
