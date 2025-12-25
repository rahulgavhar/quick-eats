import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    isOpen: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 3.0,
      min: 1.0,
      max: 5.0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

restaurantSchema.index({
  state: 1,
  city: 1,
  isOpen: 1,
  location: "2dsphere",
});

restaurantSchema.index({
  rating: -1,
});

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
