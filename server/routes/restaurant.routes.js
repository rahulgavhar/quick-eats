import express from 'express';
const restaurantRouter = express.Router();

import { createRestaurant, editRestaurant, getRestaurantById, getOwnerRestaurant, deleteRestaurant, listRestaurantsInCity, listRestaurantsInState, listRestaurantsNearLocation1, getAddressFromCoordinates, listRestaurantsNearLocation2 } from '../controllers/restaurant.controllers.js';
import { isAuth } from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';
import { locationRateLimiter } from '../middlewares/rateLimiter.js';

restaurantRouter.post('/create', isAuth, upload.single('coverPhoto'), createRestaurant);
restaurantRouter.put('/edit/:restaurantId', isAuth, upload.single('coverPhoto'), editRestaurant);
restaurantRouter.delete('/delete/:restaurantId', isAuth, deleteRestaurant);

restaurantRouter.get('/id/:restaurantId', getRestaurantById);
restaurantRouter.get('/owner', isAuth, getOwnerRestaurant);
restaurantRouter.get('/city/:city', listRestaurantsInCity);
restaurantRouter.get('/state/:state', listRestaurantsInState);
restaurantRouter.get('/nearby', isAuth, locationRateLimiter, listRestaurantsNearLocation2);
restaurantRouter.get('/address', isAuth, locationRateLimiter, getAddressFromCoordinates);

export default restaurantRouter;