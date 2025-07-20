const express = require("express");
const router = express.Router();
const premiumContoller = require("../controllers/premiumController");
const { authenticate } = require("../middleware/auth");

router.get("/leaderboard", authenticate, premiumContoller.getPremiumExpenses);

module.exports = router;
