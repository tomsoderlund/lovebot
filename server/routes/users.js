'use strict';

const _ = require('lodash');
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
	if (req.query.city && req.query.city !== 'all') {
		// Handle multiple with / e.g. Sweden/Sverige
		filter['locationDetails.original'] = _.includes(req.query.city, '/')
			? { $or: req.query.city.split('/').map(str => new RegExp(str, 'ig')) }
			: new RegExp(req.query.city, 'ig');
	}
	const sort = '-dateCreated';
	const limit = 100;
	console.log(`searchUsers:`, filter);
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
				{ middlewares: [helpers.formatResponse] },
			],
		})
	);

};