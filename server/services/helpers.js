//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict';

const _ = require('lodash');

const nameLookup = require('./nameLookup');

// Private functions

// Public API

// applyToAll(func, obj1) or applyToAll(func, [obj1, obj2, ...])
module.exports.applyToAll = (func, objectOrArray) => objectOrArray.constructor === Array ? _.map(objectOrArray, func) : func(objectOrArray);
_.mixin({ 'applyToAll': module.exports.applyToAll });

// Since DELETE doesn't return the _id of deleted item by default
module.exports.formatResponse = function (req, res, next) {
	if (req.crudify.err) console.error('formatResponse:', req.crudify.err);
	return res.json(req.crudify.err || (req.method === 'DELETE' ? req.params : req.crudify.result));
};

module.exports.convertTwitterUserToDbUser = twitterUser => {

	const getBiggerImage = imgUrl => typeof(imgUrl) === 'string' ? imgUrl.replace('_normal', '_bigger') : imgUrl;

	const dbUser = _.merge(
		{},
		_.pick(twitterUser, ['name', 'description']),
		nameLookup.lookup(twitterUser.name),
		{
			twitterHandle: twitterUser.screen_name,
			websiteUrl: _.get(twitterUser, 'entities.url.urls.0.expanded_url', twitterUser.url),
			imageUrl: getBiggerImage(twitterUser.profile_image_url_https),
			locationDetails: { original: twitterUser.location },
			dateUpdated: new Date(),
		}
	);
	return dbUser;
};
