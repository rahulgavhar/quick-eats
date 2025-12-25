import express from 'express';
const restaurantRouter = express.Router();

import { createRestaurant, editRestaurant, getRestaurantById, getOwnerRestaurant, deleteRestaurant, listRestaurantsInCity, listRestaurantsInState, listRestaurantsNearLocation } from '../controllers/restaurant.controllers.js';
import { isAuth } from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';

restaurantRouter.post('/create', isAuth, upload.single('image'), createRestaurant);
restaurantRouter.put('/edit/:restaurantId', isAuth, upload.single('image'), editRestaurant);
restaurantRouter.delete('/delete/:restaurantId', isAuth, deleteRestaurant);

restaurantRouter.get('/:restaurantId', getRestaurantById);
restaurantRouter.get('/owner', isAuth, getOwnerRestaurant);
restaurantRouter.get('/city/:city', listRestaurantsInCity);
restaurantRouter.get('/state/:state', listRestaurantsInState);
restaurantRouter.get('/nearby', listRestaurantsNearLocation);

export default restaurantRouter;