import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getProductsByCategories } from '../apiData/products'; // Import the API function

export default function Products() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch the products by categories when the component mounts
  useEffect(() => {
    // Check if we have cached products data
    const cachedData = sessionStorage.getItem('productsData');
    
    if (cachedData) {
      // If data exists in sessionStorage, use it
      setProductsData(JSON.parse(cachedData));
      setLoading(false);
    } else {
      // If no cached data, fetch it from the API
      async function fetchProducts() {
        try {
          const data = await getProductsByCategories();
          if (data && Array.isArray(data.$values)) {
            // Compare the new data with the previous data in sessionStorage
            const previousData = sessionStorage.getItem('productsData');
            
            if (previousData !== JSON.stringify(data.$values)) {
              // Only set the data if it has changed
              setProductsData(data.$values);
              // Save the data in sessionStorage for future use
              sessionStorage.setItem('productsData', JSON.stringify(data.$values));
            }
          } else {
            console.error('API response is not in the expected format:', data);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        } finally {
          setLoading(false);
        }
      }

      fetchProducts();
    }
  }, []); // Empty dependency array ensures this only runs once on mount

  // Handle category filtering
  const filteredProducts = selectedCategory === 'All'
    ? productsData.flatMap(category =>
        (category.products.$values || []).map(product => ({
          ...product,
          categoryName: category.categoryName,
        }))
      )
    : productsData
        .filter(category => category.categoryName === selectedCategory)
        .flatMap(category =>
          (category.products.$values || []).map(product => ({
            ...product,
            categoryName: category.categoryName,
          }))
        );

  // Handle categories dynamically based on the API response
  const categories = ['All', ...productsData.map(category => category.categoryName)];

  function normalizeCategoryName(name) {
    if (!name || typeof name !== 'string') return '';
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')         // replace spaces with dashes
      .replace(/[^a-z0-9\-]/g, ''); // remove non-alphanumeric except dash
  }
  
  function ensureJpg(filename) {
    if (!filename) return '';
    return filename.toLowerCase().endsWith('.jpg') ? filename : `${filename}.jpg`;
  }

  const baseUrl = "https://wyzlpxshonuzitdcgdoe.supabase.co/storage/v1/object/public/product-images";

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">Our Products</h2>

      <div className="mb-8 flex gap-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            // Calculate full image URL
            const categoryFolder = normalizeCategoryName(product.categoryName);
            const imageFile = ensureJpg(product.image);
            const imageUrl = `${baseUrl}/${categoryFolder}/${encodeURIComponent(imageFile)}`;

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{product.name}</h3>
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
                      {product.categoryName}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">${product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
