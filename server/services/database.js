//
// Name:    database.js
// Purpose: Library for database functions
// Creator: Tom Söderlund
//

'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/lovebot'

// Private functions

const openDatabase = function (cb) {
	mongoose.connect(MONGODB_URI, { useMongoClient: true });
	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'Database error:'));
	if (cb) cb();
};

const closeDatabase = function (cb) {
	mongoose.connection.close();
	if (cb) cb();
};

// Public API

module.exports = {

	open: openDatabase,
	close: closeDatabase,

};
