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
                    var ul = '<ul class="github-repos">{{li}}</ul>',
                        li = '<li>' +
                                '<a rel="tag" href="{{html_url}}" title="{{name}} : {{description}}">{{name}}</a>' +
                                '<br> {{description}}' +
                             '</li>',
                        template = '';

                    for (var i = 0; i < repos.length; i++) {
                        template += tim(li, repos[i]);
                    };
                    callback(tim(ul, {li:template}));
                };
                api().users(user).repos(toHtml);
            }
        }
    };

    return gh_widgets;
}(github));
