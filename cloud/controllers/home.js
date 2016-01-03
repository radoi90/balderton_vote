var votinHelper = require('cloud/helpers/voteHelper.js');

// Display partner dashboard, with recent vote and company history.
exports.index = function(req, res) {
	Parse.Promise.when(votinHelper.findVote({}), findRecentCompanies(10))
	.then(function(vote, recentCompanies) {
		res.render('home/index', {
			vote: vote,
			companies: recentCompanies
		}); 
	},
	function(){
		res.send(500, 'Failed loading dashboard')
	});
};

// Find the last updated companies.
function findRecentCompanies(limit) {
	var query = new Parse.Query('Company')
	.descending('updatedAt')
	.limit(limit);
	
	return query.find();
};