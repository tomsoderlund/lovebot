const _ = require('lodash');
const async = require('async');

const twitHelper = require('./services/twitHelper');
const helpers = require('./services/helpers');
const nameLookup = require('./services/nameLookup');

const database = require('./services/database');
const User = require('./models/user');

const updateUserFromTwitter = function (twitterUser, cb) {

	const getBiggerImage = imgUrl => typeof(imgUrl) === 'string' ? imgUrl.replace('_normal', '_bigger') : imgUrl;

	const userData = _.merge(
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
	User.findOne({ twitterHandle: twitterUser.screen_name }, (err, foundUser) => {
		if (foundUser) {
			// Update existing
			foundUser.imageUrl = foundUser.imageUrl || userData.imageUrl;
			if (_.isEmpty(foundUser.websiteUrl) || _.includes(foundUser.websiteUrl, 't.co')) foundUser.websiteUrl = userData.websiteUrl;
			foundUser.save(cb);
		}
		else {
			// Create new
	console.log('NEW', twitterUser.screen_name);
			User.create(userData, (err, newUser) => {
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
			return [_.get(tweet, 'user'), ..._.get(tweet, 'entities.user_mentions')];
		}).flatten().uniq().compact().value();
		console.log('findUsersInTweets', userArray.length);
		async.each(userArray, updateUserFromTwitter, cb);
	}
};

const searchTwitterMessages = function (cb) {
	const keyword = '#sthlmtech';
	twitHelper.searchTweets(keyword, {}, (err, tweets) => {
		findUsersInTweets(tweets, cb);
	});
};

const updateUserTwitterDetails = function (dbUser, cb) {
	twitHelper.getUser(dbUser.twitterHandle, (err, twitterUser) => {
		console.log('lookup', dbUser.twitterHandle);
		async.series([
			updateUserFromTwitter.bind(undefined, twitterUser),
			// Scan their last tweet too
			findUsersInTweets.bind(undefined, [twitterUser.status]),
		],
		cb);
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
	//searchTwitterMessages,
	//checkUsersWithMissingInfo,
	checkUsersWithMissingGender,
	database.close,
]);
