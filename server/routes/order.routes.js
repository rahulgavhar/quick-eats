import express from 'express';
const orderRouter = express.Router();


import {
  placeOrder,
  getUserOrders,
  getOwnerOrders,
  updateOrderStatus,
  getDeliveryBoyOrders,
  acceptDeliveryAssignment,
  completeDeliveryAssignment,
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

orderRouter.put(
  '/delivery/:id/complete',
  isAuth,
  authorizeRoles(['deliveryBoy']),
  completeDeliveryAssignment,
);


export default orderRouter;