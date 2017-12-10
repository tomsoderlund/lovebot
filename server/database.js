//
// Name:    database.js
// Purpose: Library for database functions
// Creator: Tom Söderlund
//

'use strict';

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/lovebot'

// Private functions

const openDatabase = function () {
	mongoose.connect(MONGODB_URI);
	var db = mongoose.connection;
	db.on('error', function () {
		throw new Error('unable to connect to database at ' + MONGODB_URI);
	});
};

const closeDatabase = function () {
	mongoose.connection.close();
};

// Public API

module.exports = {

	open: openDatabase,
	close: closeDatabase,

};
