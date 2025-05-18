import { useState, useEffect } from 'react';
import { getProducts } from '../apiData/products';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const data = await getProducts();
        if (data && Array.isArray(data.$values)) {
          setProducts(data.$values);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  return { products, loading };
}
