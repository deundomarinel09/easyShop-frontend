import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative text-center min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/video/background.mp4" type="video/mp4" />
      </video>

      {/* Content Overlay */}
      <div className="bg-black bg-opacity-50 h-full flex flex-col justify-center items-center relative z-10 px-4">
        <h1 className="text-4xl font-bold text-white mb-6 sm:mb-8">
          Welcome to Mariton Fresh
        </h1>
        <p className="text-xl text-white mb-6 sm:mb-8 max-w-3xl">
          Discover fresh meats and groceries at amazing prices!
        </p>
        <Link
          to="/products"
          className="bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}
