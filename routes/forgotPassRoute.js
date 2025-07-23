const express = require("express");
const router = express.Router();
const passController = require("../controllers/forgotPassController");

router.post("/forgotpassword", passController.forgotPassword);
router.get("/resetpassword/:id", passController.getResetPasswordForm);
router.post("/updatepassword/:id", passController.updatePassword);

module.exports = router;
