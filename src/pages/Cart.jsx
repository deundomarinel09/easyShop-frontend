import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [stockError, setStockError] = useState("");

  const [inputValues, setInputValues] = useState(
    cart.reduce((acc, item) => {
      acc[item.id] = item.quantity.toString();
      return acc;
    }, {})
  );

  const [autoRemovedMessage, setAutoRemovedMessage] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (id, value, stock) => {
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      let parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        if (parsed > stock) parsed = stock;
        else if (parsed < 1) parsed = 1;

        setInputValues((prev) => ({ ...prev, [id]: parsed.toString() }));
        updateQuantity(id, parsed);
      } else {
        setInputValues((prev) => ({ ...prev, [id]: value }));
      }
    }
  };

  const handleProceed = () => {
    const outOfStockItems = cart.filter((item) => item.stock === 0);
    if (outOfStockItems.length > 0) {
      const names = outOfStockItems.map((item) => item.name).join(", ");
      outOfStockItems.forEach((item) => removeFromCart(item.id));
      setAutoRemovedMessage(`Removed out-of-stock item(s): ${names}`);
  
      // Wait 2 seconds to show the message before navigating
      setTimeout(() => {
        setAutoRemovedMessage("");
        navigate("/checkout");
      }, 5000);
    } else {
      navigate("/checkout");
    }
  };
  
  

  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600">Start shopping to add items to your cart!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8 text-center">Shopping Cart</h2>
      <div className="bg-white rounded-lg shadow-md p-6">
        {cart.map((item) => {
          const imageUrl = item.image?.replace('product-imagesproduct-images%2F', 'product-images//');
          return (
            <div
              key={item.id}
              className="flex items-center py-4 border-b last:border-0"
            >
              <img
                src={imageUrl?.replace(".jpg", "")}
                alt={item.name}
                className="w-24 h-24 object-cover rounded"
              />
              <div className="flex-1 ml-4">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-600">
                  Price: ₱ <span className="text-blue-500">{item.price}</span>
                </p>
                <p className="text-gray-600">
                  Unit of measurement: <span className="text-blue-500">{item.measurement}</span>
                </p>
                <p className="text-gray-600">
                  Weight: <span className="text-blue-500">{item.weight}</span>
                </p>
                <p className="text-orange-500">{item.stock} in stock</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newQty = item.quantity - 1;
                    if (newQty >= 1) {
                      setInputValues((prev) => ({
                        ...prev,
                        [item.id]: newQty.toString(),
                      }));
                      updateQuantity(item.id, newQty);
                    }
                  }}
                  className="px-2 py-1 border rounded-l bg-gray-200 hover:bg-gray-300"
                  disabled={item.quantity <= 1}
                >
                  -
                </button>

                <input
                  type="text"
                  disabled={item.stock === 0}
                  value={inputValues[item.id] || ""}
                  onChange={(e) =>
                    handleInputChange(item.id, e.target.value, item.stock)
                  }
                  className="w-16 text-center border-t border-b outline-none"
                />

                <button
                  onClick={() => {
                    const newQty = item.quantity + 1;
                    if (newQty <= item.stock) {
                      setInputValues((prev) => ({
                        ...prev,
                        [item.id]: newQty.toString(),
                      }));
                      updateQuantity(item.id, newQty);
                    }
                  }}
                  className={`px-2 py-1 border rounded-r ${
                    item.quantity >= item.stock
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  disabled={item.quantity >= item.stock}
                >
                  +
                </button>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="ml-4 text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>
          );
        })}

{autoRemovedMessage && (
  <div className="mb-4 text-yellow-700 text-sm bg-yellow-100 p-3 rounded">
    {autoRemovedMessage}
  </div>
)}


        <div className="mt-8">
          {stockError && (
            <div className="mb-4 text-red-600 text-sm bg-red-100 p-3 rounded">
              {stockError}
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">
              Total: ₱ {total.toFixed(2)}
            </span>
            <button
              onClick={handleProceed}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
