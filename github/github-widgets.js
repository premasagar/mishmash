(function(github, tim){

    var github = github,
        tim = tim,
        templates = {
            users : function(users){
                var ul = '<ul class="github-users">{{li}}</ul>',
                    li = '<li>' +
                            '<a rel="tag" href="{{html_url}}" title="{{name}} : {{bio}}">{{name}}\'s page</a>' +
                         '</li>',
                    template = '';

                for (var i = 0; i < repos.length; i++) {
                    template += tim(li, repos[i]);
                };
                return tim(ul, {li:template});
            },
            repos : function(repos){
                var ul = '<ul class="github-repos">{{li}}</ul>',
                    li = '<li>' +
                            '<a rel="tag" href="{{html_url}}" title="{{name}} : {{description}}">{{name}}</a>' +
                            '<br> {{description}}' +
                         '</li>',
                    template = '';

                for (var i = 0; i < repos.length; i++) {
                    template += tim(li, repos[i]);
                };
                return tim(ul, {li:template});
            },
            commits : function(commits){

            },
            gists : function(gists){

            },
            languages : function(langs){

            }
        };

    function defaultTemplates(tokens, data){
        var html = '';
        switch(tokens.pop()){
            case 'following' :
            case 'followers' :
            case 'watchers' :
                html = templates.users(data);
                break;
            case 'repos' :
            case 'watched' :
                html = templates.repos(data);
                break;
            case 'commits' :
                html = templates.commits(data);
                break;
            case 'gists' :
                html = templates.gists(data);
                break;
            case 'languages' :
                html = templates.languages(data);
                break;
            default :
            if(tokens[0] === 'users'){
                html = templates.users(data);
            } else if(tokens[0] === 'repos'){
                html = templates.repos(data);
            }
        }
        return html;
    }

    github.widget = function(path, template, callback){
        github(path, function(data){
            var html = defaultTemplates(path.split('/'), data);
            callback(html);
        });
    };

}(github, tim));