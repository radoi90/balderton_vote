require('cloud/app.js');
var Mandrill = require('cloud/libs/mandrill.js');

Parse.Cloud.beforeSave('Company', function(req, res) {
	var company = req.object;

	// Set default values for new Companies
	if (!company.id) {
		company.set('isVotingOpen', true);
	}

	// Check parameter requirements for Companies
	if (company.get("name").length < 1) {
		res.error(500, "Company name is required");
		return;
	}

	res.success();
});

Parse.Cloud.afterDelete('Company', function(req) {
	// Cascade delete votes associated with the deleted Company
	var company = req.object;
	var query = new Parse.Query('Vote')
	.equalTo('company', company);
	
	query.find().then(function(votes) {
		return Parse.Object.destroyAll(votes);
	}).fail(function(error) {
		console.error("Error deleting related votes " + error.code + ": " + error.message);
	});
});

Parse.Cloud.beforeSave(Parse.User, function(req, res) {
	var user = req.object;
	
	// Set default values for new Users
	if (!user.id) {
		user.set('isOp', false);
		user.set('isArchived', false);
	}

	// Check parameter requirements for Users
	if (user.get("name").length < 1) {
		res.error(500, "Partner name is required");
		return;
	}

	if (user.get("email").length < 1) {
		res.error(500, "Partner email is required");
		return;
	}

	res.success();
});