import axios from 'axios';

const BASE = 'https://mobileeasyshop.onrender.com/api';

const testBase = 'https://localhost:7066/api';

const signUpEndPoint = '/User/SignUp';
const loginEndPoint = '/user/login';
const verifyOtpEndPoint = '/user/verify-otp';

const signUpUrl = `${BASE}${signUpEndPoint}`;
const loginUrl = `${BASE}${loginEndPoint}`;
const verifyOtpUrl = `${BASE}${verifyOtpEndPoint}`;

export const verifyOtp = async (email, otp) => {
  try {
    const res = await axios.post(`${verifyOtpUrl}`, { email, otp });
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

export const fetchLogin = (values) => {
    return axios.post(`${loginUrl}`, values)
      .then((response) => {
        return response;
      })
      .catch((error) => {
        throw error;
      });
  };
  
  export const fetchCreateAccount = (values) => {
    return axios.post(`${signUpUrl}`, values);
  };
  
export const fetchUsers = () => axios.get(`${BASE}/user/user`);
export const fetchProducts = () => axios.get(`${BASE}/product`);
