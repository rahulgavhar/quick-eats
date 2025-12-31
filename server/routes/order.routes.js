import express from 'express';
const orderRouter = express.Router();


import { placeOrder, getUserOrders, getOwnerOrders, updateOrderStatus } from '../controllers/order.controllers.js';
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


export default orderRouter;