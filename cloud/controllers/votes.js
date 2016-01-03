var adminActions = require('cloud/helpers/voteActionsAdmin');
var partnerActions = require('cloud/helpers/voteActionsPartner');

// Updates a vote corresponding to the specified company id.
exports.update = function(req, res) {
	var companyId = req.params.id;

	adminActions.updateVote(companyId, req.body).then(function() {
		res.redirect('/');
	},
	function() {
		res.send(500, 'Failed to update vote');
	});
};

// Records a vote from a specified Partner for a specified Company.
exports.vote = function(req, res) {
	var opts = {
		partnerId: Parse.User.current().id,
		companyId: req.params.id
	};
	var mark = parseInt(req.body.mark);

	partnerActions.vote(mark, opts).then(function(){
		res.redirect('/');
	},
	function() {
		res.send(500, 'Failed submitting vote');
	});
};

// Update the Partners voting on a specified Company.
exports.updateVoters = function(req, res) {
	var companyId = req.params.id;
	var action = req.body.action;
	var partnerIds = req.body.partnerIds;

	adminActions.updateVoters(action, partnerIds, companyId).then(function() {
		res.redirect('/')
	},
	function(error) {
		res.send(500, 'Failed to update voters');
	});
};

// Register a vote from a link with voting query parameters.
exports.setFastVote = function(req, res) {
	var mark = parseInt(req.query.mark);
	var opts = { voteId: req.params.id };
	
	partnerActions.vote(mark, opts).then(function(vote) {
		var query = '';
		if (vote) {
			query = '?vote_id=' + vote.get('company').id;
			query += '&mark=' + vote.get('mark');
		}

		res.redirect('/fast-voting' + query);
	},
	function(error) {
		res.send(error.code, error.message);
	});
}

// Show result of a vote registered through a link with parameters.
exports.showFastVote = function(req, res) {
	if (req.query && req.query.vote_id && req.query.mark) {
		res.render('votes/fast_vote', {
			vote_id: req.query.vote_id,
			mark: req.query.mark
		});
	} else {
		res.send(500, 'Failed to displaying fast vote result.')
	}
}