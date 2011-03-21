var qs   = require('querystring'),
    jade = require('jade'),
    path = require('path');

var viewsDir = path.join(__dirname, "views");

exports.renderHtml = function(view, response, options) {
    jade.renderFile(path.join(viewsDir, view), options, function(err, html) {
        if (err) throw err;
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end(html);
    });        
}

exports.render404 = function(response) {
    response.writeHead(404);
    response.end("404 File not found");    
}

exports.redirect = function(url, response) {
    response.writeHead(302, {
        'Content-Type': 'text/html', 
        'Location': url
    });
    response.end();
}

exports.parseBody = function(req, callback) {
    var body = "";
    req.on('data', function(chunk) {
        body += chunk;
    });
    req.on('end', function() {
        callback(qs.parse(body));
    });
}
