const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

const session = require("express-session");
const bcrypt = require("bcrypt");

const User = require("./models/userModel.cjs");
const Customer = require("./models/customerModel.cjs");
const Checkin = require("./models/checkinModel.cjs");
const YogaClass = require("./models/classModel.cjs");
const Package = require("./models/packageModel.cjs");
const Sale = require("./models/saleModel.cjs");

const instructorRoutes = require("./routes/instructorRoutes.cjs");

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MongoDB connection error: MONGODB_URI is not set");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// Static assets
app.use("/data", express.static(path.join(__dirname, "public", "data")));
app.use("/css", express.static(path.join(__dirname, "public", "css")));
app.use("/js", express.static(path.join(__dirname, "public", "js")));
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || "yogitrack-secret-key",
  resave: false,
  saveUninitialized: false
}));

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/index.html");
  }
  next();
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.redirect("/index.html");
    }

    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).send("Access denied");
    }

    next();
  };
}

// public entry pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Existing route modules
app.use("/api/instructor", instructorRoutes);

/*
app.use("/api/class", require("./routes/classRoutes.cjs"));
app.use("/api/customer", require("./routes/customerRoutes.cjs"));
app.use("/api/package", require("./routes/packageRoutes.cjs"));
app.use("/api/checkin", require("./routes/checkinRoutes.cjs"));
*/

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).send("Invalid username or password");
    }

    req.session.user = {
      username: user.username,
      role: user.role,
      customerId: user.customerId || ""
    };

    if (user.role === "admin") {
      return res.redirect("/htmls/all-in-one.html");
    }

    return res.redirect("/htmls/member-dashboard.html");
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).send("Server error during login");
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Username and password are required");
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const lastUserWithCustomerId = await User.find({
      customerId: { $exists: true, $ne: null }
    })
      .sort({ customerId: -1 })
      .limit(1);

    let nextNumber = 1;

    if (lastUserWithCustomerId.length > 0) {
      const lastCustomerId = lastUserWithCustomerId[0].customerId;
      const match = lastCustomerId.match(/\d+/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    const customerId = `Y${String(nextNumber).padStart(3, "0")}`;
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      passwordHash,
      role: "member",
      customerId
    });

    await newUser.save();

    // Matching customer profile for dashboard/check-ins
    await Customer.create({
      customerId,
      username,
      classBalance: 0
    });

    req.session.user = {
      username: newUser.username,
      role: newUser.role,
      customerId: newUser.customerId
    };

    return res.redirect("/htmls/member-dashboard.html");
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).send("Server error during registration");
  }
});

// LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/index.html");
  });
});

// CURRENT USER
app.get("/api/user/me", requireLogin, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.session.user.username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      username: user.username,
      role: user.role,
      customerId: user.customerId || ""
    });
  } catch (err) {
    console.error("User info error:", err.message);
    res.status(500).json({ error: "Failed to load user info" });
  }
});

// PROFILE
app.get("/api/profile/me", requireRole(["admin", "member"]), async (req, res) => {
  try {
    const user = await User.findOne({ username: req.session.user.username });
    const customer = await Customer.findOne({ customerId: req.session.user.customerId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      username: user.username,
      customerId: customer?.customerId || "",
      firstName: customer?.firstName || "",
      lastName: customer?.lastName || "",
      email: customer?.email || "",
      phone: customer?.phone || "",
      address: customer?.address || "",
      preferredContact: customer?.preferredContact || "email",
      classBalance: customer?.classBalance ?? 0
    });
  } catch (err) {
    console.error("Profile load error:", err.message);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

app.post("/api/profile/update", requireRole(["admin", "member"]), async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, preferredContact, password } = req.body;

    const user = await User.findOne({ username: req.session.user.username });
    const customer = await Customer.findOne({ customerId: req.session.user.customerId });

    if (!user || !customer) {
      return res.status(404).json({ error: "Profile not found" });
    }

    customer.firstName = firstName || "";
    customer.lastName = lastName || "";
    customer.email = email || "";
    customer.phone = phone || "";
    customer.address = address || "";
    customer.preferredContact = preferredContact || customer.preferredContact || "email";
    await customer.save();

    if (password && password.trim() !== "") {
      user.passwordHash = await bcrypt.hash(password, 10);
      await user.save();
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ADMIN RESET PASSWORD
app.post("/api/admin/reset-password", requireRole(["admin"]), async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    if (!username || !newPassword) {
      return res.status(400).json({ error: "Username and new password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// CUSTOMER / ROSTER
app.get("/api/customers", requireRole(["admin"]), async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ customerId: 1 });
    res.json(customers);
  } catch (err) {
    console.error("Customers load error:", err.message);
    res.status(500).json({ error: "Failed to load customers" });
  }
});

app.get("/api/customers/me", requireRole(["admin", "member"]), async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.session.user.customerId });

    if (!customer) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    res.json(customer);
  } catch (err) {
    console.error("Customer profile error:", err.message);
    res.status(500).json({ error: "Failed to load customer profile" });
  }
});

