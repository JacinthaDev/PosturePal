const Post = require("../models/Post");
const Schedule = require("../models/Schedule");
const Streak = require('../models/Streak');

function convertTo12Hour(time) {
  let [hours, minutes] = time.split(':');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  return hours + ':' + minutes + ' ' + ampm;
}



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
      const schedule = await Schedule.find({user: req.user.id }).lean();
      if (schedule.length >0) {
        const startTime12hr = convertTo12Hour(schedule[0].startTime);
        const endTime12hr = convertTo12Hour(schedule[0].endTime);
        res.render("schedule.ejs", {schedule: schedule, user: req.user, startTime:startTime12hr, endTime:endTime12hr});
      } else {
        res.render('schedule.ejs', { schedule: [], user: req.user}); // Pass an empty array if no schedule
      }
    } catch (err) {
      console.log(err);
    }
  },
  getStretches: async (req, res) => {
    try {
      const schedule = await Schedule.find({user: req.user.id }).lean();
      res.json(schedule);
    } catch (err) {
      console.log(err);
    }
  },
  // In your controllers file
  createScheduleAndStreak: async (req, res) => {
    try {
        // Create Schedule
        const newSchedule = await Schedule.create({
            days: req.body.workDays,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            frequency: req.body.frequency,
            minutes: req.body.minutes,
            user: req.user.id,
        });
        console.log("Schedule has been added!");

        // Create Streak based on the new schedule
        const dailyGoal = parseInt(req.body.frequency);
        const weeklyGoal = dailyGoal * req.body.workDays.length;
        const monthlyGoal = weeklyGoal * 4; // Approximation
        const numberCompleted = 0
        const weeklyPercent = numberCompleted / weeklyGoal
        const monthlyPercent = numberCompleted / monthlyGoal

        await Streak.create({
            user: req.user.id,
            dailyGoal: dailyGoal,
            weeklyGoal: weeklyGoal,
            monthlyGoal: monthlyGoal,
            dailyCompleted: numberCompleted,
            weeklyCompleted: numberCompleted,
            monthlyCompleted: numberCompleted,
            weeklyPercent: weeklyPercent,
            monthlyPercent: monthlyPercent
        });
        console.log("Streak has been added!");

        res.redirect("/schedule");
    } catch (err) {
        console.log("Error in createScheduleAndStreak: ", err);
        res.status(500).send("An error occurred while creating the schedule and streak.");
    }
},


//   createSchedule: async (req, res) => {
//     try {
//       await Schedule.create({
//         days: req.body.workDays,
//         startTime: req.body.startTime,
//         endTime: req.body.endTime,
//         frequency: req.body.frequency,
//         minutes: req.body.minutes,
//         user: req.user.id,
//       });
//       console.log("Schedule has been added!");
//       res.redirect("/schedule");
//     } catch (err) {
//       console.log(err);
//     }
//   },
//   createStreak: async (req, res) => {
//     try {
//         const { user, workDays, frequency } = req.body; // Extract data from request
//         const weeklyGoal = dailyGoal * workDays.length;
//         const monthlyGoal = weeklyGoal * 4; // Approximation

//         await Streak.create({
//             user: user,
//             dailyGoal: frequency,
//             weeklyGoal: weeklyGoal,
//             monthlyGoal: monthlyGoal,
//             dailyCompleted: 0,
//             weeklyCompleted: 0,
//             monthlyCompleted: 0,
//             weeklyPercent: 0,
//             monthlyPercent: 0,
//         });
//       console.log("Streak has been added!");
//       // res.redirect("/schedule");
//     } catch (err) {
//       console.log(err);
//     }
// },
  updateSchedule: async (req, res) => {
    try {

      let scheduleObject ={         
        days: req.body.workDays,
        frequency: req.body.frequency,
        minutes: req.body.minutes, 
      }

      if(req.body.endTime > req.body.startTime){
        scheduleObject.startTime = req.body.startTime
        scheduleObject.endTime = req.body.endTime
      } else{
        req.flash("Invalide start/end time", { msg: "End time cannot be less than start time" });
      }

      await Schedule.findOneAndUpdate(
        {user: req.user.id },
        {
          $set: scheduleObject,
        }
      );
      console.log("Schedule has been updated!");
      res.redirect("/schedule");
    } catch (err) {
      console.log(err);
    }
  },
  editStreak: async (req, res) => {
    try {
        const streak = await Streak.findOne({ _id: req.user.id });
        if (!streak) {
            return res.status(404).json({ message: "Streak not found" });
        }

        streak.dailyCompleted++;
        streak.weeklyCompleted++;
        streak.monthlyCompleted++;
        const weeklyPercent = (streak.weeklyCompleted / streak.weeklyGoal) * 100;
        const monthlyPercent = (streak.monthlyCompleted / streak.monthlyGoal) * 100;

        await streak.save();

        res.status(200).json(streak);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "An error occurred while updating the streak." });
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
