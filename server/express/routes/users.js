const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const saltRounds = 10;

function genHash(password) {
  const salt = bcrypt.genSaltSync(saltRounds);
  return bcrypt.hashSync(password, salt);
}

function verifyHash(password, hash) {
  return bcrypt.compareSync(password, hash);
}

/**
 * Returns the user information by username.
 * @param {string} username Username.
 * @return User information, or null if it is not found in the database.
 */
function getUser(username) {
  try {
    const users = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "users.json"))
    );
    return users.find((u) => u.username === username) || null;
  } catch (err) {
    return null;
  }
}

module.exports = {
  getUser,
  verifyHash,
  genHash,
};
