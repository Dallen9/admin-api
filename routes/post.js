const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const {protect, authorize} = require('../middleware/auth');

const Post = require('../models/Post');

//@route GET api/posts
//@desc Get all posts
//@access Private
router.get('/', protect, async(req, res) => {
    try {
        const posts = await Post.find();

        return res.status(200).json(posts)
    } catch (e) {
        res.status(400).json({msg: 'Error loading posts'})
    }
});

//@route GET api/posts/:userId
//@desc Get all posts by user
//@access Private
router.get('/:userId', protect, async(req, res) => {
    try {
        const posts = await Post.find({user: req.params.userId});

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
            return res.status(400).json({msg: 'Vendor not found'})
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
router.post('/', protect, authorize('author', 'super_admin'), 
    [
        check('title', 'Title is required')
        .not()
        .isEmpty(),
        check('body', 'Please enter text into the body')
        .not()
        .isEmpty()
    ],
async (req, res, next) => {
    
    //Add user to req.body
    req.body.user = req.user.id;

    //Check for existing created post
    const postExist = await Post.findOne({user: req.user.id})

    //If the user is not an admin, they can only add one post
    if(postExist && req.user.role !== 'super_admin') {
        return next(res.status(400).json({msg: 'This user has already created a post'}))
    }

    try { 
    const post = await Post.create(req.body)
    console.log(post)
    res.status(200).json({post})
    } catch(err) {
        console.error(err.message);
        res.status(400).json({msg: 'Error adding post'})
    }
});

//@route PUT api/posts
//@desc Update post
//@access Private
router.put('/:id', protect, authorize('author', 'super_admin'), async (req, res) => {
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
//@route POST /api/vendors/:userId/post
//@desc Add review
//@access Private
router.post('/', protect, async (req, res) => {
    req.body.vendor = req.params.vendorId;
    req.body.user = req.user.id;
 
    const vendor = await Vendor.findById(req.params.vendorId);
 
    if(!vendor) {
        return res.status(404).json({msg: 'Vendor not found'})
    }
 
    const review = await Review.create(req.body);
 
     res.status(201).json(review)
 });

//@route Delete api/posts
//@desc Delete post
//@access Private
router.delete('/:id', protect, authorize('author', 'super_admin'), async (req, res) => {
     try {
        const post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(400).json({msg: 'Post not found'})
        }

          //Make sure user is vendor owner
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