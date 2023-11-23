const mongoose = require("mongoose");

const StreakSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dailyGoal: {
        type: Number,
        required: true
    },
    weeklyGoal: {
        type: Number,
        required: true
    },
    monthlyGoal: {
        type: Number,
    },
    dailyCompleted: {
        type: Number,
        default: 0
    },
    weeklyCompleted: {
        type: Number,
        default: 0
    },
    monthlyCompleted: {
        type: Number,
        default: 0
    },
    weeklyPercent: {
        type: Number,
        default: 0
    },
    monthlyPercent: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Streak", StreakSchema);
