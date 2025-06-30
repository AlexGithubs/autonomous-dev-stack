import { FC } from 'react';
import Image from 'next/image';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        src={product.image}
        alt={product.name}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-gray-600">${product.price}</p>
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
