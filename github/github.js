var github = (function(){

    // Github api entry point, handles routing.
    // Returns a promise and can be passed a callback.

    var github = function(path, callback){

        var tokens = path.split('/');

        switch(tokens[0]){
            case 'users' :
                if(!tokens[2]) tokens[2] = 'about';
                return github[tokens[0]](tokens[1])[tokens[2]](function(data){
                    if(callback) callback(data);
                });
            break;
            case 'repos' :
                if(!tokens[3]) tokens[3] = 'about';
                return github[tokens[0]](tokens[1], tokens[2])[tokens[3]](function(data){
                    if(callback) callback(data);
                });
            break;
            default :
                console.log('github.js: Unsupported resource');
        }
    };

    // API end point

    github.endpoint = 'https://api.github.com/';

    // Github api users resources. Methods return a promise and
    // can be passed a callback.
    //
    // Usage: github.users(':user').about(function(data){})

    github.users = function(user){
        return {
            about: function(callback){
                return github.users(user).user(callback);
            },
            user: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '?callback=?');
                return promise.always(callback);
            },
            repos: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '/repos?callback=?');
                return promise.always(callback);
            },
            gists: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '/gists?callback=?');
                return promise.always(callback);
            },
            following: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '/following?callback=?');
                return promise.always(callback);
            },
            followers: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '/followers?callback=?');
                return promise.always(callback);
            },
            watched: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '/watched?callback=?');
                return promise.always(callback);
            },
            'recieved_events/public': function(callback){
                return github.users(user).recieved_events.public(callback);
            },
            recieved_events: {
                public : function(callback){
                    var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '/received_events/public?callback=?');
                    return promise.always(callback);
                }
            }
        };
    };

    // Github api repos resources. Methods return a promise and
    // can be passed a callback.
    //
    // Usage: github.users(':user', ':repo').about(function(data){})

    github.repos = function(user, reponame){
        return {
            about: function(callback){
                return github.repos(user, reponame).repo(callback);
            },
            repo: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'repos/' + user + '/' + reponame + '?callback=?');
                return promise.always(callback);
            },
            watchers: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'repos/' + user + '/' + reponame + '/watchers?callback=?');
                return promise.always(callback);
            },
            commits: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'repos/' + user + '/' + reponame + '/commits?callback=?');
                return promise.always(callback);
            },
            languages: function(callback){
                var promise = jQuery.getJSON(github.endpoint + 'repos/' + user + '/' + reponame + '/languages?callback=?');
                return promise.always(callback);
            }
        };
    };

    // Utility method for retrieving the next page of a resource

    github.next = function(resource, callback){
        var deferred = jQuery.Deferred(),
            promise = deferred.promise();

        // Checks if there is a next page to request
        // TODO: Check if the internal condition check is CORRECT!
        var hasNextPage = function(){
            if(resource.meta.Link[0][1].rel === 'next' || resource.meta.Link[0][1].rel === 'first'){
                return true;
            } else {
                return false;
            }
        };

        // Merge newly gathered data with previous
        var merge = function(newData){
            return resource.data.concat(newData.data);
        };

        // The url contains the previous callback query string, remove that.
        var clean = function(url){
            return url.split('?_=')[0] + '?page=' + url.split('&page=').pop();
        };

        if(hasNextPage()){

            // Make new request, resolve returned promise and pass in the combined
            // data
            jQuery.getJSON(clean(resource.meta.Link[0][0]) + '&callback=?')
                .then(function(newData){
                    deferred.resolve(merge(newData));
                });
        }

        // Return promise
        return promise.always(function(){

        })
    };

    github.nextAll = function(resource, callback){
        var deferred = jQuery.Deferred(),
            master = deferred.promise();
    }

    // Utility method for filtering Event types in a Users public events

    github.filterEvent = function(resource, by){

    }

    // Utility method which can be passed a number of user resource objects and
    // expands them to their full resource.
    // Returns a promise which is resolved when all users are expanded, optionally
    // one may also pass in a callback which is passed the expanded users.

    github.getFullUsers = function(users, callback){
        var userPromises = [],
            expandedUsers = [],
            deferred = jQuery.Deferred(),
            master = deferred.promise();

        jQuery.each(users, function(){
            userPromises.push(jQuery.getJSON('https://api.github.com/users/' + this.login + '?callback=?'));
        });

        jQuery.when.apply(jQuery, userPromises)
            .then(function(){
                jQuery.each(arguments, function(){
                    expandedUsers.push(this[0]['data']);
                });
                if(callback){
                    callback(expandedUsers);
                }
                deferred.resolve(expandedUsers);
            }, function(){
                deferred.fail();
            });

        return master;
    };

    // Utility method getBy

    function getBy(enum, findProperty, findValue){
        return jQuery.map(enum, function(el, i){
            if (typeof el[findProperty] !== 'undefined'){
                if (typeof findValue === 'undefined' ||
                    el[findProperty] === findValue){
                    return el;
                }
            }
        });
    }

    return github;
}());