app.get("/api/roster", requireRole(["admin"]), async (req, res) => {
  try {
    const customers = await Customer.find({}).sort({ customerId: 1 });
    res.json(customers);
  } catch (err) {
    console.error("Roster load error:", err.message);
    res.status(500).json({ error: "Failed to load roster" });
  }
});

// CLASSES
app.get("/api/classes", requireRole(["admin", "member"]), async (req, res) => {
  try {
    const classes = await YogaClass.find({}).sort({ classId: 1 });
    res.json(classes);
  } catch (err) {
    console.error("Classes load error:", err.message);
    res.status(500).json({ error: "Failed to load classes" });
  }
});

// CHECKINS
app.get("/api/checkins/my", requireRole(["admin", "member"]), async (req, res) => {
  try {
    const checkins = await Checkin.find({
      customerId: req.session.user.customerId
    }).sort({ datetime: -1 });

    res.json(checkins);
  } catch (err) {
    console.error("Load check-ins error:", err.message);
    res.status(500).json({ error: "Failed to load check-ins" });
  }
});

app.post("/api/checkins/add", requireRole(["admin", "member"]), async (req, res) => {
  try {
    const { customerId, className, datetime } = req.body;

    if (!customerId || !className || !datetime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (req.session.user.role === "member" && customerId !== req.session.user.customerId) {
      return res.status(403).json({ error: "Unauthorized customerId" });
    }

    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ error: "Customer profile not found" });
    }

    const newCheckin = new Checkin({
      customerId,
      className,
      datetime
    });

    await newCheckin.save();

    // Running count can go positive or negative
    customer.classBalance -= 1;
    await customer.save();

    res.status(201).json({
      message: "Check-in saved successfully",
      checkin: newCheckin,
      classBalance: customer.classBalance
    });
  } catch (err) {
    console.error("Check-in save error:", err.message);
    res.status(500).json({ error: "Failed to save check-in" });
  }
});

// PACKAGES
app.get("/api/packages", requireRole(["admin", "member"]), async (req, res) => {
  try {
    const packages = await Package.find({}).sort({ packageId: 1 });
    res.json(packages);
  } catch (err) {
    console.error("Packages load error:", err.message);
    res.status(500).json({ error: "Failed to load packages" });
  }
});

app.post("/api/packages/assign", requireRole(["admin"]), async (req, res) => {
  try {
    const { customerId, packageId } = req.body;

    if (!customerId || !packageId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const customer = await Customer.findOne({ customerId });
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const pkg = await Package.findOne({ packageId });
    if (!pkg) {
      return res.status(404).json({ error: "Package not found" });
    }

    const today = new Date().toISOString().split("T")[0];

    const sale = new Sale({
      customerId,
      packageId: pkg.packageId,
      packageName: pkg.packageName,
      amountPaid: pkg.price,
      classAmount: pkg.classAmount,
      purchaseDate: today
    });

    await sale.save();

    customer.classBalance = (customer.classBalance || 0) + (pkg.classAmount || 0);
    await customer.save();

    res.status(201).json({
      message: "Package assigned successfully",
      sale,
      classBalance: customer.classBalance
    });
  } catch (err) {
    console.error("Assign package error:", err.message);
    res.status(500).json({ error: "Failed to assign package" });
  }
});

// PAGE ROUTES - ADMIN
app.get("/htmls/all-in-one.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "all-in-one.html"));
});

app.get("/htmls/dashboard.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "dashboard.html"));
});

app.get("/htmls/instructor.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "instructor.html"));
});

app.get("/htmls/customers.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "customers.html"));
});

app.get("/htmls/packages.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "packages.html"));
});

app.get("/htmls/class-schedule.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "class-schedule.html"));
});

app.get("/htmls/check-ins.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "check-ins.html"));
});

app.get("/htmls/roster.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "roster.html"));
});

app.get("/htmls/profile.html", requireRole(["admin"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "profile.html"));
});

// PAGE ROUTES - MEMBER
app.get("/htmls/member-dashboard.html", requireRole(["member"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "member-dashboard.html"));
});

app.get("/htmls/member-packages.html", requireRole(["member"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "member-packages.html"));
});

app.get("/htmls/member-class-schedule.html", requireRole(["member"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "member-class-schedule.html"));
});

app.get("/htmls/member-check-ins.html", requireRole(["member"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "member-check-ins.html"));
});

app.get("/htmls/member-profile.html", requireRole(["member"]), (req, res) => {
  res.sendFile(path.join(__dirname, "public", "htmls", "member-profile.html"));
});

// Catch-all for protected html pages
app.get("/htmls/:page", requireLogin, (req, res) => {
  res.status(404).send("Page not found");
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
  console.log(`Open http://localhost:${PORT}/index.html in your browser to view the app.`);
});