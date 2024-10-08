const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const homeController = require("../controllers/home");
const stretchesController = require("../controllers/stretches");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Main Routes - simplified for now
router.get("/", authController.mockLogin) // Automatically log in when visiting the root
router.get("/", homeController.getIndex);
router.get("/profile", ensureAuth, stretchesController.getProfile);
router.get("/schedule", ensureAuth, stretchesController.getSchedule);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
