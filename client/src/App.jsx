import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { useDispatch } from "react-redux";
import { fetchUserData } from "./redux/slices/userSlice.js";

const App = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  useEffect(() => {
    dispatch(fetchUserData());
  }, []);

  // Apply global theme class on the <html> element so CSS can react to theme
  useEffect(() => {
    const rootEl = document.documentElement; // <html>
    if (mode === "dark") {
      rootEl.classList.add("theme-dark");
      rootEl.classList.remove("theme-light");
    } else {
      rootEl.classList.add("theme-light");
      rootEl.classList.remove("theme-dark");
    }
  }, [mode]);

  const { userData, loading, error } = useSelector((state) => state.user);

  return (
    <Routes>
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/" />}
      />
      <Route
        path="/signin"
        element={!userData ? <SignIn /> : <Navigate to="/" />}
      />
      <Route
        path="/reset-password"
        element={!userData ? <ResetPassword /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={!userData ? <Navigate to="/signin" /> : <Home />}
      />
    </Routes>
  );
};

export default App;
