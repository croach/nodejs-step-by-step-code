var http = require('http'),
    url  = require('url'),
    sys  = require('sys'),
    path = require('path'),
    fs   = require('fs'),
    mime = require('mime'),
    helpers = require('./helpers');
        
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
            if (err) helpers.render404(res);
            var type = mime.lookup(pathname);
            res.writeHead(200, {"Content-Type": type});
            res.end(data);
        });
    }
};

// Create our (in memory) data store 

var posts = (function() {
    var id = 0;
    return {
        db: {},
        add: function(obj) {
            obj.id = ++id;
            this.db[id] = obj;
        },
        update: function(id, obj) {
            obj.id = id;
            this.db[id] = obj;
        },
        remove: function(id) {
            delete this.db[id];
        },
        get: function(id) {
            return this.db[id];
        }
    };
})();

// Add our routes

// List all posts
router.get('^/posts/?$', function(req, res) {
    var options = {locals: {posts: posts.db}};
    helpers.renderHtml('post/list.jade', res, options);
});

// Show a specific post
router.get('^/posts/(\\d+)$', function(req, res, params) {
    var post = posts.get(params[0]);
    if (!post) helpers.render404(res); 
    var options = {locals: {post: post}};
    helpers.renderHtml('post/show.jade', res, options);
})

// Show the "New Post" form
router.get('^/posts/new/?$', function(req, res) {
    var options = {};
    helpers.renderHtml('post/new.jade', res, options);
});

// Add a new post
router.post('^/posts/?$', function(req, res) {
    helpers.parseBody(req, function(body) {
        var post = {
            title: body.title,
            content: body.content
        }
        posts.add(post);
        helpers.redirect('/posts', res);        
    });
});

// Delete the post
router.post('^/posts/(\\d+)/delete/?$', function(req, res, params) {
    var id = params[0];
    if (posts.get(id)) posts.remove(id);
    helpers.redirect('/posts/', res);
});

// Show the "Update Post" form
router.get('^/posts/(\\d+)/edit', function(req, res, params) {
    var post = posts.get(params[0]);
    if (!post) helpers.render404(res);
    var options = {locals: {post: post}};
    helpers.renderHtml('post/edit.jade', res, options);
});

// Update the post
router.post('^/posts/(\\d+)/edit', function(req, res, params) {
    var id = params[0];
    if (!posts.get(id)) helpers.render404(res);

    helpers.parseBody(req, function(body) {
        var post = {
            title: body.title,
            content: body.content
        };
        posts.update(id, post);
        helpers.redirect('/posts', res);        
    });
})

// Create the actual http server

var server = http.createServer(function(req, res) {
    router.dispatch(req, res);
}).listen(8000);
sys.puts("Server running at http://127.0.0.1:8000/");