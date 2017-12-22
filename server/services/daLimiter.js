//
// Name:    daLimiter.js
// Purpose: Rate limiting library
// Creator: Tom Söderlund
//

'use strict';

const _ = require('lodash');

// Private functions

let memo = {};

const canRunFunction = function (memoKey, options) {
	if (_.has(memo, `${memoKey}.timeLastRun`) && (Date.now() - _.get(memo, `${memoKey}.timeLastRun`) < options.time)) {
		// Fail: too soon!
		return false;
	}
	else {
		_.set(memo, `${memoKey}.timeLastRun`, Date.now());
		return true;
	}
}

const limit = function (fn, options) {
	return function () {
		const memoKey = fn.name + (options.useFirstArgumentInKey ? '_'+arguments[0].toString() : '');
		const cbError = arguments.length && typeof(arguments[arguments.length-1]) === 'function' ? arguments[arguments.length-1] : undefined;
		if (canRunFunction(memoKey, options)) {
			fn.apply(undefined, arguments);
		}
		else {
			console.log('daLimiter fail:', memoKey);
			if (cbError) cbError('Limited by daLimiter');
		}
	}
};

// Public API

module.exports = {

	// daLimiter.limit(myFunction.bind(this, param1), cbError, { time: 1000, useFirstArgumentInKey })
	limit: limit,

};
