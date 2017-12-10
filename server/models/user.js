var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date },
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
