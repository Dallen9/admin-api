const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {protect}= require('../middleware/auth');
const {check, validationResult} = require('express-validator');

const User = require('../models/User');

//@route GET api/auth
//@desc  Get logged in user
//@access private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch(e) {
        console.error(e.message);
        res.status(500).json({msg: 'Server error'});
    }
});

//@route POST api/auth
//@desc  Auth user & get token
//@access public
router.post('/', [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
], 
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    } 

    const {email, password} = req.body;

    try{
        let user = await User.findOne({email});
        
        if(!user) {
            return res.status(400).json({msg: 'User does not exist'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return res.status(400).json({msg: 'Wrong password'})
        }
        const payload = {
            user: {
                id: user._id
            }
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET)
        res.json({token});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//@route PUT api/auth/updateuser
//@desc  Update user's account details
//@access private
router.put('/updateaccount', protect, async (req, res) => {

    const fields = {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email
    }
    try {
        const user = await User.findByIdAndUpdate(req.user.id, fields, {
            new: true,
            runValidators: true
        });
        res.status(200).json(user);
    } catch(err) {
        console.error(err)
        res.status(400).json({msg: 'Failed to update user details'})
    }
});

module.exports = router;