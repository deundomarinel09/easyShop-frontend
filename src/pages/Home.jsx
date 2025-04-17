import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">Welcome to Easy Shop</h1>
      <p className="text-xl mb-8">Discover our amazing products at great prices!</p>
      <Link
        to="/products"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Shop Now
      </Link>
    </div>
  );
}