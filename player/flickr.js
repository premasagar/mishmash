var flickr = {
    // ADD YOUR KEY HERE, OR SET `flickr.key` to your key
    key: null,
    
    endpoint: "http://api.flickr.com/services/rest/",
    
    get: function(method, options, callback){
        if (!this.key){
            throw "`flickr.key` not set. Get a key: http://www.flickr.com/services/apps/create/apply/";
        }
    
        return jQuery.getJSON(this.endpoint + "?api_key=" + this.key + "&format=json&method=" + method + "&" + jQuery.param(options) + "&jsoncallback=?", callback);
    },
    
    search: function(options, callback){
        return this.get("flickr.photos.search", options, callback);
    },

    getSizes: function(photo, callback){
        return this.get("flickr.photos.getSizes", {photo_id:photo.id}, callback);
    },
    
    bestFit: function(width, height){
        var max = Math.max(width, height),
            size;
        
        // Flickr photo sizes: http://www.flickr.com/services/api/misc.urls.html
        if (max < 75){
            size = "s"; // square
        }
        else if (max < 100){
            size = "t"; // thumbnail
        }
        else if (max < 240){
            size = "m"; // small
        }
        else if (max < 500){
            size = ""; // medium
        }
        else if (max < 640){
            size = "z"; // medium 640
        }
        else {
            // TODO: not all photos have a large size - need to use API to determine
            size = "b"; // large
        }
        return size;
    },
    
    bestFitSrc: function(width, height, photo, callback){
        return this.getSizes(photo, function(rsp){
            var bestSize;
            
            if (rsp.stat === "ok"){
                jQuery.each(rsp.sizes.size, function(i, size){
                    if (size.width > width && size.height > height){
                        bestSize = size;
                    }
                    else {
                        return false;
                    }
                });
                
                if (bestSize){
                    callback(bestSize.source);
                }
                else {
                    callback(null, rsp);
                }
            }
            else {
                callback(null, rsp);
            }
        });
    },
    
    // `size` is any of mstzb, or omitted
    src: function(photo, size){
        size = size ? "_" + size : "";
        return "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + size + ".jpg"
    },
    
    photopage: function(photo){
        return "http://www.flickr.com/photos/" + photo.owner + "/" + id;
    }
};
