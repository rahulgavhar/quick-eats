import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdRefresh } from "react-icons/md";
import Header from "./DeliveryBoy/Header";
import MobileMenu from "./DeliveryBoy/MobileMenu";
import ProfileDropdown from "./DeliveryBoy/ProfileDropdown";
import Stats from "./DeliveryBoy/Stats";
import AssignmentCard from "./DeliveryBoy/AssignmentCard";
import Footer from "./General/Footer";
import { toast } from "react-toastify";
import { persistor } from "../redux/store";
import { logoutUser } from "../redux/slices/userSlice";

const DeliveryBoyDashboard = () => {
  const { mode } = useSelector((state) => state.theme);
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const apiURL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${apiURL}/api/auth/signout`,
        {},
        { withCredentials: true }
      );
      await dispatch(logoutUser()).unwrap();
      await persistor.purge();
      setShowProfileDropdown(false);
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiURL}/api/orders/delivery/my`, {
        withCredentials: true,
      });
      setAssignments(res.data.assignments || []);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load deliveries.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [apiURL]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleAccept = async (assignmentId) => {
    try {
      await axios.put(
        `${apiURL}/api/orders/delivery/${assignmentId}/accept`,
        {},
        { withCredentials: true }
      );
      await fetchAssignments();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Could not accept delivery.";
      setError(message);
    }
  };

  const handleComplete = async (assignmentId) => {
    try {
      await axios.put(
        `${apiURL}/api/orders/delivery/${assignmentId}/complete`,
        {},
        { withCredentials: true }
      );
      await fetchAssignments();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Could not complete delivery.";
      setError(message);
    }
  };

  const activeAssignments = assignments.filter((a) => a.status !== "completed");
  const completedAssignments = assignments.filter(
    (a) => a.status === "completed"
  );

  const counts = {
    active: activeAssignments.length,
    completed: completedAssignments.length,
  };

  const firstName =
    userData?.fullName?.split(" ")[0] || userData?.name || "Partner";
  const roleLabel = userData?.role
    ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1)
    : null;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        mode === "dark"
          ? "bg-linear-to-br from-gray-900 to-gray-800 text-white"
          : "bg-linear-to-br from-green-50 to-cyan-50 text-gray-900"
      }`}
    >
      <Header
        firstName={firstName}
        roleLabel={roleLabel}
        showProfileDropdown={showProfileDropdown}
        setShowProfileDropdown={setShowProfileDropdown}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        dropdownRef={dropdownRef}
        ProfileDropdown={() => (
          <ProfileDropdown
            handleLogout={handleLogout}
            setShowProfileDropdown={setShowProfileDropdown}
          />
        )}
      />

      <MobileMenu
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        handleLogout={handleLogout}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {loading && (
          <div className="p-4 rounded-lg border border-dashed text-center">
            Loading deliveries...
          </div>
        )}

        {error && (
          <div
            className={`p-4 rounded-lg border ${
              mode === "dark"
                ? "bg-red-900/40 border-red-700 text-red-200"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {error}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={fetchAssignments}
            disabled={loading}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 font-semibold transition ${
              mode === "dark"
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
            }`}
            title="Refresh assignments"
          >
            <MdRefresh className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        <Stats counts={counts} mode={mode} />

        {activeAssignments.length === 0 &&
        completedAssignments.length === 0 &&
        !loading ? (
          <div
            className={`p-6 rounded-xl text-center border-2 border-dashed ${
              mode === "dark"
                ? "border-gray-700 text-gray-400"
                : "border-gray-300 text-gray-600"
            }`}
          >
            No deliveries assigned yet.
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              <h3
                className={`text-lg font-semibold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Active
              </h3>
              {activeAssignments.length === 0 ? (
                <div
                  className={`p-4 rounded-lg border border-dashed ${
                    mode === "dark"
                      ? "border-gray-700 text-gray-400"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  No active deliveries.
                </div>
              ) : (
                <div className="grid gap-4">
                  {activeAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      mode={mode}
                      onAccept={handleAccept}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3
                className={`text-lg font-semibold ${
                  mode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Completed
              </h3>
              {completedAssignments.length === 0 ? (
                <div
                  className={`p-4 rounded-lg border border-dashed ${
                    mode === "dark"
                      ? "border-gray-700 text-gray-400"
                      : "border-gray-300 text-gray-600"
                  }`}
                >
                  No completed deliveries yet.
                </div>
              ) : (
                <div className="grid gap-4">
                  {completedAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment._id}
                      assignment={assignment}
                      mode={mode}
                      onAccept={handleAccept}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DeliveryBoyDashboard;
