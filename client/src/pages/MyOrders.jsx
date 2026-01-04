import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MdRefresh } from "react-icons/md";

const MyOrders = () => {
  const { mode } = useSelector((state) => state.theme);
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filter, setFilter] = useState("All");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [availableBoys, setAvailableBoys] = useState([]);

  const apiURL = import.meta.env.VITE_API_URL;
  const isOwner = userData?.role === "owner";

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiURL}/api/orders/all`, {
        withCredentials: true,
      });
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to fetch orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?._id) {
      fetchOrders();
    }
  }, [userData?._id, apiURL]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrder(orderId);
    try {
      const res = await axios.put(
        `${apiURL}/api/orders/status/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );

      // Update local state
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setAvailableBoys(
        res.data.deliveryBoys || []
      )
    } catch (error) {
      console.error("Error updating order status:", error);
      setError("Failed to update order status. Please try again.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "Out for Delivery":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Pending":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return "✓";
      case "Out for Delivery":
        return "🚗";
      case "Preparing":
        return "👨‍🍳";
      case "Pending":
        return "⏳";
      case "Cancelled":
        return "✕";
      default:
        return "📦";
    }
  };

  const statusOptions = [
    "Pending",
    "Preparing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // Flatten orders based on user role
  // Owners get orders directly from getOwnerOrders (with nested orders array)
  // Users get restaurant-grouped orders from getUserOrders
  const allOrders = isOwner
    ? orders.flatMap((order) =>
        order.orders.map((restaurantOrder) => ({
          _id: order._id,
          user: order.user,
          paymentMethod: order.paymentMethod,
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: restaurantOrder.items,
          subTotal: restaurantOrder.subTotal,
          restaurantName: restaurantOrder.restaurantId?.name || "Restaurant",
        }))
      )
    : orders.flatMap((restaurant) =>
        restaurant.orders.map((order) => ({
          ...order,
          restaurantName: restaurant.restaurantName,
        }))
      );

  const flatFilteredOrders =
    filter === "All"
      ? allOrders
      : allOrders.filter((order) => order.status === filter);

  if (loading) {
    return (
      <div
        className={`min-h-screen transition-colors duration-300 ${
          mode === "dark" ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`sticky top-0 z-10 shadow-md transition-colors duration-300 ${
            mode === "dark"
              ? "bg-gray-800 border-b border-gray-700"
              : "bg-white border-b border-gray-200"
          }`}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1
              className={`text-3xl font-bold transition-colors duration-300 ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {isOwner ? "Restaurant Orders" : "My Orders"}
            </h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div
                className={`absolute inset-0 rounded-full border-4 border-transparent ${
                  mode === "dark"
                    ? "border-t-green-500 border-r-green-500"
                    : "border-t-green-400 border-r-green-400"
                } animate-spin`}
              ></div>
              <div className="absolute inset-2 rounded-full flex items-center justify-center text-2xl">
                🍽️
              </div>
            </div>
            <p
              className={`text-lg font-semibold ${
                mode === "dark" ? "text-white" : "text-gray-800"
              }`}
            >
              Loading {isOwner ? "restaurant " : ""}orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        mode === "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-10 shadow-md transition-colors duration-300 ${
          mode === "dark"
            ? "bg-gray-800 border-b border-gray-700"
            : "bg-white border-b border-gray-200"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  mode === "dark"
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                }`}
                title="Go back"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1
                  className={`text-3xl font-bold transition-colors duration-300 ${
                    mode === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {isOwner ? "🏪 Restaurant Orders" : "📦 My Orders"}
                </h1>
                {isOwner && (
                  <p
                    className={`text-sm mt-1 transition-colors duration-300 ${
                      mode === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Manage and update your restaurant's orders
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  mode === "dark"
                    ? "hover:bg-gray-700 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                } ${refreshing ? "opacity-50 cursor-not-allowed" : ""}`}
                title="Refresh orders"
              >
                <MdRefresh
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <span
                className={`text-lg font-semibold px-4 py-2 rounded-full transition-colors duration-300 ${
                  mode === "dark"
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {orders.length} {orders.length === 1 ? "order" : "orders"}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 transition-colors duration-300 ${
                mode === "dark"
                  ? "bg-red-900/30 text-red-400 border border-red-800"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                />
              </svg>
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              "All",
              "Pending",
              "Preparing",
              "Out for Delivery",
              "Delivered",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  filter === status
                    ? "bg-green-500 text-white shadow-lg"
                    : mode === "dark"
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <div
            className={`text-center py-16 rounded-xl transition-colors duration-300 ${
              mode === "dark" ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="text-6xl mb-4">📦</div>
            <h2
              className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                mode === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              No Orders Found
            </h2>
            <p
              className={`transition-colors duration-300 ${
                mode === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {filter === "All"
                ? isOwner
                  ? "No orders received yet. Orders will appear here when customers place them."
                  : "You haven't placed any orders yet. Start exploring restaurants!"
                : `You don't have any ${filter.toLowerCase()} orders.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {flatFilteredOrders.map((order) => (
              <div
                key={order._id}
                className={`rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
                  mode === "dark" ? "bg-gray-800" : "bg-white"
                } hover:shadow-lg`}
              >
                {/* Order Header */}
                <div
                  className={`p-6 cursor-pointer transition-colors duration-300 ${
                    mode === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order._id ? null : order._id
                    )
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                    {/* Order ID and Date */}
                    <div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Order ID
                      </p>
                      <p
                        className={`font-mono text-sm font-bold transition-colors duration-300 ${
                          mode === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        {order._id.slice(-8).toUpperCase()}
                      </p>
                      <p
                        className={`text-xs mt-1 transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    {/* Restaurant Name */}
                    <div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Restaurant
                      </p>
                      <p
                        className={`font-semibold transition-colors duration-300 ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {order.restaurantName || "N/A"}
                      </p>
                    </div>

                    {/* Items Count */}
                    <div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Items
                      </p>
                      <p
                        className={`text-2xl font-bold transition-colors duration-300 ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {order.items.length}
                      </p>
                    </div>

                    {/* Customer Info (Owner view only) */}
                    {isOwner && order.user && (
                      <div>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            mode === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Customer
                        </p>
                        <p
                          className={`font-semibold transition-colors duration-300 ${
                            mode === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {order.user.fullName}
                        </p>
                        <p
                          className={`text-xs transition-colors duration-300 ${
                            mode === "dark" ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          {order.user.mobile}
                        </p>
                      </div>
                    )}

                    {/* Status */}
                    <div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Status
                      </p>
                      {isOwner ? (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(order._id, e.target.value)
                          }
                          disabled={updatingOrder === order._id}
                          className={`mt-1 block px-3 py-2 rounded-lg border-2 font-semibold transition-all duration-300 cursor-pointer ${
                            updatingOrder === order._id
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          } ${
                            mode === "dark"
                              ? "bg-gray-700 text-white border-gray-600 hover:border-green-500"
                              : "bg-white text-gray-900 border-gray-300 hover:border-green-500"
                          } focus:outline-none focus:ring-2 focus:ring-green-500`}
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border font-semibold text-sm mt-1 transition-colors duration-300 ${getStatusColor(
                            order.status
                          )}`}
                        >
                          <span>{getStatusIcon(order.status)}</span>
                          {order.status}
                        </div>
                      )}
                    </div>

                    {/* Total Amount */}
                    <div>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Total
                      </p>
                      <p
                        className={`text-2xl font-bold transition-colors duration-300 ${
                          mode === "dark" ? "text-green-400" : "text-green-600"
                        }`}
                      >
                        ${order.subTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="flex justify-end mt-4">
                    <svg
                      className={`w-6 h-6 transition-transform duration-300 ${
                        expandedOrder === order._id ? "rotate-180" : ""
                      } ${mode === "dark" ? "text-gray-400" : "text-gray-600"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </div>

                {/* Order Details (Expanded) */}
                {expandedOrder === order._id && (
                  <div
                    className={`border-t transition-colors duration-300 ${
                      mode === "dark" ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    {/* Delivery Address */}
                    <div
                      className={`p-6 border-b transition-colors duration-300 ${
                        mode === "dark"
                          ? "border-gray-700 bg-gray-700/30"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <h3
                        className={`font-bold mb-2 flex items-center gap-2 transition-colors duration-300 ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          />
                        </svg>
                        Delivery Address
                      </h3>
                      <p
                        className={`transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {order.deliveryAddress?.addressLine || "N/A"}
                      </p>
                      <p
                        className={`text-sm mt-1 transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        📍 {order.deliveryAddress?.coordinates?.lat?.toFixed(4)}
                        , {order.deliveryAddress?.coordinates?.lon?.toFixed(4)}
                      </p>
                    </div>

                    {/* Payment Method */}
                    <div
                      className={`p-6 border-b transition-colors duration-300 ${
                        mode === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-bold mb-2 flex items-center gap-2 transition-colors duration-300 ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Payment Method
                      </h3>
                      <p
                        className={`font-semibold transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {order.paymentMethod === "COD"
                          ? "💵 Cash on Delivery"
                          : "🔒 Online Payment"}
                      </p>
                    </div>

                    {/* Order Items */}
                    <div
                      className={`p-6 border-b transition-colors duration-300 ${
                        mode === "dark" ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h3
                        className={`font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                          mode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3z" />
                        </svg>
                        Order Items
                      </h3>

                      <div className="space-y-4">
                        <div
                          className={`rounded-lg p-4 transition-colors duration-300 ${
                            mode === "dark" ? "bg-gray-700" : "bg-gray-100"
                          }`}
                        >
                          <h4
                            className={`font-bold mb-3 transition-colors duration-300 ${
                              mode === "dark"
                                ? "text-green-400"
                                : "text-green-600"
                            }`}
                          >
                            {order.restaurantName || "Restaurant"}
                          </h4>
                          <div
                            className="space-y-2 mb-3 border-b pb-3"
                            style={{
                              borderColor:
                                mode === "dark" ? "#4b5563" : "#e5e7eb",
                            }}
                          >
                            {order.items.map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="flex justify-between items-start"
                              >
                                <div className="flex-1">
                                  <p
                                    className={`font-medium transition-colors duration-300 ${
                                      mode === "dark"
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {item.itemId?.name || "Item"}
                                  </p>
                                  <p
                                    className={`text-sm transition-colors duration-300 ${
                                      mode === "dark"
                                        ? "text-gray-400"
                                        : "text-gray-600"
                                    }`}
                                  >
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p
                                  className={`font-semibold transition-colors duration-300 ${
                                    mode === "dark"
                                      ? "text-green-400"
                                      : "text-green-600"
                                  }`}
                                >
                                  $
                                  {(item.itemId?.price * item.quantity).toFixed(
                                    2
                                  ) || "N/A"}
                                </p>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <span
                              className={`transition-colors duration-300 ${
                                mode === "dark"
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              Subtotal
                            </span>
                            <span
                              className={`font-bold transition-colors duration-300 ${
                                mode === "dark"
                                  ? "text-green-400"
                                  : "text-green-600"
                              }`}
                            >
                              ${order.subTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Time */}
                    <div
                      className={`p-6 transition-colors duration-300 ${
                        mode === "dark" ? "bg-gray-700/30" : "bg-gray-50"
                      }`}
                    >
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          mode === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        📅 Ordered on{" "}
                        {new Date(order.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
