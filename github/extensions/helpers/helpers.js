(function(github){
    'use strict';

    // Augment the github api with the helper object

    github.helpers = {};

    // Requires a github user name and an event type.
    //
    // This method takes into account for duplicate
    // watch events of the same repo.
    //
    // Option parameters:
    // limit

    github.helpers.events = function(user, type, options) {
        var deferred = new github.utils.deferred(),
            promise = deferred.promise(),
            options = options || {},
            events = [],
            captured = {},
            found = 0,
            limit = options.limit || Infinity;

        github.users(user + '/events').until2(function (item) {
            if(item.type === type && !captured.hasOwnProperty(item.repo.name)){
                captured[item.repo.name] = true;
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