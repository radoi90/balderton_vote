var _ = require('underscore');

exports.signup = function(req, res) {
	var user = new Parse.User();
	user.set(_.pick(req.body, 'email', 'password', 'name'));
	user.set('username', req.body.email);
	user.set('isOp', false);

	user.signUp(null).then(function() {
		res.redirect('/');
	},
	function(error){
		res.redirect('/signup');
	});
};

exports.login = function(req, res) {
	var email = req.body.email;
	var password = req.body.password;
	Parse.User.logIn(email, password).then(function() {
		res.redirect('/');
	},
	function(error) {
		res.redirect('/login');
	});
};

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