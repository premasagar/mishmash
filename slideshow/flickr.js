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
    
    // `size` is any of mstzb, or omitted
    src: function(photo, size){
        size = size ? "_" + size : "";
        return "http://farm" + photo.farm + ".staticflickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + size + ".jpg"
    },
    
    photopage: function(photo){
        return "http://www.flickr.com/photos/" + photo.owner + "/" + id;
    }
};
