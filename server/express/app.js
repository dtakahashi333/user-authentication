// Load application sepcific environment variables.
require("dotenv").config();

const express = require("express");
const app = express();
const session = require("express-session");
const passport = require("passport");
// const SQLiteStore = require('connect-sqlite3')(session)
const path = require("path");
const fs = require("fs");
const https = require("https");
const http = require("http");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const _ = require("lodash");

const employeesRouter = require("./routes/employees");
const authRouter = require("./routes/auth");
const emailRouter = require("./routes/email");

// const port = 443
const port = process.env.PORT || 3333;

app.use(cookieParser());

// Security

// Accept Cross-Origin-Resource-Sharing
const originAllowlist = ["http://localhost:5173", "http://localhost:4200"];
const methodAllowlist = ["GET", "POST", "DELETE", "OPTIONS"];

function isPreflight(req) {
  return (
    req.method == "OPTIONS" &&
    req.get("Origin") != "" &&
    req.get("Access-Control-Request-Method") != ""
  );
}

// https://eli.thegreenplace.net/2023/introduction-to-cors-for-go-programmers/
// https://stackoverflow.com/questions/22972066/how-to-handle-preflight-cors-requests-on-a-go-server
// https://cors-errors.info/error-messages
// https://github.com/rs/cors/blob/master/cors.go
// https://github.com/expressjs/cors/blob/master/lib/index.js
function checkCORS(options) {
  const allowedOrigins = options.origin || [];
  const allowedMethods = options.method || [];
  return (req, res, next) => {
    if (isPreflight(req)) {
      const origin = req.get("Origin");
      const method = req.get("Access-Control-Request-Method");
      const reqHeaders = req.get("Access-Control-Request-Headers");
      if (
        _.includes(allowedOrigins, origin) &&
        _.includes(allowedMethods, method)
      ) {
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Access-Control-Allow-Methods", allowedMethods.join(", "));
        if (reqHeaders) {
          res.set("Access-Control-Allow-Headers", reqHeaders);
        }
        res.set("Vary", "Origin");
        res.set("Content-Length", "0");
      }
      res.end();
    } else {
      // Not a preflight: regular request.
      const origin = req.get("Origin");
      if (_.includes(allowedOrigins, origin)) {
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Vary", "Origin");
      }
      next();
    }
  };
}

app.use(
  checkCORS({
    origin: originAllowlist,
    method: methodAllowlist,
  })
);

// app.use(
//   cors({
//     origin: originAllowlist,
//   })
// );

// Reduce fingerprinting
app.disable("x-powered-by");

//
// Helmet defaults
//
// Cross-Origin-Opener-Policy: same-origin
// Cross-Origin-Resource-Policy: same-origin
// Origin-Agent-Cluster: ?1
// Referrer-Policy: no-referrer
// Strict-Transport-Security: max-age=15552000; includeSubDomains
// X-Content-Type-Options: nosniff
// X-DNS-Prefetch-Control: off
// X-Download-Options: noopen
// X-Frame-Options: SAMEORIGIN
// X-Permitted-Cross-Domain-Policies: none
// X-XSS-Protection: 0

//
// Helmet defaults
//
// Content-Security-Policy:
//      default-src 'self';
//      base-uri 'self';
//      font-src 'self' https: data:;
//      form-action 'self';
//      frame-ancestors 'self';
//      img-src 'self' data:;
//      object-src 'none';
//      script-src 'self';
//      script-src-attr 'none';
//      style-src 'self' https: 'unsafe-inline';
//      upgrade-insecure-requests

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "font-src": [
        "'self'",
        "https://fonts.gstatic.com",
        "https://fonts.googleapis.com",
      ],
      "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com",
      ],
      "script-src": ["'self'", "https://cdn.jsdelivr.net"],
    },
  })
);

// Sets "X-Frame-Options: DENY"
app.use(
  helmet.frameguard({
    action: "deny",
  })
);

// Sets "Strict-Transport-Security: max-age=123456; includeSubDomains; preload"
app.use(
  helmet.strictTransportSecurity({
    maxAge: 63072000,
    preload: true,
  })
);

app.use((req, res, next) => {
  // Discussion about disabling X-XSS-Protection: https://github.com/helmetjs/helmet/issues/230
  res.setHeader("X-XSS-Protection", "1");
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.set('trust proxy', 1) // trust first proxy
// app.set(express.static(path.join(__dirname, 'public')))

// References:
// - https://www.passportjs.org/concepts/authentication/sessions/
app.use(
  session({
    secret: "a cat on a lap",
    resave: false,
    saveUninitialized: false,
    // store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
    },
  })
);
// As the user navigates from page to page, the session itself can be authenticated using the built-in session strategy.
app.use(passport.authenticate("session"));

app.use("/", authRouter);
app.use("/", emailRouter);
app.use("/", employeesRouter);

// How to make a Self-Signed SSL.
// https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu
//
// sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt

// const options = {
//   key: fs.readFileSync(
//     path.join(process.cwd(), "sslcert", "express-selfsigned.key")
//   ),
//   cert: fs.readFileSync(
//     path.join(process.cwd(), "sslcert", "express-selfsigned.crt")
//   ),
//   ciphers: [
//     "ECDHE-ECDSA-AES256-GCM-SHA384",
//     "ECDHE-RSA-AES256-GCM-SHA384",
//     "ECDHE-ECDSA-CHACHA20-POLY1305",
//     "ECDHE-RSA-CHACHA20-POLY1305",
//     "ECDHE-ECDSA-AES128-GCM-SHA256",
//     "ECDHE-RSA-AES128-GCM-SHA256",
//     "ECDHE-ECDSA-AES256-SHA384",
//     "ECDHE-RSA-AES256-SHA384",
//     "ECDHE-ECDSA-AES128-SHA256",
//     "ECDHE-RSA-AES128-SHA256",
//   ].join(":"),
// };

// const server = https.createServer(options, app)
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
