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

(function(window){    
    "use strict";

    var namespace = "",
        JSON = window.JSON,
        localStorage;
    
    try {
        localStorage = window.localStorage || false;
    }
    catch(e){
        localStorage = false;
    }
    
    // **
    
    function Cache(namespace){
        this._prefix = namespace ? namespace + "." : "";
    }
    Cache.prototype = {
        set: function(key, value){
            localStorage[this._prefix + key] = JSON.stringify({
                v: value,
                t: (new Date()).getTime()
            });
            return this;
        },
        wrapper: function(key){
            return localStorage[this._prefix + key];
        },
        get: function(key){
            var value = this.wrapper(key);
            return value ? value.v : value;
        },
        time: function(key){
            var value = this.wrapper(key);
            return value ? value.t : value;
        },
        remove: function(key){
            localStorage.removeItem(this._prefix + key);
            return this;
        }
    };
    
    return Cache;
}(window));
