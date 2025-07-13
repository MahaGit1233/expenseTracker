const Users = require("../modals/Users");
const db = require("../utils/db-connection");

const addSignedUpUsers = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await Users.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const user = await Users.create({
      name: name,
      email: email,
      password: password,
    });

    res.status(200).json({ message: `User with name: ${name} is added` });
  } catch (error) {
    res.status(500).send("Unable to add the user");
  }
};

module.exports = {
  addSignedUpUsers,
};
