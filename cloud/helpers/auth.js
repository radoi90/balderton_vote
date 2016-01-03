var _ = require('underscore');

exports.authenticate = function(req, res, next) {
	var noAuthRequired = _.some(noAuthPaths, isBeginningOf(req.path));
	res.locals.current_user = undefined;
	
	if (Parse.User.current()) {
		return Parse.User.current().fetch().then(function(user) {
			res.locals.current_user = user;

			return next();
		});
	} else if (noAuthRequired) { 
		return next();
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

var noAuthPaths = ['/login', '/signup', '/claim', '/fast-voting', '/click/vote'];

function isBeginningOf(longerString) {
	var string = longerString;
	return function(prefix) {
		return string.slice(0, prefix.length) == prefix;
	}
}