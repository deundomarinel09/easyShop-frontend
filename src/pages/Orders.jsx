import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchOrders } from '../apiData/orders';
import { CheckCircle, Package, TruckIcon, Clock, XCircle } from 'lucide-react';

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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('All');
  
  // Ref to keep track of previous orders to compare
  const prevOrdersRef = useRef([]);
  
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setError('User not logged in');
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (!user) return;

    let intervalId;

    const fetchOrdersData = async () => {
      const { orders: fetchedOrders, error: fetchError } = await fetchOrders(user.id);

      if (fetchError) {
        setError(fetchError);
      } else {
        // Compare fetched orders with previous orders to prevent unnecessary updates
        if (!areOrdersEqual(prevOrdersRef.current, fetchedOrders)) {
          setOrders(fetchedOrders);
          prevOrdersRef.current = fetchedOrders; // Update the reference for next comparison
        }
      }

      setLoading(false);
    };

    fetchOrdersData();
    intervalId = setInterval(fetchOrdersData, 10000);

    return () => clearInterval(intervalId);
  }, [user]);

  const filteredOrders = useMemo(() => {
    if (filter === 'All') return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

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
                <div className="text-gray-600 font-medium">Total:</div>
                <div className="text-lg font-bold text-blue-600">₱ {order.total.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-600 font-medium">Shipping To Details:</div>
                <div className="text-gray-800">
                  <div>NAME: {order.name}</div>
                  <div>ADDRESS: {order.shippingAddress}</div>
                </div>
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

      {loading ? (
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
    </div>
  );
}

function areOrdersEqual(prevOrders, newOrders) {
  if (prevOrders.length !== newOrders.length) return false;
  return prevOrders.every((prev, idx) => JSON.stringify(prev) === JSON.stringify(newOrders[idx]));
}
