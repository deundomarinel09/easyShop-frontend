import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getProductsByCategories } from '../apiData/products';

export default function Products() {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productsData, setProductsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedProductIds, setAddedProductIds] = useState([]); // ✅ New state

  useEffect(() => {
    const cachedData = sessionStorage.getItem('productsData');

    if (cachedData) {
      setProductsData(JSON.parse(cachedData));
      setLoading(false);
    } else {
      async function fetchProducts() {
        try {
          const data = await getProductsByCategories();
          if (data && Array.isArray(data.$values)) {
            const previousData = sessionStorage.getItem('productsData');
            if (previousData !== JSON.stringify(data.$values)) {
              setProductsData(data.$values);
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
  }, []);

  const handleAddToCart = (product) => {
    // Ensure the image URL is properly formed
    const categoryFolder = normalizeCategoryName(product.categoryName);
    const imageFile = ensureJpg(product.image);
    const imageUrl = `${baseUrl}/${categoryFolder}/${encodeURIComponent(imageFile)}`;

    addToCart({
      ...product,
      image: imageUrl, // Add image URL to cart item
    });

    setAddedProductIds((prev) => [...prev, product.id]);
  };

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

  const searchFilteredProducts = filteredProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['All', ...productsData.map(category => category.categoryName)];

  function normalizeCategoryName(name) {
    return name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') || '';
  }

  function ensureJpg(filename) {
    return filename?.toLowerCase().endsWith('.jpg') ? filename : `${filename}.jpg`;
  }

  const baseUrl = "https://wyzlpxshonuzitdcgdoe.supabase.co/storage/v1/object/public/product-images";

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        Our Products
      </h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-3 justify-center md:justify-start">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white border-blue-600 shadow'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {searchFilteredProducts.map((product) => {
            const categoryFolder = normalizeCategoryName(product.categoryName);
            const imageFile = ensureJpg(product.image);
            const imageUrl = `${baseUrl}/${categoryFolder}/${encodeURIComponent(imageFile)}`;
            const isAdded = addedProductIds.includes(product.id);

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
                    <span className="text-xl font-bold">₱ {product.price}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isAdded}
                      className={`px-4 py-2 rounded font-medium transition-colors ${
                        isAdded
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isAdded ? 'Added' : 'Add to Cart'}
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
