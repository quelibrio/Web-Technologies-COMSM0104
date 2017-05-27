// import other javascript/package
//var htutil = require("./htutil");
var express = require("express");
//var session = require('express-session');
//var sessionstore = require('sessionstore');
//var path = require('path');
//var favicon = require('serve-favicon');
//var body = require('body-parser');

// Start the server: change the port to the default 80, if there are 
// no privilege issues and port number 80 isn't already in use.
var app = express();
var fs = require("fs");
var engines = require('consolidate');



//var index = require('./routes/admin');
//var users = require('./routes/users');
var OK = 200, NotFound = 404, BadType = 415, Error = 500;
var types,banned;
start(8080)

// Start the http service. Accept only requests from localhost, 
// for security.
function start(port) {
	types = defineTypes();
	banned = [];
	banUpperCase("../public/","");
	app.use(lower);
	app.use(ban);
	app.use(auth);
	//app.use('/create.html',auth);
	//app.use('/user.html',auth);
	//app.use('/offer.html',auth);
	//app.use('/users',users);
	//app.use(favicon());
	app.use(express.Router());

	// Display user-friendly error
	//app.use(express.errorHandler({dumpExpections: true, showStack: true}));

	var options = {setHeaders: deliverXHTML };
	app.use(express.static("../public",options));
	app.engine('html', engines.mustache);
	app.set('view engine', 'html');
	app.listen(port, "localhost");
	var address = "http://localhost";
	if (port != 80) address = address + ":" + port;
	console.log("Server running at", address);
}

// Make the URL lower case.
function lower(req, res, next) {
    req.url = req.url.toLowerCase();
    next();
}

// Forbid access to the URLs in the banned list.
function ban(req, res, next) {
    for (var i=0; i<banned.length; i++) {
        var b = banned[i];
        if (req.url.startsWith(b)) {
            res.status(404).send("Filename not lower case");
            return;
        }
    }
    next();
}

// Redirect to login
function auth(req, res, next) {
	// judge if there is an auth
	next();
}

function login(req, res, next){
		/* TO-DO
		login modal visible:on;
		aria-hidden="false"
	*/
	var params = req.body; //JSON file
}


// Called by express.static.  Deliver response as XHTML.
function deliverXHTML(res, path, stat) {
    if (path.endsWith(".html")) {
        res.header("Content-Type","application/xhtml+xml");
    }
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(root, folder) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(root + folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) banned.push(file.toLowerCase());
        var mode = fs.statSync(root + file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(root, file);
    }
}

// The most common standard file extensions are supported, and html is
// delivered as xhtml ("application/xhtml+xml").  Some common non-standard file
// extensions are explicitly excluded.  This table is defined using a function
// rather than just a global variable, because otherwise the table would have
// to appear before calling start().  NOTE: for a more complete list, install
// the mime module and adapt the list it provides.
function defineTypes() {
    var types = {
        html : "application/xhtml+xml",
	//html : "text/html",
        css  : "text/css",
        js   : "application/javascript",
        png  : "image/png",
        gif  : "image/gif",    // for images copied unchanged
        jpeg : "image/jpeg",   // for images copied unchanged
        jpg  : "image/jpeg",   // for images copied unchanged
        svg  : "image/svg+xml",
		swf  : "application/x-shockwave-flash",
        json : "application/json",
        pdf  : "application/pdf",
        txt  : "text/plain",
        ttf  : "application/x-font-ttf",
        woff : "application/font-woff",
        aac  : "audio/aac",
		wav  : "audio/x-wav",  
		wma  : "audio/x-ms-wma",  
		wmv  : "video/x-ms-wmv",
        mp3  : "audio/mpeg",
        mp4  : "video/mp4",
        webm : "video/webm",
        ico  : "image/x-icon", // just for favicon.ico
        xhtml: undefined,      // non-standard, use .html
        htm  : undefined,      // non-standard, use .html
        rar  : undefined,      // non-standard, platform dependent, use .zip
        doc  : undefined,      // non-standard, platform dependent, use .pdf
        docx : undefined,      // non-standard, platform dependent, use .pdf
    }
    return types;
}

// Router
app.get("/", function(req,res){
	console.log("Open the homepage");
	res.render("admin.html",{title: "CookBook"});
});
/*
app.post("/search", function(req,res){
	console.log("search recipes");
	res.redirect("search.html",{
		//TO-DO: request data from database and deliver to search.html
		req:req});
}); //https://www.oschina.net/code/snippet_1242866_34689


app.get("/recipe",htutil.loadParams, function(req,res){
	//TO-DO: request recipe data from database and deliver to recipe.html
});
app.get("/aboutus",htutil.loadParams, function(req,res){
	console.log("Open aboutus.html");
	res.render("aboutus.html",{title:"Aboutus"});
});
app.get("/user",htutil.loadParams, function(req,res){
	//TO-DO: request user data from database and deliver to user.html
});
app.get("/offer",htutil.loadParams, function(req,res){
	//TO-DO: request offer data from database and deliver to offer.html
});
app.get("/create",htutil.loadParams, function(req,res){
	consolu.log("Open create.html");
	res.render("create.html",{title:"Create"});
	//TO-DO: store data from create.html and 
});
*/










