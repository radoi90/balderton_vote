var Mandrill = require('cloud/libs/mandrill.js');
var ROOT_URL = "https://bdtvoteved.parseapp.com";

exports.sendPartnerInvite = function(user) {
	return Mandrill.sendTemplate('new-partner-invite', [], {
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
				content: ROOT_URL
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
	function() {
		console.log("Parner Invite email sent.");
	},
	function() {
		console.error("Something went wrong sending Partner Invite email.");
	});
};

exports.sendVoteInvite = function(vote) {
	return Mandrill.sendTemplate('new-vote', [], {
		subject: "You are invited to vote on " + vote.get('company').get('name'),
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
				content: ROOT_URL
			},
			{
				name: "COMPANY_NAME",
				content: vote.get('company').get('name')
			},
			{
				name: "DESCRIPTION",
				content: vote.get('company').get('description')
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
	}, false).then(
	function() {
		console.log("Parner Vote invite email sent.");
	},
	function() {
		console.error("Something went wrong sending Partner Vote invite email.");
	});
};

exports.sendVoteRevoke = function(vote) {
	return Mandrill.sendTemplate('revoke-vote', [], {
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
					content: ROOT_URL
				}
			]
		}, false).then(
		function() {
			console.log("Parner Vote revoke invite email sent.");
		},
		function() {
			console.error("Something went wrong sending Partner Vote revoke invite email.");
		});
};
exports.sendVoteResult = function(company, vote) {
	var subject = company.get('name') + ' has ' + 
			(company.get('passed') ? 'passed' : 'failed') + ' the vote';
	console.log(subject);

	return Mandrill.sendTemplate('vote-result', [], {
		subject: subject,
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
				content: ROOT_URL
			},
			{
				name: "COMPANY_NAME",
				content: company.get('name')
			},
			{
				name: "PASSED",
				content: company.get('passed')
			},
			{
				name: "RESULT",
				content: company.get('result')
			}
		],
		merge_vars: [
			{
				rcpt: vote.get('partner').get('email'),
				vars: [
					{
						name: "MARK",
						content: vote.get('mark')
					},
					{
						name: "VOTE_ID",
						content: company.id
					}
				]
			}
		]
	}, false);
};