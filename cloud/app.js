var express = require('express');
var _ = require('underscore');


// Controller code in separate files.
var adminController = require('cloud/controllers/admin.js');


// Required for initializing Express app in Cloud Code.
var app = express();

// Global app configuration section
app.set('views', 'cloud/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());
app.use(express.methodOverride());

app.locals._ = _;

/**** ==== ROUTING ==== ****/

// Show all posts on homepage
app.get('/', adminController.index);


// Route for admin pages
app.get('/admin', adminController.index);

// Required for initializing Express app in Cloud Code.
app.listen();