import axios from 'axios';

const BASE = 'https://mobileeasyshop.onrender.com/api';
const testBase = 'https://localhost:7066/api';

// Endpoints
const signUpEndPoint = '/User/SignUp';
const loginEndPoint = '/user/login';
const verifyOtpEndPoint = '/user/verify-otp';
const resendOtpEndPoint = '/user/resend-otp';

// Full URLs
const signUpUrl = `${BASE}${signUpEndPoint}`;
const loginUrl = `${BASE}${loginEndPoint}`;
const verifyOtpUrl = `${BASE}${verifyOtpEndPoint}`;
const resendOtpUrl = `${BASE}${resendOtpEndPoint}`;

// Verify OTP
export const verifyOtp = async (email, otp) => {
  try {
    console.log("email", email);
    const res = await axios.post(verifyOtpUrl, { email, otp });
    console.log("[verifyOtp] server response:", res.data);
    return res.data;
  } catch (err) {
    console.error("[verifyOtp] error response:", err.response?.data || err.message);
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return { success: false, message: "Something went wrong" };
  }
};

// Resend OTP
// Resend OTP
export const resendOtp = async (email) => {
  try {
    console.log("[resendOtp] Resending OTP for:", email);
    const res = await axios.post(
      resendOtpUrl,
      { email },
      {
        headers: {
          'Content-Type': 'application/json', // <-- this line fixes the 415 error
        },
      }
    );
    console.log("[resendOtp] server response:", res.data);
    return res.data;
  } catch (err) {
    console.error("[resendOtp] error response:", err.response?.data || err.message);
    if (err.response && err.response.data) {
      return err.response.data;
    }
    return { success: false, message: "Something went wrong" };
  }
};


// Fetch Login
export const fetchLogin = (values) => {
  return axios.post(loginUrl, values)
    .then((response) => response)
    .catch((error) => {
      throw error;
    });
};

// Create New Account
export const fetchCreateAccount = (values) => {
  return axios.post(signUpUrl, values);
};

// Fetch All Users
export const fetchUsers = () => axios.get(`${BASE}/user/user`);

// Fetch All Products
export const fetchProducts = () => axios.get(`${BASE}/product`);
