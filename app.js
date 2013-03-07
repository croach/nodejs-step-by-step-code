var http = require('http');
var url = require('url');
var fs = require('fs');
var qs = require('querystring');

var newPostFormHTML = fs.readFileSync('views/post/new.html');

function renderNewPostForm(request, response) {
    response.writeHead(200, {
        'Content-type': 'text/html; charset=utf-8'
    });
    response.end(newPostFormHTML);
}

function addNewPost(request, response) {
    parseBody(request, function(body) {
        console.log(body);
        var post = {
            title: body.title,
            content: body.content
        }
        console.log('Title: ' + post.title);
        console.log('Content: ' + post.content);
    })
    response.end();
}

// Utils
function render404(request, response) {
    response.writeHead(404);
    response.end('404 File not found');
}

function parseBody(request, callback) {
    var body = '';
    request.on('data', function(chunk) {
        body += chunk;
    });
    request.on('end', function() {
        callback(qs.parse(body));
    });
}

// Routes
var newPostFormRegex = new RegExp('^/posts/new/?$');
var newPostRegex = new RegExp('^/posts/?$');

// Server
var server = http.createServer(function(request, response) {
    var pathname = url.parse(request.url).pathname;
    if (newPostFormRegex.test(pathname)) {
	   renderNewPostForm(request, response);
    } else if (newPostRegex.test(pathname)) {
        addNewPost(request, response);
    } else {
	   render404(request, response);
    }
});

server.listen(8000);

console.log('Listening on http://127.0.0.1:8000');
