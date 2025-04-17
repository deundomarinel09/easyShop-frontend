import axios from 'axios';

const BASE = 'https://mobileeasyshop.onrender.com/api';

//const BASE = 'https://localhost:7066/api'

export const fetchLogin = (values) => {
    return axios.post(`${BASE}/user/login`, values)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw error;
      });
  };
  
export const fetchCreateAccount = (values) => axios.post(`${BASE}/user`,values);

export const fetchUsers = () => axios.get(`${BASE}/user/user`);
export const fetchProducts = () => axios.get(`${BASE}/product`);
