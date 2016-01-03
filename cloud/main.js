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

Parse.Cloud.afterSave(Parse.User, function(req) {
	var user = req.object;
	// Parse.Object.existed() bug workaround
	var createdAt = user.get('createdAt');
	var updatedAt = user.get('updatedAt');
	var existed = (createdAt.getTime() != updatedAt.getTime());

	// Send welcome email when Admin creates an account
	if (!existed && !user.get('isClaimed')) {
		Mandrill.sendTemplate('new-partner-invite', [], {
			to: [
				{
					email: user.get('email'),
					name: user.get('name'),
					type: "to"
				}
			],
			merge_language: "mailchimp",
			global_merge_vars: [
				{
					name: "ROOT_URL",
					content: "bdtvoteved.parseapp.com"
				}
			],
			merge_vars: [
				{
					rcpt: user.get('email'),
					vars: [
						{
							name: "USER_ID",
							content: user.id
						}
					]
				}
			]
		}, false).then(
		function(httpResponse) {
			console.log("Parner Invite email sent.");
		},
		function(httpResponse) {
			console.error("Something went wrong sending Partner Invite email.");
		});
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

		query.get(vote.id).then(function(vote){
			return Mandrill.sendTemplate('new-vote', [], {
				to: [
					{
						email: vote.get('partner').get('email'),
						name: vote.get('partner').get('name'),
						type: "to"
					}
				],
				merge_language: "mailchimp",
				global_merge_vars: [
					{
						name: "ROOT_URL",
						content: "bdtvoteved.parseapp.com"
					},
					{
						name: "COMPANY_NAME",
						content: vote.get('company').get('name')
					}
				],
				merge_vars: [
					{
						rcpt: vote.get('partner').get('email'),
						vars: [
							{
								name: "VOTE_ID",
								content: vote.id
							}
						]
					}
				]
			}, false);
		}).then(
		function(httpResponse) {
			console.log("Parner Vote invite email sent.");
		},
		function(httpResponse) {
			console.error("Something went wrong sending Partner Vote invite email.");
		});
	}
});