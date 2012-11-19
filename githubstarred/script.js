function getUsersLatestWatched (user) {
  var noodleUrl = 'http://dharmafly.noodle.jit.su/',
      latestWatchedQuery = {
        url:      'https://api.github.com/users/premasagar/events/public',
        selector: 'string:val(\"WatchEvent\") ~ .repo',
        type:     'json'
      };

  return jQuery
    .getJSON(noodleUrl +'?q='+JSON.stringify(latestWatchedQuery)+'&callback=?');
}

function display (data) {
  jQuery.each(data[0].results, function (i, repo) {
    jQuery('<pre>').appendTo('body').append(JSON.stringify(repo));
  });
}

getUsersLatestWatched('premasagar').then(display);