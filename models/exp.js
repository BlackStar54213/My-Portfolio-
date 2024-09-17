const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expSchema = new Schema({
    company: String,
    role: String
});


const Exp = mongoose.model('exps', expSchema);
module.exports = Exp;