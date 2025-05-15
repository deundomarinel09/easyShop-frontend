// src/api/orderApi.js
//test
import axios from 'axios';

const baseLocal = 'https://localhost:7066';
const baseProd = 'https://mobileeasyshop.onrender.com';
const fetchOrdersUrl = '/api/Order/GetOrderById';

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
