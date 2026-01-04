import express from 'express';
const orderRouter = express.Router();


import {
  placeOrder,
  getUserOrders,
  getOwnerOrders,
  updateOrderStatus,
  getDeliveryBoyOrders,
  acceptDeliveryAssignment,
  verifyPayment,
  getDeliveryBoyLocation,
  verifyOTP
} from '../controllers/order.controllers.js';
import { isAuth, authorizeRoles } from '../middlewares/auth.js';


orderRouter.post('/create', isAuth, authorizeRoles(['user']), placeOrder);
orderRouter.get('/all', isAuth, authorizeRoles(['user', 'owner']), (req, res) => {
  if (req.userRole === 'user') {
    getUserOrders(req, res);
  } else if (req.userRole === 'owner') {
    getOwnerOrders(req, res);
  }
});
orderRouter.put('/status/:id', isAuth, authorizeRoles(['owner']), updateOrderStatus);

orderRouter.post('/verify-payment', isAuth, authorizeRoles(['user']), verifyPayment);

orderRouter.post('/verify-otp/:id', isAuth, authorizeRoles(['user']), verifyOTP);

// Delivery partner endpoints
orderRouter.get(
  '/delivery/my',
  isAuth,
  authorizeRoles(['deliveryBoy']),
  getDeliveryBoyOrders,
);

orderRouter.put(
  '/delivery/:id/accept',
  isAuth,
  authorizeRoles(['deliveryBoy']),
  acceptDeliveryAssignment,
);

orderRouter.get(
  '/deliveryboy-location/:orderId',
  isAuth,
  authorizeRoles(['user']),
  getDeliveryBoyLocation,
);

export default orderRouter;