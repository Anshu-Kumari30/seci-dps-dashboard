const { User, DeptMaster, UserEditAccess } = require("../models").models;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
      }
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
      defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    } else if (role === "user") {
      defaultPassword = process.env.DEFAULT_USER_PASSWORD;
    } else {
      return res
        .status(400)
        .json({ error: "Invalid role. Must be 'admin' or 'user'." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create the user
    const newUser = await User.create({
      name,
      email,
      role,
      password: hashedPassword,
      // user_id and is_active are set automatically by default values
    });

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

    // Sequelize unique constraint error
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "Email already exists." });
    }

    return res
      .status(500)
      .json({ error: "An error occurred while creating the user." });
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
};
