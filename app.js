var http = require('http'),
    url  = require('url'),
    sys  = require('sys'),
    path = require('path'),
    jade = require('jade'),
    fs   = require('fs'),
    mime = require('mime');
    
var viewsDir = path.join(__dirname, "views");
var staticDir = path.join(__dirname, "public");
    
// Create a router object
    
var router = {
    routes: {},
    addRoute: function(route, method, callback) {
        this.routes[method] = this.routes[method] || [];
        if ('string' === typeof route) {
            route = new RegExp(route);
        };
        this.routes[method].push([route, callback]);
    },
    get: function(route, callback) {
        this.addRoute(route, 'GET', callback)
    },
    post: function(route, callback) {
        this.addRoute(route, 'POST', callback)        
    },
    dispatch: function(req, res) {
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
        var filepath = path.join(staticDir, pathname);
        fs.readFile(filepath, function(err, data) {
            if (err) {
                res.writeHead(404);
                res.end("404 File not found");
            }
            var type = mime.lookup(pathname);
            res.writeHead(200, {"Content-Type": type});
            res.end(data);
        });
    }
};

// Helper functions

function renderHtml(view, response, options) {
    jade.renderFile(path.join(viewsDir, view), options, function(err, html) {
        if (err) throw err;
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end(html);
    });        
}

// Add our routes

router.get('^/posts/?$', function(req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello Posts");
});

router.get('^/posts/add/?$', function(req, res) {
    var options = {};
    renderHtml('index.jade', res, options);
});


// Create the actual http server

var server = http.createServer(function(req, res) {
    router.dispatch(req, res);
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/");
