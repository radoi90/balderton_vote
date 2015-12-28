var _ = require('underscore');

// Signs up a new user with the specified paramaters.
exports.signup = function(req, res) {
	var user = new Parse.User();
	user.set(_.pick(req.body, userParams));
	user.set('username', user.get('email'));

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
	if (Parse.User.current()) {
		Parse.User.logOut().then(function() {
			res.redirect('/login');
		},
		function(error) {
			res.redirect('/')
		});
	}
};

var userParams = ['email', 'password', 'name'];