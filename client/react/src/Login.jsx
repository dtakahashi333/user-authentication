import React, { useReducer, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import styles from "./Login.module.css";
import axios from "axios";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // const [usernameError, setUsernameError] = useReducer((state, action) => {
  //   return action;
  // }, false);
  // const [passwordError, setPasswordError] = useReducer((state, action) => {
  //   return action;
  // }, false);
  // const [loginError, setLoginError] = useReducer((state, action) => {
  //   return action;
  // }, false);
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const usernameTxt = useRef();
  const passwordTxt = useRef();

  const navigate = useNavigate();
  // const location = useLocation();

  // Use useState().
  const onUsernameChanged = (event) => {
    setUsername(event.target.value.trim());
  };

  const onPasswordChanged = (event) => {
    setPassword(event.target.value.trim());
  };

  const onLoginBtnClicked = (event) => {
    // Get the current value from the elements.
    const _username = usernameTxt.current.value.trim();
    const _password = passwordTxt.current.value.trim();

    if (_username && _password) {
      // fetch("http://localhost:3333/login/password", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     username: _username,
      //     password: _password,
      //   }),
      // })
      //   .then((response) => response.json())
      //   .then((json) => {
      //     if (json.status === "success") {
      //       // Set the token in the localStorage.
      //       // Because this still allows the token to be stolen by the adversary,
      //       // set it to a cookie with the httpOnly attribute to make it safer.
      //       localStorage.setItem("token", json.data.token);
      //       navigate("/home", { replace: true });
      //       // <Navigate to="/" state={{ from: location }} replace />
      //     } else {
      //       localStorage.removeItem("token");
      //     }
      //     setLoginError(false);
      //   })
      //   .catch((err) => {
      //     localStorage.removeItem("token");
      //     setLoginError(true);
      //   });
      axios
        .post(
          "/login/password",
          {
            username: _username,
            password: _password,
          },
          {
            baseURL: "http://localhost:3333",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          console.log(res);
          const json = res.data;
          if (json.status === "success") {
            // Set the token in the localStorage.
            // Because this still allows the token to be stolen by the adversary,
            // set it to a cookie with the httpOnly attribute to make it safer.
            localStorage.setItem("token", json.data.token);
            navigate("/home", { replace: true });
            // <Navigate to="/" state={{ from: location }} replace />
          } else {
            localStorage.removeItem("token");
          }
          setLoginError(false);
        })
        .catch((err) => {
          console.log(err);
        });
      setUsernameError(false);
      setPasswordError(false);
    } else {
      if (_username === "") {
        setUsernameError(true);
      }
      if (_password === "") {
        setPasswordError(true);
      }
    }
  };

  return (
    <React.Fragment>
      <main className={styles.container}>
        <div className={styles["login-box"]}>
          <img src={reactLogo} alt="React Logo" height={100}></img>
          <h1>Login</h1>
          {loginError ? (
            <section className={styles["login-error"]}>
              <p>Invalid username or password...</p>
            </section>
          ) : (
            ""
          )}
          <section className={styles.username}>
            <label className="form-label" htmlFor="username">
              Username
            </label>
            <input
              className="form-control"
              type="text"
              id="username"
              value={username}
              onChange={onUsernameChanged}
              ref={usernameTxt}
            ></input>
            {usernameError ? (
              <p style={{ fontSize: "13px", color: "red" }}>
                Error: Plase enter a valid username
              </p>
            ) : (
              ""
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
              value={password}
              onChange={onPasswordChanged}
              ref={passwordTxt}
            ></input>
            {passwordError ? (
              <p style={{ fontSize: "13px", color: "red" }}>
                Error: Plase enter a valid password
              </p>
            ) : (
              ""
            )}
          </section>
          <section className={styles["login-button"]}>
            <button
              className="btn btn-primary full-width"
              type="button"
              onClick={onLoginBtnClicked}
            >
              Login
            </button>
          </section>
          <section className={styles["create-account"]}>
            <p>
              Don't have an account yet?{" "}
              <Link to="/verify-email">Create Account.</Link>
            </p>
          </section>
        </div>
      </main>
    </React.Fragment>
  );
}

export default Login;
