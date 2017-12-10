const _ = require('lodash');
const async = require('async');

const twitHelper = require('./twitHelper');
const helpers = require('./helpers');

const database = require('./database');
const User = require('./models/user');

const addProspectUser = function (user) {
	const formatUser = user => `${user.name} (@${user.screen_name})`;
	const userData = _.merge(
		{},
		_.pick(user, ['name', 'location', 'description']),
		{
			twitterHandle: user.screen_name,
			websiteUrl: user.url,
		}
	);
	console.log('addProspectUser', userData);
	User.create(userData, (err, newUser) => {
		console.log('x', _.get(err, 'code'), newUser);
	});
};

const searchTwitterMessages = function () {
	const keyword = '#sthlmtech';
	twitHelper.searchTweets(keyword, {}, (err, tweets) => {
		//console.log(JSON.stringify(tweets, null, 2));
		tweets.forEach(tweet => {
			//console.log(`${tweet.text}\n`)
			addProspectUser(tweet.user);
			_.applyToAll(addProspectUser, _.get(tweet, 'entities.user_mentions'));
		});
	})	
};

const checkUsersWithMissingInfo = function () {
	console.log('checkUsersWithMissingInfo');
	var sortOptions = { 'imageUrl': 1 };
	var limit = 10;
	User.find({})
		.sort(sortOptions)
		.limit(limit)
		.exec()
		.then(function (findErr, users) {
			console.log('xx', findErr, users);
		})
		.catch(function (findErr, users) {
			console.log('xx', findErr, users);
		});
	/*
	*/
	// twitHelper.getUser('tomsoderlund', (err, user) => {
	// 	console.log('us', err, JSON.stringify(user, null, 4));
	// })
};

twitHelper.init();
database.open();
searchTwitterMessages();
//checkUsersWithMissingInfo();
