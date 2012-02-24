var gh_widgets = (function(github){
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

    var api = github;

    var gh_widgets = {
        html:function(user, type, callback){
            var toHtml;
            if (type === 'repos'){
                toHtml = function(repos){
                    var html = '';

                    html += '<ul class="github-repos">';
                    $.each(repos, function(){
                        html += '<li>' +
                                    '<a rel="tag" href="' + this.html_url + '" title="' + this.name + ': ' + this.description + '">' + this.name + '</a>' +
                                    '<p>' + this.description + '</p>' +
                                '</li>';
                    });
                    html += '</ul>';
                    callback(html);
                };
                api.user(user).repos(toHtml);
            }
        }
    };

    return gh_widgets;
}(github));
