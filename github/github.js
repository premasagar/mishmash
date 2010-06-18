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


    var github = {
        repos: function(user, callback){
            jQuery.getJSON('http://github.com/api/v2/json/repos/show/' + user + '/?callback=?', callback);
        },
        user: function(user, callback){
            jQuery.getJSON('http://github.com/api/v2/json/user/show/' + user + '/?callback=?', callback);
        },
        gists: function(user, callback){
            jQuery.getJSON('http://gist.github.com/api/v1/json/gists/' + user + '/?callback=?', callback);
        },
        html:function(user, type, callback){
            var toHtml;
            if (type === 'repos'){
                toHtml = function(data){
                    var repos = data.repositories,
                        html = '';
                    
                    html += '<ul class="github-repos">';
                    $.each(repos, function(){
                        html += '<li>' + 
                                    '<a rel="tag" href="' + this.url + '" title="' + this.name + ': ' + this.description + '">' + this.name + '</a>' +
                                    '<p>' + this.description + '</p>' +
                                '</li>';
                    });                    
                    html += '</ul>';
                    callback(html);
                };
                this.repos(user, toHtml);
            }
        }
    };

    return github;
}());
