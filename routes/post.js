const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireSignIn = require("../Middleware/requireSignIn");

//importing Post model
const Post = mongoose.model("Post");

router.get("/allpost", requireSignIn, (req, res) => {
  Post.find({ postedby: { $in: req.user.following } })
    .populate("postedby")
    .populate("comments.postedby")
    .sort({ _id: -1 })
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/getSinglePost", requireSignIn, (req, res) => {
  Post.findOne({ _id: req.body.postId })
    .populate("postedby", "name pic")
    .populate("comments")
    .then((postDetails) => {
      res.json({ post: postDetails });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/getsubpost", requireSignIn, (req, res) => {
  //posted by is following
  Post.find({ postedby: { $in: req.user.following } })
    .populate("postedby")
    .populate("comments.postedby")
    .sort({ _id: -1 })
    .then((posts) => {
      res.json(posts);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get("/mypost", requireSignIn, (req, res) => {
  Post.find({ postedby: req.user._id })
    .populate("postedby")
    .populate("comments.postedby")
    .sort({ _id: -1 })
    .then((mypost) => {
      res.json({ mypost: mypost });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.post("/createPost", requireSignIn, (req, res) => {
  const { title, body, photo } = req.body;

  if (!title || !body) {
    return res.status(422).json({ error: "Please give all the data" });
  } else {
    req.user.password = undefined; //for not showing the password
    const post = new Post({
      title: title,
      body: body,
      photo: photo ? photo : "no photo",
      postedby: req.user,
    });

    post
      .save()
      .then((savedPost) => {
        res.json({ post: savedPost });
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

router.put("/like", requireSignIn, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedby")
    .populate("comments.postedby")
    .exec((err, result) => {
      if (err) {
        res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.put("/unlike", requireSignIn, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $pull: { likes: req.user._id },
    },
    {
      new: true,
    }
  )
    .populate("postedby")
    .populate("comments.postedby")
    .exec((err, result) => {
      if (err) {
        res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.put("/comment", requireSignIn, (req, res) => {
  const comment = {
    text: req.body.text,
    postedby: req.user,
  };

  Post.findByIdAndUpdate(
    req.body.postId,
    {
      $push: { comments: comment },
    },
    {
      new: true,
    }
  )
    .populate("postedby")
    .populate("comments.postedby")
    .exec((err, result) => {
      if (err) {
        res.status(422).json({ error: err });
      } else {
        res.json(result);
      }
    });
});

router.delete("/deletepost/:postId", requireSignIn, (req, res) => {
  Post.findOne({ _id: req.params.postId })
    .populate("postedby")
    .exec((err, post) => {
      if (err || !post) {
        return res.status(422).json({ error: err });
      }

      if (post.postedby._id.toString() === req.user._id.toString()) {
        post
          .remove()
          .then((result) => {
            res.json(result);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
});

module.exports = router;
