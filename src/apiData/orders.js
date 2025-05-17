// src/api/orderApi.js
//test
import axios from 'axios';

const baseLocal = 'https://localhost:7066';
const baseProd = 'https://mobileeasyshop.onrender.com';
const fetchOrdersUrl = '/api/Order/GetOrderById';
const updateOrderStatusEndpoint = "/api/Dash/UpdateOrder"


export const fetchOrders = async (userId) => {
  try {
      const response = await axios.post(`${baseProd}${fetchOrdersUrl}`, {
      userId: userId,
    });

    if (response.data === "No orders found for the user.") {
      return { orders: [], error: "No orders found for the user." };
    } else {
      const normalizedOrders = response.data?.$values || [];
      return { orders: normalizedOrders, error: null };
    }
  } catch (err) {
    return { orders: [], error: `Failed to load orders. ${err.response.data}` };
  }
};

export const updateOrderStatus = async (
  orderId,
  newStatus,
) => {
  try {
      const response = await fetch(`${baseProd}${updateOrderStatusEndpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderRef: orderId,
        status: newStatus,  
      }),
    });

    if (!response.ok) throw new Error("Failed to update order status.");
    return await response.json();
  } catch (error) {
    alert(error);
    throw error;
  }
};