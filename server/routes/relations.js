'use strict';

const mongooseCrudify = require('mongoose-crudify');
const helpers = require('../services/helpers');
const Relation = require('../models/relation');

// Just an array of toUser IDs
const getRelationIds = function (req, res, next) {
	const filter = { fromUser: req.params.userId };
	const limit = 1000;
	Relation.find(filter).limit(limit).exec((err, result) => {
		req.crudify = { err, result: result ? result.map(rel => rel.toUser) : [] };
		helpers.formatResponse(req, res, next);
	});
};

module.exports = function (server) {

	server.get('/api/relationIds/:userId', getRelationIds);

	server.use(
		'/api/relations',
		mongooseCrudify({
			Model: Relation,
			endResponseInAction: false,
			afterActions: [
				{ middlewares: [helpers.formatResponse] },
			],
		})
	);

};