var express = require('express');
var moment = require('moment');
var _ = require('underscore');

// Channel traffic through https
var parseExpressHttpsRedirect = require('parse-express-https-redirect');

// Use Parse for authentication
var parseExpressCookieSession = require('parse-express-cookie-session');
var auth = require('cloud/helpers/auth.js');

// Controller code in separate files.
var sessionController = require('cloud/controllers/session.js');
var homeController = require('cloud/controllers/home.js');
var companiesController = require('cloud/controllers/companies.js');
var partnersController = require('cloud/controllers/partners.js');
var votingController = require('cloud/controllers/votes.js');

// Required for initializing Express app in Cloud Code.
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(parseExpressHttpsRedirect());
app.use(express.cookieParser('Unst@bleCapital'));
app.use(parseExpressCookieSession({ cookie: { maxAge: 604800000 } }));
app.use(auth.authenticate);

app.locals._ = _;
app.locals.formatTime = function(time) {
  return moment(time).format('DD/MM/YY, HH:mm');
};

// App routing section

// Session managament
app.get('/login', function(req, res) {
	res.render('session/login', {
		url: req["url"]
	});
});
app.post('/login', sessionController.login);
app.get('/signup', function(req, res) { res.render('session/signup'); });
app.post('/signup', sessionController.signup);
app.get('/logout', sessionController.logout);
app.get('/claim/:id', sessionController.claim);
app.put('/claim/:id', sessionController.setPassword)

// Show partner dashboard on homepage
app.get('/', homeController.index);

// RESTful routes for Companies
app.get('/companies', companiesController.index);
app.get('/companies/new', auth.adminOnly, companiesController.new);
app.post('/companies', auth.adminOnly, companiesController.create);
app.get('/companies/:id', companiesController.show);
app.get('/companies/:id/edit', auth.adminOnly, companiesController.edit);
app.put('/companies/:id', auth.adminOnly, companiesController.update);
app.del('/companies/:id', auth.adminOnly, companiesController.delete);

// RESTful routes for Partners
app.get('/partners', partnersController.index);
app.get('/partners/new', auth.adminOnly, partnersController.new);
app.post('/partners', auth.adminOnly, partnersController.create);
app.get('/partners/:id', partnersController.show);
app.get('/partners/:id/edit', auth.adminOnly, partnersController.edit);
app.put('/partners/:id', auth.adminOnly, partnersController.update);
app.del('/partners/:id', auth.adminOnly, partnersController.delete);

// RESTful for voting
app.get('/votes/:id', companiesController.show);
app.post('/votes/:id', auth.partnerOnly, votingController.vote);
app.put('/votes/:id', auth.adminOnly, votingController.update);
app.post('/votes/:id/voters', auth.adminOnly, votingController.updateVoters);

app.get('/click/vote', votingController.setFastVote);
app.get('/fast-voting', votingController.showFastVote);

// Required for initializing Express app in Cloud Code.
app.listen();