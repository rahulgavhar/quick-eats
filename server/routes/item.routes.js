import express from 'express';
const itemRouter = express.Router();

import { addItem, editItem, deleteItem, getItemsByRestaurant, getItemsByCategory, deleteAllItemsOfRestaurant } from '../controllers/item.controllers.js';
import { isAuth } from '../middlewares/isAuth.js';


itemRouter.post('/create/:restaurantId', isAuth, addItem);
itemRouter.put('/edit/:itemId', isAuth, editItem);
itemRouter.delete('/delete/:itemId', isAuth, deleteItem);
itemRouter.get('/restaurant', isAuth, getItemsByRestaurant);
itemRouter.get('/category/:category', getItemsByCategory);
itemRouter.delete('/restaurant/:restaurantId', isAuth, deleteAllItemsOfRestaurant);

export default itemRouter;