var github = (function(){

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

    // Github api entry point, handles routing.
    // Returns a promise and can be passed a callback.

    var github = function(path, callback){
        if(!path) return true;
        var tokens = path.split('/');
        switch(tokens[0]){
            case 'users' :
                if(!tokens[2]) tokens[2] = 'about';
                return github[tokens[0]](tokens[1])[tokens[2]](function(resource){
                    if(callback) callback(resource.data);
                });
            break;
            case 'repos' :
                if(!tokens[3]) tokens[3] = 'about';
                return github[tokens[0]](tokens[1], tokens[2])[tokens[3]](function(resource){
                    if(callback) callback(resource.data);
                });
            break;
            default :
                console.log('github.js: Unsupported resource');
        }
    };

    // Github api end point

    github.endpoint = 'https://api.github.com/';

    // Github api users resources. Methods return a promise and
    // can be passed a callback.

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
                var promise = jQuery.getJSON(github.endpoint + 'users/' + user + '/received_events/public?callback=?');
                return promise.always(callback);
            }
        };
    };

    // Github api repos resources. Methods return a promise and
    // can be passed a callback.

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

    return github;
}());