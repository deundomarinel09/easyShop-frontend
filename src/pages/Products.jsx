import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { getProducts } from '../apiData/products';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function calculateWeightDeliveryFee(totalWeight) {
  const baseWeight = 5; // kg free
  const ratePerExtraKg = 10; // PHP per extra kg

  if (totalWeight <= baseWeight) return 0;
  const extraWeight = Math.ceil(totalWeight - baseWeight);
  return extraWeight * ratePerExtraKg;
}

function SearchableDropdown({ options, value, onChange, label }) {
  const [search, setSearch] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!search) {
      setFilteredOptions(options);
    } else {
      setFilteredOptions(
        options.filter((opt) =>
          opt.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, options]);

  return (
    <div className="w-full max-w-xs mx-auto md:mx-0 relative">
      <label htmlFor="searchable-dropdown" className="block mb-1 font-semibold text-gray-700">
        {label}
      </label>

      <input
        type="text"
        readOnly
        value={value}
        onClick={() => setIsOpen((open) => !open)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      />

      {isOpen && (
        <div className="absolute w-full mt-1 bg-white border border-gray-300 rounded shadow-md z-10">
          <input
            type="text"
            autoFocus
            placeholder={`Search ${label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none"
          />

          <ul
            role="listbox"
            tabIndex={-1}
            className="max-h-48 overflow-auto"
          >
            {filteredOptions.length === 0 ? (
              <li className="p-2 text-gray-500">No {label.toLowerCase()} found</li>
            ) : (
              filteredOptions.map((opt, idx) => (
                <li
                  key={opt + idx}
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => {
                    onChange(opt);
                    setSearch('');
                    setIsOpen(false);
                  }}
                  className={`cursor-pointer px-4 py-2 ${
                    opt === value ? 'bg-blue-600 text-white' : 'hover:bg-blue-100'
                  }`}
                >
                  {opt}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [productsData, setProductsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedProductIds, setAddedProductIds] = useState([]);

  useEffect(() => {
    const cachedData = sessionStorage.getItem('productsData');

    if (cachedData) {
      setProductsData(JSON.parse(cachedData));
    }

    async function fetchProducts() {
      try {
        const data = await getProducts();
        if (data && Array.isArray(data.$values)) {
          const newProducts = data.$values;

          if (JSON.stringify(newProducts) !== JSON.stringify(productsData)) {
            setProductsData(newProducts);
            sessionStorage.setItem('productsData', JSON.stringify(newProducts));
          }
        } else {
          alert('API response is not in the expected format:', data);
        }
      } catch (error) {
        alert('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    const intervalId = setInterval(fetchProducts, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const normalizeCategoryName = (name) =>
    name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') || '';

  const ensureJpg = (filename) =>
    !filename ? 'placeholder.jpg' : filename.toLowerCase().endsWith('.jpg') ? filename : `${filename}.jpg`;

  const baseUrl = 'https://wyzlpxshonuzitdcgdoe.supabase.co/storage/v1/object/public/product-images';

  const categories = ['All', ...Array.from(new Set(productsData.map((product) => product.category || 'Uncategorized')))];

  const filteredProducts = productsData.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (selectedCategory === 'Uncategorized' && !product.category) ||
      product.category === selectedCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (product.stock < 1) {
      alert('Out of stock');
    } else {
      const categoryFolder = normalizeCategoryName(product.categoryName);
      const imageFile = ensureJpg(product.image);
      const imageUrl = `${baseUrl}/${encodeURIComponent(imageFile)}`;

      addToCart({ ...product, image: imageUrl });
      setAddedProductIds((prev) => [...prev, product.id]);
    }
  };

  // Calculate total weight of all items in the cart
  const totalWeight = cart.reduce(
    (sum, item) => sum + (item.weight || 0) * item.quantity,
    0
  );

  // Calculate delivery fee based on weight
  const deliveryFeeByWeight = calculateWeightDeliveryFee(totalWeight);

  // Calculate subtotal price of cart items
  const itemsSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Grand total includes item subtotal + delivery fee
  const grandTotal = itemsSubtotal + deliveryFeeByWeight;

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-8">Our Products</h2>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <SearchableDropdown
          options={categories}
          value={selectedCategory}
          onChange={setSelectedCategory}
          label="Select Category"
        />

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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => {
              const categoryFolder = normalizeCategoryName(product.categoryName);
              const imageFile = ensureJpg(product.image);
              const imageUrl = `${baseUrl}/${imageFile.replace('product-images', '')}`;
              const isAdded = addedProductIds.includes(product.id);

              return (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  <img
                    src={imageUrl.replace('.jpg', '')}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold">{product.name}</h3>
                      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
                        {product.category || 'Uncategorized'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="mt-auto pt-2 border-t border-gray-200 flex flex-col gap-2">
                      <div className="text-sm text-orange-500 font-semibold">Measurement: {product.measurement}</div>
                      <div className="text-sm text-orange-500 font-semibold">Weight: {product.weight} {product.uom}</div>
                      <div className="text-sm text-orange-500 font-semibold">In stock: {product.stock}</div>
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
                </div>
              );
            })}
          </div>

         
        </>
      )}
    </div>
  );
}
