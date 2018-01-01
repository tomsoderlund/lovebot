const _ = require('lodash');
const async = require('async');

const helpers = require('../services/helpers');

const database = require('../services/database');
const User = require('../models/user');

const hideAllUsers = function (cb) {
	console.log(`hideAllUsers`);
	cb();
};

async.series([
	database.open,

	hideAllUsers,

	database.close,
]);
