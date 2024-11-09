const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const _ = require("lodash");

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWTSECRET,
      issuer: process.env.JWTISSUER,
      audience: process.env.JWTAUDIENCE,
    },
    (payload, done) => {
      // Retrieve the username from the payload.
      username = payload.username;

      try {
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
          new RegExp(`^${_.escapeRegExp(user.username)}$`, "i").test(username)
        );
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

router.get(
  "/employees",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Read the employee data.
      const data = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "data.json"), {
          encoding: "utf-8",
        })
      );
      // Use JSend format for a JSON response.
      return res.json({
        status: "success",
        ...data,
      });
    } catch (err) {
      return res.status(404).json({
        status: "failure",
        data: null,
      });
    }
  }
);

module.exports = router;
