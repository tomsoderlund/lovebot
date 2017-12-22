'use strict';

const mongooseCrudify = require('mongoose-crudify');

const User = require('../models/user');

const searchUsers = function (req, res, next) {
	let query = {};
	// Gender
	if (req.query.gender) {
		query.gender = req.query.gender;
		if (req.query.gender === 'other') query.gender = null;
	}
	// City
	if (req.query.city) {
		query.locationDetails = { city: req.query.city };
		if (req.query.city === 'all') query.locationDetails = null;
	}
	console.log(`query`, query);
	User.find(query, (err, result) => {
		req.crudify = { err, result };
		next(err);
	});
};

// Since DELETE doesn't return the _id of deleted item by default
const addIdToDeleteResults = function (req, res, next) {
	return res.json(req.crudify.err || (req.method === 'DELETE' ? req.params : req.crudify.result));
};

module.exports = function (server, router) {

	// Docs: https://github.com/ryo718/mongoose-crudify
	server.use(
		'/api/users',
		mongooseCrudify({
			Model: User,
			endResponseInAction: false,
			actions: {
				list: searchUsers,
			},
			afterActions: [
				{ middlewares: [addIdToDeleteResults] },
			],
		})
	);

};