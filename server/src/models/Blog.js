const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        default: 'Dr. Tooth Dental Clinic'
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    tags: [String],
    imageUrl: {
        type: String
    }
}, { timestamps: true });

// Pre-save middleware to generate slug
blogSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);
