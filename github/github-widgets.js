var gh_widgets = (function(github){

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
                api.users(user).repos(toHtml);
            }
        }
    };

    return gh_widgets;
}(github));
