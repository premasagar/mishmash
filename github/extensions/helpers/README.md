helpers.js is an extension which sits on top of the core github.js API wrapper.

This script works by extending the global `github` object with a `helpers` namespace.

eg. `github.helpers`

Using the `helpers` namespace one can access a bunch of helper functions for carrying out common
use cases for the Github API.

# Usage

Get the 6 latest watch events for a user.

    github.helpers.events('aaronacerboni', 'WatchEvent', {limit:6})
        .then(function(events){
            events.forEach(function (event) {
                console.log(event);
            });
        });