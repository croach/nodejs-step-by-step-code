var http = require('http'),
    url  = require('url'),
    sys  = require('sys');
    
// Create a router object
    
var router = {
    routes: [],
    addRoute: function(route, callback) {
        if ('string' === typeof route) {
            route = new RegExp(route);
        };
        this.routes.push([route, callback]);
    },
    dispatch: function(req, res) {
        var pathname = url.parse(req.url).pathname;
        for (var i = 0; i < this.routes.length; i++) {
            var route    = this.routes[i][0],
                callback = this.routes[i][1];
            if (route.test(pathname)) {
                callback(req, res);
                return;
            };
            res.writeHead(404);
            res.end("404 File Not Found");
        }
    }
};

// Add our routes

router.addRoute('^/posts/?$', function(req, res) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello Posts");
});

// Create the actual http server

var server = http.createServer(function(req, res) {
    router.dispatch(req, res);
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/");
