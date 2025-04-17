// product.js

import axios from 'axios';

// Define the endpoint URL
const url = 'https://localhost:7066/api/product/productByCategories';
//const url = 'https://mobileeasyshop.onrender.com/api/product/productByCategories';

// Function to get products by categories
export async function getProductsByCategories() {
  try {
    // Make the GET request
    const response = await axios.get(url);

    // Return the data if successful
    return response.data;
  } catch (error) {
    // Handle error response
    throw error;
  }
}
