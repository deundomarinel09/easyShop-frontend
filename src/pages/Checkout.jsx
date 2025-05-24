import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import * as Yup from "yup";
import React, { useState, useEffect } from "react";
import { fetchUser } from "../apiData/user";
import MapPicker from "./MapPicker";

const STORE_LOCATION = {
  lat: 17.65280000, // 📍 Latitude
  lng: 121.69100000, // 📍 Longitude
};
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateDeliveryFee(distanceInKm) {
  const distanceInMeters = distanceInKm * 1000;
  if (distanceInMeters <= 300) return 35;
  return 35 + Math.floor(distanceInKm) * 10;
}

// Weight-based delivery fee
function calculateWeightDeliveryFee(totalWeight) {
  const baseWeight = 5; // 5 kg free
  const ratePerExtraKg = 10; // ₱10 per extra kg
  if (totalWeight <= baseWeight) return 0;
  const extraWeight = Math.ceil(totalWeight - baseWeight);
  return extraWeight * ratePerExtraKg;
}

export default function Checkout() {
  const [location, setLocation] = useState(null);
  const [autoAddress, setAutoAddress] = useState("");
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [fullUser, setFullUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [distanceDeliveryFee, setDistanceDeliveryFee] = useState(0);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalWeight = cart.reduce(
    (sum, item) => sum + item.weight * item.quantity,
    0
  );
  const weightDeliveryFee = calculateWeightDeliveryFee(totalWeight);
  const itemsBaseFee = total;

  // Combine delivery fees (distance + weight + items base)
  const deliveryFee = distanceDeliveryFee + weightDeliveryFee + itemsBaseFee;
  const grandTotal = itemsBaseFee + weightDeliveryFee + distanceDeliveryFee;

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

  useEffect(() => {
    if (location) {
      const distance = calculateDistanceKm(
        STORE_LOCATION.lat,
        STORE_LOCATION.lng,
        location.lat,
        location.lng
      );
      const fee = calculateDeliveryFee(distance);
      setDistanceDeliveryFee(fee);
    } else {
      setDistanceDeliveryFee(0);
    }
  }, [location]);

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    address: Yup.string().required("Required"),
    phone: Yup.string().required("Required"),
    instruction: Yup.string().required("Required"),
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
        instruction: values.instruction,
        distanceDeliveryFee: distanceDeliveryFee.toFixed(2),
        weightDeliveryFee: weightDeliveryFee.toFixed(2),
        itemsBaseFee: itemsBaseFee.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        location: location ? `${location.lat},${location.lng}` : null,
        items: cart.map((item) => ({
          productId: item.id,
          amount: item.price,
          quantity: item.quantity,
        })),
      };
      const test = "https://localhost:7066";
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

  const extraWeight = totalWeight - 5;

  const initialValues = {
    name: `${fullUser.lastname}, ${fullUser.firstname}`,
    email: fullUser.email,
    address: autoAddress || "",
    phone: fullUser.phonenumber,
    instruction: "",
  };

  return (
    <div className="max-w-10xl mx-auto p-6">
<div className="flex items-center justify-center mb-10 gap-4">
  <h2 className="text-4xl font-bold">Checkout</h2>
  <button
    type="submit"
    form="checkout-form"
    className={`py-2 px-4 rounded-lg transition-colors ${
      submitting
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-green-600 hover:bg-green-700 text-white"
    }`}
    disabled={submitting}
  >
    {submitting ? "Submitting..." : "Place Order (Cash on Delivery)"}
  </button>
</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 h-[600px] overflow-y-auto">
          <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between mb-4">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>php {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}

          <div className="border-t mt-6 pt-4">
            <div className="mb-1 text-left">
              <span className="font-medium">Total Weight:</span>{" "}
              {totalWeight.toFixed(2)} kg
            </div>
            <div className="text-left">
              <span className="font-medium">Extra Weight:</span>{" "}
              {extraWeight > 0 ? extraWeight.toFixed(2) : 0} kg
            </div>
          </div>

          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between">
              <span>Distance-based Delivery Fee:</span>
              <span>php {distanceDeliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Weight-based Delivery Fee:</span>
              <span>php {weightDeliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Items Base Fee:</span>
              <span>php {itemsBaseFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
            <span>Grand Total:</span>
            <span>php {grandTotal.toFixed(2)}</span>
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
            useEffect(() => {
              if (autoAddress) {
                setFieldValue("address", autoAddress);
              }
            }, [autoAddress, setFieldValue]);

            return (
<Form id="checkout-form" className="bg-white rounded-lg shadow-md p-6 h-[800px] overflow-y-auto">
<h3 className="text-xl font-semibold mb-6">
                  Shipping Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-gray-700">
                      Full Name<span className="text-red-600">*</span>
                    </label>
                    <Field
                      name="name"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">
                      Phone<span className="text-red-600">*</span>
                    </label>
                    <Field
                      name="phone"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <ErrorMessage
                      name="phone"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700">
                      Email<span className="text-red-600">*</span>
                    </label>
                    <Field
                      name="email"
                      type="email"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>
                  <div className="md:col-span-3">
                      <label className="block mt-2 text-gray-700">
                        Delivery instruction
                        <span className="text-red-600">*</span>
                      </label>
                      <Field
                        as="textarea"
                        name="instruction"
                        placeholder="Note to Rider e.g. LandMark"
                        className="w-full px-3 py-2 border rounded-lg"
                        value={values.instruction}
                        onChange={(e) =>
                          setFieldValue("instruction", e.target.value)
                        }
                      />
                      <ErrorMessage
                        name="instruction"
                        component="div"
                        className="text-red-500 text-sm"
                      />
                    </div>
                  <div className="md:col-span-4">
                    <label className="block text-gray-700">
                      Address<span className="text-red-600">*</span>
                    </label>
                    <Field
                      as="textarea"
                      name="address"
                      placeholder="Search or pin location"
                      className="w-full px-3 py-2 border rounded-lg"
                      value={values.address}
                      onChange={(e) => setFieldValue("address", e.target.value)}
                      disabled
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-red-500 text-sm"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block mb-1 text-gray-700">
                      Pin your location (search or click)
                    </label>
                    <MapPicker
                      location={location}
                      setLocation={setLocation}
                      setFieldValue={setFieldValue}
                      storeLocation={STORE_LOCATION}
                    />

                    {location && (
                      <p className="text-sm mt-1 text-gray-600">
                        Selected: Latitude {location.lat.toFixed(5)}, Longitude{" "}
                        {location.lng.toFixed(5)}
                      </p>
                    )}
                    <p className="text-sm mt-1 text-gray-500">
                      Store Location: Latitude {STORE_LOCATION.lat.toFixed(5)},
                      Longitude {STORE_LOCATION.lng.toFixed(5)}
                    </p>
                   
                  </div>
                </div>

              </Form>
            );
          }}
        </Formik>
      </div>
    </div>
  );
}
