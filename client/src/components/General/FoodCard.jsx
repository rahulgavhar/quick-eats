import { useSelector } from "react-redux";

const FoodCard = ({ food, onAddToCart }) => {
  const { mode } = useSelector((state) => state.theme);

  return (
    <div
      className={`rounded-lg shadow-md hover:shadow-xl transition overflow-hidden ${
        mode === "dark" ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div
        className={`p-0 flex items-center justify-center h-40 w-full transition-colors duration-300 overflow-hidden ${
          mode === "dark"
            ? "bg-linear-to-b from-gray-700 to-gray-600"
            : "bg-linear-to-b from-green-100 to-cyan-100"
        }`}
      >
        {food?.image && (String(food.image).startsWith("http") || String(food.image).startsWith("/")) ? (
          <img
            src={food.image}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">{food?.image}</span>
        )}
      </div>
      <div className="p-4">
        <h3
          className={`text-xl font-bold transition-colors duration-300 ${
            mode === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {food.name}
        </h3>
        <p
          className={`text-sm mt-2 transition-colors duration-300 ${
            mode === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {food.description}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-bold text-green-500">
            ${food.price}
          </span>
          <button
            onClick={onAddToCart}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
