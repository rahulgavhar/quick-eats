import React from "react";
import { MdCheckCircle, MdDirectionsBike, MdLocationOn, MdPhone } from "react-icons/md";

const AssignmentCard = ({ assignment, mode = "light", onAccept }) => {
  const isDark = mode === "dark";
  const status = assignment.status || "unassigned";
  const statusColor = {
    unassigned: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
  }[status] || "bg-gray-100 text-gray-700";

  return (
    <div
      className={`p-4 rounded-xl border shadow-sm transition-colors duration-300 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start gap-3 mb-3">
        <div>
          <p className="text-sm text-gray-500">Assignment</p>
          <p className={`font-mono text-sm font-semibold ${isDark ? "text-green-300" : "text-green-700"}`}>
            {assignment._id?.slice(-8) || assignment._id || "N/A"}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            OTP: <span className="font-semibold">{assignment.otp ?? "N/A"}</span>
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
          {status}
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500 flex items-center gap-1"><MdDirectionsBike /> Restaurant</p>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {assignment.restaurantName || "N/A"}
          </p>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {assignment.pickupAddress || ""}
          </p>
        </div>
        <div>
          <p className="text-gray-500 flex items-center gap-1"><MdLocationOn /> Customer</p>
          <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
            {assignment.customerName || "N/A"}
          </p>
          {assignment.customerPhone && (
            <p className={`flex items-center gap-1 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <MdPhone /> {assignment.customerPhone}
            </p>
          )}
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {assignment.dropAddress || ""}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {status === "unassigned" && (
          <button
            onClick={() => onAccept?.(assignment._id)}
            className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-1"
          >
            <MdCheckCircle /> Accept
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignmentCard;
