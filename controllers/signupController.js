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

const loginUsers = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All the fields are require" });
  }

  try {
    const user = await Users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addSignedUpUsers,
  loginUsers,
};
