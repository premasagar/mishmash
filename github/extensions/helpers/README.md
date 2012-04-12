# Usage

Get the latest watch events for a user.

    github.helpers.latestEvents.WatchEvent('aaronacerboni').then(function (resource) {
        for(var i = 0; i < resource.data; i++){
            document.body.innerHTML += resource.data[0].created_at + '<br>';
        }
    });

# Methods

Each of the following methods return a promise which resolves when all of the available public events have been collected. The promise resolution is passed a github api wrapper `Resource` object with the events in its `data` property.

*Note: Some of these events are private and may not work*

- `github.helpers.latestEvents.CommitCommentEvent()`
- `github.helpers.latestEvents.CreateEvent()`
- `github.helpers.latestEvents.DeleteEvent()`
- `github.helpers.latestEvents.DownloadEvent()`
- `github.helpers.latestEvents.FollowEvent()`
- `github.helpers.latestEvents.ForkEvent()`
- `github.helpers.latestEvents.ForkApplyEvent()`
- `github.helpers.latestEvents.GistEvent()`
- `github.helpers.latestEvents.GollumEvent()`
- `github.helpers.latestEvents.IssueCommentEvent()`
- `github.helpers.latestEvents.IssuesEvent()`
- `github.helpers.latestEvents.MemberEvent()`
- `github.helpers.latestEvents.PublicEvent()`
- `github.helpers.latestEvents.PullRequestEvent()`
- `github.helpers.latestEvents.PullRequestReviewCommentEvent()`
- `github.helpers.latestEvents.PushEvent()`
- `github.helpers.latestEvents.TeamAddEvent()`
- `github.helpers.latestEvents.WatchEvent()`