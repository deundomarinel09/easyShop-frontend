import React from 'react';
import { categories } from '../data/categories';
import { ArrowRight } from 'lucide-react';
import { CategoryCarousel } from './CategoryCarousel';

export const Categories = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Shop by Category</h2>
          <a 
            href="/categories" 
            className="flex items-center text-teal-600 hover:text-teal-700 font-medium mt-4 md:mt-0 group"
          >
            View all categories
            <ArrowRight size={18} className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </div>
        
        {categories.map((category) => (
          <div key={category.id} className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xl font-semibold text-gray-700">{category.name}</h3>
              <a href={`/category/${category.id}`} className="text-sm text-teal-600 hover:underline">
                Explore more
              </a>
            </div>
            <CategoryCarousel categoryName={category.name} />
          </div>
        ))}
      </div>
    </section>
  );
};
