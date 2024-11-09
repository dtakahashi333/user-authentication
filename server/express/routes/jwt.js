const jwt = require("jsonwebtoken");

/**
 * Return a JWT.
 * @param {Object} payload The JWT payload. Do not include any sensitive information.
 */
function generateJwt(payload) {
  return jwt.sign(
    payload,
    process.env.JWTSECRET, // your-256-bit-secret. 32-ACSII-characters?
    {
      algorithm: "HS256", // Use default
      expiresIn: "1h",
      audience: process.env.JWTAUDIENCE || "",
      issuer: process.env.JWTISSUER || "",
      subject: process.env.JWTSUBJECT || "",
    }
  );
}

function verifyJwt(token) {
  try {
    return jwt.verify(token, process.env.JWTSECRET, {
      audience: process.env.JWTAUDIENCE || "",
      issuer: process.env.JWTISSUER || "",
      subject: process.env.JWTSUBJECT || "",
    });
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateJwt,
  verifyJwt,
};
