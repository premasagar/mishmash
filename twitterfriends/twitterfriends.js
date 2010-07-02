function twitterFriends(username, callback){
    jQuery.getJSON('http://api.twitter.com/1/friends/ids.json?id=' + username + '&callback=?', callback);
}

function twitterUser(username, callback){
    jQuery.getJSON('http://api.twitter.com/1/users/show.json?id=' + username + '&callback=?', callback);
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
    var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http://twitter.com/premasagar%22%20and%0A%20%20%20%20%20%20xpath%3D'//*[%40id%3D%22timeline%22]/li[1]'&diagnostics=true&env=store://datatables.org/alltableswithkeys&callback=?";

    jQuery.getJSON(url, function(html){
        if(data && data.results && data.results[0]){
            callback(jQuery(html));
        }
        else {
            callback(null);
        }
    });
}

function parseStatus(dom){    
    var status = null,
        timestamp;

    if(dom){
        timestamp = decodeURIComponent(eval('(' + dom.find('.timestamp').attr('data') + ')').time);
        status = {
            dom:dom,
            timestamp:new Date(timestamp)
        };
    }
    return status;
}
