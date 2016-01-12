require('cloud/app.js');
var mailer = require('cloud/helpers/mailerHelper.js');
var Company = Parse.Object.extend('Company');

Parse.Cloud.beforeSave('Company', function(req, res) {
	var company = req.object;

	// Set default values for new Companies
	if (!company.id) {
		company.set('isVotingOpen', true);
		company.set('hasResult', false);
	}

	// Check parameter requirements for Companies
	if (company.get("name").length < 1) {
		res.error(500, "Company name is required");
		return;
	}

	res.success();
});

Parse.Cloud.define('sendVoteResult', function(req, res) {
	var company = new Company();
	company.set(req.params);
	
	// Get all partners that voted on this company, email them the result
	var query = new Parse.Query('Vote');
	query.equalTo('company', company);
	query.include('partner');

	query.each(function(vote) {
		return mailer.sendVoteResult(company, vote);
	}).then(
		function() { res.success('Succesfully sent vote result emails'); },
		function() { res.error('An error has occured sending result emails') }
	);
});

Parse.Cloud.afterDelete('Company', function(req) {
	// Cascade delete votes associated with the deleted Company
	var company = req.object;
	var query = new Parse.Query('Vote')
	.equalTo('company', company);
	
	query.find().then(function(votes) {
		return Parse.Object.destroyAll(votes);
	}).fail(function() {
		console.error("Error deleting related votes");
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

Parse.Cloud.afterSave(Parse.User, function(req) {
	var user = req.object;
	// Parse.Object.existed() bug workaround
	var createdAt = user.get('createdAt');
	var updatedAt = user.get('updatedAt');
	var existed = (createdAt.getTime() != updatedAt.getTime());

	// Send welcome email when Admin creates an account
	if (!existed && !user.get('isClaimed')) {
		mailer.sendPartnerInvite(user);
	}
});

Parse.Cloud.afterSave('Vote', function(req) {
	var vote = req.object;
	// Parse.Object.existed() bug workaround
	var createdAt = vote.get('createdAt');
	var updatedAt = vote.get('updatedAt');
	var existed = (createdAt.getTime() != updatedAt.getTime());

	// Send invite email when Admin creates a vote
	if (!existed) {
		var query = new Parse.Query('Vote');
		query.include('partner');
		query.include('company');

		query.get(vote.id).then(function(vote) {
			mailer.sendVoteInvite(vote); 
		});
	}
});

Parse.Cloud.afterDelete('Vote', function(req) {
	var vote = req.object;

	// Send invite email when Admin revokes a vote invitation
	var query = new Parse.Query(Parse.User);
	query.get(vote.get('partner').id).then(function(user) {
		vote.set('partner', user);
		mailer.sendVoteRevoke(vote);
	});
});