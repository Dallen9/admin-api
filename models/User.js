const mongoose = require('mongoose');
const moment = require('moment');
const { schema } = require('./Post');

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
        type: String
    },
    role: {
        type: String,
        enum: ['Subscriber', 'Author'],
        default: 'Subscriber'
    },
    date: {
        type: String,
        default: moment().format('dddd, MMMM Do YYYY, h:mm:ss a')
    }
});
UserSchema.virtual('posts', {
    ref: 'post',
    localField: '_id',
    foreignField: 'user'
});

module.exports = mongoose.model('user', UserSchema)