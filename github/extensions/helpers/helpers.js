(function(github){

    // Augment the github api with the helper object

    github.eventHelpers = {};

    // http://developer.github.com/v3/events/types/

    var EVENT_TYPES = [
        'CommitCommentEvent',
        'CreateEvent',
        'DeleteEvent',
        'DownloadEvent',
        'FollowEvent',
        'ForkEvent',
        'ForkApplyEvent',
        'GistEvent',
        'GollumEvent',
        'IssueCommentEvent',
        'IssuesEvent',
        'MemberEvent',
        'PublicEvent',
        'PullRequestEvent',
        'PullRequestReviewCommentEvent',
        'PushEvent',
        'TeamAddEvent',
        'WatchEvent'
    ];

    utils.each(EVENT_TYPES, function(val){
        github.eventHelpers[val] = function(val) {
            getEvents(val);
        };
    }, this);

    function getEvents(event, perPage) {
        github.users(user).related('events')
            .pipe(function (resource) {
                resource.data = github.util.filter(resource.data, function (item) {
                    return (item.type === event);
                }, this);
                return resource;
            });
    }

}(github))

github.users(aaron).related('events').all().pipe(function (resource) {
    return /*filtered*/
});