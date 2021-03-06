function extend(target /* , ...Any number of source objects, copied in turn ... */ ){
    var i = 1,
        len = arguments.length,
        obj, prop;
    
    for (; i < len; i++){
        obj = arguments[i];
    
        if (obj){
            for (prop in obj){
                if (obj.hasOwnProperty(prop)){
                    target[prop] = obj[prop];
                }
            }
        }
    }
    return target;
}


/////

// Feed

function Feed(url, callback, options){
    return this.load(url, callback, options);
}

//

// Feed: PROTOTYPE

Feed.prototype = {
    url: null,
    loaded: false,

    load: function(url, callback, options){
        var feed = this,
            num = options && options.num,
            historical = options && options.historical,
            googleFeed = new google.feeds.Feed(url);

        if (num){
            googleFeed.setNumEntries(num);
        }
        if (historical){
            googleFeed.includeHistoricalEntries();
        }

        this.feed = googleFeed;
        this.url = url;

        googleFeed.load(function(){
            feed.loaded = true;
            callback.apply(feed, arguments);
        });

        return this;
    }
};

//

// Feed: STATIC METHODS

extend(Feed, {
    loaded:false,
    
    _onreadyCallbacks: [],
    
    _onload: function(){
        var callbacks = this._onreadyCallbacks,
            i=0,
            len = callbacks.length;
        
        // Flag as loaded
        this.loaded = true;    
        
        // Execute each callback
        for (; i<len; i++){
            callbacks[i].call(this);
        }
        
        // Empty callbacks array
        this._onreadyCallbacks.length = 0;
        return this;
    },
    
    ready: function(fn){
        if (this.loaded){
            fn.call(this);
        }
        else {
            this._onreadyCallbacks.push(fn);
        }
        return this;
    },
    
    init: function(){
        var api = this;
        
        google.load("feeds", "1");
        google.setOnLoadCallback(function(){
            api._onload();
        });
        return this;
    }
});


/////

// EXAMPLE

Feed.init()
    .ready(function(){
        new Feed(
            "http://dharmafly.com/feed",
            
            function(result){
                var container = document.getElementById("content"),
                    entries, i, len;
            
                console.log(result);

                if (!result.error) {
                    entries = result.feed.entries;
                    
                    for (i=0, len=entries.length; i<len; i++){
                        container.innerHTML += tim("entry", entries[i]);
                    }
                }
            },
            
            {num:10, historical:true}
        );
    });