// src/components/Orders.js
import { useState, useEffect, useMemo } from 'react';
import { fetchOrders } from '../apiData/orders';

function areOrdersEqual(prevOrders, newOrders) {
  if (prevOrders.length !== newOrders.length) return false;
  return prevOrders.every((prev, idx) => JSON.stringify(prev) === JSON.stringify(newOrders[idx]));
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

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
        setOrders((prev) => {
          return areOrdersEqual(prev, fetchedOrders) ? prev : fetchedOrders;
        });
      }
  
      setLoading(false);
    };
  
    // Fetch immediately on mount
    fetchOrdersData();
  
    // Set interval for polling
    intervalId = setInterval(fetchOrdersData, 10000); // every 10 seconds
  
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [user]);
  

  const renderedOrders = useMemo(() => {
    return orders.map((order, index) => (
      <div
        key={order.orderRef || index}
        className="border rounded-xl shadow-sm p-6 hover:shadow-md transition bg-white"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold">Order #{order.orderRef}</h3>
          <span
            className={`px-3 py-1 text-sm rounded-full font-medium ${
              order.status === 'Delivered'
                ? 'bg-green-100 text-green-800'
                : order.status === 'Pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
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
            <div className="text-gray-800">
              NAME: {order.name}    
            </div> 
            <div className="text-gray-800">
            ADDRESS: {order.shippingAddress}
            </div> 
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
    ));
  }, [orders]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-4xl font-bold text-center mb-10">Your Orders</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-600">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-700">No orders found for the user.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{renderedOrders}</div>
      )}
    </div>
  );
}
