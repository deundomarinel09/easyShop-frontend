import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
        {cart.map((item) => (
          <div key={item.id} className="flex items-center py-4 border-b last:border-0">
            <img
              src={item.image} // Ensure the image path is being used
              alt={item.name}
              className="w-24 h-24 object-cover rounded"
            />
            <div className="flex-1 ml-4">
              <h3 className="text-lg font-semibold">{item.name}</h3>
              <p className="text-gray-600">₱ {item.price}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-2 py-1 border rounded-l bg-gray-200 hover:bg-gray-300"
              >
                -
              </button>
              <span className="px-4 py-1 border-t border-b">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 border rounded-r bg-gray-200 hover:bg-gray-300"
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
        ))}
        <div className="mt-8 flex justify-between items-center">
          <span className="text-2xl font-bold">
            Total: ₱ {total.toFixed(2)}
          </span>
          <Link
            to="/checkout"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
