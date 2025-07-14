const express = require("express");
const router = express.Router();
const expensesController = require("../controllers/expensesController");

router.post("/add", expensesController.addExpenses);
router.get("/get", expensesController.getExpenses);
router.delete("/delete/:id", expensesController.deleteExpenses);

module.exports = router;
