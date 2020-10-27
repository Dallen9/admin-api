const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    const authorization = req.headers['authorization']

    if(!authorization) {
        return res.status(401).json({msg: 'You must be logged in!'});
    }

    const token = authorization.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.user.id);
      next();
    } catch(err) {
        console.error(err.message);
        res.status(403).json({ msg: 'Token is not valid'});

    }
}

//Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(res.status(403).json({msg: `User role ${req.user.role} is not authorized to reach this route`}))
        }
        next();
    }
}
