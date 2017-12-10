const _ = require('lodash');
const async = require('async');

const twitHelper = require('./services/twitHelper');
const helpers = require('./services/helpers');
const nameLookup = require('./services/nameLookup');

const database = require('./services/database');
const User = require('./models/user');

const removeAllUsers = function (cb) {
	User.remove({}, cb);
};

async.series([
	twitHelper.init.bind(undefined, undefined),
	database.open,
	removeAllUsers,
	database.close,
]);
