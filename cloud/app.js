var express = require('express');
var _ = require('underscore');

// Force https traffic
var parseExpressHttpsRedirect = require('parse-express-https-redirect');

// Use Parse.User for User management
var parseExpressCookieSession = require('parse-express-cookie-session');

// Controller code in separate files.
var adminController = require('cloud/controllers/admin.js');


// Required for initializing Express app in Cloud Code.
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('Unst@bleCapital'));
app.use(parseExpressHttpsRedirect());
app.use(parseExpressCookieSession({ cookie: { maxAge: 3600000 } }));

app.locals._ = _;
var authenticate = function(req, res, next) {
	if (Parse.User.current()) {
		return next();
	}

	res.redirect('/login');
};


/**** ==== ROUTING ==== ****/

// User sessions
app.get('/login', function(req, res) {
	res.render('session/login');
});
app.post('/login', sessionController.login);
app.get('/signup', function(req, res) {
	res.render('session/signup');
});
app.post('/signup', sessionController.signup);
app.get('/logout', sessionController.logout);

// Show all posts on homepage
app.get('/', authenticate, adminController.index);


// Route for admin pages
app.get('/admin', adminController.index);

// Required for initializing Express app in Cloud Code.
app.listen();
