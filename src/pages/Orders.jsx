import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchOrders } from '../apiData/orders';
import { fetchUser } from '../apiData/user';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, Package, TruckIcon, Clock, XCircle } from 'lucide-react';
import { cancelOrder as cancelOrderApi } from '../apiData/cancelOrder';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

function getStatusIcon(status) {
  switch (status) {
    case "Completed":
      return <CheckCircle className="h-5 w-5 text-green-500 mr-1" />;
    case "Processing":
      return <Package className="h-5 w-5 text-blue-500 mr-1" />;
    case "Shipped":
      return <TruckIcon className="h-5 w-5 text-purple-500 mr-1" />;
    case "Pending":
      return <Clock className="h-5 w-5 text-yellow-500 mr-1" />;
    case "Cancelled":
      return <XCircle className="h-5 w-5 text-red-500 mr-1" />;
    default:
      return null;
  }
}

export default function Orders() {
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullUser, setFullUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [filter, setFilter] = useState('All');
  const [cancelModal, setCancelModal] = useState({ show: false, orderId: null });
  const [cancelReason, setCancelReason] = useState('');
  const prevOrdersRef = useRef([]);

  useEffect(() => {
    const getUserDetails = async () => {
      if (user?.email) {
        const { user: fetchedUser, error } = await fetchUser(user.email);
        if (error) {
          alert("Failed to fetch user:", error);
        } else {
          setFullUser(fetchedUser);
        }
      }
      setLoadingUser(false);
    };

    getUserDetails();
  }, [user]);

  useEffect(() => {
    if (!fullUser) return;

    let intervalId;

    const fetchOrdersData = async () => {
      const { orders: fetchedOrders, error: fetchError } = await fetchOrders(fullUser.id);
      if (fetchError) {
        setError(fetchError);
      } else {
        if (!areOrdersEqual(prevOrdersRef.current, fetchedOrders)) {
          setOrders(fetchedOrders);
          prevOrdersRef.current = fetchedOrders;
        }
      }

      setLoading(false);
    };

    fetchOrdersData();
    intervalId = setInterval(fetchOrdersData, 10000);

    return () => clearInterval(intervalId);
  }, [fullUser]);

  const filteredOrders = useMemo(() => {
    if (filter === 'All') return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const handleCancelOrder = async () => {
    const { success, error } = await cancelOrderApi(cancelModal.orderId, cancelReason);
  
    if (!success) {
      setError(error);
      return;
    }
  
    const { orders: updatedOrders, error: fetchError } = await fetchOrders(fullUser.id);
    if (fetchError) {
      setError(fetchError);
    } else {
      setOrders(updatedOrders);
      prevOrdersRef.current = updatedOrders;
    }
  
    setCancelModal({ show: false, orderId: null });
    setCancelReason('');
  };

  const handleReorder = (order) => {
    clearCart();
    order.items.$values.forEach(item => {
      addToCart({
        id: item.productId,
        name: item.product,
        price: item.amount,
        quantity: item.quantity,
      });
    });
    navigate('/cart'); // or navigate('/checkout');
  };

  const renderOrders = (ordersList) =>
    ordersList.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ordersList.map((order, index) => (
          <div
            key={order.orderRef || index}
            className="border rounded-xl shadow-sm p-6 hover:shadow-md transition bg-white"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">Order #{order.orderRef}</h3>
              <span className="flex items-center px-3 py-1 text-sm rounded-full font-medium bg-gray-100 text-gray-800">
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>
  
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-gray-600 font-medium">Items Total:</div>
                <div className="text-lg font-bold text-blue-600">₱ {order.total.toFixed(2)}</div>
                <div className="text-gray-600 font-medium">Shipping Fee:</div>
                <div className="text-lg font-bold text-blue-600">₱ {order.shippingFee?.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Shipping To:</div>
                <div className="text-gray-800">
                  <div>NAME: {order.name}</div>
                  <div>ADDRESS: {order.shippingAddress}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-gray-600 font-medium">Grand Total:</div>
              <div className="text-lg font-bold text-blue-600">
                ₱ {(Number(order.total ?? 0) + Number(order.shippingFee ?? 0)).toFixed(2)}
              </div>
            </div>

            {order.items?.$values?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
                <ul className="divide-y divide-gray-200">
                  {order.items.$values.map((item, i) => (
                    <li key={i} className="py-2 flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{item.product}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right text-gray-800 font-semibold">
                        ₱ {item.amount.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
  
            {/* Show cancel reason if order is cancelled */}
            {order.status === 'Cancelled' && order.cancelReason && (
              <div className="mt-4 text-red-600 font-semibold">
                <h4 className="text-sm">Cancellation Reason:</h4>
                <p>{order.cancelReason}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="text-right mt-4 space-x-2">
              {order.status === 'Pending' && (
                <button
                  onClick={() =>
                    setCancelModal({ show: true, orderId: order.orderRef })
                  }
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded"
                >
                  Cancel Order
                </button>
              )}

              {order.status === 'Completed' && (
                <button
                  onClick={() => handleReorder(order)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded"
                >
                  Reorder
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-center text-gray-700">No orders found for this status.</p>
    );

  const statusFilters = ['All', 'Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-4xl font-bold text-center mb-10">Your Orders</h2>

      {loadingUser || loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : (
        <>
          <div className="flex justify-center gap-3 flex-wrap mb-8">
            {statusFilters.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium border transition ${
                  filter === status
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                {getStatusIcon(status)}
                {status}
              </button>
            ))}
          </div>

          {renderOrders(filteredOrders)}
        </>
      )}

      {/* Cancel Modal */}
      {cancelModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cancel Order</h3>
            <label className="block mb-2 font-medium text-gray-700">
              Reason for cancellation:
            </label>
            <textarea
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Enter your reason..."
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCancelModal({ show: false, orderId: null })}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={!cancelReason.trim()}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function areOrdersEqual(prevOrders, newOrders) {
  if (prevOrders.length !== newOrders.length) return false;
  return prevOrders.every((prev, idx) => JSON.stringify(prev) === JSON.stringify(newOrders[idx]));
}
