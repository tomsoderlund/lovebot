var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	dateCreated: { type: Date, default: Date.now },
	dateUpdated: { type: Date },
	name: { type: String },
	twitterHandle: { type: String, required: true, unique: true },
	locationDetails: {
		original: { type: String },
		city: { type: String },
		countryCode: { type: String },
		latitude: { type: Number },
		longitude: { type: Number },
		found: { type: Boolean },
	},
	description: { type: String },
	websiteUrl: { type: String },
	imageUrl: { type: String },
	isPerson: { type: Boolean },
	gender: { type: String },
	showInSearch: { type: Boolean, default: true },
	source: { type: String }, // how it entered the system
	isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
