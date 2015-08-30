var restify = require('restify');
var mysql = require('mysql');

var ip_addr = '127.0.0.1';
var port = process.env.PORT || 3001;

var server = restify.createServer({name:'scratch-api'});

server.use(restify.queryParser());
server.use(restify.bodyParser());
//server.use(restify.CORS());

process.env.RDS_HOSTNAME = process.env.RDS_HOSTNAME || "localhost";
process.env.RDS_USERNAME = process.env.RDS_USERNAME || "root";
process.env.RDS_PASSWORD = process.env.RDS_PASSWORD || "187000";
process.env.RDS_PORT = process.env.RDS_PORT || 3306;
var con = mysql.createConnection({
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: "scratch"
});
//console.log(process.env.RDS_HOSTNAME || "localhost");
console.log(process.env.RDS_HOSTNAME);
console.log(process.env.RDS_USERNAME);
console.log(process.env.RDS_PASSWORD);
console.log(process.env.RDS_PORT);

var users, posts;

con.connect(function(err){
    if(err){
        console.log('Error connecting to Db');
        return;
    }
    console.log('Connection established');

});

con.query('SELECT iduser, username, email, profile FROM users', function(err, rows) {
    users = rows;
});
con.query('SELECT * FROM posts ORDER BY posts.update_time DESC', function(err, rows) {
    posts = rows;

    posts.forEach(function(elem, index, self) {
       con.query('SELECT * FROM comments WHERE posts_idposts = ?', [elem.idposts], function(err, rows) {
           self[index].comments = rows;
       });
    });

});

//con.end(function(err) {
    // The connection is terminated gracefully
    // Ensures all previously enqueued queries are still
    // before sending a COM_QUIT packet to the MySQL server.
//});



var findAllUsers = function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin','*');

    //con.query('SELECT * FROM users', function(err, rows) {
    //    users = rows;
    //});


    if(users.length) {
        res.send(200 , users);
        return next();
    }else{
        return next(err);
    }
};

var findAllPosts = function(req, res, next){
    res.setHeader('Access-Control-Allow-Origin','*');


    if(posts.length) {
        res.send(200 , posts);
        return next();
    }else{
        return next(err);
    }
};

server.get({path : '/api/users' , version : '0.0.1'} , findAllUsers);
server.get({path : '/api/posts' , version : '0.0.1'} , findAllPosts);

//server.get({path : PATH +'/:jobId' , version : '0.0.1'} , findUser);
//server.post({path : PATH , version: '0.0.1'} ,postNewUser);
//server.del({path : PATH +'/:jobId' , version: '0.0.1'} ,deleteUser);

server.listen(port ,ip_addr, function(){
    console.log('%s listening at %s ', server.name , server.url);
});
