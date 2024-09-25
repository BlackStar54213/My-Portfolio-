const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expSchema = new Schema({
    company: String,
    role: String,
    createdAt: {
        type: Date,
        default: Date.now  // Automatically adds a timestamp when a new document is created
    }
});


const Exp = mongoose.model('exps', expSchema);
module.exports = Exp;