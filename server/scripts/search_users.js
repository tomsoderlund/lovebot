const _ = require('lodash');
const async = require('async');

const twitHelper = require('../services/twitHelper');
const helpers = require('../services/helpers');
const nameLookup = require('../services/nameLookup');

const database = require('../services/database');
const User = require('../models/user');

const convertTwitterUserToDbUser = twitterUser => {

	const getBiggerImage = imgUrl => typeof(imgUrl) === 'string' ? imgUrl.replace('_normal', '_bigger') : imgUrl;

	const dbUser = _.merge(
		{},
		_.pick(twitterUser, ['name', 'location', 'description']),
		nameLookup.lookup(twitterUser.name),
		{
			twitterHandle: twitterUser.screen_name,
			websiteUrl: _.get(twitterUser, 'entities.url.urls.0.expanded_url', twitterUser.url),
			imageUrl: getBiggerImage(twitterUser.profile_image_url_https),
			dateUpdated: new Date(),
		}
	);
	return dbUser;
}

const saveTwitterUser = function (twitterUser, cb) {

	const newUserData = convertTwitterUserToDbUser(twitterUser);
	User.findOne({ twitterHandle: twitterUser.screen_name }, (err, foundUser) => {
		if (foundUser) {
			// Update existing
			foundUser.imageUrl = foundUser.imageUrl || newUserData.imageUrl;
			if (_.isEmpty(foundUser.websiteUrl) || _.includes(foundUser.websiteUrl, 't.co')) foundUser.websiteUrl = newUserData.websiteUrl;
			foundUser.save(cb);
		}
		else {
			// Create new
	console.log('NEW', twitterUser.screen_name);
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
		const userArray = _(tweets).map(tweet => {
			// Tweeting user + users being mentioned
			return _.isEmpty(tweet) ? [] : [_.get(tweet, 'user'), ..._.get(tweet, 'entities.user_mentions')];
		}).flatten().uniq().compact().value();
		console.log('findUsersInTweets', userArray.length);
		async.series([
			async.each.bind(undefined, userArray, saveTwitterUser),
			//async.each.bind(undefined, userArray, addUserFollowers),
			// TODO: implement a cache limit first
		],
		cb);
	}
};

const addUserFollowers = function (twitterUser, cb) {
	console.log(`addUserFollowers ${twitterUser.screen_name}`);
	twitHelper.getFollowers(twitterUser.screen_name, {}, (err, users) => {
		err ? cb(err) : async.each(users, saveTwitterUser, cb);
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
	twitHelper.getUser(dbUser.twitterHandle, (err, twitterUser) => {
		console.log(`updateUserTwitterDetails: ${_.get(twitterUser, 'screen_name')}`);
		if (twitterUser) {
			async.series([
				saveTwitterUser.bind(undefined, twitterUser),
				// Scan their last tweet too
				findUsersInTweets.bind(undefined, [twitterUser.status]),
			],
			cb);			
		}
		else {
			cb();
		}
	});
};

const checkUsersWithMissingInfo = function (cb) {
	console.log('checkUsersWithMissingInfo');
	const sortOptions = { imageUrl: 1, dateUpdated: 1 };
	const limit = 30;
	User.find({}).sort(sortOptions).limit(limit).exec()
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
	const sortOptions = { gender: 1 };
	const limit = 50;
	User.find({}).sort(sortOptions).limit(limit).exec()
		.then(function (users) {
			async.each(users, (dbUser, cbUser) => {
				console.log('  add gender:', dbUser.name, _.get(nameLookup.lookup(dbUser.name), 'gender') );
				_.merge(dbUser, nameLookup.lookup(dbUser.name));
				dbUser.save(cbUser);
			}, cb);
		})
		.catch(errorHandler.bind(undefined, cb));
};


async.series([
	twitHelper.init.bind(undefined, undefined),
	database.open,

	searchTwitterMessages,
	checkUsersWithMissingInfo,
	checkUsersWithMissingGender,

	database.close,
]);
