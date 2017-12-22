//
// Name:    passportTwitter.js
// Purpose: Library for passportTwitter functions
// Creator: Tom Söderlund
//

// See https://github.com/passport/express-4.x-twitter-example/

'use strict';

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

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

// Public API

module.exports = passport;
