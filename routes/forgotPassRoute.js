const express = require("express");
const router = express.Router();
const passController = require("../controllers/forgotPassController");

router.post("/forgotpassword", passController.forgotPassword);

module.exports = router;
