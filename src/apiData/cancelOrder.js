// apiData/cancelOrder.js
//test
import axios from 'axios';

const BASE = 'https://mobileeasyshop.onrender.com/api';

const testBase = 'https://localhost:7066/api';
const cancelEndpoint = '/Order/CancelOrder';

export async function cancelOrder(orderId, reason) {
  try {

    const response = await axios.post(`${BASE}${cancelEndpoint}`, {
      OrderRef: orderId, // sending order reference
      Reason: reason,    // sending cancellation reason
    });

    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}
