var _ = require('underscore');
var Company = Parse.Object.extend('Company');
var Vote = Parse.Object.extend('Vote');

// Find all information for a Vote specified by companyId
exports.findVote = function(companyId) {
	return Parse.Promise.when(findCompanyWithVotes(companyId), findPartners())
	.then(function(companyWithVotes, partners) {
		if (companyWithVotes) {
			_.extend(companyWithVotes, progressInfo(companyWithVotes));
			_.extend(companyWithVotes, voterInfo(companyWithVotes, partners));
			return Parse.Promise.as(companyWithVotes);
		}
	},
	function() {
		var error = new Parse.Error(500, 'Failed finding vote');
		return Parse.Promise.error(error);
	});
}

// Find the Company and its associated Partner Votes, for the specified
// companyId. If no companyId is provided find the Company with the most
// recent voting activity.
function findCompanyWithVotes(companyId) {
	var vote = {};

	return findCompany(companyId).then(function(company) {
		vote.company = company;
		if (company) { return findVotes(company.id) }
	}).then(function(votes) {
		vote.votes = votes;
		if (votes) { return Parse.Promise.as(vote); }
	});
};

// Find the company specified by companyId, if companyId is not provided
// find the Company with the most recent voting activity.
function findCompany(companyId) {
	if (companyId) {
		var query = new Parse.Query(Company);
		return query.get(id);
	} else {
		return findRecentVoteCompany();
	}
};

// Find the Company with the most recent voting activity.
function findRecentVoteCompany() {
	var query = new Parse.Query(Company)
	.equalTo('isVotingOpen', true)
	.descending('updatedAt');
	
	return query.first().then(function(company){
		if (company) {
			return Parse.Promise.as(company);
		}

		query.equalTo('isVotingOpen', false);
		return query.first();
	});
};

// Find the votes associated with a Company specified by companyId
function findVotes(companyId) {
	var company = new Company();
	company.id = companyId
	var query = new Parse.Query(Vote)
	.equalTo('company', company);

	return query.find();
};

// Find all Partners.
function findPartners() {
	var query = new Parse.Query(Parse.User);
	query.ascending('name');
	query.equalTo('isOp', false);
	
	return query.find();
};

// Computes progress metadata for a collection of Votes.
function progressInfo(companyWithVotes) {
	var votes = companyWithVotes.votes;
	var partnersLeftToVote = _.select(votes, function(vote) {
		return typeof vote.get('mark') === 'undefined';
	}).length;

	return { allPartnersVoted: partnersLeftToVote == 0,
		progress: votes.length > 0 ? 1 - (partnersLeftToVote/votes.length) : 0
	}
}

// Computes voter metadata for a collection of Votes and Partners pair.
function voterInfo(vote, partners) {
	_.forEach(partners, function(partner) {
		var partnerVote = _.find(vote.votes, function(aVote) { 
			return partner.id === aVote.get('partner').id;
		});

		partner.set('vote', partnerVote);
	});

	return {
		voters: _.select(partners, function(partner) {
			return typeof partner.get('vote') !== 'undefined';
		}),
		absents: _.select(partners, function(partner) { 
			return !partner.get('isArchived') &&
			(typeof partner.get('vote') === 'undefined');
		}) }
};