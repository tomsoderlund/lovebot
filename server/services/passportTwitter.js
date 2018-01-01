//
// Name:    passportTwitter.js
// Purpose: Library for passportTwitter functions
// Creator: Tom Söderlund
//

// See https://github.com/passport/express-4.x-twitter-example/

'use strict';

const _ = require('lodash');

const passport = require('passport');
const passportTwitterStrategy = require('passport-twitter').Strategy;

const API_URL = process.env.NODE_ENV === 'production' ? 'https://lovebotisactive.herokuapp.com' : 'http://localhost:3003';

// Private functions

passport.use(
	new passportTwitterStrategy(
		{
			consumerKey: process.env.TWITTER_CONSUMER_KEY,
			consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
			callbackURL: `${API_URL}/login/twitter/return`,
		},
		function(token, tokenSecret, profile, cb) {
			// In this example, the user's Twitter profile is supplied as the user
			// record.  In a production-quality application, the Twitter profile should
			// be associated with a user record in the application's database, which
			// allows for account linking and authentication with other identity
			// providers.
			return cb(null, profile);
		}
	)
);

// Save session to cookie
passport.serializeUser((user, cb) => {
	fetch(`${API_URL}/api/usernames/${user.username}`)
		.then(res => res.json())
		.then(dbUser => {
			cb(null, _.pick(dbUser, ['_id', 'twitterHandle', 'isAdmin']))
		})
		.catch(cb);
});
// Load session from cookie
passport.deserializeUser((obj, cb) => cb(null, obj));

// Logout
passport.logoutAndRedirect = function (req, res) {
	req.logout();
	res.redirect('/feed');
};

// Public API

module.exports = passport;
