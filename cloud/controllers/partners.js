var _ = require('underscore');

// Display all partners.
exports.index = function(req, res) {
	var query =  new Parse.Query(Parse.User)
	.ascending('name')
	.equalTo('isOp', false)
	.equalTo('isArchived', false);

	query.find().then(function(results) {
		res.render('partners/index', {
			partners: results
		});
	},
	function() {
		res.send(500, 'Failed loading partners');
	});
};

// Display a form for creating a partner.
exports.new = function(req, res) {
	res.render('partners/new', {});
};

// Create a new partner with the specified name, email.
exports.create = function(req, res) {
	var partner = new Parse.User();
	partner.set(_.pick(req.body, partnerParams));
	// Parse requires a username and password
	var tempPassword = Math.random().toString(36).substr(5,15);
	partner.set('password', tempPassword);
	partner.set('username', partner.get('email'));
	
	partner.save().then(function(newPartner) {
		res.redirect('/partners/' + newPartner.id);
	},
	function(error) {
		res.send(error.code, error.message);
	});
};

// Show a given partner based on specified id.
exports.show = function(req, res) {
	var partnerQuery = new Parse.Query(Parse.User);
	var foundPartner;

	partnerQuery.get(req.params.id).then(function(partner) {
		if (partner) {
			foundPartner = partner;
			var votesQuery = new Parse.Query('Vote')
			.equalTo('partner', partner)
			.include('company');
			return votesQuery.find();
		}
	}).then(function(votes) {
		res.render('partners/show', {
			partner: foundPartner,
			votes: votes
		});
	}, function() {
		res.send(500, 'Failed finding the specified partner to show');
	});
};

// Display a form for editing a specified partner.
exports.edit = function(req, res) {
	var query = new Parse.Query(Parse.User);

	query.get(req.params.id).then(function(partner) {
		if (partner && !partner.get('isArchived')) {
			res.render('partners/edit', {
				partner: partner
			});
		} else {
			res.send(500, 'Specified partner does not exist');
		}
	},
	function() {
		res.send(500, 'Failed finding parnter to edit');
	});
};

// Update a partner based on specified parameters.
exports.update = function(req, res) {
	Parse.Cloud.useMasterKey();

	var partner = new Parse.User();
	partner.id = req.params.id;
	partner.set(_.pick(req.body, partnerParams));
	partner.set('username', partner.get('email'));
	
	partner.save().then(function() {
		res.redirect('/partners/' + partner.id);
	},
	function(error) {
		res.send(error);
	});
};

// Delete a partner corresponding to the specified id
exports.delete = function(req, res) {
	Parse.Cloud.useMasterKey();
	var partner = new Parse.User();
	partner.id = req.params.id;

	partner.save({isArchived: true}).then(function() {
		res.redirect('/partners');
	},
	function() {
		res.send(500, 'Failed archiving partner');
	});
};

var partnerParams = ['name', 'email'];