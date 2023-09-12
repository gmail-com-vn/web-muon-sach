const mongoose = require('mongoose');

const Schema = mongoose.Schema;
ratingSchema = mongoose.Schema({
    star: { type: Number },
    chuSachId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    nguoiMuonId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    bookId: { type: Number, ref: 'Book', required: true },
    transactionId: { type: Schema.Types.ObjectId, required: true, ref: 'Transaction' },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Rating', ratingSchema);
