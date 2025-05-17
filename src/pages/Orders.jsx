import { useState, useEffect, useMemo, useRef } from "react";
import { fetchOrders } from "../apiData/orders";
import { fetchUser } from "../apiData/user";
import { useAuth } from "../context/AuthContext";
import { CheckCircle, Package, TruckIcon, Clock, XCircle } from "lucide-react";
import { cancelOrder as cancelOrderApi } from "../apiData/cancelOrder";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

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
  const [error, setError] = useState("");
  const [fullUser, setFullUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [filter, setFilter] = useState("All");
  const [cancelModal, setCancelModal] = useState({
    show: false,
    orderId: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonOther, setCancelReasonOther] = useState("");
  const prevOrdersRef = useRef([]);

  // Fetch full user details on auth user change
  useEffect(() => {
    let mounted = true;

    const getUserDetails = async () => {
      if (user?.email) {
        const { user: fetchedUser, error } = await fetchUser(user.email);
        if (error) {
          alert("Failed to fetch user: " + error);
        } else if (mounted) {
          setFullUser(fetchedUser);
        }
      }
      if (mounted) setLoadingUser(false);
    };

    getUserDetails();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Fetch orders on fullUser change and poll every 10 seconds
  useEffect(() => {
    if (!fullUser) return;

    let mounted = true;
    let intervalId;

    const fetchOrdersData = async () => {
      const { orders: fetchedOrders, error: fetchError } = await fetchOrders(
        fullUser.id
      );
      if (fetchError) {
        setError(fetchError);
      } else if (mounted) {
        // Only update state if orders differ
        if (!areOrdersEqual(prevOrdersRef.current, fetchedOrders)) {
          setOrders(fetchedOrders);
          prevOrdersRef.current = fetchedOrders;
        }
      }
      if (mounted) setLoading(false);
    };

    fetchOrdersData();
    intervalId = setInterval(fetchOrdersData, 10000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, [fullUser]);

  const filteredOrders = useMemo(() => {
    if (filter === "All") return orders;
    return orders.filter((order) => order.status === filter);
  }, [orders, filter]);

  const handleCancelOrder = async () => {
    if (cancelLoading) return; // prevent double click
    setCancelLoading(true);
  
    const reasonToSend =
      cancelReason === "Other" ? cancelReasonOther.trim() : cancelReason;
  
    const { success, error } = await cancelOrderApi(
      cancelModal.orderId,
      reasonToSend
    );
  
    if (!success) {
      setError(error);
      setCancelLoading(false);
      return;
    }
  
    const { orders: updatedOrders, error: fetchError } = await fetchOrders(
      fullUser.id
    );
    if (fetchError) {
      setError(fetchError);
    } else {
      setOrders(updatedOrders);
      prevOrdersRef.current = updatedOrders;
    }
  
    setCancelModal({ show: false, orderId: null });
    setCancelReason("");
    setCancelReasonOther("");
    setCancelLoading(false);
  };
  

  const handleReorder = (order) => {
    clearCart();
    order.items?.$values?.forEach((item) => {
      addToCart({
        id: item.productId,
        name: item.product,
        price: item.amount,
        quantity: item.quantity,
      });
    });
    navigate("/cart");
  };

  const cancellationReasons = [
    "Changed my mind",
    "Found a better price elsewhere",
    "Ordered by mistake",
    "Delivery time too long",
    "Product out of stock",
    "Product quality concerns",
    "Wrong product ordered",
    "Payment issues",
    "Shipping/delivery fee too high",
    "Delivery address incorrect",
    "Found a better alternative",
    "Need to change order items",
    "Customer service experience",
    "Order delayed",
    "Forgot to add/remove item",
    "Personal reasons",
    "Other",
  ];

  const renderOrders = (ordersList) =>
    ordersList.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {ordersList.map((order, index) => (
          <div
            key={order.orderRef || order.id || index}
            className="border rounded-xl shadow-sm p-6 hover:shadow-md transition bg-white flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-semibold">
                Order #{order.orderRef}
              </h3>
              <span className="flex items-center px-3 py-1 text-sm rounded-full font-medium bg-gray-100 text-gray-800">
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-gray-600 font-medium">Distance Fee:</div>
                <div className="text-lg font-bold text-blue-600">
                  ₱{" "}
                  {typeof order.distanceDeliveryFee === "number"
                    ? order.distanceDeliveryFee.toFixed(2)
                    : "0.00"}
                </div>
                <div className="text-gray-600 font-medium">Weight Fee:</div>
                <div className="text-lg font-bold text-blue-600">
                  ₱{" "}
                  {typeof order.weightDeliveryFee === "number"
                    ? order.weightDeliveryFee.toFixed(2)
                    : "0.00"}
                </div>
                <div className="text-gray-600 font-medium">Items Fee:</div>
                <div className="text-lg font-bold text-blue-600">
                  ₱{" "}
                  {typeof order.itemsBaseFee === "number"
                    ? order.itemsBaseFee.toFixed(2)
                    : "0.00"}
                </div>
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
                ₱{" "}
                {typeof order.grandTotal === "number"
                  ? order.grandTotal.toFixed(2)
                  : "0.00"}
              </div>
            </div>

            {order.items?.$values?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
                <ul className="divide-y divide-gray-200">
                  {order.items.$values.map((item, i) => (
                    <li key={i} className="py-2 flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.product}
                        </div>
                        <div className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="text-right text-gray-800 font-semibold">
                        ₱ {item.amount?.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Show cancel reason if order is cancelled */}
            {order.status === "Cancelled" && order.cancelReason && (
              <div className="mt-4 text-red-600 font-semibold">
                <h4 className="text-sm">Cancellation Reason:</h4>
                <p>{order.cancelReason}</p>
              </div>
            )}

            {/* Buttons */}
            <div className="text-right mt-auto pt-4 space-x-2">
              {order.status === "Pending" && (
                <button
                  onClick={() =>
                    setCancelModal({ show: true, orderId: order.orderRef })
                  }
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded"
                >
                  Cancel Order
                </button>
              )}

              {order.status === "Completed" && (
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
      <p className="text-center text-gray-700">
        No orders found for this status.
      </p>
    );

  const statusFilters = [
    "All",
    "Pending",
    "Processing",
    "Shipped",
    "Completed",
    "Cancelled",
  ];

  const [cancelLoading, setCancelLoading] = useState(false);


  return (
    <div className="max-w-7xl mx-auto p-6">
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
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
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
              Reason for cancellation <span className="text-red-500">*</span>
            </label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-1"
            >
              <option value="" disabled>
                Select a reason
              </option>
              {cancellationReasons.map((reason, idx) => (
                <option key={idx} value={reason}>
                  {reason}
                </option>
              ))}
            </select>

            {cancelReason === "" && (
              <p className="text-sm text-red-500 mb-3">
                Please select a reason.
              </p>
            )}

            {/* Show textarea only if "Other" is selected */}
            {cancelReason === "Other" && (
              <>
                <label className="block mb-2 font-medium text-gray-700">
                  Please specify <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={cancelReasonOther}
                  onChange={(e) => setCancelReasonOther(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mb-1"
                  placeholder="Enter your reason..."
                />
                {cancelReasonOther.trim() === "" && (
                  <p className="text-sm text-red-500 mb-3">
                    This field is required when selecting "Other".
                  </p>
                )}
              </>
            )}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setCancelModal({ show: false, orderId: null });
                  setCancelReason("");
                  setCancelReasonOther("");
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
  onClick={handleCancelOrder}
  className={`px-4 py-2 text-white rounded ${
    cancelLoading ? "bg-red-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
  }`}
  disabled={
    cancelLoading ||
    cancelReason === "" ||
    (cancelReason === "Other" && cancelReasonOther.trim() === "")
  }
>
  {cancelLoading ? "Cancelling..." : "Submit"}
</button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to deeply compare orders arrays by stringifying each element
function areOrdersEqual(prevOrders, newOrders) {
  if (prevOrders.length !== newOrders.length) return false;
  return prevOrders.every(
    (prev, idx) => JSON.stringify(prev) === JSON.stringify(newOrders[idx])
  );
}
