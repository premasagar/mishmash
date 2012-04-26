(function(github){
    'use strict';

    //
    // Extend the github global with `lanyrd.widget`

    github.widgets = {};

    //
    // Tim (a tiny, secure JavaScript micro-templating script)
    // https://github.com/premasagar/tim

    var tim=function(){var e=/{{\s*([a-z0-9_][\\.a-z0-9_]*)\s*}}/gi;return function(f,g){return f.replace(e,function(h,i){for(var c=i.split("."),d=c.length,b=g,a=0;a<d;a++){b=b[c[a]];if(b===void 0)throw"tim: '"+c[a]+"' not found in "+h;if(a===d-1)return b}})}}();

    //
    // Here be Widgets !

    // person creates a widget for representing a Github user.
    //
    // options:
    //  append - Flag, if true the widget will be appended to the
    //           dom element rather than replace it. (default: false)
    //  activityAmount - Number of max activities to be shown
    //  activityFilter - String which can be a github event type
    github.widgets.person = function person(user, elem, options){
        var deferred = new github.utils.deferred(),
            promise = deferred.promise(),
            options = options || {},
            append = options.append || false,
            activityAmount = options.activityAmount || 4,
            eventType = options.activityFilter || 'all';

        github.utils.when(
            github.users(user).fetch(),
            github.helpers.events(user, eventType, {limit: activityAmount})
        )
        .pipe(template)
        .then(function(html){
            elem.innerHTML = (append) ? elem.innerHTML + html : html;
            deferred.resolve(html);
        });

        function template(user, events){
            var deferred = new github.utils.deferred(),
                promise = deferred.promise(),
                user = user.data,
                html = '',

                // templates

                top = "<div id='github-widget-person'>{{bio}}{{activities}}</div>",
                bio = "<a style='float:left' href='{{html_url}}' title={{login}} target='_blank'>" +
                        "<img src='{{avatar_url}}' height='36px' width='36px' alt='{{login}}'/>" +
                      "</a>" +
                      "<div style='margin-left:44px'>" +
                        "<h4 style='margin:0'><a href='{{html_url}}' target='_blank'>{{login}} ({{name}})</a></h4>" +
                        "<a href='{{blog}}' target='_blank'>{{blog}}</a>" +
                      "</div>",
                activities = '';
            var x = 0;
            if(events.length){
                activities = "<ul id='github-activities'>"
                github.utils.each(events, function(item) {
                    activities += '<li>';
                    switch(item.type){
                        case 'WatchEvent':
                            activities += tim(
                                           'Watched <a href="' +
                                           item.repo.url.replace('https://api.github.com/repos', 'https://github.com') + '">{{name}}</a> ' +
                                           github.utils.prettyDate(item.created_at),
                                           item.repo
                                          );
                            console.log(item.created_at, item, x++);
                        break;
                        case 'PushEvent':
                            activities += tim(
                                           'Pushed to {{name}} '+ github.utils.prettyDate(item.created_at),
                                           item.repo
                                          );
                        break;
                        case 'FollowEvent':
                            activities += tim(
                                           'Follow {{name}} '+ github.utils.prettyDate(item.created_at),
                                           item.payload.target
                                          );
                        break;
                    }
                    activities += '</li>';
                });
                activities += "</ul>";
            }

            // building

            bio = tim(bio, user);

            return deferred.resolve(
                tim(top, {
                    bio: bio,
                    activities: activities
                })
            );
        }
    };

    github.widgets.repos = function repos(user, elem, options){
        var deferred = new github.utils.deferred(),
            promise = deferred.promise(),
            options = options || {},
            append = options.append || false,
            repoAmount = options.repoAmount || 6,
            found = 0;

        options.templates || (options.templates = {});

        github.users(user).related('repos').until2(function (repo) {
            found++;
            if(found === options.repoAmount){
                return true;
            }
        })
        .pipe(template)
        .pipe(function (html) {
            elem.innerHTML = (append) ? elem.innerHTML + html : html;
            deferred.resolve(html);
        });

        function template (repos) {
            var deferred = new github.utils.deferred(),
                promise = deferred.promise(),
                repos = repos.data,

                // templates

                reposTemplate = options.templates.reposTemplate ||
                            "<ul>{{repo}}</ul>",
                repoTemplate = options.templates.repoTemplate ||
                            "<li><a href='{{html_url}}' title='{{watchers}} watchers and {{forks}} fork(s)'>{{name}}</a></li>",
                seeAllTemplate = options.templates.seeAllTemplate ||
                            "See all of <a href='https://github.com/{{login}}/repositories'>{{login}}'s repos</a>",

                // build template

                repoCollection = '';

            github.utils.each(repos, function(item) {
                repoCollection += tim(repoTemplate, item);
            });

            return deferred.resolve(
                '<div id="github-widget-repos">'+
                    tim(reposTemplate, {repo: repoCollection}) + tim(seeAllTemplate, {login: repos[0].owner.login}) +
                '</div>'
            );
        }
    };

}(github));