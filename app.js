const express = require("express");
const app = express();
const db = require("./utils/db-connection");
const cors = require("cors");
const signupRouter = require("./routes/signupRoute");
const expensesRouter = require("./routes/expensesRoute");

app.use(cors());
app.use(express.json());

const userModal = require("./modals/Users");
const expenseModal = require("./modals/Expenses");
const indexModal = require("./modals/index");

app.get("/", (req, res) => {
  res.send("<h1>Hello World</h1>");
});

app.use("/users", signupRouter);
app.use("/expenses", expensesRouter);

db.sync({ force: true })
  .then(() => {
    app.listen(4000, () => {
      console.log("Server is Running on http://localhost:4000");
    });
  })
  .catch((err) => {
    console.log(err);
  });
