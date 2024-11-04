const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const { getUser, verifyHash, genHash } = require("./users");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

const jwtSecret = "A cat on a lap";

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      session: false,
    },
    (username, password, cb) => {
      try {
        const user = getUser(username);
        if (!user) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        // Verify the password.
        if (!verifyHash(password, user.password_hash)) {
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        return cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

// Passport serializes and deserializes user information to and from the session.
// passport.serializeUser is called when a credential is successfully verified.
passport.serializeUser((user, cb) => {
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});
passport.deserializeUser((user, cb) => {
  process.nextTick(() => {
    return cb(null, user);
  });
});

// router.get("/login", (req, res) => {
//   res.sendFile(path.join(process.cwd(), "views", "login.html"));
// });

// router.post('/login/password', passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }))
router.post("/login/password", passport.authenticate("local"), (req, res) => {
  if (req.user) {
    // Create a JWT.
    const token = jwt.sign(
      {
        username: req.user.username,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );
    // Set a JWT with a success status.
    res.cookie("access_token", token, {
      httpOnly: true,
      sameSite: "none",
    });
    // Use JSend format for a JSON response.
    return res.json({
      status: "success",
      data: {
        token,
      },
    });
  } else {
    // Unauthorized.
    return res.status(401).end();
  }
});

router.post("/users/create/user", (req, res) => {
  try {
    // Get the username and password from the request body.
    const username = req.body.username;
    const password = req.body.password;

    const usersJson = path.join(process.cwd(), "users.json");

    let users = null;
    try {
      users = JSON.parse(
        fs.readFileSync(usersJson, {
          encoding: "utf-8",
        })
      );
    } catch (err) {
      // The users.json file has not been created yet.
      users = [];
    }

    const user = users.find((user) =>
      new RegExp(`^${_.escapeRegExp(user)}$`, "i").test(username)
    );
    if (user) {
      return res.status(409).json({
        status: "fail",
        data: {
          username: "Username already exists",
        },
      });
    } else {
      // Get the max ID.
      const maxId = Math.max(...users.map((user) => user.id));
      users.push({
        id: maxId + 1,
        username,
        password_hash: genHash(password),
      });
      fs.writeFileSync(usersJson, JSON.stringify(users), { encoding: "utf-8" });
      return res.json({
        status: "success",
      });
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Unable to create a user account",
    });
  }
});

module.exports = router;
