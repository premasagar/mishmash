

// localStorage wrapper
function cache(key, value){
    var ns = 'revolutionaries',
        localStorage,
        JSON;
        
    try {
        localStorage = window.localStorage;
        JSON = window.JSON;
    
        if (!localStorage || !JSON){
            return false;
        }
        key = ns + '.' + key;
        if (typeof value === 'undefined'){
            value = localStorage[key];
            return value ? JSON.parse(value).v : value;
        }
        else {
            localStorage[key] = JSON.stringify({
                v: value,
                t: new Date().getTime()
            });
        }
    }
    catch(e){
        _('localStorage error: ', e);
        return false;
    }
}

// Caching layer for JSONP data
// TODO: add check for error responses, or mechanism for deleting keys
function jsonCache(url, callback){
    var cached = cache(url);
    if (cached){
        callback(cached);
    }
    else {
        jQuery.getJSON(url, function(data){
            cache(url, data);
            callback(data);
        });
    }
}


function twitterFriends(username, callback){
    jsonCache('http://api.twitter.com/1/friends/ids.json?id=' + username + '&callback=?', callback);
}

function twitterUser(username, callback){
    jsonCache('http://api.twitter.com/1/users/show.json?id=' + username + '&callback=?', callback);
}

function sortByLatest(users){
    return users.sort(function(a, b){
        return a.status.id > b.status.id;
    });
}

var friendsIds,
    friends = [],
    total = 0,
    count = 0;


function sortFriendsByLatest(username, callback){
    twitterFriends(username, function(data){
        friendsIds = data;
        total = data.length;
        jQuery.each(data, function(i, id){
            twitterUser(id, function(data){
                friends.push(data);
                count++;
                if (count >= total){
                    callback(sortByLatest(friends));
                }
            });
        });
    });
}

/*
sortFriendsByLatest('premasagar', function(data){
    jQuery('body').empty().append('<textarea style="width:100%; height:100%;">' + JSON.stringify(data) + '</textarea>');
});
*/



//////////////////////////


function latestStatus(username, callback){
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http://twitter.com/" + username + "%22%20and%0A%20%20%20%20%20%20xpath%3D'//*[%40id%3D%22timeline%22]/li[1]'&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=?";

    jsonCache(url, function(data){
        if(data && data.results && data.results[0]){
            callback(jQuery(data));
        }
        else {
            callback(null);
        }
    });
}

function parseStatus(dom){    
    var status = null,
        timestamp;

    if (dom){
        timestamp = dom.find('.timestamp');
        if (timestamp.length){
            timestamp = decodeURIComponent(eval('(' + timestamp.attr('data') + ')').time);
            status = {
                dom:dom,
                timestamp:new Date(timestamp)
            };
        }
    }
    return status;
}

function sortFriendsByLatest2(username, callback){
    twitterFriends(username, function(data){
        _('Getting Twitter friends for: ' + username);
        friendsIds = data;
        total = data.length;
        jQuery.each(data, function(i, id){
            _('Getting latest status for: ' + id);
            latestStatus(id, function(html){
                _('Latest status for: ' + id, html);
                friends.push(parseStatus(jQuery(html)));
                count++;
                if (count >= total){
                    callback(sortByLatest(friends));
                }
            });
        });
    });
}


sortFriendsByLatest2('premasagar', function(data){
    jQuery('body').empty().append('<textarea style="width:100%; height:100%;">' + JSON.stringify(data) + '</textarea>');
});


///////////////////

// http://api.twitter.com/1/statuses/friends.json?screen_name=premasagar&cursor=-1

var friends = [];


function lastTweeted(user){
    if (user && user.status && user.status.created_at){
        return new Date(user.status.created_at).getTime();
    }
    return 0;
}

function sortByLastTweeted(users){
    return users.sort(function(a, b){
        return lastTweeted(a) - lastTweeted(b); 
    });
}

var friends = sortByLastTweeted(f),
friendsLen = friends.length,
html = '', user;

console.log(friendsLen);

for (var i=0; i<friendsLen; i++){
    username = friends[i].screen_name;
    html += '<li><a href="http://twitter.com/' + username + '">' + username + '</a></li>';
}
document.body.innerHTML = '<ul>' + html + '</ul>;
