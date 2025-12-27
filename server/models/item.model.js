import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    foodType: {
      type: String,
      required: true,
      enum: ["Vegetarian", "Non-Vegetarian"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Appetizer",
        "Main Course",
        "Dessert",
        "Beverage",
        "Side Dish",
        "Salad",
        "Soup",
        "Snack",
        "Breakfast",
        "Lunch",
        "Dinner",
      ],
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);

export default Item;
