const express = require("express");
const app = express();
const db = require("./utils/db-connection");
const cors = require("cors");
const signupRouter = require("./routes/signupRoute");
const expensesRouter = require("./routes/expensesRoute");
const paymentRouter = require("./routes/paymentRoute");
const preiumRouter = require("./routes/premiumRoute");
const passRouter = require("./routes/forgotPassRoute");

app.use(cors());
app.use(express.json());

const userModal = require("./modals/Users");
const expenseModal = require("./modals/Expenses");
const indexModal = require("./modals/index");
const orderModal = require("./modals/Orders");

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

app.use("/users", signupRouter);
app.use("/expenses", expensesRouter);
app.use("/payment", paymentRouter);
app.use("/premium", preiumRouter);
app.use("/password", passRouter);

db.sync({ force: true })
  .then(() => {
    app.listen(4000, () => {
      console.log("Server is Running on http://localhost:4000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
