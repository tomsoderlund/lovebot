var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var RelationSchema = new Schema({
	dateCreated: { type: Date, default: Date.now },
	fromUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	toUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	type: { type: String, required: true }, // 'no', 'favorite', 'askdate'
});

RelationSchema.index({ fromUser: 1, toUser: -1 });

module.exports = mongoose.model('Relation', RelationSchema);
