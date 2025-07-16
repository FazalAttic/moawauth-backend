const bcrypt = require("bcrypt");

const password = "admin"; // Change this to your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
  if (err) throw err;
  console.log("Bcrypt hash:", hash);
});
