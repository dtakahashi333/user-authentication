require("dotenv").config();

const express = require("express");
const router = express.Router();
const dns = require("dns");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const cron = require("cron");

// Create a transporter object.
const transporter = nodemailer.createTransport({
  service: process.env.EMAILSERVICE,
  // port: 587,
  // secure: false,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD,
  },
});

function sendEmail(from, to, subject, text, html) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(
      {
        from,
        to: to.join(", "),
        subject,
        text,
        html,
      },
      (err, info) => {
        if (err) {
          console.log("Error:", err);
          reject(err);
        } else {
          console.log("Email sent:", info);
          resolve(info);
        }
      }
    );
  });
}

// console.log(`user: ${process.env.USERNAME}, pass: ${process.env.PASSWORD}`);

// Resolve DNS.
function emailDomainIsValid(emailAddress) {
  return new Promise((resolve, reject) => {
    // Get the domain from the email address.
    const domain = emailAddress.substring(emailAddress.lastIndexOf("@"));

    dns.resolveMx(domain, (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve(records.filter((rec) => rec.exchange != "").length > 0);
      }
    });
  });
}

function generateRandomString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

router.post("/emails/send/email", async (req, res) => {
  try {
    const emailAddress = req.body.emailAddress;

    // Check the domain of the email address.
    if (emailDomainIsValid(emailAddress)) {
      return res.status(400).json({
        status: "fail",
        data: {
          emailAddress: "Wrong email address",
        },
      });
    }

    // Generate a random string with the 128 character length.
    const token = generateRandomString(128);

    // const result = sendEmail(
    //   "",
    //   [],
    //   "Verify Email Address",
    //   "Click here",
    //   '<a href="#">Click here</a>'
    // );

    // Upon a successfull email delivery, save the email address and the generated token
    // in the temporary database with 48 hours of life.
    let emails;
    try {
      emails = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "emails.json"), {
          encoding: "utf-8",
        })
      );
    } catch (err) {
      emails = [];
    }

    const record = {
      id: uuidv4(),
      address: emailAddress,
      token,
      timestamp: Date.now(),
      expireIn: "2d",
    };

    const emailIndex = emails.findIndex(
      (email) => email.address === emailAddress
    );
    if (emailAddress < 0) {
      emails.push(record);
    } else {
      //TODO: duplicated email.
      emails[emailIndex] = record;
    }

    //TODO: Launch a scheduler to delete the record when it is expired.

    res.json({
      status: "success",
      data: null,
    });
  } catch (err) {}
});

router.post("/emails/verify/email", async (req, res) => {
  try {
    const token = req.body.token;

    // Look for a token in the temporary database.
    let emails;
    try {
      emails = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "emails.json"), {
          encoding: "utf-8",
        })
      );
    } catch (err) {
      emails = [];
    }

    const emailIndex = emails.findIndex((email) => email.token === token);
    if (emailIndex < 0) {
      // Verification failed.
      res.status(401).json({
        status: "fail",
        data: {
          token: "Wrong token",
        },
      });
    } else {
      // Verification succeeded.
      res.json({
        status: "success",
        data: {
          token,
        },
      });
    }
  } catch (err) {
    res.status(500).json({
      status: "error",
      data: {
        message: "Unable to verify email",
      },
    });
  }
});

module.exports = router;
