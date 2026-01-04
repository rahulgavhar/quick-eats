import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    paymentMethod: { type: String, enum: ["COD", "Online"], required: true },
    deliveryAddress: {
      addressLine: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
    },
    orders: [
      {
        restaurantId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Restaurant",
          required: true,
        },
        items: [
          {
            itemId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Item",
              required: true,
            },
            quantity: { type: Number, required: true, min: 1 },
          },
        ],
        subTotal: { type: Number, required: true, min: 0 },
        assignment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "DeliveryAssignment",
          default: null,
        },
        assignedDeliveryBoy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },
    paymentFlag: { type: Boolean, default: false },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

export default Order;
