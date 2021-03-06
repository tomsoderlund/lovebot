const _ = require('lodash');
const express = require('express');
const server = express();
const bodyParser = require('body-parser');
const glob = require('glob');

const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const defaultRequestHandler = app.getRequestHandler()

const database = require('./services/database');
const cookieSession = require('cookie-session')
const passport = require('./services/passportTwitter');
const PORT = process.env.PORT || 3003

app.prepare().then(() => {

	// Parse application/x-www-form-urlencoded
	server.use(bodyParser.urlencoded({ extended: false }));
	// Parse application/json
	server.use(bodyParser.json());

	// Allows for cross origin domain request:
	server.use(function(req, res, next) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
		next();
	});

	// MongoDB
	database.open();

	// API routes
	const rootPath = require('path').normalize(__dirname + '/..');
	glob.sync(rootPath + '/server/routes/*.js').forEach(controllerPath => require(controllerPath)(server));

	// Initialize Passport and restore authentication state, if any, from the session.
	// Just reusing TWITTER_CONSUMER_SECRET here, no need to be exact
	server.use(cookieSession({
		name: 'lovebot',
		keys: [process.env.TWITTER_CONSUMER_SECRET],
		maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
	}));
	server.use(passport.initialize());
	server.use(passport.session());

	// Next.js request handling
	const customRequestHandler = (page, req, res) => {
		const mergedQuery = Object.assign({}, req.query, req.params);
		app.render(req, res, page, mergedQuery);
	};

	// Custom routes
	server.get('/login/twitter', passport.authenticate('twitter'));
	server.get('/login/twitter/return', passport.authenticate('twitter', { successRedirect: '/me', failureRedirect: '/?loginFailed=true' }));
	server.get('/logout', passport.logoutAndRedirect);
	server.get('/profile/:username', customRequestHandler.bind(undefined, '/profile'));
	server.get('/me', customRequestHandler.bind(undefined, '/profile'));
	server.get('/', customRequestHandler.bind(undefined, '/'));
	server.get('*', defaultRequestHandler);

	// Start server
	server.listen(PORT, function () {
		console.log(`App running on http://localhost:${PORT}/`)
	});

})
