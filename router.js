var url  = require('url'),
    path = require('path'),
    fs   = require('fs'),
    mime = require('mime');
        
function Router() {
    this.routes = {};
    this.staticDir = path.join(__dirname, "public");
}

Router.prototype.addRoute = function(route, method, callback) {
    this.routes[method] = this.routes[method] || [];
    if ('string' === typeof route) {
        route = new RegExp(route);
    };
    this.routes[method].push([route, callback]);
}

Router.prototype.get = function(route, callback) {
    this.addRoute(route, 'GET', callback)
}

Router.prototype.post = function(route, callback) {
    this.addRoute(route, 'POST', callback)        
}

Router.prototype.dispatch = function(req, res) {
    var pathname = url.parse(req.url).pathname;
    var method = req.method;
    var routes = this.routes[method] || [];
    for (var i = 0; i < routes.length; i++) {
        var route    = routes[i][0],
            callback = routes[i][1];
        var m = route.exec(pathname);
        if (m) {
            callback(req, res, m.slice(1));
            return;
        }
    }
    
    // If no route was found, check for a static file
    var filepath = path.join(this.staticDir, pathname);
    fs.readFile(filepath, function(err, data) {
        if (err) helpers.render404(res);
        var type = mime.lookup(pathname);
        res.writeHead(200, {"Content-Type": type});
        res.end(data);
    });
}

exports.Router = Router;