const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/moawauth", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  createdAt: Date,
});

const User = mongoose.model("User", userSchema);

async function insertAdmin() {
  try {
    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      console.log("Admin already exists.");
      return process.exit();
    }

    await User.create({
      username: "gogogo",
      password: "$2a$10$N9qo8uLOickgx2ZMRZoMy.MrYFJYJWK4qjQZRg1JxZ8Jw8yQJWQ2W", // "admin123" hashed
      role: "admin",
      createdAt: new Date(),
    });

    console.log("Admin user inserted!");
  } catch (err) {
    console.error("Error inserting admin:", err);
  } finally {
    mongoose.disconnect();
  }
}

insertAdmin();
