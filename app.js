var http = require('http'),
    url  = require('url'),
    sys  = require('sys'),
    path = require('path'),
    jade = require('jade'),
    fs   = require('fs'),
    mime = require('mime'),
    qs   = require('querystring');
    
var viewsDir = path.join(__dirname, "views");
var staticDir = path.join(__dirname, "public");
    
// Helper functions

function renderHtml(view, response, options) {
    jade.renderFile(path.join(viewsDir, view), options, function(err, html) {
        if (err) throw err;
        response.writeHead(200, {"Content-Type": "text/html"});
        response.end(html);
    });        
}

function render404(response) {
    response.writeHead(404);
    response.end("404 File not found");    
}

function redirect(url, response) {
    response.writeHead(302, {
        'Content-Type': 'text/html', 
        'Location': url
    });
    response.end();
}

function parseBody(req, callback) {
    var body = "";
    req.on('data', function(chunk) {
        body += chunk;
    });
    req.on('end', function() {
        callback(qs.parse(body));
    });
}

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
            if (err) render404(res);
            var type = mime.lookup(pathname);
            res.writeHead(200, {"Content-Type": type});
            res.end(data);
        });
    }
};

var posts = {};
var nextId = (function() {
    var id = 0;
    return function() {
        return ++id;
    }
})();

// Add our routes

// List all posts
router.get('^/posts/?$', function(req, res) {
    var options = {locals: {posts: posts}};
    renderHtml('post/list.jade', res, options);
});

// Show a specific post
router.get('^/posts/(\\d+)$', function(req, res, params) {
    var post = posts[params[0]];
    if (!post) render404(res); 
    var options = {locals: {post: post}};
    renderHtml('post/show.jade', res, options);
})

// Show the "New Post" form
router.get('^/posts/new/?$', function(req, res) {
    var options = {};
    renderHtml('post/new.jade', res, options);
});

// Add a new post
router.post('^/posts/?$', function(req, res) {
    parseBody(req, function(body) {
        var post = {
            id: nextId(), 
            title: body.title,
            content: body.content
        }
        posts[post.id] = post;
        redirect('/posts', res);        
    });
});

// Delete the post
router.post('^/posts/(\\d+)/delete/?$', function(req, res, params) {
    var id = params[0];
    if (posts[id]) delete posts[id];
    redirect('/posts/', res);
});

// Show the "Update Post" form
router.get('^/posts/(\\d+)/edit', function(req, res, params) {
    var post = posts[params[0]];
    if (!post) render404(res);
    var options = {locals: {post: post}};
    renderHtml('post/edit.jade', res, options);
});

// Update the post
router.post('^/posts/(\\d+)/edit', function(req, res, params) {
    var id = params[0];
    if (!posts[id]) render404(res);

    parseBody(req, function(body) {
        var post = {
            id: id,
            title: body.title,
            content: body.content
        };
        posts[id] = post; 
        redirect('/posts', res);        
    });
})

// Create the actual http server

var server = http.createServer(function(req, res) {
    router.dispatch(req, res);
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/");