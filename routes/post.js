const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {check} = require('express-validator');
const {protect, authorize} = require('../middleware/auth');

const Post = require('../models/Post');

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
            },
            {
                $project: 
                {
                    '_id': '$_id',
                    'title': '$title',
                    'body':  '$body',
                    'date':  '$date',
                    'user': { "$mergeObjects": {'_id':"$user._id", "name": '$user.name'}}
                }
            }
        ])
        return res.status(200).json(post)
    } catch (e) {
        return res.status(400).json({msg: 'Error loading posts'})
    }
});

//@route GET api/post/user
//@desc Get all posts by user
//@access Private
router.get('/user', protect, async(req, res) => {
    try {
        await req.user.populate('posts').execPopulate()
        return res.status(200).send(req.user.posts);
    } catch (e) {
        console.error(e.message)
        return res.status(400).json({msg: 'Error loading posts'})
    }
});

//@route GET api/post/user/:userId
//@desc Get all posts by user using ID
//@access Private
router.get('/user/:id', protect, async(req, res) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    try {
            const posts = await Post.aggregate([
                 {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: '$userDetails'
                }, 
                {
                    $match:  {'user': id}

                }, 
                {
                    $project: {
                    '_id': '$_id',
                    'title': '$title',
                    'body':  '$body',
                    'date':  '$date',
                    'user': { "$mergeObjects": {'_id':"$user", "name": '$userDetails.name', 'username': '$userDetails.username'}}
                    }
                }
            ]);
        if(!posts) {
            res.status(400).json({msg: 'No post available'})
        }
        return res.status(200).json({count: posts.length, posts});
    } catch (e) {
        return res.status(400).json({msg: 'Error loading posts'})
    }
});

//@route GET api/posts/:id
//@desc Get single post
//@access Private
router.get('/:id', protect, async (req, res) => {
    let id = mongoose.Types.ObjectId(req.params.id);
    try {
            const post = await Post.aggregate([
                 {
                    $lookup: {
                        from: 'users',
                        localField: 'user',
                        foreignField: '_id',
                        as: 'userDetails'
                    }
                },
                {
                    $unwind: '$userDetails'
                }, 
                {
                    $match:  {'_id': id}
                }, 
                {
                    $project: {
                    '_id': '$_id',
                    'title': '$title',
                    'body':  '$body',
                    'date':  '$date',
                    'user': { "$mergeObjects": {'_id':"$user", "name": '$userDetails.name', 'username': '$userDetails.username'}}
                    }
                }
            ]);
        return res.status(200).json(post)
    } catch(err) {
        return res.status(400).json({msg: 'Post not found'})
    }
});

//@route POST api/post
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
async (req, res) => {
    const post = new Post({
        ...req.body,
    user: req.user._id
})
    try { 
        await post.save()
        return res.status(201).send(post)
    } catch(err) {
        return res.status(400).json({msg: 'Error adding post'})
    }
});

//@route PUT api/posts
//@desc Update post
//@access Private
router.put('/:id', protect, authorize('Author', 'super_admin'), async (req, res) => {
    const fields = {
        title: req.body.title,
         body: req.body.body
     }
    try {
        let post = await Post.findById(req.params.id);

        if(!post) {
            return res.status(400).json({msg: 'Post not found'})
        }

        //Make sure user is post owner
        if(post.user.toString() !== req.user.id && req.user.role !== 'super_admin') {
            return res.status(400).json({msg: 'User is not authorized to update current post'})
        }
     
        post = await Post.findByIdAndUpdate(req.params.id, fields, {
            new: true,
            runValidators: true
        });

        return res.status(200).json({post});
    } catch(err) {
        return res.status(400).json({msg: 'Error updating post'})
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