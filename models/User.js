const mongoose = require('mongoose');
const moment = require('moment');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['subscriber', 'author'],
        default: 'subscriber'
    },
    date: {
        type: String,
        default: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
    }
});

module.exports = mongoose.model('user', UserSchema)