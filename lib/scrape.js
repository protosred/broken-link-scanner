const cheerio = require('cheerio');
const request = require('request-promise-native');

function makeBaseURL(url) {
  const tmp = url.split('/');
  const protocol = tmp[0];
  const host = tmp[2];
  return `${protocol}//${host}/`;
}
function isURL(str) {
  var urlRegex = '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$';
  var url = new RegExp(urlRegex, 'i');
  return str.length < 2083 && url.test(str);
}

class Content {
  constructor(url, html) {
    this.url = url;
    this.baseURL = makeBaseURL(url);
    html = html || '';
    this.html = html;
    let $ = null;
    try {
      $ = cheerio.load(this.html);
    } catch(error) {
      console.error('PARSE ERROR')
      console.error(error)
      $ = cheerio.load('');
    }
    this.$ = $;
  }
  absoluteURL(url) {
    url = url || '';
    if(url.indexOf('//') === 0) {
      let proto = this.baseURL.split('/').shift();
      url = proto + url;
    } else if(url.indexOf('/') === 0) {
      url = this.baseURL + url.substr(1);
    } else if(url.indexOf('http:') !== 0 && url.indexOf('https:') !== 0) {
      url = this.baseURL + url;
    }
    url = url.split('#').shift();
    if(!isURL(url)) {
      return '';
    }
    return url;
  }
  getUniqueExternalLinkURLs(options) {
    options = options || {};
    let fullItems = [];
    let urls = [];
    this.$('a').each((i, elem) => {
      let href = this.absoluteURL(this.$(elem).attr('href'));
      if(href && href.indexOf(this.baseURL) === -1 && urls.indexOf(href) === -1) {
        if(options.ignoreDomains) {
          let isIgnored = options.ignoreDomains.reduce((acc, domain) => acc || (href.indexOf(domain) > 0), false)
          if(isIgnored) {
            return;
          }
        }
        urls.push(href);
        if(options.withText) {
          fullItems.push({
            href,
            text: this.$(elem).text().trim()
          })
        }
      }
    });
    return options.withText? fullItems : urls;
  }
  getUniqueInternalLinkURLs() {
    let urls = [];
    this.$('a').each((i, elem) => {
      let href = this.absoluteURL(this.$(elem).attr('href'));
      if(href && href.indexOf(this.baseURL) === 0 && urls.indexOf(href) === -1) {
        urls.push(href);
      }
    });
    return urls;
  }
  getUniqueLinkURLs() {
    let urls = [];
    this.$('a').each((i, elem) => {
      let href = this.absoluteURL(this.$(elem).attr('href'));
      if(href && urls.indexOf(href) === -1) {
        urls.push(href);
      }
    });
    return urls;
  }
}
exports.Content = Content;

exports.getWebContent = async function getWebContent(url) {
  const reqOptions = {
      "rejectUnauthorized": false,
      url: url,
      timeout: 15*1000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
      }
    }
  return request.get(reqOptions).then(body => {
    return new Content(url, body);
  }).catch((err) => {
    return null;
  })
}

exports.isActiveURL = async function isActiveURL(url) {
  const reqOptions = {
      "rejectUnauthorized": false,
      url: url,
      timeout: 15*1000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36'
      }
    }
  return request.get(reqOptions).then(body => {
    return true;
  }).catch((err) => {
    return false;
  })
}