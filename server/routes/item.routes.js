import express from 'express';
const itemRouter = express.Router();

import { addItem, editItem, deleteItem, getItemsByRestaurant, getItemsByCategory, getItemsByOwner } from '../controllers/item.controllers.js';
import { isAuth } from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';


itemRouter.post('/create', isAuth, upload.single('image'), addItem);
itemRouter.put('/edit/:itemId', isAuth, upload.single('image'), editItem);
itemRouter.delete('/delete/:itemId', isAuth, deleteItem);
itemRouter.get('/restaurant', isAuth, getItemsByRestaurant);
itemRouter.get('/category/:category', getItemsByCategory);
itemRouter.get('/owner', isAuth, getItemsByOwner);

export default itemRouter;