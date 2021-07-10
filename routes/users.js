const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');

const User = require('../models/User');

//@route POST api/users
//@desc Register a user
//@access Public
router.post('/',
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
            let userName = await User.findOne({username})
            if (user) {
                return res.status(403).json({msg: 'User already exists'});
            }

            if(userName) {
                return res.status(400).json({msg: 'Username already exists'})
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

            const payload = {
                user: {
                    id: user.id
                }
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET); 
            res.json({token});
        } catch (err) {
            res.status(500).send('Server Error');
        }
    }
);


module.exports = router;