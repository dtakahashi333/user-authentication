import React, { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import axios from "axios";

const headers = [
  "Name",
  "Position",
  "Office",
  "Extension",
  "Start date",
  "Salary",
];
const headerObjects = headers.map((header, i) => ({
  id: i,
  value: header,
}));

const reducer = (state, action) => {
  switch (action.type) {
    case "PREVIOUS":
      return state - 1 >= 0 ? state - 1 : state;
    case "NEXT":
      return state + 1 < action.numberOfPages ? state + 1 : state;
    default:
      return state;
  }
};

// const employeeObjects = (data, page) => {
//   for (let i = 0; i < )
// }

function Home() {
  const employeesPerPage = 10;
  const [employees, setEmployees] = useState(null);
  const employeeObjects = useRef(null);
  const numberOfPages = useRef(0);
  const [error, setError] = useState(null);
  const [page, dispatch] = useReducer(reducer, 0);

  const navigate = useNavigate();

  useEffect(() => {
    // fetch("http://localhost:3333/employees")
    //   .then((response) => response.json())
    //   .then((json) => {
    //     setEmployees(json.data);
    //     numberOfPages.value =
    //       Math.floor(json.data.length / employeesPerPage) + 1;
    //   })
    //   .catch(setError);
    const token = localStorage.getItem("token");
    axios
      .get("/employees", {
        baseURL: "http://localhost:3333",
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const json = res.data;
        if (json.status === "success") {
          setEmployees(json.data);
          numberOfPages.value =
            Math.floor(json.data.length / employeesPerPage) + 1;
        } else {
          setEmployees([]);
          numberOfPages.value = 1;
        }
      })
      .catch((err) => {
        setError(err);
      });
  }, []);

  if (error) {
    return <pre>{JSON.stringify(error)}</pre>;
  }

  if (!employees) {
    return null;
  }

  employeeObjects.value = [];
  // 10 employees per page.
  for (let i = 0; i < employeesPerPage; ++i) {
    const id = employeesPerPage * page + i;
    if (id >= employees.length) {
      // No more employee.
      break;
    }
    const employee = employees[id].map((item, j) => ({
      id: j,
      value: item,
    }));
    employeeObjects.value.push({
      id,
      value: employee,
    });
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <React.Fragment>
      <header className={styles["header-container"]}>
        <div className={styles["header-left-container"]}>
          <button
            type="button"
            className={[styles.btn, styles["bth-link"]].join(" ")}
            onClick={() =>
              dispatch({ type: "PREVIOUS", numberOfPages: numberOfPages.value })
            }
          >
            Previous
          </button>
          <button
            type="button"
            className={[styles.btn, styles["bth-link"]].join(" ")}
            onClick={() =>
              dispatch({ type: "NEXT", numberOfPages: numberOfPages.value })
            }
          >
            Next
          </button>
        </div>
        <div className={styles["header-right-container"]}>
          <button
            type="button"
            className={[styles.btn, styles["bth-link"]].join(" ")}
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>
      <main className={styles["main-container"]}>
        <table className={styles.table}>
          <thead>
            <tr className={styles["table-row"]}>
              {headerObjects.map((header) => (
                <th
                  key={header.id}
                  className={styles["table-data"]}
                  scope="col"
                >
                  {header.value}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employeeObjects.value.map((emp) => (
              <tr key={emp.id} className={styles["table-row"]}>
                {emp.value.map((item) => (
                  <td
                    key={item.id}
                    className={styles["table-data"]}
                    scope={item.id === 0 ? "row" : ""}
                  >
                    {item.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </React.Fragment>
  );
}

export default Home;
