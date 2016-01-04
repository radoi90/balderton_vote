var _ = require('underscore');
var votingHelper = require('cloud/helpers/voteHelper.js');
var Company = Parse.Object.extend('Company');

// Display all companies.
exports.index = function(req, res) {
	var query = new Parse.Query(Company)
	.descending('updatedAt');

	query.find().then(function(results) {
		res.render('companies/index', {
			companies: results
		});
	},
	function() {
		res.send(500, 'Failed loading companies');
	});
};

// Display a form for creating a new company.
exports.new = function(req, res) {
	res.render('companies/new', {});
};

// Create a new company with the specified name.
exports.create = function(req, res) {
	var company = new Company();

	company.save(_.pick(req.body, companyParams)).then(function(newCompany) {
		res.redirect('/');
	},
	function() {
		res.send(500, 'Failed creating new company');
	});
};

// Show a given company based on specified id.
exports.show = function(req, res) {
	var companyId = req.params.id;

	votingHelper.findVote({companyId: companyId}).then(function(vote) {
		res.render('companies/show', {
			vote: vote
		}); 
	},
	function(){
		res.send(500, 'Failed finding the specified company to show');
	});
};

// Display a form for editing a specified company.
exports.edit = function(req, res) {
	var query = new Parse.Query(Company);

	query.get(req.params.id).then(function(company) {
		if (company) {
			res.render('companies/edit', {
				company: company
			})
		} else {
			res.send(500, 'specified company does not exist');
		}
	},
	function() {
		res.send(500, 'Failed finding company to edit');
	});
};

// Update a company based on specified parameters
exports.update = function(req, res) {
	var company = new Company();
	company.id = req.params.id;
	
	company.save(_.pick(req.body, companyParams)).then(function() {
		res.redirect('companies/' + company.id);
	},
	function() {
		res.send(500, 'Failed saving company');
	});
};

// Delete a company corresponding to the specified id.
exports.delete = function(req, res) {
	var company = new Company();
	company.id = req.params.id;

	company.destroy().then(function() {
		res.redirect('/companies')
	},
	function() {
		res.send(500, 'Failed deleting company');
	});
};

var companyParams = ['name', 'description'];