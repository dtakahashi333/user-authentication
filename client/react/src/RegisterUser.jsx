import React, { useRef, useState } from "react";
import axios from "axios";
import styles from "./RegisterUser.module.css";

const requirements = [
  "A numeric character",
  "A minimum of 8 characters",
  "An uppercase character",
  "A special character",
  "A lowercase character",
  "An alphabetic character",
];
const reqObjects = requirements.map((req, i) => ({
  id: i,
  title: req,
}));

const usernameValidator = (username) => {
  return /^[a-zA-Z][a-zA-Z0-9_\.]{4,99}$/.test(username);
};

const passwordValidator = (password) => {
  if (password.length < 8) {
    return false;
  }
  if (
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[!"#\$%&'\(\)\*\+,-\.:<=>\?@\[\\\]\^{\|}~]/.test(password)
  ) {
    return false;
  }
  return true;
};

function RegisterUser() {
  const username = useRef(null);
  const password = useRef(null);
  const verify = useRef(null);
  const [emptyUsernameError, setEmptyUsernameError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [emptyPasswordError, setEmptyPasswordError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [verifyError, setVerifyError] = useState(false);

  function validateUsername() {
    const _username = username.current.value;
    if (_username.length === 0) {
      setEmptyUsernameError(true);
      setUsernameError(false);
      return false;
    } else {
      setEmptyUsernameError(false);
      if (usernameValidator(_username)) {
        setUsernameError(false);
        return true;
      } else {
        setUsernameError(true);
        return false;
      }
    }
  }

  function validatePassword() {
    const _password = password.current.value;
    if (_password.length === 0) {
      setEmptyPasswordError(true);
      setPasswordError(false);
      return false;
    } else {
      setEmptyPasswordError(false);
      if (passwordValidator(_password)) {
        setPasswordError(false);
        return true;
      } else {
        setPasswordError(true);
        return false;
      }
    }
  }

  function verifyPassword() {
    if (password.current.value === verify.current.value) {
      setVerifyError(false);
      return true;
    } else {
      setVerifyError(true);
      return false;
    }
  }

  function onSubmit(event) {
    // Prevent the submit default behavior.
    event.preventDefault();

    // Validate the input values.
    const usernameValidated = validateUsername();
    const passwordValidated = validatePassword();
    const passwordVerified = verifyPassword();

    if (usernameValidated && passwordValidated && passwordVerified) {
      //TODO: Submit
      axios
        .post(
          "/users/create/user",
          {
            username: username.current.value,
            password: password.current.value,
            verify: verify.current.value,
          },
          {
            baseURL: "http://localhost:3333",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          username.current.value = "";
          password.current.value = "";
          verify.current.value = "";
        });
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles["register-box"]}>
        <h1>Create Account</h1>
        <section style={{ fontSize: "14px" }}>
          <label>Password Requirements:</label>
          <ul className={styles["password-requirements"]}>
            {reqObjects.map((req) => (
              // Prefer not to use dynamically generated keys.
              <li key={req.id}>{req.title}</li>
            ))}
          </ul>
        </section>
        <form onSubmit={onSubmit} className={styles.form}>
          <section className={styles.username}>
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              className="form-control"
              type="text"
              id="username"
              ref={username}
            ></input>
            {usernameError ? (
              <p className={styles.error}>Error: Wrong username format</p>
            ) : (
              <>
                {emptyUsernameError ? (
                  <p className={styles.error}>
                    Error: Please enter your username
                  </p>
                ) : (
                  ""
                )}
              </>
            )}
          </section>
          <section className={styles.password}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              className="form-control"
              type="password"
              id="password"
              onChange={validatePassword}
              ref={password}
            ></input>
            {passwordError ? (
              <p className={styles.error}>Error: Wrong password format</p>
            ) : (
              <>
                {emptyPasswordError ? (
                  <p className={styles.error}>
                    Error: Please enter your password
                  </p>
                ) : (
                  ""
                )}
              </>
            )}
          </section>
          <section className={styles.verify}>
            <label className="form-label" htmlFor="verify">
              Verify New Password
            </label>
            <input
              className="form-control"
              type="password"
              id="verify"
              ref={verify}
            ></input>
            {verifyError ? (
              <p className={styles.error}>Error: Passwords do not match</p>
            ) : (
              ""
            )}
          </section>
          <section className={styles["create-button"]}>
            <button className="btn btn-primary full-width" type="submit">
              Create Account
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}

export default RegisterUser;
