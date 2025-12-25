import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import ENV from './config/env.js';
import connectDB from './config/db.js';

const app = express();
if (ENV.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}


app.use(cors({
  origin: ENV.CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import restaurantRouter from './routes/restaurant.routes.js';
import itemRouter from './routes/item.routes.js';

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/items', itemRouter);


// Start the server
if (ENV.NODE_ENV === "production") {
  // 1. Serve static files first
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // 2. Catch-all route for SPA (React / Vite / Vue)
  // Express 5 requires naming the wildcard, e.g., {*any} or {*splat}
  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}
app.listen(ENV.PORT, async () => {
  try {
    await connectDB();
    console.log(`Server is running on port ${ENV.PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
  }
});