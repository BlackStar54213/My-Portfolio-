const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const detailSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Brief: {
        type: String
    },
    Job: {
        type: String
    },
    Contact: {
        type: String
    },
    City: {
        type: String
    },
    Degree: {
        type: String
    },
    Email: {
        type: String
    },
    Partners: {
        type: String
    }
}, { timestamps: true });

const Details = mongoose.model('detail', detailSchema);
module.exports = Details;

