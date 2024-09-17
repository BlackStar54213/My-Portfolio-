const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    client: {
        type: String,
        required: true
    },
    tech: {
        type: String,
        required: true
    },
    style: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },

    images: {
        type: [String],
        required: true
    }
}, { timestamps: true });

const Content = mongoose.model('content', contentSchema);
module.exports = Content;

