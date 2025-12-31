import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp.jsx";
import SignIn from "./pages/SignIn.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Profile from "./components/Profile.jsx";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import Home from "./pages/Home.jsx";
import { fetchUserData } from "./redux/slices/userSlice.js";
import PageNotFound from "./pages/PageNotFound.jsx";
import Loader from "./components/General/Loader";
import Guest from "./pages/Guest.jsx";
import ErrorComponent from "./components/General/ErrorComponent";
import CheckOut from "./pages/CheckOut.jsx";
import MyOrders from "./pages/MyOrders.jsx";

const App = () => {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);
  const { userData, loading, error } = useSelector((state) => state.user);
  const [activePopup, setActivePopup] = useState(false);
  const [popupShown, setPopupShown] = useState(false);

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(fetchUserData());
  };

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

  if (loading) return <Loader />;

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
      <Route path="/profile" element={<Profile />} />
      <Route
        path="/"
        element={
          !userData ? (
            <Guest />
          ) : (
            <Home
              activePopup={activePopup}
              popupShown={popupShown}
              setActivePopup={setActivePopup}
              setPopupShown={setPopupShown}
            />
          )
        }
      />
      {/* Checkout */}
      <Route
        path="/checkout"
        element={!userData ? <Navigate to="/signin" /> : <CheckOut />}
      />
      <Route
        path="/my-orders"
        element={!userData ? <Navigate to="/signin" /> : <MyOrders />}
      />

      {/* Error Handling */}
      {/* 404 */}
      <Route path="/404" element={<PageNotFound />} />
      {/* Catch-all route for undefined paths */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

export default App;
