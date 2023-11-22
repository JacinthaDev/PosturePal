const mongoose = require("mongoose");

const ScheduleSchema = new mongoose.Schema({
days: {
    type: [String],
    required: true,
},
startTime: {
    type: String,
    required: true,
    validate: {
        validator: function(v) {
            return /\d{2}:\d{2}/.test(v); // Validates format like "14:30"
        },
        message: props => `${props.value} is not a valid time format!`
    }
},
endTime: {
    type: String,
    required: true,
    validate: {
        validator: function(v) {
            return /\d{2}:\d{2}/.test(v); // Validates format like "14:30"
        },
        message: props => `${props.value} is not a valid time format!`
    }
},
frequency: {
    type: Number,
    required: true,
},
minutes: {
    type: Number,
    required: true,
},
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
},
createdAt: {
    type: Date,
    default: Date.now,
},
});

module.exports = mongoose.model("Schedule", ScheduleSchema);