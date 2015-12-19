var _ = require('underscore');
var Company = Parse.Object.extend('Company');
var Voter = Parse.Object.extend('Voter');
var User = Parse.Object.extend('User');

// Display all companies.
exports.index = function(req, res) {
	var query = new Parse.Query(Company);
	query.descending('createdAt');
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
}

// Create a new company with the specified name
exports.create = function(req, res) {
	var query = new Parse.Query(Company);
	query.equalTo('isVotingOpen', true);

	var company = new Company();
	company.set('isVotingOpen', true);
	company.save(_.pick(req.body, company_params)).then(function() {
		res.redirect('/companies');
	},
	function() {
		res.send(500, 'Failed saving company');
	});
};


// Show a given company based on specified id.
exports.show = function(req, res) {
	var companyQuery = new Parse.Query(Company);
	var foundCompany;
	companyQuery.get(req.params.id).then(function(company) {
		if (company) {
			foundCompany = company;
			var voterQuery = new Parse.Query(Voter);
			voterQuery.equalTo('company', company);
			voterQuery.include('partner');
			return voterQuery.find();
		} else {
			return [];
		}
	}).then(function(voters) {
		res.render('companies/show', {
			company: foundCompany,
			voters: voters
		});
	},
	function() {
		res.send(500, 'Failed finding the specified company to show');
	});
};

// Display a form for editing a specified company
exports.edit = function(req, res) {
	var query = new Parse.Query(Company);
	query.get(req.params.id).then(function(company) {
		if (company) {
			res.render('companies/edit', {
				company: company
			})
		} else {
			res.send('specified company does not exist');
		}
	},
	function() {
		res.send(500, 'Failed finding company to edit');
	});
};

// Update a company based on specified id, name.
exports.update = function(req, res) {
	var company = new Company();
	company.id = req.params.id;
	company.save(_.pick(req.body, company_params)).then(function() {
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

	var query = new Parse.Query(Voter);
	query.equalTo("company", company);
	query.find().then(function(results) {
		results.push(company);
		return Parse.Object.destroyAll(results);
	}).then(function() {
		res.redirect('/companies')
	}, function() {
		res.send(500, 'Failed deleting company')
	});
};

var company_params = ['name'];