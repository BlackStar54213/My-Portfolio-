const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: String,
    hashed_password: String,
    salt: String
});


const User = mongoose.model('user', userSchema);
module.exports = User;