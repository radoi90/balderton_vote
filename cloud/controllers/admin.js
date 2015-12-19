var _ = require('underscore');
var Company = Parse.Object.extend('Company');

// Display voting history
exports.index = function(req, res) {
	// Find company with active vote if any
	var query = new Parse.Query(Company);
	query.equalTo('isVotingOpen', true);
	query.descending('createdAt');

	query.first().then(function(activeCompany) {
		// Get recent vote history
		var query = new Parse.Query(Company);
		query.descending('createdAt');
		query.limit(10);

		query.find().then(function(companies) {
			res.render('admin/index', {
				activeCompany: activeCompany,
				companies: companies
			});
		},
		function() {
			res.send(500, 'Failed loading companies.');
		});
	},
	function() {
		res.send(500, 'Failed loading active vote.');
	});
};