var http = require('http'),
    sys  = require('sys'),
    helpers = require('./helpers'),
    Router = require('./router').Router;
        
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
var router = new Router();

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