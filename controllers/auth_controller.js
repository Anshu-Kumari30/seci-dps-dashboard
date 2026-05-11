const { User, DeptMaster, UserEditAccess } = require("../models").models;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const logger = require("../logger");
const { sendMail } = require("../utils/mailer");
const crypto = require("crypto");

require("dotenv").config(); // Load environment variables from .env file

// Get all active users (excluding passwords)
async function login_user(req, res) {
  const { email, password } = req.body;

  const bcrypt = require("bcrypt");

  try {
    await User.findOne({
      where: { email: email, is_active: true },
    }).then(async (user) => {
      if (!user) {
        return res
          .status(401)
          .json({ error: "Invalid credentials or user not active" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        const token = jwt.sign(
          {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
            name: user.name,
          },
          process.env.JWT_SECRET, // 🔐 store this securely, use env var in production
          { expiresIn: "1h" } // optional: token expiry
        );

        res.status(200).json({
          message: "Login successful",
          login_token: token,
          app_environment: process.env.NODE_ENV,
        });
        return;
      }
      return res.status(401).json({ error: "Invalid credentials" });
    });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getAllUsers(req, res) {
  try {
    const foundUsers = await User.findAll();
    res.json(foundUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function manageUser(req, res) {
  try {
    const { user_id } = req.params;
    const { is_active } = req.body;
    await User.update(
      { is_active: is_active },
      {
        where: { user_id },
      }
    );
    res.json({ message: "User status updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, role } = req.body;

    // Validate required fields
    if (!name || !email || !role) {
      return res
        .status(400)
        .json({ error: "Name, email, and role are required." });
    }

    // Determine default password based on role
    let defaultPassword;
    if (role === "admin") {
      defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin1234";
    } else if (role === "user") {
      defaultPassword = process.env.DEFAULT_USER_PASSWORD || "user1234";
    } else {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'admin' or 'user'." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    logger.info("Hashed password generated", { hashedPassword });

    // Create the user
    const newUser = await User.create({
      name,
      email,
      role,
      password: hashedPassword,
      // user_id and is_active are set automatically by default values
    });

    logger.info("New user created", { newUser });

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        is_active: newUser.is_active,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);

    logger.error("Error while creating user", {
  message: error.message,
  stack: error.stack,
  name: error.name,
  errors: error.errors, // Sequelize validation errors
});

    // Sequelize unique constraint error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already exists." });
    }

    return res.status(500).json({
		error: error.message,
		details: error.errors || null,
	});
  }
}

async function editUserDepartmentMapping(req, res) {
  const mappings = req.body.mappings; // expecting [{ user_id, dept_id, action }, ...]

  if (!Array.isArray(mappings)) {
    return res
      .status(400)
      .json({ error: "Invalid mappings format. Expected an array." });
  }

  try {
    // Start a transaction safely using the UserEditAccess model
    const transaction = await UserEditAccess.sequelize.transaction();

    try {
      for (const mapping of mappings) {
        const { user_id, dept_id, action } = mapping;

        // Validate payload
        if (!user_id || !dept_id || !action) continue;
        

        // Check if user exists
        const userExists = await User.findOne({
          where: { user_id, is_active: true },
          transaction,
        });

        if (!userExists) {
          console.warn(`Skipping: User ${user_id} not found or inactive`);
          continue;
        }

        // Check if department exists
        const deptExists = await DeptMaster.findOne({
          where: { dept_id, is_active: true },
          transaction,
        });

        if (!deptExists) {
          console.warn(`Skipping: Dept ${dept_id} not found or inactive`);
          continue;
        }

        // Handle add/remove mapping logic
        if (action === "add") {
          const exists = await UserEditAccess.findOne({
            where: { user_id, dept_id },
            transaction,
          });

          if (!exists) {
            await UserEditAccess.create({ user_id, dept_id }, { transaction });
          }
        } else if (action === "remove") {
          await UserEditAccess.destroy({
            where: { user_id, dept_id },
            transaction,
          });
        }
      }

      // Commit the transaction if all operations succeed
      await transaction.commit();

      return res.json({ message: "Mappings updated successfully" });
    } catch (err) {
      // Rollback if something goes wrong inside the loop
      await transaction.rollback();
      console.error("Error processing mappings:", err);
      return res.status(500).json({ error: "Failed to update mappings" });
    }
  } catch (error) {
    console.error("Transaction initialization error:", error);
    return res.status(500).json({ error: "Failed to start transaction" });
  }
}

module.exports = {
  login_user,
  getAllUsers,
  manageUser,
  createUser,
  editUserDepartmentMapping,
  // password helpers exported
  forgotPassword,
  resetPassword,
};

// ---------------- Password reset flow ----------------
async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) return res.json({ message: 'If an account exists, a reset email will be sent.' });

    // create a token and expiry (1 hour)
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 3600 * 1000;

    // store token + expiry on user record (add temporary fields)
    await user.update({ reset_token: token, reset_token_expires: new Date(expiresAt) });

    const resetUrl = `${req.protocol}://${req.get('host')}/reset_password.html?token=${token}&email=${encodeURIComponent(email)}`;

    const subject = 'Password reset instructions';
    const text = `You requested a password reset. Use the link: ${resetUrl} (valid 1 hour)`;

    // send mail, but do not fail if mail fails
    try {
      const info = await sendMail({ to: email, subject, text });
      console.log('Password reset mail sent', { to: email, response: info && info.response });
    } catch (mailErr) {
      console.warn('Failed to send reset mail', mailErr && mailErr.message ? mailErr.message : mailErr);
      if (mailErr && mailErr.response) console.warn('SMTP response', mailErr.response);
    }

    return res.json({ message: 'If an account exists, a reset email will be sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function resetPassword(req, res) {
  const { email, token, new_password } = req.body;
  if (!email || !token || !new_password) return res.status(400).json({ error: 'Missing parameters' });

  try {
    const user = await User.findOne({ where: { email, is_active: true } });
    if (!user) return res.status(400).json({ error: 'Invalid token or user' });

    if (!user.reset_token || user.reset_token !== token) return res.status(400).json({ error: 'Invalid token' });
    if (!user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) return res.status(400).json({ error: 'Token expired' });

    const hashed = await bcrypt.hash(new_password, 10);
    await user.update({ password: hashed, reset_token: null, reset_token_expires: null });

    return res.json({ message: 'Password has been reset' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
