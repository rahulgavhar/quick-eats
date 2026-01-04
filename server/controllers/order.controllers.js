import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import RestaurantProfile from "../models/restaurantProfile.model.js";
import DeliveryAssignment from "../models/deliveryAssignment.model.js";

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
    });
  } catch (error) {
    console.error("Error placing order:", error);
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

// Delivery boy marks delivery completed
export const completeDeliveryAssignment = async (req, res) => {
  try {
    const userId = req.userId;
    const assignmentId = req.params.id;

    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    if (assignment.assignedTo?.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not your assignment." });
    }

    assignment.status = "completed";
    await assignment.save();

    // Update order status to Delivered and persist
    const order = await Order.findOne({ "orders.assignment": assignmentId });
    if (order) {
      order.status = "Delivered";
      await order.save();
    }

    res.status(200).json({ success: true, message: "Delivery completed." });
  } catch (error) {
    console.error("Error completing assignment:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
