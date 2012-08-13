var qs   = require('querystring'),
    fs   = require('fs'),
    ejs  = require('ejs' ),
    path = require('path');

exports.defaultViewsDir = path.join(__dirname, "views");

exports.renderHtml = function(view, response, options, viewsDir) {
    viewsDir = viewsDir || exports.defaultViewsDir;
    var filepath = path.join(viewsDir, view);
    fs.readFile(filepath, 'utf8', function(err, template) {
        var html = ejs.render(template, options);
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
