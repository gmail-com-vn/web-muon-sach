const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    phone: { type: Number },
    address: { type: String },
    avatar: { type: String },
    imgCCCD: { type: Array },
    trangThaiXacMinh: { type: String },
    resetToken: String,
    resetTokenExpiration: Date,
    role: { type: Number },
    createdAt: { type: Date, default: Date.now },
    love: {
        items: [
            {
                bookId: { type: Number, ref: 'Book', required: true },
            },
        ],
    },
});

userSchema.methods.addToLove = function (book) {
    const loveBookIndex = this.love.items.findIndex((cp) => {
        return cp.bookId.toString() === book._id.toString(); // lấy chỉ mục sản phẩm
    });

    const updatedLoveItems = [...this.love.items];

    // cập nhật mảng
    if (loveBookIndex >= 0) {
    } else {
        updatedLoveItems.push({
            bookId: book._id,
        });
    }
    const updatedLove = {
        items: updatedLoveItems,
    };
    this.love = updatedLove;
    return this.save();
};

userSchema.methods.removeFromLove = function (bookId) {
    const updatedLoveItems = this.love.items.filter((item) => {
        return item.bookId.toString() !== bookId.toString();
    });
    this.love.items = updatedLoveItems;
    return this.save();
};

userSchema.methods.clearLove = function () {
    this.love = { items: [] };
    return this.save();
};

module.exports = mongoose.model('User', userSchema);
