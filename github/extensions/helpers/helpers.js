(function(github){

    // Augment the github api with the helper object

    github.helpers = {};

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

    // Augment github.helper with the latestEvents object

    github.helpers.latestEvents = {};

    github.utils.each(EVENT_TYPES, function(val){
        github.helpers.latestEvents[val] = function(user) {
            getEvent(user, val);
        }
    }, this);

    function getEvent(user, event) {
        var deferred = new github.utils.deferred(),
            promise = deferred.promise();

        github.users(user).related('events')
            .all()
            .pipe(function (resource) {
                resource.data = github.utils.filter(resource.data, function(item){
                    return (item.type === eventFilter);
                }, this);
                deferred.resolve(resource);
            });
        return promise;
    }

}(github));