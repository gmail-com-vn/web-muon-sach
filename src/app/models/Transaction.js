const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    bookId: { type: Number, required: true, ref: 'Book' },
    chuSachId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    nguoiMuonId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    requestId: { type: Schema.Types.ObjectId, required: true, ref: 'Request' },
    trangThaiGiaoDich: { type: String, required: true },
    tenNguoiNhan: { type: String },
    phone: { type: Number },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    tienCoc: { type: Number },
    ghiChu: { type: String },
});

// Custom query helpers
transactionSchema.query.sortable = function (req) {
    if (req.query.hasOwnProperty('_sort')) {
        const isValidtype = ['asc', 'desc'].includes(req.query.type);
        return this.sort({
            [req.query.column]: isValidtype ? req.query.type : 'desc',
        });
    }
    return this;
};

module.exports = mongoose.model('Transaction', transactionSchema);
