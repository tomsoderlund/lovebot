'use strict';

const mongooseCrudify = require('mongoose-crudify');
const helpers = require('../services/helpers');
const Name = require('../models/name');

module.exports = function (server) {

	server.use(
		'/api/names',
		mongooseCrudify({
			Model: Name,
			endResponseInAction: false,
			afterActions: [
				{ middlewares: [helpers.formatResponse] },
			],
		})
	);

};