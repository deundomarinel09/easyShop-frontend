import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail('');
      // In a real app, you would send this to your backend
    }
  };
  
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-300 mb-8">
            Subscribe to our newsletter to receive updates on new products, special offers, and exclusive discounts.
          </p>
          
          {isSubmitted ? (
            <div className="bg-teal-600 text-white p-4 rounded-lg animate-fade-in">
              <p className="font-medium">Thank you for subscribing!</p>
              <p className="text-sm mt-1">You'll start receiving our newsletters soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="flex-grow">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-500 transition-colors duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
              >
                Subscribe
                <Send size={18} className="ml-2" />
              </button>
            </form>
          )}
          
          <p className="text-gray-400 text-sm mt-4">
            By subscribing, you agree to our <a href="/privacy" className="underline hover:text-teal-400 transition-colors duration-200">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </section>
  );
};