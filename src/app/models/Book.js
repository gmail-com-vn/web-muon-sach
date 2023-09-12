const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const bookSchema = new Schema(
    {
        _id: { type: Number },
        name: { type: String, required: true },
        description: { type: String, required: true },
        img: { type: String, required: true },
        author: { type: String, required: true },
        tinh_trang: { type: String, required: true },
        transport_fee: { type: String, required: true },
        status: { type: String, required: true },
        categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        slug: { type: String, slug: 'name', unique: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        deleteAt: {},
    },
    {
        _id: false,
        timestamps: true,
    },
);

bookSchema.index({ name: 'text', description: 'text' });

// Custom query helpers
bookSchema.query.sortable = function (req) {
    if (req.query.hasOwnProperty('_sort')) {
        const isValidtype = ['asc', 'desc'].includes(req.query.type);
        return this.sort({
            [req.query.column]: isValidtype ? req.query.type : 'desc',
        });
    }
    return this;
};

// Add plugins
mongoose.plugin(slug);

bookSchema.plugin(AutoIncrement);

bookSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('Book', bookSchema);
