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
    github.widgets.person = function badge(user, elem, options){
        var deferred = new github.utils.deferred(),
            promise = deferred.promise(),
            options = options || {},
            append = options.append || false,
            activityAmount = options.activityAmount || 6,
            eventType = options.activityFilter || 'all';

        github.utils.when(
            github.users(user).fetch(),
            github.helpers.events(user, eventType, {limit: activityAmount})
        )
        .pipe(template)
        .pipe(function(html){
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

            if(events.length){
                activities = "<ul id='github-activities'>"
                github.utils.each(events, function(item) {
                    switch(item.type){
                        case 'WatchEvent':  activities += tim('<li>Recently watched {{name}}</li>', item.repo);
                        break;
                        case 'PushEvent':   activities += tim('<li>Recently pushed to {{name}}</li>', item.repo);
                        break;
                        case 'FollowEvent': activities += tim('<li>Recently followed {{login}}</li>', item.payload.target);
                    }
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

    };

}(github));