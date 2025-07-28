require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { Users, ForgotPassword } = require("../modals");
const sequelize = require("../utils/db-connection");
const Sib = require("sib-api-v3-sdk");
const bcrypt = require("bcrypt");

const client = Sib.ApiClient.instance;

const apiKey = client.authentications["api-key"];
console.log("loaded api_key:", process.env.API_KEY);
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
  email: process.env.EMAIL,
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("received email:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const id = uuidv4();
    await ForgotPassword.create({
      id,
      UserId: user.id,
      isactive: true,
    });

    const resetLink = `http://localhost:4000/password/resetpassword/${id}`;

    await tranEmailApi.sendTransacEmail({
      sender,
      to: [{ email }],
      subject: "Rest password link",
      htmlContent: `
        <p>Hello,</p>
        <p>Click the link below to reset your password:</p>
        <a href=${resetLink}>Reset Password</a>
        `,
    });

    res
      .status(200)
      .json({
        message: "Password reset link sent successfully",
        email: user.email,
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getResetPasswordForm = async (req, res) => {
  try {
    const id = req.params.id;
    const request = await ForgotPassword.findOne({ where: { id } });

    if (!request || !request.isactive) {
      return res.status(400).send("<h2>Reset link expired or invalid</h2>");
    }

    res.send(`
      <form action="/password/updatepassword/${id}" method="POST">
        <label>New Password:</label>
        <input type="password" name="password" required/>
        <button type="submit">Update Password</button>
      </form>
    `);
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
};

const updatePassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { password } = req.body;

    const request = await ForgotPassword.findOne({ where: { id } });
    if (!request || !request.isactive) {
      return res.status(400).send("Reset request expired or invalid");
    }

    const user = await Users.findByPk(request.UserId);
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    request.isactive = false;
    await request.save();

    res.send("Password updated successfully. You can now log in.");
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to update password");
  }
};

module.exports = {
  forgotPassword,
  getResetPasswordForm,
  updatePassword,
};
