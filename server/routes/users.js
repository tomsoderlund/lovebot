'use strict';

const mongooseCrudify = require('mongoose-crudify');

const User = require('../models/user');

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
			afterActions: [
				{ middlewares: [addIdToDeleteResults] },
			],
		})
	);

};