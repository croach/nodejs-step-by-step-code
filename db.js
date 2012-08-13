function DB() {
    this.db = {};
}

var id = 0;

DB.prototype.add = function(obj) {
    obj.id = ++id;
    this.db[id] = obj;
};

DB.prototype.update = function(id, obj) {
    obj.id = id;
    this.db[id] = obj;
};

DB.prototype.remove = function(id) {
    delete this.db[id];
};

DB.prototype.get = function(id) {
    return this.db[id];
};

DB.prototype.posts = function() {
    var posts = [];
    for (var id in this.db) {
        posts.push(this.db[id]);
    }
    return posts.sort(function(a, b) { return a.id - b.id; });
};

module.exports = DB;
