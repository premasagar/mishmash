var github = (function(){
    'use strict';

    //
    // G I T H U B    A P I    J S    W R A P P E R
    // written for Github API v3
    // See: https://develop.github.com/v3
    //

    // In this script...
    //
    // 1. A utils object containing handy JavaScript functions
    // 2. A function definiing 'Resource' wrapper object
    // 3. The base API object which exposes API Resources like users or
    //    repos.
    // 4. An each loop which builds the base API object.


    var github,
        config = {},
        utils;

    // Useful utility functions for working with deferred's, objects and
    // collections.

    utils = {
    // Cached anchor element for parsing urls. This is used by url methods
    // like .pathname().
        a: document && document.createElement('a'),

        // Check to see if the passed object is an array.
        isArray: function (object) {
            return Object.prototype.toString.call(object) === '[object Array]';
        },

        // Iterates over an array or object and calls the callback with each
        // item.
        each: function (items, fn, context) {
            var index = 0, length = items.length, item;
            if (length) {
                for (;index < length; index += 1) {
                    item = items[index];
                    fn.call(context || item, item, index, items);
                }
            } else {
                for (index in items) {
                    if (items.hasOwnProperty(index)) {
                        item = items[index];
                        fn.call(context || item, item, index, items);
                    }
                }
            }
            return items;
        },

        // Returns the keys for the object provided in an array.
        keys: function (object) {
            return utils.map(object, function (value, key) {
                return key;
            });
        },

        // Iterates over an array or object and collects the return values of
        // each callback function and returns it in an array.
        map: function (items, fn, context) {
            var collected = [];
            utils.each(items, function (item) {
                collected.push(fn ? fn.apply(this, arguments) : item);
            }, context);
            return collected;
        },

        // Iterates over an array or object and collects items where the
        // callback returned a truthy value and returns them in an array.
        filter: function (items, fn, context) {
            var collected = [];
            utils.each(items, function (item) {
                if (fn.apply(this, arguments)) {
                    collected.push(item);
                }
            }, context);
            return collected;
        },

        // Returns a sorted copy of list, ranked in ascending order by the
        // results of running each value through iterator. Iterator may also
        // be the string name of the property to sort by (eg. length).
        // http://documentcloud.github.com/underscore/#sortBy
        sortBy: function(obj, val, context) {
            var iterator = _.isFunction(val) ? val : function(obj) { return obj[val]; };
            return _.pluck(_.map(obj, function(value, index, list) {
              return {
                value : value,
                criteria : iterator.call(context, value, index, list)
              };
            }).sort(function(left, right) {
              var a = left.criteria, b = right.criteria;
              if (a === void 0) return 1;
              if (b === void 0) return -1;
              return a < b ? -1 : a > b ? 1 : 0;
            }), 'value');
          },

        // Extend the first object passed as an argument with successive ones.
        extend: function (reciever) {
            var target  = arguments[0],
                objects = Array.prototype.slice.call(arguments, 1),
                count = objects.length,
                index = 0, object, property;

            for (; index < count; index += 1) {
                object = objects[index];
                for (property in object) {
                    if (object.hasOwnProperty(property)) {
                        target[property] = object[property];
                    }
                }
            }

            return target;
        },

        // Calls the method on the object provided, subsequent arguments will
        // be passed in to the method. Returns an array containing the returned
        // values of each function.
        invoke: function (object, method /* args */) {
            var collected = [], args = [].slice.call(arguments, 2);
            utils.each(object, function (item) {
                collected.push(item[method].apply(item, args));
            });
            return collected;
        },

        // Extracts a single property from each object in the collection.
        pluck: function (object, path, fallback) {
            var args = [].slice.call(arguments, 2);
            return utils.map(object, function (item) {
                return utils.keypath(item, path, fallback);
            });
        },

        // Creates a new deferred object.
        deferred: function () {
            if (jQuery && jQuery.Deferred) {
                return new jQuery.Deferred();
            }
            return new utils._.Deferred();
        },

        // Allows you to determine when multiple promises have resolved. Each
        // promise should be provided as an argument. Alternatively a single
        // array of promises can be provided.
        when: function (array) {
            var promises = arguments.length === 1 && utils.isArray(array) ? array : arguments;
            if (jQuery && jQuery.Deferred) {
                return jQuery.when.apply(jQuery, promises);
            }
            return utils._.when.apply(utils._, promises);
        },

        // Requests a json representation from the url provided. Returns a
        // promise object. This should be used to request resources from the
        // lanyrd API, it includes specialised error handling for the API.
        request: function (url) {
            var type     = config.requestType,
                request  = utils.rawRequest(url, type),
                deferred = utils.deferred(),
                promise  = deferred.promise({
                    data: null,
                    type: type,
                    xhr:  type === utils.request.JSONP ? null : request
                });

            request.then(function (data) {
                promise.data = data;
                deferred[!data || data.error ? 'reject' : 'resolve'](promise);
            }, function () {
                deferred.reject(promise);
            });

            return promise;
        },

        // Request function that will use jQuery if available otherwise fall back to
        // the built in lanyrd methods. Allows the type to be specified, this
        // can be used by scripts to request non lanyrd methods.
        rawRequest: function (url, type) {
            type = type || 'json';
            if (jQuery) {
                return jQuery.ajax({url: url, dataType: type});
            }
            return lanyrd.utils[type](url);
        },

        // Escapes html entities within a string.
        // https://www.owasp.org/index.php/XSS_(Cross_Site_Scripting)_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
        escape: function (string) {
            return ('' + string)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#x27;')
            .replace(/\//g, '&#x2F;');
        },

        // Function for looking up a value in an object using a key path (period
        // delimited string).
        // Often useful when working with large objects such as JSON data returned
        // from a server as it allows quick navigation to only the required
        // information.
        keypath: function keypath(object, path, fallback, prototype) {
            var keys = (path || '').split('.'),
                key;

            if (!path) {
                return object;
            }

            while (object && keys.length) {
                key = keys.shift();

                if (object.hasOwnProperty(key) || (prototype === true && object[key] !== undefined)) {
                    object = object[key];

                    if (keys.length === 0 && object !== undefined) {
                        return object;
                    }
                } else {
                    break;
                }
            }

            return (arguments.length > 2) ? fallback : null;
        },

        // Returns the pathname of a url.
        pathname: function (url) {
            utils.a.href = url || '/';
            return utils.a.pathname;
        }
    };

    config.requestType = utils.request.JSONP;

    // Wrapper object for a Github API resource

    function Resource(url){
        this.data = [];
        this.url = url;
        this.page = 1;
    }

    // Resource wrapper exposed functions
    //
    // eg. github.users('aaronacerboni').fetch();

    Resource.prototype = {
        constructor: Resource,

        get: function (path, fallback) {
            return utils.keypath(this, path, fallback);
        },

        fetch: function (url) {
            var resource = this,
                deferred = utils.deferred(),
                promise = deferred.promise(),
                url = url || resource.url,
                request;

            request = utils.request(url)
            .then(
                // success
                function (data) {
                    resource.data = request.data;
                    deferred.resolve(resource);
                },
                // fail
                function () {
                    deferred.fail();
                }
            );

            return utils.extend(resource, promise);
        },

        related: function (path) {
            this.url = this.url + '/' + path;
            return this.fetch(this.url);
        },

        next: function (perPage) {
            return paginate(this, 1, perPage);
        },

        prev: function (perPage) {
            return paginate(this, -1, perPage);
        },

        // A pagination function which goes through each page collating
        // data onto one returned Resource.
        //
        // An optional callback can be passed which is passed the current
        // paginated data and page's resource object.
        //
        // Returning true in your callback will cancel the pagination early.

        until: function (callback) {

            var that = this,

            // Promise regarding the fetching of all pages.
            // Resovles when all pages fetched or the passed callback returns
            // true.

                deferred = new utils.deferred(),
                promise = deferred.promise()

            // Resource which is return and will have items populated on
            // its data property

                resource = new Resource(this.url);

            function next(res) {
                utils.when((res || that).next(API.parameters.perPageValueMax))
                    .then(function (res) {

                        // Sets resource page back to page with actual
                        // content.

                        function end() {
                            resource.page = res.page -1;
                            deferred.resolve(resource);
                        }

                        // Concatinate data to the master resource if there is
                        // data to be found.

                        if(res.data.length > 0){
                            resource.data = resource.data.concat(res.data);
                            if(callback) {
                                if(callback(res.data, res.page, resource) === true){
                                    end();
                                } else {
                                    next(res);
                                }
                            } else {
                                next(res);
                            }
                        } else { // No data left
                            end();
                        }
                    });
            }
            // Start recursion with some pre-logic. The resource's page property is set
            // to 0 so first use of resource.next picks up data from the firt page (page 1)
            this.page = 0;
            next();
            return utils.extend(resource, promise);
        },

        // Another pagination function similar to all.
        // The difference is that this function passes each pages item
        // rather than a page's data entirely.

        until2: function (callback, n) {
            var that = this,
                deferred = new utils.deferred(),
                promise = deferred.promise(),
                resource = new Resource(this.url),
                totalIndex = -1,
                dontContinue,
                i;

            function next(res) {
                utils.when((res || that).next(API.parameters.perPageValueMax))
                    .then(function (res) {

                        function end(){
                            resource.page = res.page -1;
                            deferred.resolve(resource);
                        }

                        if(res.data.length > 0){
                            resource.data = resource.data.concat(res.data);
                            if(callback) {
                                i = 0;
                                for(i; i < res.data.length; i++){
                                    totalIndex++;
                                    if(callback(res.data[i], totalIndex, res.page, res.data, resource)){
                                        dontContinue = true;
                                        break;
                                    }
                                }
                                if(dontContinue){
                                    end();
                                } else {
                                    next(res);
                                }
                            } else {
                                next(res);
                            }
                        } else { // No data left
                            end();
                        }

                    });
            }

            this.page = 0;
            next();
            return utils.extend(resource, promise);
        },

        // Sets a Resource's data as a filtered collection of that data
        filter: function(filter) {
            this.data = (utils.isArray(this.data)) ? this.data : [this.data];
            this.data = github.utils.filter(this.data, filter, this);
            return this;
        },

        // Returns a resource. When its promise resolves the resource
        latest: function () {
            var deferred = new github.utils.deferred(),
                promise  = deferred.promise(),
                resource = new Resource(this.url);
            this.all().pipe(function(res){
                resource.data = github.utils.sortBy(res.data, function(item){

                }, this);
                deferred.resolve(resource);
            });
            return github.utils.extend(resource, promise);
        }
    };

    // Returns the fetch promise for the next or previous page.
    // Will increment or decrement the fetched resource page property
    // appropriately.

    function paginate(resource, direction, perPage){
        var url = buildUrl(resource.url, resource.page + direction, perPage);
        return resource.fetch(url).done(function () {
            resource.page += direction;
        });
    }

    // Returns an API url for a resource fetch. resourceUrl is required.

    function buildUrl(resourceUrl, pageNum, perPage) {
        var pageNum = pageNum || API.parameters.pageValue,
            perPageNum = perPage || API.parameters.perPageValue;

        // Build a url based on arguments or default values set in API
        // eg. https://api.github.com/repos/joyent/node/watchers?page=1&per_page=30
        return resourceUrl +
               '?' + API.parameters.page +    '=' + pageNum +
               '&' + API.parameters.perPage + '=' + perPageNum;
    }

    // API Variables
    // Contains query string parameters which may be prone to change

    var API = {
        domain: 'https://api.github.com/',
        parameters: {
            page: 'page',
            pageValue: '1',
            perPage: 'per_page',
            perPageValue: '30',
            perPageValueMax: '100'
        }
    };

    // The base Github API object.
    // This object is further populated by properties relating to each
    // api resource found in github.endpoints.
    //
    // eg. github.users() is created

    github = {

        utils: utils,

        endpoints: {
            users:  API.domain + 'users/',
            repos:  API.domain + 'repos/',
            gists:  API.domain + 'gists/',
            issues: API.domain + 'issues/',
            events: API.domain + 'events/'
        }
    };

    // Add a resource property for each API entrypoint found in
    // github.entrypoints
    //
    // eg. github.entrypoints.gists creates github.gists() for use
    //
    // Each resource property in github will return a Resource
    // representation of that API resource

    utils.each(github.endpoints, function(val, prop){
        github[prop] = function (path) {
            return new Resource(val + path);
        }
    }, this);

    return github;
}());