import React from 'react';
import { testimonials } from '../data/testimonials';
import { Star, Quote } from 'lucide-react';

export const Testimonials = () => {
  return (
    <section className="py-16 bg-teal-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about their shopping experience with Easy Shop.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-6 right-6 text-teal-100" size={40} />
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star 
                    key={index} 
                    size={16} 
                    fill={index < testimonial.rating ? 'currentColor' : 'none'} 
                    className={index < testimonial.rating ? 'text-amber-500' : 'text-gray-300'} 
                  />
                ))}
              </div>
              
              <p className="text-gray-600">{testimonial.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};