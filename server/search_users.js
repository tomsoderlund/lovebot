const _ = require('lodash');
const async = require('async');
const twitHelper = require('./twitHelper');
const helpers = require('./helpers');


const addProspectUser = function (user) {
	const formatUser = user => `${user.name} (@${user.screen_name})`;
	console.log('addProspectUser', formatUser(user));
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
}

twitHelper.init();
searchTwitterMessages();