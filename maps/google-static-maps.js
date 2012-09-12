var yahooAppId = "9ae7ibPV34EMo0MMIYtPQLU1hrpCuVtspIgjvSV4HzibKM0s5hgPgY_O7hB12IQ-";
// http://where.yahooapis.com/v1/place/39962/belongtos;count=0?appid=9ae7ibPV34EMo0MMIYtPQLU1hrpCuVtspIgjvSV4HzibKM0s5hgPgY_O7hB12IQ-

function GoogleStaticMap(options){
    tim.extend(this, options);
}

GoogleStaticMap.prototype = {
    endpoint: "http://maps.googleapis.com/maps/api/staticmap",
    lat: 0,
    lng: 0,
    zoom: 6,
    size: "400x400",
    maptype: "terrain",
    sensor: "false",
    
    url: function(options){
        options || (options = {});

        return this.endpoint + "?" +
            "center=" + (options.lat || this.lat) + "," + (options.lng || this.lng) +
            "&zoom=" + (options.zoom || this.zoom) +
            "&size=" + (options.size || this.size) +
            "&maptype=" + (options.maptype || this.maptype) +        
            "&sensor=" + (options.sensor || this.sensor);
    }
};