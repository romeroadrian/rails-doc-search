var MAX_RESULTS = 20;
var INDEX_URL = 'http://api.rubyonrails.org/js/search_index.js';
var SEARCH_URL = 'http://api.rubyonrails.org/?q=';

chrome.omnibox.setDefaultSuggestion({
  description: 'Loading Ruby on Rails API index...'
});

init();

function init() {
  var searcher = new Searcher(search_data.index);
  var omniboxResults = null;
  var started = false;
  var suggestCallback = null;

  searcher.ready(function(results, isLast) {
    if (!started) {
      started = true;
      omniboxResults = [];
    }

    for (var i = 0; omniboxResults.length < MAX_RESULTS && i < results.length; i++) {
      var result = results[i];

      var description = hlt(result.title);

      if (result.params) {
        description += '<dim>' + escapeHTML(result.params) + '</dim>';
      }

      if (result.namespace) {
        description += ' - <dim>' + hlt(result.namespace) + '</dim>';
      }

      omniboxResults.push({
        content: 'http://api.rubyonrails.org/' + result.path,
        description: description
      });
    }

    if (isLast) {
      started = false;
      suggestCallback(omniboxResults);
    }
  });

  chrome.omnibox.setDefaultSuggestion({
    description: 'Search Ruby on Rails API for <match>%s</match>'
  });

  chrome.omnibox.onInputChanged.addListener(function(query, suggestFn) {
    if (!query)
      return;
    suggestCallback = suggestFn || function(){};
    searcher.find(query.trim().toLowerCase());
  });

  chrome.omnibox.onInputEntered.addListener(function(text) {
    if (text.match(/^http\:/)) {
      navigateToUrl(text);
    } else {
      navigateToUrl(SEARCH_URL + encodeURIComponent(text));
    }
  });
}

function navigateToUrl(url) {
  chrome.tabs.getSelected(null, function(tab) {
    chrome.tabs.update(tab.id, {url: url});
  });
}

// From searchdoc.js
function hlt(html) {
    return escapeHTML(html).replace(/\u0001/g, '<match>').replace(/\u0002/g, '</match>');
}

function escapeHTML(html) {
    return html.replace(/[&<>]/g, function(c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
