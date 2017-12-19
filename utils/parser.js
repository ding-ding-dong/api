// https://github.com/danmactough/node-feedparser/blob/master/examples/iconv.js

import request from 'request'
import FeedParser from 'feedparser'
import Iconv from 'Iconv'

var maybeTranslate = function (res, charset, done) {
  var iconv;
  // Use iconv if its not utf8 already.
  if (!iconv && charset && !/utf-*8/i.test(charset)) {
    try {
      iconv = new Iconv(charset, 'utf-8');
      console.log('Converting from charset %s to utf-8', charset);
      iconv.on('error', done);
      // If we're using iconv, stream will be the output of iconv
      // otherwise it will remain the output of request
      res = res.pipe(iconv);
    } catch(err) {
      res.emit('error', err);
    }
  }
  return res;
};

var getParams = function (str) {
  var params = str.split(';').reduce(function (params, param) {
    var parts = param.split('=').map(function (part) { return part.trim(); });
    if (parts.length === 2) {
      params[parts[0]] = parts[1];
    }
    return params;
  }, {});
  return params;
};

var fetch = function (feed, done) {
  // Define our streams
  var req = request(feed, {timeout: 10000, pool: false});
  req.setMaxListeners(50);
  // Some feeds do not respond without user-agent and accept headers.
  req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
  req.setHeader('accept', 'text/html,application/xhtml+xml');

  var feedparser = new FeedParser();

  // Define our handlers
  req.on('error', done);
  req.on('response', function (res) {
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    var charset = getParams(res.headers['content-type'] || '').charset;
    res = maybeTranslate(res, charset, done);
    // And boom goes the dynamite
    res.pipe(feedparser);
  });

  var data = [];
  feedparser.on('error', done);
  feedparser.on('readable', function () {
    var post;
    while (post = this.read()) {
      data.push(post);
    }
  });
  feedparser.on('end', function (err) {
    done(err, data);
  });
};

var fetchAsync = function (feed) {
  return new Promise(function (resolve, reject) {
    fetch(feed, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

var parser = {
  fetchAsync: fetchAsync
};

export default parser
