var _ = require('underscore');

exports.authenticate = function(req, res, next) {
	var noAuthRequired = _.contains(['/login', '/signup'], req.path);
	res.locals.current_user = undefined;
	
	if (noAuthRequired) { 
		return next();
	} else if (Parse.User.current()) { 
		return Parse.User.current().fetch().then(function(user) {
			res.locals.current_user = user;

			return next();
		});
	}

	res.redirect('/login?redir=' + req.path);
};

exports.adminOnly = function(req, res, next) {
	if (Parse.User.current().get('isOp')) {
		return next();
	}

	res.status(404).send('Not Found');
};

exports.partnerOnly = function(req, res, next) {
	if (!Parse.User.current().get('isOp')) {
		return next();
	}

	res.status(404).send('Not Found');
}