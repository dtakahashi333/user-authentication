import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "./VerifyEmail.module.css";
import reactLogo from "./assets/react.svg";

const emailValidator = (email) => {
  return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
};

function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [confirm, setConfirm] = useState("");
  const [emptyEmailError, setEmptyEmailError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [confirmError, setConfirmError] = useState(false);

  function validateEmail() {
    if (email.length === 0) {
      setEmptyEmailError(true);
      setEmailError(false);
      return false;
    } else {
      setEmptyEmailError(false);
      if (emailValidator(email)) {
        setEmailError(false);
        return true;
      } else {
        setEmailError(true);
        return false;
      }
    }
  }

  function confirmEmail() {
    if (email === confirm) {
      setConfirmError(false);
      return true;
    } else {
      setConfirmError(true);
      return false;
    }
  }

  function onSubmit(event) {
    // Prevent the submit default behavior.
    event.preventDefault();

    // validateEmail() and confirmEmail() trigger error messages.
    const emailValidated = validateEmail();
    const emailConfirmed = confirmEmail();

    if (emailValidated && emailConfirmed) {
      //TODO: Submit
      setEmail("");
      setConfirm("");
    }
  }

  return (
    <main className={styles.container}>
      <div className={styles["register-box"]}>
        <img src={reactLogo} alt="React Logo" height={100}></img>
        <h1>Sign Up</h1>
        <form className={styles.form} onSubmit={onSubmit}>
          <section className={styles.email}>
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              className="form-control"
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            {emailError ? (
              <p className={styles.error}>Error: Wrong email format</p>
            ) : (
              <>
                {emptyEmailError ? (
                  <p className={styles.error}>
                    Error: Please enter your email address
                  </p>
                ) : (
                  ""
                )}
              </>
            )}
          </section>
          <section className={styles["confirm-email"]}>
            <label className="form-label" htmlFor="confirm-email">
              Confirm Email Address
            </label>
            <input
              className="form-control"
              type="email"
              id="confirm-email"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            ></input>
            {confirmError ? (
              <p className={styles.error}>
                Error: Email addresses do not match
              </p>
            ) : (
              ""
            )}
          </section>
          <section className={styles["verify-button"]}>
            <button className="btn btn-primary full-width" type="submit">
              Submit
            </button>
          </section>
        </form>
      </div>
    </main>
  );
}

export default VerifyEmail;
