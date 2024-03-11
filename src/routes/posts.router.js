const express = require('express')
const {checkAuthenticated, checkPostOwnerShip} = require("../middleware/auth")
const router = express.Router();
const Posts = require('../models/posts.model');
const comments = require('../models/comments.model')
const multer = require('multer');
const path = require('path')

const storageEngine = multer.diskStorage({
    destination: (req,file,callback) => {
        callback(null, path.join(__dirname,"../public/assets/images"))
    },
    filename: (req,file, callback) => {
        callback(null, file.originalname);
    }
})

const upload = multer({storage: storageEngine}).single("image")

router.post('/', checkAuthenticated, upload, (req,res) => {
    let desc = req.body.desc;
    let image = req.file ? req.file.filename : "";
    Posts.create({
        image: image,
        description: desc,
        author: {
            id: req.user.id,
            username: req.user.username
        }
    }, (err, post) => {
        if(err) {
            req.flash('error', '포스트 생성 실패')
            res.redirect('back')
        } else {
            req.flash('success', '포스트 생성 성공')
            res.redirect('back')
        }
    })
})

router.get('/', checkAuthenticated, (req,res) => {
    Posts.find()
    .populate('comments')
    .sort({createdAt: -1})
    .exec((err, posts) => {
        if(err) console.log(err)
        else{
            res.render('posts', {
                posts: posts,
            });
        }
    })
})

router.get('/:id/edit', checkPostOwnerShip, (req,res) => {
    res.render('posts/edit', {
        post: req.post
    })
})

router.put("/:id", checkPostOwnerShip, (req,res) => {
    Posts.findByIdAndUpdate(req.params.id, req.body, (err,_) => {
        if(err) {
            req.flash('error', '게시물을 수정하는데 오류가 발생했습니다.');
            res.redirect('/posts');
        } else {
            req.flash('success', '게시물 수정을 완료했습니다.');
            res.redirect('/posts');
        }
    })
})
module.exports=router