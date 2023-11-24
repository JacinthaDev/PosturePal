const Post = require("../models/Post");
const Schedule = require("../models/Schedule");
const Streak = require('../models/Streak');

// Helper function to convert to 12-hour format
function convertTo12Hour(time) {
    let [hours, minutes] = time.split(':');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

module.exports = {
    getProfile: async (req, res) => {
        try {
            const streak = await Streak.find({ user: req.user.id }).lean();
            const schedule = await Schedule.find({ user: req.user.id }).lean();

            if (schedule.length > 0) {

                res.render("profile.ejs", {
                    user: req.user, 
                    streak: streak, 
                    schedule: schedule, 
                });
            } else {
                res.render("profile.ejs", { user: req.user, streak: [], schedule: [] });
            }
        } catch (err) {
            console.log(err);
            res.render("error.ejs", { error: err }); // Render an error page or handle the error appropriately
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
            user: req.user.id,
        });
        console.log("Schedule has been added!");

        // Create Streak based on the new schedule
        const dailyGoal = parseInt(req.body.frequency);
        const weeklyGoal = dailyGoal * req.body.workDays.length;
        const monthlyGoal = weeklyGoal * 4; // Approximation

        await Streak.create({
            user: req.user.id,
            dailyGoal: dailyGoal,
            weeklyGoal: weeklyGoal,
            monthlyGoal: monthlyGoal,
            dailyCompleted: 0,
            weeklyCompleted: 0,
            monthlyCompleted: 0,
            weeklyPercent: 0,
            monthlyPercent: 0,
            skippedToday: 0,
            skippedThisWeek: 0,
            skippedThisMonth: 0,
        });
        console.log("Streak has been added!");

        res.redirect("/schedule");
    } catch (err) {
        console.log("Error in createScheduleAndStreak: ", err);
        res.status(500).send("An error occurred while creating the schedule and streak.");
    }
},
updateScheduleAndStreak: async (req, res) => {
  try {
      let scheduleObject = {         
          days: req.body.workDays,
          frequency: req.body.frequency,
          minutes: req.body.minutes, 
      };

      if (req.body.endTime > req.body.startTime) {
          scheduleObject.startTime = req.body.startTime;
          scheduleObject.endTime = req.body.endTime;
      } else {
          req.flash("error", "End time cannot be less than start time");
          return res.redirect("/schedule"); // Redirect back if times are invalid
      }

      await Schedule.findOneAndUpdate({ user: req.user.id }, { $set: scheduleObject });

      const streak = await Streak.findOne({ user: req.user.id });
      if (!streak) {
          return res.status(404).json({ message: "Streak not found" });
      }

      streak.dailyGoal = req.body.frequency;
      streak.weeklyGoal = req.body.workDays.length * req.body.frequency;
      streak.monthlyGoal = streak.weeklyGoal * 4;
      streak.weeklyPercent = Math.floor((streak.weeklyCompleted / streak.weeklyGoal) * 100);
      streak.monthlyPercent = Math.floor((streak.monthlyCompleted / streak.monthlyGoal) * 100);

      await streak.save();

      console.log("Schedule and streak have been updated!");
      res.redirect("/schedule"); // Redirect after successful update
  } catch (err) {
      console.error("Error in updateScheduleAndStreak: ", err);
      res.status(500).json({ error: "An error occurred while updating the schedule and streak." });
  }
},

  editStreak: async (req, res) => {
    try {
        const streak = await Streak.findOne({ user: req.user.id });

        if (!streak) {
            return res.status(404).json({ message: "Streak not found" });
        }

        streak.dailyCompleted++;
        streak.weeklyCompleted++;
        streak.monthlyCompleted++;
        streak.weeklyPercent = Math.floor((streak.weeklyCompleted / streak.weeklyGoal) * 100);
        streak.monthlyPercent = Math.floor((streak.monthlyCompleted / streak.monthlyGoal) * 100);

        await streak.save();

        res.status(200).json(streak);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "An error occurred while updating the streak." });
    }
},
skipped: async (req, res) => {
  try {
      const streak = await Streak.findOne({ user: req.user.id });

      if (!streak) {
          return res.status(404).json({ message: "Streak not found" });
      }
      streak.skippedToday++;
      streak.skippedThisWeek++;
      streak.skippedThisMonth++;
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
