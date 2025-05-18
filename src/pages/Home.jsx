// Home.jsx
import React from 'react';
import { Hero } from '../components/Hero';
import { ProductCarousel } from '../components/ProductCarousel';
import { Categories } from '../components/Categories';
import { Promotions } from '../components/Promotions';
import { Testimonials } from '../components/Testimonials';
import { Newsletter } from '../components/Newsletter';

const HomePage = () => {
  return (
    <div>
      <Hero />
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Top Selling Products
        </h2>
        <ProductCarousel />
      </section>
      <Testimonials />
      <Newsletter />
    </div>
  );
};

export default HomePage;
