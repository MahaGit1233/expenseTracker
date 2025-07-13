const express = require("express");
const router = express.Router();
const signupController = require("../controllers/signupController");

router.post("/signup", signupController.addSignedUpUsers);
router.post("/login", signupController.loginUsers);

module.exports = router;
