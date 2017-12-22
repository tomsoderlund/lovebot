'use strict';

const _ = require('lodash');
const Twit = require('twit') // https://github.com/ttezel/twit
const daLimiter = require('./daLimiter');

let twitObj;
let configObject;

const DALIMITER_OPTIONS = { time: 10 * 1000, useFirstArgumentInKey: true }

/*

Config:

DEBUG_MODE
TWITTER_ACCESS_TOKEN
TWITTER_ACCESS_TOKEN_SECRET
TWITTER_CONSUMER_KEY
TWITTER_CONSUMER_SECRET
TWITTER_SCREEN_NAME
TWITTER_SEARCH_LIMIT

*/

const init = function (configObj, cbAfterInit) {
	configObject = configObj || process.env;
	if (!configObject.TWITTER_CONSUMER_KEY) {
		console.error('TwitHelper: Twitter settings not found in environment.');
		if (cbAfterInit) cbAfterInit('No settings');
	}
	else {
		twitObj = new Twit({
			"consumer_key": configObject.TWITTER_CONSUMER_KEY,
			"consumer_secret": configObject.TWITTER_CONSUMER_SECRET,
			"access_token": configObject.TWITTER_ACCESS_TOKEN,
			"access_token_secret": configObject.TWITTER_ACCESS_TOKEN_SECRET
		});
		console.log('TwitHelper Debug mode:', configObject.DEBUG_MODE);
		if (cbAfterInit) cbAfterInit(null);
	}
};

const triggerOnDirectMessage = function () {
	var stream = twitObj.stream('user');

	stream.on('direct_message', function (event) {
		console.log('twitObj.direct_message:', event);
	});

	// stream.on('user_event', function (event) {
	// 	console.log('twitObj.user_event:', event);
	// });
}

const formatTweet = function (tweetObj) {
	if (tweetObj)
		return '@' + tweetObj.user.screen_name + ': “' + tweetObj.text + '”';
	else
		return '';
};

const formatTweetURL = function (tweetObj) {
	if (tweetObj)
		return 'https://twitter.com/' + tweetObj.user.screen_name + '/status/' + tweetObj.id_str;
	else
		return '';
};

const formatLiveDebugFlag = function () {
	return (configObject.DEBUG_MODE ? '(debug)' : '(LIVE)');
};

// https://support.twitter.com/articles/71577
const searchTweets = function (searchStr, options, callback) {
	// sinceDate = sinceDate || 
	// moment(sinceDate).format("YYYY-MM-DD")
	// 'banana since:2011-11-11'
	var params = {
		q: '“' + searchStr + '”',
		count: configObject.TWITTER_SEARCH_LIMIT,
	};
	twitObj.get('search/tweets', params, function (err, data, response) {
		if (!data.statuses) {
			data.statuses = [];
		}
		console.log('Search:', params.q, data.statuses.length);
		callback(err, data.statuses);
	})
}

const postTweet = function (message, replyToStatusObj, callback) {
	var params = {
		status: message,
	};
	// Is this a reply? NOTE: must also have @recipient in text
	if (replyToStatusObj) {
		params.in_reply_to_status_id = replyToStatusObj.id_str;
	}
	// Tweet!
	console.log(
		'Tweet: ' + formatLiveDebugFlag(),
		'“' + params.status + '”',
		'- reply to ' + formatTweet(replyToStatusObj) + '; ' + formatTweetURL(replyToStatusObj)
	);
	if (!configObject.DEBUG_MODE) {
		twitObj.post('statuses/update', params, function (err, data, response) {
			callback(err, data);
		});
	}
	else {
		callback(null, { 'id_str': '(debug)' });
	}
};

const makeTweetFavorite = function (tweetObj, callback) {
	if (!tweetObj.favorited) {
		console.log('Favorite: ' + formatLiveDebugFlag() + ' ' + formatTweet(tweetObj) + '; ' + formatTweetURL(tweetObj));
		if (!configObject.DEBUG_MODE) {
			twitObj.post('favorites/create', { id: tweetObj.id_str }, function (err, data, response) {
				callback(err, data);
			});
		}
		else {
			callback(null, tweetObj);
		}
	}
	else {
		callback(null, tweetObj);
	}
};


// ----- Users -----

const getUser = function (screen_name, callback) {
	twitObj.get('users/lookup', { screen_name: screen_name }, (err, user) => {
		callback(err, user[0]);
	});
};
const getUserLimited = daLimiter.limit(getUser, DALIMITER_OPTIONS);

const followUser = function (userObj, callback) {
	if (!userObj.following) {
		console.log('Follow: ' + formatLiveDebugFlag() + ' @' + userObj.screen_name);
		if (!configObject.DEBUG_MODE) {
			twitObj.post('friendships/create', { screen_name: userObj.screen_name }, function (err, data, response) {
				if (err) {
					console.log('Error following @' + userObj.screen_name + ':', err);
				}
				callback(null, data);
			});
		}
		else {
			callback(null, userObj);
		}
	}
	else {
		callback(null, userObj);
	}
};

const unfollowUser = function (userObj, callback) {
	console.log('Unfollow: ' + formatLiveDebugFlag() + ' @' + userObj.screen_name);
	if (!configObject.DEBUG_MODE) {
		twitObj.post('friendships/destroy', { screen_name: userObj.screen_name }, function (err, data, response) {
			callback(err, data);
		});
	}
	else {
		callback(null, userObj);
	}
};

// “Following” friends/list, then friendships/lookup
const getMyFriends = function (callback) {
	var params = {
		screen_name: configObject.TWITTER_SCREEN_NAME,
		count: 100
	};
	twitObj.get('friends/list', params, function (err, result) {
		var userNames = _.pluck(result.users, 'screen_name');
		twitObj.get('friendships/lookup', { screen_name: userNames.join(',') }, function (err, friends) {
			callback(err, friends);
		})
	})
}

const getFollowers = function (screen_name, options, callback) {
	var params = {
		screen_name: screen_name,
		count: 100
	};
	twitObj.get('followers/list', params, (err, results) => {
		// Use 'next_cursor', 'next_cursor_str', 'previous_cursor', 'previous_cursor_str'
		callback(err, _.get(results, 'users'));
	})
};
const getFollowersLimited = daLimiter.limit(getFollowers, DALIMITER_OPTIONS);


//------ PUBLIC METHODS ------

module.exports = {

	// init(configObj, cbAfterInit)
	init: init,

	formatTweet: formatTweet,
	formatTweetURL: formatTweetURL,

	// searchTweets(searchStr, options, callback)
	searchTweets: searchTweets,
	// postTweet(message, replyToStatusObj, callback)
	postTweet: postTweet,
	// makeTweetFavorite(tweetObj, callback)
	makeTweetFavorite: makeTweetFavorite,

	// getUser(screen_name, callback)
	getUser: getUserLimited,
	// followUser(userObj, callback)
	followUser: followUser,
	// unfollowUser(userObj, callback)
	unfollowUser: unfollowUser,
	// getMyFriends(callback)
	getMyFriends: getMyFriends,
	// getFollowers(screen_name, options, callback)
	getFollowers: getFollowersLimited,

}