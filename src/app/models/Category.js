const mongoose = require('mongoose')
const slug = require('mongoose-slug-generator')

const Schema = mongoose.Schema

const categorySchema = new Schema(
    {
        categoryBook: { type: String },
        slugCategoryBook: { type: String, slug: 'categoryBook', unique: true },
    }
)

mongoose.plugin(slug);

module.exports = mongoose.model('Category', categorySchema);