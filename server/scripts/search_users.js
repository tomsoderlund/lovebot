const _ = require('lodash');
const async = require('async');
const NodeGeocoder = require('node-geocoder');

const twitHelper = require('../services/twitHelper');
const helpers = require('../services/helpers');
const nameLookup = require('../services/nameLookup');

const database = require('../services/database');
const User = require('../models/user');


const saveTwitterUser = function (source, twitterUser, cb) {

	const newUserData = _.merge({}, helpers.convertTwitterUserToDbUser(twitterUser), { source });
	User.findOne({ twitterHandle: twitterUser.screen_name }, (err, foundUser) => {
		if (foundUser) {
			// Update existing
			foundUser.description = foundUser.description || newUserData.description;
			foundUser.imageUrl = foundUser.imageUrl || newUserData.imageUrl;
			foundUser.locationDetails = _.has(foundUser, 'locationDetails.original') ? foundUser.locationDetails : newUserData.locationDetails;
			foundUser.source = foundUser.source || newUserData.source;
			foundUser.showInSearch = true;
			if (_.isEmpty(foundUser.websiteUrl) || _.includes(foundUser.websiteUrl, 't.co')) foundUser.websiteUrl = newUserData.websiteUrl;
			foundUser.save(cb);
		}
		else {
			// Create new
			console.log(`New user: ${twitterUser.screen_name} (${source})`);
			User.create(newUserData, (err, newUser) => {
				updateUserTwitterDetails(newUser, cb);
			});
		}
	});
};

const findUsersInTweets = function (tweets, cb) {
	if (_.isEmpty(tweets)) {
		cb();
	}
	else {
		// Tweeting user
		const tweetingUserArray = _(tweets).map(tweet => _.isEmpty(tweet) ? [] : [_.get(tweet, 'user')]).flatten().uniq().compact().value();
		// Users being mentioned
		const mentionedUserArray = _(tweets).map(tweet => _.isEmpty(tweet) ? [] : [..._.get(tweet, 'entities.user_mentions')]).flatten().uniq().compact().value();
		console.log(`findUsersInTweets: ${tweetingUserArray.length} + ${mentionedUserArray.length}`);
		async.series([
			async.each.bind(undefined, tweetingUserArray, saveTwitterUser.bind(undefined, 'tweeted')),
			async.each.bind(undefined, mentionedUserArray, saveTwitterUser.bind(undefined, 'mentioned')),
			async.each.bind(undefined, tweetingUserArray, addUserFriends), // people that tweetingUser follows
			//async.each.bind(undefined, tweetingUserArray, addUserFollowers), // people following tweetingUser
		],
		cb);
	}
};

const addUserFollowers = function (twitterUser, cb) {
	console.log(`addUserFollowers ${twitterUser.screen_name}`);
	twitHelper.getFollowers(twitterUser.screen_name, {}, (err, users) => {
		!!err
			? cb()
			: async.each(users, saveTwitterUser.bind(undefined, 'follower'), cb);
	});
}

const addUserFriends = function (twitterUser, cb) {
	console.log(`addUserFriends ${twitterUser.screen_name}`);
	twitHelper.getFriends(twitterUser.screen_name, {}, (err, users) => {
		!!err
			? cb()
			: async.each(users, saveTwitterUser.bind(undefined, 'friend'), cb);
	});
}

const searchTwitterMessages = function (cb) {
	// TODO: multiple with async.each/map
	const keyword = '#sthlmtech';
	twitHelper.searchTweets(keyword, {}, (err, tweets) => {
		findUsersInTweets(tweets, cb);
	});
};

const updateUserTwitterDetails = function (dbUser, cb) {
	if (dbUser.twitterHandle) {
		console.log(`updateUserTwitterDetails: ${dbUser.twitterHandle}`);
		twitHelper.getUser(dbUser.twitterHandle, (err, twitterUser) => {
			if (twitterUser) {
				async.series([
					saveTwitterUser.bind(undefined, 'user_search', twitterUser),
					// Scan their last tweet too
					//findUsersInTweets.bind(undefined, [twitterUser.status]),
				],
				cb);
			}
			else {
				cb();
			}
		});
	}
	else {
		cb();
	}
};

const checkUsersWithMissingTwitterInfo = function (cb) {
	console.log('checkUsersWithMissingTwitterInfo');
	const filter = { $or: [{ imageUrl: { $exists: false } }, { description: { $exists: false } }, { locationDetails: {} }] };
	const sort = '-dateCreated';
	const limit = 30;
	User.find(filter).sort(sort).limit(limit).exec()
		.then(function (users) {
			async.each(users, updateUserTwitterDetails, cb);
		})
		.catch(errorHandler.bind(undefined, cb));
};

const errorHandler = function (cb, errObj) {
	console.error('Error:', errObj);
	cb();
};

const checkUsersWithMissingGender = function (cb) {
	console.log('checkUsersWithMissingGender');
	const filter = { isPerson: { $exists: false } };
	const sort = '-dateCreated';
	const limit = 100;
	User.find(filter).sort(sort).limit(limit).exec()
		.then(function (users) {
			async.each(users, (dbUser, cbUser) => {
				const nameInfo = nameLookup.lookup(dbUser.name) || { isPerson: false };
				console.log('  add gender:', dbUser.name, nameInfo );
				_.merge(dbUser, nameInfo);
				dbUser.save(cbUser);
			}, cb);
		})
		.catch(errorHandler.bind(undefined, cb));
};

const checkUsersWithMissingLocation = function (cb) {
	const options = {
		provider: 'google',
		apiKey: process.env.GOOGLE_MAPS_GEOCODING_API_KEY,
		formatter: null
	};
	const geocoder = NodeGeocoder(options);

	console.log('checkUsersWithMissingLocation');
	const filter = { locationDetails: { $exists: false }, location: { $exists: true, $ne: '' } };
	const sort = 'location';
	const limit = 10;
	User.find(filter).sort(sort).limit(limit).exec()
		.then(function (users) {
			async.each(users, (dbUser, cbUser) => {
				const locationStr = _.get(dbUser, '_doc.locationDetails.original', _.get(dbUser, '_doc.location'));
				const locationStrFix = locationStr.replace(/[\t?;:‘’“”"'`!@#$€%^&§°*<>()\[\]{}_\+=\/\|\\]/g,'');
				geocoder.geocode(locationStrFix, function(err, geoResult) {
					if (err) {
						console.log(`  Geocoding error: ${err}`);
						cbUser();
					}
					else {
						_.merge(dbUser, { locationDetails: _.pick(geoResult[0], ['city', 'countryCode', 'latitude', 'longitude']) });
						dbUser.locationDetails.found = _.isEmpty(geoResult) ? false : true;
						console.log(`  ${dbUser.name}: ${locationStrFix} (${locationStr})`, dbUser.locationDetails.found, dbUser.locationDetails.city, dbUser._id);
						dbUser.save(cbUser);
					}
				});
			}, cb);
		})
		.catch(errorHandler.bind(undefined, cb));
};

async.series([
	twitHelper.init.bind(undefined, undefined),
	database.open,

	searchTwitterMessages,
	checkUsersWithMissingTwitterInfo,
	checkUsersWithMissingGender,
	checkUsersWithMissingLocation,

	database.close,
]);
