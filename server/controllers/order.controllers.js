import Order from '../models/order.model.js';
import User from '../models/user.model.js';
import RestaurantProfile from '../models/restaurantProfile.model.js';

export const placeOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, totalAmount, paymentMethod, deliveryAddress } = req.body;

        // Basic validation
        if (!userId || !items || items.length === 0 || !totalAmount || !paymentMethod || !deliveryAddress) {
            return res.status(400).json({ message: 'All order details are required.' });
        }
        // Create new order
        const newOrder = new Order({
            orders: items.map(order => ({
                restaurantId: order.restaurantId,
                items: {
                    itemId: order._id,
                    quantity: order.quantity,
                },
                subTotal: order.price * order.quantity,
            })),
            user: userId,
            paymentMethod,
            deliveryAddress : {
                addressLine: deliveryAddress.address,
                coordinates: {
                    lat: deliveryAddress.lat,
                    lon: deliveryAddress.lon,
                },
            },
            totalAmount,
            status: 'Pending',
        });

        const savedOrder = await newOrder.save();

        // Update user's purchase count and order history
        await User.findByIdAndUpdate(userId, { $inc: { purchases: 1 }, $push: { orders: { orderId: savedOrder._id } } });

        // Update restaurant's order history
        for (const order of items) {
            const restaurantProfile = await RestaurantProfile.findOne({ restaurantId: order.restaurantId });
            if (restaurantProfile) {
                restaurantProfile.orders.push({ orderId: savedOrder._id });
                await restaurantProfile.save();
            }
        }

        res.status(201).json({ message: 'Order placed successfully.', order: savedOrder });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


export const getUserOrders = async (req, res, next) => {
    try {
        const userId = req.userId;

        // Get user and populate their orders
        const user = await User.findById(userId)
            .populate({
                path: 'orders.orderId',
                populate: [
                    {
                        path: 'orders.restaurantId',
                        select: 'name city state rating',
                    },
                    {
                        path: 'orders.items.itemId',
                        select: 'name price image category',
                    },
                ],
            })
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Extract the populated order data
        const orders = user.orders
            .map(orderRef => orderRef.orderId)
            .filter(order => order !== null)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.status(200).json({ 
            success: true,
            count: orders.length,
            orders 
        });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const getOwnerOrders = async (req, res) => {
    try {
        const ownerId = req.userId;

        // Find the restaurant profile for this owner
        const restaurantProfile = await RestaurantProfile.findOne({ owner: ownerId });
        
        if (!restaurantProfile) {
            return res.status(404).json({ message: 'Restaurant profile not found for this owner.' });
        }

        const restaurantId = restaurantProfile.restaurantId;

        // Find all orders that contain this restaurant's items
        const orders = await Order.find({ 'orders.restaurantId': restaurantId })
            .populate({
                path: 'user',
                select: 'fullName email mobile',
            })
            .populate({
                path: 'orders.items.itemId',
                select: 'name price image category',
            })
            .sort({ createdAt: -1 })
            .lean();

        // Filter each order to only include items from this restaurant
        const filteredOrders = orders.map(order => {
            const restaurantSpecificOrders = order.orders.filter(
                orderItem => orderItem.restaurantId.toString() === restaurantId.toString()
            );

            return {
                ...order,
                orders: restaurantSpecificOrders,
            };
        });

        res.status(200).json({ 
            success: true,
            count: filteredOrders.length,
            orders: filteredOrders 
        });
    } catch (error) {
        console.error('Error fetching owner orders:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        const validStatuses = ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"];

        // Validate status
        if (!status) {
            return res.status(400).json({ message: 'Status is required.' });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                message: 'Invalid order status.',
                validStatuses 
            });
        }

        // Find the order first to verify ownership (if owner)
        const order = await Order.findById(orderId)
            .populate('orders.restaurantId', '_id');

        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // If user is an owner, verify they own the restaurant in this order
        if (req.userRole === 'owner') {
            const restaurantProfile = await RestaurantProfile.findOne({ owner: req.userId });
            
            if (!restaurantProfile) {
                return res.status(403).json({ message: 'Not authorized to update this order.' });
            }

            const ownsRestaurant = order.orders.some(
                orderItem => orderItem.restaurantId._id.toString() === restaurantProfile.restaurantId.toString()
            );

            if (!ownsRestaurant) {
                return res.status(403).json({ message: 'You can only update orders for your own restaurant.' });
            }
        }

        // Update the order status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        )
        .populate({
            path: 'user',
            select: 'fullName email mobile',
        })
        .populate({
            path: 'orders.restaurantId',
            select: 'name city state',
        })
        .populate({
            path: 'orders.items.itemId',
            select: 'name price image',
        });

        res.status(200).json({ 
            success: true,
            message: 'Order status updated successfully.',
            order: updatedOrder 
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};