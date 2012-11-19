// This method looks at the users public repo and picks out WatchEvents.

// function getUsersLatestWatched (user) {
//   var noodleUrl = 'http://dharmafly.noodle.jit.su/',
//       latestWatchedQuery = {
//         url:      'https://api.github.com/users/premasagar/events/public',
//         selector: 'string:val(\"WatchEvent\") ~ .repo',
//         type:     'json'
//       };

//   return jQuery
//     .getJSON(noodleUrl +'?q='+JSON.stringify(latestWatchedQuery)+'&callback=?');
// }


// This method looks at the users starred api endpoint. The last page in the 
// api endpoint (?page=x) reflects the latest starred, though it may be slow 
// to update.

function getUsersLatestWatched (user) {
  var noodleUrl    = 'http://dharmafly.noodle.jit.su/',
      headerQuery  = JSON.stringify({
        "url": "https://api.github.com/users/premasagar/starred?page=last",
        "type":"json",
        "selector":".url",
        "linkHeader": true
      }),
      watchedQuery;

  return jQuery.getJSON(noodleUrl + '?q=' + headerQuery +'&callback=?')
      .pipe(function (data) {
        watchedQuery = JSON.stringify({
            url:      data[0].headers.link.last,
            selector: '.full_name',
            type:     'json'
          });
        return jQuery.getJSON(noodleUrl + '?q=' + watchedQuery + '&callback=?');
      });
}

function display (data) {
  jQuery.each(data[0].results, function (i, repo) {
    jQuery('<pre>').appendTo('body').append(JSON.stringify(repo));
  });
}

getUsersLatestWatched('premasagar').then(display);