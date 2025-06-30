import { FC } from 'react';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface ProductGridProps {
  searchQuery: string;
}

const ProductGrid: FC<ProductGridProps> = ({ searchQuery }) => {
  // Mock data for now
  const products: Product[] = [
    { id: '1', name: 'Sample Product', price: 29.99, image: '/placeholder.jpg', description: 'A great product', category: 'Electronics', inStock: true },
    { id: '2', name: 'Another Product', price: 49.99, image: '/placeholder.jpg', description: 'Another great product', category: 'Fashion', inStock: true },
  ];

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
