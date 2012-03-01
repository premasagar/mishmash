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

    function expandUsers(users, callback){
        var userPromises = [],
            expandedUsers = [];

        jQuery.each(users, function(){
            userPromises.push(jQuery.getJSON('https://api.github.com/users/' + this.login + '?callback=?'));
        });
        jQuery.when.apply(jQuery, userPromises)
            .then(function(){
                jQuery.each(arguments, function(){
                    expandedUsers.push(this[0]['data']);
                })
                callback(expandedUsers);
            });
    }

    var api = {
        endpoint: 'https://api.github.com/',
        users: function(user){
            return {
                about: function(callback){
                    api.user(user).user(callback);
                },
                user: function(callback){
                    jQuery.getJSON(api.endpoint + 'users/' + user + '?callback=?', function(user){
                        callback(user.data);
                    });
                },
                repos: function(callback){
                    jQuery.getJSON(api.endpoint + 'users/' + user + '/repos?callback=?', function(repos){
                        callback(repos.data);
                    });
                },
                gists: function(callback){
                    jQuery.getJSON(api.endpoint + 'users/' + user + '/gists?callback=?', function(gists){
                        callback(gists.data);
                    });
                },
                following: function(callback){
                    jQuery.getJSON(api.endpoint + 'users/' + user + '/following?callback=?', function(users){
                        expandUsers(users.data, callback);
                    });
                },
                followers: function(callback){
                    jQuery.getJSON(api.endpoint + 'users/' + user + '/followers?callback=?', function(users){
                        expandUsers(users.data, callback);
                    });
                },
                watched: function(callback){
                    jQuery.getJSON(api.endpoint + 'users/' + user + '/watched?callback=?', function(repos){
                        callback(repos.data);
                    });
                }
            };
        },
        repos: function(user, reponame){
            return {
                about: function(callback){
                    api.repo(user, reponame).repo(callback);
                },
                repo: function(callback){
                    jQuery.getJSON(api.endpoint + 'repos/' + user + '/' + reponame + '?callback=?', function(repo){
                        callback(repo.data);
                    });
                },
                watchers: function(callback){
                    jQuery.getJSON(api.endpoint + 'repos/' + user + '/' + reponame + '/watchers?callback=?', function(users){
                        expandUsers(users.data, callback);
                    });
                },
                commits: function(callback){
                    jQuery.getJSON(api.endpoint + 'repos/' + user + '/' + reponame + '/commits?callback=?', function(commits){
                        callback(commits.data);
                    });
                },
                languages: function(callback){
                    jQuery.getJSON(api.endpoint + 'repos/' + user + '/' + reponame + '/languages?callback=?', function(langs){
                        callback(langs.data);
                    });
                }
            };
        }
    };

    var github = function(path, callback){
        var tokens;
        if(!path){
            return api;
        } else {
            tokens = path.split('/');
            if(!tokens[2]) tokens[2] = 'about';
            api[tokens[0]](tokens[1])[tokens[2]](function(data){
                callback(data);
            });
        }
    };

    return github;
}());
