import React from "react";
import { useSelector } from "react-redux";

const OrderSummary = ({ cart, calculateTotal, onCheckout, locationName }) => {
  const { mode } = useSelector((state) => state.theme);
  const { userData } = useSelector((state) => state.user);

  const subtotal = parseFloat(calculateTotal());
  const tax = (subtotal * 0.1).toFixed(2);
  const deliveryFee = 2.99;
  const total = (subtotal + parseFloat(tax) + deliveryFee).toFixed(2);

  const deliveryLocation =
    userData?.address?.street && userData?.address?.city
      ? `${userData.address.street}, ${userData.address.city}`
      : userData?.address?.street ||
        userData?.address?.city ||
        userData?.address ||
        locationName;

  return (
    <div className="lg:col-span-1">
      <div
        className={`rounded-lg shadow-md p-6 sticky top-28 transition-colors duration-300 ${
          mode === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h2
          className={`text-xl font-bold mb-4 transition-colors duration-300 ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          Order Summary
        </h2>
        <div
          className={`space-y-3 border-b pb-4 transition-colors duration-300 ${
            mode === "dark"
              ? "border-gray-700 text-gray-300"
              : "border-gray-200 text-gray-700"
          }`}
        >
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (10%)</span>
            <span>${tax}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Fee</span>
            <span>${deliveryFee.toFixed(2)}</span>
          </div>
        </div>
        <div
          className={`flex justify-between font-bold text-lg mt-4 transition-colors duration-300 ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          <span>Total</span>
          <span className="text-green-500">${total===deliveryFee.toFixed(2) ? 0 : total}</span>
        </div>
        <div
          className={`mt-4 text-sm transition-colors duration-300 ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          <p className="font-semibold mb-1">Delivery To:</p>
          <p>{deliveryLocation}</p>
        </div>
        <button
          onClick={onCheckout}
          className="w-full mt-6 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition font-bold text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;
