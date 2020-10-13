const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const {protect, authorize} = require('../middleware/auth');

const User = require('../models/User');

//@route GET api/admin
//@desc Get all users (other than admin)
//@access Private
router.get('/', protect, authorize('super_admin'), async(req, res) => {
    try {
        const user = await User.find({role: { $in: ['Subscriber', 'Author']}});
        res.status(200).json(user)
    } catch (e) {
        console.error(e.message);
        res.status(400).send('Users could not be found');
    }
});


//@route POST api/create-user
//@desc Admin register a user
//@access Private
router.post('/create-user', protect, authorize('super_admin'),
[
    check('username', 'Username is required')
    .not()
    .isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
    .isLength({min: 6})
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    } 

    const {username, name, email, password, role} = req.body;

    try {
        let user = await User.findOne({email});

        if (user) {
            return res.status(400).json({ msg: 'User already exists'});
        }

        user = new User({
            username,
            name,
            email,
            password,
            role
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        
        await user.save(); 
        res.status(200).json({msg: 'user created'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    }
);

//@route PUT api/admin
//@desc Admin edit a user
//@access Private
router.put('/:id', protect, authorize('super_admin'), async(req, res) => {
    const fields = {
        username: req.body.username,
        name: req.body.name,
        email: req.body.email
    }

    try {
        let user = await User.findByIdAndUpdate(req.params.id);

        if(!user) {
           return res.status(400).json({msg: 'User is not found'});
        }


        user = await User.findByIdAndUpdate(req.params.id, fields, {
            new: true,
            runValidators: true
        })

        res.status(200).json(user);

    } catch(e) {
        console.error(e)
        res.status(400).json({msg: 'Failed to update user details'})
    }
});

//@route DELETE api/admin/:id
//@desc Admin delete a user
//@access Private
router.delete('/:id', protect, authorize('super_admin'), async(req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(!user) {
            res.status(400).json({msg: 'User is not found'});
        }

        user.remove();

        res.status(200).json({deleted:true, user});

    } catch(e) {
        console.error(e.message);
        res.status(400).json({msg: 'Error deleting user'})
    }
});

module.exports = router;