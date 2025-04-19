// product.js

import axios from 'axios';

// Define the endpoint URL
const baseLocal = 'https://localhost:7066';
const baseProd = 'https://mobileeasyshop.onrender.com';
const getProductsUrl = '/api/Product/GetAllProduct';

// Function to get products by categories
export async function getProducts() {
  try {
    const response = await axios.get(`${baseLocal}${getProductsUrl}`);

    return response.data;
  } catch (error) {
    throw error;
  }
}
