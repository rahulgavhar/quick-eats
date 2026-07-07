import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import RestaurantProfile from "../models/restaurantProfile.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";
import RazorPay from "razorpay";
import ENV from "../config/env.js";
import { sendDeliveryNotificationEmail } from "../utils/mail.js";

let instance = new RazorPay({
  key_id: ENV.RAZORPAY_API,
  key_secret: ENV.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, totalAmount, paymentMethod, deliveryAddress } = req.body;

    // Basic validation
    if (
      !userId ||
      !items ||
      items.length === 0 ||
      !totalAmount ||
      !paymentMethod ||
      !deliveryAddress
    ) {
      return res
        .status(400)
        .json({ message: "All order details are required." });
    }

    // Create Razorpay order ONCE for the total amount (before the loop)
    let razorpayOrder = null;
    if (paymentMethod === "Online") {
      const options = {
        amount: Math.round(parseFloat(totalAmount) * 100),
        currency: "USD",
        receipt: `receipt_by_${userId}`,
      };
      razorpayOrder = await instance.orders.create(options);
      if (!razorpayOrder) {
        return res
          .status(500)
          .json({ message: "Error creating payment order." });
      }
    }

    // Group items by restaurantId
    const itemsByRestaurant = {};
    items.forEach((item) => {
      const restaurantId = item.restaurantId.toString();
      if (!itemsByRestaurant[restaurantId]) {
        itemsByRestaurant[restaurantId] = [];
      }
      itemsByRestaurant[restaurantId].push(item);
    });

    // Create separate orders for each restaurant
    const savedOrders = [];
    let totalPurchases = 0;

    for (const restaurantId in itemsByRestaurant) {
      const restaurantItems = itemsByRestaurant[restaurantId];

      // Calculate subtotal for this restaurant
      const subTotal = restaurantItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Create order document
      const newOrder = new Order({
        orders: [
          {
            restaurantId: restaurantId,
            items: restaurantItems.map((item) => ({
              itemId: item._id,
              quantity: item.quantity,
            })),
            subTotal: subTotal,
          },
        ],
        user: userId,
        paymentMethod,
        deliveryAddress: {
          addressLine: deliveryAddress.address,
          coordinates: {
            lat: deliveryAddress.lat,
            lon: deliveryAddress.lon,
          },
        },
        totalAmount: subTotal,
        status: "Pending",
        razorpayOrderId: paymentMethod === "Online" ? razorpayOrder.id : null,
        paymentFlag: paymentMethod === "Online" ? false : true,
      });

      const savedOrder = await newOrder.save();
      savedOrders.push(savedOrder);
      totalPurchases++;

      // Update restaurant's order history
      const restaurantProfile = await RestaurantProfile.findOne({
        restaurantId,
      });
      if (restaurantProfile) {
        restaurantProfile.orders.push({ orderId: savedOrder._id });
        await restaurantProfile.save();
      }
    }

    // Update user's purchase count and order history (all orders at once)
    await User.findByIdAndUpdate(userId, {
      $inc: { purchases: totalPurchases },
      $push: {
        orders: { $each: savedOrders.map((order) => ({ orderId: order._id })) },
      },
    });

    res.status(201).json({
      message: "Orders placed successfully.",
      orders: savedOrders,
      orderCount: savedOrders.length,
      orderIds: savedOrders.map((order) => order._id),
      razorpayOrder: razorpayOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderIds } = req.body;

    if (!razorpayOrderId || !orderIds || orderIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Razorpay order ID and order IDs are required." });
    }

    // Verify payment signature (important for security)
    const crypto = require("crypto");
    const expectedSignature = crypto
      .createHmac("sha256", ENV.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    // Update all orders with the same razorpay order ID
    const updatedOrders = [];
    for (const orderId of orderIds) {
      const order = await Order.findById(orderId);
      if (!order) {
        console.warn(`Order not found: ${orderId}`);
        continue;
      }
      // Verify the razorpay order ID matches
      if (order.razorpayOrderId !== razorpayOrderId) {
        console.warn(`Razorpay order ID mismatch for order: ${orderId}`);
        continue;
      }
      // Update payment flag
      order.paymentFlag = true;
      order.razorpayPaymentId = razorpayPaymentId;
      await order.save();

      await order.populate("orders.restaurantId", "name city state rating");
      await order.populate("orders.items.itemId", "name price image category");
      
      updatedOrders.push(order);
    }

    if (updatedOrders.length === 0) {
      return res.status(404).json({ message: "No orders were updated." });
    }

    return res.status(200).json({ 
      message: "Payment verified and orders updated.", 
      orders: updatedOrders 
    });

  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const orderId = req.params.id;

    if (!otp || !orderId) {
      return res.status(400).json({ message: "OTP and order ID are required." });
    }

    // Find the delivery assignment for this order
    const assignment = await DeliveryAssignment.findOne({ orderId: orderId });
    if (!assignment) {
      return res.status(404).json({ message: "Delivery assignment not found." });
    }
    // Verify OTP
    if (assignment.otp.toString() !== otp.toString()) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Mark assignment and order as completed/delivered
    assignment.status = "completed";
    await assignment.save();

    const order = await Order.findOne({ _id: orderId });
    if (order) {
      order.status = "Delivered";
      await order.save();
    }

    res.status(200).json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.userId;

    // Get user and populate their orders
    const user = await User.findById(userId)
      .populate({
        path: "orders.orderId",
        populate: [
          {
            path: "orders.restaurantId",
            select: "name city state rating",
          },
          {
            path: "orders.items.itemId",
            select: "name price image category",
          },
        ],
      })
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Extract and sort orders
    const allOrders = (Array.isArray(user.orders) ? user.orders : [])
      .map((orderRef) => orderRef.orderId)
      .filter((order) => order !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Separate orders per restaurant
    const ordersByRestaurant = {};

    allOrders.forEach((order) => {
      order.orders.forEach((restaurantOrder) => {
        const restaurantId = restaurantOrder.restaurantId._id.toString();
        const restaurantName = restaurantOrder.restaurantId.name;

        if (!ordersByRestaurant[restaurantId]) {
          ordersByRestaurant[restaurantId] = {
            restaurantId,
            restaurantName,
            restaurantDetails: restaurantOrder.restaurantId,
            orders: [],
          };
        }

        ordersByRestaurant[restaurantId].orders.push({
          _id: order._id,
          user: order.user,
          paymentMethod: order.paymentMethod,
          deliveryAddress: order.deliveryAddress,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
          items: restaurantOrder.items,
          subTotal: restaurantOrder.subTotal,
        });
      });
    });

    // Convert to array and sort by most recent order
    const restaurantOrders = Object.values(ordersByRestaurant).map(
      (restaurant) => ({
        ...restaurant,
        orders: restaurant.orders.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ),
      })
    );

    res.status(200).json({
      success: true,
      count: restaurantOrders.length,
      orders: restaurantOrders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getOwnerOrders = async (req, res) => {
  try {
    const ownerId = req.userId;

    // Fetch restaurant profile and populate orders directly from stored references
    const restaurantProfile = await RestaurantProfile.findOne({
      owner: ownerId,
    })
      .select("restaurantId orders")
      .populate({
        path: "orders.orderId",
        populate: [
          {
            path: "user",
            select: "fullName email mobile",
          },
          {
            path: "orders.items.itemId",
            select: "name price image category",
          },
          {
            path: "orders.restaurantId",
            select: "_id",
          },
        ],
      })
      .lean();

    if (!restaurantProfile) {
      return res
        .status(404)
        .json({ message: "Restaurant profile not found for this owner." });
    }

    const restaurantId = restaurantProfile.restaurantId;

    // Extract and filter orders to only include items from this restaurant
    const filteredOrders = (restaurantProfile.orders || [])
      .map((orderRef) => orderRef.orderId)
      .filter(Boolean)
      .map((order) => {
        const restaurantSpecificOrders = order.orders.filter(
          (orderItem) =>
            orderItem.restaurantId?._id?.toString() === restaurantId.toString()
        );

        if (restaurantSpecificOrders.length === 0) return null;

        return {
          ...order,
          orders: restaurantSpecificOrders,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: filteredOrders.length,
      orders: filteredOrders,
    });
  } catch (error) {
    console.error("Error fetching owner orders:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delivery boy: fetch my delivery assignments with order details
export const getDeliveryBoyOrders = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch assignments where this delivery boy is either assigned or broadcasted to
    const assignments = await DeliveryAssignment.find({
      $or: [
        { assignedTo: userId },
        { broadcastedTo: userId }
      ]
    })
      .populate({
        path: "orderId",
        populate: [
          { path: "user", select: "fullName mobile" },
          { path: "orders.restaurantId", select: "name address" },
          { path: "orders.items.itemId", select: "name price" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const mapped = assignments.map((a) => {
      const order = a.orderId;
      const line = order?.orders?.[0];

      return {
        _id: a._id,
        status: a.status,
        otp: a.otp,
        orderId: order?._id,
        orderStatus: order?.status,
        restaurantName: line?.restaurantId?.name,
        pickupAddress: line?.restaurantId?.address,
        dropAddress: order?.deliveryAddress?.addressLine,
        customerName: order?.user?.fullName,
        customerPhone: order?.user?.mobile,
        items: line?.items || [],
        subTotal: line?.subTotal,
        createdAt: order?.createdAt,
      };
    });

    res.status(200).json({ success: true, assignments: mapped });
  } catch (error) {
    console.error("Error fetching delivery assignments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    const validStatuses = [
      "Pending",
      "Preparing",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    // Validate status
    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status.",
        validStatuses,
      });
    }

    // Find the order first to verify ownership (if owner)
    const order = await Order.findById(orderId)
      .populate("orders.restaurantId", "_id")
      .populate("orders.assignment")
      .populate({ path: "user", select: "fullName email mobile" });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // If user is an owner, verify they own the restaurant in this order
    if (req.userRole === "owner") {
      const restaurantProfile = await RestaurantProfile.findOne({
        owner: req.userId,
      });

      if (!restaurantProfile) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this order." });
      }

      const ownsRestaurant = order.orders.some(
        (orderItem) =>
          orderItem.restaurantId._id.toString() ===
          restaurantProfile.restaurantId.toString()
      );

      if (!ownsRestaurant) {
        return res.status(403).json({
          message: "You can only update orders for your own restaurant.",
        });
      }
    }

    // Update the order status
    order.status = status;

    let deliveryBoyPayload = [];
    let assignmentId = null;

    if (status === "Out for Delivery") {
      const orderLine = order.orders?.[0];

      if (orderLine && !orderLine.assignment) {
        const { lat, lon } = order.deliveryAddress.coordinates;

        const nearbyDeliveryBoys = await User.find({
          role: "deliveryBoy",
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [lon, lat],
              },
              $maxDistance: 5000,
            },
          },
        }).select("fullName mobile location");

        const nearbyAssignments = await DeliveryAssignment.find({
          assignedTo: { $in: nearbyDeliveryBoys.map((db) => db._id) },
          status: { $in: ["assigned"] },
        }).select("assignedTo");

        const availableDeliveryBoys = nearbyDeliveryBoys.filter(
          (db) =>
            !nearbyAssignments.some(
              (busy) => busy.assignedTo?.toString() === db._id.toString()
            )
        );

        if (availableDeliveryBoys.length === 0) {
          await order.save();
          await order.populate([
            { path: "orders.restaurantId", select: "name city state" },
            { path: "orders.items.itemId", select: "name price image" },
            { path: "orders.assignment", select: "otp assignedTo status" },
            { path: "orders.assignedDeliveryBoy", select: "fullName mobile location" },
          ]);

          return res.status(200).json({
            success: true,
            message:
              "Order status updated successfully, but no delivery boys available nearby.",
            order,
            deliveryBoys: [],
            assignmentId: null,
            assignedDeliveryBoy: null,
          });
        }

        const assignedTo = availableDeliveryBoys[0]._id;
        const otp = Math.floor(100000 + Math.random() * 900000);

        const newAssignment = await DeliveryAssignment.create({
          orderId: order._id,
          restaurantId: orderLine.restaurantId,
          broadcastedTo: availableDeliveryBoys.map((db) => db._id),
          assignedTo,
          otp,
          status: "assigned",
        });

        orderLine.assignment = newAssignment._id;
        orderLine.assignedDeliveryBoy = assignedTo;
        assignmentId = newAssignment._id;

        deliveryBoyPayload = availableDeliveryBoys.map((db) => ({
          id: db._id,
          fullName: db.fullName,
          longitude: db.location.coordinates[0],
          latitude: db.location.coordinates[1],
          mobile: db.mobile,
        }));
      } else if (orderLine?.assignment) {
        assignmentId = orderLine.assignment._id || orderLine.assignment;
      }
    }

    await order.save();
    await order.populate([
      { path: "orders.restaurantId", select: "name city state" },
      { path: "orders.items.itemId", select: "name price image" },
      { path: "orders.assignment", select: "otp assignedTo status" },
      { path: "orders.assignedDeliveryBoy", select: "fullName mobile location" },
    ]);

    const firstLine = order.orders?.[0];

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
      order,
      deliveryBoys: deliveryBoyPayload,
      assignmentId,
      assignedDeliveryBoy: firstLine?.assignedDeliveryBoy || null,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Delivery boy accepts an unassigned broadcast
export const acceptDeliveryAssignment = async (req, res) => {
  try {
    const userId = req.userId;
    const assignmentId = req.params.id;

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    if (assignment.status !== "unassigned") {
      return res.status(409).json({ message: "Assignment already claimed." });
    }

    assignment.assignedTo = userId;
    assignment.status = "assigned";
    await assignment.save();

    // Update order subdocument
    const order = await Order.findOne({ "orders.assignment": assignmentId });
    if (order) {
      const line = order.orders.find(
        (o) => o.assignment?.toString() === assignmentId.toString()
      );
      if (line) {
        line.assignedDeliveryBoy = userId;
        await order.save();
      }
    }

    res.status(200).json({ success: true, message: "Assignment accepted." });
  } catch (error) {
    console.error("Error accepting assignment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getDeliveryBoyLocation = async (req, res) => {
  try {
    const userId = req.userId;
    const orderId = req.params.orderId;
    const assignment = await DeliveryAssignment.findOne({
      orderId: orderId,
    }).populate('assignedTo', 'location fullName mobile');

    if (!assignment) {
      return res.status(200).json({ code: "NO_DELIVERYBOY_FOUND" ,message: "Assignment not found." });
    }

    const deliveryBoy = assignment.assignedTo;
    if (!deliveryBoy || !deliveryBoy.location) {
      return res.status(404).json({ message: "Delivery boy location not found." });
    }
    res.status(200).json({
      success: true,
      location: {
        lat: deliveryBoy.location.coordinates[1],
        lon: deliveryBoy.location.coordinates[0],
      },
      deliveryBoy: {
        id: deliveryBoy._id,
        fullName: deliveryBoy.fullName,
        mobile: deliveryBoy.mobile,
      }
    });
  } catch (error) {
    console.error("Error fetching delivery boy location:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const notifyDeliveryBoy = async (req, res) => {
  try {
    const { deliveryBoyId, orderId } = req.body;
    if (!deliveryBoyId || !orderId) {
      return res.status(400).json({ message: "Delivery boy ID and order ID are required." });
    }
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({ message: "Delivery boy not found." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await sendDeliveryNotificationEmail(deliveryBoy.email, orderId, otp);

    res.status(200).json({ success: true, message: "Notification sent successfully." });
  } catch (error) {
    console.error("Error notifying delivery boy:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};