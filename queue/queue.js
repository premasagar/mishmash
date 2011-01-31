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
        
    var
    // SETTINGS
        namespace = "q",
    
    // OTHER
        toString = Object.prototype.toString,
        isArray = Array.isArray || function(obj){ // Array checking, modified from jQuery 1.4.4
	        return toString.call(obj) === "[object Array]";
        },
        undef;
        
    /////
    
    
    function Queue(options){
        options = options || {};
        this._initOptions = options;
        this.cache = new Cache(options.namespace ? options.namespace + "." + namespace : namespace);
        this.keys = this.cache.get("keys") || [];
        this.count = this.cache.get("count") || 0;
        this.sync.method = options.sync;
        
        // lookup for items currently being sent
        this.processing = {};
    }
    Queue.prototype = {
        // TODO: keep a certain number of items avail in memory?
        get: function(arg){
            var argType = typeof arg,
                collection, i, wrapper, item;
            
            // A single id
            if (argType === "number" || argType === "string"){
                wrapper = this.cache.wrapper(arg);
                if (wrapper && wrapper.v){
                    item = wrapper.v;
                    item._queueId = arg;
                    item._queueTime = wrapper.t;
                }
                return item;
            }
            
            // Return all items in the queue
            else if (arg === undef){
                return this.get(this.keys);
            }
            
            // An array of ids      
            else if (isArray(arg)){
                collection = [];
                for (i = arg.length; i; i--){
                    item = this.get(arg[i-1]);
                    
                    // In case of cache corruption, cleanup
                    if (!item){
                        this.remove(arg[i-1]);
                        continue;
                    }
                    collection.push(item);
                }
                collection._queueBatch = true;
                return collection;
            }
        },
        
        length: function(){
            return this.keys.length;
        },
        
        slice: function(from, to){
            var keys = this.keys.slice(from, to);
            return this.get(keys);
        },
        
        first: function(){
            return this.get(this.keys[0]);
        },
        
        last: function(){
            return this.get(this.keys[this.length() -1]);
        },
        
        add: function(item, callback){ // callback is optional, it is passed on to send() and is the response from the server
        
            var count = ++this.count,
                wrapper;
                
            this.keys.push(count);
                            
            wrapper = this.cache
                .set("count", count)
                .set("keys", this.keys)
                .set(count, item, true);
            
            item._queueId = count;
            item._queueTime = wrapper.t;
            
            if (this.sync.method){
                this.sync(item);
            }
            return item;
        },
        
        time: function(id){
            return this.cache.time(id);
        },
        
        // TODO: optional timestamp to verify
        remove: function(id){
            var i = 0,
                keys = this.keys,
                len = keys.length;
                
            // Find id in the keys array
            // TODO: Move to a more efficient lookup object, and populate a temp toRemove array?
            for (; i < len; i++){
                if (keys[i] === id){
                    // Remove item from cache
                    this.cache.remove(keys[i]);
                
                    // Remove id from keys array
                    if (len > 1){
                        keys = keys.slice(0,i).concat(keys.slice(i+1));
                        this.cache.set("keys", keys);
                    }
                    // If no ids left, then reset counter
                    else {
                        this.reset();
                    }                    
                    break;
                }
            }
            return this;
        },
        
        reset: function(){
            this.cache
                .set("count", this.count = 0)
                .set("keys", this.keys = []);
                
            return this;
        },
        
        sync: function(item){
            if (typeof item === "function"){
                this.sync.method = item;
                return true;
            }
            this.sync.method(item);
            return this;
        }
    };
    
    return Queue;
}(window));
