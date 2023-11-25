const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const stretchesController = require("../controllers/stretches");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/", stretchesController.getStretches);
router.post("/", stretchesController.createScheduleAndStreak);
router.put("/", stretchesController.updateScheduleAndStreak);
router.put("/editStreak", stretchesController.editStreak);
router.put("/skipped", stretchesController.skipped);




module.exports = router;
