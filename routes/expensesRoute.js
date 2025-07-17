const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expensesController");
const userAuthentication = require("../middleware/auth");

router.post(
  "/add",
  userAuthentication.authenticate,
  expensesController.addExpenses
);
router.get(
  "/get",
  userAuthentication.authenticate,
  expensesController.getExpenses
);
router.delete(
  "/delete/:id",
  userAuthentication.authenticate,
  expensesController.deleteExpenses
);

module.exports = router;
