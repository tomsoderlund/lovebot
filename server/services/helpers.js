//
// Name:    helpers.js
// Purpose: Library for helper functions
// Creator: Tom Söderlund
//

'use strict';

const _ = require('lodash');

// Private functions

// Public API

// applyToAll(func, obj1) or applyToAll(func, [obj1, obj2, ...])
module.exports.applyToAll = (func, objectOrArray) => objectOrArray.constructor === Array ? _.map(objectOrArray, func) : func(objectOrArray);
_.mixin({ 'applyToAll': module.exports.applyToAll });
