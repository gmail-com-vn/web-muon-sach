const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const storySchema = new Schema({
    title: { type: String },
    content: { type: String },
    like: { type: Number },
    comment: [
        {
            like: { type: Number },
            reply: { type: String },
            userReplyId: { type: Schema.Types.ObjectId, ref: 'User' },
        },
    ],
    imgStory: { type: String },
    createdAt: { type: Date, default: Date.now },
    slug: { type: String, slug: 'title', unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    deleteAt: {},
});

storySchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

// Custom query helpers
storySchema.query.sortable = function (req) {
    if (req.query.hasOwnProperty('_sort')) {
        const isValidtype = ['asc', 'desc'].includes(req.query.type);
        return this.sort({
            [req.query.column]: isValidtype ? req.query.type : 'desc',
        });
    }
    return this;
};

module.exports = mongoose.model('Story', storySchema);
