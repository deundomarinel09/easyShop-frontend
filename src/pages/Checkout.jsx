import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import axios from 'axios';
import * as Yup from 'yup';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth(); // assumes user object has `id`
  const navigate = useNavigate();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const initialValues = {
    name: '',
    email: '',
    address: '',
    city: '',
    phone: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    address: Yup.string().required('Required'),
    city: Yup.string().required('Required'),
    phone: Yup.string().required('Required'),
  });

  const handleSubmit = async (values) => {
    const shippingAddress = `${values.address}, ${values.city}`;

    const orderPayload = {
      userId: user?.id,
      shippingAddress,
      email: values.email,
      name: values.name,
      phoneNo: values.phone,
      status: 'Pending',
      total: total.toFixed(2),
      items: cart.map((item) => ({
        productId: item.id,
        amount: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const baseProd = "https://mobileeasyshop.onrender.com";
      //const testUrl = "https://localhost:7066"
      const response = await axios.post(`${baseProd}/api/Order/PlaceOrder`, orderPayload);

      alert('Order placed successfully!');
      clearCart();
      navigate('/orders');
    } catch (error) {
      alert('Failed to place order. Please try again.');
    }
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
        <div className="border-t mt-6 pt-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>php {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Formik Shipping Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {() => (
          <Form className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-6">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 text-gray-700">Full Name</label>
                <Field name="name" className="w-full px-3 py-2 border rounded-lg" />
                <ErrorMessage name="name" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Email</label>
                <Field name="email" type="email" className="w-full px-3 py-2 border rounded-lg" />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Phone</label>
                <Field name="phone" className="w-full px-3 py-2 border rounded-lg" />
                <ErrorMessage name="phone" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">Address</label>
                <Field as="textarea" name="address" className="w-full px-3 py-2 border rounded-lg" />
                <ErrorMessage name="address" component="div" className="text-red-500 text-sm" />
              </div>
              <div>
                <label className="block mb-1 text-gray-700">City</label>
                <Field name="city" className="w-full px-3 py-2 border rounded-lg" />
                <ErrorMessage name="city" component="div" className="text-red-500 text-sm" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 mt-8 rounded-lg hover:bg-green-700 transition-colors"
            >
              Place Order (Cash on Delivery)
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
