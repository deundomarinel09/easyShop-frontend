import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const ProductCarousel = () => {
  const [products, setProducts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const { cart, addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const itemsPerView = 5;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  const nextSlide = () => setCurrentIndex((cur) => Math.min(cur + 1, maxIndex));
  const prevSlide = () => setCurrentIndex((cur) => Math.max(cur - 1, 0));

  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        const BASE = 'https://mobileeasyshop.onrender.com';
        const getProductsUrl = '/api/Product/GetAllProduct';
        const orderDataUrl = '/api/Dash/Items';

        // Fetch sales data
        const orderRes = await fetch(`${BASE}${orderDataUrl}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}) // Adjust this payload if your API expects something specific
          });
        const orderData = await orderRes.json();
        const orderItems = orderData.$values;

        // Aggregate quantity per productId
        const productSalesMap = {};
        for (const item of orderItems) {
          if (!productSalesMap[item.productId]) {
            productSalesMap[item.productId] = 0;
          }
          productSalesMap[item.productId] += item.quantity;
        }

        // Get top 20 product IDs
        const topProductIds = Object.entries(productSalesMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([productId]) => parseInt(productId));

        // Fetch all product details
        const productRes = await fetch(`${BASE}${getProductsUrl}`);
        const productData = await productRes.json();
        const allProducts = productData.$values || [];

        // Filter to top 20 products
        const topProducts = allProducts.filter((p) => topProductIds.includes(p.id));

        setProducts(topProducts);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Failed to fetch top-selling products:', error);
      }
    };

    fetchTopSellingProducts();
  }, []);

  useEffect(() => {
    if (carouselRef.current) {
      const translateXPercent = (currentIndex * 100) / itemsPerView;
      carouselRef.current.style.transform = `translateX(-${translateXPercent}%)`;
    }
  }, [currentIndex, products]);

  useEffect(() => {
    const handleResize = () => setCurrentIndex(0);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const normalizeCategoryName = (name) =>
    name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') || '';

  const ensureJpg = (filename) =>
    !filename ? 'placeholder.jpg' : filename.toLowerCase().endsWith('.jpg') ? filename : `${filename}.jpg`;

  
  const baseUrl = 'https://wyzlpxshonuzitdcgdoe.supabase.co/storage/v1/object/public/product-images';

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (product.stock < 1) {
      alert('Out of stock');
      return;
    }

    const imageFile = ensureJpg(product.image);
    const imageUrl = `${baseUrl}/${encodeURIComponent(imageFile)}`;

    addToCart({ ...product, image: imageUrl });
  };

  if (products.length === 0) {
    return <div className="text-center p-8">Loading products...</div>;
  }

  return (
    <div className="relative w-full">
      <div className="overflow-hidden min-h-[280px]">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-500 ease-out"
          style={{ width: `${products.length * (100 / itemsPerView)}%` }}
        >
          {products.map((product) => {
            const categoryFolder = normalizeCategoryName(product.categoryName);
            const imageFile = ensureJpg(product.image);
            const imageUrl = `${baseUrl}/${imageFile.replace('product-images', '')}`;
            const isAdded = cart.some((item) => item.id === product.id);

            return (
              <div
                key={product.id}
                className="px-1 flex-shrink-0"
                style={{ width: `${100 / products.length}%` }}
              >
                <div
                  className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col h-[280px] cursor-pointer transform transition-transform duration-300 hover:scale-[1.05]"
                  title={product.name}
                >
                  <img
                    src={imageUrl.replace('.jpg', '')}
                    alt={product.name}
                    className="w-full h-20 object-cover"
                  />
                  <div className="p-2 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm font-semibold truncate">{product.name}</h3>
                      <span className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded text-[9px] whitespace-nowrap">
                        {product.category || 'Uncategorized'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1 line-clamp-2 text-xs flex-grow">
                      {product.description}
                    </p>
                    <div className="pt-1 border-t border-gray-200 flex flex-col gap-1 text-[10px] text-orange-600 font-semibold">
                      <div>Measurement: {product.measurement}</div>
                      <div>Weight(KG): {product.weight}</div>
                      <div>In stock: {product.stock}</div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-bold">₱ {product.price}</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isAdded}
                        className={`px-2 py-1 rounded font-medium text-xs transition-colors ${
                          isAdded
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isAdded ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 focus:outline-none transform -translate-x-1/2 hover:bg-gray-100 transition-colors duration-200 ${
          currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
        }`}
        onClick={prevSlide}
        disabled={currentIndex === 0}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md z-10 focus:outline-none transform translate-x-1/2 hover:bg-gray-100 transition-colors duration-200 ${
          currentIndex === maxIndex ? 'opacity-50 cursor-not-allowed' : 'opacity-100'
        }`}
        onClick={nextSlide}
        disabled={currentIndex === maxIndex}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
    </div>
  );
};
