const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    image: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('social-login', userSchema);

module.exports = User;