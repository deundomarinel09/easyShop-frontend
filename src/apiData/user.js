// src/api/orderApi.js
import axios from 'axios';

const baseLocal = 'https://localhost:7066';
const baseProd = 'https://mobileeasyshop.onrender.com';
const fetchUserUrl = '/api/User/GetUser';

export const fetchUser = async (email) => {
    try {
      const response = await axios.post(`${baseProd}${fetchUserUrl}?email=${encodeURIComponent(email)}`);
  
      return { user: response.data, error: null };
    } catch (err) {
      return { user: null, error: `Failed to fetch user. ${err.response?.data || err.message}` };
    }
  };