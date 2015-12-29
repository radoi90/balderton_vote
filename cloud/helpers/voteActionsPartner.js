var Company = Parse.Object.extend('Company');

// Set the mark for a specified Vote.
exports.vote = function (mark, opts) {
	return getVote(opts).then(function(partnerVote) {
		if (partnerVote) { 
			return setMark(mark, partnerVote);
		}
	});
};

// Get a partner Vote specified by the provided options.
function getVote(opts) {
	if (opts.voteId) {
		var query = new Parse.Query('Vote')
		.include('company');

		return query.get(opts.voteId);
	} else if (opts.partnerId && opts.companyId) {
		return getPartnerVote(opts.partnerId, opts.companyId);
	}

	return Parse.Promise.as();
}

// Get the Vote Object specified by a partnerId, companyId pair.
function getPartnerVote(partnerId, companyId) {
	var partner = new Parse.User();
	partner.id = partnerId;
	var company = new Company();
	company.id = companyId;

	var query = new Parse.Query('Vote')
	.equalTo('partner', partner)
	.equalTo('company', company)
	.include('company');
	
	return query.first();
};

// If voting is still open saves a new mark for a specified artner Vote.
function setMark(mark, vote) {
	if (!vote.get('company').get('isVotingOpen')) { return };

	// Cancel the vote if the mark is not a number
	if (isNaN(mark)) {
		vote.unset('mark');
	} else {
		vote.set('mark', mark);
	}
	return vote.save();
}