(function(github){

    // Augment the github api with the helper object

    github.helpers = {};

    // Requires a github user name, an event type.
    // Option parameters:
    // limit: a number which
    github.helpers.events = function(user, type, options) {
        var deferred = new github.utils.deferred(),
            promise = deferred.promise(),
            events = [],
            found = 0,
            limit = options.limit || Infinity;

        github.users(user + '/events').until2(function (item) {
            if(item.type === type){
                events.push(item);
                found++;
            }
            if(found === limit){
                return true;
            }
        }).then(function () {
            deferred.resolve(events);
        })

        return promise;
    };

}(github));