const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const {protect, authorize} = require('../middleware/auth');

const Post = require('../models/Post');
const User = require('../models/User');

//@route GET api/post
//@desc Get all post
//@access Private
router.get('/', protect, async(req, res) => {
    try {

        let post = await Post.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            }
        ])

        return res.status(200).json(post)
    } catch (e) {
        res.status(400).json({msg: 'Error loading posts'})
    }
});

//@route GET api/users/:userId/posts
//@desc Get all posts by user
//@access Private
router.get('/user/:id', protect, async(req, res) => {
    req.body.user = req.params.id;
    try {
        const posts = await User.findById(req.params.id);

        if(!posts) {
            res.status(400).json({msg: 'No post available'})
        }

        return res.status(200).json({count: posts.length, posts});
    } catch (e) {
        res.status(400).json({msg: 'Error loading posts'})
    }
});

//@route GET api/posts/:id
//@desc Get single post
//@access Private
router.get('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if(!post) {
            return res.status(400).json({msg: 'Post not found'})
        }

        res.status(200).json(post)
    } catch(err) {
        console.error(err.message)
        res.status(400).json({msg: 'Post not found'})
    }
});

//@route POST api/posts
//@desc Add new post
//@access Private
router.post('/', protect, authorize('Author', 'super_admin'), 
    [
        check('title', 'Title is required')
        .not()
        .isEmpty(),
        check('body', 'Please enter text into the body')
        .not()
        .isEmpty()
    ],
async (req, res, next) => {
    
    // //Add user to req.body
    req.body.user = req.user.id;
    req.body.post = req.params.postId;
    // //Check for existing created post
    // const postExist = await Post.findOne({user: req.user.id})

    // //If the user is not an admin, they can only add one post
    // if(postExist && req.user.role !== 'super_admin') {
    //     return next(res.status(400).json({msg: 'This user has already created a post'}))
    // }

    try { 
    // const postExist = await Post.findOne({user: req.user.id})
    
    // if(postExist) {
    //     const pop = await User.updateOne({
    //         user: req.user.id
    //     }, {
    //         $push: {
    //             posts: req.params.postId
    //         }
    //     });
    //     res.status(200).json(pop)
    // } else {
        
    // }
    const post = await Post.create(req.body)
        res.status(201).json(post)
    } catch(err) {
        console.error(err.message);
        res.status(400).json({msg: 'Error adding post'})
    }
});

//@route PUT api/posts
//@desc Update post
//@access Private
router.put('/:id', protect, authorize('Author', 'super_admin'), async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(400).json({msg: 'Post not found'})
        }

        //Make sure user is post owner
        if(post.user.toString() !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(400).json({msg: 'User is not authorized to update current post'})
        }

        post = await Post.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({post});
    } catch(err) {
        console.error(err.message);
        res.status(400).json({msg: 'Error updating post'})
    }
});

//@route Delete api/posts
//@desc Delete post
//@access Private
router.delete('/:id', protect, authorize('Author', 'super_admin'), async (req, res) => {
     try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(400).json({msg: 'Post not found'})
        }

          //Make sure user is post owner
          if(post.user.toString() !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(400).json({msg: 'User is not authorized to delete current post'})
        }

        post.remove();

        res.status(200).json({deleted:true, post});
    } catch(err) {
        console.error(err.message);
        res.status(400).json({msg: 'Error deleting post'})
    }
});

module.exports = router;