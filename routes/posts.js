const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const postsController = require("../controllers/posts");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Post Routes - simplified for now
router.get("/", postsController.getStretches);
router.post("/", postsController.createScheduleAndStreak);
router.put("/", postsController.updateScheduleAndStreak);
router.post("/addComment/:id", upload.single("file"), postsController.addComment);
router.put("/editStreak", postsController.editStreak);
router.put("/skipped", postsController.skipped);
router.delete("/deletePost/:id", postsController.deletePost);



module.exports = router;
