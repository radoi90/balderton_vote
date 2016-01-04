var _ = require('underscore');
var Company = Parse.Object.extend('Company');
var Vote = Parse.Object.extend('Vote');

// Updates the status of a vote by opening/closing it or tallying it.
exports.updateVote = function (companyId, params) {
	switch(params.method) {
		case 'toggle':
			var isVotingOpen = params.isVotingOpen === 'true';
			
			return toggleVote(companyId, isVotingOpen);
		case 'tally':
			return tallyVote(companyId);
	}
};

// Adds or revokes vote invites on a specified Company, for specified Partner
exports.updateVoters = function (action, partnerIds, companyId){
	switch (action) {
		case 'invite': return invite(partnerIds, companyId);
		case 'revoke': return revoke(partnerIds, companyId);
	}
}

// Toggles the open vote state to isOpen for a vote specified by companyId.
function toggleVote(companyId, isOpen) {
	var query = new Parse.Query(Company);
	
	return query.get(companyId).then(function(company) {
		if (company) {
			company.unset('result');
			company.unset('passed');
			return company.save({ isVotingOpen: isOpen });
		}
	});
};

// Computes the outcome and closes vote for a vote specified by companyId.
function tallyVote(companyId) {
	var company;
	var query = new Parse.Query(Company);
	query.equalTo('objectId', companyId);
	query.equalTo('isVotingOpen', true);

	return query.first().then(function(foundCompany) {
		if (foundCompany) {
			company = foundCompany;
			return company.save({ isVotingOpen: false });
		}
	}).then(function () {
		return getVotes(company.id);
	}).then(function (votes) {
		if (votes) { return computeVoteOutcome(company, votes); }
	}).then(function () {
		return Parse.Cloud.run('sendVoteResult', company.toJSON());
	});
};

// Gets all votes for a Company specified by companyId.
function getVotes(companyId) {
	var company = new Company();
	company.id = companyId;

	var query = new Parse.Query(Vote);
	query.equalTo('company', company);

	return query.find();
};

// If all partners have voted, set the result and passed fields of the vote
function computeVoteOutcome(company, votes) {
	if (allPartnersVoted(votes)) {
		var result = computeVoteResult(votes);
		var passed = computeVotePassed(result, votes);

		return company.save({
			result: result,
			passed: passed
		});
	} else {
		var error = new Parse.Error(403,
			'Can not close vote until all partners vote');
		return Parse.Promise.error(error);
	}
};

// Checks if all partners set their marks
function allPartnersVoted(votes) {
	if (votes.length <= 0) { return false; }

	return !(_.any(votes, function(vote) {
		return !vote.has('mark');
	}));
}

// Computes overall vote result
function computeVoteResult(votes) {
	var markSum = _.reduce(votes, function(sum, vote) { 
		return sum + vote.get('mark'); }, 0)

	return  markSum / votes.length;
}

// Computes if vote passed
function computeVotePassed(result, votes) {
	var passingVotes = _.filter(votes, function(vote) {
		return vote.get('mark') >= 6;
	});
	return (passingVotes.length / votes.length) > 0.5;
}

// Invites Partners specified by partnerIds to vote on a Company
// specified by companyId.
function invite(partnerIds, companyId) {
	var company = new Company();
	company.id = companyId;
	
	var votes = _.map(partnerIds, function(partnerId) {
		var partner = new Parse.User();
		partner.id = partnerId;

		var vote = new Vote();
		vote.set('company', company);
		vote.set('partner', partner);
		return vote;
	});

	return Parse.Object.saveAll(votes);
};

// Revokes invitations for Partners specified by partnerIds to vote
// on a Company specified by companyId.
function revoke(partnerIds, companyId) {
	var company = new Company();
	company.id = companyId;

	var partnerQuery = new Parse.Query(Parse.User)
	.containedIn('objectId', partnerIds);

	var query = new Parse.Query(Vote)
	.equalTo('company', company)
	.matchesQuery('partner', partnerQuery);

	return query.find().then(function(votes) {
		return Parse.Object.destroyAll(votes);
	});
};