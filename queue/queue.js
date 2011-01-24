/*!
* Queue
*   github.com/premasagar/mishmash/tree/master/queue/
*
*//*
    message queueing, cached in localStorage
*//*

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php

    **

    creates global object
        Queue
        
    dependencies
        cache.js

    **

    v0.1.0

*//*global window, Cache */

var Queue = (function(window){
    "use strict";
    
    function Queue(namespace){
        this.cache = new Cache((namespace || "") + ".queue");
        this.keys = this.cache.get("keys") || [];
        this.count = this.cache.get("count") || 0;
    }
    Queue.prototype = {
        get: function(id){
            this.cache.get(id);
            return this;
        },
        
        add: function(item){
            var count = ++this.count;
            this.keys.push(count);
                            
            this.cache
                .set("count", count)
                .set("keys", this.keys)
                .set(count, item);
            
            return this;
        },
        
        reset: function(){
            this.cache
                .set("count", this.count = 0)
                .set("keys", this.keys = []);
                
            return this;
        },
        
        remove: function(id){
            var i = 0,
                keys = this.keys,
                len = keys.length;
            
            // Find id in the keys array
            // TODO: Move to a lookup object? Populate a temp toRemove array?
            for (; i<len; i++){
                if (keys[i] === id){
                    // Remove id from keys array
                    if (len > 1){
                        keys = keys.slice(0,i).concat(keys.slice(i+1));
                        this.cache
                            .remove(id)
                            .set("keys", keys);
                    }
                    // If no ids left, then reset counter
                    else {
                        this.reset();
                    }                                        
                    break;
                }
            }
            return this;
        }
    };
    
    return Queue;
}(window));
