const Post = require("../models/Post");
const Schedule = require("../models/Schedule");
const Comments = require("../models/Comments");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      //find all the posts from the user that matches that ID
      res.render("profile.ejs", { posts: posts, user: req.user });
      //The value of the posts property is whatever the posts variable holds (typically, this would be an array of post data from your database).
    } catch (err) {
      console.log(err);
    }
  },
  getSchedule: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("schedule.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comments.find({postID: req.params.id});
      res.render("post.ejs", { post: post, comments: comments, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  createSchedule: async (req, res) => {
    try {
      await Schedule.create({
        days: req.body.workDays,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        frequency: req.body.frequency,
        user: req.user.id,
      });
      console.log("Schedule has been added!");
      res.redirect("/schedule");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  //COMMENTS =====================================================
  
  addComment: async (req, res) => {
    try {
      await Comments.create({
        comment: req.body.comment.trim(),
        commentByUserID: req.user.id,
        commentByUserName: req.user.userName,
        postID: req.params.id,
      });
      console.log("Comment has been added!");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  //END COMMENTS =====================================================
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
