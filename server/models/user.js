var mongoose = require('mongoose');

var Schema = mongoose.Schema;

mongoose.Promise = global.Promise;

var userSchema = new Schema({
	name: { type: String },
	twitterHandle: { type: String, required: true, unique: true },
	location: { type: String },
	description: { type: String },
	websiteUrl: { type: String },
	imageUrl: { type: String },
	isPerson: { type: Boolean },
	gender: { type: String },
});

module.exports = mongoose.model('User', userSchema);
