import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const BASE = 'https://mobileeasyshop.onrender.com';
const getProductsUrl = '/api/Product/GetAllProduct';
const orderDataUrl = '/api/Dash/Items';

const ensureJpg = (filename) =>
  !filename ? 'placeholder.jpg' : filename.toLowerCase().endsWith('.jpg') ? filename : `${filename}.jpg`;

const baseUrl = 'https://wyzlpxshonuzitdcgdoe.supabase.co/storage/v1/object/public/product-images';

export const CategoryCarousel = ({ categoryName }) => {
  const [products, setProducts] = useState([]);
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const orderRes = await fetch(`${BASE}${orderDataUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const orderData = await orderRes.json();
        const orderItems = orderData.$values;

        const productSalesMap = {};
        for (const item of orderItems) {
          if (!productSalesMap[item.productId]) productSalesMap[item.productId] = 0;
          productSalesMap[item.productId] += item.quantity;
        }

        const topProductIds = Object.entries(productSalesMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 50)
          .map(([id]) => parseInt(id));

        const productRes = await fetch(`${BASE}${getProductsUrl}`);
        const productData = await productRes.json();
        const allProducts = productData.$values || [];

        const filtered = allProducts
          .filter((p) => topProductIds.includes(p.id) && p.categoryName === categoryName)
          .slice(0, 5); // Limit per category

        setProducts(filtered);
      } catch (err) {
        console.error(`Failed to load products for category ${categoryName}:`, err);
      }
    };

    fetchCategoryProducts();
  }, [categoryName]);

  const handleAddToCart = (product) => {
    if (!user) return navigate('/login');
    if (product.stock < 1) return alert('Out of stock');

    const imageFile = ensureJpg(product.image);
    const imageUrl = `${baseUrl}/${encodeURIComponent(imageFile)}`;
    addToCart({ ...product, image: imageUrl });
  };

  if (products.length === 0) return null;

  return (
    <div className="overflow-x-auto flex gap-4 py-4 px-1">
      {products.map((product) => {
        const imageFile = ensureJpg(product.image);
        const imageUrl = `${baseUrl}/${imageFile.replace('product-images', '')}`;
        const isAdded = cart.some((item) => item.id === product.id);

        return (
          <div key={product.id} className="min-w-[160px] max-w-[160px] bg-white rounded shadow p-2">
            <img src={imageUrl} alt={product.name} className="w-full h-20 object-cover mb-2" />
            <div className="text-xs font-semibold truncate">{product.name}</div>
            <div className="text-orange-600 font-bold text-sm">₱ {product.price}</div>
            <button
              onClick={() => handleAddToCart(product)}
              disabled={isAdded}
              className={`w-full mt-1 px-2 py-1 text-xs rounded ${
                isAdded ? 'bg-green-500 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isAdded ? 'Added' : 'Add'}
            </button>
          </div>
        );
      })}
    </div>
  );
};
