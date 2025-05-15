import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import * as Yup from "yup";
import React, { useState, useEffect } from "react";
import { fetchUser } from "../apiData/user";
import MapPicker from "./MapPicker";

export default function Checkout() {
  const [location, setLocation] = useState(null);
  const [autoAddress, setAutoAddress] = useState("");
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [fullUser, setFullUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const getUserDetails = async () => {
      if (user?.email) {
        const { user: fetchedUser, error } = await fetchUser(user.email);
        if (error) {
          console.error("Failed to fetch user.");
        } else {
          setFullUser(fetchedUser);
        }
      }
      setLoadingUser(false);
    };
    getUserDetails();
  }, [user]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    address: Yup.string().required("Required"),
    phone: Yup.string().required("Required"),
  });

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const orderPayload = {
        userId: fullUser.id,
        shippingAddress: values.address,
        email: fullUser.email,
        name: values.name,
        phoneNo: values.phone,
        status: "Pending",
        total: total.toFixed(2),
        location: location ? `${location.lat},${location.lng}` : null,
        items: cart.map((item) => ({
          productId: item.id,
          amount: item.price,
          quantity: item.quantity,
        })),
      };

      const baseProd = "https://mobileeasyshop.onrender.com";
      await axios.post(`${baseProd}/api/Order/PlaceOrder`, orderPayload);

      alert("Order placed successfully!");
      clearCart();
      navigate("/orders");
    } catch (error) {
      alert("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser || !fullUser) {
    return <div className="text-center py-10">Loading user details...</div>;
  }

  const initialValues = {
    name: `${fullUser.lastname}, ${fullUser.firstname}`,
    email: fullUser.email,
    address: autoAddress || "",
    phone: fullUser.phonenumber,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-4xl font-bold text-center mb-10">Checkout</h2>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-4">
            <span>{item.name} x {item.quantity}</span>
            <span>php {(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t mt-6 pt-4 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>php {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping Form */}
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => {
          // Sync autoAddress to Formik's address field
          useEffect(() => {
            if (autoAddress) {
              setFieldValue("address", autoAddress);
            }
          }, [autoAddress, setFieldValue]);

          return (
            <Form className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6">Shipping Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block mb-1 text-gray-700">
                    Full Name<span className="text-red-600">*</span>
                  </label>
                  <Field name="name" className="w-full px-3 py-2 border rounded-lg" />
                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">
                    Phone<span className="text-red-600">*</span>
                  </label>
                  <Field name="phone" className="w-full px-3 py-2 border rounded-lg" />
                  <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
                </div>
                <div>
                  <label className="block mb-1 text-gray-700">
                    Email<span className="text-red-600">*</span>
                  </label>
                  <Field name="email" type="email" className="w-full px-3 py-2 border rounded-lg" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                </div>
                <div className="md:col-span-3">
                  <label className="block mb-1 text-gray-700">
                    Address<span className="text-red-600">*</span>
                  </label>
                  <Field
                    as="textarea"
                    name="address"
                    placeholder="e.g. 123 Mango St., Brgy. Maligaya"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={values.address}
                    onChange={(e) => setFieldValue("address", e.target.value)}
                  />
                  <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
                </div>
                <div className="md:col-span-3 mt-4">
                  <label className="block mb-1 text-gray-700">Pin your location (search or click)</label>
                  <MapPicker
  location={location}
  setLocation={setLocation}
  setFieldValue={setFieldValue}
/>

                  {location && (
                    <p className="text-sm mt-2 text-gray-600">
                      Selected: Latitude {location.lat.toFixed(5)}, Longitude {location.lng.toFixed(5)}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 mt-8 rounded-lg transition-colors ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Place Order (Cash on Delivery)"}
              </button>
            </Form>
          );
        }}
      </Formik>
    </div>
  );
}
