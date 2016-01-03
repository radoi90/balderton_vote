var _ = require('underscore');

// Signs up a new user with the specified paramaters.
exports.signup = function(req, res) {
	var user = new Parse.User();
	user.set(_.pick(req.body, userParams));
	user.set('username', user.get('email'));
	user.set('isClaimed', true);

	user.signUp(null).then(function() {
		res.redirect('/');
	},
	function(error){
		res.redirect('/signup');
	});
};

// Logs in a user with the specified credentials.
exports.login = function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	Parse.User.logIn(email, password).then(function() {
		var redirUrl = req['query']['redir'] || '/';
		res.redirect(redirUrl);
	},
	function(error) {
		res.redirect(req['url'] || '/login');
	});
};

// Logs out the current user.
exports.logout = function(req, res) {
	Parse.User.logOut().then(function() {
		res.redirect('/login');
	},
	function(error) {
		res.redirect('/')
	});
};

// Shows a view for a user to set their own password
exports.claim = function(req, res) {
	var query = new Parse.Query(Parse.User);
	query.get(req.params.id).then(function(user) {
		res.render('session/claim', { user: user });
	},
	function() {
		res.send(500, 'No user found');
	})
}

// Sets a new password for a specified User and logs in the User
exports.setPassword = function(req, res) {
	Parse.Cloud.useMasterKey();
	var user = new Parse.User();
	user.id = req.params.id;
	user.set('password', req.body.password);
	user.set('isClaimed', true);
	var email = req.body.email;

	user.save().then(function(savedUser) {
		return Parse.User.logIn(email, user.get('password'));
	}).then(function() {
		res.redirect('/');
	},
	function(error) {
		res.send(error.code, error.message);
	});
}

var userParams = ['email', 'password', 'name'];