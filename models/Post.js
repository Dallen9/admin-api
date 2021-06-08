const mongoose = require('mongoose');
const moment = require('moment');

const PostSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'user',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: moment().format('LLL')
    }
});

module.exports = mongoose.model('post', PostSchema)