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
    
    getText: function(item, tagName, ns){
        var el = google.feeds.getElementsByTagNameNS(item, (ns || "*"), tagName)[0];
        return (el && el.textContent) || null;
    },
    
    getGeo: function(item){
        var lat = this.getText(item, "lat", "http://www.w3.org/2003/01/geo/wgs84_pos#"),
            lng = this.getText(item, "long", "http://www.w3.org/2003/01/geo/wgs84_pos#"),
            woeid = this.getText(item, "woeid", "http://where.yahooapis.com/v1/schema.rng"),
            polygon = this.getText(item, "polygon", "http://www.georss.org/georss"),
            latLngFromPolygon;
        
        if (lat === null){
            // try without namespace
            this.getText(item, "lat");
        }
        
        if (lat !== null){
            // try without namespaces
            if (lng === null){
                this.getText(item, "long");
            }
            if (lng === null){
                lng = this.getText(item, "lng");
            }
            if (lng === null){
                lng = this.getText(item, "lon");
            }
        }
        
        // No lat/lng, but a bounding polygon supplied - e.g. Twitter feeds
        if (polygon && (lat === null || lng === null)){
            latLngFromPolygon = this.getLatLngFromBoundingBox(polygon);
            lat = latLngFromPolygon.lat;
            lng = latLngFromPolygon.lng;
        }
        
        return lat !== null || lng !== null || woeid !== null || polygon !== null ?
            {
                lat: lat,
                lng: lng,
                woeid: woeid,
                polygon: polygon
            } :
            null;
    },
     
    getGeoByPermalink: function(permalink){
        var links = this.links,
            i, len, link;
            
        for (i=0, len=(links && links.length); i<len; i++){
            link = links[i];
            
            if (link.textContent === permalink){
                return this.getGeo(link.parentNode);
            }
        }
        
        return null;
    },
    
    getLatLngFromBoundingBox: function(box){
        var b = box.split(" "),
            maxLat = Math.max(b[0], b[2], b[4], b[6]),
            minLat = Math.min(b[0], b[2], b[4], b[6]),
            maxLng = Math.max(b[1], b[3], b[5], b[7]),
            minLng = Math.min(b[1], b[3], b[5], b[7]);
            
        return {
            lat: ((maxLat - minLat) / 2) + minLat,
            lng: ((maxLng - minLng) / 2) + minLng
        };
    },
    
    googleFeed: function(url){
        return new google.feeds.Feed(url);
    },
    
    setOptions: function(options){
        var googleFeed = this.googleFeed;
        
        if (googleFeed && options){
            if (options.num){
                googleFeed.setNumEntries(options.num);
            }
        
            if (options.historical){
                googleFeed.includeHistoricalEntries();
            }
        
            if (options.format){
                switch (options.format){
                    case "json":
                    format = google.feeds.Feed.JSON_FORMAT;
                    break;
                
                    case "xml":
                    format = google.feeds.Feed.XML_FORMAT;
                    break;
                
                    case "json_xml":
                    format = google.feeds.Feed.MIXED_FORMAT;
                    break;
                }
            
                if (format){
                    googleFeed.setResultFormat(format);
                }
            }
        }
        
        return this;
    },

    load: function(url, callback, options){
        var feed = this,
            googleFeed = new google.feeds.Feed(url),
            format;

        this.googleFeed = googleFeed;
        this.url = url;
        this.setOptions(options);

        googleFeed.load(function(result){
            feed.loaded = true;
            feed.result = result;
            if (result.xmlDocument){
                feed.links = result.xmlDocument.getElementsByTagName("link");
            }
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