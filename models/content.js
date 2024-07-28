const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentSchema = new Schema({
    Title: {
        type: String,
        required: true
    },
    Client: {
        type: String,
        required: true
    },
    Tech: {
        type: String,
        required: true
    },
    Design: {
        type: String,
        required: true
    },
    Link: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Content = mongoose.model('content', contentSchema);
module.exports = Content;

