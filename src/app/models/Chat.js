const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const chatSchema = new Schema({
    content: { type: String },
    createdAt: { type: Date, default: Date.now },
    nguoiGuiId: { type: Schema.Types.ObjectId, ref: 'User' },
    nguoiNhanId: { type: Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Chat', chatSchema);
