'use strict';

const mongooseCrudify = require('mongoose-crudify');

const helpers = require('../services/helpers');
const twitHelper = require('../services/twitHelper');

const User = require('../models/user');

const searchUsers = function (req, res, next) {
	let filter = {};
	// Username
	if (req.query.username) {
		filter.username = req.query.username;
	}
	// Gender
	if (req.query.gender) {
		filter.gender = req.query.gender;
		if (req.query.gender === 'other') filter.gender = null;
	}
	// City
	if (req.query.city) {
		filter.locationDetails = { city: req.query.city };
		if (req.query.city === 'all') filter.locationDetails = null;
	}
	const sort = '-dateCreated';
	const limit = 100;
	console.log(`filter: ${filter}`, filter);
	User.find(filter).sort(sort).limit(limit).exec((err, result) => {
		req.crudify = { err, result };
		next(err);
	});
};

twitHelper.init();

const getOrFetchTwitterUser = function (req, res, next) {
	const sendErrorNotFound = () => res.status(404).send('Username not found');
	if (!req.params.username) return sendErrorNotFound();
	const filter = { twitterHandle: { $regex: new RegExp(req.params.username, 'i') } };
	User.findOne(filter, (err, foundUser) => {
		if (foundUser) {
			// Found
			res.json(foundUser);
		}
		else {
			// Find on Twitter and create new
			twitHelper.getUser(req.params.username, (err, twitterUser) => {
				if (err) {
					console.log(`twitHelper.getUser`, err);
					sendErrorNotFound();
				}
				else {
					const newUserData = helpers.convertTwitterUserToDbUser(twitterUser);
					User.create(newUserData, (err, createdUser) => {
						res.json(createdUser);
					});
				}
			});
		}
	});
};

// Since DELETE doesn't return the _id of deleted item by default
const addIdToDeleteResults = function (req, res, next) {
	return res.json(req.crudify.err || (req.method === 'DELETE' ? req.params : req.crudify.result));
};

module.exports = function (server) {

	server.get('/api/usernames/:username', getOrFetchTwitterUser);

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