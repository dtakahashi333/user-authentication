import { Children, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import ErrorPage from "./ErrorPage.jsx";
import RegisterUser from "./RegisterUser.jsx";

const isAuthenticated = () => {
  // Check if the user is authenticated, e.g., by checking a token in local storage.
  return !!localStorage.getItem("token");
};

const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated.
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: "/home",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    ),
    errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <RegisterUser />,
  },
  {
    path: "/",
    element: <Navigate to="/login" />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
