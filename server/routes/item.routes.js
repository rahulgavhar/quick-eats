import express from 'express';
const itemRouter = express.Router();

import { createItem, editItem, deleteItem, getItemsByRestaurant, getItemsByCategory } from '../controllers/item.controllers.js';
import { isAuth } from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';


itemRouter.post('/create', isAuth, upload.single('image'), createItem);
itemRouter.put('/edit/:itemId', isAuth, upload.single('image'), editItem);
itemRouter.delete('/delete/:itemId', isAuth, deleteItem);
itemRouter.get('/restaurant', isAuth, getItemsByRestaurant);
itemRouter.get('/category/:category', getItemsByCategory);

export default itemRouter;