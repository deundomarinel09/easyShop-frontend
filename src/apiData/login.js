import axios from 'axios';

const BASE = 'https://mobileeasyshop.onrender.com/api';

const testBase = 'https://localhost:7066/api';

const signUpEndPoint = '/User/SignUp';
const loginEndPoint = '/user/login';
const verifyOtpEndPoint = '/user/verify-otp';

const signUpUrl = `${BASE}${signUpEndPoint}`;
const loginUrl = `${BASE}${loginEndPoint}`;
const verifyOtpUrl = `${testBase}${verifyOtpEndPoint}`;

export const verifyOtp = async (email, otp) => {
  try {
    console.log("email", email);
    const res = await axios.post(`${verifyOtpUrl}`, { email, otp });
    console.log("[verifyOtp] server response:", res.data);  // see full backend data
    return res.data;  // <-- return actual backend response
  } catch (err) {
    console.error("[verifyOtp] error response:", err.response?.data || err.message);

    if (err.response && err.response.data) {
      return err.response.data; // if backend sent an error JSON, return it
    }

    return { success: false, message: "Something went wrong" };
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
