# Cache.js

Cache.js acts as a wrapper to the browser's localStorage. If the browser has no available localStorage or native JSON parsing, then items will not be cached, but no errors will be thrown.


## Dependencies

Caching relies on the presence of native localStorage and JSON (parse and stringify) support.  It should work for the following browsers:

* Firefox 3.5+
* Safari 4+
* Chrome
* Opera 10+
* Internet Explorer 8+
* iOS 4+
* Android 2.1+

It fails silently for unsupported browsers.


## Constructor

In order to interact with the Cache API, create a new instance of the Cache object:

    var cache = new Cache();
    
Multiple caches can be used by passing an optional namespace parameter to the constructor:

    var userCache = new Cache("user"),
        contentCache = new Cache("content");
    

## Methods

### cache.set(key, value)

Sets the value of the cached key. 

Returns the `cache` object, to allow method chaining.

*Required Properties*

* **key**: (string) A unique name/reference for the passed data
* **value**: (mixed) The data to store in localStorage

Example:

    cache.set("foo", "bar"); 
    

### cache.get(key)

Get the value of the cached key.

Returns the value of key, if set.  If attempting to get the value of a key that hasn't been set, `undefined` will be returned

*Required Properties*

* **key**: (string) The name/reference for the data to return

Example:

    cache.get("foo");



### cache.remove(key)

Remove the key from the cache

Returns the `cache` object, for method chaining

*Required Properties*

* **key**: (string) The name/reference for the data to remove

Example:

    cache.remove("foo");


### cache.time(key)

Get the Unix timestamp (in milliseconds) for when the key was last cached, according to the local device.

Returns the time the data was cached

*Required Properties*

* **key**: (string) The name/reference to retrieve time data for

Example:

    cache.time("foo");


### cache.localStorage

This property will be `true` if the browser has localStorage. Note, this does not confirm that there is storage space available.

Example:

    cache.localStorage;
