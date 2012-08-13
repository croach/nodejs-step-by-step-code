var http      = require('http'),
    util      = require('util'),
    httpUtils = require('./httpUtils'),
    Router    = require('./router').Router;

var blog = (function() {
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
        },
        posts: function() {
            var posts = [];
            for (var id in this.db) {
                posts.push(this.db[id]);
            }
            return posts.sort(function(a, b) { return a.id - b.id; });
        }
    };
})();
var router = new Router();

// Add our routes

// List all posts
router.get('^/posts/?$', function(req, res) {
    var options = {posts: blog.posts()};
    httpUtils.renderHtml('post/list.html', res, options);
});

// Show a specific post
router.get('^/posts/(\\d+)$', function(req, res, params) {
    var post = blog.get(params[0]);
    if (!post) httpUtils.render404(res);
    var options = {locals: {post: post}};
    httpUtils.renderHtml('post/show.html', res, options);
})

// Show the "New Post" form
router.get('^/posts/new/?$', function(req, res) {
    var options = {};
    httpUtils.renderHtml('post/new.html', res, options);
});

// Add a new post
router.post('^/posts/?$', function(req, res) {
    httpUtils.parseBody(req, function(body) {
        var post = {
            title: body.title,
            content: body.content
        }
        blog.add(post);
        httpUtils.redirect('/posts', res);
    });
});

// Delete the post
router.post('^/posts/(\\d+)/delete/?$', function(req, res, params) {
    var id = params[0];
    if (blog.get(id)) blog.remove(id);
    httpUtils.redirect('/posts/', res);
});

// Show the "Update Post" form
router.get('^/posts/(\\d+)/edit', function(req, res, params) {
    var post = blog.get(params[0]);
    if (!post) httpUtils.render404(res);
    var options = {locals: {post: post}};
    httpUtils.renderHtml('post/edit.html', res, options);
});

// Update the post
router.post('^/posts/(\\d+)/edit', function(req, res, params) {
    var id = params[0];
    if (!blog.get(id)) httpUtils.render404(res);

    httpUtils.parseBody(req, function(body) {
        var post = {
            title: body.title,
            content: body.content
        };
        blog.update(id, post);
        httpUtils.redirect('/posts', res);
    });
})

// Create the actual http server

var server = http.createServer(function(req, res) {
    router.dispatch(req, res);
}).listen(8000);
util.puts("Server running at http://127.0.0.1:8000/");
