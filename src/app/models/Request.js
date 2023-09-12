const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const requestSchema = new Schema({
    bookId: { type: Number, required: true, ref: 'Book' },
    chuSachId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    nguoiMuonId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    thoiGianTra: { type: Number },
    message: { type: String },
    trangThai: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Request', requestSchema);
