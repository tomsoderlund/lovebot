var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var NameSchema = new Schema({
	dateCreated: { type: Date, default: Date.now },
	name: { type: String, required: true, unique: true, sparse: true },
	isPerson: { type: Boolean },
	gender: { type: String },
});

module.exports = mongoose.model('Name', NameSchema);
